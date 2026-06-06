/**
 * 本地存储管理模块
 */

const KEYS = {
  SETTINGS: 'calculator_settings',
  HISTORY: 'calculator_history',
  CURRENCY_RATES: 'currency_rates',
  CURRENCY_DATE: 'currency_update_date',
  LAST_CONVERTER_TAB: 'last_converter_tab'
};

const MAX_HISTORY = 500;

const storage = {
  /**
   * 获取用户设置
   */
  getSettings() {
    try {
      const data = wx.getStorageSync(KEYS.SETTINGS);
      return data || {};
    } catch (e) {
      return {};
    }
  },

  /**
   * 保存用户设置
   */
  saveSettings(settings) {
    try {
      const current = storage.getSettings();
      const merged = { ...current, ...settings };
      wx.setStorageSync(KEYS.SETTINGS, merged);
    } catch (e) {
      console.error('Save settings failed:', e);
    }
  },

  /**
   * 获取计算历史
   */
  getHistory() {
    try {
      const data = wx.getStorageSync(KEYS.HISTORY);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * 添加一条历史记录
   */
  addHistory(item) {
    try {
      const history = storage.getHistory();
      history.unshift({
        expression: item.expression,
        result: item.result,
        timestamp: item.timestamp || Date.now()
      });

      // 限制最大条数
      if (history.length > MAX_HISTORY) {
        history.splice(MAX_HISTORY);
      }

      wx.setStorageSync(KEYS.HISTORY, history);
      return true;
    } catch (e) {
      console.error('Add history failed:', e);
      return false;
    }
  },

  /**
   * 删除单条历史
   */
  removeHistory(index) {
    try {
      const history = storage.getHistory();
      history.splice(index, 1);
      wx.setStorageSync(KEYS.HISTORY, history);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * 清空所有历史
   */
  clearHistory() {
    try {
      wx.setStorageSync(KEYS.HISTORY, []);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * 获取缓存的汇率数据
   */
  getCurrencyRates() {
    try {
      const data = wx.getStorageSync(KEYS.CURRENCY_RATES);
      return data || null;
    } catch (e) {
      return null;
    }
  },

  /**
   * 保存汇率数据
   */
  saveCurrencyRates(data) {
    try {
      wx.setStorageSync(KEYS.CURRENCY_RATES, data);
      wx.setStorageSync(KEYS.CURRENCY_DATE, Date.now());
    } catch (e) {
      console.error('Save currency rates failed:', e);
    }
  },

  /**
   * 获取汇率更新日期
   */
  getCurrencyUpdateDate() {
    try {
      return wx.getStorageSync(KEYS.CURRENCY_DATE) || null;
    } catch (e) {
      return null;
    }
  }
};

module.exports = storage;
