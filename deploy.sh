#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 构建
npm run build

# 进入构建文件夹
cd dist

git init
git add -A
git commit -m 'deploy'

# 修改为你的 GitHub 用户名和仓库名
git push -f git@github.com:JShengchow/clock.git main:gh-pages

cd -