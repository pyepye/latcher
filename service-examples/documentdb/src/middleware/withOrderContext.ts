import { logger } from '@latcher/base';
import type { DocumentDBMiddleware } from '@latcher/documentdb';

import type { TDocumentKey, TOrder } from '../utils/schemas.js';

// Route middleware for the orders collection. Typed to the route's documents so it slots onto
// createOrder without widening it.
export const withOrderContext: DocumentDBMiddleware<{ documentKey: TDocumentKey; fullDocument: TOrder }> = async (
  request,
  next,
) => {
  logger.info({ message: 'Order change received', orderId: request.documentKey._id.$oid });
  await next(request);
};
