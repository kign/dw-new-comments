'use strict'

// Ordinarely, when creating a text element with an HTML entity such as
// "&npsp;" method createTextNode doesn't interpret entities, so "&npsp;"
// would be text you get
// Thus we are using innerHTML when the only argument is text
// makeElm('DIV', {}, "&nbsp;") will create DIV with space
// makeElm('DIV', {}, "", "&nbsp;") will create DIV with text "&nbsp;"
function makeElm (tag, attrs, ...children) {
  let node = document.createElement(tag);

  if (attrs) {
    for (let k in attrs)
      node.setAttribute(k, attrs[k]);
  }

  if (children.length == 1 && typeof children[0] == "string")
    node.innerHTML = children[0];
  else
    appendChildren (node, ...children);

//  console.log("returning", node);
  return node;
}

function appendChildren(node, ...children) {
  for (let c of children)
    if (typeof c == "string" || typeof c == "number")
      node.appendChild(document.createTextNode(c));
    else
      node.appendChild(c);
}

function makeSVGElm (tag, attrs, ...children) {
  const ns = "http://www.w3.org/2000/svg";
  let node = document.createElementNS(ns, tag);

  for (let k in attrs)
    node.setAttribute(k, attrs[k]);

  appendChildren (node, ...children);
  return node;
}

function eraseChildren(node) {
  while (node.firstChild)
    node.removeChild(node.firstChild);
}

function xpath_do(elm, xp, action) {
  let result = document.evaluate(xp, elm, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

  for (let ii=0 ; ii < result.snapshotLength; ii ++ )
    action(result.snapshotItem(ii), ii);
}
