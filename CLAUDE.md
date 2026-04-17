# CLAUDE.md — Langr Instalatérské služby

> Tento soubor je primární instrukční dokument pro Claude Code.
> Přečti ho celý před jakoukoli úpravou projektu.

---

## 📋 Přehled projektu

**Název:** Langr — Instalatérské služby  
**Typ:** Statická prezentační stránka (single-page)  
**Klient:** Lukáš Langr, OSVČ instalatér  
**Tagline:** *Když to teče, víme proč*  
**Oblast:** Praha & Středočeský kraj  
**Status:** 🟡 Rozpracováno — placeholders aktivní, formulář nefunkční

Osobní prezentační web pro živnostníka-instalatéra. Důraz na editorial design,
důvěryhodnost a přímý kontakt. Žádný e-shop, žádné přihlašování.

---

## 📁 Seznam souborů

```
/
├── index.html          # Jediný soubor — celá SPA stránka
├── .gitattributes      # LF normalizace
└── CLAUDE.md           # Tento soubor
```

> ⚠️ Projekt je záměrně bez build toolu. Vše inline v `index.html`.

---

## 🛠 Tech Stack

| Vrstva        | Technologie                          | Verze / poznámka              |
|---------------|--------------------------------------|-------------------------------|
| HTML          | Vanilla HTML5                        | Single file                   |
| CSS           | Tailwind CSS (CDN)                   | `cdn.tailwindcss.com` + plugins: forms, container-queries |
| JS            | Vanilla JS (inline `<script>`)       | ES2020+, bez frameworku       |
| Fonty         | Google Fonts (CDN)                   | Noto Serif + Plus Jakarta Sans |
| Ikony         | Material Symbols Outlined (CDN)      | Variable font                 |
| Obrázky       | Google AIDA public CDN               | 🔴 PLACEHOLDER — vyměnit!    |

**Tailwind config** je inline v `<script id="tailwind-config">` — rozšiřuje téma
o vlastní barvy (Material Design 3 token sada), border-radius a font-family.

---

## 🎨 Design Systém

### Barvy (Tailwind tokeny)

| Token                    | Hex         | Použití                          |
|--------------------------|-------------|----------------------------------|
| `primary`                | `#1a6fb5`   | CTA, akcenty, nadpisy, ikony     |
| `on-primary`             | `#ffffff`   | Text na primary plochách         |
| `primary-container`      | `#1a6fb5`   | Karty (alias na primary)         |
| `surface`                | `#fbf9f6`   | Hlavní pozadí                    |
| `surface-container`      | `#efeeeb`   | Karty služeb                     |
| `surface-container-low`  | `#f5f3f0`   | Portfolio, testimonials, footer  |
| `surface-container-lowest`| `#ffffff`  | Bílé sekce (O mně, Portfolio)    |
| `on-surface`             | `#1b1c1a`   | Primární text                    |
| `on-surface-variant`     | `#414751`   | Sekundární text, popisky         |
| `outline-variant`        | `#c1c7d2`   | Jemné oddělovače, bordery        |
| `error`                  | `#ba1a1a`   | Chybové stavy (form validace)    |
| `background`             | `#fbf9f6`   | Body background                  |

### Typografie

| Rodina         | Font                | Použití                              |
|----------------|---------------------|--------------------------------------|
| `font-headline`| Noto Serif          | H1–H4, citáty, logo, podpis         |
| `font-body`    | Plus Jakarta Sans   | Tělo textu, navigace, labely        |
| `font-label`   | Plus Jakarta Sans   | Malé uppercase popisky (totožné)    |

**Typografické vzory:**
- Sekční nadpisy: `text-xs tracking-[0.4em] uppercase font-bold text-primary` (eyebrow label)
- H1: `font-headline text-4xl md:text-6xl lg:text-7xl`
- H2: `font-headline text-5xl`
- Perex: `text-on-surface-variant text-base md:text-lg leading-relaxed`

### Border Radius

```
DEFAULT / lg  →  4px   (tlačítka, inputy)
xl            →  8px   (service-cards)
full          →  9999px
```

### Dekorativní prvky

- `.editorial-grain` — noise texture overlay (opacity 0.03), aplikováno na `<main>`
- `.hairline-x / .hairline-y` — 1px oddělovač (rgba 113,119,130 / 0.2)
- Grain texture URL: `https://lh3.googleusercontent.com/aida-public/AB6AXuD7is5kos_t8dnJO94x2qXamXnKwtNZ42ZKME...` 🔴 PLACEHOLDER

