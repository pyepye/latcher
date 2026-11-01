import type { PreSignUpTriggerEvent, S3BatchEventTask } from 'aws-lambda';

import type { CognitoHandlerEvent, EventBridgeEvent, MockSchema, S3BatchTaskOverrides } from './index.js';
import { createCognitoPreSignUpHandlerEvent, createMockSchema, createS3BatchTask } from './index.js';

suite('testing package type exports', () => {
  test('MockSchema is the return type of createMockSchema', () => {
    expectTypeOf(createMockSchema<string>()).toEqualTypeOf<MockSchema<{ output: string }>>();
  });

  test('EventBridgeEvent types detail with the detail key', () => {
    expectTypeOf<EventBridgeEvent<{ detail: { orderId: string } }>['detail']>().toEqualTypeOf<{ orderId: string }>();
  });

  test('CognitoHandlerEvent is the return type of the Cognito handler event builders', () => {
    expectTypeOf(createCognitoPreSignUpHandlerEvent()).toEqualTypeOf<
      CognitoHandlerEvent<{ event: PreSignUpTriggerEvent }>
    >();
  });

  test('S3BatchTaskOverrides is the parameter type of createS3BatchTask', () => {
    const overrides: S3BatchTaskOverrides = { s3Key: 'orders/1.json' };

    expectTypeOf(createS3BatchTask(overrides)).toEqualTypeOf<S3BatchEventTask>();
  });
});
