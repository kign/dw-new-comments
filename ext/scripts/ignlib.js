'use strict'

function makeElm (tag, attrs, ...children) {
  let node = document.createElement(tag);

  if (attrs) {
    for (let k in attrs)
      node.setAttribute(k, attrs[k]);
  }

  for (let c of children) {
    if (typeof c == "string")
      node.appendChild(document.createTextNode(c));
    else
      node.appendChild(c);
  }

  return node;
}
