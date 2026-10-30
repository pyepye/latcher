import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { documentDBMatcher } from './documentdb.js';

const latcher = new Latcher({ matchers: [documentDBMatcher] });

export const handler: Handler = latcher.handler();
