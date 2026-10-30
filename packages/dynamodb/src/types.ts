import type { Context, DynamoDBRecord, StreamRecord } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

// Derive event name type from aws-lambda (excludes undefined)
export type DynamoDBEventName = NonNullable<DynamoDBRecord['eventName']>;

// Derive stream view type from aws-lambda (excludes undefined)
export type DynamoDBViewType = NonNullable<StreamRecord['StreamViewType']>;

interface DynamoDBRequestBase<TKeys = Record<string, unknown>> {
  keys: TKeys;
  record: DynamoDBRecord;
  context: Context;
}

export interface DynamoDBInsertRequestCore<TKeys = Record<string, unknown>, TNewItem = Record<string, unknown>>
  extends DynamoDBRequestBase<TKeys> {
  eventName: 'INSERT';
  newImage: TNewItem;
  oldImage?: undefined;
}

export interface DynamoDBModifyRequestCore<
  TKeys = Record<string, unknown>,
  TNewItem = Record<string, unknown>,
  TOldItem = Record<string, unknown>,
> extends DynamoDBRequestBase<TKeys> {
  eventName: 'MODIFY';
  newImage: TNewItem;
  oldImage: TOldItem;
}

export interface DynamoDBRemoveRequestCore<TKeys = Record<string, unknown>, TOldItem = Record<string, unknown>>
  extends DynamoDBRequestBase<TKeys> {
  eventName: 'REMOVE';
  newImage?: undefined;
  oldImage: TOldItem;
}

export type DynamoDBRequestCore<
  TKeys = Record<string, unknown>,
  TNewItem = Record<string, unknown>,
  TOldItem = Record<string, unknown>,
> =
  | DynamoDBInsertRequestCore<TKeys, TNewItem>
  | DynamoDBModifyRequestCore<TKeys, TNewItem, TOldItem>
  | DynamoDBRemoveRequestCore<TKeys, TOldItem>;

export type DynamoDBResponse = undefined;

export type DynamoDBMiddlewareCore<
  TKeys = Record<string, unknown>,
  TNewItem = Record<string, unknown>,
  TOldItem = Record<string, unknown>,
> = MiddlewareCore<DynamoDBRequestCore<TKeys, TNewItem, TOldItem>, void>;

// Takes the whole union, so a handler written for one eventName will not assign to a route whose
// filters can deliver another. Narrow on request.eventName inside the handler
export type DynamoDBRecordHandlerCore<
  TKeys = Record<string, unknown>,
  TNewItem = Record<string, unknown>,
  TOldItem = Record<string, unknown>,
> = (request: DynamoDBRequestCore<TKeys, TNewItem, TOldItem>) => Promise<void>;

export interface DynamoDBFilterInputCore<TNewItem = Record<string, unknown>, TOldItem = Record<string, unknown>> {
  eventName: DynamoDBEventName;
  streamViewType?: DynamoDBViewType;
  record: DynamoDBRecord;
  keys: Record<string, unknown>;
  newImage?: TNewItem;
  oldImage?: TOldItem;
}

export type DynamoDBKeyValue = string | number;

export interface DynamoDBFilters {
  eventName?: DynamoDBEventName | DynamoDBEventName[];
  eventSourceArn?: FilterStringMatcher;
  streamViewType?: DynamoDBViewType | DynamoDBViewType[];
  partitionKey?: FilterStringMatcher | DynamoDBKeyValue | DynamoDBKeyValue[];
  sortKey?: FilterStringMatcher | DynamoDBKeyValue | DynamoDBKeyValue[];
  custom?: (input: DynamoDBFilterInputCore) => boolean | Promise<boolean>;
}

export interface DynamoDBInsertRouteDefinitionCore<
  TKeys = Record<string, unknown>,
  TNewItem = Record<string, unknown>,
> {
  filters: Omit<DynamoDBFilters, 'eventName'>;
  keysSchema?: StandardSchemaV1<unknown, TKeys>;
  newImageSchema?: StandardSchemaV1<unknown, TNewItem>;
  middleware?: DynamoDBMiddlewareCore<TKeys, TNewItem>[];
  handler: (request: DynamoDBInsertRequestCore<TKeys, TNewItem>) => Promise<void>;
}

export interface DynamoDBModifyRouteDefinitionCore<
  TKeys = Record<string, unknown>,
  TNewItem = Record<string, unknown>,
  TOldItem = Record<string, unknown>,
> {
  filters: Omit<DynamoDBFilters, 'eventName'>;
  keysSchema?: StandardSchemaV1<unknown, TKeys>;
  newImageSchema?: StandardSchemaV1<unknown, TNewItem>;
  oldImageSchema?: StandardSchemaV1<unknown, TOldItem>;
  middleware?: DynamoDBMiddlewareCore<TKeys, TNewItem, TOldItem>[];
  handler: (request: DynamoDBModifyRequestCore<TKeys, TNewItem, TOldItem>) => Promise<void>;
}

export interface DynamoDBRemoveRouteDefinitionCore<
  TKeys = Record<string, unknown>,
  TOldItem = Record<string, unknown>,
> {
  filters: Omit<DynamoDBFilters, 'eventName'>;
  keysSchema?: StandardSchemaV1<unknown, TKeys>;
  oldImageSchema?: StandardSchemaV1<unknown, TOldItem>;
  middleware?: DynamoDBMiddlewareCore<TKeys, Record<string, unknown>, TOldItem>[];
  handler: (request: DynamoDBRemoveRequestCore<TKeys, TOldItem>) => Promise<void>;
}

export interface DynamoDBRouteDefinitionCore<
  TKeys = Record<string, unknown>,
  TNewItem = Record<string, unknown>,
  TOldItem = Record<string, unknown>,
