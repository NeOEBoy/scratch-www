/**
 * Default options for the html-webpack-plugin HTML renderer
 *
 * See https://github.com/ampedandwired/html-webpack-plugin#configuration
 * for possible options. Any other options will be available to the template
 * under `htmlWebpackPlugin.options`
 */

// Html模板配置文件
module.exports = {
  // webpack relative or absolute path to the template. By default it will use src/index.ejs if it exists. Please see the docs for details
  template: './src/template.ejs',
  // true || 'head' || 'body' || false Inject all assets into the given template or templateContent. When passing true or 'body' all javascript resources will be placed at the bottom of the body element. 'head' will place the scripts in the head element
  inject: false,

  // Search and metadata
  title: '小窗口大世界',
  description:
    'Scratch is a free programming language and online community ' +
    'where you can create your own interactive stories, games, ' +
    'and animations.',

  // override if mobile-friendly
  viewportWidth: 'device-width',

  // Open graph
  og_image: 'https://scratch.mit.edu/images/scratch-og.png',
  og_image_type: 'image/png',
  og_image_width: 986,
  og_image_height: 860
};
