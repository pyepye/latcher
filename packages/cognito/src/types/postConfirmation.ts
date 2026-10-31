import type { Context, PostConfirmationTriggerEvent } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { TypeArg, TypeArgs } from '@latcher/base';

import type { CognitoDefaults, CognitoFiltersCore, CognitoTypes, UserAttributes } from './common.js';
import type { CognitoMiddlewareCore } from './matcher.js';

// PostConfirmation trigger sources - derived from aws-lambda
export type PostConfirmationTriggerSource = PostConfirmationTriggerEvent['triggerSource'];

// PostConfirmation request - simplified to just essential fields
export interface PostConfirmationRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: PostConfirmationTriggerSource;
  userAttributes: TUserAttributes;
  event: PostConfirmationTriggerEvent;
  context: Context;
}

// PostConfirmation response (no response fields)
export type PostConfirmationResponse = undefined;

// PostConfirmation handler type
// Handlers modify the cloned event and return it
type PostConfirmationHandlerCore<TUserAttributes = UserAttributes> = (
  request: PostConfirmationRequestCore<TUserAttributes>,
) => Promise<PostConfirmationTriggerEvent>;

// PostConfirmation route definition
export interface PostConfirmationRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<PostConfirmationTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: PostConfirmationHandlerCore<TUserAttributes>;
}

export type PostConfirmationRequest<T extends TypeArgs<T, CognitoTypes> = object> = PostConfirmationRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PostConfirmationHandler<T extends TypeArgs<T, CognitoTypes> = object> = PostConfirmationHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PostConfirmationRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  PostConfirmationRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;