---

## 🧩 Komponenty & Interakce

### Navigace (`<nav>`)
- Fixed top, `z-50`, backdrop-blur
- `nav.scrolled` třída při `scrollY > 60` → frosted glass efekt
- `.nav-link` — slide underline hover (CSS `::after`)
- `.nav-link.is-active` — modré podtržení aktivní sekce (IntersectionObserver)
- `scroll-padding-top: 72px` pro anchor links

### Hamburger menu (`#hamburger-btn`, `#mobile-menu`)
- Tři linie → křížek animace při `.open`
- Slide-in z pravé strany (`translateX`)
- Zavírá se kliknutím na odkaz

### Scroll progress bar (`#scroll-progress`)
- 2px modrá linka top: 0, width = % scrollu

### Animace `.reveal`
- IntersectionObserver, threshold 0.08
- Výchozí: `opacity: 0`, při `.active`: `opacity: 1`
- Varianta `.reveal-from-bottom`: + `translateY(30px)`
- `transition-delay` inline style pro kaskádu

### Počítadla `.counter`
- `data-target` atribut s cílovou hodnotou
- Ease-out cubic animace při vstupu do viewportu (1800ms)
- Hodnoty: 10+ let, 200+ realizací

### Karty služeb `.service-card`
- Hover: `translateY(-8px)`, modrý stín, světlejší bg
- Velké číslo `.service-num` (opacity 0.1 → 0.35 + scale při hoveru)
- `.service-title` → modrá při hoveru

### Portfolio `.portfolio-item`
- Hover: `scale(1.07)` na img + zrušení `grayscale`
- `.portfolio-overlay` — modrý overlay opacity 0→1
- Ikona `zoom_in` — `scale(0.6) rotate(-10deg)` → `scale(1) rotate(0deg)`

### Testimonials `.testimonial-block`
- Hover: `translateX(10px)` (levý) / `translateX(-10px)` (pravý `.testimonial-block-right`)

### Tlačítka `.btn-shimmer`
- Shimmer efekt `::after` při hoveru (skewed white gradient)
- `active:scale-95` haptic feedback

### Formulář
- `.form-field:focus-within` — modrý `border-color`
- Label zmodrá při focusu
- `<select>` bez custom arrow (nativní)
- 🔴 Formulář **neodesílá data** — pouze UI shell

### Kontaktní linky `.contact-link`
- Slide underline `::after` při hoveru

---

## 📊 Struktura dat (statická)

```
Klient:
  jméno:    Lukáš Langr
  email:    lukaslangr11@seznam.cz
  telefon:  +420 732 964 228
  oblast:   Praha & Středočeský kraj
  IČO:      [neuveden]

Statistiky:
  praxe:    10+ let
  realizace: 200+

Služby: [4]
  01 - Vodoinstalace (měď, REHAU)
  02 - Vytápění (podlahové, TČ, hydraulické vyvážení)
  03 - Plynoinstalace (revize, kondenzační kotle)
  04 - Koupelny (AXOR, Hansgrohe)

Testimonials: [2]
  - Ing. Tomáš Beran, Praha (rekonstrukce koupelny)
  - Jana Kyselová (vytápění)

Portfolio: [4 položky]
  - Měděné rozvodné systémy
  - Koupelna v soukromé rezidenci
  - Centrální topný uzel
  - Nástroje mistra svého oboru
```

---

## 🔴 Stav Placeholderů

| # | Typ         | Popis                                      | Priorita |
|---|-------------|---------------------------------------------|----------|
| 1 | Obrázek     | Hero foto Lukáše Langra (AIDA CDN)         | 🔴 HIGH  |
| 2 | Obrázek     | 4× portfolio fotky (AIDA CDN)              | 🔴 HIGH  |
| 3 | Obrázek     | Emergency banner pozadí (AIDA CDN)         | 🟡 MED   |
| 4 | Obrázek     | Grain texture (AIDA CDN)                   | 🟢 LOW   |
| 5 | Formulář    | Odeslání dat (žádný backend/mailto)        | 🔴 HIGH  |
| 6 | IČO/DIČ     | Chybí v patičce                            | 🟡 MED   |
| 7 | Sociální    | Žádné FB/Instagram linky                   | 🟢 LOW   |
| 8 | Copyright   | `© 2024` — aktualizovat na 2025            | 🟢 LOW   |
| 9 | Reference   | "Zobrazit všechny reference" nikam nevede  | 🟡 MED   |
| 10| Portfolio   | Chybí lightbox/modal pro zoom              | 🟡 MED   |

