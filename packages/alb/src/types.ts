import type { ALBEvent } from 'aws-lambda';

import type { TypeArg, TypeArgs } from '@latcher/base';
import type {
  AnyHttpMethod,
  AnyResponseKind,
  ApiHandlerCore,
  ApiRequestCore,
  HTTPFilterInputCore,
  HTTPFiltersCore,
  HTTPMiddlewareCore,
  JsonBody,
  PathParams,
  RouteDefinitionCore,
} from '@latcher/http';

export interface ApiRequestTypes {
  path?: unknown;
  query?: unknown;
  auth?: undefined;
  body?: unknown;
  event?: unknown;
}

interface ApiRequestDefaults {
  path: Record<string, string>;
  query: Record<string, string | undefined>;
  auth: undefined;
  body: unknown;
  event: ALBEvent;
}

export interface ApiHandlerTypes extends ApiRequestTypes {
  response?: unknown;
}

interface ApiHandlerDefaults extends ApiRequestDefaults {
  response: JsonBody;
}

interface HTTPMiddlewareDefaults {
  path: Record<string, string>;
  query: Record<string, unknown>;
  auth: undefined;
  body: unknown;
  response: AnyResponseKind;
  event: ALBEvent;
}

export interface HTTPFiltersTypes {
  pathPattern?: string;
  method?: AnyHttpMethod;
  auth?: unknown;
  event?: unknown;
}

interface HTTPFiltersDefaults {
  pathPattern: string;
  method: AnyHttpMethod;
  auth: undefined;
  event: ALBEvent;
}

export interface HTTPFilterInputTypes {
  event?: unknown;
  auth?: unknown;
}

interface HTTPFilterInputDefaults {
  event: ALBEvent;
  auth: undefined;
}

export interface RouteDefinitionTypes {
  pathPattern?: string;
  path?: unknown;
  query?: unknown;
  auth?: undefined;
  body?: unknown;
  response?: unknown;
  method?: AnyHttpMethod;
  event?: unknown;
}

interface RouteDefinitionDefaults {
  pathPattern: string;
  query: Record<string, string | undefined>;
  auth: undefined;
  body: unknown;
  response: JsonBody;
  method: AnyHttpMethod;
  event: ALBEvent;
}

export type ApiRequest<T extends TypeArgs<T, ApiRequestTypes> = object> = ApiRequestCore<
  TypeArg<T, 'path', ApiRequestDefaults>,
  TypeArg<T, 'query', ApiRequestDefaults>,
  Extract<TypeArg<T, 'auth', ApiRequestDefaults>, undefined>,
  TypeArg<T, 'body', ApiRequestDefaults>,
  TypeArg<T, 'event', ApiRequestDefaults>
>;

export type ApiHandler<T extends TypeArgs<T, ApiHandlerTypes> = object> = ApiHandlerCore<
  TypeArg<T, 'path', ApiHandlerDefaults>,
  TypeArg<T, 'query', ApiHandlerDefaults>,
  Extract<TypeArg<T, 'auth', ApiHandlerDefaults>, undefined>,
  TypeArg<T, 'body', ApiHandlerDefaults>,
  TypeArg<T, 'response', ApiHandlerDefaults>,
  TypeArg<T, 'event', ApiHandlerDefaults>
>;

export type HTTPMiddleware<T extends TypeArgs<T, ApiHandlerTypes> = object> = HTTPMiddlewareCore<
  TypeArg<T, 'path', HTTPMiddlewareDefaults>,
  TypeArg<T, 'query', HTTPMiddlewareDefaults>,
  Extract<TypeArg<T, 'auth', HTTPMiddlewareDefaults>, undefined>,
  TypeArg<T, 'body', HTTPMiddlewareDefaults>,
  TypeArg<T, 'response', HTTPMiddlewareDefaults>,
  TypeArg<T, 'event', HTTPMiddlewareDefaults>
>;

export type HTTPFilters<T extends TypeArgs<T, HTTPFiltersTypes> = object> = HTTPFiltersCore<
  Extract<TypeArg<T, 'pathPattern', HTTPFiltersDefaults>, string>,
  Extract<TypeArg<T, 'method', HTTPFiltersDefaults>, AnyHttpMethod>,
  TypeArg<T, 'auth', HTTPFiltersDefaults>,
  TypeArg<T, 'event', HTTPFiltersDefaults>
>;

export type HTTPFilterInput<T extends TypeArgs<T, HTTPFilterInputTypes> = object> = HTTPFilterInputCore<
  TypeArg<T, 'event', HTTPFilterInputDefaults>,
  TypeArg<T, 'auth', HTTPFilterInputDefaults>
>;

export type RouteDefinition<T extends TypeArgs<T, RouteDefinitionTypes> = object> = RouteDefinitionCore<
  Extract<TypeArg<T, 'pathPattern', RouteDefinitionDefaults>, string>,
  TypeArg<T, 'path', { path: PathParams<Extract<TypeArg<T, 'pathPattern', RouteDefinitionDefaults>, string>> }>,
  TypeArg<T, 'query', RouteDefinitionDefaults>,
  Extract<TypeArg<T, 'auth', RouteDefinitionDefaults>, undefined>,
  TypeArg<T, 'body', RouteDefinitionDefaults>,
  TypeArg<T, 'response', RouteDefinitionDefaults>,
  Extract<TypeArg<T, 'method', RouteDefinitionDefaults>, AnyHttpMethod>,
  undefined,
  'json',
  string,
  TypeArg<T, 'event', RouteDefinitionDefaults>
>;
