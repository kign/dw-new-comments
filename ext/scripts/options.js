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
  chrome.storage.sync.set(_read(),
    function() {
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 1200);
    });
}

function restore_options() {
  chrome.runtime.sendMessage(
    {get_default: true}, function(response) {
      console.log("Get response", response);
      chrome.storage.sync.get(response,
          //{comment_css: response.comment_css},
      function(items) {
        _write(items);
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
