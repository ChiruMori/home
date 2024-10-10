const path = require('path');  // node自带包
module.exports = {
    // 打包对入口文件，期望打包的文件入口
    entry: ['./src/ts/', './src/less/'],
    output: {
        // 输出文件名称
        filename: 'index.js',
        //获取输出路径
        path: path.resolve(__dirname, 'dist')
    },
    // production: 生产环境（打包时候的配置）, development: 开发环境（默认，方便阅读）
    mode: 'production',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }, {
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader'],
            exclude: /node_modules/
        }]
    },
    resolve: {
        // 解析的文件格式
        extensions: ['.ts', '.less']
    },
}