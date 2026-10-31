import type {
  CreateAuthChallengeTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  PostAuthenticationTriggerEvent,
  PreAuthenticationTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';

import { testCognitoTriggerTypes } from './common.type.test.js';
import type {
  CreateAuthChallengeHandler,
  CreateAuthChallengeRequest,
  CreateAuthChallengeResponse,
  CreateAuthChallengeRouteDefinition,
  CreateAuthChallengeTriggerSource,
  DefineAuthChallengeHandler,
  DefineAuthChallengeRequest,
  DefineAuthChallengeResponse,
  DefineAuthChallengeRouteDefinition,
  DefineAuthChallengeTriggerSource,
  PostAuthenticationHandler,
  PostAuthenticationRequest,
  PostAuthenticationResponse,
  PostAuthenticationRouteDefinition,
  PostAuthenticationTriggerSource,
  PreAuthenticationHandler,
  PreAuthenticationRequest,
  PreAuthenticationResponse,
  PreAuthenticationRouteDefinition,
  PreAuthenticationTriggerSource,
  VerifyAuthChallengeResponseHandler,
  VerifyAuthChallengeResponseRequest,
  VerifyAuthChallengeResponseResponse,
  VerifyAuthChallengeResponseRouteDefinition,
  VerifyAuthChallengeResponseTriggerSource,
} from './index.js';

type CustomAttributes = { email: string } & Record<string, string>;

// =============================================================================
// PreAuthentication
// =============================================================================

suite('PreAuthenticationTriggerSource', () => {
  test('resolves to expected literal', () => {
    expectTypeOf<PreAuthenticationTriggerSource>().toEqualTypeOf<'PreAuthentication_Authentication'>();
  });
});

suite('PreAuthenticationResponse', () => {
  test('matches event response type', () => {
    expectTypeOf<PreAuthenticationResponse>().toEqualTypeOf<PreAuthenticationTriggerEvent['response']>();
  });
});

testCognitoTriggerTypes<
  PreAuthenticationTriggerSource,
  PreAuthenticationTriggerEvent,
  PreAuthenticationRequest,
  PreAuthenticationRequest<{ userAttributes: CustomAttributes }>,
  PreAuthenticationHandler,
  PreAuthenticationHandler<{ userAttributes: CustomAttributes }>,
  PreAuthenticationRouteDefinition
>('PreAuthentication');

// =============================================================================
// PostAuthentication
// =============================================================================

suite('PostAuthenticationTriggerSource', () => {
  test('resolves to expected literal', () => {
    expectTypeOf<PostAuthenticationTriggerSource>().toEqualTypeOf<'PostAuthentication_Authentication'>();
  });
});

suite('PostAuthenticationResponse', () => {
  test('matches event response type', () => {
    expectTypeOf<PostAuthenticationResponse>().toEqualTypeOf<PostAuthenticationTriggerEvent['response']>();
  });
});

testCognitoTriggerTypes<
  PostAuthenticationTriggerSource,
  PostAuthenticationTriggerEvent,
  PostAuthenticationRequest,
  PostAuthenticationRequest<{ userAttributes: CustomAttributes }>,
  PostAuthenticationHandler,
  PostAuthenticationHandler<{ userAttributes: CustomAttributes }>,
  PostAuthenticationRouteDefinition
>('PostAuthentication');

// =============================================================================
// DefineAuthChallenge
// =============================================================================

suite('DefineAuthChallengeTriggerSource', () => {
  test('resolves to expected literal', () => {
    expectTypeOf<DefineAuthChallengeTriggerSource>().toEqualTypeOf<'DefineAuthChallenge_Authentication'>();
  });
});

suite('DefineAuthChallengeResponse', () => {
  test('matches event response type', () => {
    expectTypeOf<DefineAuthChallengeResponse>().toEqualTypeOf<DefineAuthChallengeTriggerEvent['response']>();
  });
});

testCognitoTriggerTypes<
  DefineAuthChallengeTriggerSource,
  DefineAuthChallengeTriggerEvent,
  DefineAuthChallengeRequest,
  DefineAuthChallengeRequest<{ userAttributes: CustomAttributes }>,
  DefineAuthChallengeHandler,
  DefineAuthChallengeHandler<{ userAttributes: CustomAttributes }>,
  DefineAuthChallengeRouteDefinition
>('DefineAuthChallenge');

// =============================================================================
// CreateAuthChallenge
// =============================================================================

suite('CreateAuthChallengeTriggerSource', () => {
  test('resolves to expected literal', () => {
    expectTypeOf<CreateAuthChallengeTriggerSource>().toEqualTypeOf<'CreateAuthChallenge_Authentication'>();
  });
});

suite('CreateAuthChallengeResponse', () => {
  test('matches event response type', () => {
    expectTypeOf<CreateAuthChallengeResponse>().toEqualTypeOf<CreateAuthChallengeTriggerEvent['response']>();
  });
});

testCognitoTriggerTypes<
  CreateAuthChallengeTriggerSource,
  CreateAuthChallengeTriggerEvent,
  CreateAuthChallengeRequest,
  CreateAuthChallengeRequest<{ userAttributes: CustomAttributes }>,
  CreateAuthChallengeHandler,
  CreateAuthChallengeHandler<{ userAttributes: CustomAttributes }>,
  CreateAuthChallengeRouteDefinition
>('CreateAuthChallenge');

// =============================================================================
// VerifyAuthChallengeResponse
// =============================================================================

suite('VerifyAuthChallengeResponseTriggerSource', () => {
  test('resolves to expected literal', () => {
    expectTypeOf<VerifyAuthChallengeResponseTriggerSource>().toEqualTypeOf<'VerifyAuthChallengeResponse_Authentication'>();
  });
});

suite('VerifyAuthChallengeResponseResponse', () => {
  test('matches event response type', () => {
    expectTypeOf<VerifyAuthChallengeResponseResponse>().toEqualTypeOf<
      VerifyAuthChallengeResponseTriggerEvent['response']
    >();
  });
});

testCognitoTriggerTypes<
  VerifyAuthChallengeResponseTriggerSource,
  VerifyAuthChallengeResponseTriggerEvent,
  VerifyAuthChallengeResponseRequest,
  VerifyAuthChallengeResponseRequest<{ userAttributes: CustomAttributes }>,
  VerifyAuthChallengeResponseHandler,
  VerifyAuthChallengeResponseHandler<{ userAttributes: CustomAttributes }>,
  VerifyAuthChallengeResponseRouteDefinition
>('VerifyAuthChallengeResponse');
