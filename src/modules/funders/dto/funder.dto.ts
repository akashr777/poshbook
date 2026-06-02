import type { z } from 'zod';
import type {
  createFunderSchema,
  createFunderTransactionSchema,
  ledgerQuerySchema,
  listFundersQuerySchema,
  updateFunderSchema,
} from '../validators/funder.validation.js';

export type CreateFunderDto = z.infer<typeof createFunderSchema>;
export type UpdateFunderDto = z.infer<typeof updateFunderSchema>;
export type ListFundersQueryDto = z.infer<typeof listFundersQuerySchema>;
export type CreateFunderTransactionDto = z.infer<typeof createFunderTransactionSchema>;
export type LedgerQueryDto = z.infer<typeof ledgerQuerySchema>;
