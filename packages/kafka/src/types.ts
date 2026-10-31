import type { Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

export interface KafkaRecordHeader {
  [headerKey: string]: number[];
}

// A record produced without a key arrives with a null key, a tombstone with a null value, and a record
// produced with no headers with null headers.
export interface KafkaRecord {
  topic: string;
  partition: number;
  offset: number;
  timestamp: number;
  timestampType: 'CREATE_TIME' | 'LOG_APPEND_TIME';
  key?: string | null;
  value?: string | null;
  headers?: KafkaRecordHeader[] | null;
}

export interface KafkaMSKEvent {
  eventSource: 'aws:kafka';
  eventSourceArn: string;
  bootstrapServers: string;
  records: Record<string, KafkaRecord[]>;
}

export interface KafkaSelfManagedEvent {
  eventSource: 'SelfManagedKafka';
  bootstrapServers: string;
  records: Record<string, KafkaRecord[]>;
}

// Lambda re-delivers a batch reported through `batchItemFailures` as its records alone, with no
// `eventSource`, `eventSourceArn` or `bootstrapServers`.
export interface KafkaRetryEvent {
  // Absent, and declared so the union stays discriminated on it.
  eventSource?: undefined;
  records: Record<string, KafkaRecord[]>;
}

export type KafkaEvent = KafkaMSKEvent | KafkaSelfManagedEvent | KafkaRetryEvent;

export type KafkaDecodedHeader = Record<string, string>;

// Kafka allows the same header name twice, so `headerList` keeps every entry in order while `headers`
// holds one value per name, the last one sent.
export type KafkaHeaders = Record<string, string>;

export interface KafkaFilterInput {
  headers: KafkaHeaders;
  headerList: KafkaDecodedHeader[];
  topic: string;
  tombstone: boolean;
  record: KafkaRecord;
}

export interface KafkaFilters {
  topic?: FilterStringMatcher;
  tombstone?: boolean;
  eventSourceArn?: FilterStringMatcher;
  bootstrapServer?: FilterStringMatcher;
  custom?: (input: KafkaFilterInput) => boolean | Promise<boolean>;
}

export interface KafkaRequestCore<TValue = unknown> {
  value: TValue;
  key: string | undefined;
  topic: string;
  partition: number;
  offset: number;
  timestamp: number;
  headers: KafkaHeaders;
  headerList: KafkaDecodedHeader[];
  tombstone: boolean;
  record: KafkaRecord;
  context: Context;
}

export type KafkaResponse = undefined;

export type KafkaMiddlewareCore<TValue = unknown> = MiddlewareCore<KafkaRequestCore<TValue>, void>;

export interface KafkaRouteDefinitionCore<TValue = unknown> {
  filters: KafkaFilters;
  valueSchema?: StandardSchemaV1<unknown, TValue>;
  middleware?: KafkaMiddlewareCore<NoInfer<TValue>>[];
  handler: (request: KafkaRequestCore<TValue>) => Promise<void>;
}

export interface KafkaMatcherOptions {
  batchItemFailures?: boolean;
  middleware?: KafkaMiddlewareCore[];
}

export interface KafkaBatchItemIdentifier {
  partition: string;
  offset: number;
}

export interface KafkaBatchResponse {
  batchItemFailures: Array<{ itemIdentifier: KafkaBatchItemIdentifier }>;
}

export interface KafkaTypes {
  value?: unknown;
}

interface KafkaDefaults {
  value: unknown;
}

export type KafkaRequest<T extends TypeArgs<T, KafkaTypes> = object> = KafkaRequestCore<
  TypeArg<T, 'value', KafkaDefaults>
>;

export type KafkaMiddleware<T extends TypeArgs<T, KafkaTypes> = object> = KafkaMiddlewareCore<
  TypeArg<T, 'value', KafkaDefaults>
>;

export type KafkaRouteDefinition<T extends TypeArgs<T, KafkaTypes> = object> = KafkaRouteDefinitionCore<
  TypeArg<T, 'value', KafkaDefaults>
>;
