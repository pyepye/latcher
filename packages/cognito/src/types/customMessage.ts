import type { Context, CustomMessageTriggerEvent } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { TypeArg, TypeArgs } from '@latcher/base';

import type { CognitoDefaults, CognitoFiltersCore, CognitoTypes, UserAttributes } from './common.js';
import type { CognitoMiddlewareCore } from './matcher.js';

// CustomMessage trigger sources - derived from aws-lambda
export type CustomMessageTriggerSource = CustomMessageTriggerEvent['triggerSource'];

// CustomMessage response - derived from aws-lambda
export type CustomMessageResponse = CustomMessageTriggerEvent['response'];

// CustomMessage request - simplified to just essential fields
export interface CustomMessageRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: CustomMessageTriggerSource;
  userAttributes: TUserAttributes;
  event: CustomMessageTriggerEvent;
  context: Context;
}

// CustomMessage handler type
// Handlers modify the cloned event and return it
type CustomMessageHandlerCore<TUserAttributes = UserAttributes> = (
  request: CustomMessageRequestCore<TUserAttributes>,
) => Promise<CustomMessageTriggerEvent>;

// CustomMessage route definition
export interface CustomMessageRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<CustomMessageTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: CustomMessageHandlerCore<TUserAttributes>;
}

export type CustomMessageRequest<T extends TypeArgs<T, CognitoTypes> = object> = CustomMessageRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type CustomMessageHandler<T extends TypeArgs<T, CognitoTypes> = object> = CustomMessageHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type CustomMessageRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  CustomMessageRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;
