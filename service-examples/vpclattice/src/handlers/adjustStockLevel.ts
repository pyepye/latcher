import { logger } from '@latcher/base';
import { type ApiRequest, type ApiResponse, NotFound, Ok } from '@latcher/vpclattice';

import { STOCK } from '../utils/inventory.js';
import type { TStockAdjustment } from '../utils/schemas.js';

export async function adjustStockLevel(
  request: ApiRequest<{ path: { sku: string }; body: TStockAdjustment }>,
): Promise<ApiResponse<{ body: { sku: string; quantity: number } }>> {
  const item = STOCK[request.path.sku];
  if (!item) throw NotFound(`SKU ${request.path.sku} is not stocked`);

  logger.info({ message: 'Stock adjusted', sku: item.sku, delta: request.body.delta });

  return Ok({ sku: item.sku, quantity: item.quantity + request.body.delta });
}
