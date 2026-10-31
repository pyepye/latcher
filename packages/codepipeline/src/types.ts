import type { CodePipelineClient } from '@aws-sdk/client-codepipeline';
import type { Artifact, CodePipelineEvent, Context, Credentials } from 'aws-lambda';

import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { FilterStringMatcher, MiddlewareCore, TypeArg, TypeArgs } from '@latcher/base';

export interface CodePipelineRequestCore<TUserParameters = unknown> {
  jobId: string;
  functionName: string;
  userParameters: TUserParameters;
  inputArtifacts: Artifact[];
  outputArtifacts: Artifact[];
  artifactCredentials: Credentials;
  continuationToken: string | undefined;
  event: CodePipelineEvent;
  context: Context;
}

export interface CodePipelineSuccessResult {
  outputVariables?: Record<string, string>;
  continuationToken?: string;
}

// biome-ignore lint/suspicious/noConfusingVoidType: a handler may return nothing, meaning no output variables
export type CodePipelineResponse = CodePipelineSuccessResult | void;

export type CodePipelineMiddlewareCore<TUserParameters = unknown> = MiddlewareCore<
  CodePipelineRequestCore<TUserParameters>,
  CodePipelineResponse
>;

export type CodePipelineHandlerCore<TUserParameters = unknown> = (
  request: CodePipelineRequestCore<TUserParameters>,
) => Promise<CodePipelineResponse>;

export interface CodePipelineFilterInputCore<TUserParameters = unknown> {
  functionName: string;
  userParameters: TUserParameters;
  hasInputArtifacts: boolean;
  hasContinuationToken: boolean;
}

export interface CodePipelineFilters {
  functionName?: FilterStringMatcher;
  hasInputArtifacts?: boolean;
  hasContinuationToken?: boolean;
  // userParameters?: FilterStringMatcher;
  custom?: (input: CodePipelineFilterInputCore) => boolean | Promise<boolean>;
}

export interface CodePipelineRouteDefinitionCore<TUserParameters = unknown> {
  filters: CodePipelineFilters;
  userParametersSchema?: StandardSchemaV1<unknown, TUserParameters>;
  middleware?: CodePipelineMiddlewareCore<NoInfer<TUserParameters>>[];
  handler: CodePipelineHandlerCore<TUserParameters>;
}

export interface CodePipelineMatcherOptions {
  client?: CodePipelineClient;
  middleware?: CodePipelineMiddlewareCore[];
}

export interface CodePipelineTypes {
  userParameters?: unknown;
}

interface CodePipelineDefaults {
  userParameters: unknown;
}

export type CodePipelineRequest<T extends TypeArgs<T, CodePipelineTypes> = object> = CodePipelineRequestCore<
  TypeArg<T, 'userParameters', CodePipelineDefaults>
>;

export type CodePipelineMiddleware<T extends TypeArgs<T, CodePipelineTypes> = object> = CodePipelineMiddlewareCore<
  TypeArg<T, 'userParameters', CodePipelineDefaults>
>;

export type CodePipelineHandler<T extends TypeArgs<T, CodePipelineTypes> = object> = CodePipelineHandlerCore<
  TypeArg<T, 'userParameters', CodePipelineDefaults>
>;

export type CodePipelineFilterInput<T extends TypeArgs<T, CodePipelineTypes> = object> = CodePipelineFilterInputCore<
  TypeArg<T, 'userParameters', CodePipelineDefaults>
>;

export type CodePipelineRouteDefinition<T extends TypeArgs<T, CodePipelineTypes> = object> =
  CodePipelineRouteDefinitionCore<TypeArg<T, 'userParameters', CodePipelineDefaults>>;
