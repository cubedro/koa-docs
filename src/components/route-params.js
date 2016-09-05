'use strict';

const m = require('mithril');
const get = require('lodash/get');

const collapsablePanel = require('./collapsable-panel');

module.exports = function routeParams (route) {
   return [
      paramsTable(route.validate, 'header'),
      paramsTable(route.validate, 'query'),
      paramsTable(route.validate, 'params'),
      paramsTable(route.validate, 'body'),
      paramsTable(route.validate, 'passport'),
      paramsTable(route.validate, 'output')
   ];
};

function paramsTable (validations, type) {
   if (!validations || !validations.hasOwnProperty(type)) return [];

   const schema = validations[type];
   const heading = paramsHeader(schema, type, validations);

   const table = {
      style: { marginBottom: 0 }
   };

   const panel = {
      className: type === 'output' ? 'panel-success' : ''
   };

   return collapsablePanel(heading, panel, [
      m('table.table.table-striped', table, [
         m.trust(`
            <colgroup>
               <col span="1" style="width: 20%;">
               <col span="1" style="width: 15%;">
               <col span="1" style="width: 65%;">
            </colgroup>
         `),

         getItems(schema).map(paramsTableBody)
      ])
   ]);
}

function paramsHeader (schema, type, validations) {
   const bodyType = validations.type;
   const label = isArray(schema) ? arrayLabel(schema) : itemLabel(schema);

   const header = [
      type.slice(0, 1).toUpperCase() + type.slice(1),
      !label ? '' : `: ${label}`
   ];

   // In case of body also indicate what type of body is expected
   // i.e. json, form, multipart
   if (type === 'body') {
      const tag = { style: { float: 'right' } };
      const bodyTag = m('span.label.label-info', tag, bodyType);
      header.push(bodyTag);
   }

   return header;
}

function getChildrenRecursive (schema, prefix) {
   const children = get(schema, '_inner.children', []);
   const result = children.map(child => {
      const row = [];
      row.push(paramsRow(child.schema, prefix + child.key));
      
      const inner = getChildrenRecursive(child.schema, child.key + '.');
      return row.concat(inner);
   });
}

function paramsTableBody (schema) {
   const body = m('tbody');

   // TODO: sort validations by required
   if (schema.isJoi) {
      body.children = getChildrenRecursive(schema, '');
   } else {
      body.children = Object.keys(schema).map(k => paramsRow(schema[k], k));
   }

   return body;
}

function paramsRow (schema, field) {
   const flags = schema._flags || {};
   const required = flags && flags.presence === 'required';
   return m('tr', [
      m('td', field),
      m('td', schema._type + (!required ? '' : ' *')),
      m('td', schema._description || {})
   ]);
}

function isArray (schema) {
   return schema._type === 'array';
}

function getItems (schema) {
   if (!isArray(schema)) return [schema];
   return get(schema, '_inner.items', []);
}

function itemLabel (schema) {
   return get(schema, '_settings.language.label', '');
}

function arrayLabel (schema) {
   if (!isArray(schema)) return '';
   const items = getItems(schema).map(itemLabel);
   return `Array [ ${items} ]`;
}
