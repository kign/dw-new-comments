'use strict'

console.log("options.js");

function _write (details) {
  document.forms.options.comment_css.value = details.comment_css;
  document.forms.options.time_formats.value = details.time_formats;
}

function _read () {
  return {
    comment_css: document.forms.options.comment_css.value,
    time_formats: document.forms.options.time_formats.value
  }
}

function save_options(evt) {
  evt.preventDefault();
  chrome.runtime.sendMessage(
    {get_default: true}, function(response) {
      let opts = _read();
      for (let k in response)
        if (k.endsWith('_ver'))
          opts[k] = response[k];
      chrome.storage.sync.set(opts,
        function() {
          var status = document.getElementById('status');
          status.textContent = 'Options saved.';
          setTimeout(function() {
            status.textContent = '';
          }, 1200);
        });
    });
}

function restore_options() {
  chrome.runtime.sendMessage(
    {get_default: true}, function(response) {
      console.log("Got response", response);
      chrome.storage.sync.get(response,
        function(items) {
          let res = {};
          for (let k in response) {
            if (!k.endsWith('_ver') && response[k + "_ver"] > items[k + "_ver"])
                res[k] = response[k];
            else
                res[k] = items[k];
          }
          _write(res);
        });
    });
}

function restore_default() {
  chrome.runtime.sendMessage(
    {get_default: true}, function(response) {
      console.log("Get response", response);
        _write(response);
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.forms.options.addEventListener('submit', save_options);
document.getElementById('restore').addEventListener('click', restore_default);
document.getElementById('undo').addEventListener('click', restore_options);
