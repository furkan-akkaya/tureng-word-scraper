# Tureng Kelime Toplayıcı Chrome Eklentisi 📖

Tureng.com üzerinde yaptığınız İngilizce-Türkçe kelime aramalarını otomatik olarak yakalayıp kaydeden ve bunları dilediğiniz zaman düzenli bir CSV dosyası olarak dışa aktarmanızı sağlayan modern bir Google Chrome eklentisi.

## 🚀 Proje Özeti

İngilizce öğrenirken veya çeviri yaparken arattığınız kelimeleri tek tek not alma derdine son! Bu eklenti, Tureng sonuç sayfasını arka planda analiz eder, aranan kelimenin en popüler Türkçe karşılıklarını ve varsa örnek cümleleri yakalar. Kaydedilen bu kelime listesini eklenti menüsünden görebilir ve tek tıkla Excel'de açılabilecek tablo (CSV) formatında bilgisayarınıza indirebilirsiniz.

## ✨ Özellikler

- **Otomatik Yakalama:** Tureng'de bir kelime arattığınızda sonuçlar (Kelime, Anlamlar, Örnek Cümle) otomatik olarak yerel hafızaya kaydedilir.
- **Akıllı Cümle Çekimi:** Tureng'in DOM yapısındaki gereksiz butonları ("More Sentences") süzerek, örnek cümleleri en temiz haliyle çeker.
- **Gelişmiş CSV Formatlama:** Örnek cümleler ile Türkçe çevirileri arasındaki `\n` (alt satır) ayracı korunarak, Excel/Numbers gibi programlarda bozulmayan standart CSV formatı elde edilir.
- **Kopya (Duplicate) Kontrolü:** Aynı kelime defalarca aratılsa bile listeye sadece bir kez eklenir.
- **Otomatik Temizlik:** Verilerinizi CSV olarak indirdikten sonra, eklenti hafızasını otomatik olarak sıfırlayarak yeni kelimeler için yer açar.
- **Manuel Veri Çekme:** Arayüzdeki "Verileri Çek" butonu ile açık olan sekmedeki kelimeyi anında kaydetme imkanı.

## 🛠 Kullanılan Teknolojiler

- **Manifest V3:** En güncel Chrome Extension mimarisi.
- **JavaScript (ES6+):** Modern, hafif ve bağımlılıksız geliştirme.
- **Chrome Storage API:** Verileri tarayıcının yerel diskinde güvenle saklama.
- **DOM Manipulation:** Site içeriklerini (content script ile) dinamik olarak okuma ve ayrıştırma.

## 📥 Kurulum (Local / Geliştirici Modu)

Projeyi bilgisayarınıza indirip Chrome'a eklemek oldukça basittir:

1. Bu projeyi bilgisayarınıza indirin (ZIP veya `git clone` ile).
2. Google Chrome tarayıcınızı açın.
3. Adres çubuğuna `chrome://extensions/` yazın ve Enter'a basın.
4. Sağ üst köşede bulunan **"Geliştirici Modu"** (Developer mode) anahtarını aktif hale getirin.
5. Sol üstte beliren **"Paketlenmemiş öğe yükle"** (Load unpacked) butonuna tıklayın.
6. İndirmiş olduğunuz projenin bulunduğu klasörü (içinde `manifest.json` olan dizin) seçin.
7. Eklenti tarayıcınıza yüklenecektir. Sağ üstteki eklentiler (puzzle) ikonuna tıklayıp eklentiyi pinleyerek (sabitleyerek) kolayca erişebilirsiniz.

---

*Furkan Akkaya - İTÜ Siber Güvenlik Mühendisliği*
