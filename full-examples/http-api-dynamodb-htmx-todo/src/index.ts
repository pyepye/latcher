import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { siteMatcher } from './site.js';

const latcher = new Latcher({ matchers: [siteMatcher] });

export const handler: Handler = latcher.handler();
