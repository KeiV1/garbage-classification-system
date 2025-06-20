# 智能垃圾分类系统

这是一个简洁美观的智能垃圾分类网页应用，帮助用户正确分类垃圾，保护环境。

## 功能特点

- **垃圾分类查询**：输入垃圾名称，快速查询其所属类别
- **图片识别分类**：上传垃圾图片，自动识别垃圾类型
- **分类指南**：提供四大类垃圾的详细说明和投放指南

## 技术实现

- 前端：HTML5, CSS3, JavaScript
- 框架：Bootstrap 5
- 图标：Font Awesome
- 图像识别：TensorFlow.js (模拟实现)

## 如何使用

1. 克隆或下载本项目到本地
2. 直接在浏览器中打开 `index.html` 文件
3. 使用垃圾分类查询功能：
   - 在搜索框中输入垃圾名称
   - 点击"查询"按钮或按回车键
   - 查看分类结果和投放建议
4. 使用图片识别功能：
   - 点击"选择文件"上传垃圾图片
   - 点击"识别分类"按钮
   - 查看识别结果和投放建议

## 垃圾分类说明

- **有害垃圾**：含有害物质，需特殊安全处理
- **可回收物**：可循环利用和资源再生的物品
- **厨余垃圾**：易腐烂的生物质生活废弃物
- **其他垃圾**：难以回收的混合垃圾

## 注意事项

- 当前版本的图片识别功能使用模拟数据，实际应用中需要替换为真实的TensorFlow.js模型
- 垃圾分类数据库可根据当地分类标准进行调整

## 未来计划

- 集成真实的图像识别模型
- 扩展垃圾分类数据库
- 添加用户反馈功能
- 优化移动端体验

## 许可证

MIT