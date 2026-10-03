/* Coverage map: shades countries with analysis, opens a panel of articles per country.
   No external requests; data comes from research-data.js and countries.js. */
(function () {
  var svg = document.getElementById("world-map");
  var panel = document.getElementById("map-panel");
  if (!svg || !panel) return;
  var data = (window.TEI_RESEARCH || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  var NAMES = window.TEI_COUNTRIES || {};
  var by = {};
  data.forEach(function (it) { (it.countries || []).forEach(function (c) { (by[c] = by[c] || []).push(it); }); });
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }
  function tier(n) { return !n ? 0 : n === 1 ? 1 : n < 5 ? 2 : n < 10 ? 3 : 4; }
  var shapes = {};
  Array.prototype.forEach.call(svg.querySelectorAll("[data-iso]"), function (el) {
    var iso = el.getAttribute("data-iso"), n = (by[iso] || []).length;
    if (!NAMES[iso]) NAMES[iso] = el.getAttribute("data-name");
    el.setAttribute("class", el.getAttribute("class").replace(/\bt\d\b/, "t" + tier(n)));
    (shapes[iso] = shapes[iso] || []).push(el);
    if (n) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-pressed", "false");
      el.setAttribute("aria-label", NAMES[iso] + ", " + n + (n === 1 ? " article" : " articles"));
      var t = document.createElementNS("http://www.w3.org/2000/svg", "title"); t.textContent = NAMES[iso] + " (" + n + ")"; el.appendChild(t);
      el.addEventListener("click", function () { select(iso, false); });
      el.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); select(iso, true); }
      });
    } else {
      el.setAttribute("aria-hidden", "true");
    }
  });
  var current = null;
  function select(iso, moveFocus) {
    var items = by[iso] || [];
    if (!items.length) return;
    if (current && shapes[current]) shapes[current].forEach(function (el) { el.classList.remove("is-selected"); el.setAttribute("aria-pressed", "false"); });
    current = iso;
    (shapes[iso] || []).forEach(function (el) { el.classList.add("is-selected"); el.setAttribute("aria-pressed", "true"); if (el.parentNode) el.parentNode.appendChild(el); });
    var name = NAMES[iso] || iso;
    panel.innerHTML = '<p class="map-panel__kicker">Country</p><h2 class="map-panel__title" id="map-panel-title">' + esc(name) + '</h2>' +
      '<p class="map-panel__count">' + items.length + (items.length === 1 ? " article" : " articles") + ', newest first</p>' +
      '<ol class="map-articles">' + items.map(function (it) {
        return '<li><a href="' + esc(it.href) + '">' + esc(it.title) + '</a> <time datetime="' + esc(it.date) + '">' + esc(it.dateDisplay) + '</time></li>';
      }).join("") + '</ol>' +
      '<p class="map-panel__all"><a href="research.html?country=' + iso + '">View all ' + esc(name) + ' research</a></p>';
    Array.prototype.forEach.call(document.querySelectorAll(".country-list button"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-iso") === iso ? "true" : "false");
    });
    try { history.replaceState(null, "", "map.html?country=" + iso); } catch (e) {}
    if (moveFocus) { panel.focus({ preventScroll: true }); }
    if (moveFocus || window.matchMedia("(max-width: 63.99rem)").matches) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  // country list with search
  var list = document.getElementById("country-list");
  var search = document.getElementById("country-search");
  var isos = Object.keys(by).sort(function (a, b) { return (NAMES[a] || a).localeCompare(NAMES[b] || b); });
  if (list) {
    list.innerHTML = isos.map(function (iso) {
      return '<li><button type="button" data-iso="' + iso + '" aria-pressed="false">' + esc(NAMES[iso] || iso) +
        ' <span class="country-list__n">' + by[iso].length + '</span></button></li>';
    }).join("");
    list.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-iso]"); if (b) select(b.getAttribute("data-iso"), true);
    });
  }
  if (search) {
    search.hidden = false;
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      Array.prototype.forEach.call(list.querySelectorAll("li"), function (li) {
        li.hidden = q && li.textContent.toLowerCase().indexOf(q) === -1;
      });
    });
  }
  var q = null; try { q = new URLSearchParams(window.location.search).get("country"); } catch (e) {}
  if (q) select(String(q).toUpperCase().slice(0, 2), false);
})();
