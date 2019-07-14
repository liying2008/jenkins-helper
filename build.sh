#!/bin/bash

rm -rf dist
mkdir -p dist/chrome

cp -r _locales css fonts img js LICENSE manifest.json *.html dist/chrome

cd dist/chrome
rm -f js/libs/bootstrap.js
rm -f js/libs/bootstrap.min.js  # 暂时没有用到 bootstrap.min.js
rm -f js/libs/jquery.js
rm -f js/libs/vue.js

# 将 jquery.js 替换为 jquery.min.js
# 将 vue.js 替换为 vue.min.js
html_files=$(find . -name "*.html")
for html in $html_files; do
    sed -i 's/src="js\/libs\/jquery.js"/src="js\/libs\/jquery.min.js"/' $html
    sed -i 's/src="js\/libs\/vue.js"/src="js\/libs\/vue.min.js"/' $html
done

# 将 jquery.js 替换为 jquery.min.js
sed -i 's/"js\/libs\/jquery.js"/"js\/libs\/jquery.min.js"/' manifest.json

zip -r ../jenkins-helper.zip *
cd -
