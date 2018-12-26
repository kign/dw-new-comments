'use strict'

let listElm = document.getElementById('list');
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
for (let ts of [1538154000,1539536400,1540918800,1542301200,1543683600]) {
  listElm.appendChild(makeElm('DIV', {id: ts},
          makeElm('SPAN', {class: 'checkmark'}, "\u2713"), " " + moment.unix(ts).format('YYYY-MM-DD HH:mm')));
}
