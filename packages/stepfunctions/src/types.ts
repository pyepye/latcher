import type { Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

export interface StepFunctionsFilterInput {
  event: unknown;
}

export interface StepFunctionsFilters {
  taskToken?: boolean;
  custom?: (input: StepFunctionsFilterInput) => boolean | Promise<boolean>;
}

export interface StepFunctionsRequestCore<TInput = unknown> {
  event: TInput;
  context: Context;
}

export interface StepFunctionsTaskTokenRequestCore<TInput = unknown> {
  taskToken: string;
  /** The payload with TaskToken removed, validated against eventSchema. */
  input: TInput;
  event: unknown;
  context: Context;
}

/** Middleware for a regular route, where `event` holds the validated payload. */
export type StepFunctionsMiddlewareCore<TResponse = unknown, TInput = unknown> = MiddlewareCore<
  StepFunctionsRequestCore<TInput>,
  TResponse
>;

/** Middleware for a task token route, where `input` holds the validated payload and `event` is raw. */
export type StepFunctionsTaskTokenMiddlewareCore<TResponse = unknown, TInput = unknown> = MiddlewareCore<
  StepFunctionsTaskTokenRequestCore<TInput>,
  TResponse
>;

export type StepFunctionsHandlerCore<TInput = unknown> = (
  request: StepFunctionsRequestCore<TInput>,
) => Promise<unknown>;

export type StepFunctionsTaskTokenHandlerCore<TInput = unknown> = (
  request: StepFunctionsTaskTokenRequestCore<TInput>,
) => Promise<unknown>;

export interface StepFunctionsRouteDefinitionCore<TInput = unknown> {
  filters: StepFunctionsFilters;
  eventSchema?: StandardSchemaV1<unknown, TInput>;
  middleware?: StepFunctionsMiddlewareCore<unknown, NoInfer<TInput>>[];
  handler: StepFunctionsHandlerCore<TInput>;
}

export interface StepFunctionsTaskTokenRouteDefinitionCore<TInput = unknown> {
  filters: StepFunctionsFilters & { taskToken: true };
  eventSchema?: StandardSchemaV1<unknown, TInput>;
  middleware?: StepFunctionsTaskTokenMiddlewareCore<unknown, NoInfer<TInput>>[];
  handler: StepFunctionsTaskTokenHandlerCore<TInput>;
}

export interface StepFunctionsTypes {
  event?: unknown;
}

interface StepFunctionsDefaults {
  event: unknown;
}

export interface StepFunctionsMiddlewareTypes {
  event?: unknown;
  response?: unknown;
}

interface StepFunctionsMiddlewareDefaults {
  event: unknown;
  response: unknown;
}

export interface StepFunctionsTaskTokenTypes {
  input?: unknown;
}

interface StepFunctionsTaskTokenDefaults {
  input: unknown;
}

export interface StepFunctionsTaskTokenMiddlewareTypes {
  input?: unknown;
  response?: unknown;
}

interface StepFunctionsTaskTokenMiddlewareDefaults {
  input: unknown;
  response: unknown;
}

export type StepFunctionsRequest<T extends TypeArgs<T, StepFunctionsTypes> = object> = StepFunctionsRequestCore<
  TypeArg<T, 'event', StepFunctionsDefaults>
>;

export type StepFunctionsMiddleware<T extends TypeArgs<T, StepFunctionsMiddlewareTypes> = object> =
  StepFunctionsMiddlewareCore<
    TypeArg<T, 'response', StepFunctionsMiddlewareDefaults>,
    TypeArg<T, 'event', StepFunctionsMiddlewareDefaults>
  >;

export type StepFunctionsHandler<T extends TypeArgs<T, StepFunctionsTypes> = object> = StepFunctionsHandlerCore<
  TypeArg<T, 'event', StepFunctionsDefaults>
>;

export type StepFunctionsRouteDefinition<T extends TypeArgs<T, StepFunctionsTypes> = object> =
  StepFunctionsRouteDefinitionCore<TypeArg<T, 'event', StepFunctionsDefaults>>;

export type StepFunctionsTaskTokenRequest<T extends TypeArgs<T, StepFunctionsTaskTokenTypes> = object> =
  StepFunctionsTaskTokenRequestCore<TypeArg<T, 'input', StepFunctionsTaskTokenDefaults>>;

export type StepFunctionsTaskTokenMiddleware<T extends TypeArgs<T, StepFunctionsTaskTokenMiddlewareTypes> = object> =
  StepFunctionsTaskTokenMiddlewareCore<
    TypeArg<T, 'response', StepFunctionsTaskTokenMiddlewareDefaults>,
    TypeArg<T, 'input', StepFunctionsTaskTokenMiddlewareDefaults>
  >;

export type StepFunctionsTaskTokenHandler<T extends TypeArgs<T, StepFunctionsTaskTokenTypes> = object> =
  StepFunctionsTaskTokenHandlerCore<TypeArg<T, 'input', StepFunctionsTaskTokenDefaults>>;

export type StepFunctionsTaskTokenRouteDefinition<T extends TypeArgs<T, StepFunctionsTaskTokenTypes> = object> =
  StepFunctionsTaskTokenRouteDefinitionCore<TypeArg<T, 'input', StepFunctionsTaskTokenDefaults>>;
