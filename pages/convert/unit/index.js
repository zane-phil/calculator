/**
 * 单位换算页面
 */

const converter = require('../../../utils/converter');

Page({
  data: {
    categories: [],
    activeCategory: 'length',
    units: [],
    sourceUnit: 'km',
    targetUnit: 'm',
    sourceValue: '1',
    targetValue: '1000',
    showPicker: false,
    pickerType: '',       // 'source' | 'target'
    pickerOptions: [],
    pickerSelected: '',
    commonRefs: []        // 常用换算参考
  },

  onLoad() {
    const categories = converter.getCategories();
    this.setData({ categories });

    this.loadCategory('length');
  },

  /**
   * 切换换算类别
   */
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    this.loadCategory(category);
  },

  /**
   * 加载换算类别数据
   */
  loadCategory(categoryKey) {
    const units = converter.getUnits(categoryKey);
    const sourceUnit = units.length > 0 ? units[0].key : '';
    const targetUnit = units.length > 1 ? units[1].key : '';
    const sourceUnitName = units.length > 0 ? units[0].name : '';
    const targetUnitName = units.length > 1 ? units[1].name : '';

    this.setData({
      activeCategory: categoryKey,
      units,
      sourceUnit,
      targetUnit,
      sourceUnitName,
      targetUnitName,
      sourceValue: '1',
      commonRefs: this.getCommonRefs(categoryKey)
    });

    this.convert();
  },

  /**
   * 获取常用换算参考
   */
  getCommonRefs(categoryKey) {
    const refs = {
      length: [
        '1 千米 = 1000 米',
        '1 千米 = 0.6214 英里',
        '1 米 = 3.2808 英尺'
      ],
      area: [
        '1 平方千米 = 100 公顷',
        '1 公顷 = 15 亩',
        '1 亩 ≈ 666.67 平方米'
      ],
      volume: [
        '1 立方米 = 1000 升',
        '1 升 = 1000 毫升',
        '1 加仑(美) ≈ 3.785 升'
      ],
      weight: [
        '1 吨 = 1000 千克',
        '1 千克 = 2 斤',
        '1 磅 ≈ 0.4536 千克'
      ],
      temperature: [
        '°F = ℃ × 9/5 + 32',
        'K = ℃ + 273.15',
        '℃ = (°F - 32) × 5/9'
      ],
      speed: [
        '1 千米/时 ≈ 0.2778 米/秒',
        '1 英里/时 ≈ 1.609 千米/时',
        '1 节 = 1.852 千米/时'
      ],
      time: [
        '1 年 = 365 天',
        '1 天 = 24 小时',
        '1 小时 = 60 分'
      ],
      pressure: [
        '1 巴 = 100 千帕',
        '1 标准大气压 = 101.325 千帕',
        '1 psi ≈ 6.895 千帕'
      ],
      data: [
        '1 TB = 1024 GB',
        '1 GB = 1024 MB',
        '1 MB = 1024 KB'
      ],
      power: [
        '1 千瓦 = 1000 瓦',
        '1 马力 ≈ 735.5 瓦',
        '1 英制马力 = 745.7 瓦'
      ]
    };
    return refs[categoryKey] || [];
  },

  /**
   * 数字输入
   */
  onDigitTap(e) {
    const digit = e.currentTarget.dataset.digit;
    let { sourceValue } = this.data;

    if (sourceValue === '0' || sourceValue === '1') {
      sourceValue = digit;
    } else {
      sourceValue = sourceValue + digit;
    }

    if (sourceValue.length > 15) return;

    this.setData({ sourceValue });
    this.convert();
  },

  onDecimalTap() {
    let { sourceValue } = this.data;
    if (sourceValue.includes('.')) return;
    sourceValue = sourceValue + '.';
    this.setData({ sourceValue });
    this.convert();
  },

  onBackspace() {
    let { sourceValue } = this.data;
    if (sourceValue.length <= 1) {
      sourceValue = '0';
    } else {
      sourceValue = sourceValue.slice(0, -1);
    }
    this.setData({ sourceValue });
    this.convert();
  },

  onClear() {
    this.setData({ sourceValue: '0' });
    this.convert();
  },

  /**
   * 打开单位选择器
   */
  onSourceUnitPicker() {
    this.setData({
      showPicker: true,
      pickerType: 'source',
      pickerOptions: this.data.units,
      pickerSelected: this.data.sourceUnit
    });
  },

  onTargetUnitPicker() {
    this.setData({
      showPicker: true,
      pickerType: 'target',
      pickerOptions: this.data.units,
      pickerSelected: this.data.targetUnit
    });
  },

  /**
   * 选中单位
   */
  onPickerSelect(e) {
    const { key, item } = e.detail;
    const type = this.data.pickerType;

    if (type === 'source') {
      this.setData({ sourceUnit: key, sourceUnitName: item.name });
    } else {
      this.setData({ targetUnit: key, targetUnitName: item.name });
    }
    this.convert();
  },

  onPickerClose() {
    this.setData({ showPicker: false });
  },

  /**
   * 交换单位
   */
  onSwap() {
    const { sourceUnit, targetUnit, sourceUnitName, targetUnitName, sourceValue, targetValue } = this.data;
    this.setData({
      sourceUnit: targetUnit,
      targetUnit: sourceUnit,
      sourceUnitName: targetUnitName,
      targetUnitName: sourceUnitName,
      sourceValue: targetValue
    });
    this.convert();
  },

  /**
   * 执行换算
   */
  convert() {
    const { activeCategory, sourceUnit, targetUnit, sourceValue } = this.data;
    const value = parseFloat(sourceValue);

    if (isNaN(value)) {
      this.setData({ targetValue: '0' });
      return;
    }

    const result = converter.convert(activeCategory, value, sourceUnit, targetUnit);
    const formatted = converter.formatResult(result);

    this.setData({ targetValue: formatted });
  }
});
