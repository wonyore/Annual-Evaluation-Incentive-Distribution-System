import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Settings, ClipboardCheck, Plus, Trash2, Edit3, 
  ChevronRight, TrendingUp, Award, Calendar, Search, 
  CheckCircle2, XCircle, AlertCircle, Coins, Calculator, 
  Save, Check, ChevronUp, ChevronDown, ListChecks, Info, Layers,
  TriangleAlert
} from 'lucide-react';
import { 
  Examinee, EvaluationTemplate, EvaluationScore, 
  L2Index, L3Index, BonusCalculationMethod, PersonnelCategory
} from './types';
import { INITIAL_TEMPLATE, GRADE_CONFIG } from './constants';
import { getResult, calculateServiceDurationScore } from './utils';

const STORAGE_KEYS = {
  EXAMINEES: 'eval_examinees_v2',
  TEMPLATES: 'eval_templates_v2',
  EVALUATIONS: 'eval_scores_v2',
  YEARS: 'eval_years_v2',
  ACTIVE_YEAR: 'eval_active_year_v2',
  BONUS_METHOD: 'eval_bonus_method_v2',
  TOTAL_BONUS: 'eval_total_bonus_v2',
  PARTTIME_ELIGIBLE: 'eval_parttime_eligible'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'examinees' | 'templates' | 'scoring'>('dashboard');
  const [examinees, setExaminees] = useState<Examinee[]>([]);
  const [templates, setTemplates] = useState<EvaluationTemplate[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationScore[]>([]);
  const [years, setYears] = useState<number[]>([2024, 2025]);
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [bonusMethod, setBonusMethod] = useState<BonusCalculationMethod>('A');
  const [totalTeamBonus, setTotalTeamBonus] = useState<number>(0);
  const [isPartTimeEligible, setIsPartTimeEligible] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const savedExaminees = localStorage.getItem(STORAGE_KEYS.EXAMINEES);
    const savedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    const savedEvals = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    const savedYears = localStorage.getItem(STORAGE_KEYS.YEARS);
    const savedYear = localStorage.getItem(STORAGE_KEYS.ACTIVE_YEAR);
    const savedMethod = localStorage.getItem(STORAGE_KEYS.BONUS_METHOD);
    const savedTotal = localStorage.getItem(STORAGE_KEYS.TOTAL_BONUS);
    const savedPtEligible = localStorage.getItem(STORAGE_KEYS.PARTTIME_ELIGIBLE);

    if (savedExaminees) setExaminees(JSON.parse(savedExaminees));
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      const initial = JSON.parse(JSON.stringify(INITIAL_TEMPLATE));
      initial.id = 'tmpl-initial';
      setTemplates([initial]);
    }
    
    if (savedEvals) setEvaluations(JSON.parse(savedEvals));
    if (savedYears) setYears(JSON.parse(savedYears));
    if (savedYear) setActiveYear(parseInt(savedYear));
    if (savedMethod) setBonusMethod(savedMethod as BonusCalculationMethod);
    if (savedTotal) setTotalTeamBonus(parseFloat(savedTotal));
    if (savedPtEligible) setIsPartTimeEligible(JSON.parse(savedPtEligible));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMINEES, JSON.stringify(examinees));
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(years));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_YEAR, activeYear.toString());
    localStorage.setItem(STORAGE_KEYS.BONUS_METHOD, bonusMethod);
    localStorage.setItem(STORAGE_KEYS.TOTAL_BONUS, totalTeamBonus.toString());
    localStorage.setItem(STORAGE_KEYS.PARTTIME_ELIGIBLE, JSON.stringify(isPartTimeEligible));
  }, [examinees, templates, evaluations, years, activeYear, bonusMethod, totalTeamBonus, isPartTimeEligible]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const addOrUpdateExaminee = (e: Examinee) => {
    const exists = examinees.findIndex(ex => ex.id === e.id);
    if (exists > -1) {
      setExaminees(examinees.map(ex => ex.id === e.id ? e : ex));
    } else {
      setExaminees([...examinees, e]);
    }
    showToast('人员信息已保存');
  };

  const moveExaminee = (index: number, direction: 'up' | 'down') => {
    const newEx = [...examinees];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newEx.length) return;
    [newEx[index], newEx[targetIndex]] = [newEx[targetIndex], newEx[index]];
    setExaminees(newEx);
  };

  const updateTemplates = (ts: EvaluationTemplate[]) => {
    setTemplates([...ts]);
  };

  const deleteTemplateAndRelatedData = (id: string) => {
    if (templates.length <= 1) {
      alert('系统至少需保留一个激励评价模板');
      return;
    }
    if (!window.confirm('确定要彻底删除整个评价模板及其关联的所有人员评分数据吗？此操作无法撤销。')) return;
    
    const nextTemplates = templates.filter(t => t.id !== id);
    setTemplates(nextTemplates);

    const nextEvaluations = evaluations.filter(e => e.templateId !== id);
    setEvaluations(nextEvaluations);

    showToast('评价模板及其关联历史数据已成功删除');
  };

  const saveEvaluation = (score: EvaluationScore) => {
    const existingIdx = evaluations.findIndex(e => e.examineeId === score.examineeId && e.assessmentYear === score.assessmentYear);
    if (existingIdx > -1) {
      const next = [...evaluations];
      next[existingIdx] = score;
      setEvaluations(next);
    } else {
      setEvaluations([...evaluations, score]);
    }
    showToast('评分结果已成功提交并保存');
  };

  const addYear = () => {
    const nextYear = Math.max(...years) + 1;
    setYears([...years, nextYear].sort((a, b) => b - a));
    showToast(`已创建 ${nextYear} 年度`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative">
      {successToast && (
        <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 shadow-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm">{successToast}</span>
          </div>
        </div>
      )}

      <nav className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-indigo-600 mt-1 shrink-0" />
            <div className="overflow-hidden">
              <h1 className="text-sm lg:text-base font-black text-slate-800 leading-tight truncate">
                年度评价与激励分配系统
              </h1>
              <p className="text-[7px] lg:text-[8px] text-slate-400 mt-1 uppercase tracking-wider font-bold leading-tight opacity-75">
                Evaluation & Incentive Distribution
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 space-y-1.5">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<TrendingUp className="w-5 h-5"/>} label="总览看板" />
          <NavItem active={activeTab === 'scoring'} onClick={() => setActiveTab('scoring')} icon={<ClipboardCheck className="w-5 h-5"/>} label="年度评价" />
          <NavItem active={activeTab === 'examinees'} onClick={() => setActiveTab('examinees')} icon={<Users className="w-5 h-5"/>} label="被考核人管理" />
          <NavItem active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<Settings className="w-5 h-5"/>} label="评价模板管理" />
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 overflow-hidden">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <select className="bg-transparent text-sm font-bold focus:outline-none w-full truncate cursor-pointer" value={activeYear} onChange={(e) => setActiveYear(parseInt(e.target.value))}>
                {years.map(y => <option key={y} value={y}>{y} 年度</option>)}
              </select>
            </div>
            <button onClick={addYear} className="p-1 hover:bg-slate-200 rounded-md transition-colors" title="新增年度">
              <Plus className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <Dashboard 
                evaluations={evaluations} examinees={examinees} activeYear={activeYear} 
                templates={templates} bonusMethod={bonusMethod} setBonusMethod={setBonusMethod}
                totalTeamBonus={totalTeamBonus} setTotalTeamBonus={setTotalTeamBonus}
                isPartTimeEligible={isPartTimeEligible} setIsPartTimeEligible={setIsPartTimeEligible}
              />
            )}
            {activeTab === 'examinees' && (
              <ExamineeManager examinees={examinees} onSave={addOrUpdateExaminee} onRemove={(id) => setExaminees(examinees.filter(x => x.id !== id))} onMove={moveExaminee} />
            )}
            {activeTab === 'templates' && (
              <TemplateManager 
                templates={templates} 
                onUpdate={updateTemplates} 
                onDeleteTemplate={deleteTemplateAndRelatedData} 
              />
            )}
            {activeTab === 'scoring' && (
              <ScoringView examinees={examinees} templates={templates} evaluations={evaluations} onSave={saveEvaluation} activeYear={activeYear} isPartTimeEligible={isPartTimeEligible} />
            )}
          </div>
        </div>
        
        <footer className="w-full py-6 text-center text-slate-400 text-[10px] font-medium border-t border-slate-200 bg-white/50">
          ©2025 Created by ZJULAB AI Team
        </footer>
      </main>
    </div>
  );
};

