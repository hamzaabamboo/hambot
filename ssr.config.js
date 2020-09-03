module.exports = {
  id: 'default',
  distDir: 'dist/.ssr',
  viewsDir: 'views',
  staticViews: ['clipper/index'],
  webpack: (
    config /* webpack.Configuration */,
    env /* 'development' | 'production' */,
  ) => {
    return config;
  },
};
