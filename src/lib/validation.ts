import { z } from 'zod';

/** 8 chiffres, avec ou sans +216 et séparateurs : 20 123 456, +216 20-123-456… */
const TELEPHONE = /^(?:\+?216)?[\s.-]?(\d[\s.-]?){8}$/;

export const ligneCommandeSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1, 'Quantité invalide.').max(99, 'Quantité trop élevée.'),
});

export const commandeSchema = z
  .object({
    type: z.enum(['DELIVERY', 'PICKUP'], {
      errorMap: () => ({ message: 'Choisissez la livraison ou le retrait sur place.' }),
    }),
    customerName: z
      .string()
      .trim()
      .min(2, 'Indiquez votre nom.')
      .max(80, 'Nom trop long.'),
    phone: z
      .string()
      .trim()
      .min(8, 'Indiquez un numéro de téléphone.')
      .max(20, 'Numéro trop long.')
      .regex(TELEPHONE, 'Numéro de téléphone invalide (8 chiffres).'),
    address: z.string().trim().max(200, 'Adresse trop longue.').optional().or(z.literal('')),
    city: z.string().trim().max(80, 'Ville trop longue.').optional().or(z.literal('')),
    slot: z.string().trim().max(60).optional().or(z.literal('')),
    note: z.string().trim().max(500, 'Message trop long.').optional().or(z.literal('')),
    lignes: z.array(ligneCommandeSchema).min(1, 'Votre panier est vide.'),
  })
  .superRefine((donnees, contexte) => {
    if (donnees.type !== 'DELIVERY') return;
    if (!donnees.address || donnees.address.length < 5) {
      contexte.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message: 'Indiquez l’adresse de livraison.',
      });
    }
    if (!donnees.city) {
      contexte.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['city'],
        message: 'Indiquez la zone de livraison.',
      });
    }
  });

export type DonneesCommande = z.infer<typeof commandeSchema>;

export const messageContactSchema = z.object({
  nom: z.string().trim().min(2, 'Indiquez votre nom.').max(80, 'Nom trop long.'),
  telephone: z
    .string()
    .trim()
    .min(8, 'Indiquez un numéro de téléphone.')
    .regex(TELEPHONE, 'Numéro de téléphone invalide (8 chiffres).'),
  email: z.string().trim().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Votre message est trop court.').max(1500, 'Message trop long.'),
});

/* -------------------------------------------------------------------------- */
/*  Administration                                                            */
/* -------------------------------------------------------------------------- */

export const connexionSchema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide.'),
  motDePasse: z.string().min(1, 'Mot de passe requis.'),
});

export const produitSchema = z.object({
  name: z.string().trim().min(2, 'Le nom est obligatoire.').max(120, 'Nom trop long.'),
  description: z.string().trim().max(600, 'Description trop longue.').optional().or(z.literal('')),
  prix: z.string().trim().min(1, 'Le prix est obligatoire.'),
  unit: z.enum(['PIECE', 'KG', 'PORTION']),
  categoryId: z.coerce.number().int().positive('Choisissez une catégorie.'),
  stock: z.string().trim().optional().or(z.literal('')),
  imageUrl: z.string().trim().max(500).optional().or(z.literal('')),
  isAvailable: z.boolean().optional(),
  isCatchOfDay: z.boolean().optional(),
});

export const categorieSchema = z.object({
  name: z.string().trim().min(2, 'Le nom est obligatoire.').max(80, 'Nom trop long.'),
  description: z.string().trim().max(600, 'Description trop longue.').optional().or(z.literal('')),
});

export const reglagesSchema = z.object({
  isOpenForOrders: z.boolean(),
  fraisLivraison: z.string().trim(),
  minimumCommande: z.string().trim(),
  deliveryZones: z.string().trim().max(500, 'Liste de zones trop longue.'),
  announcement: z.string().trim().max(200, 'Annonce trop longue.').optional().or(z.literal('')),
});

export const STATUTS = [
  'NEW',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
] as const;

export type Statut = (typeof STATUTS)[number];

export const LIBELLES_STATUT: Record<Statut, string> = {
  NEW: 'Nouvelle',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  READY: 'Prête',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

export const statutSchema = z.enum(STATUTS);
