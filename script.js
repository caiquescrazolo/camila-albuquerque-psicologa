/* A Linha · interações em JS puro, sem dependências */
(() => {
  "use strict";

  // Número fictício: troque pelo WhatsApp real antes de publicar (DDI + DDD + número).
  // Troque também o mesmo número nos href="https://wa.me/..." do index.html (usados se o JS não carregar).
  const WHATSAPP = "5511900000000";
  const DEFAULT_MSG = "Olá, Camila! Vi o seu site e gostaria de agendar uma sessão.";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* WhatsApp com mensagem pronta */
  $$("[data-wa]").forEach((a) => {
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.msg || DEFAULT_MSG)}`;
  });
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* Títulos: palavra por palavra (hero ao carregar, seções ao aparecer) */
  if (!reduceMotion) {
    $$("[data-split], .h2").forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.setAttribute("aria-label", words.join(" "));
      el.innerHTML = words
        .map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`)
        .join(" ");
    });
  }
  window.__lineReady = true;

  /* Menu mobile */
  const toggle = $("[data-menu-toggle]");
  const menu = $("[data-menu]");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    $(".sr-only", toggle).textContent = open ? "Fechar menu" : "Abrir menu";
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 1121px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* Revelar ao rolar */
  const revealables = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-visible"));
  }

  /* A linha: preenchimento, estações acesas e menu */
  const header = $("[data-header]");
  const stops = $$("[data-stop]");
  const navLinks = $$("[data-spy]");
  const parallaxEls = $$("[data-parallax]");
  const heroVisual = $("[data-hero-visual] .hero__photo");
  const heroActions = $(".hero__actions");
  const endBtn = $(".stop--end .btn");
  const dock = $("[data-dock]");
  const dockLink = dock && $("a", dock);
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  const update = () => {
    const vh = window.innerHeight;
    const focus = vh * 0.45;
    let currentIndex = 0;

    // leituras primeiro, escritas depois (evita reflow a cada seção)
    const reads = stops.map((stop) => {
      const seg = stop.querySelector(".stop__seg").getBoundingClientRect();
      const node = stop.querySelector(".stop__node").getBoundingClientRect();
      return { fill: clamp((focus - seg.top) / seg.height, 0, 1), passed: node.top + node.height / 2 < focus };
    });
    reads.forEach((r, i) => { if (r.passed) currentIndex = i; });
    stops.forEach((stop, i) => {
      stop.style.setProperty("--fill", reads[i].fill.toFixed(4));
      stop.classList.toggle("is-passed", reads[i].passed);
      stop.classList.toggle("is-current", i === currentIndex);
    });

    navLinks.forEach((l) => {
      const active = l.getAttribute("href") === `#${stops[currentIndex].id}`;
      l.classList.toggle("is-active", active);
      if (active) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
    });

    header.classList.toggle("is-scrolled", window.scrollY > 8);

    if (!reduceMotion) {
      parallaxEls.forEach((el) => {
        const pr = el.parentElement.getBoundingClientRect();
        if (pr.bottom < 0 || pr.top > vh) return;
        const progress = (pr.top + pr.height / 2 - vh / 2) / (vh + pr.height);
        el.style.transform = `translate3d(0, ${(progress * -12).toFixed(2)}%, 0)`;
      });
      if (heroVisual && window.scrollY < vh * 1.2) heroVisual.style.setProperty("--py", (window.scrollY * -0.07).toFixed(1));
    }

    if (dock) {
      const pastHero = heroActions.getBoundingClientRect().bottom < 0;
      const nearEnd = endBtn.getBoundingClientRect().top < vh * 0.92;
      const show = pastHero && !nearEnd;
      dock.classList.toggle("is-visible", show);
      dock.setAttribute("aria-hidden", String(!show));
      dockLink.tabIndex = show ? 0 : -1;
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", update);
  update();

  /* Rolagem suave: curva própria para links, teclas e roda do mouse.
     Trackpads e telas de toque mantêm a inércia nativa. */
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const maxScroll = () => root.scrollHeight - window.innerHeight;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let tweenId = 0, glideId = 0, glideTarget = 0, glideY = 0, glideT = 0;

  const stopMotion = () => {
    cancelAnimationFrame(tweenId);
    cancelAnimationFrame(glideId);
    tweenId = glideId = 0;
  };

  // vai até uma posição com aceleração e desaceleração suaves
  const scrollToY = (y) => {
    stopMotion();
    const to = clamp(y, 0, maxScroll());
    const from = window.scrollY;
    const dist = to - from;
    if (reduceMotion || Math.abs(dist) < 2) { window.scrollTo(0, to); return; }
    const dur = clamp(700 + Math.abs(dist) * 0.25, 900, 1600);
    const t0 = performance.now();
    const step = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      window.scrollTo(0, from + dist * easeInOut(p));
      tweenId = p < 1 ? requestAnimationFrame(step) : 0;
    };
    tweenId = requestAnimationFrame(step);
  };

  // empurra a rolagem por uma distância e deixa ela deslizar até parar
  const glideBy = (dy) => {
    cancelAnimationFrame(tweenId);
    tweenId = 0;
    if (!glideId) { glideY = window.scrollY; glideTarget = glideY; glideT = performance.now(); }
    glideTarget = clamp(glideTarget + dy, 0, maxScroll());
    if (glideId) return;
    const step = (now) => {
      const dt = Math.min(now - glideT, 50);
      glideT = now;
      glideY += (glideTarget - glideY) * (1 - Math.pow(1 - 0.12, dt / 16.67));
      if (Math.abs(glideTarget - glideY) < 0.5) { glideY = glideTarget; window.scrollTo(0, glideY); glideId = 0; return; }
      window.scrollTo(0, glideY);
      glideId = requestAnimationFrame(step);
    };
    glideId = requestAnimationFrame(step);
  };

  if (finePointer && !reduceMotion) {
    window.addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (document.body.classList.contains("menu-open") || (e.target instanceof Element && e.target.closest("[data-menu]"))) return;
      if (e.deltaMode === 0 && Math.abs(e.deltaY) < 40) { stopMotion(); return; } // trackpad
      e.preventDefault();
      glideBy(e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY);
    }, { passive: false });
  }
  ["pointerdown", "touchstart"].forEach((type) => window.addEventListener(type, stopMotion, { passive: true }));

  document.addEventListener("keydown", (e) => {
    if (reduceMotion || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (!(e.target instanceof Element) || /^(input|textarea|select|button|a|summary)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
    if (menu.classList.contains("is-open") || (e.shiftKey && e.key !== " ")) return;
    const page = window.innerHeight * 0.85;
    if (e.key === "ArrowDown") glideBy(90);
    else if (e.key === "ArrowUp") glideBy(-90);
    else if (e.key === "PageDown") glideBy(page);
    else if (e.key === "PageUp") glideBy(-page);
    else if (e.key === " ") glideBy(e.shiftKey ? -page : page);
    else if (e.key === "Home") scrollToY(0);
    else if (e.key === "End") scrollToY(maxScroll());
    else return;
    e.preventDefault();
  });

  // leva até uma seção ou elemento e passa o foco para o título
  const goTo = (el, hash) => {
    const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    scrollToY(el.getBoundingClientRect().top + window.scrollY - offset);
    const target = el.matches("[data-stop]") ? el.querySelector("h1, h2") : el;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (hash) history.pushState(null, "", `#${el.id}`);
  };

  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const el = document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));
    if (!el) return;
    e.preventDefault();
    if (menu.classList.contains("is-open")) setMenu(false);
    goTo(el, true);
  });

  /* Alt + 1 a 5 levam às estações */
  document.addEventListener("keydown", (e) => {
    if (!e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const n = Number(String(e.code).replace("Digit", ""));
    if (!(n >= 1 && n <= stops.length - 1)) return;
    e.preventDefault();
    goTo(stops[n - 1], true);
  });

  /* Faixa em movimento: pausar */
  const pause = $(".marquee__pause");
  if (pause) {
    pause.addEventListener("click", () => {
      const paused = pause.getAttribute("aria-pressed") !== "true";
      pause.setAttribute("aria-pressed", String(paused));
      $(".marquee-wrap").classList.toggle("is-paused", paused);
    });
  }

  /* Perguntas frequentes */
  $$(".acc__item").forEach((item) => {
    const btn = $(".acc__btn", item);
    const panel = $(".acc__panel", item);
    if (!item.classList.contains("is-open")) panel.setAttribute("inert", "");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      item.classList.toggle("is-open", open);
      if (open) panel.removeAttribute("inert"); else panel.setAttribute("inert", "");
    });
  });
})();
