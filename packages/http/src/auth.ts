import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { TypeArg, TypeArgs } from '@latcher/base';
import { isObject, logger } from '@latcher/base';

// missing answers 401, invalid 403, and wrongType 500 because only a setup fault can cause it
export type AuthFailureReason = 'missing' | 'wrongType' | 'invalid';

export type AuthCheckResultCore<TAuth> =
  | { success: true; auth: TAuth }
  | {
      success: false;
      reason: AuthFailureReason;
      message: string;
      issues?: ReadonlyArray<StandardSchemaV1.Issue>;
    };

export interface AuthPresetCore<TInput, TOutput> {
  readonly name: string;
  readonly check: (auth: TInput) => Promise<AuthCheckResultCore<TOutput>>;
}

export type AuthOf<TPreset> = TPreset extends AuthPresetCore<never, infer TOutput> ? TOutput : never;

function authType(auth: unknown): unknown {
  return isObject(auth) ? auth.type : typeof auth;
}

export function noAuth<TInput>(): AuthPreset<{ input: TInput; output: undefined }> {
  return {
    name: 'noAuth',
    check: async (auth: TInput) => {
      if (auth !== undefined) {
        logger.warn('A noAuth route received auth, which its handler does not see', { authType: authType(auth) });
      }
      return { success: true, auth: undefined };
    },
  };
}

export interface AuthCheckResultTypes {
  auth: unknown;
}

export interface AuthPresetTypes {
  input: unknown;
  output: unknown;
}

export type AuthCheckResult<T extends TypeArgs<T, AuthCheckResultTypes>> = AuthCheckResultCore<
  TypeArg<T, 'auth', AuthCheckResultTypes>
>;

export type AuthPreset<T extends TypeArgs<T, AuthPresetTypes>> = AuthPresetCore<
  TypeArg<T, 'input', AuthPresetTypes>,
  TypeArg<T, 'output', AuthPresetTypes>
>;
