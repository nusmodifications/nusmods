/* jshint ignore:start */
'use strict';
var DISQUSWIDGETS, disqus_domain, disqus_shortname;
typeof DISQUSWIDGETS === 'undefined' && (DISQUSWIDGETS = function () {
  var c = {};
  var n = document.getElementsByTagName('HEAD')[0] || document.body;
  var i = {};
  var m = {
    identifier: 1,
    url: 2
  };
  c.domain = 'disqus.com';
  c.forum = '';
  c.getCount = function () {
    i = {};
    var a = encodeURIComponent;
    var b = document.getElementsByTagName('span');
    var d = [];
    var g = 0;
    var j = 10;
    var o = document.location.protocol + '//' + c.forum + '.' + c.domain + '/count-data.js?';
    var l;

    for (var h, e, f, k = 0; k < b.length; k++) {
      h = b[k];
      e = h.getAttribute('data-disqus-identifier');
      f = h.hash === '#disqus_thread' && h.href.replace('#disqus_thread', '');
      if (e) {
        f = m.identifier;
      } else if (f) {
        e = f;
        f = m.url;
      } else {
        continue;
      }
      i.hasOwnProperty(e) ? l = i[e] : (l = i[e] = {elements: [],type: f}, d.push(a(f) + '=' + a(e)));
      l.elements.push(h);
    }
    d.sort();

    for (a = d.slice(g, j); a.length; ) {
      b = document.createElement('script');
      b.async = !0;
      b.src = o + a.join('&');
      n.appendChild(b);
      g += 10;
      j += 10;
      a = d.slice(g, j);
    }
  };
  c.displayCount = function (a) {
    for (var b, c, d, g = a.counts, a = a.text.comments; b = g.shift(); ) {
      if (c = i[b.id]) {
        switch (b.comments) {
          case 0:
          d = a.zero;
          break;
          case 1:
          d = a.one;
          break;
          default:
          d = a.multiple;
        }
        b = d.replace('{num}', b.comments);
        c = c.elements;
        for (d = c.length - 1; d >= 0; d--) {
          c[d].innerHTML = b;
        }
      }
    }
  };
  return c;
}());
