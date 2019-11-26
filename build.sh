#!/bin/bash

TOP=$(pwd)
# just for self-distribution
IS_RELEASE=$1
echo IS_RELEASE=$IS_RELEASE

rm -rf dist
mkdir -p dist/chrome

cp -r _locales css fonts img js LICENSE manifest.json *.html dist/chrome

cd dist/chrome
rm -f js/libs/bootstrap.js
rm -f js/libs/bootstrap.min.js  # 暂时没有用到 bootstrap.min.js
rm -f js/libs/browser-polyfill.js
rm -f js/libs/jquery.js
rm -f js/libs/vue.js

# 将 browser-polyfill.js 替换为 browser-polyfill.min.js
# 将 jquery.js 替换为 jquery.min.js
# 将 vue.js 替换为 vue.min.js
html_files=$(find . -name "*.html")
for html in $html_files; do
    sed -i 's/src="js\/libs\/browser-polyfill.js"/src="js\/libs\/browser-polyfill.min.js"/' $html
    sed -i 's/src="js\/libs\/jquery.js"/src="js\/libs\/jquery.min.js"/' $html
    sed -i 's/src="js\/libs\/vue.js"/src="js\/libs\/vue.min.js"/' $html
done

# 将 jquery.js 替换为 jquery.min.js
sed -i 's/"js\/libs\/jquery.js"/"js\/libs\/jquery.min.js"/' manifest.json
# 将 browser-polyfill.js 替换为 browser-polyfill.min.js
sed -i 's/"js\/libs\/browser-polyfill.js"/"js\/libs\/browser-polyfill.min.js"/' manifest.json
# 删除 Chrome 不兼容的 application 属性
sed -i.bak '/  "applications": {/,/  },/d' manifest.json
mv manifest.json.bak ../

zip -r ../jenkins-helper-chrome.zip *

cd $TOP
if [ "$IS_RELEASE" == "true" ]; then
  # 设置环境变量 AMO_JWT_ISSUER 和 AMO_JWT_SECRET
  source secret.sh
  echo AMO_JWT_ISSUER=$AMO_JWT_ISSUER
  echo AMO_JWT_SECRET=$AMO_JWT_SECRET
fi

cd dist
cp -rf chrome firefox
cp manifest.json.bak firefox/manifest.json
cd firefox
# 删除 Firefox 不兼容的 minimum_chrome_version 属性
sed -i '/  "minimum_chrome_version":/d' manifest.json

web-ext build -v --overwrite-dest --artifacts-dir ..
if [ "$IS_RELEASE" == "true" ]; then
  # 自签名，仅用于测试，不用于发布
  web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET -v --artifacts-dir ..
fi
