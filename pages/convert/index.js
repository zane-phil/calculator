/**
 * 换算入口列表页
 */
Page({
  data: {
    tools: [
      {
        key: 'currency',
        name: '汇率换算',
        desc: '20+币种实时汇率双向换算',
        icon: '💱',
        url: '/pages/convert/currency/index'
      },
      {
        key: 'unit',
        name: '单位换算',
        desc: '长度/面积/体积/重量/温度等10大类别',
        icon: '📐',
        url: '/pages/convert/unit/index'
      },
      {
        key: 'tax',
        name: '个税计算',
        desc: '7级累进税率 · 五险一金 · 专项扣除',
        icon: '🧾',
        url: '/pages/convert/tax/index'
      },
      {
        key: 'mortgage',
        name: '房贷计算',
        desc: '商业/公积金/组合贷款 · 等额本息/本金',
        icon: '🏠',
        url: '/pages/convert/mortgage/index'
      },
      {
        key: 'history',
        name: '历史记录',
        desc: '查看和复制过往计算记录',
        icon: '🕐',
        url: '/pages/convert/history/index'
      },
      {
        key: 'settings',
        name: '设置',
        desc: '音效/振动/千分位/小数位偏好',
        icon: '⚙️',
        url: '/pages/convert/settings/index'
      }
    ]
  },

  onToolTap(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  }
});
