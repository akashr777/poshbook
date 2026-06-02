import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../../middlewares/auth/requirePermission';
import { validateRequest } from '../../../middlewares/validateRequest';
import { Permission } from '../../../utils/permissions';
import type { AppVariables } from '../../../types/app';
import { paymentController } from '../controllers/payment.controller';
import { createPaymentSchema } from '../validators/payment.validation';

export const paymentsRouter = new Hono<{ Variables: AppVariables }>();

paymentsRouter.use('*', jwtAuth);

paymentsRouter.post('/', requirePermission(Permission.PAYMENTS_CREATE), validateRequest(createPaymentSchema), (c) =>
  paymentController.create(c)
);
