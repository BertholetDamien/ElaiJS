node r.js -o requireElaiJS-Build.js
sed -i 's|,define("elaiJS/requireElaiJS",function(){});|;|g' requireElaiJS.min.js
node r.js -o elaiJSPartial-Build.js
node r.js -o elaiJSMain-Build.js
cat requireElaiJS.min.js > elaiJS.min.js
cat elaiJSPartial.min.js >> elaiJS.min.js
cat elaiJSMain.min.js >> elaiJS.min.js
rm requireElaiJS.min.js
rm elaiJSPartial.min.js
rm elaiJSMain.min.js
mv elaiJS.min.js ./../js/lib/elaiJS.min.js