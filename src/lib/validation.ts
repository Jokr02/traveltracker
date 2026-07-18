import { z } from "zod";

export const visitFormSchema = z
  .object({
    startDate: z.iso.date({ error: "Bitte ein gültiges Startdatum angeben." }),
    endDate: z
      .union([z.iso.date(), z.literal("")])
      .optional()
      .transform((v) => (v ? v : undefined)),
    notes: z
      .string()
      .max(2000, { error: "Notizen dürfen maximal 2000 Zeichen lang sein." })
      .optional()
      .transform((v) => (v ? v : undefined)),
    rating: z
      .union([z.coerce.number().int().min(1).max(5), z.literal("")])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    coverImageUrl: z
      .union([z.url({ error: "Bitte eine gültige URL angeben." }), z.literal("")])
      .optional()
      .transform((v) => (v ? v : undefined)),
  })
  .refine(
    (data) => !data.endDate || data.endDate >= data.startDate,
    { error: "Das Enddatum darf nicht vor dem Startdatum liegen.", path: ["endDate"] },
  );

export type VisitFormValues = z.infer<typeof visitFormSchema>;
