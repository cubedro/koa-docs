'use strict';

const hasha = require('hasha');

module.exports = function anchor (route) {
   return hasha(`${route.method}-${route.path}-${route.handler}-${route.meta.friendlyName}`).slice(0, 12);
};
