import type { Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { MiddlewareCore } from '../middleware';
import type { TypeArg, TypeArgs } from '../utils/typeArgs.js';

export interface EventFilterInput {
  event: unknown;
}

export interface EventFilters {
  custom?: (input: EventFilterInput) => boolean | Promise<boolean>;
}

export type EventMatcherMiddlewareCore<TPayload = unknown, TResponse = unknown> = MiddlewareCore<
  EventRequestCore<TPayload>,
  TResponse
>;

export interface EventRequestCore<TPayload = unknown> {
  event: TPayload;
  context: Context;
}

export interface EventRouteDefinitionCore<TPayload = unknown, TResponse = unknown> {
  filters: EventFilters;
  eventSchema?: StandardSchemaV1<unknown, TPayload>;
  middleware?: EventMatcherMiddlewareCore<TPayload, TResponse>[];
  handler: EventHandlerCore<TPayload, TResponse>;
}

export type EventHandlerCore<TPayload = unknown, TResponse = unknown> = (
  request: EventRequestCore<TPayload>,
) => Promise<TResponse>;

export interface EventMatcherOptionsCore<TResponse = unknown> {
  middleware?: EventMatcherMiddlewareCore<unknown, TResponse>[];
}

export interface EventRequestTypes {
  event?: unknown;
}

export interface EventHandlerTypes {
  event?: unknown;
  response?: unknown;
}

export interface EventMatcherOptionsTypes {
  response?: unknown;
}

interface EventDefaults {
  event: unknown;
  response: unknown;
}

export type EventRequest<T extends TypeArgs<T, EventRequestTypes> = object> = EventRequestCore<
  TypeArg<T, 'event', EventDefaults>
>;

export type EventHandler<T extends TypeArgs<T, EventHandlerTypes> = object> = EventHandlerCore<
  TypeArg<T, 'event', EventDefaults>,
  TypeArg<T, 'response', EventDefaults>
>;

export type EventMatcherMiddleware<T extends TypeArgs<T, EventHandlerTypes> = object> = EventMatcherMiddlewareCore<
  TypeArg<T, 'event', EventDefaults>,
  TypeArg<T, 'response', EventDefaults>
>;

export type EventRouteDefinition<T extends TypeArgs<T, EventHandlerTypes> = object> = EventRouteDefinitionCore<
  TypeArg<T, 'event', EventDefaults>,
  TypeArg<T, 'response', EventDefaults>
>;

export type EventMatcherOptions<T extends TypeArgs<T, EventMatcherOptionsTypes> = object> = EventMatcherOptionsCore<
  TypeArg<T, 'response', EventDefaults>
>;
