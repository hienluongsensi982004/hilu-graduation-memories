/* ===========================================
   Graduation Invitation — Behaviour
=========================================== */

(() => {
  'use strict';

  // ============ CONFIG ============
  const TARGET_DATE  = new Date('2026-06-24T10:30:00+07:00');
  const WTM_LOCATION = { lat: 21.0375, lng: 105.7743, label: 'Hội trường H1 — ĐH Thương Mại' };
  const WEBHOOK_URL  = 'https://script.google.com/macros/s/AKfycbwjenk7avnwuwbVwJtKFl1NkABSkm1dLqAtbzCOVoSs1m6waye-wqMGeZmA_yj3huJc/exec';
  const STORAGE_KEY  = 'grad-wishes-v1';

  // ============ DOM ============
  const pages    = document.querySelectorAll('.page');
  const dots     = document.querySelectorAll('.nav-dots button');
  const homeCard = document.getElementById('homeCard');

  let mapInitialised = false;

  // ============ Reveal-on-scroll ============
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });
    pages.forEach((p) => revealObs.observe(p));
  } else {
    pages.forEach((p) => p.classList.add('in-view'));
  }

  // ============ Scroll-spy for nav dots ============
  if ('IntersectionObserver' in window) {
    const spyObs = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
      });
      if (best) {
        const id = best.target.dataset.page;
        dots.forEach((d) => d.classList.toggle('active', d.dataset.page === id));
        if (id === '5') initMap();
        if (id === '6') renderWishList();
      }
    }, { threshold: [0.35, 0.55, 0.75] });
    pages.forEach((p) => spyObs.observe(p));
  }

  // ============ Nav dots click ============
  dots.forEach((d) => {
    d.addEventListener('click', () => {
      const target = document.getElementById('page-' + d.dataset.page);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ============ Keyboard navigation ============
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    const visible = currentVisiblePage();
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); scrollToPage(visible + 1); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); scrollToPage(visible - 1); }
  });

  function currentVisiblePage() {
    const center = window.innerHeight / 2;
    let bestIdx = 1, bestDist = Infinity;
    pages.forEach((p) => {
      const rect = p.getBoundingClientRect();
      const dist = Math.abs(rect.top + rect.height / 2 - center);
      if (dist < bestDist) { bestDist = dist; bestIdx = Number(p.dataset.page); }
    });
    return bestIdx;
  }

  function scrollToPage(n) {
    n = Math.max(1, Math.min(pages.length, n));
    const target = document.getElementById('page-' + n);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ============ Home card flip ============
  // if (homeCard) {
  //   function openCard() {
  //     homeCard.classList.add('opened');
  //     setTimeout(() => scrollToPage(3), 700);
  //   }
  //   homeCard.addEventListener('click', openCard);
  //   homeCard.addEventListener('keydown', (e) => {
  //     if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
  //   });
  // }
  const inviteDemo = document.getElementById('homeCard');
  if (inviteDemo) {
    function openCard() {
      inviteDemo.classList.add('opened');
      setTimeout(() => scrollToPage(3), 700);
    }
    inviteDemo.addEventListener('click', openCard);
    inviteDemo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
    });
  }
  // if (inviteDemo) {
  //   function openCard() {
  //     inviteDemo.classList.add('opened');
  //     setTimeout(() => scrollToPage(3), 700);
  //   }
  //   inviteDemo.addEventListener('click', openCard);
  //   homeCard.addEventListener('keydown', (e) => {
  //     if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
  //   });
  // }
  // ============ Countdown ============
  const cdDays       = document.getElementById('cd-days');
  const cdHours      = document.getElementById('cd-hours');
  const cdMins       = document.getElementById('cd-mins');
  const cdSecs       = document.getElementById('cd-secs');
  const cdTargetText = document.getElementById('cd-target-text');

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function tick() {
    const diff = TARGET_DATE - new Date();
    if (diff <= 0) {
      if (cdDays)  cdDays.textContent  = '00';
      if (cdHours) cdHours.textContent = '00';
      if (cdMins)  cdMins.textContent  = '00';
      if (cdSecs)  cdSecs.textContent  = '00';
      return;
    }
    const s = Math.floor(diff / 1000);
    if (cdDays)  cdDays.textContent  = pad(Math.floor(s / 86400));
    if (cdHours) cdHours.textContent = pad(Math.floor((s % 86400) / 3600));
    if (cdMins)  cdMins.textContent  = pad(Math.floor((s % 3600) / 60));
    if (cdSecs)  cdSecs.textContent  = pad(s % 60);
  }

  if (cdTargetText) {
    cdTargetText.textContent = TARGET_DATE.toLocaleString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }
  tick();
  setInterval(tick, 1000);

  // ============ Map ============
  function initMap() {
    if (mapInitialised || typeof L === 'undefined') return;
    mapInitialised = true;
    const map = L.map('map', { scrollWheelZoom: false }).setView(
      [WTM_LOCATION.lat, WTM_LOCATION.lng], 17
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    L.marker([WTM_LOCATION.lat, WTM_LOCATION.lng])
      .addTo(map)
      .bindPopup(`<b>${WTM_LOCATION.label}</b><br/>79 Hồ Tùng Mậu, Cầu Giấy, Hà Nội`)
      .openPopup();
    setTimeout(() => map.invalidateSize(), 200);
  }

  // ============ Wishes: storage helpers ============
  function loadWishes() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }
  function saveWishes(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
    );
  }
  function formatVnDate(iso) {
    try {
      return new Date(iso).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return iso; }
  }

  // ============ Render wish list ============
  function renderWishList() {
    const ul    = document.getElementById('wishList');
    const count = document.getElementById('wishCount');
    if (!ul || !count) return;

    const list = loadWishes().slice().reverse();
    count.textContent = list.length;
    if (!list.length) {
      ul.innerHTML = '<li class="wl-empty">Chưa có lời chúc nào — hãy là người đầu tiên!</li>';
      return;
    }
    ul.innerHTML = list.map((w) => `
      <li>
        <div class="wl-head">
          <span class="wl-name">${escapeHtml(w.name)}${w.relation ? ' · ' + escapeHtml(w.relation) : ''}</span>
          <span class="wl-meta">${escapeHtml(formatVnDate(w.createdAt))}</span>
        </div>
        <div class="wl-msg">${escapeHtml(w.message)}</div>
      </li>
    `).join('');
  }

  // ============ Wish form ============
  const form    = document.getElementById('wishForm');
  const toastEl = document.getElementById('toast');

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = form.elements['name']    ? form.elements['name'].value.trim()    : '';
      const message = form.elements['message'] ? form.elements['message'].value.trim() : '';
      if (!name || !message) { toast('Vui lòng điền họ tên và lời chúc.'); return; }

      const entry = {
        name,
        attend:    form.elements['attend']    ? form.elements['attend'].value    : '',
        message,
        createdAt: new Date().toISOString()
      };

      const list = loadWishes();
      list.push(entry);
      saveWishes(list);
      form.reset();
      renderWishList();

      if (WEBHOOK_URL) {
        const submitBtn   = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi...'; }
        try {
          const fd = new FormData();
          fd.append('name',      entry.name);
          fd.append('attend',    entry.attend);
          fd.append('message',   entry.message);
          fd.append('userAgent', navigator.userAgent);
          const res  = await fetch(WEBHOOK_URL, { method: 'POST', body: fd });
          const data = await res.json().catch(() => ({}));
          toast(data && data.ok ? 'Cảm ơn bạn đã gửi lời chúc 💌' : 'Đã lưu trên máy của bạn.');
        } catch {
          toast('Đã lưu trên máy của bạn (không có mạng).');
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        }
      } else {
        toast('Cảm ơn bạn đã gửi lời chúc 💌');
      }
    });
  }

  // Export Excel
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const list = loadWishes();
      if (!list.length) { toast('Chưa có lời chúc để xuất.'); return; }
      if (typeof XLSX === 'undefined') { toast('Không tải được thư viện Excel.'); return; }
      const rows = list.map((w, i) => ({
        'STT': i + 1, 'Họ và tên': w.name || '',
        'Tham dự': w.attend || '', 'Lời chúc': w.message || '',
        'Thời gian gửi': formatVnDate(w.createdAt)
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{ wch: 5 }, { wch: 22 }, { wch: 22 }, { wch: 60 }, { wch: 18 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Lời chúc');
      XLSX.writeFile(wb, `loi-chuc-tot-nghiep-${new Date().toISOString().slice(0,10)}.xlsx`);
      toast('Đã tải file Excel 📥');
    });
  }

  // Clear wishes
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!loadWishes().length) { toast('Không có dữ liệu để xoá.'); return; }
      if (!confirm('Xoá toàn bộ lời chúc đã lưu?')) return;
      saveWishes([]);
      renderWishList();
      toast('Đã xoá toàn bộ lời chúc.');
    });
  }
