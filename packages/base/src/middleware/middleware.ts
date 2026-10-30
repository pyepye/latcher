import type { TypeArg, TypeArgs } from '../utils/typeArgs.js';

export type MiddlewareCore<TRequest, TResponse> = (
  request: TRequest,
  next: (request: unknown) => Promise<TResponse>,
) => Promise<TResponse>;

export interface MiddlewareTypes {
  request: unknown;
  response: unknown;
}

export type Middleware<T extends TypeArgs<T, MiddlewareTypes>> = MiddlewareCore<
  TypeArg<T, 'request', MiddlewareTypes>,
  TypeArg<T, 'response', MiddlewareTypes>
>;

export async function handleEventWithMiddleware<TRequest, TResponse>(
  middleware: MiddlewareCore<TRequest, TResponse>[],
  request: TRequest,
  handler: (request: TRequest) => Promise<TResponse>,
): Promise<TResponse> {
  let index = 0;

  async function next(req: unknown): Promise<TResponse> {
    const currentIndex = index;
    if (currentIndex > middleware.length) {
      throw new Error('next() called multiple times within a single middleware');
    }
    index++;

    const forwarded = req as TRequest; // A middleware can pass anything to `next`, which is what the handler receives

    const currentMiddleware = middleware[currentIndex];
    if (currentMiddleware) {
      return currentMiddleware(forwarded, next);
    }
    return handler(forwarded);
  }

  return next(request);
}
