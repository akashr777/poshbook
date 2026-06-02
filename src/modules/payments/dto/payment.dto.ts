import type { z } from 'zod';
import type { createPaymentSchema } from '../validators/payment.validation';

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
