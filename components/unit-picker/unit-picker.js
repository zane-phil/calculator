/**
 * unit-picker 组件 - 单位/币种底部选择器
 *
 * Props:
 *   visible: 是否显示
 *   title: 选择器标题
 *   options: 选项数组 [{ key, name, symbol?, flag? }]
 *   selected: 当前选中的 key
 *
 * Events:
 *   select: 选中某项时触发，detail = { key, item }
 *   close: 关闭选择器
 */

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '请选择'
    },
    options: {
      type: Array,
      value: []
    },
    selected: {
      type: String,
      value: ''
    }
  },

  methods: {
    onSelect(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.data.options[index];
      this.triggerEvent('select', { key: item.key, item });
      this.onClose();
    },

    onClose() {
      this.triggerEvent('close');
    },

    // 阻止事件冒泡
    onMaskTap() {
      this.onClose();
    },

    noop() {}
  }
});
