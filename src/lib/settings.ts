import { prisma } from '@/lib/prisma';

export type Reglages = {
  isOpenForOrders: boolean;
  deliveryFeeMillimes: number;
  minOrderMillimes: number;
  deliveryZones: string;
  announcement: string | null;
};

const PAR_DEFAUT: Reglages = {
  isOpenForOrders: true,
  deliveryFeeMillimes: 0,
  minOrderMillimes: 0,
  deliveryZones: '',
  announcement: null,
};

/** Ligne unique de réglages (id = 1), créée à la volée si elle manque. */
export async function getReglages(): Promise<Reglages> {
  const enregistrement = await prisma.setting.findUnique({ where: { id: 1 } });
  if (enregistrement) {
    return {
      isOpenForOrders: enregistrement.isOpenForOrders,
      deliveryFeeMillimes: enregistrement.deliveryFeeMillimes,
      minOrderMillimes: enregistrement.minOrderMillimes,
      deliveryZones: enregistrement.deliveryZones,
      announcement: enregistrement.announcement,
    };
  }
  await prisma.setting.create({ data: { id: 1 } });
  return PAR_DEFAUT;
}

/** « Sousse, Kantaoui, Hammam Sousse » → ['Sousse', 'Kantaoui', 'Hammam Sousse'] */
export function listeZones(zones: string): string[] {
  return zones
    .split(',')
    .map((zone) => zone.trim())
    .filter(Boolean);
}
