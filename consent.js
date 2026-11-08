/* Aviso de cookies e voltar ao início · JS puro, usado em todas as páginas */
(() => {
  "use strict";

  const KEY = "camila-consent";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  };
  const save = (analytics) => {
    const value = { v: 1, analytics, date: new Date().toISOString().slice(0, 10) };
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* sem armazenamento: a escolha vale só nesta visita */ }
    // Ponto de ligação para análises futuras: só devem carregar quando detail.analytics for true.
    window.dispatchEvent(new CustomEvent("consent-change", { detail: value }));
  };

  let banner = null;
  let opener = null;

  const build = () => {
    banner = document.createElement("section");
    banner.className = "consent";
    banner.hidden = true;
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "consent-title");
    banner.setAttribute("tabindex", "-1");
    banner.innerHTML =
      '<div class="consent__text">' +
        '<h2 class="consent__title" id="consent-title">Sua privacidade</h2>' +
        "<p>Não usamos cookies de publicidade nem de rastreamento. Guardamos só a sua escolha neste navegador. Se um dia usarmos análises de visitas, só será com o seu aceite. " +
        '<a href="/privacidade.html">Política de privacidade</a></p>' +
      "</div>" +
      '<div class="consent__actions">' +
        '<button type="button" class="btn btn--sm" data-consent="accept"><span class="btn__label">Aceitar</span></button>' +
        '<button type="button" class="btn btn--sm btn--outline" data-consent="reject"><span class="btn__label">Recusar</span></button>' +
      "</div>";
    document.body.appendChild(banner);

    banner.addEventListener("click", (e) => {
      const button = e.target instanceof Element && e.target.closest("[data-consent]");
      if (!button) return;
      save(button.dataset.consent === "accept");
      close();
    });
  };

  const open = (fromUser) => {
    if (!banner) build();
    banner.hidden = false;
    document.body.classList.add("consent-open");
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add("is-open")));
    if (fromUser) banner.focus({ preventScroll: true });
  };

  const close = () => {
    banner.classList.remove("is-open");
    document.body.classList.remove("consent-open");
    window.setTimeout(() => { banner.hidden = true; }, reduceMotion ? 0 : 700);
    if (opener) { opener.focus({ preventScroll: true }); opener = null; }
  };

  document.addEventListener("click", (e) => {
    const trigger = e.target instanceof Element && e.target.closest("[data-consent-open]");
    if (!trigger) return;
    opener = trigger;
    open(true);
  });

  if (read() === null) window.setTimeout(() => open(false), 900);

  /* Voltar ao início nas páginas sem o motor de rolagem da página principal */
  document.addEventListener("click", (e) => {
    const link = e.target instanceof Element && e.target.closest("a[data-top]");
    if (!link || window.__lineReady) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
})();
