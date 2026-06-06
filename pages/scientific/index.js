/**
 * 科学计算器页面
 */

const CalculatorEngine = require('../../utils/calculator');
const formatter = require('../../utils/formatter');
const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    expression: '',
    result: '0',
    error: false,
    shouldResetInput: false,
    degMode: true  // DEG = true, RAD = false
  },

  onLoad() {
    this.engine = new CalculatorEngine();
    this.engine.degMode = true;
  },

  /**
   * 数字键
   */
  onDigit(e) {
    const digit = e.detail.value;
    let { expression, result, shouldResetInput, error } = this.data;

    if (error) {
      this.clearAll();
      expression = '';
      result = '0';
      shouldResetInput = false;
    }

    if (shouldResetInput) {
      expression = expression + digit;
      result = digit;
      this.setData({
        expression,
        result,
        error: false,
        shouldResetInput: false
      });
      return;
    }

    if (result === '0' && digit !== '0') {
      result = digit;
      expression = expression.slice(0, -1) + digit;
    } else if (result === '0' && digit === '0') {
      return;
    } else {
      result = result + digit;
      expression = expression + digit;
    }

    this.setData({
      expression,
      result,
      error: false,
      shouldResetInput: false
    });
  },

  /**
   * 运算符键
   */
  onOperator(e) {
    const op = e.detail.value;
    let { expression, error } = this.data;

    if (error) return;

    const lastChar = expression.slice(-1);
    if (['+', '−', '×', '÷', '^'].includes(lastChar)) {
      expression = expression.slice(0, -1) + op;
    } else {
      expression = expression + op;
    }

    this.setData({
      expression,
      result: '0',
      shouldResetInput: true,
      error: false
    });
  },

  /**
   * 科学函数键
   */
  onFunction(e) {
    const func = e.detail.value;
    let { expression, result, shouldResetInput } = this.data;

    // 构建函数调用表达式
    let funcExpr;
    switch (func) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'asin':
      case 'acos':
      case 'atan':
      case 'log':
      case 'ln':
        funcExpr = func + '(';
        break;
      case 'sin⁻¹':
        funcExpr = 'asin(';
        break;
      case 'cos⁻¹':
        funcExpr = 'acos(';
        break;
      case 'tan⁻¹':
        funcExpr = 'atan(';
        break;
      case 'x²':
        funcExpr = '^2';
        break;
      case 'x³':
        funcExpr = '^3';
        break;
      case '√':
        funcExpr = '√(';
        break;
      case '³√':
        funcExpr = '³√(';
        break;
      case 'eˣ':
        funcExpr = 'e^';
        break;
      case '10ˣ':
        funcExpr = '10^';
        break;
      case 'n!':
        funcExpr = '!';
        break;
      default:
        funcExpr = func;
    }

    if (shouldResetInput) {
      expression = expression + funcExpr;
    } else {
      expression = expression + funcExpr;
    }

    this.setData({
      expression,
      shouldResetInput: false
    });
  },

  /**
   * 常数键 (π, e)
   */
  onConstant(e) {
    const constant = e.detail.value;
    let { expression, shouldResetInput } = this.data;

    const value = constant === 'π' ? 'π' : 'e';

    if (shouldResetInput) {
      expression = expression + value;
    } else {
      expression = expression + value;
    }

    this.setData({
      expression,
      shouldResetInput: false
    });
  },

  /**
   * 括号键
   */
  onParen(e) {
    const paren = e.detail.value;
    let { expression } = this.data;

    expression = expression + paren;

    this.setData({
      expression,
      shouldResetInput: false
    });
  },

  /**
   * 等号键
   */
  onEquals() {
    const { expression, error } = this.data;
    if (error || !expression) return;

    this.engine.degMode = this.data.degMode;
    const calcResult = this.engine.calculate(expression);

    if (calcResult.error) {
      this.setData({
        error: true,
        result: calcResult.message
      });
      return;
    }

    const formattedResult = formatter.formatResult(calcResult.value, {
      thousandsSep: app.globalData.thousandsSep,
      decimalPlaces: app.globalData.decimalPlaces
    });

    const displayExpr = formatter.formatExpression(expression);

    this.setData({
      result: formattedResult,
      expression: displayExpr,
      shouldResetInput: true,
      error: false
    });

    storage.addHistory({
      expression: displayExpr,
      result: formattedResult
    });
  },

  /**
   * DEG/RAD 切换
   */
  toggleDegMode() {
    const newMode = !this.data.degMode;
    this.setData({ degMode: newMode });
    this.engine.degMode = newMode;
  },

  /**
   * 清除
   */
  onClear() {
    this.clearAll();
  },

  clearAll() {
    this.setData({
      expression: '',
      result: '0',
      error: false,
      shouldResetInput: false
    });
  },

  /**
   * 退格
   */
  onBackspace() {
    let { expression, result, error } = this.data;

    if (error) {
      this.clearAll();
      return;
    }

    if (!expression || expression.length <= 1) {
      this.clearAll();
      return;
    }

    expression = expression.slice(0, -1);
    result = result.slice(0, -1) || '0';

    this.setData({
      expression,
      result,
      shouldResetInput: false
    });
  },

  /**
   * 百分号
   */
  onPercent() {
    const { expression } = this.data;
    this.setData({
      expression: expression + '%'
    });
  },

  /**
   * 正负号
   */
  onNegate() {
    let { expression } = this.data;
    this.setData({
      expression: expression + '(-'
    });
  },

  /**
   * 小数点
   */
  onDecimal() {
    let { result, expression, shouldResetInput } = this.data;

    if (result.includes('.')) return;

    if (shouldResetInput) {
      result = '0.';
      expression = expression + '0.';
    } else {
      result = result + '.';
      expression = expression + '.';
    }

    this.setData({
      expression,
      result,
      shouldResetInput: false
    });
  },

  /**
   * 返回基础计算器
   */
  goToBasic() {
    wx.navigateBack();
  },

  /**
   * 跳转到历史
   */
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/index'
    });
  }
});
