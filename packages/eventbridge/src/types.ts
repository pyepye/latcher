import type {
  Context,
  S3ObjectCreatedNotificationEventDetail,
  S3ObjectDeletedNotificationEventDetail,
  S3ObjectRestoreCompletedNotificationEventDetail,
  S3ObjectRestoreInitiatedNotificationEventDetail,
} from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

// =============================================================================
// Known AWS Event Detail Types
// =============================================================================

export interface EC2StateChangeDetail {
  'instance-id': string;
  state: 'pending' | 'running' | 'stopping' | 'stopped' | 'shutting-down' | 'terminated';
}

// Scheduled events from EventBridge Rules have an empty detail
export type ScheduledEventDetail = Record<string, never>;

// TODO: Should we type all these? Type the services? Type any in aws-lambda?
// Type map: source -> detailType -> detail type
// Users can extend this via module augmentation for custom events
export interface EventBridgeDetailTypeMap {
  'aws.ec2': {
    'EC2 Instance State-change Notification': EC2StateChangeDetail;
  };
  'aws.s3': {
    'Object Created': S3ObjectCreatedNotificationEventDetail;
    'Object Deleted': S3ObjectDeletedNotificationEventDetail;
    'Object Restore Initiated': S3ObjectRestoreInitiatedNotificationEventDetail;
    'Object Restore Completed': S3ObjectRestoreCompletedNotificationEventDetail;
  };
  'aws.events': {
    'Scheduled Event': ScheduledEventDetail;
  };
}

// Normalize bare strings to single-element tuples so LookupDetailType can
// destructure either form uniformly. An absent filter gives an empty tuple, which LookupDetailType
// falls through to unknown.
type NormalizeToTuple<T> = T extends readonly string[] ? T : T extends string ? readonly [T] : readonly [];

// Lookup detail type from source and detailType
// Returns unknown if not found in the map
export type LookupDetailType<
  TSources extends string | readonly string[] | undefined,
  TDetailTypes extends string | readonly string[] | undefined,
> =
  NormalizeToTuple<TSources> extends readonly [infer Source extends keyof EventBridgeDetailTypeMap]
    ? NormalizeToTuple<TDetailTypes> extends readonly [infer DetailType extends keyof EventBridgeDetailTypeMap[Source]]
      ? EventBridgeDetailTypeMap[Source][DetailType]
      : unknown
    : unknown;

// =============================================================================
// Event Types
// =============================================================================

export interface EventBridgeEventEnvelopeCore<TDetail = unknown> {
  version: string;
  id: string;
  source: string;
  'detail-type': string;
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: TDetail;
}

export interface EventBridgeRequestCore<TDetail = unknown> {
  source: string;
  detailType: string;
  detail: TDetail;
  account: string;
  region: string;
  time: string;
  resources: string[];
  id: string;
  event: EventBridgeEventEnvelopeCore<TDetail>;
  context: Context;
}

export type EventBridgeMiddlewareCore<TDetail = unknown> = MiddlewareCore<EventBridgeRequestCore<TDetail>, void>;

export type EventBridgeHandlerCore<TDetail = unknown> = (request: EventBridgeRequestCore<TDetail>) => Promise<void>;

export interface EventBridgeFilterInput {
  event: unknown;
  source: string;
  detailType: string;
  detail: unknown;
}

export interface EventBridgeFilters {
  source?: FilterStringMatcher;
  detailType?: FilterStringMatcher;
  account?: FilterStringMatcher;
  region?: FilterStringMatcher;
  resource?: FilterStringMatcher;
  custom?: (input: EventBridgeFilterInput) => boolean | Promise<boolean>;
}

export interface EventBridgeRouteDefinitionCore<TDetail = unknown> {
  filters: EventBridgeFilters;
  detailSchema?: StandardSchemaV1<unknown, TDetail>;
  middleware?: EventBridgeMiddlewareCore<NoInfer<TDetail>>[];
  handler: EventBridgeHandlerCore<TDetail>;
}

export interface EventBridgeMatcherOptions {
  middleware?: EventBridgeMiddlewareCore[];
}

export interface EventBridgeTypes {
  detail?: unknown;
}

interface EventBridgeDefaults {
  detail: unknown;
}

export type EventBridgeEventEnvelope<T extends TypeArgs<T, EventBridgeTypes> = object> = EventBridgeEventEnvelopeCore<
  TypeArg<T, 'detail', EventBridgeDefaults>
>;

export type EventBridgeRequest<T extends TypeArgs<T, EventBridgeTypes> = object> = EventBridgeRequestCore<
  TypeArg<T, 'detail', EventBridgeDefaults>
>;

export type EventBridgeMiddleware<T extends TypeArgs<T, EventBridgeTypes> = object> = EventBridgeMiddlewareCore<
  TypeArg<T, 'detail', EventBridgeDefaults>
>;

export type EventBridgeHandler<T extends TypeArgs<T, EventBridgeTypes> = object> = EventBridgeHandlerCore<
  TypeArg<T, 'detail', EventBridgeDefaults>
>;

export type EventBridgeRouteDefinition<T extends TypeArgs<T, EventBridgeTypes> = object> =
  EventBridgeRouteDefinitionCore<TypeArg<T, 'detail', EventBridgeDefaults>>;
