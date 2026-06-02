import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth.js';
import { requirePermission } from '../../../middlewares/auth/requirePermission.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import { Permission } from '../../../utils/permissions.js';
import type { AppVariables } from '../../../types/app.js';
import { paymentController } from '../controllers/payment.controller.js';
import { createPaymentSchema } from '../validators/payment.validation.js';

export const paymentsRouter = new Hono<{ Variables: AppVariables }>();

paymentsRouter.use('*', jwtAuth);

paymentsRouter.post('/', requirePermission(Permission.PAYMENTS_CREATE), validateRequest(createPaymentSchema), (c) =>
  paymentController.create(c)
);
