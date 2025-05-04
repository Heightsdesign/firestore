export type Weights = {
    rent: number;
    competition: number;
    population: number;
    income: number;
    traffic: number;
    parking: number;
  };

export const PRESETS: Record<
  string,
  { label: string; radius: number; weights: Weights }
> = {
  barbershop: {
    label: 'Barbershop / Salon',
    radius: 3,
    weights: { rent: 0.2, competition: 0.2, population: 0.3, income: 0.1, traffic: 0.0, parking: 0.2 },
  },
  cafe: {
    label: 'Café / Coffee shop',
    radius: 3,
    weights: { rent: 0.15, competition: 0.25, population: 0.25, income: 0.15, traffic: 0.1, parking: 0.1 },
  },
  restaurant: {
    label: 'Restaurant',
    radius: 4,
    weights: { rent: 0.15, competition: 0.25, population: 0.2, income: 0.2, traffic: 0.15, parking: 0.05 },
  },
  retail: {
    label: 'Retail boutique',
    radius: 4,
    weights: { rent: 0.25, competition: 0.2, population: 0.25, income: 0.15, traffic: 0.05, parking: 0.1 },
  },
  gym: {
    label: 'Gym / Fitness studio',
    radius: 5,
    weights: { rent: 0.2, competition: 0.2, population: 0.25, income: 0.15, traffic: 0.05, parking: 0.15 },
  },
  warehouse: {
    label: 'Warehouse / Fulfilment',
    radius: 5,
    weights: { rent: 0.35, competition: 0, population: 0, income: 0, traffic: 0.1, parking: 0.55 },
  },
};
