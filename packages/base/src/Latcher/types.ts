import type { Context } from 'aws-lambda';

import type { TypeArg, TypeArgs } from '../utils/typeArgs.js';

export interface EventTypeMatcherCore<TEvent = unknown, TResult = unknown> {
  canHandleEvent(event: unknown): boolean | Promise<boolean>;
  handleEvent(event: TEvent, context: Context): Promise<TResult>;
  readonly matchTier?: 'catchAll' | 'fallback'; // Hack so custom envelope matchers with wide matchers go last
}

export interface EventTypeMatcherTypes {
  event?: unknown;
  result?: unknown;
}

interface EventTypeMatcherDefaults {
  event: unknown;
  result: unknown;
}

export type EventTypeMatcher<T extends TypeArgs<T, EventTypeMatcherTypes> = object> = EventTypeMatcherCore<
  TypeArg<T, 'event', EventTypeMatcherDefaults>,
  TypeArg<T, 'result', EventTypeMatcherDefaults>
>;
