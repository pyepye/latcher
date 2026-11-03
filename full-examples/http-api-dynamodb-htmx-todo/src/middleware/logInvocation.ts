import type { HTTPMiddleware } from '@latcher/apigateway';
import { logger } from '@latcher/base';

export const logSiteInvocation: HTTPMiddleware = async (request, next) => {
  logger.info({
    message: 'Handling site request',
    method: request.method,
    path: request.rawPath,
    isHtmxRequest: request.headers['hx-request'] === 'true',
  });
  return next(request);
};
