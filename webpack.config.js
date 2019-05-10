const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const defaults = require('lodash.defaults');
// 用于打包过程中生成Html文件的插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const gitsha = require('git-bundle-sha');
const path = require('path');
const webpack = require('webpack');

let routes = require('./src/routes.json');
const templateConfig = require('./src/template-config.js'); // eslint-disable-line global-require

if (process.env.NODE_ENV !== 'production') {
  routes = routes.concat(require('./src/routes-dev.json')); // eslint-disable-line global-require

  process.env.API_HOST = process.env.API_HOST || 'http://192.168.31.157:3001/scratch/scratch-api'
  process.env.ASSET_HOST = process.env.ASSET_HOST || 'http://192.168.31.157:3001/scratch/scratch-assets'
  process.env.PROJECT_HOST = process.env.PROJECT_HOST || 'http://192.168.31.157:3001/scratch/scratch-projects'
} else {
  process.env.API_HOST = process.env.API_HOST || 'http://123.207.119.232:3001/scratch/scratch-api'
  process.env.ASSET_HOST = process.env.ASSET_HOST || 'http://123.207.119.232:3001/scratch/scratch-assets'
  process.env.PROJECT_HOST = process.env.PROJECT_HOST || 'http://123.207.119.232:3001/scratch/scratch-projects'
}
// 不指定env.VIEW则使用全部，指定env.VIEW则只留下指定的VIEW
routes = routes.filter(route => !process.env.VIEW || process.env.VIEW === route.view);

let VersionPlugin = function (options) {
  this.options = options || {};
  return this;
};

VersionPlugin.prototype.apply = function (compiler) {
  const addVersion = function (compilation, versionId, callback) {
    // 输出一个版本信息到version.txt文件里，放置到输出目录
    compilation.assets['version.txt'] = {
      source: function () {
        return versionId;
      },
      size: function () {
        return versionId.length;
      }
    };
    callback();
  };
  const options = this.options;

  compiler.plugin('emit', function (compilation, callback) {
    const sha = process.env.WWW_VERSION;
    if (!sha) { // eslint-disable-line no-negated-condition
      gitsha(options, function (err, _sha) {
        if (err) return callback(err);
        return addVersion(compilation, _sha, callback);
      });
    } else {
      return addVersion(compilation, sha, callback);
    }
  });
};

// Prepare all entry points
let entry = {
  // common模块，用于生成common.bundle.js
  common: [
    // Vendor
    'react',
    'react-dom',
    'react-intl',
    'redux',
    // Init
    './src/init.js'
  ]
};
// 业务模块，用于生成各自页面的***.bundle.js比如splash.bundle.js，about.bundle.js
routes.forEach(function (route) {
  if (!route.redirect) {
    entry[route.name] = `./src/views/${route.view}.jsx`;
  }
});

