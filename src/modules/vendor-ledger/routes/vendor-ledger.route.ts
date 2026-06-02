import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth.js';
import { requirePermission } from '../../../middlewares/auth/requirePermission.js';
import { validateParams, validateRequest } from '../../../middlewares/validateRequest.js';
import { Permission } from '../../../utils/permissions.js';
import type { AppVariables } from '../../../types/app.js';
import { vendorLedgerController } from '../controllers/vendor-ledger.controller.js';
import {
  createVendorPaymentSchema,
  createVendorPurchaseSchema,
  vendorLedgerQuerySchema,
  vendorLedgerVendorParamSchema,
} from '../validators/vendor-ledger.validation.js';

export const vendorLedgerRouter = new Hono<{ Variables: AppVariables }>();

vendorLedgerRouter.use('*', jwtAuth);

vendorLedgerRouter.get(
  '/:id/ledger',
  requirePermission(Permission.VENDORS_VIEW),
  validateParams(vendorLedgerVendorParamSchema),
  validateRequest(vendorLedgerQuerySchema, 'query'),
  (c) => vendorLedgerController.ledger(c)
);
vendorLedgerRouter.post(
  '/:id/purchases',
  requirePermission(Permission.VENDORS_CREATE),
  validateParams(vendorLedgerVendorParamSchema),
  validateRequest(createVendorPurchaseSchema),
  (c) => vendorLedgerController.createPurchase(c)
);
vendorLedgerRouter.post(
  '/:id/payments',
  requirePermission(Permission.VENDORS_CREATE),
  validateParams(vendorLedgerVendorParamSchema),
  validateRequest(createVendorPaymentSchema),
  (c) => vendorLedgerController.createPayment(c)
);
