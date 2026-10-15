# Umar Creates — mini kurs sayti

Oddiy HTML, CSS va JavaScript loyiha. Framework, `npm install` yoki build bosqichi talab qilinmaydi.

| Manzil | Sahifa |
| --- | --- |
| `/` | Asosiy saytning avvalgi dizayni |
| `/a/` | Taqdim etilgan redesign asosidagi yangi variant |

Ikkala sahifada kurs ma'lumotlari, narx, videolar, sharhlar, Telegram havolalari, ro'yxatdan o'tish va Pixel logikasi bir xil. `vercel.json` ichidagi `trailingSlash: true` sozlamasi `/a` manzilini `/a/` ko'rinishiga yo'naltiradi.

## Fayllar

| Fayl yoki papka | Vazifasi |
| --- | --- |
| `index.html` | Asosiy sahifa va uning ichki CSS uslublari |
| `a/index.html` | Redesign sahifa; birinchi ekran uchun critical CSS shu faylda |
| `a/css/main.css` | Redesign sahifaning qolgan, alohida yuklanadigan CSS uslublari |
| `js/main.js` | Umumiy forma, taymer, Telegram, Sheets, video va sharhlarni ochish logikasi |
| `js/tracking.js` | Ikkala sahifa ishlatadigan mavjud Meta Pixel |
| `js/variant-a.js` | Redesign ko'rinishi: darslarni yoyish va pastki CTA panelini ko'rsatish |
| `assets/`, `reviews/`, `works/` | Loyihaning mavjud media fayllari; yangi variant ham shu manbalardan foydalanadi |
| `vercel.json` | URL, kesh va HTTP sarlavhalari sozlamalari |

Videolar mavjud Gumlet manbalaridan yuklanadi. HLS ijrosi uchun kerak bo'lganda `hls.js` yuklanadi; sharh rasmlari, muallif surati va ommaviy oferta loyiha ichidagi umumiy fayllardan olinadi.

## Ro'yxatdan o'tish

Xarid tugmalari ism va telefon formasini ochadi. Ism kamida ikki belgidan, telefon esa `+998` dan keyin to'qqiz raqamdan iborat bo'lishi kerak.

To'g'ri to'ldirilgan forma `js/main.js` dagi mavjud bot backendiga yuboriladi. Parallel ravishda ism, telefon va vaqt mavjud Google Sheets integratsiyasining `Lead` varag'iga yuboriladi. Sheets so'rovi `no-cors` orqali ketgani uchun sahifa javobdan yozuv saqlanganini tasdiqlay olmaydi.

Backend muvaffaqiyatli javob bersa, Telegram tugmasiga foydalanuvchining shaxsiy bot havolasi o'rnatiladi. Xato yuz bersa yoki so'rov to'rt soniyada yakunlanmasa, oddiy bot havolasi ko'rsatiladi. Telegram foydalanuvchi tugmani bosganda ochiladi; avtomatik yo'naltirish yo'q.

Mavjud Pixel sahifa ochilganda `PageView`, xarid tugmasi bosilganda `InitiateCheckout`, forma yakuniy ekraniga o'tganda `CompleteRegistration` hodisalarini yuboradi. Ikkala variant umumiy skriptlardan foydalanadi.

## Mahalliy ishga tushirish

Loyiha papkasida mahalliy `tools/` mavjud bo'lsa:

```sh
node tools/serve.mjs 5179
```

Yangi klonda `tools/` bo'lmasa, Python bilan:

```sh
python -m http.server 5179
```

Brauzerda `http://localhost:5179/` va `http://localhost:5179/a/` manzillarini oching.

Mahalliy tenglik tekshiruvi mavjud bo'lsa:

```sh
node tools/verify-variant.mjs
```

Bu tekshiruv umumiy skriptlar, forma validatsiyasi, so'rov maydonlari, Telegram havolalari, xato va timeout holatlari, Pixel hodisalari hamda media tengligini tekshiradi. Tarmoq so'rovlari taqlid qilinadi: haqiqiy lid yoki Pixel hodisasi yuborilmaydi. `tools/` mahalliy yordamchi papka bo'lib, Git tomonidan e'tiborga olinmaydi.
