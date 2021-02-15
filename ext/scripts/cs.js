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
          if (x1 !== '')
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
  if (ma[2] === "local")
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
  const span_a = document.evaluate(xp_ts_span, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

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
        unparsable_stamp = node.textContent;
      console.log(node.textContent + ": INVALID");
    }
  }

  return [last, unparsable_stamp];
}

function eligible_url() {
  const host = document.location.hostname;
  const path = document.location.pathname;
  const pars = document.location.search;

  let m = RegExp("^([a-z0-9-]+).dreamwidth.org$").exec(host);
  if (!m)
    return null;
  let uname = m[1];

  m = RegExp("^/([0-9]+).html$").exec(path);
  if (!m)
    return null;
  let postid = m[1];

  let page = 1;
  if (pars) {
    let query = pars.substr(1);
    for (let part of query.split("&")) {
      const item = part.split("=");
      const k = item[0];
      const v = decodeURIComponent(item[1]);
      if (k === 'page')
        page = parseInt(v);
      else if (!['nc','style','posted','view'].includes(k))
        return null;
    }
  }
  if (page === 1)
    return `${uname}_${postid}`;
  else
    return `${uname}_${postid}_${page}`;
}

function first_run () {
  const ukey = eligible_url ();
  if (ukey) {
    console.log("enabled");

    chrome.storage.local.get({[ukey] : []}, // new syntax for Object literals
      function(saved) {
        console.log("Retrieved", ukey, "=>", saved);
        let cur = saved[ukey].slice(); // this makes a shallow copy
        let ts = cur? cur[cur.length-1]: null;
        with_time_formats(
          function(time_formats) {
            const [last, unparsable_stamp] = markup (ts, time_formats);
            const ptype = (last === 0)?                     "empty"    :
                           ((cur.length === 0)?             "new"      :
                           ((cur[cur.length - 1] === last)? "same"     :
                                                           "updated"  ));
            chrome.runtime.sendMessage({ukey: ukey,
                                        enable: 'enable',
                                        ts: ts,
                                        ptype: ptype,
                                        unparsable_stamp: unparsable_stamp});
            console.log("cur =", cur, ", last =", last, ", ptype =", ptype);
            if (last > 0 && !(cur.length > 0 && cur[cur.length - 1] === last)) {
              cur.push(last);
              chrome.storage.local.set({[ukey] : cur},
                function() {
                  const error = chrome.runtime.lastError;
                  if (error) {
                    alert(error.message);
                  }
                  console.log("Saved", ukey, '=>', cur);
                });
            }
      });
    });
    // not sure if this is still necessary
    document.onvisibilitychange = function() {
      console.log("url =", document.location.href + "; visible =", !document.hidden);
        // TODO: this yields error
        //  -> Uncaught Error: Extension context invalidated <-
      chrome.runtime.sendMessage({ukey: ukey, visible: !document.hidden});
    }
  }
  else {
    chrome.runtime.sendMessage({enable: 'disable', url: document.location.href});
    console.log("This page is NOT a valid comments page");
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Received message", request, "from", sender);
    if (request.ts) {
      console.log("Switching to", request.ts, "=", moment.unix(request.ts).format('YYYY-MM-DD HH:mm'));
      with_time_formats(
        function(time_formats) {
          const [last, unparsable_stamp] = markup (request.ts, time_formats);
          console.log("markup returned: last =", last, ", unparsable_stamp =", unparsable_stamp);
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
