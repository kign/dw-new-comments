'use strict'

let srcElm = document.getElementById('src');
srcElm.innerHTML = localStorage.ukey;

let listElm = document.getElementById('list');

let ukey = localStorage.ukey;
let arg_get = {};
arg_get[ukey] = [];

document.getElementById('options').onclick = function () {
  chrome.runtime.openOptionsPage();
}

function show_snapshots(snapshots_a) {
  for (let ts of snapshots_a)
    listElm.appendChild(makeElm('DIV', {id: ts},
            makeElm('SPAN', {class: 'checkmark'}, "\u2713"),
            " ",
            makeElm('A', {href: '#'}, moment.unix(ts).format('YYYY-MM-DD HH:mm'))));


  xpath_do(listElm,'//div//a', function (elm) { elm.onclick = activate; });

  let ts = localStorage[ukey];
  set_checkmark(ts);
}

function set_checkmark(ts) {
  xpath_do(listElm, "//span[@class='checkmark']",
    function(elm) {
      elm.style.visibility = 'hidden';
    });

  console.log("ts =", ts);
  xpath_do(listElm, "//div[@id='" + ts + "']//span[@class='checkmark']",
    function(elm) {
      elm.style.visibility = 'visible';
      console.log("ts =", ts, " FOUND!");
    });
}

function activate(evt) {
  let node = evt.target;
  let ts = node.parentNode.getAttribute('id');
  console.log("Switching to", ts, "=", moment.unix(ts).format('YYYY-MM-DD HH:mm'));
  set_checkmark(ts);
  localStorage[ukey] = ts;
  chrome.tabs.sendMessage(parseInt(localStorage.tabid), {ts: ts});
}

chrome.storage.sync.get(arg_get, function(saved) { show_snapshots(saved[ukey]); });
