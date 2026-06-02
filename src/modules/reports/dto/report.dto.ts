import type { z } from 'zod';
import type { reportQuerySchema } from '../validators/report.validation';

export type ReportQueryDto = z.infer<typeof reportQuerySchema>;
