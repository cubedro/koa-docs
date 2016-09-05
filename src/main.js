'use strict';

const render = require('mithril-node-render');
const tpl = require('./template');

function createMiddleware (route, opts) {
   const html = render(tpl(opts));

   return function docs (ctx, next) {
      // Skip all requests other then a GET request at specified route
      if (ctx.method !== 'get' && ctx.url.indexOf(route) !== 0) {
         return next();
      }

      ctx.body = html;
      return void 0;
   };
}

module.exports = {
   get: createMiddleware
};
