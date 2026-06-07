/**
 * 基础计算器页面
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
    shouldResetInput: false,  // 按下运算符后，下一个数字重置输入
    lastResult: null,          // 上次计算结果
    lastOperator: null         // 上次按的运算符
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

    // 错误状态时自动清空
    if (error) {
      this.clearAll();
      expression = '';
      result = '0';
      shouldResetInput = false;
    }

    // 按过运算符后，开始新输入
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

    // 当前结果为 "0" 时替换
    if (result === '0' && digit !== '0') {
      result = digit;
      expression = expression.slice(0, -1) + digit;
    } else if (result === '0' && digit === '0') {
      // 不允许多个前导零
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
    let { expression, result, error } = this.data;

    if (error) return;

    // 如果表达式以运算符结尾，替换运算符
    const lastChar = expression.slice(-1);
    if (['+', '−', '×', '÷', '%'].includes(lastChar)) {
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
   * 等号键
   */
  onEquals() {
    const { expression, error } = this.data;
    if (error || !expression) return;

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

    // 保存到历史
    storage.addHistory({
      expression: displayExpr,
      result: formattedResult
    });
  },

  /**
   * 清除键
   */
  onClear() {
    const { expression } = this.data;
    // 如果已经全清，不做任何事
    if (!expression || expression === '0') {
      this.clearAll();
      return;
    }

    // 先清除当前输入（AC -> C 行为）
    this.clearAll();
  },

  clearAll() {
    this.setData({
      expression: '',
      result: '0',
      error: false,
      shouldResetInput: false,
      lastResult: null,
      lastOperator: null
    });
  },

  /**
   * 退格键
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

    // 移除最后一个字符
    expression = expression.slice(0, -1);
    result = result.slice(0, -1) || '0';

    this.setData({
      expression,
      result,
      shouldResetInput: false
    });
  },

  /**
   * 百分号键
   */
  onPercent() {
    const { expression, result } = this.data;
    if (!result || result === '0') return;

    const value = parseFloat(result);
    const percentValue = value / 100;

    const newExpr = expression + '%';
    this.setData({
      expression: newExpr,
      result: percentValue.toString()
    });
  },

  /**
   * 正负号切换
   */
  onNegate() {
    let { expression, result, error } = this.data;
    if (error || !result || result === '0') return;

    if (result.startsWith('-')) {
      result = result.slice(1);
    } else {
      result = '-' + result;
    }

    this.setData({
      expression: result,
      result
    });
  },

  /**
   * 小数点
   */
  onDecimal() {
    let { result, expression, shouldResetInput } = this.data;

    // 如果当前结果已包含小数点，忽略
    if (result.includes('.')) return;

    // 如果按过运算符，重置输入
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

});
