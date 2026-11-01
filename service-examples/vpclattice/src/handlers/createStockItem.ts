import { logger } from '@latcher/base';
import { type ApiRequest, type ApiResponse, Conflict, Created } from '@latcher/vpclattice';

import { STOCK, type StockItem } from '../utils/inventory.js';
import type { TNewStockItem } from '../utils/schemas.js';

export async function createStockItem(
  request: ApiRequest<{ body: TNewStockItem }>,
): Promise<ApiResponse<{ body: StockItem }>> {
  const { sku, description, quantity } = request.body;
  if (STOCK[sku]) throw Conflict(`SKU ${sku} is already stocked`);

  logger.info({ message: 'Stock item created', sku, quantity });

  return Created({ sku, description, quantity, depot: 'leeds' });
}
