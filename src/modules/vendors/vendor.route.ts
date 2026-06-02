import { Hono } from 'hono';

import { jwtAuth } from '../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../middlewares/auth/requirePermission';
import { validateParams, validateRequest } from '../../middlewares/validateRequest';
import { Permission } from '../../utils/permissions';

import type { AppVariables } from '../../types/app';
import { vendorController } from './vendor.controller';
import {
  createVendorSchema,
  listVendorsQuerySchema,
  updateVendorSchema,
  vendorIdParamSchema,
} from './vendor.validation';

export const vendorsRouter = new Hono<{ Variables: AppVariables }>();

vendorsRouter.use('*', jwtAuth);

vendorsRouter.get(
  '/',
  requirePermission(Permission.VENDORS_LIST),
  validateRequest(listVendorsQuerySchema, 'query'),
  (c) => vendorController.list(c)
);

vendorsRouter.get(
  '/:id',
  requirePermission(Permission.VENDORS_READ),
  validateParams(vendorIdParamSchema),
  (c) => vendorController.getById(c)
);

vendorsRouter.post(
  '/',
  requirePermission(Permission.VENDORS_CREATE),
  validateRequest(createVendorSchema),
  (c) => vendorController.create(c)
);

vendorsRouter.put(
  '/:id',
  requirePermission(Permission.VENDORS_UPDATE),
  validateParams(vendorIdParamSchema),
  validateRequest(updateVendorSchema),
  (c) => vendorController.update(c)
);

vendorsRouter.delete(
  '/:id',
  requirePermission(Permission.VENDORS_DELETE),
  validateParams(vendorIdParamSchema),
  (c) => vendorController.remove(c)
);