const NavItem: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50'}`}>
    {icon}
    <span className="font-medium text-sm">{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
  </button>
);

const Dashboard: React.FC<any> = ({ evaluations, examinees, activeYear, templates, bonusMethod, setBonusMethod, totalTeamBonus, setTotalTeamBonus, isPartTimeEligible, setIsPartTimeEligible }) => {
  const currentEvals = evaluations.filter((e: any) => e.assessmentYear === activeYear);
  const results = currentEvals.map((ev: any) => {
    const ex = examinees.find((x: any) => x.id === ev.examineeId);
    const tmpl = templates.find((t: any) => t.id === ev.templateId);
    if (!ex || !tmpl) return null;
    const res = getResult(tmpl, ev.l3Scores, ex.joinDate, ex.category, activeYear, isPartTimeEligible);
    return { ...res, name: ex.name, monthlySalary: ex.monthlySalary, category: ex.category };
  }).filter(Boolean) as any[];

  const sumCoefficients = results.reduce((acc, r) => acc + r.coefficient, 0);
  const finalResults = results.map(r => {
    let bonus = 0;
    if (bonusMethod === 'A') bonus = r.coefficient * r.monthlySalary;
    else bonus = sumCoefficients > 0 ? (r.coefficient / sumCoefficients) * totalTeamBonus : 0;
    return { ...r, bonus };
  });

  const totalBonusDistributed = finalResults.reduce((acc, r) => acc + r.bonus, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col xl:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{activeYear} 年度核算看板</h2>
          <p className="text-slate-500 mt-1 font-medium">实时统计评分等级与奖金分配明细</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-6">
          <div className="shrink-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">兼职人员分配资格</p>
            <button 
              onClick={() => setIsPartTimeEligible(!isPartTimeEligible)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isPartTimeEligible ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
            >
              {isPartTimeEligible ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {isPartTimeEligible ? '已开启' : '未开启'}
            </button>
          </div>
          <div className="shrink-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">分配计算方式</p>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setBonusMethod('A')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${bonusMethod === 'A' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'}`}>方式 A (系数×月薪)</button>
              <button onClick={() => setBonusMethod('B')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${bonusMethod === 'B' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-600'}`}>方式 B (比例分配)</button>
            </div>
          </div>
          {bonusMethod === 'B' && (
            <div className="w-32">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">团队奖金总额</p>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">¥</span>
                <input type="number" className="w-full pl-6 pr-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-black focus:outline-none focus:ring-2 focus:ring-indigo-500" value={totalTeamBonus} onChange={e => setTotalTeamBonus(parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="已评价人数" value={results.length} subtext={`总人数 ${examinees.length}`} icon={<Users className="text-blue-500" />} />
        <StatCard title="累计分配系数" value={sumCoefficients.toFixed(1)} icon={<Coins className="text-emerald-500" />} />
        <StatCard title="预算奖金支出" value={`¥${Math.round(totalBonusDistributed).toLocaleString()}`} icon={<Calculator className="text-indigo-500" />} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">姓名</th>
              <th className="px-6 py-4">评价结果</th>
              <th className="px-6 py-4">分配资格</th>
              <th className="px-6 py-4 text-right">测算年终奖</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {finalResults.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic font-medium">暂无考核数据，请前往“年度评价”模块进行评分</td></tr>
            ) : finalResults.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-700">{r.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">{r.category === 'Part-time' ? '兼职' : '全职'} · 基数: ¥{r.monthlySalary.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-black ${r.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : r.grade === 'E' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-50 text-indigo-700'}`}>{r.grade}</span>
                    <span className="text-xs font-mono text-slate-500">{r.totalScore}分 (系数 {r.coefficient})</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold ${r.isEligible ? 'text-emerald-600' : 'text-slate-400'}`}>{r.eligibilityReason}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-lg font-black text-slate-800">¥{Math.round(r.bonus).toLocaleString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard: React.FC<any> = ({ title, value, subtext, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h4>
      {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
    </div>
    <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
  </div>
);

const ExamineeManager: React.FC<any> = ({ examinees, onSave, onRemove, onMove }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', employeeId: '', joinDate: '', monthlySalary: '0', category: 'Full-time' as PersonnelCategory, position: '' });

  const openAdd = () => { setEditingId(null); setFormData({ name: '', employeeId: '', joinDate: '', monthlySalary: '0', category: 'Full-time', position: '' }); setShowModal(true); };
  const openEdit = (ex: Examinee) => { setEditingId(ex.id); setFormData({ name: ex.name, employeeId: ex.employeeId, joinDate: ex.joinDate, monthlySalary: ex.monthlySalary.toString(), category: ex.category, position: ex.position || '' }); setShowModal(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: editingId || 'ex-' + Date.now(), ...formData, monthlySalary: parseFloat(formData.monthlySalary) || 0 });
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">人员基础资料管理</h2>
          <p className="text-slate-500 font-medium">维护团队成员身份分类与月薪基数</p>
        </div>
        <button onClick={openAdd} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all font-bold text-sm flex items-center gap-2">
          <Plus className="w-5 h-5" /> 新增人员
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 w-16">顺序</th>
              <th className="px-6 py-4">基本信息</th>
              <th className="px-6 py-4">人员类型</th>
              <th className="px-6 py-4">入职日期</th>
              <th className="px-6 py-4">月薪基数</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {examinees.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic font-medium">暂无人员记录，请点击右上角新增</td></tr>
            ) : examinees.map((ex: any, idx: number) => (
              <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => onMove(idx, 'up')} className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-indigo-600"><ChevronUp className="w-4 h-4" /></button>
                    <span className="text-[10px] font-black text-slate-300">#{idx + 1}</span>
                    <button onClick={() => onMove(idx, 'down')} className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-indigo-600"><ChevronDown className="w-4 h-4" /></button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-700">{ex.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">{ex.position || '未设岗位'} · {ex.employeeId}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ex.category === 'Full-time' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                    {ex.category === 'Full-time' ? '全职' : '兼职'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm font-medium">{ex.joinDate}</td>
                <td className="px-6 py-4 font-black text-slate-700">¥{ex.monthlySalary.toLocaleString()}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEdit(ex)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => onRemove(ex.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[80] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              {editingId ? <Edit3 className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
              {editingId ? '编辑成员信息' : '录入新成员'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">姓名</label>
                  <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">岗位 (选填)</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-bold" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">工号</label>
                  <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-mono" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">入职日期</label>
                  <input required type="date" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-bold" value={formData.joinDate} onChange={e => setFormData({...formData, joinDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">人员类型</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button type="button" onClick={() => setFormData({...formData, category: 'Full-time'})} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.category === 'Full-time' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-600'}`}>全职</button>
                    <button type="button" onClick={() => setFormData({...formData, category: 'Part-time'})} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${formData.category === 'Part-time' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-600'}`}>兼职</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">月薪 (计算基数)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">¥</span>
                    <input required type="number" className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-black" value={formData.monthlySalary} onChange={e => setFormData({...formData, monthlySalary: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">取消</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> 保存信息
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TemplateManager: React.FC<any> = ({ templates, onUpdate, onDeleteTemplate }) => {
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id || '');
  
  useEffect(() => {
    if (templates.length > 0 && !templates.find((t: any) => t.id === selectedId)) {
      setSelectedId(templates[0].id);
    }
  }, [templates, selectedId]);

  const editingTemplate = useMemo(() => {
    return templates.find((t: any) => t.id === selectedId) || null;
  }, [templates, selectedId]);

  const handleUpdateTemplate = (updatedTmpl: EvaluationTemplate) => {
    if (!editingTemplate) return;
    const nextTemplates = templates.map((tmp: any) => 
      tmp.id === updatedTmpl.id ? { ...updatedTmpl } : tmp
    );
    onUpdate([...nextTemplates]);
  };

  const handleL3Change = (l2Id: string, l3Id: string, updates: Partial<L3Index>) => {
    if (!editingTemplate) return;
    const newL2s = editingTemplate.l2Indices.map((l2: any) => {
      if (l2.id !== l2Id) return l2;
      return { 
        ...l2, 
        l3Indices: l2.l3Indices.map((l3: any) => l3.id === l3Id ? { ...l3, ...updates } : l3) 
      };
    });
    handleUpdateTemplate({ ...editingTemplate, l2Indices: newL2s });
  };

  const handleL2Change = (l2Id: string, updates: Partial<L2Index>) => {
    if (!editingTemplate) return;
    const newL2s = editingTemplate.l2Indices.map((l2: any) => l2.id === l2Id ? { ...l2, ...updates } : l2);
    handleUpdateTemplate({ ...editingTemplate, l2Indices: newL2s });
  };

  const l2Sum = editingTemplate ? editingTemplate.l2Indices.reduce((sum: number, l2: any) => sum + l2.weight, 0) : 0;
  const isL2SumInvalid = editingTemplate ? Math.abs(l2Sum - 1) > 0.001 : false;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">评价指标与权重管理</h2>
          <p className="text-slate-500 font-medium">配置激励分配的评价维度与层级权重</p>
        </div>
      </header>

      {isL2SumInvalid && (
        <div className="bg-rose-50 border-2 border-rose-200 p-5 rounded-[2rem] flex items-center gap-6 animate-in slide-in-from-top-6 duration-300 shadow-xl shadow-rose-100 ring-4 ring-rose-500/10">
          <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg">
            <TriangleAlert className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-rose-900 font-black text-base uppercase tracking-tight">二级汇总权重错误</h4>
            <p className="text-rose-600 text-sm font-bold">所有二级大类权重之和必须等于 1.0。当前总计: <span className="text-rose-900 bg-rose-200 px-2 py-0.5 rounded-lg">{l2Sum.toFixed(3)}</span></p>
          </div>
        </div>
      )}

      {editingTemplate && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-10">
            {editingTemplate.l2Indices.map((l2: any) => {
              const l3Sum = l2.l3Indices.reduce((s: number, l3: any) => s + l3.weight, 0);
              const isL3SumInvalid = Math.abs(l3Sum - 1) > 0.001;

              return (
                <div key={l2.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group/l2 hover:shadow-lg transition-all ring-1 ring-slate-100">
                  <div className={`p-8 border-b transition-all flex items-center justify-between ${isL3SumInvalid ? 'bg-rose-50 border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="flex items-center gap-6 flex-1">
                      <div className={`p-3 rounded-2xl shadow-inner transition-colors ${isL3SumInvalid ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        <Layers className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">指标大类名称</label>
                        <input 
                          className="bg-transparent font-black text-slate-800 text-xl focus:outline-none border-b-2 border-transparent focus:border-indigo-400 transition-all w-full max-md" 
                          value={l2.name} 
                          onChange={e => handleL2Change(l2.id, { name: e.target.value })} 
                        />
                      </div>
                      <div className="flex flex-col items-center gap-1 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm min-w-[110px]">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">所占二级权重</span>
                        <input 
                          type="number" 
                          step="0.01" 
                          className="w-16 text-center text-lg font-black focus:outline-none text-indigo-600" 
                          value={l2.weight} 
                          onChange={e => handleL2Change(l2.id, { weight: parseFloat(e.target.value) || 0 })} 
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-6">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black uppercase text-[10px] shadow-md tracking-tight border transition-all ${isL3SumInvalid ? 'bg-rose-600 text-white border-rose-500 scale-105 animate-pulse' : 'bg-emerald-600 text-white border-emerald-500'}`}>
                        {isL3SumInvalid ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        三级汇总: {l3Sum.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/30 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-10 py-5">三级指标名称</th>
                          <th className="px-10 py-5 w-52 text-center">权重占比 (0-1)</th>
                          <th className="px-10 py-5">考核准则描述</th>
                          <th className="px-10 py-5 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {l2.l3Indices.map((l3: any) => (
                          <tr key={l3.id} className="group/l3 hover:bg-slate-50/80 transition-colors">
                            <td className="px-10 py-6">
                              <input 
                                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none border-b-2 border-transparent group-hover/l3:border-slate-200 focus:border-indigo-400 transition-all" 
                                value={l3.name} 
                                onChange={e => handleL3Change(l2.id, l3.id, { name: e.target.value })} 
                              />
                            </td>
                            <td className="px-10 py-6 text-center">
                              <div className="flex items-center justify-center min-w-[120px]">
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  className="w-24 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 font-black text-indigo-600 focus:outline-none text-center text-base hover:border-indigo-200 transition-colors" 
                                  value={l3.weight} 
                                  onChange={e => handleL3Change(l2.id, l3.id, { weight: parseFloat(e.target.value) || 0 })} 
                                />
                              </div>
                            </td>
                            <td className="px-10 py-6">
                              <input 
                                className="w-full bg-transparent text-sm text-slate-500 font-medium focus:outline-none border-b-2 border-transparent group-hover/l3:border-slate-100 focus:border-indigo-300 transition-all" 
                                placeholder="指标的具体评分规则描述..." 
                                value={l3.description} 
                                onChange={e => handleL3Change(l2.id, l3.id, { description: e.target.value })} 
                              />
                            </td>
                            <td className="px-10 py-6 text-right">
                              {!l3.isAutoCalculated && (
                                <button 
                                  onClick={() => handleL2Change(l2.id, { l3Indices: l2.l3Indices.filter((x: any) => x.id !== l3.id) })} 
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                                  title="删除三级考核项"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-6 bg-slate-50/30 border-t border-slate-100">
                    <button 
                      onClick={() => handleL2Change(l2.id, { l3Indices: [...l2.l3Indices, { id: 'l3-'+Date.now() + Math.random().toString(36).substr(2, 5), name: '新三级考核点', weight: 0, description: '' }] })} 
                      className="w-full py-3 border-4 border-dashed border-slate-200 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white transition-all shadow-sm active:scale-[0.99]"
                    >
                      + 新增三级评价指标
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ScoringView: React.FC<any> = ({ examinees, templates, evaluations, onSave, activeYear, isPartTimeEligible }) => {
  const [selectedExamineeId, setSelectedExamineeId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const template = useMemo(() => {
    return templates.find((t: any) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  const examinee = useMemo(() => {
    return examinees.find((ex: any) => ex.id === selectedExamineeId);
  }, [examinees, selectedExamineeId]);
  
  useEffect(() => {
    if (selectedExamineeId) {
      const existing = evaluations.find((e: any) => e.examineeId === selectedExamineeId && e.assessmentYear === activeYear);
      if (existing) {
        setScores(existing.l3Scores);
        setSelectedTemplateId(existing.templateId);
      } else {
        setScores({});
      }
    }
  }, [selectedExamineeId, activeYear, evaluations]);

  const result = useMemo(() => {
    if (!examinee || !template) return null;
    return getResult(template, scores, examinee.joinDate, examinee.category, activeYear, isPartTimeEligible);
  }, [template, scores, examinee, activeYear, isPartTimeEligible]);

  const handleSave = () => {
    if (!selectedExamineeId || !template) return;
    onSave({ examineeId: selectedExamineeId, assessmentYear: activeYear, templateId: template.id, l3Scores: scores });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">年度综合评价评分</h2>
          <p className="text-slate-500 font-medium">请选择对应的评价模板并对人员进行维度打分（0-10分）</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl font-black text-sm focus:outline-none appearance-none shadow-sm cursor-pointer" value={selectedExamineeId || ''} onChange={e => setSelectedExamineeId(e.target.value)}>
              <option value="" disabled>请选择被考核人员</option>
              {examinees.map((ex: any) => <option key={ex.id} value={ex.id}>{ex.name} ({ex.employeeId})</option>)}
            </select>
          </div>
        </div>
      </header>

      {!selectedExamineeId ? (
        <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-6"><Users className="w-12 h-12 text-slate-300" /></div>
          <h4 className="text-xl font-black text-slate-700">尚未选择待评分的人员</h4>
          <p className="text-slate-400 mt-2 max-w-sm font-medium text-sm leading-relaxed">在上方下拉框中选择一名人员开始其年度评分。系统将根据评分结果和模板权重自动测算建议等级与分配系数。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl flex items-center gap-3">
              <Info className="w-5 h-5 text-indigo-500" />
              <p className="text-indigo-700 text-xs font-bold uppercase tracking-tight">
                正在对 <span className="font-black underline px-1">{examinee?.name}</span> ({examinee?.category === 'Full-time' ? '全职' : '兼职'}) 进行综合评价
              </p>
            </div>
            {template.l2Indices.map((l2: any) => (
              <div key={l2.id} className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    {l2.name}
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">板块权重: {(l2.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {l2.l3Indices.map((l3: any) => {
                    const currentScore = l3.isAutoCalculated ? calculateServiceDurationScore(examinee!.joinDate, activeYear) : (scores[l3.id] || 0);
                    return (
                      <div key={l3.id} className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-700">{l3.name}</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md tracking-tighter">占该板块 {Math.round(l3.weight * 100)}%</span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed group-hover:text-slate-500 transition-colors">{l3.description}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {l3.isAutoCalculated ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black border border-emerald-100 shadow-sm">
                              <CheckCircle2 className="w-4 h-4" /> 自动测算得分: {currentScore.toFixed(2)}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <input type="range" min="0" max="10" step="0.5" className="w-24 md:w-36 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" value={currentScore} onChange={e => setScores({...scores, [l3.id]: parseFloat(e.target.value)})} />
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
                                <input type="number" min="0" max="10" step="0.1" className="w-12 text-center font-black text-indigo-600 focus:outline-none text-sm" value={currentScore} onChange={e => setScores({...scores, [l3.id]: parseFloat(e.target.value) || 0})} />
                                <span className="text-[10px] text-slate-400 font-black">/ 10</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-600 text-white rounded-[2rem] p-8 shadow-2xl shadow-indigo-200 sticky top-8">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 border-b border-indigo-500 pb-4">
                <TrendingUp className="w-6 h-6" /> 激励核算预览
              </h3>
              <div className="space-y-8">
                <div className="flex justify-between items-end pb-6">
                  <div>
                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">年度加权总分 (Pi)</p>
                    <div className="text-6xl font-black tracking-tighter">{result?.totalScore}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">测算建议等级</p>
                    <div className="text-5xl font-black">{result?.grade}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/15 transition-colors">
                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">激励分配资格</p>
                    <div className={`text-lg font-black flex items-center gap-2 ${result?.isEligible ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {result?.isEligible ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      {result?.eligibilityReason}
                    </div>
                  </div>
                  <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md hover:bg-white/15 transition-colors">
                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">核算分配系数 (Ci)</p>
                    <div className="text-4xl font-black">{result?.coefficient}</div>
                  </div>
                </div>

                <button onClick={handleSave} className="w-full py-5 bg-white text-indigo-600 font-black rounded-2xl shadow-xl hover:shadow-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-lg group active:scale-[0.98]">
                  <ClipboardCheck className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  提交并存档评分
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;