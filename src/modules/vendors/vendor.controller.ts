import type { Context } from 'hono';
import { fail, ok } from '../../utils/responses.js';
import { auditFromContext } from '../audit/index.js';
import type { AppVariables } from '../../types/app.js';
import type { VendorCreateInput, VendorListResult, VendorUpdateInput, VendorsQueryInput } from './vendor.types.js';
import { vendorService } from './vendor.service.js';

type VendorsContext = Context<{ Variables: AppVariables }>;

function handleKnownError(c: VendorsContext, err: unknown) {
  const code = (err as { code?: string }).code;

  if (code === 'VENDOR_CODE_EXISTS') {
    return fail(c, { message: 'Vendor code already exists', code }, 409);
  }

  return fail(c, { message: 'Failed to process vendor', code: 'VENDOR_OPERATION_FAILED' }, 400);
}

export const vendorController = {
  async list(c: VendorsContext) {
    const query = c.req.validated as VendorsQueryInput;
    const result = await vendorService.list(query);
    return ok(c, result);
  },

  async getById(c: VendorsContext) {
    const { id } = c.req.validatedParams as { id: number };
    const vendor = await vendorService.findById(id);
    if (!vendor) {
      return fail(c, { message: 'Vendor not found', code: 'VENDOR_NOT_FOUND' }, 404);
    }
    return ok(c, { vendor });
  },

  async create(c: VendorsContext) {
    const input = c.req.validated as VendorCreateInput;
    const authUser = c.get('user');

    try {
      const vendor = await vendorService.create(input);

      await auditFromContext(c, {
        action: 'vendors.created',
        actorUserId: Number(authUser.id),

        targetUserId: undefined,
        metadata: { vendorId: vendor.id, vendorCode: vendor.vendorCode, name: vendor.name },
      });

      return ok(c, { vendor }, 201);
    } catch (err) {
      return handleKnownError(c, err);
    }
  },

  async update(c: VendorsContext) {
    const { id } = c.req.validatedParams as { id: number };
    const input = c.req.validated as VendorUpdateInput;
    const authUser = c.get('user');

    try {
      const updated = await vendorService.update(id, input);
      if (!updated) {
        return fail(c, { message: 'Vendor not found', code: 'VENDOR_NOT_FOUND' }, 404);
      }

      await auditFromContext(c, {
        action: 'vendors.updated',
        actorUserId: Number(authUser.id),
        targetUserId: undefined,
        metadata: { vendorId: updated.id, fields: Object.keys(input) },
      });

      return ok(c, { vendor: updated });
    } catch (err) {
      return handleKnownError(c, err);
    }
  },

  async remove(c: VendorsContext) {
    const { id } = c.req.validatedParams as { id: number };
    const authUser = c.get('user');

    const deleted = await vendorService.remove(id);
    if (!deleted) {
      return fail(c, { message: 'Vendor not found', code: 'VENDOR_NOT_FOUND' }, 404);
    }

    await auditFromContext(c, {
      action: 'vendors.deleted',
      actorUserId: Number(authUser.id),
      targetUserId: undefined,
      metadata: { vendorId: id },
    });

    return ok(c, { deleted: true });
  },
};

