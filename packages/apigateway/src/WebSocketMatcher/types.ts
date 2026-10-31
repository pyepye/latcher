import type {
  APIGatewayEventWebsocketRequestContextV2,
  APIGatewayProxyWebsocketEventV2WithRequestContext,
  Context,
} from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

export interface WebSocketEvent
  extends APIGatewayProxyWebsocketEventV2WithRequestContext<APIGatewayEventWebsocketRequestContextV2> {
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
}

export type WebSocketEventType = 'CONNECT' | 'MESSAGE' | 'DISCONNECT';

export interface WebSocketFilters {
  eventType?: WebSocketEventType;
  routeKey?: string;
  custom?: (input: WebSocketFilterInput) => boolean | Promise<boolean>;
}

export interface WebSocketFilterInput {
  eventType: WebSocketEventType;
  routeKey: string;
  body: unknown;
  event: WebSocketEvent;
}

export interface WebSocketBaseRequest {
  connectionId: string;
  domainName: string;
  stage: string;
  eventType: WebSocketEventType;
  routeKey: string;
  event: WebSocketEvent;
  context: Context;
}

// Each request pins its own eventType, so Extract<WebSocketRequest, { eventType }> narrows the union
// and a handler can discriminate on the field
export interface WebSocketConnectRequest extends WebSocketBaseRequest {
  eventType: 'CONNECT';
  queryStringParameters: Record<string, string> | undefined;
}

export interface WebSocketMessageRequestCore<TBody = unknown> extends WebSocketBaseRequest {
  eventType: 'MESSAGE';
  body: TBody;
}

export interface WebSocketDisconnectRequest extends WebSocketBaseRequest {
  eventType: 'DISCONNECT';
}

export type WebSocketRequestCore<TBody = unknown> =
  | WebSocketConnectRequest
  | WebSocketMessageRequestCore<TBody>
  | WebSocketDisconnectRequest;

// body and headers are never sent: the matcher hands Lambda a WebSocketResult, which is the status code
// alone. Typing them out is what stops an HTTP response helper being returned here
export type WebSocketConnectResponse = { statusCode: number; body?: never; headers?: never } | undefined;

export interface WebSocketResult {
  statusCode: number;
}

// A connect handler answers with a status code; message and disconnect handlers answer with nothing
export type WebSocketHandlerCore<TBody = unknown> = (
  request: WebSocketRequestCore<TBody>,
) => Promise<WebSocketConnectResponse> | Promise<void>;

export type WebSocketMiddlewareCore<TBody = unknown> = MiddlewareCore<
  WebSocketRequestCore<TBody>,
  WebSocketConnectResponse
>;

export interface WebSocketConnectRouteDefinition {
  filters?: Omit<WebSocketFilters, 'eventType'>;
  middleware?: WebSocketMiddlewareCore[];
  handler: (request: WebSocketConnectRequest) => Promise<WebSocketConnectResponse>;
}

export interface WebSocketMessageRouteDefinitionCore<TBody = unknown> {
  filters?: Omit<WebSocketFilters, 'eventType'>;
  bodySchema?: StandardSchemaV1<unknown, TBody>;
  middleware?: WebSocketMiddlewareCore<TBody>[];
  handler: (request: WebSocketMessageRequestCore<TBody>) => Promise<void>;
}

export interface WebSocketDisconnectRouteDefinition {
  filters?: Omit<WebSocketFilters, 'eventType'>;
  middleware?: WebSocketMiddlewareCore[];
  handler: (request: WebSocketDisconnectRequest) => Promise<void>;
}

export interface WebSocketRouteDefinitionCore<TBody = unknown> {
  filters: WebSocketFilters;
  bodySchema?: StandardSchemaV1<unknown, TBody>;
  middleware?: WebSocketMiddlewareCore<TBody>[];
  handler: WebSocketHandlerCore<TBody>;
}

export interface WebSocketTypes {
  body?: unknown;
}

interface WebSocketDefaults {
  body: unknown;
}

export type WebSocketRequest<T extends TypeArgs<T, WebSocketTypes> = object> = WebSocketRequestCore<
  TypeArg<T, 'body', WebSocketDefaults>
>;

export type WebSocketMessageRequest<T extends TypeArgs<T, WebSocketTypes> = object> = WebSocketMessageRequestCore<
  TypeArg<T, 'body', WebSocketDefaults>
>;

export type WebSocketHandler<T extends TypeArgs<T, WebSocketTypes> = object> = WebSocketHandlerCore<
  TypeArg<T, 'body', WebSocketDefaults>
>;

export type WebSocketMiddleware<T extends TypeArgs<T, WebSocketTypes> = object> = WebSocketMiddlewareCore<
  TypeArg<T, 'body', WebSocketDefaults>
>;

export type WebSocketMessageRouteDefinition<T extends TypeArgs<T, WebSocketTypes> = object> =
  WebSocketMessageRouteDefinitionCore<TypeArg<T, 'body', WebSocketDefaults>>;

export type WebSocketRouteDefinition<T extends TypeArgs<T, WebSocketTypes> = object> = WebSocketRouteDefinitionCore<
  TypeArg<T, 'body', WebSocketDefaults>
>;
