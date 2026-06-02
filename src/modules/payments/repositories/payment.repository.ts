import { cashLedgerRepository } from '../../cash-ledger/cash-ledger.repository.js';
import type { CreatePaymentDto } from '../dto/payment.dto.js';

export const paymentRepository = {
  create(input: CreatePaymentDto, createdBy: number) {
    return cashLedgerRepository.create({
      ledgerDate: input.ledgerDate,
      module: input.module,
      referenceType: input.referenceType,
      referenceId: input.referenceId ?? null,
      direction: input.direction,
      amount: input.amount,
      paymentMode: input.paymentMode,
      notes: input.notes ?? null,
      createdBy,
    });
  },
};
