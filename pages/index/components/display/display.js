/**
 * display 组件 — 计算器显示屏
 *
 * Props:
 *   exprDisplay   — 第1行：当前表达式文字
 *   previewText   — 第2行：实时预览（如 "= 2"）
 *   resultDisplay — 第2行：= 后的结果（如 "2"）
 *   historyText   — 历史区文字（C 键推入）
 *   showResult    — 是否处于结果放大模式
 *   error         — 错误状态
 */
Component({
  properties: {
    exprDisplay:   { type: String, value: '' },
    previewText:   { type: String, value: '' },
    resultDisplay: { type: String, value: '' },
    historyText:   { type: String, value: '' },
    showResult:    { type: Boolean, value: false },
    error:         { type: Boolean, value: false }
  },

  data: {
    cursorVisible: true,
    scrollLeft: 0
  },

  lifetimes: {
    attached() {
      this._cursorTimer = setInterval(() => {
        this.setData({ cursorVisible: !this.data.cursorVisible });
      }, 530);
    },
    detached() {
      if (this._cursorTimer) clearInterval(this._cursorTimer);
    }
  },

  observers: {
    'exprDisplay'(val) {
      if (val && val.length > 12) {
        this.setData({ scrollLeft: 9999 });
      }
    }
  }
});
