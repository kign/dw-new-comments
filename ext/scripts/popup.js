'use strict'

let listElm = document.getElementById('list');
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
for (let ts of [1538154000,1539536400,1540918800,1542301200,1543683600]) {
  let divElm = document.createElement("DIV");
  divElm.appendChild(document.createTextNode("<span>\u2713</span> " + moment.unix(ts).format('YYYY-MM-DD HH:mm')));
  listElm.appendChild(divElm);1
}
