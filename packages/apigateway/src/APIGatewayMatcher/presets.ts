import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { TypeArg, TypeArgs } from '@latcher/base';
import type { AuthCheckResult, AuthPreset } from '@latcher/http';

import type { LambdaAuthorizerContext } from '../LambdaAuthorizerMatcher/types.js';
import type { APIGatewayAuth, CognitoAuth, IamAuth, JwtAuth, LambdaAuth } from './auth.js';
import type { Claims, ClaimValue } from './claims.js';

export { noAuth } from '@latcher/http';

type RawAuth = APIGatewayAuth;

interface ClaimsPresetOptionsCore<TClaims extends Record<string, ClaimValue>> {
  claims: StandardSchemaV1<unknown, TClaims>;
}

export interface ClaimsPresetOptionsTypes {
  claims: Record<string, ClaimValue>;
}

export type ClaimsPresetOptions<T extends TypeArgs<T, ClaimsPresetOptionsTypes>> = ClaimsPresetOptionsCore<
  Extract<TypeArg<T, 'claims', ClaimsPresetOptionsTypes>, Record<string, ClaimValue>>
>;

function wrongType(expected: NonNullable<APIGatewayAuth>['type'], auth: RawAuth): AuthCheckResult<{ auth: never }> {
  const reason = auth === undefined ? 'missing' : 'wrongType';
  return { success: false, reason, message: `Expected ${expected} auth, got ${auth?.type ?? 'none'}` };
}

export function lambdaAuth(): AuthPreset<{ input: RawAuth; output: LambdaAuth }>;
export function lambdaAuth<TContext extends LambdaAuthorizerContext>(
  contextSchema: StandardSchemaV1<unknown, TContext>,
): AuthPreset<{ input: RawAuth; output: LambdaAuth<{ context: TContext }> }>;
export function lambdaAuth<TContext extends LambdaAuthorizerContext>(
  contextSchema?: StandardSchemaV1<unknown, TContext>,
): AuthPreset<{ input: RawAuth; output: LambdaAuth<{ context: TContext }> | LambdaAuth }> {
  return {
    name: 'lambdaAuth',
    check: async (auth: RawAuth) => {
      if (auth?.type !== 'lambda') return wrongType('lambda', auth);
      if (!contextSchema) return { success: true, auth };

      const result = await contextSchema['~standard'].validate(auth.context);
      if (result.issues) {
        return {
          success: false,
          reason: 'invalid',
          message: 'The Lambda authorizer context failed its schema',
          issues: result.issues,
        };
      }
      return { success: true, auth: { ...auth, context: result.value } };
    },
  };
}

export function cognitoAuth(): AuthPreset<{ input: RawAuth; output: CognitoAuth }>;
export function cognitoAuth<TClaims extends Record<string, ClaimValue>>(
  options: ClaimsPresetOptions<{ claims: TClaims }>,
): AuthPreset<{ input: RawAuth; output: CognitoAuth<{ claims: Claims & TClaims }> }>;
export function cognitoAuth<TClaims extends Record<string, ClaimValue>>(
  options?: ClaimsPresetOptions<{ claims: TClaims }>,
): AuthPreset<{ input: RawAuth; output: CognitoAuth<{ claims: Claims & TClaims }> | CognitoAuth }> {
  return {
    name: 'cognitoAuth',
    check: async (auth: RawAuth) => {
      if (auth?.type !== 'cognito') return wrongType('cognito', auth);
      if (!options) return { success: true, auth };

      const result = await options.claims['~standard'].validate(auth.claims);
      if (result.issues) {
        return {
          success: false,
          reason: 'invalid',
          message: 'The Cognito claims failed their schema',
          issues: result.issues,
        };
      }
      return { success: true, auth: { ...auth, claims: { ...auth.claims, ...result.value } } };
    },
  };
}

export function jwtAuth(): AuthPreset<{ input: RawAuth; output: JwtAuth }>;
export function jwtAuth<TClaims extends Record<string, ClaimValue>>(
  options: ClaimsPresetOptions<{ claims: TClaims }>,
): AuthPreset<{ input: RawAuth; output: JwtAuth<{ claims: Claims & TClaims }> }>;
export function jwtAuth<TClaims extends Record<string, ClaimValue>>(
  options?: ClaimsPresetOptions<{ claims: TClaims }>,
): AuthPreset<{ input: RawAuth; output: JwtAuth<{ claims: Claims & TClaims }> | JwtAuth }> {
  return {
    name: 'jwtAuth',
    check: async (auth: RawAuth) => {
      if (auth?.type !== 'jwt') return wrongType('jwt', auth);
      if (!options) return { success: true, auth };

      const result = await options.claims['~standard'].validate(auth.claims);
      if (result.issues) {
        return {
          success: false,
          reason: 'invalid',
          message: 'The JWT claims failed their schema',
          issues: result.issues,
        };
      }
      return { success: true, auth: { ...auth, claims: { ...auth.claims, ...result.value } } };
    },
  };
}

export function iamAuth(): AuthPreset<{ input: RawAuth; output: IamAuth }> {
  return {
    name: 'iamAuth',
    check: async (auth: RawAuth) => {
      if (auth?.type !== 'iam') return wrongType('iam', auth);
      return { success: true, auth };
    },
  };
}
