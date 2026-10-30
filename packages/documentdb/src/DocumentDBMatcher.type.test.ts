import { createDocumentDBMatcher } from './DocumentDBMatcher.js';
import type {
  DocumentDBInsertRequest,
  DocumentDBRequest,
  DocumentDBRouteDefinition,
  DocumentDBUpdateRequest,
} from './types.js';

suite('route()', () => {
  test('narrows an inferred handler from the operationType filter', () => {
    createDocumentDBMatcher().route({
      filters: { operationType: 'insert' },
      handler: async ({ fullDocument }: DocumentDBInsertRequest): Promise<void> => {
        await Promise.resolve(fullDocument);
      },
    });
  });

  test('rejects an inferred handler the operationType filter does not deliver', () => {
    createDocumentDBMatcher().route({
      filters: { operationType: 'delete' },
      // @ts-expect-error - a delete change reaches this handler, and it cannot read one
      handler: async ({ fullDocument }: DocumentDBInsertRequest): Promise<void> => {
        await Promise.resolve(fullDocument);
      },
    });
  });

  test('hands an unfiltered inferred handler every operation', () => {
    createDocumentDBMatcher().route({
      filters: {},
      handler: async (request: DocumentDBRequest): Promise<void> => {
        await Promise.resolve(request.operationType);
      },
    });
  });
});

suite('DocumentDBRouteDefinition handler', () => {
  test('takes every operation the route can match', () => {
    type Request = Parameters<DocumentDBRouteDefinition['handler']>[0];

    expectTypeOf<Request>().toEqualTypeOf<DocumentDBRequest>();
  });

  test('rejects a handler typed to one operation, which the filters need not deliver', () => {
    const onInsert = async ({ fullDocument }: DocumentDBInsertRequest): Promise<void> => {
      await Promise.resolve(fullDocument);
    };

    const definition: DocumentDBRouteDefinition = {
      filters: { operationType: 'delete' },
      // @ts-expect-error - a delete change reaches this handler, and it cannot read one
      handler: onInsert,
    };

    expect(definition.handler).toBeTypeOf('function');
  });

  test('the documentKey, fullDocument and fullDocumentBeforeChange keys type the request', () => {
    type Request = DocumentDBUpdateRequest<{
      documentKey: { _id: string };
      fullDocument: { status: 'open' };
      fullDocumentBeforeChange: { status: 'closed' };
    }>;

    expectTypeOf<Request['documentKey']>().toEqualTypeOf<{ _id: string }>();
    expectTypeOf<Request['fullDocument']>().toEqualTypeOf<{ status: 'open' } | undefined>();
    expectTypeOf<Request['fullDocumentBeforeChange']>().toEqualTypeOf<{ status: 'closed' } | undefined>();
  });
});
