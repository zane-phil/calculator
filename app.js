const storage = require('./utils/storage');

App({
  onLaunch() {
    // 加载用户设置
    const settings = storage.getSettings();
    this.globalData.soundEnabled = settings.soundEnabled !== false;
    this.globalData.vibrateEnabled = settings.vibrateEnabled !== false;
    this.globalData.decimalPlaces = settings.decimalPlaces || 10;
    this.globalData.thousandsSep = settings.thousandsSep !== false;
    this.globalData.theme = settings.theme || 'light';

    // 加载缓存的汇率数据
    const cachedRates = storage.getCurrencyRates();
    if (cachedRates) {
      this.globalData.currencyRates = cachedRates.rates;
      this.globalData.lastRateUpdate = cachedRates.date;
    }

    // 检查汇率是否需要更新（超过24小时）
    this.checkAndUpdateRates();
  },

  checkAndUpdateRates() {
    const lastUpdate = storage.getCurrencyUpdateDate();
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastUpdate || (now - lastUpdate > oneDay)) {
      this.fetchCurrencyRates();
    }
  },

  fetchCurrencyRates() {
    const urls = [
      'https://open.er-api.com/v6/latest/CNY',
      'https://api.exchangerate-api.com/v4/latest/CNY'
    ];

    const tryFetch = (index) => {
      if (index >= urls.length) return;

      wx.request({
        url: urls[index],
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.rates) {
            const rates = {
              base: res.data.base || 'CNY',
              date: res.data.time_last_update_utc || new Date().toISOString().split('T')[0],
              rates: res.data.rates
            };
            this.globalData.currencyRates = rates.rates;
            this.globalData.lastRateUpdate = rates.date;
            storage.saveCurrencyRates(rates);
          }
        },
        fail: () => {
          tryFetch(index + 1);
        }
      });
    };

    tryFetch(0);
  },

  globalData: {
    theme: 'light',
    soundEnabled: true,
    vibrateEnabled: true,
    decimalPlaces: 10,
    thousandsSep: true,
    currencyRates: null,
    lastRateUpdate: null
  }
});
