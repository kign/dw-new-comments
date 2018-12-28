'use strict';

function markup (ts) {
  const xp_ts_span = "//span[@class='datetime']/span[@title]";
  chrome.runtime.sendMessage(
    {get_default: true}, function(response) {
      console.log("Get response", response);
      chrome.storage.sync.get(
          {time_formats: response.time_formats},
      function(items) {
        let time_formats = [];
        for (let x of items.time_formats.split("\n")) {
          const x1 = x.trim();
          if (x1 != '')
            time_formats.push(x1);
        }
        _markup(ts, xp_ts_span, time_formats);
      });
    });
}

function _markup (ts, xp_ts_span, time_formats) {
  let span_a = document.evaluate(xp_ts_span, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

  let last = 0;
  for (let ii=0 ; ii < span_a.snapshotLength; ii ++ ) {
    let node = span_a.snapshotItem(ii);
    let d = node.textContent;
//    let m = moment(d,["dddd, MMMM Do gggg HH:mm", "YYYY-MM-DD HH:mm"]);
    let m = moment(d,time_formats);
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

function eligible_url() {
  let host = document.location.hostname;
  let path = document.location.pathname;
  let pars = document.location.search;

  let m = RegExp("^([a-z0-9-]+).dreamwidth.org$").exec(host);
  if (!m)
    return null;
  let uname = m[1];

  m = RegExp("^/([0-9]+).html$").exec(path);
  if (!m)
    return null;
  let postid = m[1];

  if (pars) {
    let query = pars.substr(1);
    for (let part of query.split("&")) {
      var item = part.split("=");
      let k = item[0];
      let v = decodeURIComponent(item[1]);
      if (!['nc','style','posted','view'].includes(k))
        return null;
    }
  }
  return uname + "_" + postid;
}

function first_run () {
  let ukey = eligible_url ();
  if (ukey) {
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
