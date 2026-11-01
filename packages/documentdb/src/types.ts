import type { Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

// packages/testing/src/documentdb.ts has a copy of DocumentDBOperationType, DocumentDBUpdateDescription,
// DocumentDBChangeEvent, DocumentDBEventEntry and DocumentDBEvent. Change both together.

// DocumentDB operation types (lowercase, unlike DynamoDB's uppercase)
export type DocumentDBOperationType = 'insert' | 'update' | 'replace' | 'delete';

export type DocumentDBFullDocumentOption = 'default' | 'updateLookup' | 'whenAvailable' | 'required';
export type DocumentDBFullDocumentBeforeChangeOption = 'off' | 'whenAvailable' | 'required';

export interface DocumentDBUpdateDescription {
  updatedFields?: Record<string, unknown>;
  removedFields?: string[];
}

export interface DocumentDBChangeEvent {
  _id: unknown;
  clusterTime: unknown;
  operationType: DocumentDBOperationType;
  ns: { db: string; coll: string };
  documentKey: unknown;
  fullDocument?: unknown;
  updateDescription?: DocumentDBUpdateDescription;
  fullDocumentBeforeChange?: unknown;
}

export interface DocumentDBEventEntry {
  event: DocumentDBChangeEvent;
}

export interface DocumentDBEvent {
  eventSourceArn: string;
  eventSource: 'aws:docdb';
  events: DocumentDBEventEntry[];
}

// Request types - one per operation, with type-level field availability

interface DocumentDBRequestBase<TDocumentKey = Record<string, unknown>> {
  documentKey: TDocumentKey;
  changeEvent: DocumentDBChangeEvent;
  entry: DocumentDBEventEntry;
  context: Context;
}

export interface DocumentDBInsertRequestCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
> extends DocumentDBRequestBase<TDocumentKey> {
  operationType: 'insert';
  fullDocument: TFullDocument;
  updateDescription?: undefined;
  fullDocumentBeforeChange?: undefined;
}

export interface DocumentDBUpdateRequestCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> extends DocumentDBRequestBase<TDocumentKey> {
  operationType: 'update';
  fullDocument?: TFullDocument;
  updateDescription: DocumentDBUpdateDescription;
  fullDocumentBeforeChange?: TFullDocumentBeforeChange;
}

export interface DocumentDBReplaceRequestCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> extends DocumentDBRequestBase<TDocumentKey> {
  operationType: 'replace';
  fullDocument: TFullDocument;
  updateDescription?: undefined;
  fullDocumentBeforeChange?: TFullDocumentBeforeChange;
}

export interface DocumentDBDeleteRequestCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> extends DocumentDBRequestBase<TDocumentKey> {
  operationType: 'delete';
  fullDocument?: undefined;
  updateDescription?: undefined;
  fullDocumentBeforeChange?: TFullDocumentBeforeChange;
}

export type DocumentDBRequestCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> =
  | DocumentDBInsertRequestCore<TDocumentKey, TFullDocument>
  | DocumentDBUpdateRequestCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>
  | DocumentDBReplaceRequestCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>
  | DocumentDBDeleteRequestCore<TDocumentKey, TFullDocumentBeforeChange>;

export type DocumentDBResponse = undefined;

export type DocumentDBMiddlewareCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> = MiddlewareCore<DocumentDBRequestCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>, void>;

// Takes the whole union, so a handler written for one operationType will not assign to a route whose
// filters can deliver another. Narrow on request.operationType inside the handler
export type DocumentDBRecordHandlerCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> = (request: DocumentDBRequestCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>) => Promise<void>;

// Filter types

export interface DocumentDBFilterInput {
  operationType: DocumentDBOperationType;
  ns: { db: string; coll: string };
  event: DocumentDBChangeEvent;
}

export interface DocumentDBFilters {
  operationType?: DocumentDBOperationType | readonly DocumentDBOperationType[];
  eventSourceArn?: FilterStringMatcher;
  database?: FilterStringMatcher;
  collection?: FilterStringMatcher;
  fullDocument?: DocumentDBFullDocumentOption | readonly DocumentDBFullDocumentOption[];
  fullDocumentBeforeChange?:
    | DocumentDBFullDocumentBeforeChangeOption
    | readonly DocumentDBFullDocumentBeforeChangeOption[];
  custom?: (input: DocumentDBFilterInput) => boolean | Promise<boolean>;
}

// Route definition types - one per operation + generic

export interface DocumentDBInsertRouteDefinitionCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
> {
  filters: Omit<DocumentDBFilters, 'operationType'>;
  documentKeySchema?: StandardSchemaV1<unknown, TDocumentKey>;
  fullDocumentSchema?: StandardSchemaV1<unknown, TFullDocument>;
  middleware?: DocumentDBMiddlewareCore<TDocumentKey, TFullDocument>[];
  handler: (request: DocumentDBInsertRequestCore<TDocumentKey, TFullDocument>) => Promise<void>;
}

export interface DocumentDBUpdateRouteDefinitionCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> {
  filters: Omit<DocumentDBFilters, 'operationType'>;
  documentKeySchema?: StandardSchemaV1<unknown, TDocumentKey>;
  fullDocumentSchema?: StandardSchemaV1<unknown, TFullDocument>;
  fullDocumentBeforeChangeSchema?: StandardSchemaV1<unknown, TFullDocumentBeforeChange>;
  middleware?: DocumentDBMiddlewareCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>[];
  handler: (
    request: DocumentDBUpdateRequestCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>,
  ) => Promise<void>;
}

export interface DocumentDBReplaceRouteDefinitionCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> {
  filters: Omit<DocumentDBFilters, 'operationType'>;
  documentKeySchema?: StandardSchemaV1<unknown, TDocumentKey>;
  fullDocumentSchema?: StandardSchemaV1<unknown, TFullDocument>;
  fullDocumentBeforeChangeSchema?: StandardSchemaV1<unknown, TFullDocumentBeforeChange>;
  middleware?: DocumentDBMiddlewareCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>[];
  handler: (
    request: DocumentDBReplaceRequestCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>,
  ) => Promise<void>;
}

export interface DocumentDBDeleteRouteDefinitionCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> {
  filters: Omit<DocumentDBFilters, 'operationType'>;
  documentKeySchema?: StandardSchemaV1<unknown, TDocumentKey>;
  fullDocumentBeforeChangeSchema?: StandardSchemaV1<unknown, TFullDocumentBeforeChange>;
  middleware?: DocumentDBMiddlewareCore<TDocumentKey, Record<string, unknown>, TFullDocumentBeforeChange>[];
  handler: (request: DocumentDBDeleteRequestCore<TDocumentKey, TFullDocumentBeforeChange>) => Promise<void>;
}

export interface DocumentDBRouteDefinitionCore<
  TDocumentKey = Record<string, unknown>,
  TFullDocument = Record<string, unknown>,
  TFullDocumentBeforeChange = Record<string, unknown>,
> {
  filters: DocumentDBFilters;
  documentKeySchema?: StandardSchemaV1<unknown, TDocumentKey>;
  fullDocumentSchema?: StandardSchemaV1<unknown, TFullDocument>;
  fullDocumentBeforeChangeSchema?: StandardSchemaV1<unknown, TFullDocumentBeforeChange>;
  middleware?: DocumentDBMiddlewareCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>[];
  handler: DocumentDBRecordHandlerCore<TDocumentKey, TFullDocument, TFullDocumentBeforeChange>;
}

export interface DocumentDBMatcherOptions {
  middleware?: DocumentDBMiddlewareCore[];
}

export interface DocumentDBTypes {
  documentKey?: unknown;
  fullDocument?: unknown;
  fullDocumentBeforeChange?: unknown;
}

interface DocumentDBDefaults {
  documentKey: Record<string, unknown>;
  fullDocument: Record<string, unknown>;
  fullDocumentBeforeChange: Record<string, unknown>;
}

export interface DocumentDBInsertTypes {
  documentKey?: unknown;
  fullDocument?: unknown;
}

interface DocumentDBInsertDefaults {
  documentKey: Record<string, unknown>;
  fullDocument: Record<string, unknown>;
}

export interface DocumentDBDeleteTypes {
  documentKey?: unknown;
  fullDocumentBeforeChange?: unknown;
}

interface DocumentDBDeleteDefaults {
  documentKey: Record<string, unknown>;
  fullDocumentBeforeChange: Record<string, unknown>;
}

export type DocumentDBRequest<T extends TypeArgs<T, DocumentDBTypes> = object> = DocumentDBRequestCore<
  TypeArg<T, 'documentKey', DocumentDBDefaults>,
  TypeArg<T, 'fullDocument', DocumentDBDefaults>,
  TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDefaults>
>;

export type DocumentDBMiddleware<T extends TypeArgs<T, DocumentDBTypes> = object> = DocumentDBMiddlewareCore<
  TypeArg<T, 'documentKey', DocumentDBDefaults>,
  TypeArg<T, 'fullDocument', DocumentDBDefaults>,
  TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDefaults>
>;

export type DocumentDBRecordHandler<T extends TypeArgs<T, DocumentDBTypes> = object> = DocumentDBRecordHandlerCore<
  TypeArg<T, 'documentKey', DocumentDBDefaults>,
  TypeArg<T, 'fullDocument', DocumentDBDefaults>,
  TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDefaults>
>;

export type DocumentDBRouteDefinition<T extends TypeArgs<T, DocumentDBTypes> = object> = DocumentDBRouteDefinitionCore<
  TypeArg<T, 'documentKey', DocumentDBDefaults>,
  TypeArg<T, 'fullDocument', DocumentDBDefaults>,
  TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDefaults>
>;

export type DocumentDBUpdateRequest<T extends TypeArgs<T, DocumentDBTypes> = object> = DocumentDBUpdateRequestCore<
  TypeArg<T, 'documentKey', DocumentDBDefaults>,
  TypeArg<T, 'fullDocument', DocumentDBDefaults>,
  TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDefaults>
>;

export type DocumentDBUpdateRouteDefinition<T extends TypeArgs<T, DocumentDBTypes> = object> =
  DocumentDBUpdateRouteDefinitionCore<
    TypeArg<T, 'documentKey', DocumentDBDefaults>,
    TypeArg<T, 'fullDocument', DocumentDBDefaults>,
    TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDefaults>
  >;

export type DocumentDBReplaceRequest<T extends TypeArgs<T, DocumentDBTypes> = object> = DocumentDBReplaceRequestCore<
  TypeArg<T, 'documentKey', DocumentDBDefaults>,
  TypeArg<T, 'fullDocument', DocumentDBDefaults>,
  TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDefaults>
>;

export type DocumentDBReplaceRouteDefinition<T extends TypeArgs<T, DocumentDBTypes> = object> =
  DocumentDBReplaceRouteDefinitionCore<
    TypeArg<T, 'documentKey', DocumentDBDefaults>,
    TypeArg<T, 'fullDocument', DocumentDBDefaults>,
    TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDefaults>
  >;

export type DocumentDBInsertRequest<T extends TypeArgs<T, DocumentDBInsertTypes> = object> =
  DocumentDBInsertRequestCore<
    TypeArg<T, 'documentKey', DocumentDBInsertDefaults>,
    TypeArg<T, 'fullDocument', DocumentDBInsertDefaults>
  >;

export type DocumentDBInsertRouteDefinition<T extends TypeArgs<T, DocumentDBInsertTypes> = object> =
  DocumentDBInsertRouteDefinitionCore<
    TypeArg<T, 'documentKey', DocumentDBInsertDefaults>,
    TypeArg<T, 'fullDocument', DocumentDBInsertDefaults>
  >;

export type DocumentDBDeleteRequest<T extends TypeArgs<T, DocumentDBDeleteTypes> = object> =
  DocumentDBDeleteRequestCore<
    TypeArg<T, 'documentKey', DocumentDBDeleteDefaults>,
    TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDeleteDefaults>
  >;

export type DocumentDBDeleteRouteDefinition<T extends TypeArgs<T, DocumentDBDeleteTypes> = object> =
  DocumentDBDeleteRouteDefinitionCore<
    TypeArg<T, 'documentKey', DocumentDBDeleteDefaults>,
    TypeArg<T, 'fullDocumentBeforeChange', DocumentDBDeleteDefaults>
  >;
