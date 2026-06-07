/**
 * top-nav 组件 - 顶部导航栏
 *
 * Props:
 *   mode:  'tabs' (计算|换算) | 'back' (返回+标题)
 *   active: 'calc' | 'convert'  (仅 mode='tabs')
 *   title:  标题文字  (仅 mode='back')
 */
Component({
  properties: {
    mode: {
      type: String,
      value: 'tabs'
    },
    active: {
      type: String,
      value: 'calc'
    },
    title: {
      type: String,
      value: ''
    }
  },

  data: {
    statusBarHeight: 0
  },

  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sysInfo.statusBarHeight });
    }
  },

  methods: {
    onTapCalc() {
      if (this.data.active === 'calc') return;
      wx.redirectTo({ url: '/pages/calculator/index' });
    },

    onTapConvert() {
      if (this.data.active === 'convert') return;
      wx.redirectTo({ url: '/pages/convert/index' });
    },

    onBack() {
      wx.navigateBack({ delta: 1 });
    }
  }
});
