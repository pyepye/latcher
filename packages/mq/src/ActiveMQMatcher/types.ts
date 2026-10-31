import type { Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

// --- AWS Event Types (not in @types/aws-lambda) ---

export type ActiveMQMessageType = 'jms/text-message' | 'jms/bytes-message';

export interface ActiveMQDestination {
  physicalName: string;
}

// Amazon MQ leaves a field out rather than sending it empty. `properties` is absent unless the message
// carries JMS properties, and `correlationID` and `type` are absent unless the sender sets them.
export interface ActiveMQMessage {
  messageID: string;
  messageType: ActiveMQMessageType;
  timestamp: number;
  deliveryMode: number;
  correlationID?: string;
  replyTo: string | null;
  destination: ActiveMQDestination;
  redelivered: boolean;
  type?: string;
  expiration: number;
  priority: number;
  data: string;
  brokerInTime: number;
  brokerOutTime: number;
  properties?: Record<string, unknown>;
}

export interface ActiveMQDecodedMessage extends ActiveMQMessage {
  properties: Record<string, unknown>;
}

export interface ActiveMQEvent {
  eventSource: 'aws:mq';
  eventSourceArn: string;
  messages: ActiveMQMessage[];
}

// --- Request Types ---

interface ActiveMQRequestBase {
  message: ActiveMQDecodedMessage;
  destination: string;
  record: ActiveMQMessage;
  context: Context;
}

export interface ActiveMQTextMessageRequestCore<TBody = unknown> extends ActiveMQRequestBase {
  messageType: 'jms/text-message';
  body: TBody;
}

// A bytes message carries binary, so its body is the raw bytes decoded from base64.
export interface ActiveMQBytesMessageRequest extends ActiveMQRequestBase {
  messageType: 'jms/bytes-message';
  body: Buffer;
}

export type ActiveMQRequestCore<TBody = unknown> = ActiveMQTextMessageRequestCore<TBody> | ActiveMQBytesMessageRequest;

// --- Filter Types ---

export interface ActiveMQFilterInput {
  messageType: ActiveMQMessageType;
  destination: string;
  message: ActiveMQDecodedMessage;
  record: ActiveMQMessage;
}

export interface ActiveMQFilters {
  eventSourceArn?: FilterStringMatcher;
  destination?: FilterStringMatcher;
  messageType?: ActiveMQMessageType | ActiveMQMessageType[];
  custom?: (input: ActiveMQFilterInput) => boolean | Promise<boolean>;
}

// --- Handler Types ---

// Takes the same message type parameter as a route, so a middleware on a pinned route sees that
// route's request rather than the union of both.
export type ActiveMQMiddlewareCore<
  TBody = unknown,
  TMessageType extends ActiveMQMessageType | undefined = undefined,
> = MiddlewareCore<MessageTypeToRequest<TMessageType, TBody>, void>;

// --- Route Definition Types ---

// The handler request narrows from the `messageType` filter: a route with no `messageType` takes the
// union, and a route pinned to one type takes that one, so a handler cannot claim a type the route did
// not filter for. A bytes route's body is a Buffer; `defineActiveMQRoute` rejects a bodySchema on one.
export interface ActiveMQRouteDefinitionCore<
  TBody = unknown,
  TMessageType extends ActiveMQMessageType | undefined = undefined,
> {
  filters: Omit<ActiveMQFilters, 'messageType'> & {
    messageType?: TMessageType | TMessageType[];
  };
  bodySchema?: StandardSchemaV1<unknown, TBody>;
  middleware?: ActiveMQMiddlewareCore<NoInfer<TBody>, TMessageType>[];
  handler: (request: MessageTypeToRequest<TMessageType, TBody>) => Promise<void>;
}

export interface ActiveMQTextMessageRouteDefinitionCore<TBody = unknown> {
  filters: Omit<ActiveMQFilters, 'messageType'>;
  bodySchema?: StandardSchemaV1<unknown, TBody>;
  middleware?: ActiveMQMiddlewareCore<NoInfer<TBody>, 'jms/text-message'>[];
  handler: (request: ActiveMQTextMessageRequestCore<TBody>) => Promise<void>;
}

// A bytes message body is a Buffer, so there is no JSON to validate and no bodySchema.
export interface ActiveMQBytesMessageRouteDefinition {
  filters: Omit<ActiveMQFilters, 'messageType'>;
  middleware?: ActiveMQMiddlewareCore<unknown, 'jms/bytes-message'>[];
  handler: (request: ActiveMQBytesMessageRequest) => Promise<void>;
}

// --- Internal Route Type ---

export interface ActiveMQInternalRoute {
  filters: ActiveMQFilters;
  bodySchema?: StandardSchemaV1;
  middleware?: ActiveMQMiddlewareCore[];
  handler: (request: ActiveMQRequestCore) => Promise<void>;
}

// --- Route Builder Types ---

type MessageTypeToRequest<
  TMessageType extends ActiveMQMessageType | undefined,
  TBody,
> = TMessageType extends 'jms/text-message'
  ? ActiveMQTextMessageRequestCore<TBody>
  : TMessageType extends 'jms/bytes-message'
    ? ActiveMQBytesMessageRequest
    : ActiveMQRequestCore<TBody>;

export type ActiveMQRouteInput<TBody = unknown, TMessageType extends ActiveMQMessageType | undefined = undefined> = {
  filters: Omit<ActiveMQFilters, 'messageType'> & {
    messageType?: TMessageType | TMessageType[];
  };
  middleware?: ActiveMQMiddlewareCore<NoInfer<TBody>, TMessageType>[];
} & ([TMessageType] extends ['jms/bytes-message']
  ? { bodySchema?: never }
  : { bodySchema?: StandardSchemaV1<unknown, TBody> });

export interface ActiveMQRouteBuilder<TBody, TMessageType extends ActiveMQMessageType | undefined> {
  handle(
    handler: (request: MessageTypeToRequest<TMessageType, TBody>) => Promise<void>,
  ): ActiveMQRouteDefinitionCore<TBody, TMessageType>;
}

export interface ActiveMQMatcherOptions {
  middleware?: ActiveMQMiddlewareCore[];
}

export type ActiveMQResponse = undefined;

export interface ActiveMQTypes {
  body?: unknown;
}

interface ActiveMQDefaults {
  body: unknown;
}

export interface ActiveMQRouteTypes {
  body?: unknown;
  messageType?: ActiveMQMessageType | undefined;
}

interface ActiveMQRouteDefaults {
  body: unknown;
  messageType: undefined;
}

export type ActiveMQRequest<T extends TypeArgs<T, ActiveMQTypes> = object> = ActiveMQRequestCore<
  TypeArg<T, 'body', ActiveMQDefaults>
>;

export type ActiveMQTextMessageRequest<T extends TypeArgs<T, ActiveMQTypes> = object> = ActiveMQTextMessageRequestCore<
  TypeArg<T, 'body', ActiveMQDefaults>
>;

export type ActiveMQTextMessageRouteDefinition<T extends TypeArgs<T, ActiveMQTypes> = object> =
  ActiveMQTextMessageRouteDefinitionCore<TypeArg<T, 'body', ActiveMQDefaults>>;

export type ActiveMQMiddleware<T extends TypeArgs<T, ActiveMQRouteTypes> = object> = ActiveMQMiddlewareCore<
  TypeArg<T, 'body', ActiveMQRouteDefaults>,
  Extract<TypeArg<T, 'messageType', ActiveMQRouteDefaults>, ActiveMQMessageType | undefined>
>;

export type ActiveMQRouteDefinition<T extends TypeArgs<T, ActiveMQRouteTypes> = object> = ActiveMQRouteDefinitionCore<
  TypeArg<T, 'body', ActiveMQRouteDefaults>,
  Extract<TypeArg<T, 'messageType', ActiveMQRouteDefaults>, ActiveMQMessageType | undefined>
>;
