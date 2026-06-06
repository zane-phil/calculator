/**
 * 中国个人所得税相关数据
 */

// 累进税率表（综合所得 - 年度）
const TAX_BRACKETS = [
  { max: 36000, rate: 0.03, quickDeduction: 0 },
  { max: 144000, rate: 0.10, quickDeduction: 2520 },
  { max: 300000, rate: 0.20, quickDeduction: 16920 },
  { max: 420000, rate: 0.25, quickDeduction: 31920 },
  { max: 660000, rate: 0.30, quickDeduction: 52920 },
  { max: 960000, rate: 0.35, quickDeduction: 85920 },
  { max: Infinity, rate: 0.45, quickDeduction: 181920 }
];

// 起征点（月）
const TAX_THRESHOLD = 5000;

// 五险一金默认个人缴纳比例
const INSURANCE_RATES = {
  pension: { name: '养老保险', rate: 0.08 },
  medical: { name: '医疗保险', rate: 0.02 },
  unemployment: { name: '失业保险', rate: 0.005 },
  housing: { name: '住房公积金', rate: 0.07 }
};

// 专项附加扣除（每月）
const SPECIAL_DEDUCTIONS = {
  childrenEducation: { name: '子女教育', maxPerChild: 2000 },
  continuingEducation: { name: '继续教育', amount: 400 },
  seriousIllness: { name: '大病医疗', annualMax: 80000 },
  housingLoan: { name: '住房贷款利息', amount: 1000 },
  housingRent: { name: '住房租金', amounts: [800, 1100, 1500] },
  elderlySupport: { name: '赡养老人', amount: 3000 },
  infantCare: { name: '3岁以下婴幼儿照护', maxPerChild: 2000 }
};

// 贷款基准利率参考（2026年）
const LOAN_RATES = {
  commercial: {
    name: '商业贷款',
    above5Years: 3.95,  // LPR 5年期以上
    below5Years: 3.35   // LPR 1年期
  },
  providentFund: {
    name: '公积金贷款',
    above5Years: 3.25,
    below5Years: 2.75
  }
};

module.exports = {
  TAX_BRACKETS,
  TAX_THRESHOLD,
  INSURANCE_RATES,
  SPECIAL_DEDUCTIONS,
  LOAN_RATES
};
