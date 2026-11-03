/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://medivisorindiatreatment.com/",
  generateRobotsTxt: false,
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,
  exclude: [
    '/sitemap.xml',
    '/robots.txt',
    '/api/*',
  ],
};
