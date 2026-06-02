import type { Context } from 'hono';
import { fail, ok } from '../../../utils/responses';
import type { AppVariables } from '../../../types/app';
import { funderService } from '../services/funder.service';
import type {
  CreateFunderDto,
  CreateFunderTransactionDto,
  LedgerQueryDto,
  ListFundersQueryDto,
  UpdateFunderDto,
} from '../dto/funder.dto';

type FunderContext = Context<{ Variables: AppVariables }>;

function mapFunderForFrontend(funder: any) {
  return funder ? { ...funder, name: funder.funderName } : funder;
}

function knownError(c: FunderContext, err: unknown) {
  const code = (err as { code?: string }).code;
  if (code === 'FUNDER_CODE_EXISTS') return fail(c, { message: 'Funder code already exists', code }, 409);
  if (code === 'FUNDER_NOT_FOUND') return fail(c, { message: 'Funder not found', code }, 404);
  return fail(c, { message: 'Failed to process funder', code: 'FUNDER_OPERATION_FAILED' }, 400);
}

export const funderController = {
  async list(c: FunderContext) {
    const query = c.req.validated as ListFundersQueryDto;
    const result = await funderService.list(query);
    return ok(c, { ...result, items: result.items.map(mapFunderForFrontend) });
  },

  async getById(c: FunderContext) {
    const { id } = c.req.validatedParams as { id: number };
    const funder = await funderService.findById(id);
    if (!funder) return fail(c, { message: 'Funder not found', code: 'FUNDER_NOT_FOUND' }, 404);
    return ok(c, { item: mapFunderForFrontend(funder), funder: mapFunderForFrontend(funder) });
  },

  async create(c: FunderContext) {
    try {
      const funder = await funderService.create(c.req.validated as CreateFunderDto);
      return ok(c, { funder: mapFunderForFrontend(funder) }, 201);
    } catch (err) {
      return knownError(c, err);
    }
  },

  async update(c: FunderContext) {
    const { id } = c.req.validatedParams as { id: number };
    try {
      const funder = await funderService.update(id, c.req.validated as UpdateFunderDto);
      if (!funder) return fail(c, { message: 'Funder not found', code: 'FUNDER_NOT_FOUND' }, 404);
      return ok(c, { funder: mapFunderForFrontend(funder) });
    } catch (err) {
      return knownError(c, err);
    }
  },

  async remove(c: FunderContext) {
    const { id } = c.req.validatedParams as { id: number };
    const deleted = await funderService.remove(id);
    if (!deleted) return fail(c, { message: 'Funder not found', code: 'FUNDER_NOT_FOUND' }, 404);
    return ok(c, { deleted: true });
  },

  async createTransaction(c: FunderContext) {
    const { id } = c.req.validatedParams as { id: number };
    const authUser = c.get('user');
    try {
      const transaction = await funderService.createTransaction(
        id,
        c.req.validated as CreateFunderTransactionDto,
        Number(authUser.id)
      );
      return ok(c, { transaction }, 201);
    } catch (err) {
      return knownError(c, err);
    }
  },

  async ledger(c: FunderContext) {
    const { id } = c.req.validatedParams as { id: number };
    const result = await funderService.ledger(id, c.req.validated as LedgerQueryDto);
    if (!result) return fail(c, { message: 'Funder not found', code: 'FUNDER_NOT_FOUND' }, 404);
    return ok(c, { ...result, funder: mapFunderForFrontend(result.funder), items: result.transactions });
  },
};
