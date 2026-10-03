/* Home newsroom: renders lead, latest, desks and news from data files.
   Static markup in index.html is a snapshot; this keeps it current. */
(function () {
  var DESKS = [
    ["pakistan", "Pakistan"], ["united-states", "United States"], ["china", "China"],
    ["india", "India"], ["middle-east", "Middle East"], ["europe", "Europe"],
    ["africa", "Africa"], ["global", "Global"], ["other-markets", "Other markets"]
  ];
  var LABEL = {}; DESKS.forEach(function (d) { LABEL[d[0]] = d[1]; });
  var data = (window.TEI_RESEARCH || []).slice().sort(function (a, b) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }
  function desk(item) { var d = item.desk || item.region; return LABEL[d] ? d : "other-markets"; }
  function deskLink(d) { return '<a class="kicker" href="research.html?desk=' + d + '">' + esc(LABEL[d]) + '</a>'; }
  function img(d, w, alt) {
    var b = "assets/desks/" + d;
    return '<picture><source type="image/webp" srcset="' + b + '-640.webp 640w, ' + b + '-1024.webp 1024w" sizes="' + w + '">' +
      '<img src="' + b + '-1024.jpg" srcset="' + b + '-640.jpg 640w, ' + b + '-1024.jpg 1024w" sizes="' + w + '" width="1024" height="576" alt="' + esc(alt) + '" loading="lazy" decoding="async"></picture>';
  }
  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; return el; }
  if (data.length) {
    var lead = data[0], d0 = desk(lead);
    set("lead-story",
      '<a class="lead__media" href="' + esc(lead.href) + '" tabindex="-1" aria-hidden="true">' + img(d0, "(min-width: 64rem) 720px, 100vw", "").replace('loading="lazy"', 'loading="eager" fetchpriority="high"') + '</a>' +
      '<div class="lead__body">' + deskLink(d0) +
      '<h2 class="lead__title"><a href="' + esc(lead.href) + '">' + esc(lead.title) + '</a></h2>' +
      '<p class="meta"><time datetime="' + esc(lead.date) + '">' + esc(lead.dateDisplay) + '</time></p></div>');
    set("latest-list", data.slice(1, 7).map(function (it) {
      return '<li class="latest__item">' + deskLink(desk(it)) +
        '<h3 class="latest__title"><a href="' + esc(it.href) + '">' + esc(it.title) + '</a></h3>' +
        '<p class="meta"><time datetime="' + esc(it.date) + '">' + esc(it.dateDisplay) + '</time></p></li>';
    }).join(""));
    var pool = data.slice(7), seen = {}, used = {}, cards = [];
    pool.forEach(function (it) {
      var d = desk(it); if (seen[d]) return; seen[d] = 1; used[it.href] = 1; cards.push([d, it]);
    });
    cards.sort(function (a, b) { return DESKS.findIndex(function (x) { return x[0] === a[0]; }) - DESKS.findIndex(function (x) { return x[0] === b[0]; }); });
    var target = Math.max(3, Math.ceil(cards.length / 3) * 3);
    pool.forEach(function (it) { if (cards.length < target && !used[it.href]) { used[it.href] = 1; cards.push([desk(it), it]); } });
    set("desk-cards", cards.map(function (c) {
      var it = c[1];
      return '<li class="card"><a class="card__media" href="' + esc(it.href) + '" tabindex="-1" aria-hidden="true">' + img(c[0], "(min-width: 64rem) 360px, (min-width: 40rem) 50vw, 100vw", "") + '</a>' +
        deskLink(c[0]) + '<h3 class="card__title"><a href="' + esc(it.href) + '">' + esc(it.title) + '</a></h3>' +
        '<p class="meta"><time datetime="' + esc(it.date) + '">' + esc(it.dateDisplay) + '</time></p></li>';
    }).join(""));
  }
  var news = (window.TEI_NEWS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var newsSec = document.getElementById("latest-news");
  if (newsSec && news.length) {
    set("news-list", news.slice(0, 5).map(function (n) {
      var d = LABEL[n.desk] ? n.desk : null;
      return '<li class="news-row">' + (d ? deskLink(d) : "") +
        '<h3 class="news-row__title"><a href="' + esc(n.href) + '">' + esc(n.title) + '</a></h3>' +
        '<p class="meta"><time datetime="' + esc(n.date) + '">' + esc(n.dateDisplay || n.date) + '</time>' +
        (n.sourceUrl ? ' · Source: <a href="' + esc(n.sourceUrl) + '" rel="noopener">' + esc(n.sourceName || "public source") + '</a>' : "") + '</p></li>';
    }).join(""));
    newsSec.hidden = false;
  }
})();
