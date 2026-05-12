// ============================================================
// content.js — Tureng sonuç sayfasından veri çeken Content Script
// Sayfa yüklendiğinde otomatik olarak çalışır (document_idle).
// ============================================================
(function () {
  'use strict';

  // ── 1. Sonuç tablosunu bul ───────────────────────────────────
  const table = document.querySelector('table#englishResultsTable');
  if (!table) return; // Sonuç sayfası değilse sessizce çık

  // ── 2. Aranan kelimeyi al ────────────────────────────────────
  const searchInput = document.querySelector('#searchTerm');
  let word = searchInput ? searchInput.value.trim() : '';

  // Fallback: URL yolundan çıkar  (tureng.com/tr/turkce-ingilizce/hello)
  if (!word) {
    const segments = window.location.pathname.split('/');
    word = decodeURIComponent(segments[segments.length - 1] || '');
  }
  if (!word) return;

  // ── 3. Tablo satırlarından İngilizce-Türkçe eşleşmeleri çek ─
  const rows = table.querySelectorAll('tr');
  const allMeanings = [];

  rows.forEach((row) => {
    const enAnchor = row.querySelector('td.en.tm a');
    const trAnchor = row.querySelector('td.tr.ts a');
    if (enAnchor && trAnchor) {
      allMeanings.push({
        en: enAnchor.textContent.trim(),
        tr: trAnchor.textContent.trim(),
      });
    }
  });

  if (allMeanings.length === 0) return;

  // İlk 3 Türkçe anlamı virgülle birleştir
  const topMeanings = allMeanings
    .slice(0, 3)
    .map((m) => m.tr)
    .join(', ');

  // ── 4. Örnek cümle ara (varsa) ──────────────────────────────
  // Tureng'de örnek cümleler: tr.example-sentences-row > td.example-sentences
  // İçinde "More Sentences" linki (a.sentencesPerTermList-showMoreButton) olabilir — onu yoksay.
  // İngilizce ve Türkçe cümleler <br> ile ayrılır → tire ile birleştir.
  let exampleSentence = '';
  const sentenceTd = document.querySelector(
    'tr.example-sentences-row td.example-sentences'
  );
  if (sentenceTd) {
    // Orijinal DOM'u bozmamak için klonla
    const clone = sentenceTd.cloneNode(true);
    // "More Sentences" butonunu sil
    const moreBtn = clone.querySelector('a.sentencesPerTermList-showMoreButton');
    if (moreBtn) moreBtn.remove();
    // <br> etiketlerini "\n" (alt satır) ayracıyla değiştir
    clone.querySelectorAll('br').forEach((br) => {
      br.replaceWith(document.createTextNode('\n'));
    });
    // Kalan metni al ve satır bazında temizle (\n yapısını bozmadan)
    exampleSentence = clone.textContent
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter((line) => line.length > 0)
      .join('\n');
  }

  // ── 5. Veriyi Background Script'e gönder ────────────────────
  const payload = {
    type: 'TURENG_WORD_DATA',
    word: word,
    meanings: topMeanings,
    exampleSentence: exampleSentence,
    date: new Date().toLocaleDateString('tr-TR'),
  };

  chrome.runtime.sendMessage(payload, (response) => {
    if (response && response.saved) {
      showToast(`✓ "${word}" kaydedildi`);
    }
  });

  // ── 6. Sayfa üzerinde küçük bildirim göster ─────────────────
  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '10px',
      fontSize: '14px',
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '600',
      zIndex: '999999',
      boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      opacity: '0',
      transform: 'translateY(12px)',
    });
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }
})();
