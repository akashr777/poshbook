import type { Context } from 'hono';
import { fail, ok } from '../../../utils/responses';
import type { AppVariables } from '../../../types/app';
import { vendorLedgerService } from '../services/vendor-ledger.service';
import type { CreateVendorPaymentDto, CreateVendorPurchaseDto, VendorLedgerQueryDto } from '../dto/vendor-ledger.dto';

type VendorLedgerContext = Context<{ Variables: AppVariables }>;

function knownError(c: VendorLedgerContext, err: unknown) {
  const code = (err as { code?: string }).code;
  if (code === 'VENDOR_NOT_FOUND') return fail(c, { message: 'Vendor not found', code }, 404);
  return fail(c, { message: 'Failed to process vendor ledger', code: 'VENDOR_LEDGER_OPERATION_FAILED' }, 400);
}

export const vendorLedgerController = {
  async ledger(c: VendorLedgerContext) {
    const { id } = c.req.validatedParams as { id: number };
    const ledger = await vendorLedgerService.ledger(id, c.req.validated as VendorLedgerQueryDto);
    if (!ledger) return fail(c, { message: 'Vendor not found', code: 'VENDOR_NOT_FOUND' }, 404);
    return ok(c, ledger);
  },

  async createPurchase(c: VendorLedgerContext) {
    const { id } = c.req.validatedParams as { id: number };
    const authUser = c.get('user');
    try {
      const purchase = await vendorLedgerService.createPurchase(id, c.req.validated as CreateVendorPurchaseDto, Number(authUser.id));
      return ok(c, { purchase }, 201);
    } catch (err) {
      return knownError(c, err);
    }
  },

  async createPayment(c: VendorLedgerContext) {
    const { id } = c.req.validatedParams as { id: number };
    const authUser = c.get('user');
    try {
      const payment = await vendorLedgerService.createPayment(id, c.req.validated as CreateVendorPaymentDto, Number(authUser.id));
      return ok(c, { payment }, 201);
    } catch (err) {
      return knownError(c, err);
    }
  },
};
