#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 清理旧的构建文件
rm -rf dist

# 构建项目
npm run build

# 进入构建文件夹
cd dist

# 创建 .nojekyll 文件，阻止 GitHub Pages 使用 Jekyll 处理文件
touch .nojekyll

# 初始化 git 仓库（只包含构建文件）
git init
git add -A
git commit -m 'deploy'

# 推送构建文件到 gh-pages 分支
git push -f git@github.com:JShengchow/clock.git main:gh-pages

# 返回上级目录
cd -