'use strict'

chrome.runtime.onMessage.addListener(function(req, sender) {
  //chrome.storage.local.set({address: req.address})
  if (req.enable)
    chrome.pageAction.show(sender.tab.id);
  else
    chrome.pageAction.hide(sender.tab.id);
  //chrome.pageAction.setTitle({tabId: sender.tab.id, title: req.address});
});
