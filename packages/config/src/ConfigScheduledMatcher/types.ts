import type { Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

import type { ConfigEvent } from '../types.js';

export interface ConfigScheduledRequestCore<TParams = Record<string, string>> {
  resultToken: string;
  configRuleName: string;
  accountId: string;
  ruleParameters: TParams;
  event: ConfigEvent;
  context: Context;
}

export type ConfigScheduledMiddlewareCore<TParams = Record<string, string>> = MiddlewareCore<
  ConfigScheduledRequestCore<TParams>,
  void
>;

export interface ConfigScheduledFilterInput {
  configRuleName: string;
  accountId: string;
}

export interface ConfigScheduledFilters {
  configRuleName?: FilterStringMatcher;
  accountId?: FilterStringMatcher;
  custom?: (input: ConfigScheduledFilterInput) => boolean | Promise<boolean>;
}

export interface ConfigScheduledRouteDefinitionCore<TParams = Record<string, string>> {
  filters: ConfigScheduledFilters;
  ruleParametersSchema?: StandardSchemaV1<unknown, TParams>;
  middleware?: ConfigScheduledMiddlewareCore<NoInfer<TParams>>[];
  handler: (request: ConfigScheduledRequestCore<TParams>) => Promise<void>;
}

export interface InternalConfigScheduledRoute {
  filters: ConfigScheduledFilters;
  ruleParametersSchema?: StandardSchemaV1;
  middleware?: ConfigScheduledMiddlewareCore[];
  handler: (request: ConfigScheduledRequestCore) => Promise<void>;
}

export interface ConfigScheduledRouteBuilder<TParams> {
  handle(
    handler: (request: ConfigScheduledRequestCore<TParams>) => Promise<void>,
  ): ConfigScheduledRouteDefinitionCore<TParams>;
}

export interface ConfigScheduledRouteInput<
  TParamsSchema extends StandardSchemaV1 | undefined = undefined,
  TParams = Record<string, string>,
> {
  filters: ConfigScheduledFilters;
  ruleParametersSchema?: TParamsSchema;
  middleware?: ConfigScheduledMiddlewareCore<NoInfer<TParams>>[];
}

export interface ConfigScheduledMatcherOptions {
  middleware?: ConfigScheduledMiddlewareCore[];
}

export interface ConfigScheduledTypes {
  ruleParameters?: unknown;
}

interface ConfigScheduledDefaults {
  ruleParameters: Record<string, string>;
}

export type ConfigScheduledRequest<T extends TypeArgs<T, ConfigScheduledTypes> = object> = ConfigScheduledRequestCore<
  TypeArg<T, 'ruleParameters', ConfigScheduledDefaults>
>;

export type ConfigScheduledMiddleware<T extends TypeArgs<T, ConfigScheduledTypes> = object> =
  ConfigScheduledMiddlewareCore<TypeArg<T, 'ruleParameters', ConfigScheduledDefaults>>;

export type ConfigScheduledRouteDefinition<T extends TypeArgs<T, ConfigScheduledTypes> = object> =
  ConfigScheduledRouteDefinitionCore<TypeArg<T, 'ruleParameters', ConfigScheduledDefaults>>;
