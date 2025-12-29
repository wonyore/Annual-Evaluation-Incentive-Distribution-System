
import { GRADE_CONFIG } from './constants';
import { CalculationResult, EvaluationTemplate, PersonnelCategory } from './types';

export const calculateServiceDurationScore = (joinDateStr: string, year: number): number => {
  const joinDate = new Date(joinDateStr);
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  if (joinDate > endOfYear) return 0;

  const effectiveStart = joinDate > startOfYear ? joinDate : startOfYear;
  const months = (endOfYear.getFullYear() - effectiveStart.getFullYear()) * 12 + (endOfYear.getMonth() - effectiveStart.getMonth()) + 1;
  
  return Math.min(10, (months / 12) * 10);
};

export const getResult = (
  template: EvaluationTemplate,
  scores: Record<string, number>,
  joinDateStr: string,
  category: PersonnelCategory,
  year: number,
  isPartTimeEligible: boolean = false
): CalculationResult => {
  // Eligibility logic
  if (category === 'Part-time' && !isPartTimeEligible) {
    return { totalScore: 0, grade: 'E', coefficient: 0, isEligible: false, eligibilityReason: '否（兼职人员无资格）' };
  }

  const joinDate = new Date(joinDateStr);
  const endOfYear = new Date(year, 11, 31);
  const diffInMs = endOfYear.getTime() - joinDate.getTime();
  const diffInMonths = diffInMs / (1000 * 60 * 60 * 24 * 30.44);
  
  if (diffInMonths < 2) {
    return { totalScore: 0, grade: 'E', coefficient: 0, isEligible: false, eligibilityReason: '否（入职不足2月）' };
  }

  let totalWeightedScore = 0;
  template.l2Indices.forEach(l2 => {
    let l2SubTotal = 0;
    l2.l3Indices.forEach(l3 => {
      const score = l3.isAutoCalculated 
        ? calculateServiceDurationScore(joinDateStr, year)
        : (scores[l3.id] || 0);
      l2SubTotal += score * l3.weight;
    });
    totalWeightedScore += l2SubTotal * l2.weight;
  });

  const config = GRADE_CONFIG.find(c => totalWeightedScore >= c.min && totalWeightedScore < c.max) 
    || GRADE_CONFIG[GRADE_CONFIG.length - 1];

  return {
    totalScore: parseFloat(totalWeightedScore.toFixed(2)),
    grade: config.grade as any,
    coefficient: config.coefficient,
    isEligible: true,
    eligibilityReason: '是'
  };
};
