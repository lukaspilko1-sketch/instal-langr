/**
 * config.js — nastavení admin panelu.
 *
 * Tento soubor je VEŘEJNÝ (je součástí GitHub Pages) — nikdy sem
 * nevkládej token! Token se zadává při přihlášení a ukládá se
 * pouze do localStorage tvého prohlížeče.
 */
window.ADMIN_CONFIG = {
  owner: "lukaspilko1-sketch",
  repo: "instal-langr",
  branch: "main",
  contentPath: "content.json",

  // Zpráva commitu při uložení (%date% se nahradí aktuálním datem a časem)
  commitMessage: "content: aktualizace obsahu z admin panelu (%date%)",

  // Klíč pro uložení tokenu v localStorage
  tokenStorageKey: "langr_admin_token"
};
