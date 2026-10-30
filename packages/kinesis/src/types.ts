import type { Context, KinesisStreamRecord } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

export interface KinesisFilterInput {
  data: unknown;
  rawData: Buffer;
  partitionKey: string;
  record: KinesisStreamRecord;
}

export interface KinesisFilters {
  eventSourceArn?: FilterStringMatcher;
  partitionKey?: FilterStringMatcher;
  custom?: (input: KinesisFilterInput) => boolean | Promise<boolean>;
}

export interface KinesisRequestCore<TData = unknown> {
  data: TData;
  rawData: Buffer;
  partitionKey: string;
  sequenceNumber: string;
  subSequenceNumber?: number;
  approximateArrivalTimestamp: number;
  record: KinesisStreamRecord;
  context: Context;
}

export type KinesisResponse = undefined;

export type KinesisMiddlewareCore<TData = unknown> = MiddlewareCore<KinesisRequestCore<TData>, void>;

export interface KinesisRouteDefinitionCore<TData = unknown> {
  filters: KinesisFilters;
  dataSchema?: StandardSchemaV1<unknown, TData>;
  middleware?: KinesisMiddlewareCore<NoInfer<TData>>[];
  handler: (request: KinesisRequestCore<TData>) => Promise<void>;
}

export interface KinesisMatcherOptions {
  batchItemFailures?: boolean;
  middleware?: KinesisMiddlewareCore[];
}

export interface KinesisTypes {
  data?: unknown;
}

interface KinesisDefaults {
  data: unknown;
}

export type KinesisRequest<T extends TypeArgs<T, KinesisTypes> = object> = KinesisRequestCore<
  TypeArg<T, 'data', KinesisDefaults>
>;

export type KinesisMiddleware<T extends TypeArgs<T, KinesisTypes> = object> = KinesisMiddlewareCore<
  TypeArg<T, 'data', KinesisDefaults>
>;

export type KinesisRouteDefinition<T extends TypeArgs<T, KinesisTypes> = object> = KinesisRouteDefinitionCore<
  TypeArg<T, 'data', KinesisDefaults>
>;
