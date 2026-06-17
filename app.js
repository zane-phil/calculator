const storage = require("./utils/storage");

App({
  globalData: {
    theme: "light", // 主题模式：'light' | 'dark' | 'system'
    soundEnabled: true, // 按键音效开关
    vibrateEnabled: true, // 振动反馈开关
    decimalPlaces: 10, // 结果最大显示小数位数
    thousandsSep: true, // 千分位分隔符开关
    currencyRates: null, // 缓存的最新汇率数据 { CNY: 1, USD: 0.1385, ... }
    lastRateUpdate: null, // 汇率数据最后更新时间戳
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

    // 延迟检查汇率，避免阻塞冷启动
    setTimeout(() => {
      this.checkAndUpdateRates();
    }, 2000);
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
      // 1. 如果所有备用接口都失败了，触发最终的兜底逻辑
      if (index >= urls.length) {
        console.error(
          "【汇率更新失败】所有接口均已超时或报错，请检查网络或更换API",
        );
        // TODO: 这里可以考虑读取本地 Storage 中的旧汇率数据，保证应用不会白屏
        return;
      }

      console.log(`正在尝试获取汇率，API节点 ${index + 1}: ${urls[index]}`);

      wx.request({
        url: urls[index],
        timeout: 10000, // 💡 优化 1：将海外免费接口的超时时间放宽到 10000ms (10秒)
        success: (res) => {
          // 💡 优化 2：不仅要成功，还要确保 HTTP 状态码是 200
          if (res.statusCode === 200 && res.data && res.data.rates) {
            console.log("✅ 汇率数据获取成功！");
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
          } else {
            // 💡 优化 3：接口虽然通了，但可能返回了 429(限流) 或 500(服务错误)
            console.warn(
              `⚠️ 接口通畅但状态码异常 (${res.statusCode})，尝试切换下一个API`,
            );
            tryFetch(index + 1);
          }
        },
        fail: (err) => {
          // 💡 优化 4：把错误日志打出来，这样你就知道具体是哪个 URL timeout 了
          console.error(`❌ 请求失败 (节点 ${index + 1}):`, err);
          tryFetch(index + 1); // 继续尝试下一个
        },
      });
    };

    tryFetch(0);
  },
});
