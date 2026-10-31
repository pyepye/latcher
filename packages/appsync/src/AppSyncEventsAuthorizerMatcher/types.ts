import type { Context } from 'aws-lambda';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

export type AppSyncEventsAuthorizerOperation = 'EVENT_CONNECT' | 'EVENT_PUBLISH' | 'EVENT_SUBSCRIBE';

export interface AppSyncEventsAuthorizerEvent {
  authorizationToken: string;
  requestContext: {
    apiId: string;
    accountId: string;
    requestId: string;
    operation: AppSyncEventsAuthorizerOperation;
    // Both are left off an EVENT_CONNECT: the client names no channel until it publishes or
    // subscribes. AppSync documents them as null, and sends an event without the keys.
    channelNamespaceName?: string;
    channel?: string;
  };
  requestHeaders: Record<string, string | undefined>;
}

export interface AppSyncEventsAuthorizerBaseRequest {
  authorizationToken: string;
  requestHeaders: Record<string, string | undefined>;
  apiId: string;
  accountId: string;
  requestId: string;
  operation: AppSyncEventsAuthorizerOperation;
  event: AppSyncEventsAuthorizerEvent;
  context: Context;
}

// A connect names no channel, so there is nothing to add.
export type AppSyncEventsAuthorizerConnectRequest = AppSyncEventsAuthorizerBaseRequest;

export interface AppSyncEventsAuthorizerChannelRequest extends AppSyncEventsAuthorizerBaseRequest {
  channelPath: string;
  channelNamespace: string;
}

// What a route with hand-written filters receives, since those filters may take either operation.
export interface AppSyncEventsAuthorizerRequest extends AppSyncEventsAuthorizerBaseRequest {
  channelPath?: string;
  channelNamespace?: string;
}

// An Event API reads `handlerContext` and nothing else. `resolverContext` and `deniedFields` belong
// to a GraphQL API and are dropped without an error.
export interface AppSyncEventsAuthorizerResponse {
  isAuthorized: boolean;
  handlerContext?: Record<string, unknown>;
  ttlOverride?: number;
}

export interface AppSyncEventsAuthorizerFilterInput {
  operation: AppSyncEventsAuthorizerOperation;
  channelPath: string | undefined;
  channelNamespace: string | undefined;
  event: AppSyncEventsAuthorizerEvent;
}

export interface AppSyncEventsAuthorizerFilters {
  operation?: AppSyncEventsAuthorizerOperation | AppSyncEventsAuthorizerOperation[];
  channelPath?: FilterStringMatcher;
  channelNamespace?: FilterStringMatcher;
  custom?: (input: AppSyncEventsAuthorizerFilterInput) => boolean | Promise<boolean>;
}

export type AppSyncEventsAuthorizerMiddlewareCore<TRequest = AppSyncEventsAuthorizerRequest> = MiddlewareCore<
  TRequest,
  AppSyncEventsAuthorizerResponse
>;

export type AppSyncEventsAuthorizerHandlerCore<TRequest = AppSyncEventsAuthorizerRequest> = (
  request: TRequest,
) => Promise<AppSyncEventsAuthorizerResponse>;

export interface AppSyncEventsAuthorizerRouteDefinition {
  filters?: AppSyncEventsAuthorizerFilters;
  middleware?: AppSyncEventsAuthorizerMiddlewareCore[];
  handler: AppSyncEventsAuthorizerHandlerCore;
}

export type AppSyncEventsAuthorizerChannelFilters = Pick<AppSyncEventsAuthorizerFilters, 'custom'>;

export interface AppSyncEventsAuthorizerChannelInput {
  channelPath: FilterStringMatcher;
  filters?: AppSyncEventsAuthorizerChannelFilters;
  middleware?: AppSyncEventsAuthorizerMiddlewareCore<AppSyncEventsAuthorizerChannelRequest>[];
  handler: AppSyncEventsAuthorizerHandlerCore<AppSyncEventsAuthorizerChannelRequest>;
}

export interface AppSyncEventsAuthorizerConnectInput {
  filters?: AppSyncEventsAuthorizerChannelFilters;
  middleware?: AppSyncEventsAuthorizerMiddlewareCore<AppSyncEventsAuthorizerConnectRequest>[];
  handler: AppSyncEventsAuthorizerHandlerCore<AppSyncEventsAuthorizerConnectRequest>;
}

export interface AppSyncEventsAuthorizerRouteInputCore<
  TOperation extends AppSyncEventsAuthorizerFilters['operation'] = AppSyncEventsAuthorizerFilters['operation'],
> {
  filters?: Omit<AppSyncEventsAuthorizerFilters, 'operation'> & { operation?: TOperation };
  middleware?: AppSyncEventsAuthorizerMiddlewareCore<InferAuthorizerRequest<TOperation>>[];
}

export interface AppSyncEventsAuthorizerMatcherOptions {
  middleware?: AppSyncEventsAuthorizerMiddlewareCore[];
}

export interface AppSyncEventsAuthorizerRouteBuilder<TRequest = AppSyncEventsAuthorizerRequest> {
  handle(handler: AppSyncEventsAuthorizerHandlerCore<TRequest>): AppSyncEventsAuthorizerRouteDefinition;
}

// The operation filter says which shape of request the route can receive, the way the `type` filter
// does on the API Gateway authorizer.
type OperationsOf<T> = T extends readonly (infer TItem)[] ? TItem : T;

export type InferAuthorizerRequest<TOperation> = [OperationsOf<TOperation>] extends ['EVENT_CONNECT']
  ? AppSyncEventsAuthorizerConnectRequest
  : [OperationsOf<TOperation>] extends ['EVENT_PUBLISH' | 'EVENT_SUBSCRIBE']
    ? AppSyncEventsAuthorizerChannelRequest
    : AppSyncEventsAuthorizerRequest;

export interface InternalEventsAuthorizerRoute {
  filters: AppSyncEventsAuthorizerFilters;
  middleware?: AppSyncEventsAuthorizerMiddlewareCore[];
  handler: AppSyncEventsAuthorizerHandlerCore;
}

// ─── Named Type Arguments ────────────────────────────────────────────────────

export interface AppSyncEventsAuthorizerTypes {
  request?: unknown;
}

interface AppSyncEventsAuthorizerDefaults {
  request: AppSyncEventsAuthorizerRequest;
}

export type AppSyncEventsAuthorizerMiddleware<T extends TypeArgs<T, AppSyncEventsAuthorizerTypes> = object> =
  AppSyncEventsAuthorizerMiddlewareCore<TypeArg<T, 'request', AppSyncEventsAuthorizerDefaults>>;

export type AppSyncEventsAuthorizerHandler<T extends TypeArgs<T, AppSyncEventsAuthorizerTypes> = object> =
  AppSyncEventsAuthorizerHandlerCore<TypeArg<T, 'request', AppSyncEventsAuthorizerDefaults>>;

export interface AppSyncEventsAuthorizerRouteInputTypes {
  operation?: AppSyncEventsAuthorizerFilters['operation'];
}

interface AppSyncEventsAuthorizerRouteInputDefaults {
  operation: AppSyncEventsAuthorizerFilters['operation'];
}

export type AppSyncEventsAuthorizerRouteInput<T extends TypeArgs<T, AppSyncEventsAuthorizerRouteInputTypes> = object> =
  AppSyncEventsAuthorizerRouteInputCore<
    Extract<
      TypeArg<T, 'operation', AppSyncEventsAuthorizerRouteInputDefaults>,
      AppSyncEventsAuthorizerFilters['operation']
    >
  >;
