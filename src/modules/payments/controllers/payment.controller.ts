import type { Context } from 'hono';
import { ok } from '../../../utils/responses';
import type { AppVariables } from '../../../types/app';
import { paymentService } from '../services/payment.service';
import type { CreatePaymentDto } from '../dto/payment.dto';

type PaymentContext = Context<{ Variables: AppVariables }>;

export const paymentController = {
  async create(c: PaymentContext) {
    const authUser = c.get('user');
    const payment = await paymentService.create(c.req.validated as CreatePaymentDto, Number(authUser.id));
    return ok(c, { payment }, 201);
  },
};
