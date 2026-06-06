/**
 * result-card 组件 - 可展开的计算结果卡片
 *
 * Props:
 *   title: 卡片标题
 *   rows: 结果行数组 [{ label, value, highlight? }]
 *   visible: 是否显示
 */

Component({
  properties: {
    title: {
      type: String,
      value: '计算结果'
    },
    rows: {
      type: Array,
      value: []
    },
    visible: {
      type: Boolean,
      value: false
    }
  }
});
