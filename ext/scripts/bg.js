'use strict'

const default_options = {
  time_formats:
`dddd, MMMM Do gggg HH:mm
YYYY-MM-DD HH:mm`,
  comment_css:
`span.isnew {
  color: red;
}
span.isnew::after {
  content: " new comment";
  color: black;
  background-color: yellow;
  font-variant: small-caps;
}`};

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
    chrome.pageAction.setIcon({tabId: sender.tab.id, path : 'icons/icon_128_green.png'});
    chrome.pageAction.setTitle({tabId: sender.tab.id, title: "Click for more control"});
    if (req.enable) {
      chrome.storage.sync.get(
          {comment_css: default_options.comment_css},
      function(items) {
        console.log("injected", items.comment_css);
        chrome.tabs.insertCSS(sender.tab.id, {code: items.comment_css});
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
