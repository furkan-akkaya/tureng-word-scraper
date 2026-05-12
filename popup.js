// ============================================================
// popup.js — Popup arayüzünün tüm mantığı
// Kelime listesini gösterir, manuel veri çekme, CSV indirme
// ve veri temizleme işlemlerini yönetir.
// ============================================================
document.addEventListener('DOMContentLoaded', init);

const $ = (sel) => document.querySelector(sel);

// ── Başlatma ──────────────────────────────────────────────────
function init() {
  loadWordList();
  $('#scrapeBtn').addEventListener('click', handleScrape);
  $('#downloadBtn').addEventListener('click', handleDownload);
  $('#clearBtn').addEventListener('click', handleClear);
}

// ── Storage'dan kelimeleri yükle ve göster ─────────────────────
function loadWordList() {
  chrome.storage.local.get({ wordList: [] }, (result) => {
    const list = result.wordList;
    $('#wordCount').textContent = list.length;

    const container = $('#wordListContainer');

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📝</div>
          Henüz kelime kaydedilmedi.<br>
          Tureng'de bir kelime aratın!
        </div>`;
      return;
    }

    // Listeyi ters sırayla göster (en son eklenen üstte)
    container.innerHTML = list
      .slice()
      .reverse()
      .map(
        (item, i) => `
        <div class="word-item">
          <div class="word-badge">${list.length - i}</div>
          <div class="word-info">
            <div class="word-title">${escapeHtml(item.word)}</div>
            <div class="word-meaning">${escapeHtml(item.meanings)}</div>
          </div>
          <div class="word-date">${escapeHtml(item.date)}</div>
        </div>`
      )
      .join('');
  });
}

// ── Manuel Veri Çekme ─────────────────────────────────────────
async function handleScrape() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab || !tab.url || !tab.url.includes('tureng.com')) {
    showStatus('⚠️ Lütfen bir Tureng sayfasına gidin!', 'error');
    return;
  }

  showStatus('🔄 Veriler çekiliyor...', 'info');

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeTurengPage,
    });

    const data = results?.[0]?.result;

    if (!data || !data.word) {
      showStatus('❌ Sonuç tablosu bulunamadı!', 'error');
      return;
    }

    // Storage'a kaydet (duplicate kontrolü)
    chrome.storage.local.get({ wordList: [] }, (result) => {
      const wordList = result.wordList;
      const exists = wordList.some(
        (w) => w.word.toLowerCase() === data.word.toLowerCase()
      );

      if (exists) {
        showStatus(`ℹ️ "${data.word}" zaten kayıtlı.`, 'info');
        return;
      }

      wordList.push(data);
      chrome.storage.local.set({ wordList }, () => {
        showStatus(`✅ "${data.word}" kaydedildi!`, 'success');
        loadWordList();
      });
    });
  } catch (err) {
    showStatus('❌ Hata: ' + err.message, 'error');
  }
}

// ── Sayfa içinde çalışacak scraping fonksiyonu ────────────────
// chrome.scripting.executeScript ile inject edilir.
// Kendi scope'unda çalışır, dış değişkenlere erişemez.
function scrapeTurengPage() {
  const table = document.querySelector('table#englishResultsTable');
  if (!table) return null;

  // Aranan kelime
  const input = document.querySelector('#searchTerm');
  let word = input ? input.value.trim() : '';
  if (!word) {
    const parts = window.location.pathname.split('/');
    word = decodeURIComponent(parts[parts.length - 1] || '');
  }
  if (!word) return null;

  // Anlamları topla
  const meanings = [];
  table.querySelectorAll('tr').forEach((row) => {
    const en = row.querySelector('td.en.tm a');
    const tr = row.querySelector('td.tr.ts a');
    if (en && tr) meanings.push(tr.textContent.trim());
  });

  if (meanings.length === 0) return null;

  // Örnek cümle (varsa) — "More Sentences" butonunu yoksay
  let exampleSentence = '';
  const sentenceTd = document.querySelector(
    'tr.example-sentences-row td.example-sentences'
  );
  if (sentenceTd) {
    const clone = sentenceTd.cloneNode(true);
    const moreBtn = clone.querySelector('a.sentencesPerTermList-showMoreButton');
    if (moreBtn) moreBtn.remove();
    clone.querySelectorAll('br').forEach((br) => {
      br.replaceWith(document.createTextNode('\n'));
    });
    exampleSentence = clone.textContent
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .filter((line) => line.length > 0)
      .join('\n');
  }

  return {
    word: word,
    meanings: meanings.slice(0, 3).join(', '),
    exampleSentence: exampleSentence,
    date: new Date().toLocaleDateString('tr-TR'),
  };
}

// ── CSV İndirme (Popup DOM ortamında — Blob API burada çalışır) ─
function handleDownload() {
  chrome.storage.local.get({ wordList: [] }, (result) => {
    const list = result.wordList;

    if (list.length === 0) {
      showStatus('⚠️ İndirilecek veri yok!', 'error');
      return;
    }

    // CSV oluştur (BOM ile UTF-8 desteği)
    const header = 'Kelime,Anlam,Örnek Cümle,Tarih';
    const rows = list.map(
      (item) =>
        `"${csvEscape(item.word)}","${csvEscape(item.meanings)}","${csvEscape(
          item.exampleSentence
        )}","${csvEscape(item.date)}"`
    );
    const csvContent = [header, ...rows].join('\n');

    // Blob oluştur ve indir (popup DOM ortamında çalışır)
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);

    // chrome.downloads API'si ile "Farklı Kaydet" penceresi aç
    chrome.downloads.download(
      {
        url: url,
        filename: 'tureng_kelimeler.csv',
        saveAs: true,
      },
      () => {
        showStatus('✅ CSV dosyası indiriliyor...', 'success');
        // Blob URL'yi temizle
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    );
  });
}

// ── Verileri Temizle ──────────────────────────────────────────
function handleClear() {
  if (!confirm('Tüm kayıtlı kelimeler silinecek. Emin misiniz?')) return;

  chrome.storage.local.set({ wordList: [] }, () => {
    showStatus('🗑️ Tüm veriler temizlendi.', 'info');
    loadWordList();
  });
}

// ── Yardımcı Fonksiyonlar ─────────────────────────────────────
function showStatus(message, type) {
  const el = $('#statusMsg');
  el.textContent = message;
  el.className = 'status ' + type;
  // 4 saniye sonra sil
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.textContent = '';
    el.className = 'status';
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function csvEscape(str) {
  if (!str) return '';
  return str.replace(/"/g, '""');
}
