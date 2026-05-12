// ============================================================
// background.js — Service Worker (Manifest V3)
// Content script'ten gelen verileri chrome.storage.local'da depolar.
// NOT: CSV indirme işlemi popup.js'te yapılır (Service Worker'da
//      DOM API'leri — Blob, URL.createObjectURL — mevcut değildir).
// ============================================================

// ── Content Script'ten gelen mesajları dinle ───────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TURENG_WORD_DATA') {
    handleNewWord(message, sendResponse);
    return true; // Asenkron yanıt için kanalı açık tut
  }
});

// ── Yeni kelimeyi kaydet (duplicate kontrolü ile) ─────────────
function handleNewWord(data, sendResponse) {
  chrome.storage.local.get({ wordList: [] }, (result) => {
    const wordList = result.wordList;

    // Aynı kelime zaten varsa tekrar ekleme
    const exists = wordList.some(
      (item) => item.word.toLowerCase() === data.word.toLowerCase()
    );

    if (exists) {
      console.log(`[Tureng Toplayıcı] "${data.word}" zaten kayıtlı, atlandı.`);
      sendResponse({ saved: false, reason: 'duplicate' });
      return;
    }

    // Yeni kelimeyi listeye ekle
    wordList.push({
      word: data.word,
      meanings: data.meanings,
      exampleSentence: data.exampleSentence || '',
      date: data.date,
    });

    chrome.storage.local.set({ wordList }, () => {
      console.log(`[Tureng Toplayıcı] "${data.word}" başarıyla kaydedildi.`);
      sendResponse({ saved: true });
    });
  });
}
