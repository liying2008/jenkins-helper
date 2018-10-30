#!/bin/bash

rm -rf dist
mkdir -p dist/chrome

cp -r _locales css fonts img js LICENSE manifest.json *.html dist/chrome

cd dist/chrome
rm js/libs/vue.js
# 将 vue.js 替换为 vue.min.js
html_file=`ls *.html`
for html in $html_file;do
    sed -i 's/src="js\/libs\/vue.js"/src="js\/libs\/vue.min.js"/' $html
done

zip -r ../jenkins-helper.zip *
cd -