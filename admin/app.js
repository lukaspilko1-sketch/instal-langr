/**
 * app.js — logika admin panelu.
 * Čte a zapisuje content.json přes GitHub Contents API.
 */
(function () {
  "use strict";

  var CFG = window.ADMIN_CONFIG;
  var API = "https://api.github.com";

  var state = {
    token: null,
    content: null,   // aktuální data (upravovaná)
    original: null,  // stav po načtení, pro detekci změn
    sha: null,       // SHA souboru na GitHubu (nutné pro zápis)
    activeSection: null
  };

  /* ============================================================
   *  SCHÉMA FORMULÁŘŮ
   * ============================================================ */
  var SCHEMA = [
    {
      id: "hero", icon: "home", label: "Hero sekce",
      desc: "Úvodní obrazovka webu — první, co návštěvník uvidí.",
      fields: [
        { path: "hero.tagline",      label: "Tagline u loga",    type: "text" },
        { path: "hero.eyebrow",      label: "Nadtitulek",        type: "text" },
        { path: "hero.headingLine1", label: "Nadpis — 1. řádek", type: "text" },
        { path: "hero.headingLine2", label: "Nadpis — 2. řádek", type: "text", hint: "Zobrazuje se kurzívou modře" },
        { path: "hero.perex",        label: "Perex",             type: "textarea" },
        { path: "hero.ctaText",      label: "Text tlačítka",     type: "text" }
      ]
    },
    {
      id: "stats", icon: "trending_up", label: "Statistiky",
      desc: "Modrý pruh s čísly pod hero sekcí.",
      fields: [
        { path: "stats.yearsValue",     label: "Let praxe — číslo",   type: "text", hint: "Jen číslo, znak + se přidá automaticky" },
        { path: "stats.yearsLabel",     label: "Let praxe — popisek", type: "text" },
        { path: "stats.projectsValue",  label: "Realizací — číslo",   type: "text", hint: "Jen číslo, znak + se přidá automaticky" },
        { path: "stats.projectsLabel",  label: "Realizací — popisek", type: "text" },
        { path: "stats.locationValue",  label: "Lokalita — hlavní",   type: "text" },
        { path: "stats.locationLabel",  label: "Lokalita — popisek",  type: "text" }
      ]
    },
    {
      id: "services", icon: "plumbing", label: "Služby",
      desc: "Sekce „Expertíza“ se čtyřmi kartami služeb.",
      fields: [
        { path: "services.eyebrow",       label: "Nadtitulek",        type: "text" },
        { path: "services.headingLine1",  label: "Nadpis — 1. řádek", type: "text" },
        { path: "services.headingLine2",  label: "Nadpis — 2. řádek", type: "text" },
        { path: "services.perex",         label: "Perex",             type: "textarea" },
        { divider: "Karta 01" },
        { path: "services.items.0.title", label: "Název",  type: "text" },
        { path: "services.items.0.text",  label: "Popis",  type: "textarea" },
        { divider: "Karta 02" },
        { path: "services.items.1.title", label: "Název",  type: "text" },
        { path: "services.items.1.text",  label: "Popis",  type: "textarea" },
        { divider: "Karta 03" },
        { path: "services.items.2.title", label: "Název",  type: "text" },
        { path: "services.items.2.text",  label: "Popis",  type: "textarea" },
        { divider: "Karta 04" },
        { path: "services.items.3.title", label: "Název",  type: "text" },
        { path: "services.items.3.text",  label: "Popis",  type: "textarea" }
      ]
    },
    {
      id: "about", icon: "person", label: "O mně",
      desc: "Osobní text v podobě dopisu.",
      fields: [
        { path: "about.eyebrow",    label: "Nadtitulek",   type: "text" },
        { path: "about.heading",    label: "Hlavní nadpis", type: "textarea" },
        { path: "about.paragraph1", label: "Odstavec 1",   type: "textarea" },
        { path: "about.paragraph2", label: "Odstavec 2",   type: "textarea" },
        { path: "about.paragraph3", label: "Odstavec 3",   type: "textarea" },
        { path: "about.paragraph4", label: "Odstavec 4",   type: "textarea" },
        { path: "about.signature",  label: "Podpis",       type: "textarea", hint: "Zalomení řádku = nový řádek na webu" }
      ]
    },
    {
      id: "portfolio", icon: "photo_library", label: "Portfolio",
      desc: "Náhledová sekce s ukázkami práce na hlavní stránce.",
      fields: [
        { path: "portfolio.eyebrow", label: "Nadtitulek",    type: "text" },
        { path: "portfolio.heading", label: "Nadpis",        type: "text" },
        { path: "portfolio.ctaText", label: "Text tlačítka", type: "text" },
        { divider: "Popisky fotek" },
        { path: "portfolio.items.0.title", label: "Fotka 1", type: "text" },
        { path: "portfolio.items.1.title", label: "Fotka 2", type: "text" },
        { path: "portfolio.items.2.title", label: "Fotka 3", type: "text" },
        { path: "portfolio.items.3.title", label: "Fotka 4", type: "text" }
      ]
    },
    {
      id: "testimonials", icon: "format_quote", label: "Reference",
      desc: "Citace spokojených zákazníků.",
      fields: [
        { divider: "Reference 1" },
        { path: "testimonials.0.quote",  label: "Citace", type: "textarea" },
        { path: "testimonials.0.author", label: "Autor",  type: "text" },
        { divider: "Reference 2" },
        { path: "testimonials.1.quote",  label: "Citace", type: "textarea" },
        { path: "testimonials.1.author", label: "Autor",  type: "text" }
      ]
    },
    {
      id: "emergency", icon: "emergency", label: "Havárie",
      desc: "Tmavý banner s výzvou k telefonátu.",
      fields: [
        { path: "emergency.headingLine1", label: "Nadpis — 1. řádek", type: "text" },
        { path: "emergency.headingLine2", label: "Nadpis — 2. řádek", type: "text" },
        { path: "emergency.ctaText",      label: "Text tlačítka",     type: "text" },
        { path: "emergency.note",         label: "Poznámka pod tlačítkem", type: "text" }
      ]
    },
    {
      id: "contact", icon: "mail", label: "Kontakt",
      desc: "Kontaktní údaje — promítají se i do patičky.",
      fields: [
        { path: "contact.heading",        label: "Nadpis sekce",  type: "text" },
        { path: "contact.email",          label: "E-mail",        type: "text" },
        { path: "contact.phone",          label: "Telefon (zobrazený)", type: "text", hint: "Např. +420 732 964 228" },
        { path: "contact.phoneHref",      label: "Telefon (pro odkaz)", type: "text", hint: "Bez mezer, např. +420732964228" },
        { path: "contact.location",       label: "Lokalita",      type: "text" },
        { path: "contact.hours",          label: "Provozní doba", type: "text" },
        { path: "contact.formButtonText", label: "Text tlačítka formuláře", type: "text" }
      ]
    },
    {
      id: "footer", icon: "border_bottom", label: "Patička",
      desc: "Spodní část webu — fakturační a kontaktní údaje.",
      fields: [
        { path: "footer.brandText",      label: "Popis firmy",     type: "textarea" },
        { path: "footer.rating",         label: "Hodnocení",       type: "text", hint: "Např. 5,0" },
        { path: "footer.reviewCount",    label: "Počet hodnocení", type: "text" },
        { path: "footer.name",           label: "Jméno",           type: "text" },
        { path: "footer.ico",            label: "IČO",             type: "text" },
        { path: "footer.address",        label: "Adresa",          type: "textarea", hint: "Zalomení řádku = nový řádek na webu" },
        { path: "footer.hoursNormal",    label: "Provozní doba",   type: "text" },
        { path: "footer.hoursEmergency", label: "Havarijní doba",  type: "text" },
        { path: "footer.copyright",      label: "Copyright",       type: "text" },
        { path: "footer.domain",         label: "Doména",          type: "text" }
      ]
    },
    {
      id: "gallery", icon: "collections", label: "Stránka galerie",
      desc: "Texty na samostatné stránce galerie.html.",
      fields: [
        { path: "gallery.eyebrow",      label: "Nadtitulek",        type: "text" },
        { path: "gallery.headingLine1", label: "Nadpis — 1. řádek", type: "text" },
        { path: "gallery.headingLine2", label: "Nadpis — 2. řádek", type: "text" },
        { path: "gallery.perex",        label: "Perex",             type: "textarea" },
        { divider: "Výzva na konci stránky" },
        { path: "gallery.ctaHeading",   label: "Nadpis",            type: "text" },
        { path: "gallery.ctaPerex",     label: "Text",              type: "textarea" }
      ]
    }
  ];

  /* ============================================================
   *  POMOCNÉ FUNKCE
   * ============================================================ */
  function $(id) { return document.getElementById(id); }

  function getPath(obj, path) {
    return path.split(".").reduce(function (a, k) {
      return a == null ? undefined : a[k];
    }, obj);
  }

  function setPath(obj, path, value) {
    var keys = path.split(".");
    var last = keys.pop();
    var target = keys.reduce(function (a, k) {
      if (a[k] == null) a[k] = /^\d+$/.test(k) ? [] : {};
      return a[k];
    }, obj);
    target[last] = value;
  }

  // Base64 <-> UTF-8 (btoa neumí české znaky přímo)
  function utf8ToBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function base64ToUtf8(b64) {
    var bin = atob(b64.replace(/\s/g, ""));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }

  /* ============================================================
   *  TOASTY
   * ============================================================ */
  var ICONS = { success: "check_circle", error: "error", info: "info" };

  function toast(type, title, msg, duration) {
    var el = document.createElement("div");
    el.className = "toast " + type;
    el.innerHTML =
      '<span class="material-symbols-outlined toast-icon">' + (ICONS[type] || ICONS.info) + "</span>" +
      '<div><div class="toast-title"></div>' +
      (msg ? '<div class="toast-msg"></div>' : "") + "</div>";
    el.querySelector(".toast-title").textContent = title;
    if (msg) el.querySelector(".toast-msg").textContent = msg;

    $("toast-container").appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });

    setTimeout(function () {
      el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 450);
    }, duration || (type === "error" ? 7000 : 4000));
  }

  /* ============================================================
   *  GITHUB API
   * ============================================================ */
  function ghHeaders() {
    return {
      "Authorization": "Bearer " + state.token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }

  function contentsUrl() {
    return API + "/repos/" + CFG.owner + "/" + CFG.repo + "/contents/" + CFG.contentPath;
  }

  function ghError(res) {
    if (res.status === 401) return "Neplatný token. Zkontroluj, že jsi ho zkopíroval celý a že nevypršel.";
    if (res.status === 403) return "Token nemá oprávnění. Potřebuje 'Contents: Read and write' pro tento repozitář.";
    if (res.status === 404) return "Soubor nebo repozitář nenalezen. Zkontroluj owner/repo/contentPath v config.js.";
    if (res.status === 409) return "Konflikt — soubor byl mezitím změněn. Načti data znovu (tlačítko obnovit).";
    if (res.status === 422) return "GitHub odmítl zápis. Pravděpodobně neaktuální SHA — načti data znovu.";
    return "GitHub API vrátilo chybu " + res.status + ".";
  }

  function loadContent() {
    return fetch(contentsUrl() + "?ref=" + encodeURIComponent(CFG.branch), {
      headers: ghHeaders(),
      cache: "no-store"
    }).then(function (res) {
      if (!res.ok) throw new Error(ghError(res));
      return res.json();
    }).then(function (data) {
      var json = JSON.parse(base64ToUtf8(data.content));
      state.sha = data.sha;
      state.content = json;
      state.original = JSON.parse(JSON.stringify(json));
      return json;
    });
  }

  function saveContent() {
    var json = JSON.stringify(state.content, null, 2) + "\n";
    var message = CFG.commitMessage.replace("%date%", new Date().toLocaleString("cs-CZ"));

    return fetch(contentsUrl(), {
      method: "PUT",
      headers: Object.assign({ "Content-Type": "application/json" }, ghHeaders()),
      body: JSON.stringify({
        message: message,
        content: utf8ToBase64(json),
        sha: state.sha,
        branch: CFG.branch
      })
    }).then(function (res) {
      if (!res.ok) throw new Error(ghError(res));
      return res.json();
    }).then(function (data) {
      state.sha = data.content.sha;
      state.original = JSON.parse(JSON.stringify(state.content));
      return data;
    });
  }

  /* ============================================================
   *  RENDEROVÁNÍ FORMULÁŘŮ
   * ============================================================ */
  function buildNav() {
    var nav = $("section-nav");
    nav.innerHTML = "";
    SCHEMA.forEach(function (section) {
      var item = document.createElement("div");
      item.className = "nav-item";
      item.dataset.section = section.id;
      item.innerHTML =
        '<span class="material-symbols-outlined text-[18px]">' + section.icon + "</span>" +
        "<span>" + section.label + "</span>";
      item.addEventListener("click", function () { showSection(section.id); });
      nav.appendChild(item);
    });
  }

  function buildPanels() {
    var wrap = $("panels");
    wrap.innerHTML = "";

    SCHEMA.forEach(function (section) {
      var panel = document.createElement("div");
      panel.className = "panel";
      panel.dataset.section = section.id;

      var html = '<p class="text-sm text-on-surface-variant mb-8 pb-6 border-b border-outline-variant/20">' +
                 section.desc + "</p>";
      panel.innerHTML = html;

      section.fields.forEach(function (field) {
        if (field.divider) {
          var d = document.createElement("p");
          d.className = "text-[11px] tracking-[0.2em] uppercase font-bold text-on-surface-variant/50 mt-10 mb-4 pb-2 border-b border-outline-variant/20";
          d.textContent = field.divider;
          panel.appendChild(d);
          return;
        }

        var value = getPath(state.content, field.path);
        if (value == null) value = "";

        var box = document.createElement("div");
        box.className = "field mb-6";

        var inputHtml = field.type === "textarea"
          ? '<textarea rows="3"></textarea>'
          : '<input type="text"/>';

        box.innerHTML =
          "<label>" + field.label + "</label>" + inputHtml +
          (field.hint ? '<p class="hint">' + field.hint + "</p>" : "");

        var input = box.querySelector("input, textarea");
        input.value = value;

        if (field.type === "textarea") {
          // Auto-výška
          var autosize = function () {
            input.style.height = "auto";
            input.style.height = Math.max(90, input.scrollHeight) + "px";
          };
          setTimeout(autosize, 0);
          input.addEventListener("input", autosize);
        }

        input.addEventListener("input", function () {
          setPath(state.content, field.path, input.value);
          box.classList.toggle("dirty", input.value !== getPath(state.original, field.path));
          updateDirtyIndicator();
        });

        panel.appendChild(box);
      });

      wrap.appendChild(panel);
    });
  }

  function showSection(id) {
    state.activeSection = id;

    document.querySelectorAll(".nav-item[data-section]").forEach(function (el) {
      el.classList.toggle("active", el.dataset.section === id);
    });
    document.querySelectorAll(".panel").forEach(function (el) {
      el.classList.toggle("active", el.dataset.section === id);
    });

    var section = SCHEMA.filter(function (s) { return s.id === id; })[0];
    if (section) $("current-section-title").textContent = section.label;

    // Zavřít mobilní sidebar
    $("sidebar").classList.remove("open");
    $("sidebar-backdrop").classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function isDirty() {
    return JSON.stringify(state.content) !== JSON.stringify(state.original);
  }

  function updateDirtyIndicator() {
    $("dirty-indicator").classList.toggle("hidden", !isDirty());
  }

  /* ============================================================
   *  AKCE
   * ============================================================ */
  function enterAdmin() {
    $("login-screen").classList.add("hidden");
    $("admin-screen").classList.remove("hidden");
    $("admin-screen").classList.add("flex");

    $("repo-info").textContent = CFG.owner + "/" + CFG.repo + " · větev " + CFG.branch + " · " + CFG.contentPath;

    buildNav();
    buildPanels();
    showSection(SCHEMA[0].id);
    updateDirtyIndicator();
  }

  function doLogin() {
    var token = $("token-input").value.trim();
    if (!token) {
      toast("error", "Chybí token", "Vlož svůj GitHub Personal Access Token.");
      return;
    }

    var btn = $("login-btn");
    var btnText = $("login-btn-text");
    btn.disabled = true;
    btnText.innerHTML = '<span class="spinner"></span>';

    state.token = token;

    loadContent().then(function () {
      if ($("remember-token").checked) {
        localStorage.setItem(CFG.tokenStorageKey, token);
      } else {
        localStorage.removeItem(CFG.tokenStorageKey);
      }
      enterAdmin();
      toast("success", "Přihlášeno", "Obsah načten z GitHubu.");
    }).catch(function (err) {
      state.token = null;
      toast("error", "Přihlášení selhalo", err.message);
    }).finally(function () {
      btn.disabled = false;
      btnText.textContent = "PŘIHLÁSIT SE";
    });
  }

  function doSave() {
    if (!isDirty()) {
      toast("info", "Žádné změny", "Není co ukládat.");
      return;
    }

    var btn = $("save-btn");
    var btnText = $("save-btn-text");
    btn.disabled = true;
    btnText.innerHTML = '<span class="spinner"></span>';

    saveContent().then(function () {
      updateDirtyIndicator();
      document.querySelectorAll(".field.dirty").forEach(function (el) {
        el.classList.remove("dirty");
      });
      $("last-saved").textContent = "· naposledy uloženo " + new Date().toLocaleTimeString("cs-CZ");
      toast("success", "Uloženo",
        "Změny jsou na GitHubu. Web se aktualizuje do 1–2 minut (GitHub Pages potřebuje čas na nasazení).", 6000);
    }).catch(function (err) {
      toast("error", "Uložení selhalo", err.message);
    }).finally(function () {
      btn.disabled = false;
      btnText.textContent = "ULOŽIT";
    });
  }

  function doReload() {
    if (isDirty() && !confirm("Máš neuložené změny. Opravdu načíst data znovu a zahodit je?")) {
      return;
    }
    loadContent().then(function () {
      buildPanels();
      showSection(state.activeSection || SCHEMA[0].id);
      updateDirtyIndicator();
      toast("success", "Načteno", "Obsah je aktuální podle GitHubu.");
    }).catch(function (err) {
      toast("error", "Načtení selhalo", err.message);
    });
  }

  function doLogout() {
    if (isDirty() && !confirm("Máš neuložené změny. Opravdu se odhlásit?")) return;
    localStorage.removeItem(CFG.tokenStorageKey);
    state.token = null;
    state.content = null;
    state.original = null;
    state.sha = null;
    $("admin-screen").classList.add("hidden");
    $("admin-screen").classList.remove("flex");
    $("login-screen").classList.remove("hidden");
    $("token-input").value = "";
    toast("info", "Odhlášeno", "Token byl odstraněn z prohlížeče.");
  }

  /* ============================================================
   *  INICIALIZACE
   * ============================================================ */
  $("login-btn").addEventListener("click", doLogin);
  $("token-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") doLogin();
  });
  $("save-btn").addEventListener("click", doSave);
  $("reload-btn").addEventListener("click", doReload);
  $("logout-btn").addEventListener("click", doLogout);

  $("menu-toggle").addEventListener("click", function () {
    $("sidebar").classList.toggle("open");
    $("sidebar-backdrop").classList.toggle("open");
  });
  $("sidebar-backdrop").addEventListener("click", function () {
    $("sidebar").classList.remove("open");
    $("sidebar-backdrop").classList.remove("open");
  });

  // Ctrl/Cmd + S = uložit
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (state.token) doSave();
    }
  });

  // Varování při zavření s neuloženými změnami
  window.addEventListener("beforeunload", function (e) {
    if (state.token && isDirty()) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // Automatické přihlášení uloženým tokenem
  var saved = localStorage.getItem(CFG.tokenStorageKey);
  if (saved) {
    state.token = saved;
    $("login-btn-text").innerHTML = '<span class="spinner"></span>';
    $("login-btn").disabled = true;
    loadContent().then(function () {
      enterAdmin();
    }).catch(function (err) {
      state.token = null;
      localStorage.removeItem(CFG.tokenStorageKey);
      toast("error", "Uložený token selhal", err.message);
    }).finally(function () {
      $("login-btn").disabled = false;
      $("login-btn-text").textContent = "PŘIHLÁSIT SE";
    });
  }
})();
