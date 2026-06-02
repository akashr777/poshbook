import { paymentRepository } from '../repositories/payment.repository.js';
import type { CreatePaymentDto } from '../dto/payment.dto.js';

export const paymentService = {
  create(input: CreatePaymentDto, createdBy: number) {
    return paymentRepository.create(input, createdBy);
  },
};
