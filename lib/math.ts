export function monthlyPayment(balance:number, apr:number, termYears:number){
  const n = Math.max(1, Math.round(termYears*12));
  const rm = apr/12;
  return rm === 0 ? balance/n : balance * (rm / (1 - Math.pow(1+rm, -n)));
}

export function deltaMortgageMonthly(
  balance:number, rateNow:number, termYears:number, alpha:number, deltaRatePP:number
){
  const rNew = rateNow + alpha * (deltaRatePP/100);
  return monthlyPayment(balance, rNew, termYears) - monthlyPayment(balance, rateNow, termYears);
}

export function deltaSavingsMonthly(savings:number, deltaRatePP:number, beta=0.6){
  return savings * beta * (deltaRatePP/100) / 12;
}

export function deltaCouncilTaxMonthly(ctAnnual:number, deltaPct:number){
  return (ctAnnual * (deltaPct/100)) / 12;
}
