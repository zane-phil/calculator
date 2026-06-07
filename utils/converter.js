/**
 * 单位换算引擎
 */

const unitsData = require('../data/units');

const converter = {
  getCategories() {
    return Object.keys(unitsData).map(key => ({ key, name: unitsData[key].name }));
  },

  getUnits(categoryKey) {
    const category = unitsData[categoryKey];
    if (!category) return [];
    return category.units.map(u => ({ key: u.key, name: u.name }));
  },

  convert(categoryKey, value, fromUnit, toUnit) {
    const category = unitsData[categoryKey];
    if (!category) return null;

    // 温度特殊处理
    if (category.special && categoryKey === 'temperature') {
      return this.convertTemperature(value, fromUnit, toUnit);
    }

    const from = category.units.find(u => u.key === fromUnit);
    const to = category.units.find(u => u.key === toUnit);
    if (!from || !to) return null;

    const baseValue = value * from.toBase;
    return baseValue / to.toBase;
  },

  convertTemperature(value, from, to) {
    let celsius;
    switch (from) {
      case 'celsius':    celsius = value; break;
      case 'fahrenheit': celsius = (value - 32) * 5 / 9; break;
      case 'kelvin':     celsius = value - 273.15; break;
      default: return null;
    }
    switch (to) {
      case 'celsius':    return celsius;
      case 'fahrenheit': return celsius * 9 / 5 + 32;
      case 'kelvin':     return celsius + 273.15;
      default: return null;
    }
  },

  formatResult(value) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    const absVal = Math.abs(value);
    if (absVal > 0 && absVal < 1e-10) return value.toExponential(6);
    if (absVal >= 1e15) return value.toExponential(6);
    if (Number.isInteger(value) || absVal >= 1) {
      const str = parseFloat(value.toPrecision(12)).toString();
      if (str.includes('.')) {
        const [, dec] = str.split('.');
        if (dec.length > 6) return parseFloat(value.toFixed(6)).toString();
      }
      return str;
    }
    return parseFloat(value.toPrecision(10)).toString();
  }
};

module.exports = converter;
