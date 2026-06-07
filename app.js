const storage = require("./utils/storage");

App({
  globalData: {
    theme: "light",              // 主题模式：'light' | 'dark' | 'system'
    soundEnabled: true,          // 按键音效开关
    vibrateEnabled: true,        // 振动反馈开关
    decimalPlaces: 10,           // 结果最大显示小数位数
    thousandsSep: true,          // 千分位分隔符开关
    currencyRates: null,         // 缓存的最新汇率数据 { CNY: 1, USD: 0.1385, ... }
    lastRateUpdate: null,        // 汇率数据最后更新时间戳
  },
  onLaunch() {
    // 加载用户设置
    const settings = storage.getSettings();
    this.globalData.soundEnabled = settings.soundEnabled !== false;
    this.globalData.vibrateEnabled = settings.vibrateEnabled !== false;
    this.globalData.decimalPlaces = settings.decimalPlaces || 10;
    this.globalData.thousandsSep = settings.thousandsSep !== false;
    this.globalData.theme = settings.theme || "light";

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

    if (!lastUpdate || now - lastUpdate > oneDay) {
      this.fetchCurrencyRates();
    }
  },

  fetchCurrencyRates() {
    const urls = [
      "https://open.er-api.com/v6/latest/CNY",
      "https://api.exchangerate-api.com/v4/latest/CNY",
    ];

    const tryFetch = (index) => {
      if (index >= urls.length) return;

      wx.request({
        url: urls[index],
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.rates) {
            const rates = {
              base: res.data.base || "CNY",
              date:
                res.data.time_last_update_utc ||
                new Date().toISOString().split("T")[0],
              rates: res.data.rates,
            };
            this.globalData.currencyRates = rates.rates;
            this.globalData.lastRateUpdate = rates.date;
            storage.saveCurrencyRates(rates);
          }
        },
        fail: () => {
          tryFetch(index + 1);
        },
      });
    };

    tryFetch(0);
  },
});
