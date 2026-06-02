import type { Context } from 'hono';
import { ok } from '../../../utils/responses.js';
import type { AppVariables } from '../../../types/app.js';
import { paymentService } from '../services/payment.service.js';
import type { CreatePaymentDto } from '../dto/payment.dto.js';

type PaymentContext = Context<{ Variables: AppVariables }>;

export const paymentController = {
  async create(c: PaymentContext) {
    const authUser = c.get('user');
    const payment = await paymentService.create(c.req.validated as CreatePaymentDto, Number(authUser.id));
    return ok(c, { payment }, 201);
  },
};
