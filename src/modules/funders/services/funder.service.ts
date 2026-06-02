import { db } from '../../../db';
import { cashLedgerRepository } from '../../cash-ledger/cash-ledger.repository';
import { funderRepository } from '../repositories/funder.repository';
import type {
  CreateFunderDto,
  CreateFunderTransactionDto,
  LedgerQueryDto,
  ListFundersQueryDto,
  UpdateFunderDto,
} from '../dto/funder.dto';

export const funderService = {
  async list(query: ListFundersQueryDto) {
    const { items, total } = await funderRepository.list(query);
    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  },

  findById(id: number) {
    return funderRepository.findById(id);
  },

  async create(input: CreateFunderDto) {
    const existing = await funderRepository.findByCode(input.funderCode);
    if (existing) throw Object.assign(new Error('Funder code already exists'), { code: 'FUNDER_CODE_EXISTS' });
    return funderRepository.create(input);
  },

  async update(id: number, input: UpdateFunderDto) {
    if (input.funderCode) {
      const existing = await funderRepository.findByCode(input.funderCode);
      if (existing && existing.id !== id) {
        throw Object.assign(new Error('Funder code already exists'), { code: 'FUNDER_CODE_EXISTS' });
      }
    }
    return funderRepository.update(id, input);
  },

  remove(id: number) {
    return funderRepository.delete(id);
  },

  async createTransaction(funderId: number, input: CreateFunderTransactionDto, createdBy: number) {
    return db.transaction(async (tx) => {
      const funder = await funderRepository.findById(funderId, tx as any);
      if (!funder) throw Object.assign(new Error('Funder not found'), { code: 'FUNDER_NOT_FOUND' });

      const transaction = await funderRepository.createTransaction(funderId, input, createdBy, tx as any);

      await cashLedgerRepository.create(
        {
          ledgerDate: input.transactionDate,
          module: 'FUNDERS',
          referenceType: 'funder_transactions',
          referenceId: transaction.id,
          direction: input.transactionType === 'FUND_IN' ? 'IN' : 'OUT',
          amount: input.amount,
          paymentMode: input.paymentMode,
          notes: input.notes ?? null,
          createdBy,
        },
        tx as any
      );

      return transaction;
    });
  },

  async ledger(id: number, query: LedgerQueryDto = {}) {
    const funder = await funderRepository.findById(id);
    if (!funder) return null;
    const ledger = await funderRepository.ledger(id, query);
    return { funder, ...ledger };
  },

  aggregate() {
    return funderRepository.aggregate();
  },
};
