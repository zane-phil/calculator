Page({
  data: {
    age: '',
    gender: 'male', // 默认选中男，同截图
    height: '',
    weight: ''
  },

  onAgeInput(e) {
    this.setData({ age: e.detail.value });
  },

  onHeightInput(e) {
    this.setData({ height: e.detail.value });
  },

  onWeightInput(e) {
    this.setData({ weight: e.detail.value });
  },

  setGender(e) {
    const { gender } = e.currentTarget.dataset;
    this.setData({ gender });
    if (wx.vibrateShort) wx.vibrateShort({ type: 'light' }); // 还原触觉反馈
  },

  calculateBMI() {
    const { height, weight } = this.data;

    if (!height || !weight) {
      wx.showToast({
        title: '请填写身高和体重',
        icon: 'none'
      });
      return;
    }

    const hMeter = parseFloat(height) / 100;
    const wKg = parseFloat(weight);

    if (hMeter <= 0 || wKg <= 0) {
      wx.showToast({
        title: '输入数据不合法',
        icon: 'none'
      });
      return;
    }

    // BMI 核心计算公式：体重(kg) / 身高^2(m)
    const bmi = (wKg / (hMeter * hMeter)).toFixed(1);

    // 计算完后，直接弹窗倒出结果（后续也可以自己做结果页承接）
    let status = '正常';
    if (bmi < 18.5) status = '偏瘦';
    else if (bmi >= 24 && bmi < 28) status = '偏胖';
    else if (bmi >= 28) status = '肥胖';

    wx.showModal({
      title: '计算结果',
      content: `您的BMI指数为: ${bmi}\n身体状态: ${status}`,
      showCancel: false,
      confirmColor: '#ff6700'
    });
  }
});