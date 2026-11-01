import type { ALBEvent, ALBResult } from 'aws-lambda';

import type { TypeArg, TypeArgs } from '@latcher/base';
import type {
  CorsConfig,
  DefineRouteFn,
  ErrorFunctions,
  HTTPMatcherOptionsCore,
  HTTPMiddlewareCore,
  HtmlMatcherErrors,
  ResponseBody,
  ResponseKind,
  ResponseTypeOptionCore,
} from '@latcher/http';
import { createDefineRoute, HTTPMatcher } from '@latcher/http';

import { albAdapter } from './albAdapter.js';

interface ALBMatcherOptionsCore<
  TDefaultKind extends ResponseKind = 'json',
  TErrors extends ErrorFunctions = Record<never, never>,
  TContentType extends string = string,
> {
  responseType?: ResponseTypeOptionCore<TDefaultKind, TContentType>;
  errors?: TErrors & ErrorFunctions;
  middleware?: HTTPMiddlewareCore<
    Record<string, string>,
    Record<string, string | undefined>,
    undefined,
    unknown,
    ResponseBody,
    ALBEvent
  >[];
  cors?: CorsConfig;
}

export interface ALBMatcherOptionsTypes {
  responseType?: ResponseKind;
  errors?: ErrorFunctions;
  contentType?: string;
}

interface ALBMatcherOptionsDefaults {
  responseType: 'json';
  errors: Record<never, never>;
  contentType: string;
}

export type ALBMatcherOptions<T extends TypeArgs<T, ALBMatcherOptionsTypes> = object> = ALBMatcherOptionsCore<
  Extract<TypeArg<T, 'responseType', ALBMatcherOptionsDefaults>, ResponseKind>,
  Extract<TypeArg<T, 'errors', ALBMatcherOptionsDefaults>, ErrorFunctions>,
  Extract<TypeArg<T, 'contentType', ALBMatcherOptionsDefaults>, string>
>;

export class ALBMatcher<
  TDefaultKind extends ResponseKind = 'json',
  TErrors extends ErrorFunctions = Record<never, never>,
  TContentType extends string = string,
> extends HTTPMatcher<ALBEvent, ALBResult, undefined, undefined, TDefaultKind, TErrors, TContentType> {
  constructor(
    options?: ALBMatcherOptionsCore<TDefaultKind, TErrors, TContentType> & HtmlMatcherErrors<NoInfer<TDefaultKind>>,
  ) {
    // The options already passed HtmlMatcherErrors, which TypeScript cannot resolve here for a generic kind
    super({
      adapter: albAdapter,
      responseType: options?.responseType,
      errors: options?.errors,
      middleware: options?.middleware,
      cors: options?.cors,
    } as HTTPMatcherOptionsCore<ALBEvent, ALBResult, undefined, undefined, TDefaultKind, TErrors, TContentType> &
      HtmlMatcherErrors<TDefaultKind>);
  }
}

export function createALBMatcher<
  TDefaultKind extends ResponseKind = 'json',
  TErrors extends ErrorFunctions = Record<never, never>,
  TContentType extends string = string,
>(
  options?: ALBMatcherOptionsCore<TDefaultKind, TErrors, TContentType> & HtmlMatcherErrors<NoInfer<TDefaultKind>>,
): ALBMatcher<TDefaultKind, TErrors, TContentType> {
  return new ALBMatcher(options);
}

export const defineRoute: DefineRouteFn<{ rawAuth: undefined; event: ALBEvent }> = createDefineRoute<
  undefined,
  undefined,
  ALBEvent
>();