---

## ✅ TODO Seznam

### 🔴 Kritické (před spuštěním)
- [ ] Nahradit všechny AIDA CDN obrázky reálnými fotkami klienta
- [ ] Napojit formulář (Formspree / Netlify Forms / mailto fallback)
- [ ] Přidat grain texturu jako lokální soubor (ne CDN)
- [ ] Otestovat na iOS Safari (viewport, sticky nav)

### 🟡 Důležité
- [ ] Přidat IČO do patičky (zákonná povinnost)
- [ ] Opravit copyright na aktuální rok
- [ ] Přidat `<meta description>` a Open Graph tagy
- [ ] Přidat `favicon.ico` / SVG favicon
- [ ] Přidat `sitemap.xml` a `robots.txt`
- [ ] Implementovat lightbox pro portfolio (např. GLightbox)
- [ ] "Zobrazit všechny reference" → buď schovat nebo udělat modální galerii
- [ ] Přidat `schema.org` LocalBusiness markup pro SEO

### 🟢 Nice to have
- [ ] Dark mode toggle (Tailwind `darkMode: "class"` již nakonfigurován)
- [ ] Facebook / Instagram odkazy v patičce
- [ ] Google Analytics / Plausible
- [ ] Cookie consent banner (GDPR)
- [ ] Přidat animaci na logo v hero (krátký entrance)
- [ ] Zvážit přidání sekce s ceníkem (nebo "Individuální nabídka")

---

## 🤖 Instrukce pro Claude Code

### Obecná pravidla

1. **Vždy pracuj v `index.html`** — žádné nové soubory bez explicitního souhlasu.
2. **Zachovej Tailwind CDN přístup** — nepřidávej npm/build step bez dovolení.
3. **Inline JS zůstává inline** — nerozděluji do externích souborů.
4. **Jazyk webu je čeština** — veškerý obsah, labely, placeholder texty česky.
5. **Barvy POUZE přes Tailwind tokeny** — ne hardcoded hex hodnoty v class.
6. **Neměň design systém** bez explicitního zadání (barvy, fonty, spacing).

### Před každou změnou

```
1. Zkontroluj sekci TODO — je úkol tam?
2. Zkontroluj Placeholdery — nenahrazuješ AIDA CDN reálnými daty omylem?
3. Ověř, že změna neporuší mobilní layout (md: breakpoint je klíčový)
4. Zkontroluj .reveal animace — nové sekce musí mít třídu
```

### Formátování commitů

```
feat: přidána funkce XY
fix: opraveno Z na mobilní verzi
content: aktualizovány texty sekce O mně
style: upraven hover efekt karet
chore: aktualizován copyright
```

### ⚠️ Automatická připomínka po každé změně

> **Po dokončení úprav VŽDY připomeň:**
> ```
> git add -A
> git commit -m "popis změny"
> git push
> ```
> Nezapomeň pushnout — jinak změny nejsou live!

### Testovací checklist před commitem

- [ ] Stránka se načte bez JS chyb v konzoli
- [ ] Hamburger menu funguje (open/close)
- [ ] Scroll progress bar se pohybuje
- [ ] Countery se animují při scrollu
- [ ] Formulář vizuálně reaguje na focus
- [ ] Všechny anchor linky (#sluzby, #kdo-jsem, #prace, #kontakt) fungují
- [ ] Layout na 375px (iPhone SE) vypadá rozumně

---

## 📝 Changelog

### v0.1.0 — Inicializace (2024)
- ✅ Kompletní HTML shell s Tailwind CDN
- ✅ Navigace (desktop + mobile hamburger)
- ✅ Hero sekce s foto a CTA
- ✅ Stats strip s animovanými countery
- ✅ 4× service cards s hover efekty
- ✅ O mně sekce (editorial letter style)
- ✅ Portfolio grid (3 sloupce, grayscale → color hover)
- ✅ 2× testimonials s drift hover
- ✅ Emergency banner s telefonním CTA
- ✅ Kontaktní formulář (UI only)
- ✅ Patička
- ✅ Scroll progress bar
- ✅ IntersectionObserver reveal animace
- ✅ Aktivní nav link highlight
- 🔴 Obrázky jsou AIDA CDN placeholdery
- 🔴 Formulář neodesílá data

---

*Soubor generován pro Claude Code. Aktualizuj changelog při každé verzi.*
