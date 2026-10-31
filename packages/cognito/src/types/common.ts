import type { PreSignUpTriggerEvent } from 'aws-lambda';

import type { FilterStringMatcher, TypeArg, TypeArgs } from '@latcher/base';

// User attributes type - derived from aws-lambda
export type UserAttributes = NonNullable<PreSignUpTriggerEvent['request']['userAttributes']>;

// User attribute filter - can be exact match, RegExp, or function
export type UserAttributeFilter = string | RegExp | ((value: string) => boolean);

export interface CognitoTypes {
  userAttributes?: unknown;
}

export interface CognitoDefaults {
  userAttributes: UserAttributes;
}

export interface CognitoFilterTypes {
  triggerSource?: string;
}

interface CognitoFilterDefaults {
  triggerSource: string;
}

// Filter input for custom filters - uses types derived from aws-lambda
// TODO: is TTriggerSource a string really?
export interface CognitoFilterInputCore<TTriggerSource extends string = string> {
  triggerSource: TTriggerSource;
  userPoolId: PreSignUpTriggerEvent['userPoolId'];
  userName: PreSignUpTriggerEvent['userName'];
  callerContext: PreSignUpTriggerEvent['callerContext'];
  request: {
    userAttributes?: UserAttributes;
  };
  event: unknown;
}

// Filters for routing
export interface CognitoFiltersCore<TTriggerSource extends string = string> {
  triggerSource?: TTriggerSource | TTriggerSource[];
  userPoolId?: FilterStringMatcher;
  clientId?: FilterStringMatcher;
  userAttributes?: Record<string, FilterStringMatcher>;
  custom?: (input: CognitoFilterInputCore<TTriggerSource>) => boolean | Promise<boolean>;
}

export type CognitoFilterInput<T extends TypeArgs<T, CognitoFilterTypes> = object> = CognitoFilterInputCore<
  Extract<TypeArg<T, 'triggerSource', CognitoFilterDefaults>, string>
>;

export type CognitoFilters<T extends TypeArgs<T, CognitoFilterTypes> = object> = CognitoFiltersCore<
  Extract<TypeArg<T, 'triggerSource', CognitoFilterDefaults>, string>
>;

// Generic route definition (used internally by the matcher)
// Trigger-specific route definitions are in their respective type files
