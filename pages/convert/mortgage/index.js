/**
 * 房贷计算页面
 */

const { LOAN_RATES } = require('../../../data/tax-rates');

Page({
  data: {
    // 贷款类型: 'commercial' | 'providentFund' | 'combined'
    loanType: 'commercial',
    // 还款方式: 'equalPayment' (等额本息) | 'equalPrincipal' (等额本金)
    repaymentType: 'equalPayment',

    // 输入值
    totalPrice: '',        // 房屋总价（万元）
    downPaymentRatio: 30,  // 首付比例
    loanYears: 30,         // 贷款年限
    interestRate: 3.75,    // 贷款利率

    // 快速选择
    yearOptions: [10, 15, 20, 25, 30],

    showResult: false,
    resultRows: [],
    monthlyFirst: '',      // 首月月供
    monthlyLast: '',       // 末月月供（等额本金）
    totalPayment: '',      // 还款总额
    totalInterest: ''      // 利息总额
  },

  onLoad() {
    this.updateRate();
  },

  /**
   * 贷款类型切换
   */
  onLoanType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ loanType: type, showResult: false });
    this.updateRate();
  },

  /**
   * 还款方式切换
   */
  onRepaymentType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ repaymentType: type, showResult: false });
  },

  /**
   * 更新默认利率
   */
  updateRate() {
    const { loanType } = this.data;
    if (loanType === 'commercial') {
      this.setData({ interestRate: LOAN_RATES.commercial.above5Years });
    } else if (loanType === 'providentFund') {
      this.setData({ interestRate: LOAN_RATES.providentFund.above5Years });
    } else {
      this.setData({ interestRate: LOAN_RATES.commercial.above5Years });
    }
  },

  /**
   * 输入处理
   */
  onTotalPriceInput(e) {
    this.setData({ totalPrice: e.detail.value, showResult: false });
  },

  onDownPaymentInput(e) {
    this.setData({ downPaymentRatio: parseFloat(e.detail.value) || 30, showResult: false });
  },

  onLoanYearsInput(e) {
    this.setData({ loanYears: parseInt(e.detail.value) || 30, showResult: false });
  },

  onInterestRateInput(e) {
    this.setData({ interestRate: parseFloat(e.detail.value) || 3.75, showResult: false });
  },

  /**
   * 快速选择贷款年限
   */
  onYearSelect(e) {
    const year = parseInt(e.currentTarget.dataset.year);
    this.setData({ loanYears: year, showResult: false });
  },

  /**
   * 计算房贷
   */
  onCalculate() {
    const totalPrice = parseFloat(this.data.totalPrice);
    if (isNaN(totalPrice) || totalPrice <= 0) {
      wx.showToast({ title: '请输入有效的房屋总价', icon: 'none' });
      return;
    }

    const downPaymentRatio = this.data.downPaymentRatio / 100;
    const loanYears = this.data.loanYears;
    const annualRate = this.data.interestRate / 100;

    // 贷款金额（万元 → 元）
    const loanAmount = totalPrice * 10000 * (1 - downPaymentRatio);
    const months = loanYears * 12;
    const monthlyRate = annualRate / 12;

    let rows = [];
    let monthlyFirst, monthlyLast, totalPayment, totalInterest;

    rows.push({ label: '房屋总价', value: `¥ ${(totalPrice * 10000).toLocaleString()}` });
    rows.push({ label: '首付比例', value: `${this.data.downPaymentRatio}%` });
    rows.push({ label: '首付金额', value: `¥ ${(totalPrice * 10000 * downPaymentRatio).toLocaleString()}` });
    rows.push({ label: '贷款金额', value: `¥ ${loanAmount.toLocaleString()}` });
    rows.push({ label: '贷款年限', value: `${loanYears} 年 (${months} 个月)` });
    rows.push({ label: '贷款利率', value: `${this.data.interestRate}%` });

    if (this.data.repaymentType === 'equalPayment') {
      // 等额本息
      const pow = Math.pow(1 + monthlyRate, months);
      const monthly = loanAmount * monthlyRate * pow / (pow - 1);
      totalPayment = monthly * months;
      totalInterest = totalPayment - loanAmount;

      monthlyFirst = monthly;
      rows.push({ label: '月供 (每月)', value: `¥ ${monthly.toFixed(2)}`, highlight: true });
    } else {
      // 等额本金
      const monthlyPrincipal = loanAmount / months;

      // 首月月供
      const firstMonth = monthlyPrincipal + loanAmount * monthlyRate;
      monthlyFirst = firstMonth;

      // 末月月供
      const lastMonth = monthlyPrincipal + monthlyPrincipal * monthlyRate;
      monthlyLast = lastMonth;

      // 总利息 = (月数 + 1) × 贷款本金 × 月利率 / 2
      totalInterest = (months + 1) * loanAmount * monthlyRate / 2;
      totalPayment = loanAmount + totalInterest;

      rows.push({ label: '首月月供', value: `¥ ${firstMonth.toFixed(2)}`, highlight: true });
      rows.push({ label: '末月月供', value: `¥ ${lastMonth.toFixed(2)}` });
    }

    rows.push({ label: '还款总额', value: `¥ ${totalPayment.toFixed(2)}` });
    rows.push({ label: '利息总额', value: `¥ ${totalInterest.toFixed(2)}`, highlight: true });

    this.setData({
      resultRows: rows,
      showResult: true,
      monthlyFirst: monthlyFirst ? monthlyFirst.toFixed(2) : '',
      monthlyLast: monthlyLast ? monthlyLast.toFixed(2) : '',
      totalPayment: totalPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2)
    });
  },

onShareAppMessage() {
    return {
      title: "多功能计算器 - 汇率/单位/个税/房贷/BMI",
      path: "/pages/index/index"
    };
  },

});