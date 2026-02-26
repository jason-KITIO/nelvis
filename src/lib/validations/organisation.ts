import { z } from "zod";

export const organisationSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  siret: z.string().regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres").optional().or(z.literal("")),
  siren: z.string().regex(/^\d{9}$/, "Le SIREN doit contenir exactement 9 chiffres").optional().or(z.literal("")),
  adresse: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  pays: z.string().min(2, "Le pays est requis"),
  formeJuridique: z.string().min(2, "La forme juridique est requise"),
});

export const onboardingStep1Schema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  pays: z.string().min(2, "Le pays est requis"),
  formeJuridique: z.string().min(2, "La forme juridique est requise"),
});

export const onboardingStep2Schema = z.object({
  adresse: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  siret: z.string().regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres").optional().or(z.literal("")),
  siren: z.string().regex(/^\d{9}$/, "Le SIREN doit contenir exactement 9 chiffres").optional().or(z.literal("")),
});

export type OrganisationFormData = z.infer<typeof organisationSchema>;
export type OnboardingStep1Data = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Data = z.infer<typeof onboardingStep2Schema>;
