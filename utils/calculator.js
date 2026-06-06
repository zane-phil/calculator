/**
 * 计算引擎 - 表达式解析与求值
 * 使用逆波兰表示法（RPN）实现运算符优先级
 */

const formatter = require('./formatter');

class CalculatorEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.expression = '';
    this.tokens = [];
  }

  /**
   * 运算符定义
   */
  static get OPERATORS() {
    return {
      '+': { prec: 1, assoc: 'L', fn: (a, b) => a + b },
      '-': { prec: 1, assoc: 'L', fn: (a, b) => a - b },
      '×': { prec: 2, assoc: 'L', fn: (a, b) => a * b },
      '÷': { prec: 2, assoc: 'L', fn: (a, b) => a / b },
      '%': { prec: 2, assoc: 'L', fn: (a, b) => a * (b / 100) },
      '^': { prec: 3, assoc: 'R', fn: (a, b) => Math.pow(a, b) }
    };
  }

  /**
   * 科学函数定义
   */
  static get FUNCTIONS() {
    return {
      'sin': { args: 1, fn: (a) => Math.sin(a) },
      'cos': { args: 1, fn: (a) => Math.cos(a) },
      'tan': { args: 1, fn: (a) => Math.tan(a) },
      'asin': { args: 1, fn: (a) => Math.asin(a) },
      'acos': { args: 1, fn: (a) => Math.acos(a) },
      'atan': { args: 1, fn: (a) => Math.atan(a) },
      'log': { args: 1, fn: (a) => Math.log10(a) },
      'ln': { args: 1, fn: (a) => Math.log(a) },
      '√': { args: 1, fn: (a) => Math.sqrt(a) },
      '³√': { args: 1, fn: (a) => Math.cbrt(a) },
      'x²': { args: 1, fn: (a) => Math.pow(a, 2) },
      'x³': { args: 1, fn: (a) => Math.pow(a, 3) },
      '10ˣ': { args: 1, fn: (a) => Math.pow(10, a) },
      'eˣ': { args: 1, fn: (a) => Math.exp(a) },
      'abs': { args: 1, fn: (a) => Math.abs(a) },
      'n!': { args: 1, fn: (a) => CalculatorEngine.factorial(a) }
    };
  }

  /**
   * 常数
   */
  static get CONSTANTS() {
    return {
      'π': Math.PI,
      'pi': Math.PI,
      'e': Math.E
    };
  }

  /**
   * 阶乘
   */
  static factorial(n) {
    if (n < 0) throw new Error('阶乘不支持负数');
    if (!Number.isInteger(n)) throw new Error('阶乘仅支持整数');
    if (n > 170) throw new Error('数值过大');
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  /**
   * Token 类型
   */
  static getTokenType(token) {
    if (!isNaN(parseFloat(token)) && isFinite(token)) return 'number';
    if (CalculatorEngine.OPERATORS[token]) return 'operator';
    if (CalculatorEngine.FUNCTIONS[token]) return 'function';
    if (CalculatorEngine.CONSTANTS[token] !== undefined) return 'constant';
    if (token === '(') return 'leftParen';
    if (token === ')') return 'rightParen';
    return 'unknown';
  }

  /**
   * 将表达式字符串转换为 Token 数组
   */
  tokenize(expr) {
    const tokens = [];
    let i = 0;

    while (i < expr.length) {
      const ch = expr[i];

      // 空格跳过
      if (ch === ' ') {
        i++;
        continue;
      }

      // 数字（包括小数）
      if (/[0-9.]/.test(ch)) {
        let num = '';
        while (i < expr.length && /[0-9.eE+\-]/.test(expr[i])) {
          // 处理科学计数法中的指数
          if ((expr[i] === 'e' || expr[i] === 'E') && num.includes('e') === false && num.includes('E') === false) {
            num += expr[i];
            i++;
            if (expr[i] === '+' || expr[i] === '-') {
              num += expr[i];
              i++;
            }
            continue;
          }
          if ((expr[i] === '+' || expr[i] === '-') && (num.endsWith('e') || num.endsWith('E'))) {
            num += expr[i];
            i++;
            continue;
          }
          num += expr[i];
          i++;
        }
        tokens.push(num);
        continue;
      }

      // 字母函数名
      if (/[a-zA-Zπ√³]/u.test(ch)) {
        let name = ch;
        i++;
        // 收集连续字母（包括上标数字）
        while (i < expr.length && /[a-zA-Z²³ˣπ]/u.test(expr[i])) {
          name += expr[i];
          i++;
        }
        tokens.push(name);
        continue;
      }

      // 单字符运算符和括号
      tokens.push(ch);
      i++;
    }

    return tokens;
  }

  /**
   * 中缀转后缀（Shunting-yard 算法）
   */
  toRPN(tokens) {
    const output = [];
    const stack = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const type = CalculatorEngine.getTokenType(token);

      if (type === 'number') {
        output.push(parseFloat(token));
      } else if (type === 'constant') {
        output.push(CalculatorEngine.CONSTANTS[token]);
      } else if (type === 'function') {
        stack.push(token);
      } else if (type === 'operator') {
        const op1 = CalculatorEngine.OPERATORS[token];
        while (stack.length > 0) {
          const top = stack[stack.length - 1];
          const topType = CalculatorEngine.getTokenType(top);
          if (topType === 'operator') {
            const op2 = CalculatorEngine.OPERATORS[top];
            if ((op1.assoc === 'L' && op1.prec <= op2.prec) ||
                (op1.assoc === 'R' && op1.prec < op2.prec)) {
              output.push(stack.pop());
              continue;
            }
          } else if (topType === 'function') {
            output.push(stack.pop());
            continue;
          }
          break;
        }
        stack.push(token);
      } else if (token === '(') {
        stack.push(token);
      } else if (token === ')') {
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          output.push(stack.pop());
        }
        if (stack.length === 0) throw new Error('括号不匹配');
        stack.pop(); // 弹出 '('

        // 如果括号前是一个函数，弹出函数
        if (stack.length > 0 && CalculatorEngine.getTokenType(stack[stack.length - 1]) === 'function') {
          output.push(stack.pop());
        }
      }
    }

    // 弹出栈中剩余元素
    while (stack.length > 0) {
      const top = stack.pop();
      if (top === '(' || top === ')') throw new Error('括号不匹配');
      output.push(top);
    }

    return output;
  }

  /**
   * 计算后缀表达式
   */
  evaluateRPN(rpn) {
    const stack = [];
    const degMode = this.degMode !== false; // 默认角度模式

    for (const item of rpn) {
      if (typeof item === 'number') {
        stack.push(item);
      } else if (CalculatorEngine.OPERATORS[item]) {
        if (stack.length < 2) throw new Error('表达式不完整');
        const b = stack.pop();
        const a = stack.pop();
        stack.push(CalculatorEngine.OPERATORS[item].fn(a, b));
      } else if (CalculatorEngine.FUNCTIONS[item]) {
        if (stack.length < 1) throw new Error('表达式不完整');
        let arg = stack.pop();

        // 三角函数 DEG/RAD 处理
        if (['sin', 'cos', 'tan'].includes(item) && degMode) {
          arg = arg * Math.PI / 180;
        }
        if (['asin', 'acos', 'atan'].includes(item) && degMode) {
          arg = arg; // 输入已经是弧度比值
          const result = CalculatorEngine.FUNCTIONS[item].fn(arg);
          stack.push(result * 180 / Math.PI);
          continue;
        }

        stack.push(CalculatorEngine.FUNCTIONS[item].fn(arg));
      }
    }

    if (stack.length !== 1) throw new Error('表达式不完整');
    return stack[0];
  }

  /**
   * 主入口：计算表达式
   */
  calculate(expression) {
    try {
      // 预处理：替换显示用的运算符
      let expr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

      // 处理隐式乘法：2π → 2*π, 2( → 2*(
      expr = expr.replace(/(\d)([πe])/g, '$1*$2');
      expr = expr.replace(/(\d)\(/g, '$1*(');
      expr = expr.replace(/\)(\d)/g, ')*$1');
      expr = expr.replace(/([πe])(\d)/g, '$1*$2');
      expr = expr.replace(/\)\(/g, ')*(');

      // 处理百分号
      expr = expr.replace(/%/g, '/100');

      const tokens = this.tokenize(expr);
      const rpn = this.toRPN(tokens);
      const result = this.evaluateRPN(rpn);

      // 检查结果有效性
      if (!isFinite(result)) {
        return { error: true, message: '错误' };
      }

      return { error: false, value: result };
    } catch (e) {
      return { error: true, message: e.message || '错误' };
    }
  }

  /**
   * 格式化计算器显示字符串
   */
  formatDisplay(expr) {
    return expr
      .replace(/\*/g, '×')
      .replace(/\//g, '÷');
  }
}

module.exports = CalculatorEngine;
