/**
 * 个税计算页面
 */

const { TAX_BRACKETS, TAX_THRESHOLD, INSURANCE_RATES, SPECIAL_DEDUCTIONS } = require('../../../data/tax-rates');

Page({
  data: {
    // 输入值
    salary: '',           // 税前月收入
    insuranceBase: '',    // 五险一金基数（默认等于税前收入）
    insuranceExpanded: false,
    deductionsExpanded: false,
    showResult: false,

    // 五险一金比例
    insuranceRates: [
      { key: 'pension', name: '养老保险', rate: 8, checked: true },
      { key: 'medical', name: '医疗保险', rate: 2, checked: true },
      { key: 'unemployment', name: '失业保险', rate: 0.5, checked: true },
      { key: 'housing', name: '住房公积金', rate: 7, checked: true }
    ],

    // 专项附加扣除
    deductions: [
      { key: 'childrenEducation', name: '子女教育', amount: 0, maxPerChild: 2000, childCount: 0, desc: '每个子女2000元/月' },
      { key: 'continuingEducation', name: '继续教育', amount: 0, desc: '学历400元/月' },
      { key: 'housingLoan', name: '住房贷款利息', amount: 0, desc: '1000元/月' },
      { key: 'housingRent', name: '住房租金', amount: 0, level: 0, desc: '800/1100/1500元/月', levels: [800, 1100, 1500] },
      { key: 'elderlySupport', name: '赡养老人', amount: 0, desc: '3000元/月' },
      { key: 'infantCare', name: '婴幼儿照护', amount: 0, maxPerChild: 2000, childCount: 0, desc: '每个婴幼儿2000元/月' }
    ],

    // 结果
    resultRows: []
  },

  /**
   * 收入输入
   */
  onSalaryInput(e) {
    this.setData({ salary: e.detail.value, showResult: false });
  },

  onInsuranceBaseInput(e) {
    this.setData({ insuranceBase: e.detail.value, showResult: false });
  },

  /**
   * 五险一金展开/折叠
   */
  toggleInsurance() {
    this.setData({ insuranceExpanded: !this.data.insuranceExpanded });
  },

  /**
   * 专项扣除展开/折叠
   */
  toggleDeductions() {
    this.setData({ deductionsExpanded: !this.data.deductionsExpanded });
  },

  /**
   * 五险一金勾选
   */
  onInsuranceSwitch(e) {
    const key = e.currentTarget.dataset.key;
    const items = this.data.insuranceRates;
    const idx = items.findIndex(i => i.key === key);
    if (idx >= 0) {
      items[idx].checked = !items[idx].checked;
      this.setData({ insuranceRates: items, showResult: false });
    }
  },

  /**
   * 住房租金等级切换
   */
  onRentLevel(e) {
    const key = e.currentTarget.dataset.key;
    const items = this.data.deductions;
    const idx = items.findIndex(i => i.key === key);
    if (idx >= 0) {
      items[idx].level = (items[idx].level + 1) % 3;
      items[idx].amount = items[idx].levels[items[idx].level];
      this.setData({ deductions: items, showResult: false });
    }
  },

  /**
   * 子女教育/婴幼儿数量调整
   */
  onDeductionCount(e) {
    const key = e.currentTarget.dataset.key;
    const delta = e.currentTarget.dataset.delta;
    const items = this.data.deductions;
    const idx = items.findIndex(i => i.key === key);
    if (idx >= 0) {
      const item = items[idx];
      item.childCount = Math.max(0, item.childCount + delta);
      item.amount = item.childCount * item.maxPerChild;
      this.setData({ deductions: items, showResult: false });
    }
  },

  /**
   * 专项扣除切换
   */
  onDeductionSwitch(e) {
    const key = e.currentTarget.dataset.key;
    const items = this.data.deductions;
    const idx = items.findIndex(i => i.key === key);
    if (idx >= 0) {
      const item = items[idx];
      // 切换启用/禁用
      if (item.amount > 0 && item.key !== 'continuingEducation' && item.key !== 'housingLoan') {
        item.childCount = 0;
        item.amount = 0;
      } else if (item.key === 'continuingEducation') {
        item.amount = item.amount > 0 ? 0 : 400;
      } else if (item.key === 'housingLoan') {
        item.amount = item.amount > 0 ? 0 : 1000;
      } else if (item.key === 'elderlySupport') {
        item.amount = item.amount > 0 ? 0 : 3000;
      }
      this.setData({ deductions: items, showResult: false });
    }
  },

  /**
   * 计算个税
   */
  onCalculate() {
    const salary = parseFloat(this.data.salary);
    if (isNaN(salary) || salary <= 0) {
      wx.showToast({ title: '请输入有效的税前收入', icon: 'none' });
      return;
    }

    const insuranceBase = parseFloat(this.data.insuranceBase) || salary;

    // 计算五险一金
    let insuranceTotal = 0;
    this.data.insuranceRates.forEach(item => {
      if (item.checked) {
        insuranceTotal += insuranceBase * item.rate / 100;
      }
    });

    // 计算专项附加扣除
    let deductionsTotal = 0;
    this.data.deductions.forEach(item => {
      deductionsTotal += item.amount || 0;
    });

    // 应纳税所得额
    const taxableIncome = Math.max(0, salary - insuranceTotal - deductionsTotal - TAX_THRESHOLD);

    // 查找对应税率
    let tax = 0;
    const annualTaxable = taxableIncome * 12;
    for (const bracket of TAX_BRACKETS) {
      if (annualTaxable <= bracket.max) {
        tax = (annualTaxable * bracket.rate - bracket.quickDeduction) / 12;
        break;
      }
    }
    tax = Math.max(0, tax);

    // 税后收入
    const afterTax = salary - insuranceTotal - tax;

    const rows = [
      { label: '税前收入', value: `¥ ${salary.toFixed(2)}` },
      { label: '五险一金', value: `-¥ ${insuranceTotal.toFixed(2)}` },
      { label: '专项附加扣除', value: `-¥ ${deductionsTotal.toFixed(2)}` },
      { label: `起征点 (${TAX_THRESHOLD}元)`, value: `-¥ ${TAX_THRESHOLD.toFixed(2)}` },
      { label: '应纳税所得额', value: `¥ ${taxableIncome.toFixed(2)}` },
      { label: '个税 (月)', value: `-¥ ${tax.toFixed(2)}`, highlight: false },
      { label: '税后收入', value: `¥ ${afterTax.toFixed(2)}`, highlight: true }
    ];

    this.setData({
      resultRows: rows,
      showResult: true
    });
  }
});
