import type {
  Context,
  CreateAuthChallengeTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  PostAuthenticationTriggerEvent,
  PreAuthenticationTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { TypeArg, TypeArgs } from '@latcher/base';

import type { CognitoDefaults, CognitoFiltersCore, CognitoTypes, UserAttributes } from './common.js';
import type { CognitoMiddlewareCore } from './matcher.js';

// =============================================================================
// Trigger Sources - derived from aws-lambda
// =============================================================================

export type PreAuthenticationTriggerSource = PreAuthenticationTriggerEvent['triggerSource'];
export type PostAuthenticationTriggerSource = PostAuthenticationTriggerEvent['triggerSource'];
export type DefineAuthChallengeTriggerSource = DefineAuthChallengeTriggerEvent['triggerSource'];
export type CreateAuthChallengeTriggerSource = CreateAuthChallengeTriggerEvent['triggerSource'];
export type VerifyAuthChallengeResponseTriggerSource = VerifyAuthChallengeResponseTriggerEvent['triggerSource'];

// =============================================================================
// PreAuthentication
// =============================================================================

export interface PreAuthenticationRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: PreAuthenticationTriggerSource;
  userAttributes: TUserAttributes;
  event: PreAuthenticationTriggerEvent;
  context: Context;
}

export type PreAuthenticationResponse = PreAuthenticationTriggerEvent['response'];

// Handlers modify the cloned event and return it
type PreAuthenticationHandlerCore<TUserAttributes = UserAttributes> = (
  request: PreAuthenticationRequestCore<TUserAttributes>,
) => Promise<PreAuthenticationTriggerEvent>;

export interface PreAuthenticationRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<PreAuthenticationTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: PreAuthenticationHandlerCore<TUserAttributes>;
}

// =============================================================================
// PostAuthentication
// =============================================================================

export interface PostAuthenticationRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: PostAuthenticationTriggerSource;
  userAttributes: TUserAttributes;
  event: PostAuthenticationTriggerEvent;
  context: Context;
}

export type PostAuthenticationResponse = PostAuthenticationTriggerEvent['response'];

// Handlers modify the cloned event and return it
type PostAuthenticationHandlerCore<TUserAttributes = UserAttributes> = (
  request: PostAuthenticationRequestCore<TUserAttributes>,
) => Promise<PostAuthenticationTriggerEvent>;

export interface PostAuthenticationRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<PostAuthenticationTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: PostAuthenticationHandlerCore<TUserAttributes>;
}

// =============================================================================
// DefineAuthChallenge
// =============================================================================

export interface DefineAuthChallengeRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: DefineAuthChallengeTriggerSource;
  userAttributes: TUserAttributes;
  event: DefineAuthChallengeTriggerEvent;
  context: Context;
}

export type DefineAuthChallengeResponse = DefineAuthChallengeTriggerEvent['response'];

// Handlers modify the cloned event and return it
type DefineAuthChallengeHandlerCore<TUserAttributes = UserAttributes> = (
  request: DefineAuthChallengeRequestCore<TUserAttributes>,
) => Promise<DefineAuthChallengeTriggerEvent>;

export interface DefineAuthChallengeRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<DefineAuthChallengeTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: DefineAuthChallengeHandlerCore<TUserAttributes>;
}

// =============================================================================
// CreateAuthChallenge
// =============================================================================

export interface CreateAuthChallengeRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: CreateAuthChallengeTriggerSource;
  userAttributes: TUserAttributes;
  event: CreateAuthChallengeTriggerEvent;
  context: Context;
}

export type CreateAuthChallengeResponse = CreateAuthChallengeTriggerEvent['response'];

// Handlers modify the cloned event and return it
type CreateAuthChallengeHandlerCore<TUserAttributes = UserAttributes> = (
  request: CreateAuthChallengeRequestCore<TUserAttributes>,
) => Promise<CreateAuthChallengeTriggerEvent>;

export interface CreateAuthChallengeRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<CreateAuthChallengeTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: CreateAuthChallengeHandlerCore<TUserAttributes>;
}

// =============================================================================
// VerifyAuthChallengeResponse
// =============================================================================

export interface VerifyAuthChallengeResponseRequestCore<TUserAttributes = UserAttributes> {
  triggerSource: VerifyAuthChallengeResponseTriggerSource;
  userAttributes: TUserAttributes;
  event: VerifyAuthChallengeResponseTriggerEvent;
  context: Context;
}

export type VerifyAuthChallengeResponseResponse = VerifyAuthChallengeResponseTriggerEvent['response'];

// Handlers modify the cloned event and return it
type VerifyAuthChallengeResponseHandlerCore<TUserAttributes = UserAttributes> = (
  request: VerifyAuthChallengeResponseRequestCore<TUserAttributes>,
) => Promise<VerifyAuthChallengeResponseTriggerEvent>;

export interface VerifyAuthChallengeResponseRouteDefinitionCore<TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<VerifyAuthChallengeResponseTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: VerifyAuthChallengeResponseHandlerCore<TUserAttributes>;
}

export type PreAuthenticationRequest<T extends TypeArgs<T, CognitoTypes> = object> = PreAuthenticationRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PreAuthenticationHandler<T extends TypeArgs<T, CognitoTypes> = object> = PreAuthenticationHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PreAuthenticationRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  PreAuthenticationRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;

export type PostAuthenticationRequest<T extends TypeArgs<T, CognitoTypes> = object> = PostAuthenticationRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PostAuthenticationHandler<T extends TypeArgs<T, CognitoTypes> = object> = PostAuthenticationHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type PostAuthenticationRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  PostAuthenticationRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;

export type DefineAuthChallengeRequest<T extends TypeArgs<T, CognitoTypes> = object> = DefineAuthChallengeRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type DefineAuthChallengeHandler<T extends TypeArgs<T, CognitoTypes> = object> = DefineAuthChallengeHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type DefineAuthChallengeRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  DefineAuthChallengeRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;

export type CreateAuthChallengeRequest<T extends TypeArgs<T, CognitoTypes> = object> = CreateAuthChallengeRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type CreateAuthChallengeHandler<T extends TypeArgs<T, CognitoTypes> = object> = CreateAuthChallengeHandlerCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type CreateAuthChallengeRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  CreateAuthChallengeRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;

export type VerifyAuthChallengeResponseRequest<T extends TypeArgs<T, CognitoTypes> = object> =
  VerifyAuthChallengeResponseRequestCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;

export type VerifyAuthChallengeResponseHandler<T extends TypeArgs<T, CognitoTypes> = object> =
  VerifyAuthChallengeResponseHandlerCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;

export type VerifyAuthChallengeResponseRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> =
  VerifyAuthChallengeResponseRouteDefinitionCore<TypeArg<T, 'userAttributes', CognitoDefaults>>;
