import { logger } from '@latcher/base';
import { type ApiRequest, type ApiResponse, Conflict, NoContent, NotFound } from '@latcher/vpclattice';

import { STOCK } from '../utils/inventory.js';

// A SKU can only be discarded once its stock is down to nothing, so a SKU that still holds units
// answers 409.
export async function discardStockItem(
  request: ApiRequest<{ path: { sku: string } }>,
): Promise<ApiResponse<{ body: undefined }>> {
  const item = STOCK[request.path.sku];
  if (!item) throw NotFound(`SKU ${request.path.sku} is not stocked`);

  if (item.quantity > 0) {
    throw Conflict(`SKU ${item.sku} still holds ${item.quantity} units`);
  }

  logger.info({ message: 'Stock item discarded', sku: item.sku });

  return NoContent();
}
