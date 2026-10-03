(function () {
  var data = window.TEI_RESEARCH || [];
  var list = document.getElementById("research-results");
  var statusEl = document.getElementById("filter-status");
  if (!list) return;
  var TEI_DESKS = {"pakistan": "Pakistan", "united-states": "United States", "china": "China", "india": "India", "middle-east": "Middle East", "europe": "Europe", "africa": "Africa", "global": "Global", "other-markets": "Other markets"};
  function deskLabel(item) { return TEI_DESKS[item.region] || item.regionLabel; }

  function checkedValues(name) {
    return Array.prototype.map
      .call(document.querySelectorAll('input[name="' + name + '"]:checked'), function (el) {
        return el.value;
      });
  }

  function applyQueryFilters() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (err) {
      return;
    }
    ["year", "region", "desk", "author"].forEach(function (name) {
      var raw = params.getAll(name);
      if (!raw.length) {
        var single = params.get(name);
        if (single) raw = [single];
      }
      if (!raw.length) return;
      var wanted = {};
      raw.forEach(function (v) {
        String(v)
          .split(",")
          .forEach(function (part) {
            part = part.trim().toLowerCase();
            if (part) wanted[part] = true;
          });
      });
      document.querySelectorAll('input[name="' + (name === "desk" ? "region" : name) + '"]').forEach(function (input) {
        if (wanted[String(input.value).toLowerCase()]) {
          input.checked = true;
        }
      });
    });
  }

  function matches(item, years, regions, authors) {
    if (years.length && years.indexOf(item.year) === -1) return false;
    if (regions.length && regions.indexOf(item.region) === -1) return false;
    if (authors.length && authors.indexOf(item.authorSlug) === -1) return false;
    return true;
  }

  function render() {
    var years = checkedValues("year");
    var regions = checkedValues("region");
    var authors = checkedValues("author");
    var visible = data.filter(function (item) {
      return matches(item, years, regions, authors);
    });

    list.innerHTML = "";
    if (!visible.length) {
      var empty = document.createElement("li");
      empty.className = "research-list__empty";
      empty.textContent =
        data.length === 0
          ? "No published research yet. See Contact for office details."
          : "No articles match the selected filters.";
      list.appendChild(empty);
    } else {
      visible.forEach(function (item) {
        var li = document.createElement("li");
        li.className = "research-card";
        li.setAttribute("data-year", item.year);
        li.setAttribute("data-region", item.region);
        li.setAttribute("data-author", item.authorSlug);

        var desk = document.createElement("p");
        desk.className = "research-card__desk";
        desk.textContent = deskLabel(item);

        var h3 = document.createElement("h3");
        h3.className = "research-card__title";
        var a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.title;
        h3.appendChild(a);

        var meta = document.createElement("p");
        meta.className = "research-card__meta";
        var date = document.createElement("span");
        date.className = "research-card__date";
        date.textContent = item.dateDisplay;
        var byline = document.createElement("span");
        byline.className = "research-card__byline";
        byline.textContent = " · " + item.author;
        meta.appendChild(date);
        meta.appendChild(byline);

        li.appendChild(desk);
        li.appendChild(h3);
        li.appendChild(meta);
        list.appendChild(li);
      });
    }

    if (statusEl) {
      var bits = [];
      if (years.length) bits.push("year");
      if (regions.length) bits.push("region");
      if (authors.length) bits.push("author");
      if (data.length === 0) {
        statusEl.textContent = "No articles in the index yet.";
      } else if (visible.length === 0) {
        statusEl.textContent =
          "No articles match the selected filters. " + data.length + " articles in the index.";
      } else {
        statusEl.textContent =
          "Showing " +
          visible.length +
          " of " +
          data.length +
          " articles" +
          (bits.length ? ", filtered by " + bits.join(", ") : "") +
          ".";
      }
    }
  }

  applyQueryFilters();

  document.querySelectorAll(".research-filters input[type='checkbox']").forEach(function (input) {
    input.disabled = false;
    input.addEventListener("change", render);
  });

  render();
})();
