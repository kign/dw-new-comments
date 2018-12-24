'use strict';

function update () {
  // XPath doc:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_using_XPath_in_JavaScript
  var xp_ts_span = "//span[@class='datetime']/span[@title]";
  var span_a = document.evaluate(xp_ts_span, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);

  for (var ii=0 ; ii < span_a.snapshotLength; ii ++ ) {
    var node = span_a.snapshotItem(ii);
    node.classList.add('isnew');
    var d = node.textContent;
    var m = moment(d,["dddd, MMMM Do gggg HH:mm", "YYYY-MM-DD HH:mm"]);
    if (m.isValid())
      console.log(d + " ==> " + m.format());
    else
      console.log(d + ": INVALID");
  }

  // var node = iter_span.iterateNext();
  // while (node) {
  //   nodes.push(node);
  //   node.classList.add('isnew');
  //   var d = node.textContent;
  //   var m = moment(d,["dddd, MMMM Do gggg HH:mm", "YYYY-MM-DD HH:mm"]);
  //   if (m.isValid())
  //     console.log(d + " ==> " + m.format());
  //   else
  //     console.log(d + ": INVALID");
  //   node = iter_span.iterateNext();
  // }

}

update ();
