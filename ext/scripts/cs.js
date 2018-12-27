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
      if (ts && m.unix() > ts)
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
    let ukey = uname + "_" + postid;
    console.log("enabled");

    let arg_get = {};
    arg_get[ukey] = [];

    chrome.storage.sync.get(arg_get,
          function(saved) {
            let cur = saved[ukey].slice();
            let ts = cur? cur[cur.length-1]: null;
            chrome.runtime.sendMessage({ukey: ukey, enable: true, ts: ts});
            let last = markup(ts);
            console.log("cur =", cur, "last =", last);
            if (last>0 && !(cur.length > 0 && cur[cur.length - 1] == last)) {
              cur.push(last);
              let arg_set = {};
              arg_set[ukey] = cur;
              chrome.storage.sync.set(arg_set,
                function() {
                  console.log("Saved", cur);
                });
            }
          });
    document.onvisibilitychange = function() {
      console.log("url =", document.location.href + "; visible =", !document.hidden);
      chrome.runtime.sendMessage({ukey: ukey, visible: !document.hidden});
    }
  }
  else {
    chrome.runtime.sendMessage({enable: false, url: document.location.href});
    console.log("disabled");
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Received message from", sender);
    let ts = request.ts;
    console.log("Switching to", ts, "=", moment.unix(ts).format('YYYY-MM-DD HH:mm'));
    markup(ts);
  });

first_run ();
