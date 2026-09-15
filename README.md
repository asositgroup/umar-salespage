# Umar Creates — Sales Page

Statik HTML sayt. Hech qanday build, framework yoki npm kerak emas.

---

## 1. Vercel'ga yuklash

**Variant A — eng oson (Drag & Drop)**

1. [vercel.com/new](https://vercel.com/new) ochiladi
2. Shu papka to'liq holda sudralib tashlanadi
3. Deploy → tayyor

**Variant B — GitHub orqali**

```bash
git init
git add .
git commit -m "Umar Creates sales page"
git remote add origin <repo-url>
git push -u origin main
```
Keyin Vercel'da repo ulanadi. Framework Preset: **Other**. Build command yo'q.

**Variant C — CLI**

```bash
npm i -g vercel
vercel --prod
```

---

## 2. Sozlash — 4 ta majburiy qadam

### 2.1 Meta Pixel

`index.html` faylida **2 joyda** `PIXEL_ID` yozilgan. Ikkalasini ham real ID ga almashtiring:

```js
fbq('init','PIXEL_ID');   // ← bu yerda
```
```html
src="https://www.facebook.com/tr?id=PIXEL_ID&ev=PageView&noscript=1"   <!-- va bu yerda -->
```

### 2.2 Telegram admin

Final CTA blokida:

```html
<a href="https://t.me/UMAR_ADMIN" ...>
```
`UMAR_ADMIN` → real admin username.

### 2.3 Backend endpoint

`<script>` ichidagi CONFIG blokida:

```js
var CONFIG = {
  BOT_USERNAME : 'umar_creates_minikurs_tolov_bot',
  LEAD_ENDPOINT: '/api/lead',
  TIMER_HOURS  : 9,
  TIMER_MINUTES: 59
};
```

Forma shu endpointga **POST** yuboradi:

```json
{
  "name":   "Shaxbozbek",
  "phone":  "998901234567",
  "source": "hero",
  "fbp":    "fb.1.1755600000.123456789",
  "fbc":    "fb.1.1755600000.IwAR...",
  "url":    "https://...",
  "ts":     1755600000000
}
```

Backend **shunday javob qaytarishi kerak:**

```json
{ "lead_id": "abc123" }
```

`lead_id` kelgach, sayt Telegram tugmasini avtomatik shunday qiladi:

```
https://t.me/umar_creates_minikurs_tolov_bot?start=abc123
```

> **Bu eng muhim qism.** Bot `/start abc123` ni olib, bazadan ism va telefonni topadi va foydalanuvchidan **hech narsa so'ramaydi** — to'g'ridan-to'g'ri to'lov tugmalarini beradi.
>
> Agar backend javob bermasa yoki xato bersa, sayt baribir Telegram tugmasini ko'rsatadi (`lead_id` siz). Ya'ni sayt hech qachon "sinib" qolmaydi.

### 2.4 Media fayllar

Hozir joylarda placeholder turibdi. Har birining yonida HTML izoh bor — o'sha izohdagi kodga almashtiring.

| Nima | Qayerda | Format |
|---|---|---|
| 3 ta o'quvchi videosi | «O'QUVCHILAR QILGAN ISHLAR» | 9:16 mp4, `autoplay muted loop playsinline` |
| 3 ta sharh screenshoti | «O'QUVCHILAR NIMA DEYAPTI?» | kvadrat jpg/png |
| Umarning surati | «MUALLIF» | kvadrat jpg, **real surat** |
| VSL video | «KURS HAQIDA VIDEODA» | 16:9 mp4 + poster rasm |

Fayllarni `/works/` va `/reviews/` papkalariga qo'ying.

**Muhim:** videolar siqilgan bo'lsin (har biri 2–3 MB dan oshmasin). Sayt tezligi konversiyaga to'g'ridan-to'g'ri ta'sir qiladi.

---

## 3. Deploydan keyin tekshirish

Quyidagilarning **har birida** o'zingiz sinab ko'ring:

- [ ] **Instagram ilovasi ichidan** havola ochiladimi → forma → Telegram tugmasi ishlaydimi
- [ ] **Facebook ilovasi ichidan** — xuddi shunday
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] Telefonda forma maydonida **raqam klaviaturasi** ochiladimi
- [ ] Events Manager → Test Events da `PageView`, `InitiateCheckout`, `CompleteRegistration` ko'rinadimi
- [ ] Sahifa **3 soniyadan tez** yuklanadimi (PageSpeed Insights)

> Instagram/Facebook **ichki brauzeri** — eng muhim tekshiruv. Shu sababli saytda avtomatik redirect yo'q, faqat tugma: ichki brauzerlarda avtomatik o'tish bloklanadi, foydalanuvchining o'z bosishi esa ishlaydi.

---

## 4. Texnik ma'lumot

- Tashqi kutubxona **yo'q** — faqat Meta Pixel
- Shriftlar: tizim shriftlari (tashqi so'rov yo'q, tez yuklanadi)
- Taymer `localStorage` da saqlanadi (09:59:00, har foydalanuvchi uchun alohida)
- Mobil uchun sticky pastki CTA
- `prefers-reduced-motion` va `env(safe-area-inset-bottom)` hisobga olingan
- Butun sayt bitta `index.html` faylida

---

## 5. Papka tuzilishi

```
umar-salespage/
├── index.html        ← butun sayt
├── vercel.json       ← cache va header sozlamalari
├── works/            ← o'quvchi videolari
├── reviews/          ← sharh screenshotlari
└── README.md
```
