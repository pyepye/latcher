import type { SNSMessageAttributes as AWSSNSMessageAttributes, Context, SNSEventRecord } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

export type SNSRawMessageAttributes = AWSSNSMessageAttributes;
export type SNSMessageAttributeValue = string | Buffer;
export type SNSMessageAttributes = Record<string, SNSMessageAttributeValue>;

export interface SNSRequestCore<TBody = unknown, TMessageAttributes = SNSMessageAttributes> {
  body: TBody;
  messageAttributes: TMessageAttributes;
  record: SNSEventRecord;
  context: Context;
}

export type SNSResponse = undefined;

export type SNSMiddlewareCore<TBody = unknown, TMessageAttributes = SNSMessageAttributes> = MiddlewareCore<
  SNSRequestCore<TBody, TMessageAttributes>,
  void
>;

export type SNSRecordHandlerCore<TBody = unknown, TMessageAttributes = SNSMessageAttributes> = (
  request: SNSRequestCore<TBody, TMessageAttributes>,
) => Promise<void>;

export interface SNSFilterInput {
  body: unknown;
  messageAttributes: SNSMessageAttributes;
  record: SNSEventRecord;
}

export interface SNSFilters {
  topicArn?: FilterStringMatcher;
  subject?: FilterStringMatcher;
  messageAttributes?: Record<string, FilterStringMatcher>;
  custom?: (input: SNSFilterInput) => boolean | Promise<boolean>;
}

export interface SNSRouteDefinitionCore<TBody = unknown, TMessageAttributes = SNSMessageAttributes> {
  filters: SNSFilters;
  bodySchema?: StandardSchemaV1<unknown, TBody>;
  messageAttributesSchema?: StandardSchemaV1<unknown, TMessageAttributes>;
  middleware?: SNSMiddlewareCore<TBody, TMessageAttributes>[];
  handler: SNSRecordHandlerCore<TBody, TMessageAttributes>;
}

export interface SNSMatcherOptions {
  middleware?: SNSMiddlewareCore[];
}

export interface SNSTypes {
  body?: unknown;
  messageAttributes?: unknown;
}

interface SNSDefaults {
  body: unknown;
  messageAttributes: SNSMessageAttributes;
}

export type SNSRequest<T extends TypeArgs<T, SNSTypes> = object> = SNSRequestCore<
  TypeArg<T, 'body', SNSDefaults>,
  TypeArg<T, 'messageAttributes', SNSDefaults>
>;

export type SNSRecordHandler<T extends TypeArgs<T, SNSTypes> = object> = SNSRecordHandlerCore<
  TypeArg<T, 'body', SNSDefaults>,
  TypeArg<T, 'messageAttributes', SNSDefaults>
>;

export type SNSMiddleware<T extends TypeArgs<T, SNSTypes> = object> = SNSMiddlewareCore<
  TypeArg<T, 'body', SNSDefaults>,
  TypeArg<T, 'messageAttributes', SNSDefaults>
>;

export type SNSRouteDefinition<T extends TypeArgs<T, SNSTypes> = object> = SNSRouteDefinitionCore<
  TypeArg<T, 'body', SNSDefaults>,
  TypeArg<T, 'messageAttributes', SNSDefaults>
>;
