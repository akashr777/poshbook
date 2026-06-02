import { Hono } from 'hono';

import { jwtAuth } from '../../middlewares/auth/jwtAuth';
import { requirePermission } from '../../middlewares/auth/requirePermission';

import { Permission } from '../../utils/permissions';

import { vehicleController } from './vehicle.controller';

import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema,
  vehicleIdParamSchema
} from './vehicle.validation';

import {
  validateParams,
  validateRequest
} from '../../middlewares/validateRequest';

import type { AppVariables } from '../../types/app';

// ✅ ONLY DAYBOOK ROUTES NOW
import { daybookRouter } from '../daybook/daybook.route';

export const vehiclesRouter =
  new Hono<{ Variables: AppVariables }>();

// ======================================================
// AUTH
// ======================================================

vehiclesRouter.use('*', jwtAuth);

// ======================================================
// VEHICLE CRUD
// ======================================================

// GET ALL VEHICLES
vehiclesRouter.get(
  '/',
  requirePermission(Permission.VEHICLES_LIST),
  validateRequest(listVehiclesQuerySchema, 'query'),
  (c) => vehicleController.list(c)
);

// GET SINGLE VEHICLE
vehiclesRouter.get(
  '/:id',
  requirePermission(Permission.VEHICLES_READ),
  validateParams(vehicleIdParamSchema),
  (c) => vehicleController.getById(c)
);

// CREATE VEHICLE
vehiclesRouter.post(
  '/',
  requirePermission(Permission.VEHICLES_CREATE),
  validateRequest(createVehicleSchema),
  (c) => vehicleController.create(c)
);

// UPDATE VEHICLE
vehiclesRouter.put(
  '/:id',
  requirePermission(Permission.VEHICLES_UPDATE),
  validateParams(vehicleIdParamSchema),
  validateRequest(updateVehicleSchema),
  (c) => vehicleController.update(c)
);

// DELETE VEHICLE
vehiclesRouter.delete(
  '/:id',
  requirePermission(Permission.VEHICLES_DELETE),
  validateParams(vehicleIdParamSchema),
  (c) => vehicleController.remove(c)
);

// ======================================================
// DAYBOOK ROUTES
// ======================================================

// Example:
// /vehicles/1/daybook
// /vehicles/1/daybook/summary

vehiclesRouter.route(
  '/:vehicleId/daybook',
  daybookRouter
);