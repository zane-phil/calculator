/**
 * 汇率换算页面
 */

const currencies = require('../../data/currencies');
const app = getApp();

Page({
  data: {
    sourceCurrency: 'CNY',
    targetCurrency: 'USD',
    sourceAmount: '1',
    targetAmount: '0.1385',
    showPicker: false,
    pickerType: '',  // 'source' | 'target'
    pickerTitle: '',
    pickerOptions: [],
    currencies: currencies,
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

  /**
   * 更新当前币种信息（用于显示旗标和名称）
   */
  updateCurrencyInfo() {
    const sourceInfo = this.getCurrencyInfo(this.data.sourceCurrency);
    const targetInfo = this.getCurrencyInfo(this.data.targetCurrency);
    this.setData({ sourceInfo, targetInfo });
  },

  /**
   * 更新汇率数据
   */
  updateRates() {
    const rates = app.globalData.currencyRates;
    let lastUpdate = app.globalData.lastRateUpdate || '';

    if (lastUpdate) {
      try {
        const date = new Date(lastUpdate);
        lastUpdate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } catch (e) {}
    }

    this.setData({
      rates: rates,
      lastUpdate: lastUpdate
    });

    // 重新计算
    this.convert();
  },

  /**
   * 打开币种选择器
   */
  onSourcePicker() {
    this.setData({
      showPicker: true,
      pickerType: 'source',
      pickerTitle: '选择币种',
      pickerOptions: this.data.currencies,
      pickerSelected: this.data.sourceCurrency
    });
  },

  onTargetPicker() {
    this.setData({
      showPicker: true,
      pickerType: 'target',
      pickerTitle: '选择币种',
      pickerOptions: this.data.currencies,
      pickerSelected: this.data.targetCurrency
    });
  },

  /**
   * 选中币种
   */
  onPickerSelect(e) {
    const { key } = e.detail;
    const type = this.data.pickerType;

    if (type === 'source') {
      this.setData({ sourceCurrency: key });
    } else {
      this.setData({ targetCurrency: key });
    }

    this.updateCurrencyInfo();
    this.convert();
  },

  /**
   * 关闭选择器
   */
  onPickerClose() {
    this.setData({ showPicker: false });
  },

  /**
   * 交换币种
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

  /**
   * 数字输入
   */
  onDigitTap(e) {
    const digit = e.currentTarget.dataset.digit;
    let { sourceAmount } = this.data;

    if (sourceAmount === '0' || sourceAmount === '1') {
      sourceAmount = digit;
    } else {
      sourceAmount = sourceAmount + digit;
    }

    // 限制长度
    if (sourceAmount.length > 15) return;

    this.setData({ sourceAmount });
    this.convert();
  },

  /**
   * 小数点
   */
  onDecimalTap() {
    let { sourceAmount } = this.data;
    if (sourceAmount.includes('.')) return;

    sourceAmount = sourceAmount + '.';
    this.setData({ sourceAmount });
  },

  /**
   * 退格
   */
  onBackspace() {
    let { sourceAmount } = this.data;
    if (sourceAmount.length <= 1) {
      sourceAmount = '0';
    } else {
      sourceAmount = sourceAmount.slice(0, -1);
    }
    this.setData({ sourceAmount });
    this.convert();
  },

  /**
   * 清除
   */
  onClear() {
    this.setData({ sourceAmount: '0' });
    this.convert();
  },

  /**
   * 执行换算
   */
  convert() {
    const { sourceCurrency, targetCurrency, sourceAmount } = this.data;
    const rates = this.data.rates || app.globalData.currencyRates;

    if (!rates) {
      this.setData({ targetAmount: '—' });
      return;
    }

    const amount = parseFloat(sourceAmount);
    if (isNaN(amount)) {
      this.setData({ targetAmount: '0' });
      return;
    }

    // 通过基准货币（CNY）计算
    let sourceRate, targetRate;

    if (rates[sourceCurrency] !== undefined && rates[targetCurrency] !== undefined) {
      sourceRate = rates[sourceCurrency];
      targetRate = rates[targetCurrency];
    } else {
      // 如果缓存不是以 CNY 为基准
      this.setData({ targetAmount: '—' });
      return;
    }

    // 换算：先将源货币转为基准货币，再转为目标货币
    const baseAmount = amount / sourceRate;
    const result = baseAmount * targetRate;

    // 格式化
    if (Math.abs(result) < 0.01) {
      this.setData({ targetAmount: result.toFixed(6) });
    } else if (Math.abs(result) < 1) {
      this.setData({ targetAmount: result.toFixed(4) });
    } else {
      this.setData({
        targetAmount: parseFloat(result.toFixed(4)).toString()
      });
    }
  },

  /**
   * 获取币种信息
   */
  getCurrencyInfo(code) {
    return currencies.find(c => c.code === code) || { code, name: code, symbol: '', flag: '' };
  }
});