// Config
module.exports = {
  // 入口起点(entry point)指示 webpack 应该使用哪个模块，来作为构建其内部依赖图的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。
  entry: entry,
  devtool: process.env.NODE_ENV === 'production' ? 'none' : 'eval',
  // output 属性告诉 webpack 在哪里输出它所创建的 bundles，以及如何命名这些文件，默认值为 ./dist。
  output: {
    // 目标输出目录 path 的绝对路径
    path: path.resolve(__dirname, 'build'),
    // 用于输出文件的文件名，其中[name]为模块名称，即entry的名称，比如splash.bundle.js，about.bundle.js
    filename: 'js/[name].bundle.js'
  },
  module: {
    // loader 让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）。
    rules: [
      // “嘿，webpack 编译器，当你碰到「在 require()/import 语句中被解析为 '.jsx' 的路径」时，在你对它打包之前，先使用 babel-loader 转换一下。”
      {
        test: /\.jsx?$/,
        loader: 'babel-loader?presets[]=react,presets[]=es2015,presets[]=stage-0',
        include: [
          path.resolve(__dirname, 'src'),
          /node_modules[\\/]scratch-[^\\/]+[\\/]src/,
          /node_modules[\\/]pify/
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [autoprefixer({ browsers: ['last 3 versions', 'Safari >= 8', 'iOS >= 8'] })];
              }
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [autoprefixer({ browsers: ['last 3 versions', 'Safari >= 8', 'iOS >= 8'] })];
              }
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|eot|svg|ttf|woff)$/,
        loader: 'url-loader'
      }
    ],
    noParse: /node_modules\/google-libphonenumber\/dist/
  },
  node: {
    fs: 'empty'
  },
  plugins: [
    // 版本记录自定义插件
    new VersionPlugin({ length: 5 })
  ].concat(routes
    // 重定向的是重复的,去掉redirect的
    .filter(function (route) {
      return !route.redirect;
    })
    .map(function (route) {
      return new HtmlWebpackPlugin(defaults({}, {
        // The title to use for the generated HTML document
        title: route.title,
        // The file to write the HTML to. Defaults to index.html. You can specify a subdirectory here too (eg: assets/admin.html)
        filename: route.name + '.html',
        route: route,
        dynamicMetaTags: route.dynamicMetaTags
      }, templateConfig));
    })
  ).concat([
    new CopyWebpackPlugin([
      // 将static下所有文件拷贝到output目录（不包含static目录）
      { from: 'static' },
      // 将intl下所有文件拷贝的output目录的js目录下
      { from: 'intl', to: 'js' }
    ]),
    new CopyWebpackPlugin([{
      from: 'node_modules/scratch-gui/dist/static/blocks-media',
      to: 'static/blocks-media'
    }]),
    new CopyWebpackPlugin([{
      from: 'node_modules/scratch-gui/dist/chunks',
      to: 'static/chunks'
    }]),
    new CopyWebpackPlugin([{
      from: 'node_modules/scratch-gui/dist/extension-worker.js'
    }]),
    new CopyWebpackPlugin([{
      from: 'node_modules/scratch-gui/dist/extension-worker.js.map'
    }]),
    new CopyWebpackPlugin([{
      from: 'node_modules/scratch-gui/dist/static/assets',
      to: 'static/assets'
    }]),
    new CopyWebpackPlugin([{
      from: 'node_modules/scratch-gui/dist/static/libraries-assets',
      to: 'static/libraries-assets'
    }]),
    /// 拷贝svg-renderer的static资源到static目录
    new CopyWebpackPlugin([{
      from: 'node_modules/scratch-gui/dist/static/svg-fonts',
      to: 'static/svg-fonts'
    }]),
    new CopyWebpackPlugin([{
      from: 'node_modules/scratch-gui/dist/static/extensions',
      to: 'static/extensions'
    }])
  ])
    .concat(process.env.NODE_ENV === 'production' ? [
      // 用于压缩js文件，从而减少js文件大小，加速加载js速度，但会导致编译时间较长，开发阶段默认关闭，发布时打开
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        mangle: {
          except: ['$super', '$', 'exports', 'require', 'module', '_']
        },
        compress: {
          warnings: false
        },
        output: {
          comments: false,
        }
      })
    ] : [])
    .concat([
      // 定义全局变量，可以定义开发环境或者生产环，还可以定义Host
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"' + (process.env.NODE_ENV || 'development') + '"',
        //https://api.scratch.mit.edu
        'process.env.API_HOST': '"' + (process.env.API_HOST || 'https://api.scratch.mit.edu') + '"',
        //https://assets.scratch.mit.edu
        'process.env.ASSET_HOST': '"' + (process.env.ASSET_HOST || 'https://assets.scratch.mit.edu') + '"',
        'process.env.BACKPACK_HOST': '"' + (process.env.BACKPACK_HOST || 'https://backpack.scratch.mit.edu') + '"',
        'process.env.CLOUDDATA_HOST': '"' + (process.env.CLOUDDATA_HOST || 'clouddata.scratch.mit.edu') + '"',
        //https://projects.scratch.mit.edu
        'process.env.PROJECT_HOST': '"' + (process.env.PROJECT_HOST || 'https://projects.scratch.mit.edu') + '"',
        'process.env.STATIC_HOST': '"' + (process.env.STATIC_HOST || 'https://cdn2.scratch.mit.edu') + '"',
        'process.env.SCRATCH_ENV': '"' + (process.env.SCRATCH_ENV || 'development') + '"',
        'process.env.SENTRY_DSN': '"' + (process.env.SENTRY_DSN || '') + '"'
      }),
      // 提取所有页面的公共代码到common，保证只有一份common.bundle
      new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: 'js/common.bundle.js'
      })
    ])
};
