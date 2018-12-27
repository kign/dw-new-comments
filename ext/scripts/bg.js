'use strict'

chrome.runtime.onMessage.addListener(function(req, sender) {
  //chrome.storage.local.set({address: req.address})
  if (req.enable || req.visible) {
    console.log("show(" + sender.tab.id + ", " + req.ukey + ")" );
    chrome.pageAction.show(sender.tab.id);
    localStorage.ukey = req.ukey;
    localStorage.tabid = sender.tab.id;
    if (req.ts)
      localStorage[req.ukey] = req.ts;
    chrome.pageAction.setIcon({tabId: sender.tab.id, path : 'icons/icon_128_green.png'});
  }
  else {
    console.log("hide(" + sender.tab.id + ", " + (req.ukey||req.url) + ")" );
    chrome.pageAction.setIcon({tabId: sender.tab.id, path : 'icons/icon_128_red.png'});
    chrome.pageAction.hide(sender.tab.id);
  }
  //chrome.pageAction.setTitle({tabId: sender.tab.id, title: req.address});
});
