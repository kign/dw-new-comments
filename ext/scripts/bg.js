'use strict'

chrome.runtime.onMessage.addListener(function(req, sender) {
  //chrome.storage.local.set({address: req.address})
  chrome.pageAction.show(sender.tab.id);
  //chrome.pageAction.setTitle({tabId: sender.tab.id, title: req.address});
});
