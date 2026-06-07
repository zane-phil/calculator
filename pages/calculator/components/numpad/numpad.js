/**
 * numpad 组件 - 可复用的数字/运算符键盘
 *
 * Props:
 *   layout: 'basic' (5×4) | 'scientific' (7×6)
 *   degMode: true (角度) | false (弧度) - 仅科学模式
 */

Component({
  properties: {
    layout: {
      type: String,
      value: 'basic'  // 'basic' | 'scientific'
    },
    degMode: {
      type: Boolean,
      value: true
    }
  },

  data: {
    basicKeys: [],
    scientificKeys: []
  },

  lifetimes: {
    attached() {
      this.initKeys();
    }
  },

  observers: {
    'degMode'(val) {
      this.initScientificKeys();
    }
  },

  methods: {
    initKeys() {
      this.setData({
        basicKeys: this.getBasicKeys()
      });
      this.initScientificKeys();
    },

    getBasicKeys() {
      return [
        [
          { label: 'C', type: 'clear', class: 'key-func' },
          { label: '←', type: 'backspace', class: 'key-func' },
          { label: '%', type: 'percent', class: 'key-func' },
          { label: '÷', type: 'operator', class: 'key-operator' }
        ],
        [
          { label: '7', type: 'digit', class: 'key-num' },
          { label: '8', type: 'digit', class: 'key-num' },
          { label: '9', type: 'digit', class: 'key-num' },
          { label: '×', type: 'operator', class: 'key-operator' }
        ],
        [
          { label: '4', type: 'digit', class: 'key-num' },
          { label: '5', type: 'digit', class: 'key-num' },
          { label: '6', type: 'digit', class: 'key-num' },
          { label: '−', type: 'operator', class: 'key-operator' }
        ],
        [
          { label: '1', type: 'digit', class: 'key-num' },
          { label: '2', type: 'digit', class: 'key-num' },
          { label: '3', type: 'digit', class: 'key-num' },
          { label: '+', type: 'operator', class: 'key-operator' }
        ],
        [
          { label: '+/−', type: 'negate', class: 'key-num' },
          { label: '0', type: 'digit', class: 'key-num' },
          { label: '.', type: 'decimal', class: 'key-num' },
          { label: '=', type: 'equals', class: 'key-equals' }
        ]
      ];
    },

    initScientificKeys() {
      const degLabel = this.data.degMode ? 'DEG' : 'RAD';
      this.setData({
        scientificKeys: [
          [
            { label: 'sin', type: 'function', class: 'key-func' },
            { label: 'cos', type: 'function', class: 'key-func' },
            { label: 'tan', type: 'function', class: 'key-func' },
            { label: 'ln', type: 'function', class: 'key-func' },
            { label: 'log', type: 'function', class: 'key-func' },
            { label: '(', type: 'paren', class: 'key-func' }
          ],
          [
            { label: 'sin⁻¹', type: 'function', class: 'key-func' },
            { label: 'cos⁻¹', type: 'function', class: 'key-func' },
            { label: 'tan⁻¹', type: 'function', class: 'key-func' },
            { label: 'eˣ', type: 'function', class: 'key-func' },
            { label: '10ˣ', type: 'function', class: 'key-func' },
            { label: ')', type: 'paren', class: 'key-func' }
          ],
          [
            { label: 'x²', type: 'function', class: 'key-func' },
            { label: 'x³', type: 'function', class: 'key-func' },
            { label: 'xʸ', type: 'operator', class: 'key-func' },
            { label: '√', type: 'function', class: 'key-func' },
            { label: '³√', type: 'function', class: 'key-func' },
            { label: 'π', type: 'constant', class: 'key-func' }
          ],
          [
            { label: 'n!', type: 'function', class: 'key-func' },
            { label: 'C', type: 'clear', class: 'key-func' },
            { label: '←', type: 'backspace', class: 'key-func' },
            { label: '%', type: 'percent', class: 'key-func' },
            { label: '÷', type: 'operator', class: 'key-operator' }
          ],
          [
            { label: '7', type: 'digit', class: 'key-num' },
            { label: '8', type: 'digit', class: 'key-num' },
            { label: '9', type: 'digit', class: 'key-num' },
            { label: '×', type: 'operator', class: 'key-operator' },
            { label: 'e', type: 'constant', class: 'key-func' },
            { label: '−', type: 'operator', class: 'key-operator' }
          ],
          [
            { label: '4', type: 'digit', class: 'key-num' },
            { label: '5', type: 'digit', class: 'key-num' },
            { label: '6', type: 'digit', class: 'key-num' },
            { label: '+', type: 'operator', class: 'key-operator' },
            { label: '+/−', type: 'negate', class: 'key-num' },
            { label: '.', type: 'decimal', class: 'key-num' }
          ],
          [
            { label: '1', type: 'digit', class: 'key-num' },
            { label: '2', type: 'digit', class: 'key-num' },
            { label: '3', type: 'digit', class: 'key-num' },
            { label: '0', type: 'digit', class: 'key-num' },
            { label: '=', type: 'equals', class: 'key-equals' }
          ]
        ]
      });
    },

    /**
     * 按键点击事件
     */
    onKeyTap(e) {
      const key = e.currentTarget.dataset.key;
      const type = e.currentTarget.dataset.type;

      // 触觉反馈
      this.triggerHaptic();

      switch (type) {
        case 'digit':
          this.triggerEvent('digit', { value: key.label });
          break;
        case 'operator':
          this.triggerEvent('operator', { value: key.label });
          break;
        case 'function':
          this.triggerEvent('function', { value: key.label });
          break;
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
        case 'negate':
          this.triggerEvent('negate');
          break;
        case 'decimal':
          this.triggerEvent('decimal');
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
     * 触发触觉反馈
     */
    triggerHaptic() {
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (e) {
        // 忽略不支持的情况
      }
    }
  }
});
