/**
 * 数字格式化工具
 * 处理千分位分隔、科学计数法、小数位数等
 */

const formatter = {
  /**
   * 千分位格式化：1234567.89 → "1,234,567.89"
   */
  formatThousands(value, decimalPlaces) {
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const [intPart, decPart] = absNum.toString().split('.');

    // 整数部分每 3 位加逗号
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let result = isNegative ? '-' : '';
    result += formattedInt;

    if (decPart !== undefined && decimalPlaces > 0) {
      result += '.' + decPart.slice(0, decimalPlaces);
    }

    return result;
  },

  /**
   * 格式化结果显示
   */
  formatResult(value, options = {}) {
    const {
      thousandsSep = true,
      decimalPlaces = 10,
      useScientific = true
    } = options;

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // 超大或超小数使用科学计数法
    if (useScientific) {
      const absNum = Math.abs(num);
      if ((absNum >= 1e15 || (absNum < 1e-10 && absNum > 0)) && absNum !== 0) {
        return num.toExponential(decimalPlaces);
      }
    }

    // 处理小数精度
    let formatted;
    if (Number.isInteger(num)) {
      formatted = num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } else {
      // 去除浮点尾数
      const fixed = parseFloat(num.toPrecision(15));
      // 限制小数位数
      const str = fixed.toString();
      if (str.includes('.')) {
        const [intPart, decPart] = str.split('.');
        formatted = intPart + '.' + decPart.slice(0, decimalPlaces);
      } else {
        formatted = str;
      }
    }

    // 千分位分隔
    if (thousandsSep) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }

    return formatted;
  },

  /**
   * 格式化表达式（用于显示）
   */
  formatExpression(expr) {
    // 将运算符替换为显示友好的符号
    return expr
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/-/g, '−');
  },

  /**
   * 去除末尾多余的零
   */
  trimTrailingZeros(str) {
    if (!str.includes('.')) return str;
    return str.replace(/\.?0+$/, '');
  }
};

module.exports = formatter;
