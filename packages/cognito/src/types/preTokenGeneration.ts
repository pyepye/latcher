import type { Context, PreTokenGenerationTriggerEvent } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { TypeArg, TypeArgs } from '@latcher/base';

import type { CognitoDefaults, CognitoFiltersCore, CognitoTypes, UserAttributes } from './common.js';
import type { CognitoMiddlewareCore } from './matcher.js';

// PreTokenGeneration trigger sources - derived from aws-lambda
export type PreTokenGenerationTriggerSource = PreTokenGenerationTriggerEvent['triggerSource'];

// PreTokenGeneration response - derived from aws-lambda
export type PreTokenGenerationResponse = PreTokenGenerationTriggerEvent['response'];

// PreTokenGeneration request - simplified to just essential fields
export interface PreTokenGenerationRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: PreTokenGenerationTriggerSource;
  userAttributes: TUserAttributes;
  event: PreTokenGenerationTriggerEvent;
  context: Context;
}

// PreTokenGeneration handler type
// Handlers modify the cloned event and return it
type PreTokenGenerationHandlerCore<TUserAttributes = UserAttributes> = (
  request: PreTokenGenerationRequestCore<TUserAttributes>,
) => Promise<PreTokenGenerationTriggerEvent>;

// PreTokenGeneration route definition
export interface PreTokenGenerationRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<PreTokenGenerationTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: PreTokenGenerationHandlerCore<TUserAttributes>;
}

export type PreTokenGenerationRequest<T extends TypeArgs<T, CognitoTypes> = object> = PreTokenGenerationRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PreTokenGenerationHandler<T extends TypeArgs<T, CognitoTypes> = object> = PreTokenGenerationHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PreTokenGenerationRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  PreTokenGenerationRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;
