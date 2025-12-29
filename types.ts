
export interface L3Index {
  id: string;
  name: string;
  weight: number;
  description: string;
  isAutoCalculated?: boolean;
}

export interface L2Index {
  id: string;
  name: string;
  weight: number;
  l3Indices: L3Index[];
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  l2Indices: L2Index[];
}

export type PersonnelCategory = 'Full-time' | 'Part-time';

export interface Examinee {
  id: string;
  name: string;
  employeeId: string;
  joinDate: string;
  monthlySalary: number;
  category: PersonnelCategory;
  position?: string;
}

export interface EvaluationScore {
  examineeId: string;
  assessmentYear: number;
  templateId: string;
  l3Scores: Record<string, number>; // key: L3Index.id, value: 0-10
}

export interface CalculationResult {
  totalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  coefficient: number;
  isEligible: boolean;
  eligibilityReason?: string;
}

export type BonusCalculationMethod = 'A' | 'B';
