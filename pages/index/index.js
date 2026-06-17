/**
 * 项目入口页 — 头部导航 + 计算/换算 Tab
 */
const CalculatorEngine = require('../../utils/calculator');
const formatter = require('../../utils/formatter');
const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    currentTab: 'calc',
    layout: 'basic',
    // 显示区
    exprDisplay:   '',   // 第1行：表达式 "1+1"
    previewText:   '',   // 第2行：实时预览 "= 2"
    resultDisplay: '',   // 第2行：= 后结果
    historyText:   '',   // 历史区
    showResult:    false,
    error:         false,
    shouldResetInput: false,
    // 暂存（供 C 键推入历史区）
    _lastExpr: '', _lastResult: '',
    // 换算工具
    tools: [
      { key: 'currency',   name: '汇率转换', icon: '/assets/currency.svg', iconType: 'svg', url: '/pages/convert/currency/index' },
      { key: 'length',     name: '长度转换', icon: '/assets/length.svg', iconType: 'svg', url: '/pages/convert/unit/index?cat=length' },
      { key: 'weight',     name: '重量转换', icon: '/assets/weight.svg', iconType: 'svg', url: '/pages/convert/unit/index?cat=weight' },
      { key: 'area',       name: '面积转换', icon: '/assets/area.svg', iconType: 'svg', url: '/pages/convert/unit/index?cat=area' },
      { key: 'tax',        name: '个税计算', icon: '/assets/tax.svg', iconType: 'svg', url: '/pages/convert/tax/index' },
      { key: 'mortgage',   name: '房贷计算', icon: '/assets/mortgage.svg', iconType: 'svg', url: '/pages/convert/mortgage/index' },
      { key: 'relation',   name: '称呼计算', icon: '/assets/relation.svg', iconType: 'svg', url: '/pages/convert/relation/index' },
      { key: 'capitalize', name: '大写数字', icon: '/assets/capitalize.svg', iconType: 'svg', url: '/pages/convert/capitalize/index' },
      { key: 'time',       name: '时间转换', icon: '/assets/time.svg', iconType: 'svg', url: '/pages/convert/unit/index?cat=time' },
      { key: 'volume',     name: '体积转换', icon: '/assets/volume.svg', iconType: 'svg', url: '/pages/convert/unit/index?cat=volume' },
      { key: 'base',       name: '进制转换', icon: '/assets/base.svg', iconType: 'svg', url: '/pages/convert/base/index' },
      { key: 'temperature',name: '温度转换', icon: '/assets/temperature.svg', iconType: 'svg', url: '/pages/convert/unit/index?cat=temperature' },
      { key: 'speed',      name: '速度转换', icon: '/assets/speed.svg', iconType: 'svg', url: '/pages/convert/unit/index?cat=speed' },
      { key: 'bmi',        name: 'BMI计算',  icon: '/assets/bmi.svg', iconType: 'svg', url: '/pages/convert/bmi/index' }
    ]
  },

  onLoad() {
    this.engine = new CalculatorEngine();
    this.engine.degMode = true;
    this._calcResult = null;
  },

  // ==================== Tab / 工具 ====================
  onSwitchTab(e) { this.setData({ currentTab: e.detail.tab }); },
  onToolTap(e)  { wx.navigateTo({ url: e.currentTarget.dataset.url }); },

  // ==================== 实时预览 ====================
  updatePreview() {
    const { exprDisplay, showResult } = this.data;
    if (showResult || !exprDisplay) { this.setData({ previewText: '' }); return; }
    // 只有 "0" 或为空时不显示预览
    if (exprDisplay === '0') { this.setData({ previewText: '' }); return; }
    // 去掉末尾不完整的运算符，如 "2×" → "2"
    const clean = exprDisplay.replace(/[+−×÷%]+$/, '');
    if (!clean || clean === '0') { this.setData({ previewText: '' }); return; }
    const r = this.engine.calculate(clean);
    if (!r.error && isFinite(r.value)) {
      const v = formatter.formatResult(r.value, {
        thousandsSep: app.globalData.thousandsSep,
        decimalPlaces: app.globalData.decimalPlaces
      });
      this.setData({ previewText: '= ' + v });
    } else {
      this.setData({ previewText: '' });
    }
  },

  // ==================== 数字 ====================
  onDigit(e) {
    const d = e.detail.value;
    let { exprDisplay, shouldResetInput, showResult } = this.data;
    if (showResult) { exprDisplay = ''; shouldResetInput = false; this.setData({ showResult: false }); }

    if (shouldResetInput) {
      exprDisplay = exprDisplay + d;
    } else if (!exprDisplay || exprDisplay === '0') {
      exprDisplay = d === '0' ? '0' : d;
    } else {
      exprDisplay = exprDisplay + d;
    }
    this.setData({ exprDisplay, shouldResetInput: false, error: false });
    this.updatePreview();
  },

  // ==================== 运算符 ====================
  onOperator(e) {
    const op = e.detail.value;
    let { exprDisplay, showResult } = this.data;
    // = 后按运算符：用结果继续
    if (showResult && this._calcResult != null) {
      exprDisplay = this._calcResult.toString() + op;
      this.setData({ exprDisplay, showResult: false, shouldResetInput: true });
      this.updatePreview();
      return;
    }
    // 表达式为空时，自动补 0
    if (!exprDisplay) { exprDisplay = '0'; }
    const last = exprDisplay.slice(-1);
    if (['+', '−', '×', '÷', '%'].includes(last)) {
      exprDisplay = exprDisplay.slice(0, -1) + op;
    } else {
      exprDisplay = exprDisplay + op;
    }
    this.setData({ exprDisplay, showResult: false, shouldResetInput: true });
    this.updatePreview();
  },

  // ==================== 等号 ====================
  onEquals() {
    const { exprDisplay, showResult } = this.data;
    if (!exprDisplay || showResult) return;

    // 去掉末尾不完整运算符，如 "2-1+" → "2-1"
    const clean = exprDisplay.replace(/[+−×÷%]+$/, '') || '0';
    const r = this.engine.calculate(clean);
    if (r.error) { this.setData({ error: true, previewText: r.message }); return; }

    this._calcResult = r.value;

    const resultStr = formatter.formatResult(r.value, {
      thousandsSep: app.globalData.thousandsSep,
      decimalPlaces: app.globalData.decimalPlaces
    });

    // 保存到持久历史
    storage.addHistory({ expression: exprDisplay, result: resultStr });

    // = 纯动画：不改变表达式文字，只交换字体大小
    this.setData({
      _lastExpr: exprDisplay,
      _lastResult: resultStr,
      resultDisplay: resultStr,
      showResult: true,
      previewText: '',
      shouldResetInput: true
    });
  },

  // ==================== 清除 C / AC ====================
  onClear() {
    const { showResult, _lastExpr, _lastResult, exprDisplay } = this.data;

    // C：有完成计算 → 推入历史区
    if (showResult && _lastExpr) {
      this.setData({
        historyText: _lastExpr + ' = ' + _lastResult,
        exprDisplay: '',
        resultDisplay: '',
        previewText: '',
        showResult: false,
        _lastExpr: '', _lastResult: ''
      });
      this._calcResult = null;
      return;
    }

    // AC：无输入 → 清空历史区
    if (!exprDisplay || exprDisplay === '0') {
      this.setData({
        historyText: '',
        exprDisplay: '',
        resultDisplay: '',
        previewText: '',
        showResult: false,
        _lastExpr: '', _lastResult: ''
      });
      this._calcResult = null;
      return;
    }

    // C：清除当前输入
    this.setData({
      exprDisplay: '',
      resultDisplay: '',
      previewText: '',
      showResult: false
    });
  },

  // ==================== 退格 ====================
  onBackspace() {
    let { exprDisplay } = this.data;
    if (!exprDisplay || exprDisplay.length <= 1) {
      this.setData({ exprDisplay: '', previewText: '' });
      return;
    }
    exprDisplay = exprDisplay.slice(0, -1);
    this.setData({ exprDisplay, showResult: false });
    this.updatePreview();
  },

  // ==================== 百分号 ====================
  onPercent() {
    const { exprDisplay } = this.data;
    if (!exprDisplay) return;
    this.setData({ exprDisplay: exprDisplay + '%', showResult: false });
    this.updatePreview();
  },

  // ==================== 小数点 ====================
  onDecimal() {
    let { exprDisplay, shouldResetInput } = this.data;
    if (shouldResetInput) {
      exprDisplay = exprDisplay + '0.';
    } else {
      exprDisplay = exprDisplay ? exprDisplay + '.' : '0.';
    }
    this.setData({ exprDisplay, shouldResetInput: false, showResult: false });
    this.updatePreview();
  },

  // ==================== 科学函数 ====================
  onFunction(e) {
    const n = e.detail.value;
    let { exprDisplay } = this.data;
    if (!exprDisplay || exprDisplay === '0') exprDisplay = n + '(';
    else exprDisplay = exprDisplay + n + '(';
    this.setData({ exprDisplay, shouldResetInput: false, showResult: false });
    this.updatePreview();
  },

  // ==================== 括号 ====================
  onParen(e) {
    const p = e.detail.value;
    let { exprDisplay } = this.data;
    exprDisplay = exprDisplay ? exprDisplay + p : p;
    this.setData({ exprDisplay, shouldResetInput: false, showResult: false });
    this.updatePreview();
  },

  // ==================== 常数 ====================
  onConstant(e) {
    const c = e.detail.value;
    let { exprDisplay } = this.data;
    if (exprDisplay && exprDisplay !== '0') exprDisplay = exprDisplay + c;
    else exprDisplay = c;
    this.setData({ exprDisplay, shouldResetInput: false, showResult: false });
    this.updatePreview();
  },

  // ==================== 布局 / 角度 ====================
  onToggleLayout() {
    this.setData({ layout: this.data.layout === 'basic' ? 'scientific' : 'basic' });
  },
  onDegChange(e) {
    this.engine.setDegMode(e.detail.degMode);
  }
});
