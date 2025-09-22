import { describe, it, expect } from 'vitest';
import {
  monthlyPayment, deltaMortgageMonthly,
  deltaSavingsMonthly, deltaCouncilTaxMonthly
} from '../lib/math';

describe('monthlyPayment', () => {
  it('matches a known example (~£1,169 for £200k, 25y, 5%)', () => {
    const m = monthlyPayment(200_000, 0.05, 25);
    expect(Math.round(m)).toBe(1169); // within £1 rounding
  });
  it('is zero-interest linear', () => {
    const m = monthlyPayment(12_000, 0, 1);
    expect(m).toBeCloseTo(1000, 6);
  });
});

describe('deltaMortgageMonthly', () => {
  it('is ~0 when deltaRatePP=0', () => {
    const d = deltaMortgageMonthly(200_000, 0.05, 25, 0.5, 0);
    expect(Math.abs(d)).toBeLessThan(1e-9);
  });
  it('increases payment when alpha>0 and deltaRatePP>0', () => {
    const d = deltaMortgageMonthly(200_000, 0.05, 25, 0.5, 1.0); // +1pp, α=0.5
    expect(d).toBeGreaterThan(0);
  });
});

describe('deltaSavingsMonthly', () => {
  it('scales with savings and rate change', () => {
    const d = deltaSavingsMonthly(150_000, 1.0, 0.6);
    expect(d).toBeCloseTo(150_000 * 0.6 * 0.01 / 12, 8);
  });
});

describe('deltaCouncilTaxMonthly', () => {
  // tests/math.test.ts
    it('applies percentage to annual and divides by 12', () => {
        const d = deltaCouncilTaxMonthly(2000, 10);
        expect(d).toBeCloseTo(16.6666666667, 6); // ≈ £16.67 per month
    });
});
