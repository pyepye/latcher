import type { Context, PreSignUpTriggerEvent } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { TypeArg, TypeArgs } from '@latcher/base';

import type { CognitoDefaults, CognitoFiltersCore, CognitoTypes, UserAttributes } from './common.js';
import type { CognitoMiddlewareCore } from './matcher.js';

// PreSignUp trigger sources - derived from aws-lambda
export type PreSignUpTriggerSource = PreSignUpTriggerEvent['triggerSource'];

// PreSignUp response - derived from aws-lambda
export type PreSignUpResponse = PreSignUpTriggerEvent['response'];

// PreSignUp request - simplified to just essential fields
export interface PreSignUpRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: PreSignUpTriggerSource;
  userAttributes: TUserAttributes;
  event: PreSignUpTriggerEvent;
  context: Context;
}

// PreSignUp handler type
// Handlers modify the cloned event and return it
type PreSignUpHandlerCore<TUserAttributes = UserAttributes> = (
  request: PreSignUpRequestCore<TUserAttributes>,
) => Promise<PreSignUpTriggerEvent>;

// PreSignUp route definition
export interface PreSignUpRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<PreSignUpTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: PreSignUpHandlerCore<TUserAttributes>;
}

export type PreSignUpRequest<T extends TypeArgs<T, CognitoTypes> = object> = PreSignUpRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PreSignUpHandler<T extends TypeArgs<T, CognitoTypes> = object> = PreSignUpHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PreSignUpRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> = PreSignUpRouteDefinitionCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;
