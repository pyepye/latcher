import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { snsMatcher } from './sns.js';

const latcher = new Latcher({ matchers: [snsMatcher] });

export const handler: Handler = latcher.handler();
