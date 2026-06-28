/**
 * 进制转换：2/8/10/16 进制互转
 */
const HEX_DIGITS = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];

Page({
  data: {
    sourceBase: 16,
    input: '',
    results: []
  },

  onBaseTap(e) {
    const base = parseInt(e.currentTarget.dataset.base);
    this.setData({ sourceBase: base, input: '' });
  },

  onDigitTap(e) {
    const d = e.currentTarget.dataset.digit;
    let input = this.data.input;
    if (input.length >= 20) return;
    input += d;
    this.setData({ input });
    this.convert();
  },

  onBackspace() {
    this.setData({ input: this.data.input.slice(0, -1) });
    this.convert();
  },

  onClear() {
    this.setData({ input: '' });
  },

  convert() {
    const { input, sourceBase } = this.data;
    if (!input) { this.setData({ results: [] }); return; }

    try {
      const dec = parseInt(input, sourceBase);
      if (isNaN(dec)) { this.setData({ results: [] }); return; }

      const targets = [
        { base: 2,  label: '二进制 (BIN)' },
        { base: 8,  label: '八进制 (OCT)' },
        { base: 10, label: '十进制 (DEC)' },
        { base: 16, label: '十六进制 (HEX)' },
      ];

      const results = targets.map(t => ({
        ...t,
        value: t.base === 10 ? dec.toString() : dec.toString(t.base).toUpperCase(),
        active: t.base === sourceBase
      }));

      this.setData({ results });
    } catch (e) {
      this.setData({ results: [] });
    }
  },

  onShareAppMessage() {
    return {
      title: '多功能计算器 - 汇率/单位/个税/房贷/BMI',
      path: '/pages/index/index'
    };
  }
});
