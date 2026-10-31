import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { MiddlewareCore } from '@latcher/base';

import type { KafkaFilters, KafkaRequestCore, KafkaRouteDefinitionCore } from './types.js';

export interface InternalRoute {
  filters: KafkaFilters;
  valueSchema?: StandardSchemaV1;
  middleware: MiddlewareCore<KafkaRequestCore, void>[];
  handler: (request: KafkaRequestCore) => Promise<void>;
}

export interface RouteInput<
  TValueSchema extends StandardSchemaV1 | undefined = undefined,
  TValue = TValueSchema extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TValueSchema> : unknown,
> {
  filters: KafkaFilters;
  valueSchema?: TValueSchema;
  middleware?: MiddlewareCore<KafkaRequestCore<NoInfer<TValue>>, void>[];
}

export interface RouteBuilder<TValue> {
  handle(handler: (request: KafkaRequestCore<TValue>) => Promise<void>): KafkaRouteDefinitionCore<TValue>;
}
