import { z } from 'zod';

export const PlannerTimeSchema = z
  .object({
    id: z.string(),
    year: z.string(),
    semester: z.number(),
    index: z.number(),
    moduleCode: z.string().optional(),
    placeholderId: z.string().optional(),
  })
  .refine((data) => data.placeholderId || data.moduleCode, {
    message: 'moduleCode is required if placeholderId is not provided',
    path: ['moduleCode'],
  });

export const CustomModuleSchema = z.object({
  title: z.string().nullable().optional(),
  moduleCredit: z.number(),
});

export const CustomModuleDataSchema = z.record(CustomModuleSchema);

export const PlannerStateSchema = z
  .object({
    minYear: z.string(),
    maxYear: z.string(),
    iblocs: z.boolean(),
    ignorePrereqCheck: z.boolean().optional(),
    modules: z.record(PlannerTimeSchema),
    custom: CustomModuleDataSchema,
  })
  .strip();
