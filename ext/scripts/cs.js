'use strict';

function with_time_formats (callback) {
  chrome.runtime.sendMessage(
    {get_default: true}, function(default_options) {
      console.log("Get default_options", default_options);
      chrome.storage.sync.get(
          {time_formats: default_options.time_formats,
          time_formats_ver: default_options.time_formats_ver},
      function(items) {
        const time_formats = (default_options.time_formats_ver > items.time_formats_ver)? default_options.time_formats : items.time_formats;
        let time_formats_arr = [];
        for (let x of time_formats.split("\n")) {
          const x1 = x.trim();
          if (x1 != '')
            time_formats_arr.push(x1);
        }
        callback(time_formats_arr);
      });
    });
}

function parse_time_string(time_string, time_formats) {
  const ma = RegExp("^(.+) +\\((local|utc)\\) *$").exec(time_string.toLowerCase());
  if (!ma)
    return null;

  let mo;
  if (ma[2] == "local")
    mo = moment(ma[1],time_formats);
  else
    mo = moment.utc(ma[1],time_formats);

  if (!mo)
    return null;

  if (!mo.isValid())
    return null;

  return mo.unix ();
}

function markup (ts, time_formats) {
  const xp_ts_span = "//span[@class='datetime']/span[@title]";
  let span_a = document.evaluate(xp_ts_span, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

  let last = 0;
  let unparsable_stamp = '';

  for (let ii=0 ; ii < span_a.snapshotLength; ii ++ ) {
    const node = span_a.snapshotItem(ii);
    const ts_this = parse_time_string(node.textContent, time_formats);

    if (ts_this) {
      if (ts && ts_this > ts)
        node.classList.add('isnew');
      else
        node.classList.remove('isnew');

      last = Math.max(last, ts_this);
    }
    else {
      if (!unparsable_stamp)
        unparsable_stamp = d;
      console.log(d + ": INVALID");
    }
  }

  //   let d = node.textContent;
  //   const ma = RegExp("^(.+) +\\((local|utc)\\) *$").exec(d.toLowerCase());
  //   let mo;
  //   if (ma) {
  //     if (ma[2] == "local")
  //       mo = moment(ma[1],time_formats);
  //     else
  //       mo = moment.utc(ma[1],time_formats);
  //   }
  //   if (mo && mo.isValid()) {
  //     if (ts && mo.unix() > ts)
  //       node.classList.add('isnew');
  //     else
  //       node.classList.remove('isnew');
  //     last = Math.max(last,mo.unix());
  //   }
  //   else {
  //     if (!unparsable_stamp)
  //       unparsable_stamp = d;
  //     console.log(d + ": INVALID");
  //   }
  // }

  return [last, unparsable_stamp];
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
        with_time_formats(
          function(time_formats) {
            const res = markup (ts, time_formats);
            const last = res[0];
            chrome.runtime.sendMessage({ukey: ukey,
                                        enable: true,
                                        ts: ts,
                                        unparsable_stamp: res[1]});
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
    });
    // not sure if this is still necessary
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
    console.log("Received message", request, "from", sender);
    if (request.ts) {
      console.log("Switching to", request.ts, "=", moment.unix(request.ts).format('YYYY-MM-DD HH:mm'));
      with_time_formats(
        function(time_formats) {
          const res = markup (request.ts, time_formats);
        });
    }
    else if (request.time_string) {
      with_time_formats(
        function(time_formats) {
          const ts = parse_time_string(request.time_string, time_formats);
          console.log("Sending response", ts);
          sendResponse({ts: ts});
        });
      return true; // this will keep sendResponse() active
    }
  });

first_run ();