// ============ Splash screen ============
const splash    = document.getElementById('splashScreen');
const splashBtn = document.getElementById('splashBtn');

if (splash && splashBtn) {
  splashBtn.addEventListener('click', () => {
    splash.classList.add('hidden');
    if (music) {
      music.volume = 0.4;
      music.play().then(() => {
        playing = true;
        btn.innerHTML = '<span>🎵</span>';
        btn.classList.add('playing');
      }).catch(() => {});
    }
  });
}
  renderWishList();

  // ============ Nhạc nền ============
  const music = document.getElementById('bgMusic');
  const btn   = document.getElementById('musicBtn');

  if (!music || !btn) {
    console.warn('Thiếu #bgMusic hoặc #musicBtn trong HTML');
  } else {
    let playing = false;

    function tryPlay() {
      music.volume = 0.4;
      music.play()
        .then(() => {
          playing = true;
          btn.innerHTML = '<span>🎵</span>';
          btn.classList.add('playing');
          btn.classList.remove('muted');
        })
        .catch((err) => {
          console.log('Autoplay bị chặn, chờ tương tác:', err.message);
          playing = false;
        });
    }

    function onFirstInteract() {
      if (!playing) tryPlay();
      document.removeEventListener('click',   onFirstInteract);
      document.removeEventListener('keydown', onFirstInteract);
      document.removeEventListener('scroll',  onFirstInteract);
    }

    document.addEventListener('click',   onFirstInteract);
    document.addEventListener('keydown', onFirstInteract);
    document.addEventListener('scroll',  onFirstInteract);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (playing) {
        music.pause();
        playing = false;
        btn.innerHTML = '🔇';
        btn.classList.remove('playing');
        btn.classList.add('muted');
      } else {
        tryPlay();
      }
    });
  }

})();