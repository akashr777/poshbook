import { paymentRepository } from '../repositories/payment.repository';
import type { CreatePaymentDto } from '../dto/payment.dto';

export const paymentService = {
  create(input: CreatePaymentDto, createdBy: number) {
    return paymentRepository.create(input, createdBy);
  },
};
