import type { Context, UserMigrationTriggerEvent } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { TypeArg, TypeArgs } from '@latcher/base';

import type { CognitoDefaults, CognitoFiltersCore, CognitoTypes, UserAttributes } from './common.js';
import type { CognitoMiddlewareCore } from './matcher.js';

// UserMigration trigger sources - derived from aws-lambda
export type UserMigrationTriggerSource = UserMigrationTriggerEvent['triggerSource'];

// UserMigration response - derived from aws-lambda
export type UserMigrationResponse = UserMigrationTriggerEvent['response'];

// UserMigration request - simplified to just essential fields
// Note: userAttributes will be empty for migration as user doesn't exist yet
export interface UserMigrationRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: UserMigrationTriggerSource;
  userAttributes: TUserAttributes;
  event: UserMigrationTriggerEvent;
  context: Context;
}

// UserMigration handler type
// Handlers modify the cloned event and return it
type UserMigrationHandlerCore<TUserAttributes = UserAttributes> = (
  request: UserMigrationRequestCore<TUserAttributes>,
) => Promise<UserMigrationTriggerEvent>;

// UserMigration route definition
export interface UserMigrationRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<UserMigrationTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: UserMigrationHandlerCore<TUserAttributes>;
}

export type UserMigrationRequest<T extends TypeArgs<T, CognitoTypes> = object> = UserMigrationRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type UserMigrationHandler<T extends TypeArgs<T, CognitoTypes> = object> = UserMigrationHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type UserMigrationRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  UserMigrationRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;
