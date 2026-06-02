import { z } from 'zod';

export const vehicleStatusSchema = z.enum(['available', 'booked', 'sold', 'hidden', 'ACTIVE', 'SOLD', 'EXCHANGED']);
export const fuelTypeSchema = z.enum(['Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric', 'LPG', 'Other']);
export const transmissionSchema = z.enum(['M/T', 'A/T', 'CVT', 'DCT', 'Other']);
export const insuranceStatusSchema = z.enum(['Valid', 'Expired', 'Pending']);

const vehicleDocumentHolderSchema = z
  .string()
  .trim()
  .max(100)
  .default('');

const vehicleDocumentSchema = z
  .object({
    available: z.boolean(),
    holder: vehicleDocumentHolderSchema,
  })
  .superRefine((doc, ctx) => {
    // premium validation
    if (doc.available) {
      if (!doc.holder || doc.holder.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['holder'],
          message: 'Holder is required when document is available',
        });
      }
    } else {
      // when not available, holder should be empty
      if (doc.holder && doc.holder.trim().length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['holder'],
          message: 'Holder must be empty when document is not available',
        });
      }
    }
  });

const vehicleDocumentsSchema = z
  .object({
    rc: vehicleDocumentSchema,
    noc: vehicleDocumentSchema,
    insurance: vehicleDocumentSchema,
    pollution: vehicleDocumentSchema,
    bankNoc: vehicleDocumentSchema,
    secondKey: vehicleDocumentSchema,
  })
  .default({
    rc: { available: false, holder: '' },
    noc: { available: false, holder: '' },
    insurance: { available: false, holder: '' },
    pollution: { available: false, holder: '' },
    bankNoc: { available: false, holder: '' },
    secondKey: { available: false, holder: '' },
  });

export const createVehicleSchema = z
  .object({
    vehicleName: z.string().min(1).max(200),
    brand: z.string().min(1).max(100),
    variant: z.string().min(1).max(150),
    modelYear: z.string().min(1).max(30),
    fuelType: fuelTypeSchema,
    transmission: transmissionSchema,
    color: z.string().min(1).max(100),
    kmDriven: z.coerce.number().int().min(0),
    ownershipCount: z.coerce.number().int().min(1),
    insuranceStatus: insuranceStatusSchema,
    askingPrice: z.coerce.number().positive(),
    purchasePrice: z.coerce.number().positive(),
    description: z.string().min(10).max(2000),
    status: vehicleStatusSchema.default('available'),
    isSold: z.boolean().optional(),
    soldPrice: z.coerce.number().positive().optional().nullable(),
    documents: vehicleDocumentsSchema,
  })
  .superRefine((input, ctx) => {
    if (input.status === 'sold' && (input.soldPrice === undefined || input.soldPrice === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['soldPrice'],
        message: 'Sold vehicles require a soldPrice'
      });
    }

    if (input.status !== 'sold' && input.soldPrice != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['soldPrice'],
        message: 'soldPrice can only be set when status is sold'
      });
    }
  });

export const updateVehicleSchema = z
  .object({
    vehicleName: z.string().min(1).max(200).optional(),
    brand: z.string().min(1).max(100).optional(),
    variant: z.string().min(1).max(150).optional(),
    modelYear: z.string().min(1).max(30).optional(),
    fuelType: fuelTypeSchema.optional(),
    transmission: transmissionSchema.optional(),
    color: z.string().min(1).max(100).optional(),
    kmDriven: z.coerce.number().int().min(0).optional(),
    ownershipCount: z.coerce.number().int().min(1).optional(),
    insuranceStatus: insuranceStatusSchema.optional(),
    askingPrice: z.coerce.number().positive().optional(),
    purchasePrice: z.coerce.number().positive().optional(),
    description: z.string().min(10).max(2000).optional(),
    status: vehicleStatusSchema.optional(),
    isSold: z.boolean().optional(),
    soldPrice: z.coerce.number().positive().optional().nullable(),
    documents: vehicleDocumentsSchema.optional(),
  })
  .superRefine((input, ctx) => {
    if (input.status === 'sold' && (input.soldPrice === undefined || input.soldPrice === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['soldPrice'],
        message: 'Sold vehicles require a soldPrice'
      });
    }

    if (input.status !== 'sold' && input.soldPrice != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['soldPrice'],
        message: 'soldPrice can only be set when status is sold'
      });
    }
  });

export const listVehiclesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  fuelType: fuelTypeSchema.optional(),
  transmission: transmissionSchema.optional(),
  status: vehicleStatusSchema.optional(),
  sortBy: z.enum(['createdAt', 'askingPrice', 'kmDriven', 'vehicleName', 'brand']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const vehicleIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});
