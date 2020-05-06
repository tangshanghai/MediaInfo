/**
 * Created by tangshanghai on 2016/12/26.
 */
var path = require('path');
var webpack = require('webpack');
// const config = require('../config.js');
// const codeDir = "src";
// const webpackOutputPath = path.resolve(codeDir, 'dist/simple_entry_hot_replace');
// const buildPath = path.resolve(config.root,webpackOutputPath);
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app:"./src/index.js",
        //vendor:["./src/lib/flv.js","./src/lib/hls.min.js"]
    },
    output: {
        path: path.resolve(__dirname +'/assets'),
        filename: "bundle.js",
        library: 'MediaInfo',
        libraryExport: "default",
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    devServer: {
        hot: true,
        contentBase: path.join(__dirname, "assets"),
        port: 9085,
        host:'0.0.0.0'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // 防止加载所有地区时刻
        // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // Webpack 2以后内置
        // new webpack.optimize.OccurrenceOrderPlugin(),
        // 碰到错误warning但是不停止编译
        new webpack.NoEmitOnErrorsPlugin(), 
        // 生成html文件
        new HtmlWebpackPlugin({ 
            // 输出文件名字及路径
            filename: 'index.html',
            template: 'index.html'
        }),
        // new webpack.NamedModulesPlugin(),
    
    ],
    module: {
        loaders: [
            {
                test: /\.js|jsx$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', "stage-0"]
                }
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader?limit=10240'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader'
            }
            //,
            //{
            //    test:'./src/lib/flv.min.js',
            //    loader:"imports?flvjs=flvjs,this=>window"
            //}
            //{
            //    // 得到jquery模块的绝对路径
            //    test: '../jquery.js',
            //    // 将jquery绑定为window.jQuery
            //    loader: 'expose?window.jQuery'
            //}

            //{
            //    test: "./src/lib/flv.js",
            //    loader: 'expose?window.flvjs'
            //},
            //{
            //    test: "./src/lib/hls.min.js",
            //    loader: 'expose?Hls'
            //}
        ]
    }
}