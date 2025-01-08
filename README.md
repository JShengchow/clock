版本发布流程:
# 1. 确保开发分支代码稳定
git checkout develop
git pull origin develop

# 2. 合并到主分支
git checkout main
git merge develop

# 3. 更新版本号（修改 package.json）
git add package.json
git commit -m "release: v0.0.3"

# 4. 打标签
git tag -a v0.0.3 -m "Version 0.0.3"

# 5. 推送更新
git push origin main
git push origin v0.0.3

# 6. 部署（如果需要）
npm run deploy

# 7. 切回开发分支继续开发
git checkout develop