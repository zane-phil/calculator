# 多功能计算器

<img src="https://img.shields.io/badge/platform-WeChat%20Mini%20Program-07C160?logo=wechat" alt="platform">
<img src="https://img.shields.io/badge/license-MIT-green" alt="license">

一款功能丰富的微信小程序计算器，集成基础计算、科学计算、汇率换算、单位换算、个税计算、房贷计算等十余种实用工具。

## 功能

### 计算器
- 基础四则运算、百分比、括号优先级
- 科学计算模式：三角函数、对数、指数、阶乘、根号等
- 实时预览：输入表达式同步显示计算结果
- 历史记录：C 键推入历史区，AC 清空
- 按 `=` 结果放大主视觉，算式缩小

### 换算工具（14 项）

| 工具 | 说明 |
|------|------|
| 汇率转换 | 20+ 币种实时双向换算 |
| 长度转换 | 千米/米/英里/英尺 等 10 种单位 |
| 重量转换 | 吨/千克/磅/斤/两 等 8 种单位 |
| 面积转换 | 平方千米/公顷/亩/英亩 等 9 种单位 |
| 个税计算 | 7 级累进税率 · 五险一金 · 专项附加扣除 |
| 房贷计算 | 商业/公积金贷款 · 等额本息/本金 |
| 称呼计算 | 亲戚关系链计算（如：我的父的父的姐 → 祖姑母） |
| 大写数字 | 阿拉伯数字转中文财务大写（壹贰叁...元角分） |
| 时间转换 | 年/月/日/时/分/秒/毫秒 |
| 体积转换 | 立方米/升/加仑 等 8 种单位 |
| 进制转换 | 二进制/八进制/十进制/十六进制互转 |
| 温度转换 | 摄氏度/华氏度/开尔文 |
| 速度转换 | 千米时/米秒/英里时/节/马赫 |
| BMI 计算 | 身体质量指数计算与评估 |

## 项目结构

```
├── app.js / app.json / app.wxss   # 全局配置
├── pages/
│   ├── index/                     # 入口页（头部导航 + 计算/换算 Tab）
│   │   └── components/
│   │       ├── display/           # 显示屏组件
│   │       └── numpad/            # 键盘组件（基础 5×4 + 科学 7×5）
│   └── convert/                   # 换算功能
│       ├── currency/              # 汇率转换
│       ├── unit/                  # 单位换算
│       ├── tax/                   # 个税计算
│       ├── mortgage/              # 房贷计算
│       ├── relation/              # 称呼计算
│       ├── capitalize/            # 大写数字
│       ├── base/                  # 进制转换
│       ├── bmi/                   # BMI 计算
│       ├── history/               # 历史记录
│       └── settings/              # 设置
├── utils/
│   ├── calculator.js              # RPN 计算引擎
│   ├── converter.js               # 单位换算引擎
│   ├── formatter.js               # 数字格式化
│   └── storage.js                 # 本地存储
├── data/
│   ├── currencies.js              # 币种数据
│   ├── units.js                   # 单位定义
│   └── tax-rates.js               # 税率数据
├── components/
│   ├── top-nav/                   # 顶部导航组件
│   ├── unit-picker/               # 底部选择器组件
│   └── result-card/               # 结果卡片组件
└── assets/                        # 图标资源（SVG）
```

## 快速开始

1. 克隆仓库，用微信开发者工具打开项目目录
2. 填入自己的 AppID（或使用测试号）
3. 编译运行

## 技术要点

- **计算引擎**：手写 RPN（逆波兰表示法）表达式解析器，支持隐式乘法、DEG/RAD 角度切换、一元负号
- **架构**：单页双 Tab（计算/换算），`setData` 切换无页面跳转开销
- **自定义导航**：`navigationStyle: custom` + `top-nav` 组件
- **零依赖**：纯原生实现，无 npm 依赖

## 适配

支持微信小程序基础库 3.x，适配 iOS / Android / HarmonyOS。

## License

MIT
