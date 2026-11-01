import type { Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

// --- AWS Event Types (not in @types/aws-lambda) ---

// packages/testing/src/rabbitMQ.ts has a copy of RabbitMQHeaderValue, RabbitMQBasicProperties,
// RabbitMQMessage and RabbitMQEvent. Change both together.

// Amazon MQ delivers a string header as its UTF-8 bytes. A timestamp header is the only plain string.
export type RabbitMQHeaderValue =
  | { bytes: number[] }
  | string
  | number
  | boolean
  | null
  | RabbitMQHeaderValue[]
  | { [key: string]: RabbitMQHeaderValue };

// An AMQP property the publisher does not set arrives as null rather than as a default, so every field
// a publisher may leave out is nullable.
export interface RabbitMQBasicProperties {
  contentType: string | null;
  contentEncoding: string | null;
  headers: Record<string, RabbitMQHeaderValue>;
  deliveryMode: number | null;
  priority: number | null;
  correlationId: string | null;
  replyTo: string | null;
  expiration: string | null;
  messageId: string | null;
  timestamp: string | null;
  type: string | null;
  userId: string | null;
  appId: string | null;
  clusterId: string | null;
  bodySize: number;
}

export interface RabbitMQMessage {
  basicProperties: RabbitMQBasicProperties;
  data: string;
  redelivered: boolean;
}

export interface RabbitMQEvent {
  eventSource: 'aws:rmq';
  eventSourceArn: string;
  rmqMessagesByQueue: Record<string, RabbitMQMessage[]>;
}

// --- Request Type ---

export interface RabbitMQRequestCore<TBody = unknown> {
  message: RabbitMQMessage;
  queue: string;
  virtualHost: string | undefined;
  body: TBody;
  timestamp: Date | null;
  record: RabbitMQMessage;
  context: Context;
}

// --- Filter Types ---

export interface RabbitMQFilterInput {
  queue: string;
  virtualHost: string | undefined;
  contentType: string | null;
  timestamp: Date | null;
  message: RabbitMQMessage;
  record: RabbitMQMessage;
}

export interface RabbitMQFilters {
  eventSourceArn?: FilterStringMatcher;
  queue?: FilterStringMatcher;
  virtualHost?: FilterStringMatcher;
  contentType?: FilterStringMatcher;
  custom?: (input: RabbitMQFilterInput) => boolean | Promise<boolean>;
}

// --- Route Definition Types ---

export type RabbitMQMiddlewareCore<TBody = unknown> = MiddlewareCore<RabbitMQRequestCore<TBody>, void>;

export interface RabbitMQRouteDefinitionCore<TBody = unknown> {
  filters: RabbitMQFilters;
  bodySchema?: StandardSchemaV1<unknown, TBody>;
  middleware?: RabbitMQMiddlewareCore<NoInfer<TBody>>[];
  handler: (request: RabbitMQRequestCore<TBody>) => Promise<void>;
}

// --- Internal Route Type ---

export interface RabbitMQInternalRoute {
  filters: RabbitMQFilters;
  bodySchema?: StandardSchemaV1;
  middleware?: RabbitMQMiddlewareCore[];
  handler: (request: RabbitMQRequestCore) => Promise<void>;
}

// --- Route Builder Types ---

export interface RabbitMQRouteInput<
  TBodySchema extends StandardSchemaV1 | undefined = undefined,
  TBody = TBodySchema extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TBodySchema> : unknown,
> {
  filters: RabbitMQFilters;
  middleware?: RabbitMQMiddlewareCore<TBody>[];
  bodySchema?: TBodySchema;
}

export interface RabbitMQRouteBuilder<TBody> {
  handle(handler: (request: RabbitMQRequestCore<TBody>) => Promise<void>): RabbitMQRouteDefinitionCore<TBody>;
}

export interface RabbitMQMatcherOptions {
  middleware?: RabbitMQMiddlewareCore[];
}

export type RabbitMQResponse = undefined;

export interface RabbitMQTypes {
  body?: unknown;
}

interface RabbitMQDefaults {
  body: unknown;
}

export type RabbitMQRequest<T extends TypeArgs<T, RabbitMQTypes> = object> = RabbitMQRequestCore<
  TypeArg<T, 'body', RabbitMQDefaults>
>;

export type RabbitMQMiddleware<T extends TypeArgs<T, RabbitMQTypes> = object> = RabbitMQMiddlewareCore<
  TypeArg<T, 'body', RabbitMQDefaults>
>;

export type RabbitMQRouteDefinition<T extends TypeArgs<T, RabbitMQTypes> = object> = RabbitMQRouteDefinitionCore<
  TypeArg<T, 'body', RabbitMQDefaults>
>;
