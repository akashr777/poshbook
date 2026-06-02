import type { z } from 'zod';
import type { createPaymentSchema } from '../validators/payment.validation.js';

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
