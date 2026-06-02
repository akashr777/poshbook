import { Hono } from 'hono';
import { jwtAuth } from '../../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../../middlewares/auth/requirePermission';
import { validateParams, validateRequest } from '../../../middlewares/validateRequest';
import { Permission } from '../../../utils/permissions';
import type { AppVariables } from '../../../types/app';
import { funderController } from '../controllers/funder.controller';
import {
  createFunderSchema,
  createFunderTransactionSchema,
  funderIdParamSchema,
  ledgerQuerySchema,
  listFundersQuerySchema,
  updateFunderSchema,
} from '../validators/funder.validation';

export const fundersRouter = new Hono<{ Variables: AppVariables }>();

fundersRouter.use('*', jwtAuth);

fundersRouter.get('/', requirePermission(Permission.FUNDERS_VIEW), validateRequest(listFundersQuerySchema, 'query'), (c) =>
  funderController.list(c)
);
fundersRouter.get('/:id', requirePermission(Permission.FUNDERS_VIEW), validateParams(funderIdParamSchema), (c) =>
  funderController.getById(c)
);
fundersRouter.post('/', requirePermission(Permission.FUNDERS_CREATE), validateRequest(createFunderSchema), (c) =>
  funderController.create(c)
);
fundersRouter.put(
  '/:id',
  requirePermission(Permission.FUNDERS_UPDATE),
  validateParams(funderIdParamSchema),
  validateRequest(updateFunderSchema),
  (c) => funderController.update(c)
);
fundersRouter.delete('/:id', requirePermission(Permission.FUNDERS_DELETE), validateParams(funderIdParamSchema), (c) =>
  funderController.remove(c)
);
fundersRouter.get(
  '/:id/ledger',
  requirePermission(Permission.FUNDERS_VIEW),
  validateParams(funderIdParamSchema),
  validateRequest(ledgerQuerySchema, 'query'),
  (c) => funderController.ledger(c)
);
fundersRouter.get(
  '/:id/transactions',
  requirePermission(Permission.FUNDERS_VIEW),
  validateParams(funderIdParamSchema),
  validateRequest(ledgerQuerySchema, 'query'),
  (c) => funderController.ledger(c)
);
fundersRouter.post(
  '/:id/transactions',
  requirePermission(Permission.FUNDERS_CREATE),
  validateParams(funderIdParamSchema),
  validateRequest(createFunderTransactionSchema),
  (c) => funderController.createTransaction(c)
);
