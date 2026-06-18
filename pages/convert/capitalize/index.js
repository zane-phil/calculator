/**
 * 大写数字转换
 * 阿拉伯数字 → 中文财务大写（壹贰叁...元角分）
 */
const DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const UNITS  = ['', '拾', '佰', '仟'];
const BIGS   = ['', '万', '亿', '万亿'];

function intToChinese(num) {
  if (num === '0') return '零';
  let str = '';
  const len = num.length;
  let zeroFlag = false;
  for (let i = 0; i < len; i++) {
    const d = parseInt(num[i]);
    const pos = len - i - 1;
    const unitIdx = pos % 4;
    const bigIdx = Math.floor(pos / 4);
    if (d === 0) {
      zeroFlag = true;
      if (unitIdx === 0) str += BIGS[bigIdx];
    } else {
      if (zeroFlag) { str += '零'; zeroFlag = false; }
      str += DIGITS[d] + UNITS[unitIdx];
      if (unitIdx === 0) str += BIGS[bigIdx];
    }
  }
  return str.replace(/零+$/, '').replace(/壹拾/g, '拾');
}

Page({
  data: {
    input: '',
    result: '',
    hasDecimal: false,
    decimalPart: ''
  },

  onKeyTap(e) {
    const { type, val } = e.currentTarget.dataset;
    let { input, decimalPart, hasDecimal } = this.data;

    switch (type) {
      case 'digit':
        if (hasDecimal) {
          if (decimalPart.length >= 2) return;
          decimalPart += val;
        } else {
          if (input === '0') input = val;
          else input += val;
        }
        break;
      case 'dot':
        if (!hasDecimal) hasDecimal = true;
        break;
      case 'clear':
        input = ''; decimalPart = ''; hasDecimal = false;
        break;
      case 'backspace':
        if (hasDecimal && decimalPart) {
          decimalPart = decimalPart.slice(0, -1);
          if (!decimalPart) hasDecimal = false;
        } else if (hasDecimal && !decimalPart) {
          hasDecimal = false;
        } else {
          input = input.slice(0, -1) || '';
        }
        break;
    }

    this.setData({ input, decimalPart, hasDecimal });
    this.convert();
  },

  convert() {
    const { input, decimalPart } = this.data;
    if (!input && !decimalPart) { this.setData({ result: '' }); return; }

    let result = '';
    const intPart = input || '0';
    result += intToChinese(intPart) + '元';

    if (decimalPart) {
      const jiao = decimalPart[0] ? DIGITS[parseInt(decimalPart[0])] + '角' : '';
      const fen  = decimalPart[1] ? DIGITS[parseInt(decimalPart[1])] + '分' : '';
      result += jiao + fen;
    } else {
      result += '整';
    }

    this.setData({ result });
  }
});
