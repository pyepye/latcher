import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { eventBridgeMatcher } from './eventbridge.js';

const latcher = new Latcher({ matchers: [eventBridgeMatcher] });

export const handler: Handler = latcher.handler();
