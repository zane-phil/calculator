/**
 * numpad 组件 - 可复用的数字/运算符键盘
 *
 * 布局说明：
 *   - 基础模式 (basic)：5行 × 4列，用于普通计算器
 *     布局：C  ⌫  %  ÷
 *           7  8  9  ×
 *           4  5  6  −
 *           1  2  3  +
 *          +/−  0  .  =
 *
 *   - 科学模式 (scientific)：7行 × 6列，用于科学计算器
 *     增加三角函数、对数、幂运算等科学函数按键
 *
 * Props:
 *   layout:   'basic' | 'scientific'  键盘布局模式，默认 'basic'
 *   degMode:  true (角度 DEG) | false (弧度 RAD)  仅科学模式使用
 *   hasInput: 当前是否有输入内容，用于切换 C/AC 显示
 *
 * Events:
 *   digit:     数字键，detail = { value }
 *   operator:  运算符键 (+ − × ÷)，detail = { value }
 *   function:  科学函数键 (sin/cos/tan...)，detail = { value }
 *   clear:     清除键 (C/AC)
 *   backspace: 退格键 (⌫)
 *   equals:    等号键 (=)
 *   percent:   百分号键 (%)
 *   negate:    正负号切换键 (+/−)
 *   decimal:   小数点键 (.)
 *   paren:     括号键 ( / )，detail = { value }
 *   constant:  常数键 (π/e)，detail = { value }
 */

