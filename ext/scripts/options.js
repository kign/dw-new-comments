'use strict'

console.log("options.js");

function save_options(evt) {
  evt.preventDefault();
  const comment_css = document.forms.options.comment_css.value;
  chrome.storage.sync.set({
    comment_css: comment_css
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.runtime.sendMessage(
    {get_default: true}, function(response) {
      console.log("Get response", response);
      chrome.storage.sync.get(
          {comment_css: response.comment_css},
      function(items) {
        document.forms.options.comment_css.value = items.comment_css;
      });
    });
}

function restore_default() {
  chrome.runtime.sendMessage(
    {get_default: true}, function(response) {
      console.log("Get response", response);
        document.forms.options.comment_css.value = response.comment_css;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.forms.options.addEventListener('submit', save_options);
document.getElementById('restore').addEventListener('click', restore_default);
document.getElementById('undo').addEventListener('click', restore_options);
