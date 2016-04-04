#!/bin/bash
rm -rf out || exit 0;
mkdir out;
npm install -g webpack
npm install
webpack
cd out
git init
git config user.name "Travis-CI"
git config user.email "travis@nodemeatspace.com"
cp ../index.html ./index.html
cp -r ../builds/ ./builds
git add .
git commit -m "Deployed to Github Pages"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