> {
  filters: DynamoDBFilters;
  keysSchema?: StandardSchemaV1<unknown, TKeys>;
  newImageSchema?: StandardSchemaV1<unknown, TNewItem>;
  oldImageSchema?: StandardSchemaV1<unknown, TOldItem>;
  middleware?: DynamoDBMiddlewareCore<TKeys, TNewItem, TOldItem>[];
  handler: DynamoDBRecordHandlerCore<TKeys, TNewItem, TOldItem>;
}

export interface DynamoDBMatcherKeys {
  partitionKey: string;
  sortKey?: string;
}

export interface DynamoDBMatcherOptions {
  batchItemFailures?: boolean;
  middleware?: DynamoDBMiddlewareCore[];
  keys?: DynamoDBMatcherKeys;
}

export interface DynamoDBTypes {
  keys?: unknown;
  newImage?: unknown;
  oldImage?: unknown;
}

interface DynamoDBDefaults {
  keys: Record<string, unknown>;
  newImage: Record<string, unknown>;
  oldImage: Record<string, unknown>;
}

export interface DynamoDBInsertTypes {
  keys?: unknown;
  newImage?: unknown;
}

interface DynamoDBInsertDefaults {
  keys: Record<string, unknown>;
  newImage: Record<string, unknown>;
}

export interface DynamoDBRemoveTypes {
  keys?: unknown;
  oldImage?: unknown;
}

interface DynamoDBRemoveDefaults {
  keys: Record<string, unknown>;
  oldImage: Record<string, unknown>;
}

export interface DynamoDBFilterInputTypes {
  newImage?: unknown;
  oldImage?: unknown;
}

interface DynamoDBFilterInputDefaults {
  newImage: Record<string, unknown>;
  oldImage: Record<string, unknown>;
}

export type DynamoDBRequest<T extends TypeArgs<T, DynamoDBTypes> = object> = DynamoDBRequestCore<
  TypeArg<T, 'keys', DynamoDBDefaults>,
  TypeArg<T, 'newImage', DynamoDBDefaults>,
  TypeArg<T, 'oldImage', DynamoDBDefaults>
>;

export type DynamoDBMiddleware<T extends TypeArgs<T, DynamoDBTypes> = object> = DynamoDBMiddlewareCore<
  TypeArg<T, 'keys', DynamoDBDefaults>,
  TypeArg<T, 'newImage', DynamoDBDefaults>,
  TypeArg<T, 'oldImage', DynamoDBDefaults>
>;

export type DynamoDBRecordHandler<T extends TypeArgs<T, DynamoDBTypes> = object> = DynamoDBRecordHandlerCore<
  TypeArg<T, 'keys', DynamoDBDefaults>,
  TypeArg<T, 'newImage', DynamoDBDefaults>,
  TypeArg<T, 'oldImage', DynamoDBDefaults>
>;

export type DynamoDBRouteDefinition<T extends TypeArgs<T, DynamoDBTypes> = object> = DynamoDBRouteDefinitionCore<
  TypeArg<T, 'keys', DynamoDBDefaults>,
  TypeArg<T, 'newImage', DynamoDBDefaults>,
  TypeArg<T, 'oldImage', DynamoDBDefaults>
>;

export type DynamoDBModifyRequest<T extends TypeArgs<T, DynamoDBTypes> = object> = DynamoDBModifyRequestCore<
  TypeArg<T, 'keys', DynamoDBDefaults>,
  TypeArg<T, 'newImage', DynamoDBDefaults>,
  TypeArg<T, 'oldImage', DynamoDBDefaults>
>;

export type DynamoDBModifyRouteDefinition<T extends TypeArgs<T, DynamoDBTypes> = object> =
  DynamoDBModifyRouteDefinitionCore<
    TypeArg<T, 'keys', DynamoDBDefaults>,
    TypeArg<T, 'newImage', DynamoDBDefaults>,
    TypeArg<T, 'oldImage', DynamoDBDefaults>
  >;

export type DynamoDBInsertRequest<T extends TypeArgs<T, DynamoDBInsertTypes> = object> = DynamoDBInsertRequestCore<
  TypeArg<T, 'keys', DynamoDBInsertDefaults>,
  TypeArg<T, 'newImage', DynamoDBInsertDefaults>
>;

export type DynamoDBInsertRouteDefinition<T extends TypeArgs<T, DynamoDBInsertTypes> = object> =
  DynamoDBInsertRouteDefinitionCore<
    TypeArg<T, 'keys', DynamoDBInsertDefaults>,
    TypeArg<T, 'newImage', DynamoDBInsertDefaults>
  >;

export type DynamoDBRemoveRequest<T extends TypeArgs<T, DynamoDBRemoveTypes> = object> = DynamoDBRemoveRequestCore<
  TypeArg<T, 'keys', DynamoDBRemoveDefaults>,
  TypeArg<T, 'oldImage', DynamoDBRemoveDefaults>
>;

export type DynamoDBRemoveRouteDefinition<T extends TypeArgs<T, DynamoDBRemoveTypes> = object> =
  DynamoDBRemoveRouteDefinitionCore<
    TypeArg<T, 'keys', DynamoDBRemoveDefaults>,
    TypeArg<T, 'oldImage', DynamoDBRemoveDefaults>
  >;

export type DynamoDBFilterInput<T extends TypeArgs<T, DynamoDBFilterInputTypes> = object> = DynamoDBFilterInputCore<
  TypeArg<T, 'newImage', DynamoDBFilterInputDefaults>,
  TypeArg<T, 'oldImage', DynamoDBFilterInputDefaults>
>;
