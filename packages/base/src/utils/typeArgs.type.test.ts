import type { TypeArg, TypeArgs } from './typeArgs.js';

interface Order {
  id: string;
}

type Attributes = Record<string, string>;

interface BoxCore<TBody, TAttributes> {
  body: TBody;
  attributes: TAttributes;
}

type BoxHandlerCore<TBody, TAttributes> = (box: BoxCore<TBody, TAttributes>) => Promise<void>;

interface BoxTypes {
  body?: unknown;
  attributes?: unknown;
}

interface BoxDefaults {
  body: unknown;
  attributes: Attributes;
}

type Box<T extends TypeArgs<T, BoxTypes> = object> = BoxCore<
  TypeArg<T, 'body', BoxDefaults>,
  TypeArg<T, 'attributes', BoxDefaults>
>;

function defineHandler<TBody>(config: {
  handler: BoxHandlerCore<TBody, Attributes>;
}): BoxHandlerCore<TBody, Attributes> {
  return config.handler;
}

async function handleOrder(_box: Box<{ body: Order }>): Promise<void> {}

function forwards<T extends TypeArgs<T, BoxTypes>>(box: Box<T>): unknown {
  return box.body;
}

suite('TypeArgs', () => {
  test('a key types its property', () => {
    expectTypeOf<Box<{ body: Order }>['body']>().toEqualTypeOf<Order>();
  });

  test('a key left out keeps its default', () => {
    expectTypeOf<Box<{ body: Order }>['attributes']>().toEqualTypeOf<Attributes>();
    expectTypeOf<Box['body']>().toEqualTypeOf<unknown>();
  });

  test('a typed value assigns to the default', () => {
    expectTypeOf<Box<{ body: Order }>>().toExtend<Box>();
  });

  test('an explicit undefined value is kept', () => {
    expectTypeOf<Box<{ body: undefined }>['body']>().toEqualTypeOf<undefined>();
  });

  test('a misspelt key next to a correct one fails', () => {
    // @ts-expect-error 'bdy' is not a type argument key
    type MisspeltKey = Box<{ body: Order; bdy: Order }>;

    expectTypeOf<MisspeltKey>().not.toBeAny();
  });

  test('the type without the object fails', () => {
    // @ts-expect-error an object type is not a type argument object
    type NoObject = Box<Order>;

    expectTypeOf<NoObject>().not.toBeAny();
  });

  test('a primitive fails', () => {
    // @ts-expect-error a primitive is not a type argument object
    type Primitive = Box<string>;

    expectTypeOf<Primitive>().not.toBeAny();
  });

  test('a generic forwards its type arguments', () => {
    expectTypeOf(forwards<{ body: Order }>)
      .parameter(0)
      .toEqualTypeOf<Box<{ body: Order }>>();
  });

  test('a core-typed function infers the key type', () => {
    const handler = defineHandler({ handler: handleOrder });

    expectTypeOf(handler).toEqualTypeOf<BoxHandlerCore<Order, Attributes>>();
  });
});
