/**
 * 数字格式化工具
 * 处理千分位分隔、科学计数法、小数位数等
 */

const formatter = {
  formatThousands(value, decimalPlaces) {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const [intPart, decPart] = absNum.toString().split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    let result = isNegative ? '-' : '';
    result += formattedInt;
    if (decPart !== undefined && decimalPlaces > 0) {
      result += '.' + decPart.slice(0, decimalPlaces);
    }
    return result;
  },

  formatResult(value, options = {}) {
    const { thousandsSep = true, decimalPlaces = 10, useScientific = true } = options;
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    const absNum = Math.abs(num);
    if (useScientific && absNum !== 0) {
      if (absNum >= 1e15 || absNum < 1e-10) {
        return num.toExponential(decimalPlaces);
      }
    }

    let formatted;
    if (Number.isInteger(num)) {
      formatted = num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } else {
      const fixed = parseFloat(num.toPrecision(15));
      const str = fixed.toString();
      if (str.includes('.')) {
        const [intPart, decPart] = str.split('.');
        formatted = intPart + '.' + decPart.slice(0, decimalPlaces);
      } else {
        formatted = str;
      }
    }

    if (thousandsSep) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }

    return formatted;
  },

  formatExpression(expr) {
    return expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
  },

  trimTrailingZeros(str) {
    if (!str.includes('.')) return str;
    return str.replace(/\.?0+$/, '');
  }
};

module.exports = formatter;
