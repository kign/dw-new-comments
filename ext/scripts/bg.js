'use strict'
const default_options = {
  time_formats:
`dddd, MMMM Do YYYY HH:mm
YYYY-MM-DD hh:mm a
YYYY-MM-DD HH:mm`,
  time_formats_ver: 2,

  comment_css:
`span.isnew {
  color: red;
}
span.isnew::after {
  content: " new comment";
  color: black;
  background-color: yellow;
  font-variant: small-caps;
}`,
 comment_css_ver: 1};

chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
  if (req.get_default) {
    console.log("Sending defaults", default_options);
    sendResponse(default_options);
  }
  else if (req.enable || req.visible) {
    console.log("show(" + sender.tab.id + ", " + req.ukey + ")" );
    chrome.pageAction.show(sender.tab.id);
    localStorage.ukey = req.ukey;
    localStorage.tabid = sender.tab.id;
    if (req.ts)
      localStorage[req.ukey] = req.ts;
    chrome.pageAction.setTitle({tabId: sender.tab.id, title: "Click for more control"});
    if (req.enable) {
      const icon = req.unparsable_stamp?      'icons/icon_128_err.png'    :
                   ((req.ptype == 'empty')?   'icons/icon_128_empty.png'  :
                   ((req.ptype == 'new')?     'icons/icon_128_2dots.png'  :
                   ((req.ptype == 'same')?    'icons/icon_128_green.png'  :
                   ((req.ptype == 'updated')? 'icons/icon_128_red_dot.png':
                                             'icons/icon_128_err.png'     ))));

      chrome.pageAction.setIcon({tabId: sender.tab.id, path : icon});
      localStorage.unparsable_stamp = req.unparsable_stamp;
      chrome.storage.sync.get(
          {comment_css: default_options.comment_css,
           comment_css_ver: default_options.comment_css_ver},
      function(items) {
        console.log("injected", items.comment_css);
        const comment_css = (default_options.comment_css_ver > items.comment_css_ver)? default_options.comment_css : items.comment_css;
        chrome.tabs.insertCSS(sender.tab.id, {code: comment_css});
      });
    }
  }
  else {
    console.log("hide(" + sender.tab.id + ", " + (req.ukey||req.url) + ")" );
    chrome.pageAction.setIcon({tabId: sender.tab.id, path : 'icons/icon_128_na.png'});
    chrome.pageAction.hide(sender.tab.id);
    chrome.pageAction.setTitle({tabId: sender.tab.id, title: "Not available at this URL"});
  }
});
