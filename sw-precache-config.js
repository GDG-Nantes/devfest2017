module.exports = {
  staticFileGlobs: [
    '/index.html',
    '/manifest.json',
    '/robots.txt',
    '/sitemap.xml',
    '/bower_components/webcomponentsjs/webcomponents-lite.min.js',
    '/src/**/*',
    '/scripts/**/*',
    '/images/**/*',
    '/data/**/*'
  ],
  navigateFallback: '/index.html',
  navigateFallbackWhitelist: [ /^\/[^\_]+\// ]
};
