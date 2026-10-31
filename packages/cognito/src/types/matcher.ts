import type {
  CreateAuthChallengeTriggerEvent,
  CustomEmailSenderTriggerEvent,
  CustomMessageTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  PostAuthenticationTriggerEvent,
  PostConfirmationTriggerEvent,
  PreAuthenticationTriggerEvent,
  PreSignUpTriggerEvent,
  PreTokenGenerationTriggerEvent,
  UserMigrationTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

import type {
  CognitoDefaults,
  CognitoFilterInputCore,
  CognitoFiltersCore,
  CognitoTypes,
  CreateAuthChallengeRequestCore,
  CreateAuthChallengeTriggerSource,
  CustomEmailSenderRequestCore,
  CustomEmailSenderTriggerSource,
  CustomMessageRequestCore,
  CustomMessageTriggerSource,
  DefineAuthChallengeRequestCore,
  DefineAuthChallengeTriggerSource,
  PostAuthenticationRequestCore,
  PostAuthenticationTriggerSource,
  PostConfirmationRequestCore,
  PostConfirmationTriggerSource,
  PreAuthenticationRequestCore,
  PreAuthenticationTriggerSource,
  PreSignUpRequestCore,
  PreSignUpTriggerSource,
  PreTokenGenerationRequestCore,
  PreTokenGenerationTriggerSource,
  UserAttributes,
  UserMigrationRequestCore,
  UserMigrationTriggerSource,
  VerifyAuthChallengeResponseRequestCore,
  VerifyAuthChallengeResponseTriggerSource,
} from './index.js';

// Union of all trigger sources
export type CognitoTriggerSource =
  | PreSignUpTriggerSource
  | PreAuthenticationTriggerSource
  | PostAuthenticationTriggerSource
  | PostConfirmationTriggerSource
  | DefineAuthChallengeTriggerSource
  | CreateAuthChallengeTriggerSource
  | VerifyAuthChallengeResponseTriggerSource
  | CustomMessageTriggerSource
  | CustomEmailSenderTriggerSource
  | PreTokenGenerationTriggerSource
  | UserMigrationTriggerSource;

// Union of all Cognito event types
export type CognitoEvent =
  | PreSignUpTriggerEvent
  | PreAuthenticationTriggerEvent
  | PostAuthenticationTriggerEvent
  | PostConfirmationTriggerEvent
  | DefineAuthChallengeTriggerEvent
  | CreateAuthChallengeTriggerEvent
  | VerifyAuthChallengeResponseTriggerEvent
  | CustomMessageTriggerEvent
  | CustomEmailSenderTriggerEvent
  | PreTokenGenerationTriggerEvent
  | UserMigrationTriggerEvent;

// =============================================================================
// Generic types for route() method
// =============================================================================

// Generic Cognito request type for handlers
export type CognitoRequestCore<TUserAttributes = UserAttributes> =
  | PreSignUpRequestCore<TUserAttributes>
  | PreAuthenticationRequestCore<TUserAttributes>
  | PostAuthenticationRequestCore<TUserAttributes>
  | PostConfirmationRequestCore<TUserAttributes>
  | DefineAuthChallengeRequestCore<TUserAttributes>
  | CreateAuthChallengeRequestCore<TUserAttributes>
  | VerifyAuthChallengeResponseRequestCore<TUserAttributes>
  | CustomMessageRequestCore<TUserAttributes>
  | CustomEmailSenderRequestCore<TUserAttributes>
  | PreTokenGenerationRequestCore<TUserAttributes>
  | UserMigrationRequestCore<TUserAttributes>;

// Route definition for generic .route() method
// Handlers receive a cloned event, modify it, and return it
export interface CognitoRouteDefinitionCore<TUserAttributes> {
  filters?: CognitoFiltersCore<CognitoTriggerSource>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: (request: CognitoRequestCore<TUserAttributes>) => Promise<CognitoEvent>;
}

// =============================================================================
// Type mappings for defineRoute()
// =============================================================================

// Mapped type: trigger source -> request type
type TriggerRequestMap<TUserAttributes = UserAttributes> = {
  [K in PreSignUpTriggerSource]: PreSignUpRequestCore<TUserAttributes>;
} & { [K in PreAuthenticationTriggerSource]: PreAuthenticationRequestCore<TUserAttributes> } & {
  [K in PostAuthenticationTriggerSource]: PostAuthenticationRequestCore<TUserAttributes>;
} & { [K in PostConfirmationTriggerSource]: PostConfirmationRequestCore<TUserAttributes> } & {
  [K in DefineAuthChallengeTriggerSource]: DefineAuthChallengeRequestCore<TUserAttributes>;
} & { [K in CreateAuthChallengeTriggerSource]: CreateAuthChallengeRequestCore<TUserAttributes> } & {
  [K in VerifyAuthChallengeResponseTriggerSource]: VerifyAuthChallengeResponseRequestCore<TUserAttributes>;
} & { [K in CustomMessageTriggerSource]: CustomMessageRequestCore<TUserAttributes> } & {
  [K in CustomEmailSenderTriggerSource]: CustomEmailSenderRequestCore<TUserAttributes>;
} & { [K in PreTokenGenerationTriggerSource]: PreTokenGenerationRequestCore<TUserAttributes> } & {
  [K in UserMigrationTriggerSource]: UserMigrationRequestCore<TUserAttributes>;
};

export type RequestForTrigger<
  TTrigger extends CognitoTriggerSource,
  TUserAttributes = UserAttributes,
> = TriggerRequestMap<TUserAttributes>[TTrigger];

// Mapped type: trigger source -> event type
type TriggerEventMap = { [K in PreSignUpTriggerSource]: PreSignUpTriggerEvent } & {
  [K in PreAuthenticationTriggerSource]: PreAuthenticationTriggerEvent;
} & { [K in PostAuthenticationTriggerSource]: PostAuthenticationTriggerEvent } & {
  [K in PostConfirmationTriggerSource]: PostConfirmationTriggerEvent;
} & { [K in DefineAuthChallengeTriggerSource]: DefineAuthChallengeTriggerEvent } & {
  [K in CreateAuthChallengeTriggerSource]: CreateAuthChallengeTriggerEvent;
} & { [K in VerifyAuthChallengeResponseTriggerSource]: VerifyAuthChallengeResponseTriggerEvent } & {
  [K in CustomMessageTriggerSource]: CustomMessageTriggerEvent;
} & { [K in CustomEmailSenderTriggerSource]: CustomEmailSenderTriggerEvent } & {
  [K in PreTokenGenerationTriggerSource]: PreTokenGenerationTriggerEvent;
} & { [K in UserMigrationTriggerSource]: UserMigrationTriggerEvent };

export type EventForTrigger<TTrigger extends CognitoTriggerSource> = TriggerEventMap[TTrigger];

// =============================================================================
// Route definition types
// =============================================================================

export type CognitoMiddlewareCore<TUserAttributes = UserAttributes> = MiddlewareCore<
  CognitoRequestCore<TUserAttributes>,
  CognitoEvent
>;

// Route definition returned by defineRoute().handle()
// Handlers receive a cloned event, modify it, and return it
export interface TypedRouteDefinitionCore<TTrigger extends CognitoTriggerSource, TUserAttributes = UserAttributes> {
  filters?: CognitoFiltersCore<TTrigger>;
  userAttributesSchema?: StandardSchemaV1<unknown, TUserAttributes>;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
  handler: (request: RequestForTrigger<TTrigger, TUserAttributes>) => Promise<EventForTrigger<TTrigger>>;
}

// Input filters for defineRoute
export interface RouteInputFilters<TTrigger extends CognitoTriggerSource> {
  triggerSource?: TTrigger | readonly TTrigger[];
  userPoolId?: PreSignUpTriggerEvent['userPoolId'] | readonly PreSignUpTriggerEvent['userPoolId'][];
  clientId?:
    | PreSignUpTriggerEvent['callerContext']['clientId']
    | readonly PreSignUpTriggerEvent['callerContext']['clientId'][];
  userAttributes?: Record<string, FilterStringMatcher>;
  custom?: (input: CognitoFilterInputCore<TTrigger>) => boolean | Promise<boolean>;
}

// Input for defineRoute
export interface RouteInput<
  TTrigger extends CognitoTriggerSource,
  TUserAttributesSchema extends StandardSchemaV1 | undefined = undefined,
  TUserAttributes = UserAttributes,
> {
  filters?: RouteInputFilters<TTrigger>;
  userAttributesSchema?: TUserAttributesSchema;
  middleware?: CognitoMiddlewareCore<NoInfer<TUserAttributes>>[];
}

// Route builder returned by defineRoute
// Handlers receive a cloned event, modify it, and return it
export interface RouteBuilder<TTrigger extends CognitoTriggerSource, TUserAttributes> {
  handle(
    handler: (request: RequestForTrigger<TTrigger, TUserAttributes>) => Promise<EventForTrigger<TTrigger>>,
  ): TypedRouteDefinitionCore<TTrigger, TUserAttributes>;
}

export interface CognitoMatcherOptions {
  middleware?: CognitoMiddlewareCore[];
}

export type CognitoRequest<T extends TypeArgs<T, CognitoTypes> = object> = CognitoRequestCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type CognitoMiddleware<T extends TypeArgs<T, CognitoTypes> = object> = CognitoMiddlewareCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export type CognitoRouteDefinition<T extends TypeArgs<T, CognitoTypes> = object> = CognitoRouteDefinitionCore<
  TypeArg<T, 'userAttributes', CognitoDefaults>
>;

export interface TypedRouteDefinitionTypes {
  trigger: CognitoTriggerSource;
  userAttributes?: unknown;
}

interface TypedRouteDefinitionDefaults {
  trigger: CognitoTriggerSource;
  userAttributes: UserAttributes;
}

export type TypedRouteDefinition<T extends TypeArgs<T, TypedRouteDefinitionTypes>> = TypedRouteDefinitionCore<
  Extract<TypeArg<T, 'trigger', TypedRouteDefinitionDefaults>, CognitoTriggerSource>,
  TypeArg<T, 'userAttributes', TypedRouteDefinitionDefaults>
>;
