Page({
  data: {
    age: '',
    gender: 'male',
    height: '',
    weight: ''
  },

  onAgeInput(e) { this.setData({ age: e.detail.value }); },
  onHeightInput(e) { this.setData({ height: e.detail.value }); },
  onWeightInput(e) { this.setData({ weight: e.detail.value }); },

  setGender(e) {
    const { gender } = e.currentTarget.dataset;
    this.setData({ gender });
  },

  calculateBMI() {
    const { height, weight } = this.data;
    if (!height || !weight) {
      wx.showToast({ title: '请填写身高和体重', icon: 'none' });
      return;
    }
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h <= 0 || w <= 0) {
      wx.showToast({ title: '输入数据不合法', icon: 'none' });
      return;
    }
    const bmi = (w / (h * h)).toFixed(1);
    let status = '正常';
    if (bmi < 18.5) status = '偏瘦';
    else if (bmi >= 24 && bmi < 28) status = '偏胖';
    else if (bmi >= 28) status = '肥胖';
    wx.showModal({
      title: '计算结果',
      content: '您的BMI指数为: ' + bmi + '\n身体状态: ' + status,
      showCancel: false,
      confirmColor: '#FF6900'
    });
  },

  onShareAppMessage() {
    return {
      title: '多功能计算器 - 汇率/单位/个税/房贷/BMI',
      path: '/pages/index/index'
    };
  }
});
