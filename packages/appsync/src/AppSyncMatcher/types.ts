import type { AppSyncIdentity, AppSyncResolverEvent, Context } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

// ─── Resolver Types ──────────────────────────────────────────────────────────

export interface AppSyncBatchResult {
  data: unknown;
  errorMessage?: string;
  errorType?: string;
}

export interface AppSyncResolverRequestCore<TArgs = Record<string, unknown>> {
  arguments: TArgs;
  identity: AppSyncIdentity;
  source: Record<string, unknown> | null;
  info: {
    selectionSetList: string[];
    selectionSetGraphQL: string;
    parentTypeName: string;
    fieldName: string;
    variables: Record<string, unknown>;
  };
  headers: Record<string, string | undefined>;
  domainName: string | null;
  prev: { result: Record<string, unknown> } | null;
  stash: Record<string, unknown>;
  event: AppSyncResolverEvent<TArgs>;
  context: Context;
}

export interface AppSyncResolverFilterInput {
  parentTypeName: string;
  fieldName: string;
  event: AppSyncResolverEvent<Record<string, unknown>>;
}

export interface AppSyncResolverFilters {
  parentTypeName?: FilterStringMatcher;
  fieldName?: FilterStringMatcher;
  custom?: (input: AppSyncResolverFilterInput) => boolean | Promise<boolean>;
}

export type AppSyncResolverMiddlewareCore<TArgs = Record<string, unknown>> = MiddlewareCore<
  AppSyncResolverRequestCore<TArgs>,
  unknown
>;

export interface AppSyncResolverRouteDefinitionCore<TArgs = Record<string, unknown>> {
  filters: AppSyncResolverFilters;
  argumentsSchema?: StandardSchemaV1<unknown, TArgs>;
  middleware?: AppSyncResolverMiddlewareCore<TArgs>[];
  handler: (request: AppSyncResolverRequestCore<TArgs>) => Promise<unknown>;
}

export type AppSyncResolverFieldFilters = Pick<AppSyncResolverFilters, 'custom'>;

export interface AppSyncResolverFieldInputCore<TArgs = Record<string, unknown>> {
  fieldName: string;
  filters?: AppSyncResolverFieldFilters;
  argumentsSchema?: StandardSchemaV1<unknown, TArgs>;
  middleware?: AppSyncResolverMiddlewareCore<TArgs>[];
  handler: (request: AppSyncResolverRequestCore<TArgs>) => Promise<unknown>;
}

export type AppSyncQueryInputCore<TArgs = Record<string, unknown>> = AppSyncResolverFieldInputCore<TArgs>;
export type AppSyncMutationInputCore<TArgs = Record<string, unknown>> = AppSyncResolverFieldInputCore<TArgs>;
export type AppSyncSubscriptionInputCore<TArgs = Record<string, unknown>> = AppSyncResolverFieldInputCore<TArgs>;

// ─── Resolver Route Builder Types ────────────────────────────────────────────

export interface AppSyncResolverRouteInput<
  TArgumentsSchema extends StandardSchemaV1 | undefined = undefined,
  TArgs = TArgumentsSchema extends StandardSchemaV1
    ? StandardSchemaV1.InferOutput<TArgumentsSchema>
    : Record<string, unknown>,
> {
  filters: AppSyncResolverFilters;
  argumentsSchema?: TArgumentsSchema;
  middleware?: AppSyncResolverMiddlewareCore<TArgs>[];
}

export interface AppSyncResolverRouteBuilder<TArgs> {
  handle(
    handler: (request: AppSyncResolverRequestCore<TArgs>) => Promise<unknown>,
  ): AppSyncResolverRouteDefinitionCore<TArgs>;
}

// ─── Internal Resolver Route ─────────────────────────────────────────────────

export interface InternalResolverRoute {
  filters: AppSyncResolverFilters;
  argumentsSchema?: StandardSchemaV1;
  middleware: MiddlewareCore<AppSyncResolverRequestCore, unknown>[];
  handler: (request: AppSyncResolverRequestCore) => Promise<unknown>;
}

// ─── Named Type Arguments ────────────────────────────────────────────────────

export interface AppSyncResolverTypes {
  arguments?: unknown;
}

interface AppSyncResolverDefaults {
  arguments: Record<string, unknown>;
}

export type AppSyncResolverRequest<T extends TypeArgs<T, AppSyncResolverTypes> = object> = AppSyncResolverRequestCore<
  TypeArg<T, 'arguments', AppSyncResolverDefaults>
>;

export type AppSyncResolverMiddleware<T extends TypeArgs<T, AppSyncResolverTypes> = object> =
  AppSyncResolverMiddlewareCore<TypeArg<T, 'arguments', AppSyncResolverDefaults>>;

export type AppSyncResolverRouteDefinition<T extends TypeArgs<T, AppSyncResolverTypes> = object> =
  AppSyncResolverRouteDefinitionCore<TypeArg<T, 'arguments', AppSyncResolverDefaults>>;

export type AppSyncResolverFieldInput<T extends TypeArgs<T, AppSyncResolverTypes> = object> =
  AppSyncResolverFieldInputCore<TypeArg<T, 'arguments', AppSyncResolverDefaults>>;

export type AppSyncQueryInput<T extends TypeArgs<T, AppSyncResolverTypes> = object> = AppSyncQueryInputCore<
  TypeArg<T, 'arguments', AppSyncResolverDefaults>
>;

export type AppSyncMutationInput<T extends TypeArgs<T, AppSyncResolverTypes> = object> = AppSyncMutationInputCore<
  TypeArg<T, 'arguments', AppSyncResolverDefaults>
>;

export type AppSyncSubscriptionInput<T extends TypeArgs<T, AppSyncResolverTypes> = object> =
  AppSyncSubscriptionInputCore<TypeArg<T, 'arguments', AppSyncResolverDefaults>>;
