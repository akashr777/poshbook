import type { z } from 'zod';
import type { reportQuerySchema } from '../validators/report.validation.js';

export type ReportQueryDto = z.infer<typeof reportQuerySchema>;
