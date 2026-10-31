import type { Context, CustomEmailSenderTriggerEvent } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { TypeArg, TypeArgs } from '@latcher/base';

import type { CognitoDefaults, CognitoFiltersCore, CognitoTypes, UserAttributes } from './common.js';
import type { CognitoMiddlewareCore } from './matcher.js';

// CustomEmailSender trigger sources - derived from aws-lambda
export type CustomEmailSenderTriggerSource = CustomEmailSenderTriggerEvent['triggerSource'];

// CustomEmailSender response - no response for this trigger
export type CustomEmailSenderResponse = undefined;

// CustomEmailSender request - simplified to just essential fields
export interface CustomEmailSenderRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: CustomEmailSenderTriggerSource;
  userAttributes: TUserAttributes;
  event: CustomEmailSenderTriggerEvent;
  context: Context;
}

// CustomEmailSender handler type
// Handlers modify the cloned event and return it
type CustomEmailSenderHandlerCore<TUserAttributes = UserAttributes> = (
  request: CustomEmailSenderRequestCore<TUserAttributes>,
) => Promise<CustomEmailSenderTriggerEvent>;

// CustomEmailSender route definition
export interface CustomEmailSenderRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<CustomEmailSenderTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: CustomEmailSenderHandlerCore<TUserAttributes>;
}

export type CustomEmailSenderRequest<T extends TypeArgs<T, CognitoTypes> = object> = CustomEmailSenderRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type CustomEmailSenderHandler<T extends TypeArgs<T, CognitoTypes> = object> = CustomEmailSenderHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type CustomEmailSenderRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  CustomEmailSenderRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;
