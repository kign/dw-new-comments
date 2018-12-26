'use strict';

function markup (ts) {
  let xp_ts_span = "//span[@class='datetime']/span[@title]";
  let span_a = document.evaluate(xp_ts_span, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

  let last = 0;
  for (let ii=0 ; ii < span_a.snapshotLength; ii ++ ) {
    let node = span_a.snapshotItem(ii);
    let d = node.textContent;
    let m = moment(d,["dddd, MMMM Do gggg HH:mm", "YYYY-MM-DD HH:mm"]);
    if (m.isValid()) {
      //console.log(d + " ==> " + m.format());
      if (ts && m.uinx() > ts)
        node.classList.add('isnew');
      else
        node.classList.remove('isnew');

      last = Math.max(last,m.unix());
    }
    else
      console.log(d + ": INVALID");
  }

  return last;
}

function first_run () {
  let r = RegExp("^https://([a-z0-9-]+).dreamwidth.org/([0-9]+).html$");
  let m = r.exec(document.location.href);
  if (m) {
    let uname = m[1];
    let postid = m[2];
    chrome.runtime.sendMessage({enable: true});
    console.log("enabled");

    let key = uname + "_" + postid;
    let arg_get = {};
    arg_get[key] = [];

    chrome.storage.sync.get(arg_get,
          function(saved) {
            let cur = saved[key].slice();
            let last = markup(cur? cur[cur.lengh-1]: null);
            console.log("cur =", cur, "last =", last);
            if (last>0 && !(cur.length > 0 && cur[cur.length - 1] == last)) {
              cur.push(last);
              let arg_set = {};
              arg_set[key] = cur;
              chrome.storage.sync.set(arg_set,
                function() {
                  console.log("Saved", cur);
                });
            }
          });
  }
  else {
    chrome.runtime.sendMessage({enable: false});
    console.log("disabled");
  }

}

first_run ();

// function update () {
//   // XPath doc:
//   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_using_XPath_in_JavaScript
//   let xp_ts_span = "//span[@class='datetime']/span[@title]";
//   let span_a = document.evaluate(xp_ts_span, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
//
//   let last = 0;
//   for (let ii=0 ; ii < span_a.snapshotLength; ii ++ ) {
//     let node = span_a.snapshotItem(ii);
//     node.classList.add('isnew');
//     let d = node.textContent;
//     let m = moment(d,["dddd, MMMM Do gggg HH:mm", "YYYY-MM-DD HH:mm"]);
//     if (m.isValid()) {
//       //console.log(d + " ==> " + m.format());
//       last = Math.max(last,m.unix());
//     }
//     else
//       console.log(d + ": INVALID");
//   }
//
//   let r = RegExp("^https://([a-z0-9-]+).dreamwidth.org/([0-9]+).html$");
//   let m = r.exec(document.location.href);
//   if (m) {
//     let uname = m[1];
//     let postid = m[2];
//     let key = uname + "_" + postid;
//
//     chrome.storage.sync.get({key+'': []},
//           function(saved) {
//             let cur = saved[key].slice();
//             cur.push(last);
//             chrome.storage.sync.set({key+'': cur},
//               function() {
//                 chrome.runtime.sendMessage({'address': '15 Durakov Avenue'});
//               });
//           });
//   }
// }
