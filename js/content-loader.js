/**
 * content-loader.js — načítá texty z content.json do HTML.
 *
 * FALLBACK: Pokud se content.json nepodaří načíst (chybí soubor, offline,
 * nevalidní JSON), skript tiše skončí a na stránce zůstanou texty napsané
 * napevno v HTML. Web tedy funguje i bez JSONu.
 *
 * Použití v HTML:
 *   <p data-cms="hero.perex">Původní text jako fallback</p>
 *   <p data-cms-html="about.signature">Text s\nřádky → &lt;br&gt;</p>
 *   <a data-cms="contact.email" data-cms-href="mailto:contact.email">...</a>
 */
(function () {
  "use strict";

  /** Vytáhne hodnotu z objektu podle tečkové cesty: "services.items.0.title" */
  function resolve(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc == null ? undefined : acc[key];
    }, obj);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function apply(data) {
    // 1. Prostý text
    document.querySelectorAll("[data-cms]").forEach(function (el) {
      var value = resolve(data, el.getAttribute("data-cms"));
      if (typeof value === "string" && value.length) {
        el.textContent = value;
      }
    });

    // 2. Text s podporou zalomení řádků (\n → <br>)
    document.querySelectorAll("[data-cms-html]").forEach(function (el) {
      var value = resolve(data, el.getAttribute("data-cms-html"));
      if (typeof value === "string" && value.length) {
        el.innerHTML = escapeHtml(value).replace(/\n/g, "<br/>");
      }
    });

    // 3. Atribut href — podporuje prefix, např. "mailto:contact.email"
    document.querySelectorAll("[data-cms-href]").forEach(function (el) {
      var spec = el.getAttribute("data-cms-href");
      var prefix = "";
      var path = spec;
      var colon = spec.indexOf(":");
      if (colon > -1) {
        prefix = spec.slice(0, colon + 1);
        path = spec.slice(colon + 1);
      }
      var value = resolve(data, path);
      if (typeof value === "string" && value.length) {
        el.setAttribute("href", prefix + value);
      }
    });

    // 4. Číselné countery (data-target pro animaci)
    document.querySelectorAll("[data-cms-counter]").forEach(function (el) {
      var value = resolve(data, el.getAttribute("data-cms-counter"));
      if (value != null && String(value).length) {
        el.setAttribute("data-target", String(value));
      }
    });

    document.documentElement.setAttribute("data-cms-loaded", "true");
  }

  // Cache-busting: bez toho by GitHub Pages servíroval starý JSON po editaci
  var url = "content.json?v=" + Date.now();

  fetch(url, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(apply)
    .catch(function (err) {
      // Fallback — ponecháme texty z HTML
      console.warn("[content-loader] content.json se nepodařilo načíst, používám texty z HTML.", err.message);
    });
})();
