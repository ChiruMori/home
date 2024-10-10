
browserify ./dist/*.js -o index.bundle.js

:: 压缩
uglifyjs ./dist/index.bundle.js -o ./dist/index.min.js