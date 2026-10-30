import type { SQSRecord as AWSSQSRecord, Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

export type SQSMessageAttributeValue = string | string[] | number | Buffer;
export type SQSMessageAttributes = Record<string, SQSMessageAttributeValue>;
export type SQSMessageAttributeFilter = FilterStringMatcher | number | number[];

export interface SQSRequestCore<TBody = unknown, TMessageAttributes = SQSMessageAttributes> {
  body: TBody;
  messageAttributes: TMessageAttributes;
  record: AWSSQSRecord;
  context: Context;
}

export type SQSResponse = undefined;

export type SQSRecordHandlerCore<TBody = unknown, TMessageAttributes = SQSMessageAttributes> = (
  request: SQSRequestCore<TBody, TMessageAttributes>,
) => Promise<void>;

export type SQSMiddlewareCore<TBody = unknown, TMessageAttributes = SQSMessageAttributes> = MiddlewareCore<
  SQSRequestCore<TBody, TMessageAttributes>,
  void
>;

export interface SQSFilterInput {
  body: unknown;
  messageAttributes: SQSMessageAttributes;
  record: AWSSQSRecord;
}

export interface SQSFilters {
  eventSourceArn?: FilterStringMatcher;
  messageAttributes?: Record<string, SQSMessageAttributeFilter>;
  custom?: (input: SQSFilterInput) => boolean | Promise<boolean>;
}

export interface SQSRouteDefinitionCore<TBody = unknown, TMessageAttributes = SQSMessageAttributes> {
  filters: SQSFilters;
  bodySchema?: StandardSchemaV1<unknown, TBody>;
  messageAttributesSchema?: StandardSchemaV1<unknown, TMessageAttributes>;
  middleware?: SQSMiddlewareCore<TBody, TMessageAttributes>[];
  handler: SQSRecordHandlerCore<TBody, TMessageAttributes>;
}

export interface SQSMatcherOptions {
  batchItemFailures?: boolean;
  middleware?: SQSMiddlewareCore[];
}

export interface SQSTypes {
  body?: unknown;
  messageAttributes?: unknown;
}

interface SQSDefaults {
  body: unknown;
  messageAttributes: SQSMessageAttributes;
}

export type SQSRequest<T extends TypeArgs<T, SQSTypes> = object> = SQSRequestCore<
  TypeArg<T, 'body', SQSDefaults>,
  TypeArg<T, 'messageAttributes', SQSDefaults>
>;

export type SQSRecordHandler<T extends TypeArgs<T, SQSTypes> = object> = SQSRecordHandlerCore<
  TypeArg<T, 'body', SQSDefaults>,
  TypeArg<T, 'messageAttributes', SQSDefaults>
>;

export type SQSMiddleware<T extends TypeArgs<T, SQSTypes> = object> = SQSMiddlewareCore<
  TypeArg<T, 'body', SQSDefaults>,
  TypeArg<T, 'messageAttributes', SQSDefaults>
>;

export type SQSRouteDefinition<T extends TypeArgs<T, SQSTypes> = object> = SQSRouteDefinitionCore<
  TypeArg<T, 'body', SQSDefaults>,
  TypeArg<T, 'messageAttributes', SQSDefaults>
>;
