import { Latcher } from '@latcher/base';
import type { Handler } from 'aws-lambda';

import { s3BatchMatcher, s3Matcher } from './s3.js';

const latcher = new Latcher({ matchers: [s3Matcher, s3BatchMatcher] });

export const handler: Handler = latcher.handler();
