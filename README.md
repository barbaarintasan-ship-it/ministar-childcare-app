# MINI STAR Childcare — Parent App

Aab casri ah oo bilingual (Ingiriisi + Isbaanish) oo loogu talagalay daycare carruurta yaryar ee aan iskoolka gaarin.
A modern bilingual (English + Spanish) parent app for a small-children daycare.

## Sida loo isticmaalo / How to use

1. Fur (open) `index.html` browser kasta (Chrome, Safari, Firefox...).
2. Logo-ga waxa uu ka soo qaadanayaa faylka `logo.png` ee isla folder-ka ku jira.
   The logo loads from the `logo.png` file in the same folder.

> Haddii aad rabto inaad fur `index.html` directly tijaabineyso oo logo-gu soo bixi waayo,
> ku shaqee server yar: `python3 -m http.server` kadibna fur `http://localhost:8000`.
> (Qaar browser ah ayaa joojiya local images marka file:// la isticmaalo.)

## Faylasha / Files

- `index.html` — Aabka oo dhammaystiran (HTML + CSS + JavaScript hal fayl).
- `logo.png`   — Logo-ga asalka ah ee MINI STAR Childcare.

## Astaamaha / Features

- 🏠 **Home / Inicio** — Warqadaha, jadwalka toddobaadka, shaqaalaha, xaaladda maalinta.
- 📋 **Daily Report / Reporte** — Cuntada, jiifka, caafimaadka, qoraalka macallinka.
- 🎨 **Activities / Actividades** — Hawlaha maalinta + sawirrada.
- 💬 **Messages / Mensajes** — Xiriirka waalidka & macallinka (geli fariin oo dhufo Enter).
- 🌐 **EN / ES** — Riix badhanka kor saaran si aad u beddesho luqada.

## Wax ka beddelid / Customization

Dhammaan qoraalka iyo xogta (magacyada, cuntada, hawlaha...) waxay ku jiraan
`const T = {...}` ee `index.html` dhexdiisa. Halkaas ka beddel si fudud.

All text and data (names, meals, activities…) live in the `const T = {...}`
object inside `index.html`. Edit there easily.
