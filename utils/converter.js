/**
 * 单位换算引擎
 */

const unitsData = require('../data/units');

const converter = {
  /**
   * 获取所有换算类别
   */
  getCategories() {
    return Object.keys(unitsData).map(key => ({
      key,
      name: unitsData[key].name
    }));
  },

  /**
   * 获取指定类别的所有单位
   */
  getUnits(categoryKey) {
    const category = unitsData[categoryKey];
    if (!category) return [];
    return category.units.map(u => ({ key: u.key, name: u.name }));
  },

  /**
   * 执行单位换算
   */
  convert(categoryKey, value, fromUnit, toUnit) {
    const category = unitsData[categoryKey];
    if (!category) return null;

    // 温度需要特殊处理
    if (category.special && categoryKey === 'temperature') {
      return this.convertTemperature(value, fromUnit, toUnit);
    }

    const from = category.units.find(u => u.key === fromUnit);
    const to = category.units.find(u => u.key === toUnit);

    if (!from || !to) return null;

    // 先转换到基准单位，再从基准单位转到目标单位
    const baseValue = value * from.toBase;
    const result = baseValue / to.toBase;

    return result;
  },

  /**
   * 温度特殊换算
   */
  convertTemperature(value, from, to) {
    // 先统一转换到摄氏度
    let celsius;
    switch (from) {
      case 'celsius':
        celsius = value;
        break;
      case 'fahrenheit':
        celsius = (value - 32) * 5 / 9;
        break;
      case 'kelvin':
        celsius = value - 273.15;
        break;
      default:
        return null;
    }

    // 从摄氏度转到目标单位
    switch (to) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return celsius * 9 / 5 + 32;
      case 'kelvin':
        return celsius + 273.15;
      default:
        return null;
    }
  },

  /**
   * 格式化换算结果
   */
  formatResult(value) {
    if (value === null || value === undefined || isNaN(value)) return '—';

    const absVal = Math.abs(value);

    // 非常小的值用科学计数法
    if (absVal > 0 && absVal < 1e-10) {
      return value.toExponential(6);
    }

    // 非常大的值
    if (absVal >= 1e15) {
      return value.toExponential(6);
    }

    // 普通格式化
    if (Number.isInteger(value) || absVal >= 1) {
      // 最多保留 6 位小数
      const str = parseFloat(value.toPrecision(12)).toString();
      if (str.includes('.')) {
        const [intPart, decPart] = str.split('.');
        if (decPart.length > 6) {
          return parseFloat(value.toFixed(6)).toString();
        }
      }
      return str;
    }

    return parseFloat(value.toPrecision(10)).toString();
  }
};

module.exports = converter;
