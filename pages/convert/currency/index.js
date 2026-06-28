const currencies = require('../../../data/currencies');
const app = getApp();

/**
 * 数字格式化工具
 * @param {string} numStr - 纯数字字符串
 * @param {boolean} useThousandsSep - 是否启用千分位
 */
function formatNumber(numStr, useThousandsSep) {
  if (!numStr || numStr === '—' || !useThousandsSep) return numStr;
  const parts = String(numStr).split('.');
  // 仅对整数部分添加千分位
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

Page({
  data: {
    sourceCurrency: 'CNY',
    targetCurrency: 'USD',
    sourceAmount: '1',      // 内部始终存储纯数字字符串
    targetAmount: '',       // 显示值（可能含千分位）
    showPicker: false,
    pickerType: '',
    pickerTitle: '',
    pickerOptions: [],
    lastUpdate: ''
  },

  onLoad() {
    this.updateCurrencyInfo();
    this.updateRates();
  },

  onShow() {
    this.updateCurrencyInfo();
    this.updateRates();
  },

  updateCurrencyInfo() {
    const sourceInfo = this.getCurrencyInfo(this.data.sourceCurrency);
    const targetInfo = this.getCurrencyInfo(this.data.targetCurrency);
    this.setData({ sourceInfo, targetInfo });
  },

  updateRates() {
    const rates = app.globalData.currencyRates || {};
    let lastUpdate = app.globalData.lastRateUpdate || '';

    if (lastUpdate) {
      try {
        const date = new Date(lastUpdate);
        lastUpdate = `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
      } catch (e) {
        lastUpdate = '';
      }
    }

    this.setData({ rates, lastUpdate });
    this.convert();
  },

  onSourcePicker() {
    this.setData({
      showPicker: true,
      pickerType: 'source',
      pickerTitle: '选择源币种',
      pickerOptions: currencies.map(c => ({ ...c, key: c.code })),
      pickerSelected: this.data.sourceCurrency
    });
  },

  onTargetPicker() {
    this.setData({
      showPicker: true,
      pickerType: 'target',
      pickerTitle: '选择目标币种',
      pickerOptions: currencies.map(c => ({ ...c, key: c.code })),
      pickerSelected: this.data.targetCurrency
    });
  },

  onPickerSelect(e) {
    const { key } = e.detail;
    if (this.data.pickerType === 'source') {
      this.setData({ sourceCurrency: key });
    } else {
      this.setData({ targetCurrency: key });
    }
    this.updateCurrencyInfo();
    this.convert();
  },

  onPickerClose() {
    this.setData({ showPicker: false });
  },

  /**
   * 交换币种：始终以1为输入，反向换算
   */
  onSwap() {
    const { sourceCurrency, targetCurrency } = this.data;
    this.setData({
      sourceCurrency: targetCurrency,
      targetCurrency: sourceCurrency,
      sourceAmount: '1'
    });
    this.updateCurrencyInfo();
    this.convert();
  },

  onDigitTap(e) {
    const digit = e.currentTarget.dataset.digit;
    let amount = this.data.sourceAmount;

    if (amount === '0' && digit !== '.') {
      amount = digit;
    } else if (amount === '1' && digit !== '.') {
      amount = digit;
    } else {
      amount = amount + digit;
    }

    if (amount.replace('.', '').length > 15) return;

    this.setData({ sourceAmount: amount });
    this.convert();
  },

  onDecimalTap() {
    let amount = this.data.sourceAmount;
    if (amount.includes('.')) return;
    amount = amount + '.';
    this.setData({ sourceAmount: amount });
  },

  onBackspace() {
    let amount = this.data.sourceAmount;
    if (amount.length <= 1) {
      amount = '0';
    } else {
      amount = amount.slice(0, -1);
    }
    this.setData({ sourceAmount: amount });
    this.convert();
  },

  onClear() {
    this.setData({ sourceAmount: '0' });
    this.convert();
  },

  convert() {
    const { sourceCurrency, targetCurrency, sourceAmount } = this.data;
    const rates = this.data.rates || app.globalData.currencyRates;

    if (!rates) {
      this.setData({ targetAmount: '—' });
      return;
    }

    // 清除可能残留的千分位逗号，确保计算准确
    const cleanAmount = String(sourceAmount).replace(/,/g, '');
    const amount = parseFloat(cleanAmount);

    if (isNaN(amount) || amount <= 0) {
      this.setData({ targetAmount: '0' });
      return;
    }

    const sourceRate = rates[sourceCurrency];
    const targetRate = rates[targetCurrency];

    if (sourceRate === undefined || targetRate === undefined) {
      this.setData({ targetAmount: '—' });
      return;
    }

    // API返回的是 1 CNY = X 外币，公式：(输入 / 源汇率) * 目标汇率
    const baseAmount = amount / sourceRate;
    const result = baseAmount * targetRate;

    // ✅ 动态读取全局小数位配置
    const maxDecimals = app.globalData.decimalPlaces || 6;
    let resultStr;
    if (!isFinite(result)) {
      resultStr = '—';
    } else {
      resultStr = Number(result).toFixed(maxDecimals).replace(/\.?0+$/, '');
    }

    // ✅ 仅对结果应用千分位（输入框始终保持纯数字）
    const formattedResult = formatNumber(resultStr, app.globalData.thousandsSep);
    this.setData({ targetAmount: formattedResult });
  },

  getCurrencyInfo(code) {
    return currencies.find(c => c.code === code) || { code, name: code, flag: '' };
  },

  onShareAppMessage() {
    return {
      title: '多功能计算器 - 汇率/单位/个税/房贷/BMI',
      path: '/pages/index/index'
    };
  }
});