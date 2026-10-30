import type { Context, FirehoseRecordMetadata, FirehoseTransformationEventRecord } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

import type { FirehoseResponseResult } from './response.js';

export interface FirehoseFilterInput {
  data: unknown;
  rawData: Buffer;
  recordId: string;
  approximateArrivalTimestamp: number;
  record: FirehoseTransformationEventRecord;
  metadata?: FirehoseRecordMetadata;
}

export interface FirehoseFilters {
  deliveryStreamArn?: FilterStringMatcher;
  sourceKinesisStreamArn?: FilterStringMatcher;
  custom?: (input: FirehoseFilterInput) => boolean | Promise<boolean>;
}

export interface FirehoseRequestCore<TData = unknown> {
  data: TData;
  rawData: Buffer;
  recordId: string;
  approximateArrivalTimestamp: number;
  record: FirehoseTransformationEventRecord;
  context: Context;
  metadata?: FirehoseRecordMetadata;
}

export type FirehoseResponse = FirehoseResponseResult;

export type FirehoseMiddlewareCore<TData = unknown> = MiddlewareCore<FirehoseRequestCore<TData>, FirehoseResponse>;

export interface FirehoseRouteDefinitionCore<TData = unknown> {
  filters: FirehoseFilters;
  dataSchema?: StandardSchemaV1<unknown, TData>;
  middleware?: FirehoseMiddlewareCore<NoInfer<TData>>[];
  handler: (request: FirehoseRequestCore<TData>) => Promise<FirehoseResponse>;
}

export interface FirehoseMatcherOptions {
  middleware?: FirehoseMiddlewareCore[];
}

export interface FirehoseTypes {
  data?: unknown;
}

interface FirehoseDefaults {
  data: unknown;
}

export type FirehoseRequest<T extends TypeArgs<T, FirehoseTypes> = object> = FirehoseRequestCore<
  TypeArg<T, 'data', FirehoseDefaults>
>;

export type FirehoseMiddleware<T extends TypeArgs<T, FirehoseTypes> = object> = FirehoseMiddlewareCore<
  TypeArg<T, 'data', FirehoseDefaults>
>;

export type FirehoseRouteDefinition<T extends TypeArgs<T, FirehoseTypes> = object> = FirehoseRouteDefinitionCore<
  TypeArg<T, 'data', FirehoseDefaults>
>;
