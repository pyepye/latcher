import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { activeMqMatcher } from './activeMq.js';

const latcher = new Latcher({ matchers: [activeMqMatcher] });

export const handler: Handler = latcher.handler();
