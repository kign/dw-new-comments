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

function xpath_do(elm, xp, action) {
  let result = document.evaluate(xp, elm, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

  for (let ii=0 ; ii < result.snapshotLength; ii ++ )
    action(result.snapshotItem(ii), ii);
}
