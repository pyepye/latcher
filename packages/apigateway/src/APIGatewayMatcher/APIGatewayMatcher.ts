import type { TypeArg, TypeArgs } from '@latcher/base';
import type {
  AuthPresetCore,
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

import { type APIGatewayEvent, type APIGatewayResult, apiGatewayAdapter } from './apiGatewayAdapter.js';
import type { APIGatewayAuth } from './auth.js';

type RawAuth = APIGatewayAuth;

export interface APIGatewayMatcherOptionsCore<
  TDefaultAuth extends RawAuth = RawAuth,
  TDefaultKind extends ResponseKind = 'json',
  TErrors extends ErrorFunctions = Record<never, never>,
  TContentType extends string = string,
> {
  auth?: AuthPresetCore<RawAuth, TDefaultAuth>;
  responseType?: ResponseTypeOptionCore<TDefaultKind, TContentType>;
  errors?: TErrors & ErrorFunctions;
  middleware?: HTTPMiddlewareCore<
    Record<string, string>,
    Record<string, string | undefined>,
    RawAuth,
    unknown,
    ResponseBody,
    APIGatewayEvent
  >[];
  cors?: CorsConfig;
}

export class APIGatewayMatcher<
  TDefaultAuth extends RawAuth = RawAuth,
  TDefaultKind extends ResponseKind = 'json',
  TErrors extends ErrorFunctions = Record<never, never>,
  TContentType extends string = string,
> extends HTTPMatcher<APIGatewayEvent, APIGatewayResult, RawAuth, TDefaultAuth, TDefaultKind, TErrors, TContentType> {
  constructor(
    options?: APIGatewayMatcherOptionsCore<TDefaultAuth, TDefaultKind, TErrors, TContentType> &
      HtmlMatcherErrors<NoInfer<TDefaultKind>>,
  ) {
    // The options already passed HtmlMatcherErrors, which TypeScript cannot resolve here for a generic kind
    super({
      adapter: apiGatewayAdapter,
      auth: options?.auth,
      responseType: options?.responseType,
      errors: options?.errors,
      middleware: options?.middleware,
      cors: options?.cors,
    } as HTTPMatcherOptionsCore<
      APIGatewayEvent,
      APIGatewayResult,
      RawAuth,
      TDefaultAuth,
      TDefaultKind,
      TErrors,
      TContentType
    > &
      HtmlMatcherErrors<TDefaultKind>);
  }
}

export function createAPIGatewayMatcher<
  TDefaultAuth extends RawAuth = RawAuth,
  TDefaultKind extends ResponseKind = 'json',
  TErrors extends ErrorFunctions = Record<never, never>,
  TContentType extends string = string,
>(
  options?: APIGatewayMatcherOptionsCore<TDefaultAuth, TDefaultKind, TErrors, TContentType> &
    HtmlMatcherErrors<NoInfer<TDefaultKind>>,
): APIGatewayMatcher<TDefaultAuth, TDefaultKind, TErrors, TContentType> {
  return new APIGatewayMatcher(options);
}

export const defineRoute: DefineRouteFn<{ rawAuth: RawAuth; event: APIGatewayEvent }> = createDefineRoute<
  RawAuth,
  RawAuth,
  APIGatewayEvent
>();

export interface APIGatewayMatcherOptionsTypes {
  auth?: RawAuth;
  responseType?: ResponseKind;
  errors?: ErrorFunctions;
  contentType?: string;
}

interface APIGatewayMatcherOptionsDefaults {
  auth: RawAuth;
  responseType: 'json';
  errors: Record<never, never>;
  contentType: string;
}

export type APIGatewayMatcherOptions<T extends TypeArgs<T, APIGatewayMatcherOptionsTypes> = object> =
  APIGatewayMatcherOptionsCore<
    Extract<TypeArg<T, 'auth', APIGatewayMatcherOptionsDefaults>, RawAuth>,
    Extract<TypeArg<T, 'responseType', APIGatewayMatcherOptionsDefaults>, ResponseKind>,
    Extract<TypeArg<T, 'errors', APIGatewayMatcherOptionsDefaults>, ErrorFunctions>,
    Extract<TypeArg<T, 'contentType', APIGatewayMatcherOptionsDefaults>, string>
  >;
