import { type AuthPreset, HTTPMatcher, type JsonBody, type ResponseTypeOption } from '@latcher/http';

import { type APIGatewayMatcherOptions, createAPIGatewayMatcher, defineRoute } from './APIGatewayMatcher.js';
import type { APIGatewayEvent } from './apiGatewayAdapter.js';
import { type APIGatewayV2EventType, apiGatewayV2Adapter } from './apiGatewayV2Adapter.js';
import type { APIGatewayAuth, IamAuth } from './auth.js';
import type { ApiHandler, ApiRequest, HTTPFilterInput, HTTPFilters, HTTPMiddleware, RouteDefinition } from './types.js';

type FilterFunction = NonNullable<HTTPFilters['custom']>;

suite('API Gateway event type', () => {
  test('every request alias defaults the event to APIGatewayEvent', () => {
    expectTypeOf<ApiRequest['event']>().toEqualTypeOf<APIGatewayEvent>();
    expectTypeOf<Parameters<ApiHandler>[0]['event']>().toEqualTypeOf<APIGatewayEvent>();
    expectTypeOf<Parameters<RouteDefinition['handler']>[0]['event']>().toEqualTypeOf<APIGatewayEvent>();
  });

  test('HTTPMiddleware defaults the event to APIGatewayEvent', () => {
    // biome-ignore lint/nursery/useExplicitType: HTTPMiddleware types the parameters, which is what this test asserts
    const readsEvent: HTTPMiddleware = async (request, next) => {
      expectTypeOf(request.event).toEqualTypeOf<APIGatewayEvent>();
      return next(request);
    };

    expect(readsEvent).toBeTypeOf('function');
  });

  test('every filter alias defaults the event to APIGatewayEvent', () => {
    expectTypeOf<HTTPFilterInput['event']>().toEqualTypeOf<APIGatewayEvent>();
    expectTypeOf<Parameters<FilterFunction>[0]['event']>().toEqualTypeOf<APIGatewayEvent>();
  });

  test('the matcher hands an inline handler an APIGatewayEvent', () => {
    createAPIGatewayMatcher().get({
      filters: { path: '/orders' },
      // biome-ignore lint/nursery/useExplicitType: the inferred parameter type is what this test asserts
      handler: async (request) => {
        expectTypeOf(request.event).toEqualTypeOf<APIGatewayEvent>();
      },
    });
  });

  test('defineRoute hands the handler an APIGatewayEvent', () => {
    defineRoute({ filters: { method: 'GET', path: '/orders' } }).handle(async (request) => {
      expectTypeOf(request.event).toEqualTypeOf<APIGatewayEvent>();
    });
  });

  test('a rawPath check narrows the event to a 2.0 payload', () => {
    defineRoute({ filters: { method: 'GET', path: '/orders' } }).handle(async (request) => {
      const method = 'rawPath' in request.event ? request.event.requestContext.http.method : request.event.httpMethod;
      expectTypeOf(method).toEqualTypeOf<string>();
    });
  });

  test('HTTPMatcher with the 2.0 adapter hands the handler only 2.0 payloads', () => {
    new HTTPMatcher(apiGatewayV2Adapter).get({
      filters: { path: '/orders' },
      // biome-ignore lint/nursery/useExplicitType: the inferred parameter type is what this test asserts
      handler: async (request) => {
        expectTypeOf(request.event).toEqualTypeOf<APIGatewayV2EventType>();
      },
    });
  });
});

suite('named type arguments', () => {
  type Query = Record<string, string | undefined>;
  type Item = { name: string };

  test('ApiHandler and HTTPMiddleware name their keys', () => {
    type Request = ApiRequest<{
      path: { id: string };
      query: Query;
      auth: IamAuth;
      body: Item;
      event: APIGatewayV2EventType;
    }>;

    expectTypeOf<
      Parameters<
        ApiHandler<{
          path: { id: string };
          query: Query;
          auth: IamAuth;
          body: Item;
          response: JsonBody;
          event: APIGatewayV2EventType;
        }>
      >[0]
    >().toEqualTypeOf<Request>();
    expectTypeOf<
      Parameters<
        HTTPMiddleware<{
          path: { id: string };
          query: Query;
          auth: IamAuth;
          body: Item;
          response: JsonBody;
          event: APIGatewayV2EventType;
        }>
      >[0]
    >().toEqualTypeOf<Request>();
  });

  test('HTTPFilters and HTTPFilterInput name their keys', () => {
    type Filters = HTTPFilters<{ pathPattern: '/orders'; method: 'GET'; auth: IamAuth; event: APIGatewayV2EventType }>;

    expectTypeOf<Filters['method']>().toEqualTypeOf<'GET'>();
    expectTypeOf<Filters['path']>().toEqualTypeOf<'/orders'>();
    expectTypeOf<Parameters<NonNullable<Filters['custom']>>[0]>().toEqualTypeOf<
      HTTPFilterInput<{ event: APIGatewayV2EventType; auth: IamAuth }>
    >();
  });

  test('RouteDefinition names its keys', () => {
    type Route = RouteDefinition<{
      pathPattern: '/orders/:id';
      query: Query;
      auth: IamAuth;
      body: Item;
      response: Item;
      method: 'POST';
      event: APIGatewayV2EventType;
    }>;

    expectTypeOf<Parameters<Route['handler']>[0]>().toEqualTypeOf<
      ApiRequest<{ path: { id: string }; query: Query; auth: IamAuth; body: Item; event: APIGatewayV2EventType }>
    >();
    expectTypeOf<Route['filters']['method']>().toEqualTypeOf<'POST'>();
    expectTypeOf<Route['auth']>().toEqualTypeOf<AuthPreset<{ input: APIGatewayAuth; output: IamAuth }> | undefined>();
  });

  test('APIGatewayMatcherOptions names its keys', () => {
    type Options = APIGatewayMatcherOptions<{
      auth: IamAuth;
      responseType: 'html';
      errors: Record<never, never>;
      contentType: 'text/html';
    }>;

    expectTypeOf<Options['auth']>().toEqualTypeOf<AuthPreset<{ input: APIGatewayAuth; output: IamAuth }> | undefined>();
    expectTypeOf<Options['responseType']>().toEqualTypeOf<
      ResponseTypeOption<{ type: 'html'; contentType: 'text/html' }> | undefined
    >();
  });
});
