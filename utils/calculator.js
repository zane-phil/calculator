/**
 * 计算引擎 - 表达式解析与求值（RPN）
 */

class CalculatorEngine {
  constructor() {
    this.degMode = true;
  }

  setDegMode(mode) { this.degMode = mode; }

  static OPERATORS = {
    '+':  { prec: 1, assoc: 'L', fn: (a, b) => a + b },
    '-':  { prec: 1, assoc: 'L', fn: (a, b) => a - b },
    '−':  { prec: 1, assoc: 'L', fn: (a, b) => a - b },
    '×':  { prec: 2, assoc: 'L', fn: (a, b) => a * b },
    '*':  { prec: 2, assoc: 'L', fn: (a, b) => a * b },
    '÷':  { prec: 2, assoc: 'L', fn: (a, b) => a / b },
    '/':  { prec: 2, assoc: 'L', fn: (a, b) => a / b },
    '%':  { prec: 2, assoc: 'L', fn: (a, b) => a * (b / 100) },
    '^':  { prec: 3, assoc: 'R', fn: (a, b) => Math.pow(a, b) },
    '√':  { prec: 3, assoc: 'R', fn: (a, b) => Math.pow(b, 1 / a) },  // a√b = b^(1/a)
  };

  static FUNCTIONS = {
    'sin':       { fn: (a) => Math.sin(a) },
    'cos':       { fn: (a) => Math.cos(a) },
    'tan':       { fn: (a) => Math.tan(a) },
    'asin':      { fn: (a) => Math.asin(a) },
    'acos':      { fn: (a) => Math.acos(a) },
    'atan':      { fn: (a) => Math.atan(a) },
    'log':       { fn: (a) => Math.log10(a) },
    'lg':        { fn: (a) => Math.log10(a) },      // 同 log，常用对数
    'ln':        { fn: (a) => Math.log(a) },
    'sqrt':      { fn: (a) => Math.sqrt(a) },
    'cbrt':      { fn: (a) => Math.cbrt(a) },
    'exp':       { fn: (a) => Math.exp(a) },
    'abs':       { fn: (a) => Math.abs(a) },
    'recip':     { fn: (a) => 1 / a },              // 倒数 1/x
    'factorial': { fn: (a) => CalculatorEngine.factorial(a) },
    '_neg':      { fn: (a) => -a },
  };

  static CONSTANTS = { 'pi': Math.PI, 'π': Math.PI, 'e': Math.E };

  static factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity;
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  static getTokenType(token) {
    if (!isNaN(parseFloat(token)) && isFinite(token)) return 'number';
    if (CalculatorEngine.OPERATORS[token]) return 'operator';
    if (CalculatorEngine.FUNCTIONS[token]) return 'function';
    if (CalculatorEngine.CONSTANTS[token] !== undefined) return 'constant';
    if (token === '(') return 'leftParen';
    if (token === ')') return 'rightParen';
    return 'unknown';
  }

  tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const ch = expr[i];
      if (ch === ' ') { i++; continue; }
      // 数字
      if (/[0-9.]/.test(ch)) {
        let num = '';
        while (i < expr.length && /[0-9.eE]/.test(expr[i])) { num += expr[i]; i++; }
        // 科学计数法 e+ / e-
        if (i < expr.length && (num.endsWith('e') || num.endsWith('E')) && (expr[i] === '+' || expr[i] === '-')) {
          num += expr[i]; i++;
          while (i < expr.length && /[0-9]/.test(expr[i])) { num += expr[i]; i++; }
        }
        tokens.push(num);
        continue;
      }
      // 标识符（函数名、常量）
      if (/[a-zA-Zπ]/.test(ch)) {
        let name = ch; i++;
        while (i < expr.length && /[a-zA-Z²³ˣ⁻¹]/.test(expr[i])) { name += expr[i]; i++; }
        tokens.push(name);
        continue;
      }
      // 运算符 / 括号
      tokens.push(ch); i++;
    }
    return tokens;
  }

  toRPN(tokens) {
    const output = [], stack = [];
    let prevType = null;

    for (let idx = 0; idx < tokens.length; idx++) {
      let token = tokens[idx];
      let type = CalculatorEngine.getTokenType(token);

      // 一元负号（表达式开头 / 左括号后 / 运算符后）
      if ((token === '−' || token === '-') && (idx === 0 || prevType === 'operator' || prevType === 'leftParen')) {
        token = '_neg';
        type = 'function';
      }

      prevType = type;

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
          const tt = CalculatorEngine.getTokenType(top);
          if (tt === 'operator') {
            const op2 = CalculatorEngine.OPERATORS[top];
            if ((op1.assoc === 'L' && op1.prec <= op2.prec) ||
                (op1.assoc === 'R' && op1.prec < op2.prec)) {
              output.push(stack.pop()); continue;
            }
          } else if (tt === 'function') {
            output.push(stack.pop()); continue;
          }
          break;
        }
        stack.push(token);
      } else if (token === '(') {
        stack.push(token);
      } else if (token === ')') {
        while (stack.length > 0 && stack[stack.length - 1] !== '(') output.push(stack.pop());
        if (stack.length === 0) throw new Error('括号不匹配');
        stack.pop();
        if (stack.length > 0 && CalculatorEngine.getTokenType(stack[stack.length - 1]) === 'function') {
          output.push(stack.pop());
        }
      }
    }

    while (stack.length > 0) {
      const top = stack.pop();
      if (top === '(' || top === ')') throw new Error('括号不匹配');
      output.push(top);
    }
    return output;
  }

  evaluateRPN(rpn) {
    const stack = [];
    for (const item of rpn) {
      if (typeof item === 'number') {
        stack.push(item);
      } else if (CalculatorEngine.OPERATORS[item]) {
        if (stack.length < 2) throw new Error('表达式不完整');
        const b = stack.pop(), a = stack.pop();
        stack.push(CalculatorEngine.OPERATORS[item].fn(a, b));
      } else if (CalculatorEngine.FUNCTIONS[item]) {
        if (stack.length < 1) throw new Error('表达式不完整');
        let arg = stack.pop();
        // DEG/RAD 转换
        if (['sin', 'cos', 'tan'].includes(item) && this.degMode) arg = arg * Math.PI / 180;
        let result = CalculatorEngine.FUNCTIONS[item].fn(arg);
        if (['asin', 'acos', 'atan'].includes(item) && this.degMode) result = result * 180 / Math.PI;
        stack.push(result);
      }
    }
    if (stack.length !== 1) throw new Error('表达式不完整');
    return stack[0];
  }

  calculate(expression) {
    try {
      let expr = expression
        .replace(/sin⁻¹/g, 'asin')
        .replace(/cos⁻¹/g, 'acos')
        .replace(/tan⁻¹/g, 'atan')
        // 根号：√x→sqrt, ³√x→cbrt, y√x→√(二元算符)
        .replace(/³√x/g, 'cbrt')
        .replace(/³√/g, 'cbrt')
        .replace(/√x/g, 'sqrt')
        .replace(/√/g, 'sqrt')
        // 指数：eˣ→exp, 2ˣ→2^
        .replace(/10ˣ/g, '10^')
        .replace(/eˣ/g, 'exp')
        .replace(/2ˣ/g, '2^')
        // 幂：x²→^2, x³→^3, xʸ→^
        .replace(/x²/g, '^2')
        .replace(/x³/g, '^3')
        .replace(/xʸ/g, '^')
        // 倒数：1/x→recip(
        .replace(/1\/x/g, 'recip')
        // 阶乘：n! → factorial(n)
        .replace(/(\d+|\))\s*!/g, 'factorial($1)')
        .replace(/x!/g, 'factorial')
        // 常数
        .replace(/π/g, 'pi')
        // log 别名
        .replace(/\blg\b/g, 'log');

      // 隐式乘法
      expr = expr.replace(/(\d)(pi|e)/g, '$1*$2');
      expr = expr.replace(/(\d)\(/g, '$1*(');
      expr = expr.replace(/\)(\d)/g, ')*$1');
      expr = expr.replace(/(pi|e)(\d)/g, '$1*$2');
      expr = expr.replace(/\)\(/g, ')*(');
      expr = expr.replace(/(\d)([a-z])/g, '$1*$2');   // 2sin → 2*sin
      expr = expr.replace(/\)([a-z])/g, ')*$1');      // )sin → )*sin

      // 百分号
      expr = expr.replace(/%/g, '/100');

      const tokens = this.tokenize(expr);
      const rpn = this.toRPN(tokens);
      const result = this.evaluateRPN(rpn);

      if (!isFinite(result)) return { error: true, message: '错误' };
      return { error: false, value: result };
    } catch (e) {
      return { error: true, message: e.message || '错误' };
    }
  }

  formatDisplay(expr) {
    return expr.replace(/\*/g, '×').replace(/\//g, '÷');
  }
}

module.exports = CalculatorEngine;
