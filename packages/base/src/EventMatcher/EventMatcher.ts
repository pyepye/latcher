import type { Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import { NoRouteMatchedError } from '../errors';
import type { EventTypeMatcherCore } from '../Latcher';
import { handleEventWithMiddleware } from '../middleware';
import { isKnownEventSource, isObject, orderRoutesBySpecificity, validateSchema } from '../utils';
import type {
  EventFilterInput,
  EventFilters,
  EventHandlerCore,
  EventMatcherMiddlewareCore,
  EventMatcherOptionsCore,
  EventRouteDefinitionCore,
} from './types.js';

interface InternalEventRoute {
  filters: { custom?: (input: EventFilterInput) => boolean | Promise<boolean> };
  eventSchema?: StandardSchemaV1;
  middleware: EventMatcherMiddlewareCore<unknown, unknown>[];
  handler: EventHandlerCore<unknown, unknown>;
}

interface EventRouteInput<TEventSchema extends StandardSchemaV1 | undefined = undefined, TResponse = unknown> {
  filters: EventFilters;
  middleware?: EventMatcherMiddlewareCore<
    TEventSchema extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TEventSchema> : unknown,
    TResponse
  >[];
  eventSchema?: TEventSchema;
}

interface EventRouteBuilder<TPayload, TResponse = unknown> {
  handle<TActualResponse extends TResponse>(
    handler: EventHandlerCore<TPayload, TActualResponse>,
  ): EventRouteDefinitionCore<TPayload, TActualResponse>;
}

export class EventMatcher<TResponse = unknown> implements EventTypeMatcherCore<unknown, TResponse> {
  private routes: InternalEventRoute[] = [];
  private routesOrdered = false;
  private middleware: EventMatcherMiddlewareCore<unknown, TResponse>[];
  private readonly matchedRoutes = new WeakMap<Record<string, unknown>, InternalEventRoute>();
  readonly matchTier = 'fallback'; // Latcher sorts this last:

  constructor(options?: EventMatcherOptionsCore<TResponse>) {
    this.middleware = options?.middleware ?? [];
  }

  async canHandleEvent(event: unknown): Promise<boolean> {
    if (!isObject(event)) return false;
    if (isKnownEventSource(event)) return false;
    const matched = await this.matchRoute(event);
    return matched !== undefined;
  }

  route<TPayload, TRouteResponse extends TResponse>(
    definition: EventRouteDefinitionCore<TPayload, TRouteResponse>,
  ): this {
    // Casts needed: storing typed route in general storage (contravariance)
    const handler = definition.handler as EventHandlerCore<unknown, unknown>;
    const { filters } = definition;
    // @ts-expect-error - storing typed middleware in untyped internal collection (contravariance)
    const middleware: EventMatcherMiddlewareCore<unknown, unknown>[] = definition.middleware ?? [];
    this.routes.push({
      filters,
      eventSchema: definition.eventSchema,
      middleware,
      handler,
    });
    this.routesOrdered = false;
    return this;
  }

  async handleEvent(event: unknown, context: Context): Promise<TResponse> {
    const route = await this.matchRoute(event);
    if (!route) {
      throw new NoRouteMatchedError('No route matched for event');
    }

    const validatedEvent = await validateSchema(event, route.eventSchema, 'Schema validation failed for event');

    const request = { event: validatedEvent, context };

    const allMiddleware = [...this.middleware, ...route.middleware] as EventMatcherMiddlewareCore<unknown, TResponse>[];
    return handleEventWithMiddleware(allMiddleware, request, route.handler as EventHandlerCore<unknown, TResponse>);
  }

  private orderRoutes(): void {
    if (this.routesOrdered) return;

    this.routes = orderRoutesBySpecificity(this.routes);
    this.routesOrdered = true;
  }

  private async matchRoute(event: unknown): Promise<InternalEventRoute | undefined> {
    // canHandleEvent calls handleEvent but both call matchRoute - cache so filters.custom isn't called twice
    const cached = isObject(event) ? this.matchedRoutes.get(event) : undefined;
    if (cached) return cached;

    const filterInput: EventFilterInput = { event };
    this.orderRoutes();

    for (const route of this.routes) {
      const { filters } = route;
      if (filters.custom) {
        const match = await filters.custom(filterInput);
        if (!match) continue;
      }
      if (isObject(event)) this.matchedRoutes.set(event, route);
      return route;
    }
    return undefined;
  }
}

export function defineEventRoute<
  TPayload = unknown,
  TResponse = unknown,
  TEventSchema extends StandardSchemaV1 | undefined = undefined,
>(
  config: EventRouteInput<TEventSchema, TResponse>,
): EventRouteBuilder<
  TEventSchema extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TEventSchema> : TPayload,
  TResponse
> {
  type ResolvedPayload = TEventSchema extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<TEventSchema> : TPayload;
  return {
    handle<TActualResponse extends TResponse>(
      handler: EventHandlerCore<ResolvedPayload, TActualResponse>,
    ): EventRouteDefinitionCore<ResolvedPayload, TActualResponse> {
      // Cast needed: generic type narrowing from builder input to route definition
      const eventSchema = config.eventSchema as EventRouteDefinitionCore<
        ResolvedPayload,
        TActualResponse
      >['eventSchema'];
      return {
        filters: config.filters,
        eventSchema,
        middleware: config.middleware as EventMatcherMiddlewareCore<ResolvedPayload, TActualResponse>[] | undefined,
        handler,
      };
    },
  };
}

export function createEventMatcher<TResponse = unknown>(
  options?: EventMatcherOptionsCore<TResponse>,
): EventMatcher<TResponse> {
  return new EventMatcher<TResponse>(options);
}
