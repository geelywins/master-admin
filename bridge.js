/* Jembatan Master Admin <-> admin lama (Geely, XPeng, BYD).
   Dipasang di <head> tiap admin lama dengan satu baris, contoh:
   <script src="https://USERNAME.github.io/master-admin/bridge.js" data-site="geely"></script>
   data-site: geely | xpeng | byd

   Tugasnya hanya dua:
   1. Kalau admin lama dibuka dari Master Admin dan belum login, minta login dari Master
      (hanya dari alamat tempat file ini dimuat), simpan di penyimpanan admin lama, lalu muat ulang.
   2. Kalau alamatnya memuat #mt=NAMA (Geely/XPeng), buka tab NAMA otomatis.
   BYD sudah punya alamat halaman sendiri (#/model/slug), jadi tidak perlu bagian 2. */
(function () {
  'use strict';
  var cs = document.currentScript;
  if (!cs || !cs.src) return;
  var SITE = cs.getAttribute('data-site');
  var MASTER;
  try { MASTER = new URL(cs.src).origin; } catch (e) { return; }
  if (MASTER === location.origin) return;

  var ADAPT = {
    geely: {
      has: function () { return !!localStorage.getItem('g_token'); },
      set: function (c) { localStorage.setItem('g_owner', c.owner); localStorage.setItem('g_repo', c.repo); localStorage.setItem('g_branch', c.branch || 'main'); localStorage.setItem('g_token', c.token); },
      sel: function (t) { return '#tabs [data-tab="' + t + '"]'; }
    },
    xpeng: {
      has: function () { return !!localStorage.getItem('xp_cfg'); },
      set: function (c) { localStorage.setItem('xp_cfg', JSON.stringify({ owner: c.owner, repo: c.repo, branch: c.branch || 'main', token: c.token })); },
      sel: function (t) { return '[data-t="' + t + '"]'; },
      delay: 400
    },
    byd: {
      has: function () { try { var o = JSON.parse(localStorage.getItem('byd_admin_cfg_v1') || 'null'); return !!(o && o.token); } catch (e) { return false; } },
      set: function (c) { localStorage.setItem('byd_admin_cfg_v1', JSON.stringify({ owner: c.owner, repo: c.repo, branch: c.branch || 'main', token: c.token })); }
    }
  };
  var A = ADAPT[SITE];
  if (!A) return;

  var P = window.opener || (window.parent !== window ? window.parent : null);

  // 1. login dari Master
  if (P && !A.has()) {
    window.addEventListener('message', function (e) {
      if (e.origin !== MASTER || e.source !== P) return;
      var d = e.data;
      if (!d || d.type !== 'wins-cfg' || d.site !== SITE || !d.cfg || !d.cfg.token || !d.cfg.owner || !d.cfg.repo) return;
      try { A.set(d.cfg); } catch (x) { return; }
      if (A.has()) location.reload();
    });
    try { P.postMessage({ type: 'wins-ready', site: SITE }, MASTER); } catch (e) {}
  }

  // 2. buka tab tujuan (Geely dan XPeng)
  var m = location.hash.match(/^#mt=([\w-]+)/);
  if (m && A.sel) {
    var target = m[1], tries = 0;
    var iv = setInterval(function () {
      tries++;
      var el = document.querySelector(A.sel(target));
      if (el && A.has() && !el.closest('.hide')) {
        clearInterval(iv);
        setTimeout(function () { el.click(); }, A.delay || 60);
      } else if (tries > 120) clearInterval(iv);
    }, 150);
  }
})();
