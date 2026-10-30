import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { lexMatcher } from './lex.js';

const latcher = new Latcher({ matchers: [lexMatcher] });

export const handler: Handler = latcher.handler();
