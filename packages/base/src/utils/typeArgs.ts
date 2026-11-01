// packages/testing/src/typeArgs.ts is a copy of this file. Keep both files the same.
export type TypeArg<TArgs, TKey extends keyof TDefaults, TDefaults> = TKey extends keyof TArgs
  ? TArgs[TKey]
  : TDefaults[TKey];

type OnlyKnownKeys<TArgs, TKnown> = {
  [K in keyof TArgs]: K extends keyof TKnown ? TKnown[K] : `'${K & string}' is not a type argument key`;
};

export type TypeArgs<TArgs, TKnown> = object & TKnown & OnlyKnownKeys<TArgs, TKnown>;
