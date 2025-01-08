# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

# 1. 确保在主分支
git checkout main

# 2. 添加所有文件
git add .

# 3. 提交更改
git commit -m "feat: complete clock app v0.0.2
- 重构时间处理逻辑，使用函数式方法
- 添加模块删除功能
- 优化时间显示格式
- 添加考试结束自动计次
- 修复时间计算问题
- 优化界面样式"

# 4. 打版本标签
git tag -a v0.0.2 -m "Version 0.0.2"

# 5. 推送到主分支和标签
git push origin main
git push origin v0.0.2

# 6. 创建并切换到 gh-pages 分支
git checkout -b gh-pages

# 7. 推送 gh-pages 分支
git push origin gh-pages

# 8. 执行部署
npm run deploy

# 9. 切回主分支
git checkout main