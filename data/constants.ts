// constants.ts — helper constants and functions for MVP Economic Impact Calculator

export type PersonaKey = 'renter' | 'homeowner' | 'wealthyOwner' | 'average';

export const PASS_THROUGH = {
  // Mortgage pass-through alpha (portion of Δr applied to borrower rate)
  tracker: 1.0,
  svr: 0.5,
  fixed: 0.0, // until expiry
  // Deposit/savings pass-through beta (portion of Δr passed on to savers)
  deposits: 0.6
};

export const INCOME_DEFAULTS = {
  poorestQuintileMedian: 16800,
  median: 36700,
  richestQuintileMedian: 71100
};

export const TAX_BASELINES_ANNUAL = {
  englandBandD_2024_25: 2171,
  walesBandD_2024_25: 2024,
  scotlandBandDAvg_2024_25: 1421,
  northernIrelandAvgRates_2024_25: 1180
};

export interface HomeownerState {
  balance: number;   // £
  termYears: number; // years remaining
  rateNow: number;   // current APR, e.g. 0.049 for 4.9%
  product: 'tracker' | 'svr' | 'fixed';
}

export interface PersonaInputs {
  renterMonthlyRent: number;   // £
  homeowner: HomeownerState;
  wealthySavings: number;      // £
  councilTaxAnnual: number;    // £
  disposableIncomeAnnual: number; // £
}

// Amortising mortgage monthly payment
export function monthlyPayment(balance: number, apr: number, termYears: number): number {
  const n = Math.max(1, Math.round(termYears * 12));
  const rm = apr / 12;
  if (rm === 0) return balance / n;
  return balance * (rm / (1 - Math.pow(1 + rm, -n)));
}

// Compute delta mortgage payment for a Δr policy change and product pass-through α
export function deltaMortgageMonthly(hw: HomeownerState, deltaRatePP: number): number {
  const alpha = PASS_THROUGH[hw.product];
  const rNew = hw.rateNow + alpha * (deltaRatePP / 100); // convert pp → decimal
  const m0 = monthlyPayment(hw.balance, hw.rateNow, hw.termYears);
  const m1 = monthlyPayment(hw.balance, rNew, hw.termYears);
  return m1 - m0;
}

// Savings interest monthly change: ΔI = S * β * Δr / 12
export function deltaSavingsMonthly(savings: number, deltaRatePP: number): number {
  const beta = PASS_THROUGH.deposits;
  return savings * beta * (deltaRatePP / 100) / 12;
}

// Council tax / domestic rates monthly change
export function deltaCouncilTaxMonthly(councilTaxAnnual: number, deltaPct: number): number {
  return (councilTaxAnnual * (deltaPct / 100)) / 12;
}

// Net monthly impact for one persona
// sign convention: negative = worse off
export function netMonthlyImpact(
  persona: PersonaInputs,
  deltaRatePP: number,
  deltaCouncilPct: number,
  rentDeltaPct: number // e.g. +2 means rent +2%
): {deltaNet: number, breakdown: {rent: number, mortgage: number, council: number, savings: number}} {
  const rent0 = persona.renterMonthlyRent;
  const rentNew = rent0 * (1 + rentDeltaPct / 100);
  const dRent = rentNew - rent0;

  const dMortgage = deltaMortgageMonthly(persona.homeowner, deltaRatePP);
  const dCouncil = deltaCouncilTaxMonthly(persona.councilTaxAnnual, deltaCouncilPct);
  const dSavings = deltaSavingsMonthly(persona.wealthySavings, deltaRatePP);

  const deltaNet = -dRent - dMortgage - dCouncil + dSavings;
  return { deltaNet, breakdown: { rent: dRent, mortgage: dMortgage, council: dCouncil, savings: dSavings } };
}
