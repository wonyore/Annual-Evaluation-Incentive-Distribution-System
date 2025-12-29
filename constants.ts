
import { EvaluationTemplate } from './types';

export const INITIAL_TEMPLATE: EvaluationTemplate = {
  id: 'standard-v1',
  name: '年度综合评价标准模板',
  description: '公司通用的年度绩效评价体系',
  l2Indices: [
    {
      id: 'l2-basic',
      name: '基础标准',
      weight: 0.20,
      l3Indices: [
        { id: 'l3-seniority', name: '在职工龄', weight: 0.2, description: '按“本年度实际在职月数÷12”折算系数', isAutoCalculated: true },
        { id: 'l3-span', name: '岗位责任跨度', weight: 0.2, description: '工作职责范围跨度、项目生命周期内跨度' },
        { id: 'l3-skill', name: '专业技能门槛', weight: 0.2, description: '技术深度、经验要求' },
        { id: 'l3-workload', name: '平均工作量', weight: 0.4, description: '常规任务量、事务密度' },
      ]
    },
    {
      id: 'l2-daily',
      name: '日常表现',
      weight: 0.35,
      l3Indices: [
        { id: 'l3-discipline', name: '制度遵守', weight: 0.2, description: '出勤、参会、流程遵守、团队协作等' },
        { id: 'l3-completion', name: '工作完成度', weight: 0.6, description: '工作效率、交付完整性、质量' },
        { id: 'l3-initiative', name: '主观能动性', weight: 0.2, description: '主动承担、及时汇报、预警风险、解决问题' },
      ]
    },
    {
      id: 'l2-contribution',
      name: '年度贡献',
      weight: 0.45,
      l3Indices: [
        { id: 'l3-output', name: '产出贡献', weight: 0.5, description: '项目数量、质量、关键节点作用' },
        { id: 'l3-responsibility', name: '责任承担度', weight: 0.3, description: '独立承担里程碑任务、救急、卡点突破等' },
        { id: 'l3-other', name: '其他贡献点', weight: 0.2, description: '技术突破、流程优化、节省成本、跨岗位支援等' },
      ]
    }
  ]
};

export const GRADE_CONFIG = [
  { grade: 'A', min: 9, max: 11, coefficient: 5 },
  { grade: 'B', min: 8, max: 9, coefficient: 4 },
  { grade: 'C', min: 7, max: 8, coefficient: 3 },
  { grade: 'D', min: 6, max: 7, coefficient: 1 },
  { grade: 'E', min: 0, max: 6, coefficient: 0.5 },
] as const;
