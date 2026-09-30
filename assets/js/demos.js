/* Two small demos. All data is invented and labelled as such on the page. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var L = {
    es: { client: 'Cliente', all: 'Todos los clientes', type: 'Tipo de deudor', both: 'Públicos y privados', pub: 'Públicos', priv: 'Privados', out: 'Pendiente', ovd: 'Porcentaje vencido', age: 'Antigüedad ponderada (días)', bars: 'Pendiente por días de vencimiento', buckets: ['No vencido', '0–30', '31–60', '61–90', 'Más de 90'], cl: 'Cliente',
      next: 'Siguiente paso', again: 'Empezar de nuevo', replies: 'El cliente responde', intro: 'Pulsa «Siguiente paso» para seguir a un cliente ficticio por el sistema. Los pasos sombreados los hago yo.', me: 'Lo hago yo · ', auto: 'Automático · ',
      steps: [['Importar', 'Los contactos entran desde Excel. Se unifican duplicados y se respetan los que no quieren ser contactados.'], ['Investigar', 'Un agente de IA lee sobre la empresa y guarda cada dato con su fuente.'], ['Redactar', 'El email se redacta a partir de la investigación. Un control de calidad elimina cualquier afirmación sin respaldo.'], ['Aprobar', 'Leo y edito el borrador. Al aprobarlo se abre en Apple Mail; todavía no se envía nada.'], ['Enviar', 'Pulso Enviar. La aplicación confirma que el email está en Enviados antes de continuar.'], ['Seguimiento', 'Los seguimientos se programan solos desde el mismo buzón.'], ['Respuesta', 'Antes de cada seguimiento se revisa la bandeja de entrada. Una respuesta detiene la secuencia.']],
      yes: 'Respuesta detectada de Example Co. (ficticia). Se cancela el seguimiento pendiente y la secuencia se detiene.', no: 'Sin respuesta. Sale el siguiente seguimiento; antes de cada uno se vuelve a revisar la bandeja.', fmt: function (v) { return v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + ' M€' : v >= 1e3 ? Math.round(v / 1e3) + ' K€' : Math.round(v) + ' €'; }, pct: ' %' },
    en: { client: 'Client', all: 'All clients', type: 'Debtor type', both: 'Public and private', pub: 'Public', priv: 'Private', out: 'Outstanding', ovd: 'Overdue share', age: 'Weighted aging (days)', bars: 'Outstanding by days past due', buckets: ['Not yet due', '0–30', '31–60', '61–90', 'Over 90'], cl: 'Client',
      next: 'Next step', again: 'Start again', replies: 'The prospect replies', intro: 'Press "Next step" to follow a fictitious prospect through the system. Shaded steps are done by me.', me: 'Done by me · ', auto: 'Automatic · ',
      steps: [['Import', 'Contacts come in from Excel. Duplicates are merged and do-not-contact rows are respected.'], ['Research', 'An AI agent reads about the company and stores each finding with its source.'], ['Draft', 'The email is drafted from the research. A QA step removes any claim the research does not support.'], ['Approve', 'I read and edit the draft. Approving opens it in Apple Mail; nothing is sent yet.'], ['Send', 'I press Send. The app confirms the email is in the Sent mailbox before moving on.'], ['Follow up', 'Follow-ups are scheduled automatically from the same mailbox.'], ['Reply', 'The inbox is checked before every follow-up. A reply stops the sequence.']],
      yes: 'Reply detected from Example Co. (fictitious). The pending follow-up is cancelled and the sequence stops.', no: 'No reply. The next follow-up goes out; the inbox is checked again before each one.', fmt: function (v) { return '€' + (v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'K' : Math.round(v)); }, pct: '%' }
  };
  var tx = function (el) { var l = (el.closest('[lang]') || document.documentElement).getAttribute('lang'); return L[l === 'en' ? 'en' : 'es']; };
  function rng(seed) { return function () { seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // Portfolio KPIs: same rules as the real dashboard, on 900 invented invoices.
  function portfolioSim(m) {
    var t = tx(m), eur = t.fmt;
    var R = rng(20260930), DAY = 864e5, TODAY = new Date(2026, 8, 30).getTime(), start = new Date(2025, 0, 1).getTime();
    var clients = ['A', 'B', 'C', 'D', 'E'].map(function (x) { return t.cl + ' ' + x; }), inv = [];
    for (var i = 0; i < 900; i++) {
      var fdoc = start + Math.floor(R() * 600) * DAY, frem = fdoc + (2 + Math.floor(R() * 45)) * DAY, fvto = fdoc + (60 + Math.floor(R() * 150)) * DAY;
      var amt = Math.exp(6.9 + 1.15 * Math.sqrt(-2 * Math.log(R() || 1e-9)) * Math.cos(2 * Math.PI * R()));
      var od = (TODAY - fvto) / DAY, paid = od > 0 ? R() < Math.min(.9, .55 + od / 900) : R() < .12;
      inv.push({ c: clients[Math.floor(Math.pow(R(), 1.4) * clients.length)], pub: R() < .66, fdoc: fdoc, frem: frem, fvto: fvto, out: paid ? 0 : amt });
    }
    m.innerHTML = '<div class="demo-controls"><label>' + t.client + '<select data-f="c"><option value="">' + t.all + '</option>' + clients.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></label>' +
      '<label>' + t.type + '<select data-f="t"><option value="">' + t.both + '</option><option value="1">' + t.pub + '</option><option value="0">' + t.priv + '</option></select></label></div>' +
      '<div class="kpis"><div class="kpi" data-k="out"><p class="k-l">' + t.out + '</p><p class="k-v"></p></div><div class="kpi" data-k="ovd"><p class="k-l">' + t.ovd + '</p><p class="k-v"></p></div><div class="kpi" data-k="age"><p class="k-l">' + t.age + '</p><p class="k-v"></p></div></div>' +
      '<p class="bars-h">' + t.bars + '</p><ul class="bars"></ul>';
    var colors = ['var(--seq-2)', 'var(--seq-3)', 'var(--seq-4)', 'var(--seq-5)', 'var(--ink)'], prev = {};
    function set(k, v) { var el = $('[data-k="' + k + '"]', m); $('.k-v', el).textContent = v; if (prev[k] && prev[k] !== v) { el.classList.add('flash'); setTimeout(function () { el.classList.remove('flash'); }, 500); } prev[k] = v; }
    function update() {
      var c = $('[data-f="c"]', m).value, ty = $('[data-f="t"]', m).value;
      var live = inv.filter(function (x) { return x.out > 0 && (!c || x.c === c) && (ty === '' || String(+x.pub) === ty); });
      var out = live.reduce(function (s, x) { return s + x.out; }, 0);
      var ovd = live.filter(function (x) { return x.fvto < TODAY; }).reduce(function (s, x) { return s + x.out; }, 0);
      var wa = out ? live.reduce(function (s, x) { return s + Math.max(1, Math.round((x.frem - x.fdoc) / DAY)) * x.out; }, 0) / out : 0;
      set('out', eur(out)); set('ovd', out ? Math.round(ovd / out * 100) + t.pct : '–'); set('age', out ? String(Math.round(wa)) : '–');
      var b = [[t.buckets[0], -1e9, 0], [t.buckets[1], 0, 30], [t.buckets[2], 30, 60], [t.buckets[3], 60, 90], [t.buckets[4], 90, 1e9]].map(function (k) {
        return { l: k[0], v: live.filter(function (x) { var d = (TODAY - x.fvto) / DAY; return d > k[1] && d <= k[2]; }).reduce(function (s, x) { return s + x.out; }, 0) };
      });
      var max = Math.max.apply(null, b.map(function (x) { return x.v; }).concat([1]));
      $('.bars', m).innerHTML = b.map(function (x, i) { return '<li class="bar"><span>' + x.l + '</span><span class="b-track"><span class="b-fill" style="width:' + (x.v / max * 100).toFixed(1) + '%;background:' + colors[i] + '"></span></span><span class="b-v">' + eur(x.v) + '</span></li>'; }).join('');
    }
    $$('select', m).forEach(function (s) { s.addEventListener('change', update); });
    update();
  }

  // Outbound AI: step through one fictitious prospect.
  function pipeline(m) {
    var t = tx(m), steps = t.steps.map(function (s, i) { return [s[0], s[1], i === 3 || i === 4]; });
    m.innerHTML = '<div class="pipe-row"><button type="button" class="btn" data-next>' + t.next + '</button><label><input type="checkbox" data-reply checked> ' + t.replies + '</label></div>' +
      '<ol class="pipe">' + steps.map(function (s) { return '<li' + (s[2] ? ' class="human"' : '') + '>' + s[0] + '</li>'; }).join('') + '</ol><p class="pipe-msg" aria-live="polite"></p>';
    var i = -1, lis = $$('.pipe li', m), msg = $('.pipe-msg', m), btn = $('[data-next]', m);
    function show() {
      lis.forEach(function (li, j) { li.classList.toggle('cur', j === i); li.classList.remove('skip'); });
      var reply = $('[data-reply]', m).checked, s = steps[i], text = s[1];
      if (i === 6) text = reply ? t.yes : t.no;
      if (i === 6 && reply) lis[5].classList.add('skip');
      msg.textContent = (s[2] ? t.me : t.auto) + text;
      btn.textContent = i === steps.length - 1 ? t.again : t.next;
    }
    btn.addEventListener('click', function () { i = (i + 1) % steps.length; show(); });
    msg.textContent = t.intro;
  }

  var DEMOS = { 'portfolio-sim': portfolioSim, 'outbound-pipeline': pipeline };
  $$('[data-demo]').forEach(function (d) { var f = DEMOS[d.getAttribute('data-demo')]; if (f) f($('.demo-mount', d)); });
})();
