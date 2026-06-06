/**
 * 历史记录页面
 */

const storage = require('../../utils/storage');

Page({
  data: {
    history: [],
    isEmpty: true
  },

  onShow() {
    this.loadHistory();
  },

  /**
   * 加载历史记录
   */
  loadHistory() {
    const history = storage.getHistory();
    this.setData({
      history: history.map(item => ({
        ...item,
        timeStr: this.formatTime(item.timestamp)
      })),
      isEmpty: history.length === 0
    });
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    const pad = (n) => String(n).padStart(2, '0');

    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

    if (diff < oneDay && date.getDate() === now.getDate()) {
      return `今天 ${time}`;
    } else if (diff < 2 * oneDay && date.getDate() === now.getDate() - 1) {
      return `昨天 ${time}`;
    } else {
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${time}`;
    }
  },

  /**
   * 点击历史记录 -> 复制表达式到剪贴板
   */
  onItemTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.history[index];

    wx.setClipboardData({
      data: `${item.expression} = ${item.result}`,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success', duration: 1500 });
      }
    });
  },

  /**
   * 删除单条记录
   */
  onDeleteItem(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '删除记录',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.removeHistory(index);
          this.loadHistory();
        }
      }
    });
  },

  /**
   * 清空全部历史
   */
  onClearAll() {
    if (this.data.isEmpty) return;

    wx.showModal({
      title: '清空记录',
      content: '确定要清除所有历史记录吗？此操作不可恢复。',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          storage.clearHistory();
          this.loadHistory();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }
});
