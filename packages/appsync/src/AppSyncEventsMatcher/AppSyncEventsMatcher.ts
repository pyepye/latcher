import type { Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { EventTypeMatcherCore } from '@latcher/base';
import {
  filterStringMatcher,
  handleEventWithMiddleware,
  isObject,
  orderRoutesBySpecificity,
  validateSchema,
} from '@latcher/base';

import type {
  AppSyncEventsEvent,
  AppSyncEventsMatcherOptions,
  AppSyncEventsMiddleware,
  AppSyncEventsPublishedEventCore,
  AppSyncEventsRequestCore,
  AppSyncEventsRouteBuilder,
  AppSyncEventsRouteDefinitionCore,
  AppSyncEventsRouteInput,
  AppSyncPublishInputCore,
  AppSyncSubscribeInputCore,
  InternalEventsRoute,
  PayloadOf,
} from './types.js';

export function defineEventsRoute<TPayloadSchema extends StandardSchemaV1 | undefined = undefined>(
  config: AppSyncEventsRouteInput<TPayloadSchema>,
): AppSyncEventsRouteBuilder<PayloadOf<TPayloadSchema>> {
  return {
    handle(
      handler: (request: AppSyncEventsRequestCore<PayloadOf<TPayloadSchema>>) => Promise<unknown>,
    ): AppSyncEventsRouteDefinitionCore<PayloadOf<TPayloadSchema>> {
      return {
        filters: config.filters ?? {},
        payloadSchema: config.payloadSchema,
        middleware: config.middleware,
        handler,
      };
    },
  };
}

export class AppSyncEventsMatcher implements EventTypeMatcherCore<AppSyncEventsEvent, unknown> {
  private routes: InternalEventsRoute[] = [];
  private routesOrdered = false;
  private middleware: AppSyncEventsMiddleware[];

  constructor(options?: AppSyncEventsMatcherOptions) {
    this.middleware = options?.middleware ?? [];
  }

  canHandleEvent(event: unknown): event is AppSyncEventsEvent {
    if (!isObject(event)) return false;

    const info = event.info;
    if (!isObject(info)) return false;

    if (!isObject(info.channel)) return false;
    if (!isObject(info.channelNamespace)) return false;
    if (typeof info.operation !== 'string') return false;

    return true;
  }

  route<TPayload>(definition: AppSyncEventsRouteDefinitionCore<TPayload>): this {
    this.routes.push(definition as InternalEventsRoute);
    this.routesOrdered = false;
    return this;
  }

  publish<TPayloadSchema extends StandardSchemaV1 | undefined = undefined>(
    input: AppSyncPublishInputCore<TPayloadSchema>,
  ): this {
    return this.route({
      filters: {
        ...input.filters,
        operation: 'PUBLISH',
        channelPath: input.channelPath,
      },
      payloadSchema: input.payloadSchema,
      middleware: input.middleware,
      handler: input.handler,
    });
  }

  subscribe<TPayloadSchema extends StandardSchemaV1 | undefined = undefined>(
    input: AppSyncSubscribeInputCore<TPayloadSchema>,
  ): this {
    return this.route({
      filters: {
        ...input.filters,
        operation: 'SUBSCRIBE',
        channelPath: input.channelPath,
      },
      payloadSchema: input.payloadSchema,
      middleware: input.middleware,
      handler: input.handler,
    });
  }

  async handleEvent(event: AppSyncEventsEvent, context: Context): Promise<unknown> {
    const { operation } = event.info;
    const channelPath = event.info.channel.path;
    const channelNamespace = event.info.channelNamespace.name;

    const route = await this.matchRoute(operation, channelPath, channelNamespace, event);
    if (!route) {
      throw new Error(`No route matched for ${operation} on channel ${channelPath}`);
    }

    const request: AppSyncEventsRequestCore = {
      channelPath,
      channelNamespace,
      operation,
      identity: event.identity,
      events: await this.validatePayloads(event.events ?? [], route.payloadSchema),
      info: event.info,
      request: event.request,
      stash: event.stash,
      prev: event.prev,
      event,
      context,
    };

    const allMiddleware = [...this.middleware, ...(route.middleware ?? [])];
    return handleEventWithMiddleware(allMiddleware, request, route.handler);
  }

  // A publish carries at most five events, and one bad payload fails the whole publish rather than
  // reporting per event, so the first failure is the one the caller sees.
  private async validatePayloads(
    events: AppSyncEventsPublishedEventCore[],
    payloadSchema: StandardSchemaV1 | undefined,
  ): Promise<AppSyncEventsPublishedEventCore[]> {
    const validated: AppSyncEventsPublishedEventCore[] = [];

    for (const event of events) {
      validated.push({
        id: event.id,
        payload: await validateSchema(event.payload, payloadSchema, `Payload validation failed for event ${event.id}`),
      });
    }

    return validated;
  }

  private orderRoutes(): void {
    if (this.routesOrdered) return;

    this.routes = orderRoutesBySpecificity(this.routes);
    this.routesOrdered = true;
  }

  private async matchRoute(
    operation: string,
    channelPath: string,
    channelNamespace: string,
    event: AppSyncEventsEvent,
  ): Promise<InternalEventsRoute | undefined> {
    this.orderRoutes();

    for (const route of this.routes) {
      const { filters } = route;

      const operationTyped = operation as AppSyncEventsEvent['info']['operation'];

      if (filters.operation !== undefined) {
        const operations = Array.isArray(filters.operation) ? filters.operation : [filters.operation];
        if (!operations.includes(operationTyped)) {
          continue;
        }
      }

      if (filters.channelPath !== undefined) {
        const channelPathMatch = filterStringMatcher(channelPath, filters.channelPath);
        if (!channelPathMatch) continue;
      }

      if (filters.channelNamespace !== undefined) {
        const channelNamespaceMatch = filterStringMatcher(channelNamespace, filters.channelNamespace);
        if (!channelNamespaceMatch) continue;
      }

      if (filters.custom) {
        const match = await filters.custom({
          operation: operationTyped,
          channelNamespace,
          channelPath,
          event,
        });
        if (!match) continue;
      }
      return route;
    }
    return undefined;
  }
}

export function createAppSyncEventsMatcher(options?: AppSyncEventsMatcherOptions): AppSyncEventsMatcher {
  return new AppSyncEventsMatcher(options);
}
