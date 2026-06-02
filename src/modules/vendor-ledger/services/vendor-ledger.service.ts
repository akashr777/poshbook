import { db } from '../../../db';
import { cashLedgerRepository } from '../../cash-ledger/cash-ledger.repository';
import { vendorLedgerRepository } from '../repositories/vendor-ledger.repository';
import type { CreateVendorPaymentDto, CreateVendorPurchaseDto, VendorLedgerQueryDto } from '../dto/vendor-ledger.dto';

function vendorNotFound() {
  return Object.assign(new Error('Vendor not found'), { code: 'VENDOR_NOT_FOUND' });
}

export const vendorLedgerService = {
  async createPurchase(vendorId: number, input: CreateVendorPurchaseDto, createdBy: number) {
    return db.transaction(async (tx) => {
      if (!(await vendorLedgerRepository.vendorExists(vendorId, tx as any))) throw vendorNotFound();
      const purchase = await vendorLedgerRepository.createPurchase(vendorId, input, createdBy, tx as any);
      await cashLedgerRepository.create(
        {
          ledgerDate: input.purchaseDate,
          module: 'VENDORS',
          referenceType: 'vendor_purchases',
          referenceId: purchase.id,
          direction: 'OUT',
          amount: input.amount,
          paymentMode: input.paymentMode,
          notes: input.notes ?? null,
          createdBy,
        },
        tx as any
      );
      return purchase;
    });
  },

  async createPayment(vendorId: number, input: CreateVendorPaymentDto, createdBy: number) {
    return db.transaction(async (tx) => {
      if (!(await vendorLedgerRepository.vendorExists(vendorId, tx as any))) throw vendorNotFound();
      const payment = await vendorLedgerRepository.createPayment(vendorId, input, createdBy, tx as any);
      await cashLedgerRepository.create(
        {
          ledgerDate: input.paidDate,
          module: 'VENDORS',
          referenceType: 'vendor_payments',
          referenceId: payment.id,
          direction: 'OUT',
          amount: input.amount,
          paymentMode: input.paymentMode,
          notes: input.notes ?? null,
          createdBy,
        },
        tx as any
      );
      return payment;
    });
  },

  async ledger(vendorId: number, query: VendorLedgerQueryDto = {}) {
    if (!(await vendorLedgerRepository.vendorExists(vendorId))) return null;
    return vendorLedgerRepository.ledger(vendorId, query);
  },

  aggregateDue() {
    return vendorLedgerRepository.aggregateDue();
  },
};
