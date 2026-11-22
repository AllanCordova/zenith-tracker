export type PlanCode = 'MONTHLY' | 'YEARLY';

export const PLAN_CATALOG: Record<PlanCode, number> = {
  MONTHLY: 4990,
  YEARLY: 39900,
};

export function isPlanCode(value: string): value is PlanCode {
  return value === 'MONTHLY' || value === 'YEARLY';
}

export function amountCentsFor(planCode: PlanCode): number {
  return PLAN_CATALOG[planCode];
}
