/* ==========================================================================
   Dashboard windows: progressive enhancement for the homepage graph windows.
   See assets/css/dashboard.css for the overview.

   Rules this file keeps:
   - Every number a chart draws is read from a table in index.html. Edit the
     table text to update a chart; there is no second copy of the data here.
   - Without this file the tables, the payment schedule, the checklist and
     every WhatsApp link still work. Enhanced parts carry `hidden` in the
     HTML and are revealed here.
   - No network requests, no cookies. The 7-sign answers are kept in
     localStorage on the visitor's own device so they survive a dropped
     connection or a reload; nothing is sent anywhere.
   - Text from the page goes into charts with textContent, never innerHTML.
   ========================================================================== */
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var WA_NUMBER = '27695326613';
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* One number format for the whole dashboard.
     The approved page copy writes Rand as "R4,500". Intl with 'en-ZA' gives
     "R 4 500", which would clash with the copy beside it, so grouping follows
     the page until the Build Owner decides (flag F-05). Change it here only. */
  var NUM = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });
  function fmt(n) { return NUM.format(Math.round(n)); }
  function rand(n) { return 'R' + fmt(n); }
  function compact(n) {
    var a = Math.abs(n);
    if (a >= 1e6) return trimDec(n / 1e6) + 'M';
    if (a >= 1e3) return trimDec(n / 1e3) + 'K';
    return fmt(n);
  }
  function trimDec(x) { return Math.abs(x) >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10); }
  function toNumber(text) {
    var digits = String(text || '').replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : NaN;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  var WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  function countWord(n) { return WORDS[n] || String(n); }

  function svg(name, attrs, parent) {
    var node = document.createElementNS(SVGNS, name);
    if (attrs) Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(node);
    return node;
  }
  function svgText(parent, x, y, text, attrs) {
    var t = svg('text', Object.assign({ x: x, y: y }, attrs || {}), parent);
    t.textContent = text;
    return t;
  }
  function html(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function niceStep(max, count) {
    if (max <= 0) return 1;
    var raw = max / count;
    var p = Math.pow(10, Math.floor(Math.log10(raw)));
    var f = raw / p;
    var nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return nice * p;
  }
  function waLink(message) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
  }
  function reveal(scope) {
    scope.querySelectorAll('[data-db-enhanced]').forEach(function (n) { n.hidden = false; });
    scope.querySelectorAll('details[data-db-numbers]').forEach(function (d) { d.open = false; });
  }
  function hatchPattern(svgRoot) {
    var defs = svg('defs', null, svgRoot);
    var pat = svg('pattern', { id: 'db-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    svg('rect', { width: 6, height: 6, class: 'db-hatch-bg' }, pat);
    svg('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'db-hatch-ink' }, pat);
  }

  /* Width of a plot box; charts are drawn at real pixel size so 14px text stays 14px. */
  function plotWidth(plot) { return Math.max(260, Math.round(plot.getBoundingClientRect().width || plot.clientWidth || 320)); }

  /* Redraw on resize (one frame at a time). */
  function onResize(plot, draw) {
    var last = 0, queued = false;
    function run() {
      queued = false;
      var w = plotWidth(plot);
      if (w !== last) { last = w; draw(); }
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(plot);
    } else {
      window.addEventListener('resize', function () { if (!queued) { queued = true; requestAnimationFrame(run); } });
    }
  }

  /* Draw-in once, when the plot first scrolls into view. Skipped under reduced motion. */
  function drawInOnce(target) {
    if (reduceMotion || target.dataset.dbDrawn) return;
    target.dataset.dbDrawn = '1';
    target.querySelectorAll('.db-line').forEach(function (p) {
      if (p.getTotalLength) p.style.setProperty('--db-len', Math.ceil(p.getTotalLength()));
    });
    target.classList.add('is-drawing');
    function go() {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          target.classList.add('is-drawn');
          target.classList.remove('is-drawing');
        });
      });
    }
    if (!('IntersectionObserver' in window)) { go(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
    }, { threshold: 0.3 });
    io.observe(target);
  }

  /* ---------- Tooltip (one per plot) ---------- */
  function makeTooltip(plot) {
    var tip = html('div', 'db-tooltip');
    tip.setAttribute('aria-hidden', 'true');
    plot.appendChild(tip);
    return {
      show: function (head, rows, x, y) {
        tip.textContent = '';
        tip.appendChild(html('p', 'db-tooltip__head', head));
        rows.forEach(function (r) {
          var row = html('p', 'db-tooltip__row');
          if (r.key) row.appendChild(html('span', 'db-tooltip__key db-tooltip__key--' + r.key));
          row.appendChild(html('strong', null, r.value));
          row.appendChild(document.createTextNode(' ' + r.label));
          tip.appendChild(row);
        });
        var pw = plot.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
        var left = x + 14;
        if (left + tw > pw) left = x - tw - 14;
        tip.style.left = clamp(left, 0, Math.max(0, pw - tw)) + 'px';
        tip.style.top = clamp(y - th / 2, 0, Math.max(0, plot.clientHeight - th)) + 'px';
        tip.classList.add('is-on');
      },
      hide: function () { tip.classList.remove('is-on'); }
    };
  }

  /* Keyboard and pointer reading for charts with one value per position.
     opts.count, opts.indexAt(xPx), opts.focus(i) -> {head, rows, x, y, speak}, opts.clear() */
  function readable(plot, readout, opts) {
    var tip = makeTooltip(plot);
    var current = -1;
    function show(i) {
      current = i;
      var info = opts.focus(i);
      tip.show(info.head, info.rows, info.x, info.y);
      return info;
    }
    function hide() { current = -1; tip.hide(); opts.clear(); }
    plot.addEventListener('pointermove', function (e) {
      var r = plot.getBoundingClientRect();
      show(opts.indexAt(e.clientX - r.left));
    });
    plot.addEventListener('pointerleave', hide);
    plot.addEventListener('focus', function () {
      var info = show(current >= 0 ? current : opts.start());
      if (readout) readout.textContent = info.speak;
    });
    plot.addEventListener('blur', hide);
    plot.addEventListener('keydown', function (e) {
      var i = current >= 0 ? current : opts.start();
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') i = Math.min(opts.count() - 1, i + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') i = Math.max(0, i - 1);
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = opts.count() - 1;
      else if (e.key === 'Escape') { hide(); return; }
      else return;
      e.preventDefault();
      var info = show(i);
      if (readout) readout.textContent = info.speak;
    });
    return { refresh: function () { if (current >= 0) show(Math.min(current, opts.count() - 1)); } };
  }

  /* ======================================================================
     Window 01: once-off vs monthly
     ====================================================================== */
  function initCost(win) {
    var tool = win.querySelector('[data-cost-tool]');
    var scheduleRows = win.querySelectorAll('[data-cost-schedule] tbody tr[data-day]');
    if (!tool || !scheduleRows.length) return;

    var stages = [];
    scheduleRows.forEach(function (row) {
      var amountCell = row.querySelector('[data-amount]');
      var amount = amountCell ? toNumber(amountCell.textContent) : NaN;
      var day = parseFloat(row.getAttribute('data-day'));
      if (isFinite(amount) && isFinite(day)) stages.push({ month: day / 30, day: day, amount: amount });
    });
    stages.sort(function (a, b) { return a.month - b.month; });
    var onceTotal = stages.reduce(function (s, st) { return s + st.amount; }, 0);
    var lastStage = stages[stages.length - 1];

    var input = tool.querySelector('[data-cost-input]');
    var error = tool.querySelector('[data-cost-error]');
    var chips = tool.querySelectorAll('[data-amount-preset]');
    var radios = tool.querySelectorAll('input[name="cost-horizon"]');
    var plot = tool.querySelector('[data-cost-plot]');
    var summary = tool.querySelector('[data-cost-summary]');
    var readout = tool.querySelector('[data-cost-readout]');
    var tableBody = tool.querySelector('[data-cost-table] tbody');
    var MAX_FEE = toNumber(input.getAttribute('data-max')) || 100000;

    var state = { fee: toNumber(input.value) || 0, horizon: 24, layout: null };
    radios.forEach(function (r) { if (r.checked) state.horizon = parseInt(r.value, 10); });

    function onceAt(m) {
      var s = 0;
      stages.forEach(function (st) { if (st.month <= m + 1e-9) s += st.amount; });
      return s;
    }
    function feeAt(m) { return state.fee * m; }
    function crossMonth() { return state.fee > 0 ? Math.ceil(onceTotal / state.fee) : Infinity; }
    function monthLabel(m) { return m === 0 ? 'Start' : 'Month ' + m; }

    function parseFee(raw) {
      var trimmed = String(raw).trim();
      if (trimmed === '' || !/^\d+$/.test(trimmed)) return NaN;
      var v = parseInt(trimmed, 10);
      return v >= 0 && v <= MAX_FEE ? v : NaN;
    }
    function setError(on) {
      input.setAttribute('aria-invalid', on ? 'true' : 'false');
      error.hidden = !on;
      error.textContent = on ? 'Enter an amount from R0 to ' + rand(MAX_FEE) + ', in whole Rand.' : '';
    }
    function syncChips() {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(toNumber(c.getAttribute('data-amount-preset')) === state.fee)); });
    }

    function writeSummary() {
      summary.textContent = '';
      var H = state.horizon, cm = crossMonth();
      function add(text, strong) { summary.appendChild(strong ? html('strong', null, text) : document.createTextNode(text)); }
      if (state.fee === 0) {
        add('With no monthly fee to compare, the once-off total is ');
        add(rand(onceTotal), true);
        add(', paid in ' + countWord(stages.length) + ' stages by about day ' + lastStage.day + ', then R0 a month.');
        return;
      }
      add('At ');
      add(rand(state.fee) + ' a month', true);
      add(', you pay ');
      add(rand(feeAt(H)), true);
      add(' over ' + H + ' months. The Digital Birth Certificate totals ');
      add(rand(onceTotal), true);
      add(', paid in ' + countWord(stages.length) + ' stages by about day ' + lastStage.day + ', then R0 a month. ');
      if (cm <= H) {
        add('The monthly fee reaches ' + rand(onceTotal) + ' in ');
        add('month ' + cm, true);
        add('.');
      } else {
        add('At this amount the monthly fee would take ' + cm + ' months to reach ' + rand(onceTotal) + '.');
      }
    }

    function writeTable() {
      tableBody.textContent = '';
      var H = state.horizon;
      var months = H === 12 ? [0, 1, 2, 3, 4, 6, 9, 12] : [0, 1, 2, 3, 4, 6, 9, 12, 18, 24];
      var cm = crossMonth();
      if (cm <= H && months.indexOf(cm) === -1) months.push(cm);
      months.sort(function (a, b) { return a - b; });
      months.forEach(function (m) {
        var tr = document.createElement('tr');
        var th = html('th', null, monthLabel(m));
        th.setAttribute('scope', 'row');
        tr.appendChild(th);
        tr.appendChild(html('td', 'db-num', rand(feeAt(m))));
        tr.appendChild(html('td', 'db-num', rand(onceAt(m))));
        tableBody.appendChild(tr);
      });
    }

    function draw() {
      var W = plotWidth(plot);
      var Hpx = W < 480 ? 236 : 288;
      var H = state.horizon;
      var m = { t: 18, r: 14, b: 34, l: 56 };
      var iw = W - m.l - m.r, ih = Hpx - m.t - m.b;
      var yMaxRaw = Math.max(feeAt(H), onceTotal) * 1.12;
      var step = niceStep(yMaxRaw, 4);
      var yMax = Math.ceil(yMaxRaw / step) * step;
      function x(v) { return m.l + (v / H) * iw; }
      function y(v) { return m.t + ih - (v / yMax) * ih; }
      state.layout = { x: x, y: y, m: m, iw: iw, ih: ih, H: H, W: W, Hpx: Hpx };

      var old = plot.querySelector('svg');
      if (old) old.remove();
      var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + Hpx, width: W, height: Hpx, 'aria-hidden': 'true', focusable: 'false' });
      plot.insertBefore(root, plot.firstChild);

      // Grid and y ticks
      for (var v = 0; v <= yMax + 1e-6; v += step) {
        svg('line', { x1: m.l, x2: W - m.r, y1: Math.round(y(v)) + 0.5, y2: Math.round(y(v)) + 0.5, class: v === 0 ? 'db-axis-line' : 'db-grid-line' }, root);
        svgText(root, m.l - 8, y(v) + 5, 'R' + compact(v), { 'text-anchor': 'end' });
      }
      // X ticks
      var xStep = H === 12 ? (iw < 300 ? 6 : 3) : (iw < 300 ? 12 : 6);
      for (var t = 0; t <= H; t += xStep) {
        var label = t === 0 ? 'Start' : t === H ? t + ' mo' : String(t);
        svgText(root, x(t), Hpx - 10, label, { 'text-anchor': t === 0 ? 'start' : t === H ? 'end' : 'middle' });
      }

      // Crossover marker
      var cm = crossMonth();
      if (cm <= H && state.fee > 0) {
        var cx = Math.round(x(cm)) + 0.5;
        svg('line', { x1: cx, x2: cx, y1: m.t, y2: m.t + ih, class: 'db-marker-line' }, root);
        svgText(root, cx + (cm > H * 0.75 ? -6 : 6), m.t + 12, 'Month ' + cm, { 'text-anchor': cm > H * 0.75 ? 'end' : 'start', class: 'db-t-ink' });
      }

      // Monthly fee line (series 2)
      svg('path', { d: 'M' + x(0) + ',' + y(0) + ' L' + x(H) + ',' + y(feeAt(H)), class: 'db-line db-line--s2' }, root);

      // Once-off stepped line (series 1)
      var d = 'M' + x(0) + ',' + y(onceAt(0));
      stages.forEach(function (st, i) {
        if (i === 0 && st.month === 0) return;
        d += ' H' + x(Math.min(st.month, H)) + ' V' + y(onceAt(st.month));
      });
      d += ' H' + x(H);
      svg('path', { d: d, class: 'db-line db-line--s1' }, root);
      stages.forEach(function (st) {
        if (st.month <= H) svg('circle', { cx: x(st.month), cy: y(onceAt(st.month)), r: 4.5, class: 'db-dot db-dot--s1' }, root);
      });

      // Direct end labels, only when they cannot collide (the legend always carries identity)
      var yFee = y(feeAt(H)), yOnce = y(onceTotal);
      if (Math.abs(yFee - yOnce) >= 20) {
        svgText(root, W - m.r, yFee + (yFee < yOnce ? -8 : 18), rand(feeAt(H)), { 'text-anchor': 'end', class: 'db-t-ink' });
        svgText(root, W - m.r, yOnce + (yOnce < yFee ? -8 : 18), rand(onceTotal), { 'text-anchor': 'end', class: 'db-t-ink' });
      }

      // Hover layer
      var g = svg('g', { 'data-hover': '' }, root);
      state.hover = {
        line: svg('line', { x1: 0, x2: 0, y1: m.t, y2: m.t + ih, class: 'db-crosshair', visibility: 'hidden' }, g),
        dot1: svg('circle', { r: 4.5, class: 'db-dot db-dot--s1', visibility: 'hidden' }, g),
        dot2: svg('circle', { r: 4.5, class: 'db-dot db-dot--s2', visibility: 'hidden' }, g)
      };
      if (reader) reader.refresh();
    }

    var reader = readable(plot, readout, {
      count: function () { return state.horizon + 1; },
      start: function () { var cm = crossMonth(); return cm <= state.horizon ? cm : 0; },
      indexAt: function (px) {
        var L = state.layout;
        return clamp(Math.round(((px - L.m.l) / L.iw) * L.H), 0, L.H);
      },
      focus: function (i) {
        var L = state.layout, h = state.hover;
        var px = L.x(i);
        h.line.setAttribute('x1', px); h.line.setAttribute('x2', px); h.line.setAttribute('visibility', 'visible');
        h.dot1.setAttribute('cx', px); h.dot1.setAttribute('cy', L.y(onceAt(i))); h.dot1.setAttribute('visibility', 'visible');
        h.dot2.setAttribute('cx', px); h.dot2.setAttribute('cy', L.y(feeAt(i))); h.dot2.setAttribute('visibility', 'visible');
        var feeText = rand(feeAt(i)), onceText = rand(onceAt(i));
        return {
          head: monthLabel(i),
          rows: [{ key: 's2', value: feeText, label: 'monthly fee' }, { key: 's1', value: onceText, label: 'once-off' }],
          x: px, y: L.y(Math.max(feeAt(i), onceAt(i))),
          speak: monthLabel(i) + ': monthly fee total ' + feeText + ', once-off total ' + onceText + '.'
        };
      },
      clear: function () {
        var h = state.hover;
        if (!h) return;
        h.line.setAttribute('visibility', 'hidden');
        h.dot1.setAttribute('visibility', 'hidden');
        h.dot2.setAttribute('visibility', 'hidden');
      }
    });

    function render() { syncChips(); writeSummary(); writeTable(); draw(); }

    input.addEventListener('input', function () {
      var v = parseFee(input.value);
      if (isFinite(v)) { state.fee = v; if (input.getAttribute('aria-invalid') === 'true') setError(false); render(); }
    });
    input.addEventListener('change', function () {
      var v = parseFee(input.value);
      if (isFinite(v)) { state.fee = v; setError(false); render(); } else { setError(true); }
    });
    input.addEventListener('blur', function () { setError(!isFinite(parseFee(input.value))); });
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        state.fee = toNumber(c.getAttribute('data-amount-preset'));
        input.value = String(state.fee);
        setError(false);
        render();
      });
    });
    radios.forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) { state.horizon = parseInt(r.value, 10); render(); } });
    });

    tool.hidden = false;
    reveal(win);
    render();
    onResize(plot, draw);
    drawInOnce(plot);
  }

  /* ======================================================================
     Window 02: 7-sign check
     ====================================================================== */
  var STORE_KEY = 'wmc-readiness-v1';
  function load() { try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { return []; } }
  function save(ids) { try { window.localStorage.setItem(STORE_KEY, JSON.stringify(ids)); } catch (e) { /* storage blocked: answers just aren't remembered */ } }
  function forget() { try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* nothing stored */ } }

  function ringSegments(container, n) {
    var size = 132, c = size / 2, r = 54, gapDeg = 5;
    var root = svg('svg', { viewBox: '0 0 ' + size + ' ' + size, 'aria-hidden': 'true', focusable: 'false' }, container);
    var segs = [];
    for (var i = 0; i < n; i++) {
      var a0 = (-90 + (360 / n) * i + gapDeg / 2) * Math.PI / 180;
      var a1 = (-90 + (360 / n) * (i + 1) - gapDeg / 2) * Math.PI / 180;
      var d = 'M' + (c + r * Math.cos(a0)) + ',' + (c + r * Math.sin(a0)) +
              ' A' + r + ',' + r + ' 0 0 1 ' + (c + r * Math.cos(a1)) + ',' + (c + r * Math.sin(a1));
      segs.push(svg('path', { d: d, class: 'db-ring__seg' }, root));
    }
    return segs;
  }

  function initReadiness(form) {
    var boxes = Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]'));
    var panel = form.querySelector('[data-score]');
    var ringBox = form.querySelector('[data-score-ring]');
    var numEl = form.querySelector('[data-score-num]');
    var textEl = form.querySelector('[data-score-text]');
    var nextEl = form.querySelector('[data-score-next]');
    var cta = form.querySelector('[data-readiness-cta]');
    var reset = form.querySelector('[data-readiness-reset]');
    if (!boxes.length || !panel) return;
    var total = boxes.length;
    var segs = ringSegments(ringBox, total);

    var saved = load();
    boxes.forEach(function (b) { if (saved.indexOf(b.id) !== -1) b.checked = true; });

    function update(persist) {
      var on = boxes.filter(function (b) { return b.checked; });
      var n = on.length;
      segs.forEach(function (s, i) { s.classList.toggle('is-on', i < n); });
      numEl.textContent = String(n);
      textEl.textContent = '';
      textEl.appendChild(html('strong', null, n + ' of ' + total + ' in place. '));
      var tier;
      if (n === total) tier = 'A strong foundation. A free DPA can confirm nothing is slipping.';
      else if (n >= 5) tier = 'A strong base with a gap or two to close.';
      else if (n >= 3) tier = 'A good start, with gaps worth fixing.';
      else tier = 'Customers may struggle to find or trust you online. A free DPA shows what to fix first.';
      textEl.appendChild(document.createTextNode(tier));
      var firstGap = boxes.filter(function (b) { return !b.checked; })[0];
      nextEl.textContent = firstGap ? 'Next to fix: ' + firstGap.getAttribute('data-short') + '.' : '';
      nextEl.hidden = !firstGap;
      cta.href = waLink('Hi WeMustCreate, I did the 7-sign check on wemustcreate.online: ' + n + ' of ' + total +
        " in place. I'd like to book a free DPA (R750 value).");
      reset.hidden = n === 0;
      if (persist) save(on.map(function (b) { return b.id; }));
    }

    form.addEventListener('change', function (e) { if (e.target.type === 'checkbox') update(true); });
    reset.addEventListener('click', function () {
      boxes.forEach(function (b) { b.checked = false; });
      forget();
      update(false);
      boxes[0].focus();
    });

    panel.hidden = false;
    reveal(form);
    update(false);
  }

  /* ======================================================================
     Local Guides windows (About section)
     ====================================================================== */
  function tableRows(table) {
    return Array.prototype.slice.call(table.querySelectorAll('tbody tr')).map(function (tr) {
      var th = tr.querySelector('th'), td = tr.querySelector('td');
      return {
        key: tr.getAttribute('data-key') || '',
        label: th ? th.textContent.trim() : '',
        short: tr.getAttribute('data-short') || (th ? th.textContent.trim() : ''),
        partial: tr.hasAttribute('data-partial'),
        value: td ? toNumber(td.textContent) : NaN
      };
    }).filter(function (r) { return isFinite(r.value); });
  }

  function initLevel(win) {
    var table = win.querySelector('[data-lg-table="level"]');
    if (!table) return;
    var rows = {};
    tableRows(table).forEach(function (r) { rows[r.key] = r; });
    if (!rows.points || !rows.current || !rows.next) return;
    var levelOf = function (r) { var m = /Level\s+(\d+)/i.exec(r.label); return m ? m[1] : ''; };
    var points = rows.points.value, from = rows.current.value, to = rows.next.value;
    var lvl = levelOf(rows.current), nextLvl = levelOf(rows.next);
    var pct = clamp((points - from) / (to - from), 0, 1) * 100;
    var togo = Math.max(0, to - points);

    win.querySelector('[data-lg-points]').textContent = fmt(points);
    win.querySelector('[data-lg-points-label]').textContent = 'points · Level ' + lvl + ' Local Guide';
    var meter = win.querySelector('[data-lg-meter]');
    meter.style.setProperty('--db-meter-pct', pct.toFixed(1) + '%');
    meter.setAttribute('aria-valuemin', String(from));
    meter.setAttribute('aria-valuemax', String(to));
    meter.setAttribute('aria-valuenow', String(points));
    meter.setAttribute('aria-valuetext', fmt(points) + ' points, ' + fmt(togo) + ' to Level ' + nextLvl);
    win.querySelector('[data-lg-from]').textContent = 'Level ' + lvl + ' · ' + fmt(from);
    win.querySelector('[data-lg-to]').textContent = 'Level ' + nextLvl + ' · ' + fmt(to);
    win.querySelector('[data-lg-togo]').textContent = togo > 0
      ? fmt(togo) + ' points to Level ' + nextLvl + '.'
      : 'Level ' + nextLvl + ' points reached.';
    reveal(win);
    if (!reduceMotion) {
      meter.classList.add('is-drawing');
      drawInOnceMeter(meter);
    }
  }
  function drawInOnceMeter(meter) {
    function go() { requestAnimationFrame(function () { requestAnimationFrame(function () { meter.classList.add('is-drawn'); meter.classList.remove('is-drawing'); }); }); }
    if (!('IntersectionObserver' in window)) { go(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
    }, { threshold: 0.5 });
    io.observe(meter);
  }

  /* Horizontal bars: every value is labelled at the bar tip. */
  function initBars(win) {
    var table = win.querySelector('[data-lg-table="contributions"]');
    var plot = win.querySelector('[data-lg-plot="contributions"]');
    if (!table || !plot) return;
    var data = tableRows(table);
    if (!data.length) return;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }));

    function draw() {
      var W = plotWidth(plot);
      var rowH = 46, barH = 14, labelGap = 20, valueSpace = 64;
      var Hpx = data.length * rowH + 4;
      var old = plot.querySelector('svg');
      if (old) old.remove();
      var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + Hpx, width: W, height: Hpx, 'aria-hidden': 'true', focusable: 'false' });
      plot.insertBefore(root, plot.firstChild);
      var track = W - valueSpace;
      data.forEach(function (d, i) {
        var top = i * rowH;
        svgText(root, 0, top + 15, d.label, { class: 'db-t-ink' });
        var len = Math.max(4, (d.value / max) * track);
        var yb = top + labelGap + 4;
        // 4px rounded data-end, square at the baseline
        var r = Math.min(4, len / 2);
        var path = 'M0,' + yb + ' H' + (len - r) + ' Q' + len + ',' + yb + ' ' + len + ',' + (yb + r) +
                   ' V' + (yb + barH - r) + ' Q' + len + ',' + (yb + barH) + ' ' + (len - r) + ',' + (yb + barH) + ' H0 Z';
        svg('path', { d: path, class: 'db-mark db-mark--h' }, root);
        svgText(root, len + 8, yb + barH - 2, fmt(d.value), { class: 'db-t-ink' });
      });
    }
    reveal(win);
    draw();
    onResize(plot, draw);
    drawInOnce(plot);
  }

  /* Columns: monthly photo views; part-months are hatched and named. */
  function initColumns(win) {
    var table = win.querySelector('[data-lg-table="views"]');
    var totals = win.querySelector('[data-lg-table="views-totals"]');
    var plot = win.querySelector('[data-lg-plot="views"]');
    var stats = win.querySelector('[data-lg-stats]');
    var readout = win.querySelector('[data-lg-readout]');
    if (!table || !plot) return;
    var data = tableRows(table);
    if (!data.length) return;

    if (totals && stats) {
      stats.textContent = '';
      tableRows(totals).forEach(function (t) {
        var box = document.createElement('div');
        box.appendChild(html('dt', null, t.label));
        box.appendChild(html('dd', null, fmt(t.value)));
        stats.appendChild(box);
      });
    }

    var maxVal = Math.max.apply(null, data.map(function (d) { return d.value; }));
    var maxIndex = data.map(function (d) { return d.value; }).indexOf(maxVal);
    var layout = null, marks = [];

    function draw() {
      var W = plotWidth(plot);
      var Hpx = 220;
      var m = { t: 24, r: 8, b: 30, l: 44 };
      var iw = W - m.l - m.r, ih = Hpx - m.t - m.b;
      var step = niceStep(maxVal * 1.1, 5);
      var yMax = Math.ceil((maxVal * 1.1) / step) * step;
      var band = iw / data.length;
      var colW = Math.min(24, band * 0.5);
      function y(v) { return m.t + ih - (v / yMax) * ih; }
      layout = { band: band, m: m, colW: colW, y: y };

      var old = plot.querySelector('svg');
      if (old) old.remove();
      var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + Hpx, width: W, height: Hpx, 'aria-hidden': 'true', focusable: 'false' });
      plot.insertBefore(root, plot.firstChild);
      hatchPattern(root);
      for (var v = 0; v <= yMax + 1e-6; v += step) {
        svg('line', { x1: m.l, x2: W - m.r, y1: Math.round(y(v)) + 0.5, y2: Math.round(y(v)) + 0.5, class: v === 0 ? 'db-axis-line' : 'db-grid-line' }, root);
        svgText(root, m.l - 8, y(v) + 5, compact(v), { 'text-anchor': 'end' });
      }
      marks = [];
      data.forEach(function (d, i) {
        var cx = m.l + band * i + band / 2;
        var x0 = cx - colW / 2, top = y(d.value), base = y(0);
        var h = base - top, r = Math.min(4, h / 2);
        var path = 'M' + x0 + ',' + base + ' V' + (top + r) + ' Q' + x0 + ',' + top + ' ' + (x0 + r) + ',' + top +
                   ' H' + (x0 + colW - r) + ' Q' + (x0 + colW) + ',' + top + ' ' + (x0 + colW) + ',' + (top + r) + ' V' + base + ' Z';
        marks.push(svg('path', { d: path, class: 'db-mark' + (d.partial ? ' db-mark--partial' : '') }, root));
        svgText(root, cx, Hpx - 10, d.short, { 'text-anchor': 'middle' });
        if (i === maxIndex || i === data.length - 1) {
          svgText(root, cx, top - 8, compact(d.value), { 'text-anchor': 'middle', class: 'db-t-ink' });
        }
      });
      if (reader) reader.refresh();
    }

    var reader = readable(plot, readout, {
      count: function () { return data.length; },
      start: function () { return data.length - 1; },
      indexAt: function (px) { return clamp(Math.floor((px - layout.m.l) / layout.band), 0, data.length - 1); },
      focus: function (i) {
        var d = data[i];
        marks.forEach(function (mk, j) { mk.classList.toggle('is-dim', j !== i); });
        var cx = layout.m.l + layout.band * i + layout.band / 2;
        return {
          head: d.label,
          rows: [{ key: 's1', value: fmt(d.value), label: 'new photo views' }],
          x: cx, y: layout.y(d.value),
          speak: d.label + ': ' + fmt(d.value) + ' new photo views.'
        };
      },
      clear: function () { marks.forEach(function (mk) { mk.classList.remove('is-dim'); }); }
    });

    reveal(win);
    draw();
    onResize(plot, draw);
    drawInOnce(plot);
  }

  /* ---------- Start ---------- */
  function start() {
    var cost = document.querySelector('[data-db="cost"]');
    var check = document.querySelector('[data-readiness]');
    var level = document.querySelector('[data-db="lg-level"]');
    var contrib = document.querySelector('[data-db="lg-contributions"]');
    var views = document.querySelector('[data-db="lg-views"]');
    [[cost, initCost], [check, initReadiness], [level, initLevel], [contrib, initBars], [views, initColumns]].forEach(function (pair) {
      if (!pair[0]) return;
      try { pair[1](pair[0]); } catch (err) {
        // A broken chart must not take the page down: leave the tables showing.
        if (window.console) console.error('Dashboard window failed to start:', err);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
