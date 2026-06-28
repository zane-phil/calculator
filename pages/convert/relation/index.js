/**
 * 亲戚称呼计算器
 * 通过选择关系链（如：我 → 父 → 兄）计算出正确的亲戚称呼
 */
const relationMap = {
  父: { 父: '爷爷', 母: '奶奶', 兄: '伯伯', 弟: '叔叔', 姐: '姑姑', 妹: '姑姑', 子: '自己/兄弟', 女: '自己/姐妹' },
  母: { 父: '外公', 母: '外婆', 兄: '舅舅', 弟: '舅舅', 姐: '姨妈', 妹: '姨妈', 子: '自己/兄弟', 女: '自己/姐妹' },
  夫: { 父: '公公', 母: '婆婆', 兄: '大伯子', 弟: '小叔子', 姐: '大姑子', 妹: '小姑子' },
  妻: { 父: '岳父', 母: '岳母', 兄: '大舅子', 弟: '小舅子', 姐: '大姨子', 妹: '小姨子' },
  兄: { 父: '父亲', 母: '母亲', 子: '侄子', 女: '侄女', 妻: '嫂子', 弟: '弟弟' },
  弟: { 父: '父亲', 母: '母亲', 子: '侄子', 女: '侄女', 妻: '弟妹', 兄: '哥哥' },
  姐: { 父: '父亲', 母: '母亲', 子: '外甥', 女: '外甥女', 夫: '姐夫', 妹: '妹妹' },
  妹: { 父: '父亲', 母: '母亲', 子: '外甥', 女: '外甥女', 夫: '妹夫', 姐: '姐姐' },
  子: { 子: '孙子', 女: '孙女', 妻: '儿媳妇', 兄: '大儿子', 弟: '小儿子', 姐: '大女儿', 妹: '小女儿' },
  女: { 子: '外孙', 女: '外孙女', 夫: '女婿' },
  // 隔代长辈的兄弟姐妹（用于多层链如 父→父→兄）
  爷爷: { 父: '曾祖父', 母: '曾祖母', 兄: '伯祖父', 弟: '叔祖父', 姐: '祖姑母', 妹: '祖姑母', 子: '爸爸/伯伯/叔叔', 女: '姑姑' },
  奶奶: { 父: '曾外祖父', 母: '曾外祖母', 兄: '舅祖父', 弟: '舅祖父', 姐: '姨祖母', 妹: '姨祖母', 子: '爸爸/伯伯/叔叔', 女: '姑姑' },
  外公: { 父: '曾外祖父', 母: '曾外祖母', 兄: '伯外祖父', 弟: '叔外祖父', 姐: '姑外祖母', 妹: '姑外祖母', 子: '舅舅', 女: '妈妈/姨妈' },
  外婆: { 父: '曾外祖父', 母: '曾外祖母', 兄: '舅外祖父', 弟: '舅外祖父', 姐: '姨外祖母', 妹: '姨外祖母', 子: '舅舅', 女: '妈妈/姨妈' },
  // 曾祖辈
  伯祖父: { 子: '堂伯/堂叔', 女: '堂姑' },
  叔祖父: { 子: '堂伯/堂叔', 女: '堂姑' },
  祖姑母: { 子: '表伯/表叔', 女: '表姑' },
  伯外祖父: { 子: '表舅', 女: '表姨' },
};

Page({
  data: {
    expression: '',
    pathArray: [],
    result: '',
    showResult: false
  },

  onKeyTap(e) {
    const { type, val } = e.currentTarget.dataset;
    switch (type) {
      case 'relation': this.addRelation(val); break;
      case 'clear':    this.doClear(); break;
      case 'backspace':this.doBackspace(); break;
      case 'equal':    this.doEqual(); break;
      case 'each':     this.doEach(); break;
    }
  },

  addRelation(val) {
    const pathArray = [...this.data.pathArray, val];
    const expression = '我的' + pathArray.join('的');
    const result = this.calc(pathArray);
    this.setData({ expression, pathArray, result, showResult: true });
  },

  calc(path) {
    if (path.length === 0) return '自己';
    // 如果第一步选了自己，用第二步的性别角色重新开始
    let current = path[0];
    for (let i = 1; i < path.length; i++) {
      const next = path[i];
      const map = relationMap[current];
      if (map && map[next]) {
        current = map[next];
      } else {
        return '关系太远了，算不出来';
      }
    }
    return path.length === 1 ? current : current;
  },

  doClear() {
    this.setData({ expression: '', pathArray: [], result: '', showResult: false });
  },

  doBackspace() {
    const pathArray = [...this.data.pathArray];
    if (pathArray.length === 0) return;
    pathArray.pop();
    this.setData({
      pathArray,
      expression: pathArray.length ? '我的' + pathArray.join('的') : '',
      result: this.calc(pathArray),
      showResult: pathArray.length > 0
    });
  },

  doEqual() {
    if (!this.data.result) return;
    wx.showToast({ title: this.data.result, icon: 'none', duration: 2000 });
  },

  doEach() {
    const { result } = this.data;
    if (!result || result === '自己') return;
    const rev = { '爸爸':'儿子/女儿','妈妈':'儿子/女儿','爷爷':'孙子/孙女','奶奶':'孙子/孙女','外公':'外孙/外孙女','外婆':'外孙/外孙女','公公':'儿媳','婆婆':'儿媳','岳父':'女婿','岳母':'女婿','老公':'老婆','老婆':'老公','哥哥':'弟弟/妹妹','弟弟':'哥哥/姐姐','姐姐':'弟弟/妹妹','妹妹':'哥哥/姐姐','伯伯':'侄子/侄女','叔叔':'侄子/侄女','舅舅':'外甥/外甥女','姨妈':'外甥/外甥女','姑姑':'侄子/侄女' };
    const r = rev[result];
    if (r) wx.showModal({ title:'互查结果', content:'对方称呼您为：'+r, showCancel:false, confirmColor:'#FF6900' });
    else wx.showToast({ title:'暂未录入反向关系', icon:'none' });
  },

  onShareAppMessage() {
    return {
      title: '多功能计算器 - 汇率/单位/个税/房贷/BMI',
      path: '/pages/index/index'
    };
  }
});

