import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { inventoryMatcher } from './inventoryMatcher.js';

const latcher = new Latcher({ matchers: [inventoryMatcher] });

export const handler: Handler = latcher.handler();
