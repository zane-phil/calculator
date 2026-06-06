/**
 * display 组件 - 计算器显示区域
 *
 * Props:
 *   expression: 当前输入的表达式字符串
 *   result: 计算结果（空字符串表示没有结果）
 *   error: 是否处于错误状态
 */

Component({
  properties: {
    expression: {
      type: String,
      value: ''
    },
    result: {
      type: String,
      value: ''
    },
    error: {
      type: Boolean,
      value: false
    }
  },

  data: {
    scrollLeft: 0
  },

  observers: {
    'expression'(val) {
      // 表达式过长时自动滚动到最右侧
      if (val && val.length > 12) {
        this.setData({ scrollLeft: 9999 });
      }
    }
  }
});
