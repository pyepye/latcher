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

import type { VPCLatticeAuth } from './auth.js';
import { type VPCLatticeEvent, vpcLatticeAdapter } from './vpcLatticeAdapter.js';
import type { VPCLatticeResult } from './vpcLatticeV1Adapter.js';

type RawAuth = VPCLatticeAuth;

interface VPCLatticeMatcherOptionsCore<
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
    VPCLatticeEvent
  >[];
  cors?: CorsConfig;
}

export interface VPCLatticeMatcherOptionsTypes {
  auth?: RawAuth;
  responseType?: ResponseKind;
  errors?: ErrorFunctions;
  contentType?: string;
}

interface VPCLatticeMatcherOptionsDefaults {
  auth: RawAuth;
  responseType: 'json';
  errors: Record<never, never>;
  contentType: string;
}

export type VPCLatticeMatcherOptions<T extends TypeArgs<T, VPCLatticeMatcherOptionsTypes> = object> =
  VPCLatticeMatcherOptionsCore<
    Extract<TypeArg<T, 'auth', VPCLatticeMatcherOptionsDefaults>, RawAuth>,
    Extract<TypeArg<T, 'responseType', VPCLatticeMatcherOptionsDefaults>, ResponseKind>,
    Extract<TypeArg<T, 'errors', VPCLatticeMatcherOptionsDefaults>, ErrorFunctions>,
    Extract<TypeArg<T, 'contentType', VPCLatticeMatcherOptionsDefaults>, string>
  >;

export class VPCLatticeMatcher<
  TDefaultAuth extends RawAuth = RawAuth,
  TDefaultKind extends ResponseKind = 'json',
  TErrors extends ErrorFunctions = Record<never, never>,
  TContentType extends string = string,
> extends HTTPMatcher<VPCLatticeEvent, VPCLatticeResult, RawAuth, TDefaultAuth, TDefaultKind, TErrors, TContentType> {
  constructor(
    options?: VPCLatticeMatcherOptionsCore<TDefaultAuth, TDefaultKind, TErrors, TContentType> &
      HtmlMatcherErrors<NoInfer<TDefaultKind>>,
  ) {
    // The options already passed HtmlMatcherErrors, which TypeScript cannot resolve here for a generic kind
    super({
      adapter: vpcLatticeAdapter,
      auth: options?.auth,
      responseType: options?.responseType,
      errors: options?.errors,
      middleware: options?.middleware,
      cors: options?.cors,
    } as HTTPMatcherOptionsCore<
      VPCLatticeEvent,
      VPCLatticeResult,
      RawAuth,
      TDefaultAuth,
      TDefaultKind,
      TErrors,
      TContentType
    > &
      HtmlMatcherErrors<TDefaultKind>);
  }
}

export function createVPCLatticeMatcher<
  TDefaultAuth extends RawAuth = RawAuth,
  TDefaultKind extends ResponseKind = 'json',
  TErrors extends ErrorFunctions = Record<never, never>,
  TContentType extends string = string,
>(
  options?: VPCLatticeMatcherOptionsCore<TDefaultAuth, TDefaultKind, TErrors, TContentType> &
    HtmlMatcherErrors<NoInfer<TDefaultKind>>,
): VPCLatticeMatcher<TDefaultAuth, TDefaultKind, TErrors, TContentType> {
  return new VPCLatticeMatcher(options);
}

export const defineRoute: DefineRouteFn<{ rawAuth: RawAuth; event: VPCLatticeEvent }> = createDefineRoute<
  RawAuth,
  RawAuth,
  VPCLatticeEvent
>();