Component({
  // ==================== 组件属性 ====================
  properties: {
    /** 键盘布局模式: 'basic' 基础5×4 | 'scientific' 科学7×6 */
    layout: {
      type: String,
      value: 'basic'
    },
    /** 角度模式: true=角度(DEG) | false=弧度(RAD)，仅科学模式使用 */
    degMode: {
      type: Boolean,
      value: true
    },
    /** 是否有输入内容，影响清空键显示 C / AC */
    hasInput: {
      type: Boolean,
      value: false
    }
  },

  // ==================== 组件内部数据 ====================
  data: {
    basicKeys: [],          // 基础模式按键布局 (5行 × 4列)
    scientificKeys: [],     // 科学模式按键布局 (7行 × 5列)
    secondMode: false,      // 2nd 模式：true=显示第二功能, false=正常
    radMode: true           // 角度模式：true=RAD, false=DEG
  },

  // ==================== 生命周期 ====================
  lifetimes: {
    /** 组件挂载时初始化按键布局 */
    attached() {
      this.initKeys();
    }
  },

  // ==================== 属性监听 ====================
  observers: {
    /** 角度模式变化时刷新科学键盘 */
    'degMode'(val) {
      this.setData({ radMode: val });
      this.initScientificKeys();
    },
    /** 输入状态变化时更新清空键标签 (C ↔ AC) */
    'hasInput'(val) {
      this.updateClearLabel(val);
    }
  },

  // ==================== 方法 ====================
  methods: {
    /**
     * 更新清空键标签
     * 有输入内容 → C（清除本次输入）
     * 无输入内容 → AC（全部清除）
     *
     * @param {boolean} hasInput - 是否有输入
     */
    updateClearLabel(hasInput) {
      const label = hasInput ? 'C' : 'AC';

      // 更新基础键盘第一行第一个键
      const basicKeys = this.data.basicKeys;
      if (basicKeys.length > 0) {
        basicKeys[0][0].label = label;
        this.setData({ basicKeys });
      }

      // 更新科学键盘第3行第2个键 (AC)
      const scientificKeys = this.data.scientificKeys;
      if (scientificKeys.length > 2) {
        scientificKeys[2][1].label = label;
        this.setData({ scientificKeys });
      }
    },

    /**
     * 初始化所有按键布局
     */
    initKeys() {
      this.setData({ basicKeys: this.getBasicKeys() });
      this.initScientificKeys();
    },

    /**
     * 切换 2nd 模式（显示三角函数反函数等）
     */
    toggleSecondMode() {
      this.setData({ secondMode: !this.data.secondMode });
      this.initScientificKeys();
    },

    /**
     * 切换角度模式 RAD ↔ DEG
     */
    toggleRadMode() {
      const newMode = !this.data.radMode;
      this.setData({ radMode: newMode });
      this.triggerEvent('degChange', { degMode: !newMode });  // degMode: true=DEG, false=RAD
      this.initScientificKeys();
    },

    /**
     * 构建基础模式按键布局 (5行 × 4列)
     *
     * 每个按键对象字段：
     *   label: 显示文本（空字符串表示使用 SVG 图标）
     *   type:  按键类型，决定触发的事件
     *          - 'digit'    数字键 (0-9)
     *          - 'operator' 运算符键 (+ − × ÷)
     *          - 'clear'    清除键 (C/AC)
     *          - 'backspace' 退格键 (⌫)
     *          - 'percent'  百分号键 (%)
     *          - 'negate'   正负号切换键 (+/−)
     *          - 'decimal'  小数点键 (.)
     *          - 'equals'   等号键 (=)
     *          - 'function' 科学函数键 (sin/cos...)
     *          - 'paren'    括号键 ( / )
     *          - 'constant' 常数键 (π/e)
     *   class: CSS 类名，控制按键样式
     *          - 'key-num'      数字键样式（白底黑字）
     *          - 'key-func'     功能键样式（白底主题色字）
     *          - 'key-operator' 运算符键样式（白底主题色字）
     *          - 'key-equals'   等号键样式（主题色底白字）
     *
     * @returns {Array<Array<Object>>} 二维数组，每行是一个包含4个按键的数组
     */
    getBasicKeys() {
      return [
        // 第1行：功能键 + 运算符
        [
          { label: 'C', type: 'clear', class: 'key-func' },
          { label: '', type: 'backspace', class: 'key-func' },   // label为空 → WXML渲染SVG图标
          { label: '%', type: 'percent', class: 'key-func' },
          { label: '÷', type: 'operator', class: 'key-operator' }
        ],
        // 第2行：数字 + 运算符
        [
          { label: '7', type: 'digit', class: 'key-num' },
          { label: '8', type: 'digit', class: 'key-num' },
          { label: '9', type: 'digit', class: 'key-num' },
          { label: '×', type: 'operator', class: 'key-operator' }
        ],
        // 第3行
        [
          { label: '4', type: 'digit', class: 'key-num' },
          { label: '5', type: 'digit', class: 'key-num' },
          { label: '6', type: 'digit', class: 'key-num' },
          { label: '−', type: 'operator', class: 'key-operator' }  // Unicode减号 U+2212
        ],
        // 第4行
        [
          { label: '1', type: 'digit', class: 'key-num' },
          { label: '2', type: 'digit', class: 'key-num' },
          { label: '3', type: 'digit', class: 'key-num' },
          { label: '+', type: 'operator', class: 'key-operator' }
        ],
        // 第5行：布局切换 + 数字 + 小数点 + 等号
        [
          { label: '', type: 'toggleLayout', class: 'key-num' },  // 切换到科学计算器
          { label: '0', type: 'digit', class: 'key-num' },
          { label: '.', type: 'decimal', class: 'key-num' },
          { label: '=', type: 'equals', class: 'key-equals' }
        ]
      ];
    },

    /**
     * 构建科学模式按键布局 (7行 × 5列)
     *
     * 第1行：2nd   deg   sin   cos   tan
     * 第2行：xʸ    lg    ln    (     )
     * 第3行：√x    AC    ⌫     %     ÷
     * 第4行：x!    7     8     9     ×
     * 第5行：1/x   4     5     6     −
     * 第6行：π     1     2     3     +
     * 第7行：🔄    e     0     .     =
     *
     * 2nd 切换第二功能：
     *   sin→sin⁻¹  cos→cos⁻¹  tan→tan⁻¹
     *   lg→2ˣ      ln→eˣ       xʸ→y√x
     *   √x→³√x    1/x→不变     x!→不变
     */
    initScientificKeys() {
      const s = this.data.secondMode;
      const r = this.data.radMode;

      this.setData({
        scientificKeys: [
          // 第1行
          [
            { label: '2nd', type: 'second', class: 'key-func' + (s ? ' key-active' : '') },
            { label: r ? 'Rad' : 'Deg', type: 'radToggle', class: 'key-func' },
            { label: s ? 'sin⁻¹' : 'sin', type: 'function', class: 'key-func' },
            { label: s ? 'cos⁻¹' : 'cos', type: 'function', class: 'key-func' },
            { label: s ? 'tan⁻¹' : 'tan', type: 'function', class: 'key-func' }
          ],
          // 第2行
          [
            { label: s ? 'y√x' : 'xʸ', type: s ? 'function' : 'operator', class: 'key-func' },
            { label: s ? '2ˣ' : 'lg', type: 'function', class: 'key-func' },
            { label: s ? 'eˣ' : 'ln', type: 'function', class: 'key-func' },
            { label: '(', type: 'paren', class: 'key-func' },
            { label: ')', type: 'paren', class: 'key-func' }
          ],
          // 第3行：√x | AC | ⌫ | % | ÷
          [
            { label: s ? '³√x' : '√x', type: 'function', class: 'key-func' },
            { label: 'AC', type: 'clear', class: 'key-func' },
            { label: '', type: 'backspace', class: 'key-func' },
            { label: '%', type: 'percent', class: 'key-func' },
            { label: '÷', type: 'operator', class: 'key-operator' }
          ],
          // 第4行：x! | 7 | 8 | 9 | ×
          [
            { label: 'x!', type: 'function', class: 'key-func' },
            { label: '7', type: 'digit', class: 'key-num' },
            { label: '8', type: 'digit', class: 'key-num' },
            { label: '9', type: 'digit', class: 'key-num' },
            { label: '×', type: 'operator', class: 'key-operator' }
          ],
          // 第5行：1/x | 4 | 5 | 6 | −
          [
            { label: '1/x', type: 'function', class: 'key-func' },
            { label: '4', type: 'digit', class: 'key-num' },
            { label: '5', type: 'digit', class: 'key-num' },
            { label: '6', type: 'digit', class: 'key-num' },
            { label: '−', type: 'operator', class: 'key-operator' }
          ],
          // 第6行：π | 1 | 2 | 3 | +
          [
            { label: 'π', type: 'constant', class: 'key-func' },
            { label: '1', type: 'digit', class: 'key-num' },
            { label: '2', type: 'digit', class: 'key-num' },
            { label: '3', type: 'digit', class: 'key-num' },
            { label: '+', type: 'operator', class: 'key-operator' }
          ],
          // 第7行：🔄 | e | 0 | . | =
          [
            { label: '', type: 'toggleLayout', class: 'key-func' },
            { label: 'e', type: 'constant', class: 'key-func' },
            { label: '0', type: 'digit', class: 'key-num' },
            { label: '.', type: 'decimal', class: 'key-num' },
            { label: '=', type: 'equals', class: 'key-equals' }
          ]
        ]
      });
    },

    /**
     * 按键点击事件处理
     *
     * 根据按键的 type 字段分发对应的自定义事件给父组件。
     * 每次按键都会先触发触觉反馈（轻振动）。
     *
     * 事件映射：
     *   digit     → triggerEvent('digit', { value })
     *   operator  → triggerEvent('operator', { value })
     *   function  → triggerEvent('function', { value })
     *   clear     → triggerEvent('clear')
     *   backspace → triggerEvent('backspace')
     *   equals    → triggerEvent('equals')
     *   percent   → triggerEvent('percent')
     *   negate    → triggerEvent('negate')
     *   decimal   → triggerEvent('decimal')
     *   paren     → triggerEvent('paren', { value })
     *   constant  → triggerEvent('constant', { value })
     *
     * @param {Event} e - 触摸事件对象
     */
    onKeyTap(e) {
      // 从 data-* 属性获取按键信息
      const key = e.currentTarget.dataset.key;
      const type = e.currentTarget.dataset.type;

      // 先触发触觉反馈（轻振动），让用户有物理按键的触感
      this.triggerHaptic();

      // 根据按键类型分发事件
      switch (type) {
        // ---- 无参数事件 ----
        case 'clear':
          this.triggerEvent('clear');
          break;
        case 'backspace':
          this.triggerEvent('backspace');
          break;
        case 'equals':
          this.triggerEvent('equals');
          break;
        case 'percent':
          this.triggerEvent('percent');
          break;
        case 'toggleLayout':
          this.triggerEvent('toggleLayout');
          break;
        case 'second':
          this.toggleSecondMode();
          break;
        case 'radToggle':
          this.toggleRadMode();
          break;
        case 'decimal':
          this.triggerEvent('decimal');
          break;

        // ---- 带参数事件（传递按键显示文本） ----
        case 'digit':
          this.triggerEvent('digit', { value: key.label });
          break;
        case 'operator':
          this.triggerEvent('operator', { value: key.label });
          break;
        case 'function':
          this.triggerEvent('function', { value: key.label });
          break;
        case 'paren':
          this.triggerEvent('paren', { value: key.label });
          break;
        case 'constant':
          this.triggerEvent('constant', { value: key.label });
          break;
      }
    },

    /**
     * 触发触觉反馈（按键振动）
     *
     * 调用微信小程序的轻振动 API，模拟物理按键手感。
     * 在模拟器或不支持的设备上静默失败，不影响功能。
     */
    triggerHaptic() {
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (e) {
        // 模拟器或部分设备不支持振动，忽略即可
      }
    }
  }
});
