import type { z } from 'zod';
import type {
  createVendorPaymentSchema,
  createVendorPurchaseSchema,
  vendorLedgerQuerySchema,
} from '../validators/vendor-ledger.validation';

export type CreateVendorPurchaseDto = z.infer<typeof createVendorPurchaseSchema>;
export type CreateVendorPaymentDto = z.infer<typeof createVendorPaymentSchema>;
export type VendorLedgerQueryDto = z.infer<typeof vendorLedgerQuerySchema>;
