/**
 * 设置页面
 */

const storage = require('../../../utils/storage');
const app = getApp();

Page({
  data: {
    soundEnabled: true,
    vibrateEnabled: true,
    thousandsSep: true,
    decimalPlaces: 10,
    decimalIndex: 2  // 0->6, 1->8, 2->10
  },

  onLoad() {
    this.loadSettings();
  },

  onShow() {
    this.loadSettings();
  },

  /**
   * 加载设置
   */
  loadSettings() {
    const settings = storage.getSettings();
    const decimalPlaces = settings.decimalPlaces || 10;
    const decimalIndex = decimalPlaces === 6 ? 0 : (decimalPlaces === 8 ? 1 : 2);

    this.setData({
      soundEnabled: settings.soundEnabled !== false,
      vibrateEnabled: settings.vibrateEnabled !== false,
      thousandsSep: settings.thousandsSep !== false,
      decimalPlaces,
      decimalIndex
    });
  },

  /**
   * 音效开关
   */
  onSoundToggle(e) {
    const value = e.detail.value;
    this.setData({ soundEnabled: value });
    storage.saveSettings({ soundEnabled: value });
    app.globalData.soundEnabled = value;
  },

  /**
   * 振动开关
   */
  onVibrateToggle(e) {
    const value = e.detail.value;
    this.setData({ vibrateEnabled: value });
    storage.saveSettings({ vibrateEnabled: value });
    app.globalData.vibrateEnabled = value;
  },

  /**
   * 千分位分隔开关
   */
  onThousandsToggle(e) {
    const value = e.detail.value;
    this.setData({ thousandsSep: value });
    storage.saveSettings({ thousandsSep: value });
    app.globalData.thousandsSep = value;
  },

  /**
   * 小数位数设置
   */
  onDecimalChange(e) {
    const index = parseInt(e.detail.value);
    const values = [6, 8, 10];
    const decimalPlaces = values[index];

    this.setData({
      decimalIndex: index,
      decimalPlaces
    });
    storage.saveSettings({ decimalPlaces });
    app.globalData.decimalPlaces = decimalPlaces;
  },

  /**
   * 清除历史记录
   */
  onClearHistory() {
    wx.showModal({
      title: '清除历史记录',
      content: '确定要清除所有计算历史吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          storage.clearHistory();
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  },

  /**
   * 清除汇率缓存
   */
  onClearRatesCache() {
    wx.showModal({
      title: '清除汇率缓存',
      content: '将清除缓存的汇率数据，下次使用时重新获取',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('currency_rates');
            wx.removeStorageSync('currency_update_date');
            app.globalData.currencyRates = null;
            app.globalData.lastRateUpdate = null;
            wx.showToast({ title: '已清除', icon: 'success' });
          } catch (e) {
            wx.showToast({ title: '清除失败', icon: 'none' });
          }
        }
      }
    });
  },

  /**
   * 意见反馈
   */
  onFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '请通过小程序客服或评分页面进行反馈',
      showCancel: false
    });
  },

  /**
   * 隐私政策
   */
  onPrivacy() {
    wx.showToast({ title: '隐私政策页面开发中', icon: 'none' });
  },

  /**
   * 用户协议
   */
  onAgreement() {
    wx.showToast({ title: '用户协议页面开发中', icon: 'none' });
  },

onShareAppMessage() {
    return {
      title: "多功能计算器 - 汇率/单位/个税/房贷/BMI",
      path: "/pages/index/index"
    };
  },

});