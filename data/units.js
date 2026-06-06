/**
 * 单位换算定义
 * 每个类别包含单位列表和换算因子（相对于基准单位）
 */
module.exports = {
  length: {
    name: '长度',
    base: 'm',
    units: [
      { key: 'km', name: '千米', toBase: 1000 },
      { key: 'm', name: '米', toBase: 1 },
      { key: 'dm', name: '分米', toBase: 0.1 },
      { key: 'cm', name: '厘米', toBase: 0.01 },
      { key: 'mm', name: '毫米', toBase: 0.001 },
      { key: 'mi', name: '英里', toBase: 1609.344 },
      { key: 'yd', name: '码', toBase: 0.9144 },
      { key: 'ft', name: '英尺', toBase: 0.3048 },
      { key: 'in', name: '英寸', toBase: 0.0254 },
      { key: 'nmi', name: '海里', toBase: 1852 }
    ]
  },
  area: {
    name: '面积',
    base: 'm2',
    units: [
      { key: 'km2', name: '平方千米', toBase: 1000000 },
      { key: 'ha', name: '公顷', toBase: 10000 },
      { key: 'are', name: '公亩', toBase: 100 },
      { key: 'm2', name: '平方米', toBase: 1 },
      { key: 'cm2', name: '平方厘米', toBase: 0.0001 },
      { key: 'mu', name: '亩', toBase: 666.667 },
      { key: 'acre', name: '英亩', toBase: 4046.856 },
      { key: 'ft2', name: '平方英尺', toBase: 0.092903 },
      { key: 'in2', name: '平方英寸', toBase: 0.00064516 }
    ]
  },
  volume: {
    name: '体积',
    base: 'l',
    units: [
      { key: 'm3', name: '立方米', toBase: 1000 },
      { key: 'l', name: '升', toBase: 1 },
      { key: 'ml', name: '毫升', toBase: 0.001 },
      { key: 'gal_us', name: '加仑(美)', toBase: 3.78541 },
      { key: 'gal_uk', name: '加仑(英)', toBase: 4.54609 },
      { key: 'qt', name: '夸脱', toBase: 0.946353 },
      { key: 'pt', name: '品脱', toBase: 0.473176 },
      { key: 'ft3', name: '立方英尺', toBase: 28.3168 }
    ]
  },
  weight: {
    name: '重量',
    base: 'kg',
    units: [
      { key: 't', name: '吨', toBase: 1000 },
      { key: 'kg', name: '千克', toBase: 1 },
      { key: 'g', name: '克', toBase: 0.001 },
      { key: 'mg', name: '毫克', toBase: 0.000001 },
      { key: 'lb', name: '磅', toBase: 0.453592 },
      { key: 'oz', name: '盎司', toBase: 0.0283495 },
      { key: 'jin', name: '斤', toBase: 0.5 },
      { key: 'liang', name: '两', toBase: 0.05 }
    ]
  },
  temperature: {
    name: '温度',
    base: 'celsius',
    units: [
      { key: 'celsius', name: '摄氏度 ℃', toBase: 'celsius' },
      { key: 'fahrenheit', name: '华氏度 ℉', toBase: 'fahrenheit' },
      { key: 'kelvin', name: '开尔文 K', toBase: 'kelvin' }
    ],
    // 温度需要特殊转换函数
    special: true
  },
  speed: {
    name: '速度',
    base: 'ms',
    units: [
      { key: 'kmh', name: '千米/时', toBase: 0.277778 },
      { key: 'ms', name: '米/秒', toBase: 1 },
      { key: 'mph', name: '英里/时', toBase: 0.44704 },
      { key: 'knot', name: '节', toBase: 0.514444 },
      { key: 'mach', name: '马赫', toBase: 340.3 }
    ]
  },
  time: {
    name: '时间',
    base: 's',
    units: [
      { key: 'year', name: '年', toBase: 31536000 },
      { key: 'month', name: '月', toBase: 2629800 },
      { key: 'week', name: '周', toBase: 604800 },
      { key: 'day', name: '日', toBase: 86400 },
      { key: 'hour', name: '时', toBase: 3600 },
      { key: 'minute', name: '分', toBase: 60 },
      { key: 'second', name: '秒', toBase: 1 },
      { key: 'ms', name: '毫秒', toBase: 0.001 }
    ]
  },
  pressure: {
    name: '压力',
    base: 'pa',
    units: [
      { key: 'pa', name: '帕斯卡', toBase: 1 },
      { key: 'kpa', name: '千帕', toBase: 1000 },
      { key: 'mpa', name: '兆帕', toBase: 1000000 },
      { key: 'bar', name: '巴', toBase: 100000 },
      { key: 'psi', name: '磅力/平方英寸', toBase: 6894.76 },
      { key: 'atm', name: '标准大气压', toBase: 101325 },
      { key: 'mmhg', name: '毫米汞柱', toBase: 133.322 }
    ]
  },
  data: {
    name: '数据存储',
    base: 'b',
    units: [
      { key: 'tb', name: 'TB', toBase: 1099511627776 },
      { key: 'gb', name: 'GB', toBase: 1073741824 },
      { key: 'mb', name: 'MB', toBase: 1048576 },
      { key: 'kb', name: 'KB', toBase: 1024 },
      { key: 'b', name: 'B', toBase: 1 },
      { key: 'bit', name: 'bit', toBase: 0.125 }
    ]
  },
  power: {
    name: '功率',
    base: 'w',
    units: [
      { key: 'kw', name: '千瓦', toBase: 1000 },
      { key: 'w', name: '瓦', toBase: 1 },
      { key: 'hp', name: '马力(公制)', toBase: 735.499 },
      { key: 'bhp', name: '英制马力', toBase: 745.7 }
    ]
  }
};
