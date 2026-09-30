/* Small enhancements: theme, mobile menu, copy email, screenshot viewer. The pages work without it. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  $$('.theme-btn').forEach(function (themeBtn) { themeBtn.addEventListener('click', function () {
    var t = root.getAttribute('data-theme');
    var dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  }); });

  // Language: remember the visitor's choice (Spanish is the default)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.lang-switch');
    if (a) { try { localStorage.setItem('lang', a.getAttribute('data-lang')); } catch (err) {} }
  });
  (function () {
    if (window.__SINGLE) return; // the single-file version handles language in its router
    var saved = null; try { saved = localStorage.getItem('lang'); } catch (e) {}
    var sw = $$('.lang-switch').filter(function (a) { return a.offsetParent !== null || !a.closest('[hidden]'); })[0];
    if (saved && sw && saved === sw.getAttribute('data-lang') && !/[?&]nolang/.test(location.search)) location.replace(sw.href);
  })();

  $$('.menu-btn').forEach(function (menuBtn) {
    var nav = document.getElementById(menuBtn.getAttribute('aria-controls'));
    if (!nav) return;
    menuBtn.addEventListener('click', function () { menuBtn.setAttribute('aria-expanded', String(nav.classList.toggle('open'))); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); } });
  });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('.copy-btn'); if (!b) return;
    var label = b.textContent;
    var done = function (t) { b.textContent = t; setTimeout(function () { b.textContent = label; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () { done(b.getAttribute('data-done') || '✓'); }, function () {});
  });

  // Screenshot viewer: one dialog, arrow keys, optional numbered notes on the image
  var lb = $('.lightbox');
  if (!lb || typeof lb.showModal !== 'function') return;
  var items = [], pos = 0, img = $('img', lb), marks = $('.lb-marks', lb), cap = $('.lb-cap', lb);
  function collect(group, scope) {
    var out = [];
    $$('[data-lightbox="' + group + '"]', scope).forEach(function (a) {
      var i = +a.getAttribute('data-index');
      if (!out[i]) out[i] = { src: a.getAttribute('href'), title: a.getAttribute('data-title'), alt: (a.querySelector('img') || {}).alt || '', notes: JSON.parse(a.getAttribute('data-notes') || '[]') };
    });
    return out.filter(Boolean);
  }
  function render() {
    var it = items[pos];
    img.src = it.src; img.alt = it.alt;
    $('.lb-title', lb).textContent = it.title;
    $('.lb-count', lb).textContent = items.length > 1 ? (pos + 1) + ' / ' + items.length : '';
    marks.innerHTML = it.notes.map(function (n, i) { return '<span class="mark" style="left:' + n.x + '%;top:' + n.y + '%">' + (i + 1) + '</span>'; }).join('');
    cap.innerHTML = '';
    if (it.notes.length) {
      var ol = document.createElement('ol');
      it.notes.forEach(function (n, i) { var li = document.createElement('li'); li.innerHTML = '<b>' + (i + 1) + '</b>'; li.appendChild(document.createTextNode(n.label)); ol.appendChild(li); });
      cap.appendChild(ol);
    }
    $$('.lb-nav', lb).forEach(function (b) { b.hidden = items.length < 2; });
  }
  function open(group, i, from) { items = collect(group, (from && from.closest('.route')) || document); if (!items.length) return; pos = Math.min(i || 0, items.length - 1); render(); lb.showModal(); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-lightbox]');
    if (a) { e.preventDefault(); open(a.getAttribute('data-lightbox'), +a.getAttribute('data-index'), a); return; }
    var v = e.target.closest('[data-open]');
    if (v) open(v.getAttribute('data-open'), 0, v);
  });
  function go(d) { pos = (pos + d + items.length) % items.length; render(); }
  $('.lb-prev', lb).addEventListener('click', function () { go(-1); });
  $('.lb-next', lb).addEventListener('click', function () { go(1); });
  $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
  lb.addEventListener('keydown', function (e) { if (items.length > 1 && e.key === 'ArrowRight') go(1); if (items.length > 1 && e.key === 'ArrowLeft') go(-1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
})();
