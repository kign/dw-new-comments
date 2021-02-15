'use strict'

let srcElm = document.getElementById('src');
let listElm = document.getElementById('list');
let errElm = document.getElementById('error');

let ukey = localStorage.ukey;
srcElm.innerHTML = ukey;

if (localStorage.unparsable_stamp !== '')
  errElm.innerHTML = "Bad stamp: <font color='red'>" + localStorage.unparsable_stamp + "</font>";
else
  errElm.innerHTML = '';

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

function add_timestamp(snapshots_a, ts) {
  let a = 0;
  let b = snapshots_a.length - 1;
  let ii;
  if (ts <= snapshots_a[a])
    ii = a;
  else if (ts >= snapshots_a[b])
    ii = b + 1;
  else {
    while (a < b-1) {
      let c = ((a + b)%2 === 0)? (a + b)/2: (a + b + 1)/2;
      if (ts < snapshots_a[c])
        b = c;
      else
        a = c;
    }
    ii = b;
  }
  let new_a = snapshots_a.slice ();
  new_a.splice(ii, 0, ts);

  while (listElm.firstChild)
    listElm.removeChild(listElm.firstChild);

  show_snapshots(new_a);

  chrome.storage.local.set({[ukey]: new_a}, function() {
    errElm.innerHTML = "<font color='green'>" + 'Saved!' + "</font>";
  });
}

chrome.storage.local.get({[ukey] : []},
  function(saved) {
    show_snapshots(saved[ukey]);
    document.forms.add.addEventListener('submit',
      function(evt) {
        evt.preventDefault();
        let time_string = document.forms.add.ts.value;
        const ma = RegExp("^(.+) +\\(([a-z]+)\\) *$").exec(time_string);
        if (!ma)
          time_string += " (local)";
        chrome.tabs.sendMessage(parseInt(localStorage.tabid), {time_string: time_string},
          function(response) {
            console.log("Received response", response, "; chrome.extension.lastError =", chrome.extension.lastError);
            if (response.ts)
              add_timestamp(saved[ukey], response.ts);
            else
              errElm.innerHTML = "Bad stamp: <font color='red'>" + time_string + "</font>";
          });
      });
  });
