module.exports = {
  id: 'default',
  distDir: 'dist/.ssr',
  viewsDir: 'views',
  staticViews: ['clipper'],
  webpack: (
    config /* webpack.Configuration */,
    env /* 'development' | 'production' */,
  ) => {
    return config;
  },
};
