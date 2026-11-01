import type { StandardSchemaV1 } from '@standard-schema/spec';
import { vi } from 'vitest';

import type { TypeArg, TypeArgs } from './typeArgs.js';

type MockSchemaCore<TOutput = unknown> = StandardSchemaV1<unknown, TOutput> & {
  '~standard': { validate: ReturnType<typeof vi.fn> };
};

export interface MockSchemaTypes {
  output?: unknown;
}

interface MockSchemaDefaults {
  output: unknown;
}

export type MockSchema<T extends TypeArgs<T, MockSchemaTypes> = object> = MockSchemaCore<
  TypeArg<T, 'output', MockSchemaDefaults>
>;

export function createMockSchema<TOutput = unknown>(): MockSchemaCore<TOutput>;
export function createMockSchema<TOutput = unknown>(result: StandardSchemaV1.Result<TOutput>): MockSchemaCore<TOutput>;
export function createMockSchema<TOutput = unknown>(
  result?: StandardSchemaV1.Result<TOutput>,
): MockSchemaCore<TOutput> {
  return {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: result ? vi.fn(() => result) : vi.fn((input: unknown) => ({ value: input as TOutput })),
    },
  };
}
