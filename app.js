(() => {
  const motionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  const rootPath = window.location.pathname.endsWith("/404.html")
    ? window.location.pathname.slice(0, -"404.html".length)
    : "";
  const emojiUrl = (slug) => `${rootPath}emoji/${slug}.png`;

  const HERO_CYCLE = [
    "bashfulness",
    "joy",
    "confetti",
    "inspiration",
    "laughter",
    "love",
    "jammin",
    "pleased"
  ];

  const PARTY_PACK = [
    "confetti",
    "joy",
    "inspiration",
    "love",
    "jammin",
    "glee",
    "laughter",
    "delight",
    "encouraging",
    "doublewave",
    "agreement",
    "greeting"
  ];

  /* load entrance + scroll progress */
  const progressBar = document.getElementById("scroll-progress-bar");
  const loadSteps = Array.from(document.querySelectorAll(".load-step"));

  loadSteps.forEach((el, idx) => {
    el.style.setProperty("--boot-delay", `${Math.min(idx * 45, 180)}ms`);
  });

  document.querySelectorAll(".reveal").forEach((sec) => {
    sec
      .querySelectorAll(
        ".skill-item, .tool-pill, .stat-card, .streak-card, .stack-item, .btn, .thanks-pill"
      )
      .forEach((child, idx) => {
        child.classList.add("stagger-item");
        child.style.setProperty("--stagger", String(idx));
      });
  });

  let bootComplete = false;
  function updateScrollProgress() {
    if (!progressBar || !bootComplete) return;
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const ratio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    progressBar.style.transform = `scaleX(${ratio.toFixed(4)})`;
    progressBar.style.opacity = ratio > 0.005 ? "1" : "0";
  }

  if (!motionQuery.matches && loadSteps.length > 0) {
    document.documentElement.classList.add("js-anim");
    if (progressBar) {
      progressBar.style.opacity = "1";
      progressBar.style.transform = "scaleX(0.38)";
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.documentElement.classList.add("is-loaded");
        if (progressBar) {
          progressBar.style.transform = "scaleX(1)";
        }
        window.setTimeout(() => {
          bootComplete = true;
          updateScrollProgress();
        }, 560);
      });
    });
    window.setTimeout(() => {
      document.documentElement.classList.add("is-loaded");
      bootComplete = true;
      updateScrollProgress();
    }, 900);
  } else {
    bootComplete = true;
    updateScrollProgress();
  }

  /* scroll reveal */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (!motionQuery.matches && "IntersectionObserver" in window && revealEls.length > 0) {
    document.documentElement.classList.add("js-ready");
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94) {
        el.classList.add("is-visible");
      } else {
        revealObs.observe(el);
      }
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* nav scroll spy */
  const siteNav = document.querySelector(".site-nav");
  const navGlider = document.getElementById("nav-glider");
  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const trackedSections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      const sec = id ? document.querySelector(id) : null;
      return sec ? { link, sec } : null;
    })
    .filter(Boolean);

  /* Link geometry is stable between resizes, so it is measured once and cached
     instead of re-read on every scroll frame. */
  let navMetrics = [];
  let gliderTarget = null;

  function measureNav() {
    navMetrics = navLinks.map((link) => ({
      link,
      left: link.offsetLeft,
      top: link.offsetTop,
      width: link.offsetWidth,
      height: link.offsetHeight
    }));
  }

  function syncNavGlider() {
    if (!siteNav || !navGlider) return;
    const target = siteNav.querySelector('a[aria-current="true"]');
    if (!target) {
      navGlider.style.opacity = "0";
      siteNav.classList.remove("has-glider");
      gliderTarget = null;
      return;
    }
    if (target === gliderTarget) return;
    const m = navMetrics.find((item) => item.link === target);
    if (!m) return;
    gliderTarget = target;
    siteNav.classList.add("has-glider");
    navGlider.style.width = `${m.width}px`;
    navGlider.style.height = `${m.height}px`;
    navGlider.style.transform = `translate3d(${m.left}px, ${m.top}px, 0)`;
    navGlider.style.opacity = "1";
  }

  function keepActiveNavLinkVisible() {
    if (!siteNav || window.innerWidth > 680) return;
    const active = siteNav.querySelector('a[aria-current="true"]');
    if (!active) return;
    const centred = active.offsetLeft - (siteNav.clientWidth - active.offsetWidth) / 2;
    siteNav.scrollTo({
      left: Math.max(0, centred),
      behavior: motionQuery.matches ? "auto" : "smooth"
    });
  }

  if (trackedSections.length > 0) {
    let spyTicking = false;
    let activeSection = null;

    /* Section offsets only move when the document does, so they are measured on
       load and on resize rather than read inside the scroll frame. */
    function measureSections() {
      trackedSections.forEach((item) => {
        item.top = item.sec.offsetTop;
      });
    }

    function updateActiveNav() {
      spyTicking = false;
      updateScrollProgress();
      const probeY = window.scrollY + 160;
      let active = null;
      for (const item of trackedSections) {
        if (item.top <= probeY) {
          active = item;
        }
      }
      if (active === activeSection) return;
      activeSection = active;
      trackedSections.forEach((item) => {
        if (item === active) {
          item.link.setAttribute("aria-current", "true");
        } else {
          item.link.removeAttribute("aria-current");
        }
      });
      syncNavGlider();
      keepActiveNavLinkVisible();
    }

    function onScroll() {
      if (spyTicking) return;
      spyTicking = true;
      window.requestAnimationFrame(updateActiveNav);
    }

    function onResize() {
      measureNav();
      measureSections();
      gliderTarget = null;
      activeSection = null;
      syncNavGlider();
      updateActiveNav();
    }

    measureNav();
    measureSections();
    updateActiveNav();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("load", onResize, { passive: true });
  } else {
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
  }

  /* toast stack */
  const toastRegion = document.getElementById("toast-region");

  function showToast(title, detail = "", iconSlug = "joy", durationMs = 2800) {
    if (!toastRegion) return;
    while (toastRegion.children.length >= 2) {
      const oldest = toastRegion.firstElementChild;
      oldest.classList.remove("is-open");
      oldest.classList.add("is-leaving");
      window.setTimeout(() => {
        if (oldest.parentNode) oldest.parentNode.removeChild(oldest);
      }, motionQuery.matches ? 0 : 170);
    }

    const card = document.createElement("div");
    card.className = "toast-card";
    card.style.setProperty("--toast-ms", `${durationMs}ms`);

    const icon = document.createElement("img");
    icon.className = "toast-icon";
    icon.src = emojiUrl(iconSlug);
    icon.width = 26;
    icon.height = 26;
    icon.alt = "";

    const body = document.createElement("div");
    body.className = "toast-body";

    const titleSpan = document.createElement("span");
    titleSpan.className = "toast-title";
    titleSpan.textContent = title;
    body.appendChild(titleSpan);

    if (detail) {
      const detailSpan = document.createElement("span");
      detailSpan.className = "toast-detail";
      detailSpan.textContent = detail;
      body.appendChild(detailSpan);
    }

    const bar = document.createElement("div");
    bar.className = "toast-progress";

    card.appendChild(icon);
    card.appendChild(body);
    card.appendChild(bar);
    toastRegion.appendChild(card);

    let closed = false;
    function dismiss() {
      if (closed) return;
      closed = true;
      card.classList.remove("is-open");
      card.classList.add("is-leaving");
      window.setTimeout(() => {
        if (card.parentNode) card.parentNode.removeChild(card);
      }, motionQuery.matches ? 0 : 170);
    }

    card.addEventListener("click", dismiss);

    window.requestAnimationFrame(() => {
      card.classList.add("is-open");
    });

    window.setTimeout(dismiss, durationMs);
  }

  async function writeClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /* popover */
  const hoverPopover = document.getElementById("hover-popover");
  let activePopTarget = null;

  function positionPopover(target) {
    if (!hoverPopover || !target) return;
    const rect = target.getBoundingClientRect();
    const pw = hoverPopover.offsetWidth || 160;
    const ph = hoverPopover.offsetHeight || 30;
    const x = Math.max(
      10,
      Math.min(window.innerWidth - pw - 10, rect.left + rect.width / 2 - pw / 2)
    );
    const preferBottom = target.closest(".site-header") !== null;
    const y = !preferBottom && rect.top > ph + 24 ? rect.top - ph - 10 : rect.bottom + 10;
    hoverPopover.style.setProperty("--pop-x", `${Math.round(x)}px`);
    hoverPopover.style.setProperty("--pop-y", `${Math.round(y)}px`);
  }

  function showPopover(target, label) {
    if (!hoverPopover || window.innerWidth <= 680) return;
    activePopTarget = target;
    hoverPopover.textContent = label;
    hoverPopover.hidden = false;
    positionPopover(target);
    window.requestAnimationFrame(() => {
      if (activePopTarget === target) {
        positionPopover(target);
        hoverPopover.classList.add("is-shown");
      }
    });
  }

  function hidePopover() {
    if (!hoverPopover) return;
    activePopTarget = null;
    hoverPopover.classList.remove("is-shown");
  }

  document.querySelectorAll("[data-pop]").forEach((el) => {
    // a hint belongs on things you cannot guess by looking at them: the stickers
    // you can fling, and the toss controls. Everything else stays quiet.
    if (!el.matches(".sticker-tile, [data-toy], .toy-btn")) return;
    el.addEventListener("pointerenter", (ev) => {
      if (ev.pointerType !== "mouse") return;
      const msg = el.getAttribute("data-pop");
      if (msg) showPopover(el, msg);
    });
    el.addEventListener("pointerleave", hidePopover);
    el.addEventListener("pointerdown", hidePopover);
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!activePopTarget) return;
      const r = activePopTarget.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) {
        hidePopover();
      } else {
        positionPopover(activePopTarget);
      }
    },
    { passive: true }
  );

  /* click pulse + mail copy */
  document
    .querySelectorAll(
      ".contact-chip, .tool-pill, .thanks-pill, .btn, .kofi-cta, .toy-btn, .header-ping-btn"
    )
    .forEach((el) => {
      el.addEventListener("click", () => {
        if (!motionQuery.matches) {
          el.classList.remove("is-pulsing");
          void el.offsetWidth;
          el.classList.add("is-pulsing");
        }
      });
    });

  document.querySelectorAll('a[href="mailto:wuzzy.nizzy@gmail.com"]').forEach((mailLink) => {
    mailLink.addEventListener("click", async () => {
      const ok = await writeClipboard("wuzzy.nizzy@gmail.com");
      showToast(
        ok ? "copied email & opening mail ♡" : "opening mail client ♡",
        "wuzzy.nizzy@gmail.com",
        "love"
      );
    });
  });

  /* Pointer capture throws when the pointer is already gone, which happens on a
     fast flick, so both calls go through one guarded helper. */
  function capturePointer(el, id) {
    try {
      el.setPointerCapture(id);
    } catch {
      /* pointer already released */
    }
  }

  function releasePointer(el, id) {
    try {
      el.releasePointerCapture(id);
    } catch {
      /* pointer already released */
    }
  }

  /* springs
   One integrator per element, so every press, release and click continues from
   the current position, angle and velocity. */
  const springEls = new WeakMap();

  function springFor(el) {
    let s = springEls.get(el);
    if (s) return s;
    s = {
      el,
      x: 0,
      y: 0,
      scale: 1,
      rot: 0,
      vx: 0,
      vy: 0,
      vs: 0,
      vr: 0,
      tx: 0,
      ty: 0,
      ts: 1,
      tr: 0,
      raf: null
    };
    springEls.set(el, s);
    return s;
  }

  function springStep(s, dt) {
    const stiffness = 240;
    const damping = 26;
    const pull = (target, value, velocity) =>
      (target - value) * stiffness - velocity * damping;
    s.vx += pull(s.tx, s.x, s.vx) * dt;
    s.vy += pull(s.ty, s.y, s.vy) * dt;
    s.vs += pull(s.ts, s.scale, s.vs) * dt;
    s.vr += pull(s.tr, s.rot, s.vr) * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.scale += s.vs * dt;
    s.rot += s.vr * dt;
  }

  function springSettled(s) {
    return (
      Math.abs(s.tx - s.x) < 0.05 &&
      Math.abs(s.ty - s.y) < 0.05 &&
      Math.abs(s.ts - s.scale) < 0.001 &&
      Math.abs(s.tr - s.rot) < 0.02 &&
      Math.abs(s.vx) < 0.4 &&
      Math.abs(s.vy) < 0.4 &&
      Math.abs(s.vs) < 0.02 &&
      Math.abs(s.vr) < 0.05
    );
  }

  function springRun(s) {
    if (s.raf !== null) return;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.032, Math.max(0.004, (now - last) / 1000));
      last = now;
      springStep(s, dt);
      if (springSettled(s)) {
        s.x = s.tx;
        s.y = s.ty;
        s.scale = s.ts;
        s.rot = s.tr;
        s.vx = 0;
        s.vy = 0;
        s.vs = 0;
        s.vr = 0;
        s.raf = null;
        const home = s.tx === 0 && s.ty === 0 && s.tr === 0 && s.ts === 1;
        s.el.style.transform = home
          ? ""
          : `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) rotate(${s.rot.toFixed(2)}deg) scale(${s.scale.toFixed(3)})`;
        return;
      }
      s.el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) rotate(${s.rot.toFixed(2)}deg) scale(${s.scale.toFixed(3)})`;
      s.raf = window.requestAnimationFrame(frame);
    };
    s.raf = window.requestAnimationFrame(frame);
  }

  function springTo(el, target, impulse = 0) {
    if (!el) return;
    if (motionQuery.matches) return;
    const s = springFor(el);
    if (typeof target.x === "number") s.tx = target.x;
    if (typeof target.y === "number") s.ty = target.y;
    if (typeof target.scale === "number") s.ts = target.scale;
    if (typeof target.rot === "number") s.tr = target.rot;
    if (impulse) s.vs += impulse;
    springRun(s);
  }

  /* cards lift only; a tilt on a large surface reads as a wobble */
  function springHover(el) {
    if (el.matches(CARD_SPRING)) {
      springTo(el, { x: 0, y: -3, scale: 1, rot: 0 });
      return;
    }
    springTo(el, { x: 0, y: -1.5, scale: 1.03, rot: -1 });
  }

  function springRest(el) {
    springTo(el, { x: 0, y: 0, scale: 1, rot: 0 });
  }

  /* press in, let the spring return it */
  function springPress(el) {
    if (el.matches(CARD_SPRING)) {
      springTo(el, { x: 0, y: -1, scale: 0.997, rot: 0 });
      return;
    }
    const s = springFor(el);
    springTo(el, { x: 0, y: 0.5, scale: 0.97, rot: 0 });
    s.vs -= 0.5;
  }

  function springPop(el) {
    if (!el || motionQuery.matches) return;
    if (el.matches(CARD_SPRING)) {
      springTo(el, { x: 0, y: -3, scale: 1, rot: 0 });
      return;
    }
    springTo(el, { x: 0, y: -1.5, scale: 1.02, rot: -0.8 }, 1.8);
  }

  // only surfaces that lead somewhere answer a hover. Decorative images and
  // stat cards used to lift too, which made the whole page feel touchable.
  const CARD_SPRING = [".intro-card", ".skill-item", ".stack-item"].join(", ");

  const SPRING_CONTROLS = [
    CARD_SPRING,
    "[data-toy]",
    ".sticker-tile",
    ".contact-chip",
    ".tool-pill",
    ".thanks-pill",
    ".btn",
    ".toy-btn",
    ".kofi-cta",
    ".header-ping-btn",
    ".brand-link",
    ".modal-copy-btn",
    ".modal-icon-btn",
    ".mode-opt"
  ].join(", ");

  // a draggable cat answers a press; it does not grow and tilt when a mouse
  // passes over a sentence it happens to sit in
  const PRESS_ONLY = "[data-toy]";

  function attachEmojiSprings() {
    const mediaFine =
      window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    document.querySelectorAll(SPRING_CONTROLS).forEach((el) => {
      if (el.dataset.springBound === "1") return;
      el.dataset.springBound = "1";
      if (mediaFine && !el.matches(PRESS_ONLY)) {
        el.addEventListener("pointerenter", (ev) => {
          if (ev.pointerType === "mouse") springHover(el);
        });
        el.addEventListener("pointerleave", () => springRest(el));
      }
      el.addEventListener("pointerdown", (ev) => {
        if (ev.button !== undefined && ev.button !== 0) return;
        springPress(el);
      });
      el.addEventListener("pointerup", () => springPop(el));
      el.addEventListener("pointercancel", () => springRest(el));
    });
  }

  /* typing lines */
  const controllers = [];

  function createTyper(el) {
    let lines = [];
    try {
      lines = JSON.parse(el.getAttribute("data-lines") || "[]");
    } catch {
      return null;
    }
    if (!Array.isArray(lines) || lines.length < 2) {
      return null;
    }

    const holdMs = Number(el.getAttribute("data-pause") || 1100);
    const typeSpeed = 42;
    const eraseSpeed = 24;

    let lineIndex = 0;
    let charIndex = Array.from(lines[0]).length;
    let deleting = false;
    let timer = null;
    let active = false;

    function clearTimer() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    }

    function step() {
      if (!active) return;
      const current = Array.from(lines[lineIndex]);
      if (!deleting) {
        if (charIndex < current.length) {
          charIndex += 1;
          el.textContent = current.slice(0, charIndex).join("");
          timer = window.setTimeout(step, typeSpeed);
        } else {
          deleting = true;
          timer = window.setTimeout(step, holdMs);
        }
      } else if (charIndex > 0) {
        charIndex -= 1;
        el.textContent = current.slice(0, charIndex).join("") || "\u00a0";
        timer = window.setTimeout(step, eraseSpeed);
      } else {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        timer = window.setTimeout(step, 220);
      }
    }

    return {
      start() {
        if (active) return;
        active = true;
        deleting = true;
        timer = window.setTimeout(step, holdMs);
      },
      stop() {
        active = false;
        clearTimer();
        lineIndex = 0;
        charIndex = Array.from(lines[0]).length;
        deleting = false;
        el.textContent = lines[0];
      }
    };
  }

  document.querySelectorAll("[data-typing]").forEach((el) => {
    const ctrl = createTyper(el);
    if (ctrl) controllers.push(ctrl);
  });

  /* sticker physics
   Nothing visible is deleted in place. A retired cat keeps its velocity, stops
   colliding, ignores pointers and leaves once it is fully off screen. */
  const stage = document.getElementById("fling-stage");
  const stickerTiles = Array.from(document.querySelectorAll(".sticker-tile[data-copy]"));
  const allStickerSlugs = stickerTiles
    .map((tile) => {
      const m = (tile.getAttribute("href") || "").match(/emoji\/([a-z0-9]+)\.png$/);
      return m ? m[1] : null;
    })
    .filter(Boolean);

  const actors = [];
  const MAX_ACTIVE = 18;
  const EXIT_MARGIN = 48;
  const BIRTH_MS = 320;
  const ACTIVE_TTL = 7.4;
  let rafId = null;
  let lastTs = 0;

  function stickerSize() {
    return window.innerWidth <= 680 ? 46 : 52;
  }

  function clamp(val, lo, hi) {
    return Math.max(lo, Math.min(hi, val));
  }

  function activeActors() {
    return actors.filter((a) => !a.exiting);
  }

  function ensureLoop() {
    if (rafId !== null || actors.length === 0) return;
    lastTs = performance.now();
    rafId = window.requestAnimationFrame(tick);
  }

  function destroyActor(actor) {
    const idx = actors.indexOf(actor);
    if (idx !== -1) actors.splice(idx, 1);
    if (actor.el && actor.el.parentNode) actor.el.parentNode.removeChild(actor.el);
  }

  function retireActor(actor) {
    if (!actor || actor.exiting) return;
    actor.exiting = true;
    actor.held = false;
    actor.el.classList.remove("is-held");
    actor.el.style.pointerEvents = "none";
    if (actor.pointerId !== null) {
      releasePointer(actor.el, actor.pointerId);
      actor.pointerId = null;
    }
    // resting cats need a nudge
    if (actor.y >= window.innerHeight - actor.size - 16) {
      actor.vy = 95 + Math.random() * 70;
      actor.vx += (Math.random() - 0.5) * 260;
      actor.omega += (Math.random() - 0.5) * 240;
    }
    ensureLoop();
  }

  function retireAllImmediate() {
    for (let i = actors.length - 1; i >= 0; i -= 1) destroyActor(actors[i]);
  }

  function computeVelocity(samples) {
    if (samples.length < 2) return { vx: 0, vy: 0 };
    const latest = samples[samples.length - 1];
    let anchor = samples[0];
    for (let i = samples.length - 2; i >= 0; i -= 1) {
      anchor = samples[i];
      if (latest.t - anchor.t >= 32) break;
    }
    const dt = Math.max(8, latest.t - anchor.t) / 1000;
    return {
      vx: clamp((latest.x - anchor.x) / dt, -2300, 2300),
      vy: clamp((latest.y - anchor.y) / dt, -2300, 2300)
    };
  }

  function attachActorPointer(actor) {
    let samples = [];
    let startX = 0;
    let startY = 0;

    actor.el.addEventListener("pointerdown", (ev) => {
      if (actor.exiting) return;
      ev.preventDefault();
      ev.stopPropagation();
      actor.pointerId = ev.pointerId;
      capturePointer(actor.el, ev.pointerId);
      const size = stickerSize();
      actor.held = true;
      actor.age = 0;
      actor.birth = 1;
      // remember how it was lying: a grab must not straighten it
      actor.holdAngle = actor.angle;
      actor.el.classList.add("is-held");
      startX = ev.clientX;
      startY = ev.clientY;
      actor.x = ev.clientX - size / 2;
      actor.y = ev.clientY - size / 2;
      actor.vx = 0;
      actor.vy = 0;
      actor.sx = 1.08;
      actor.sy = 1.08;
      samples = [{ x: ev.clientX, y: ev.clientY, t: performance.now() }];
      ensureLoop();
    });

    actor.el.addEventListener("pointermove", (ev) => {
      if (!actor.held || ev.pointerId !== actor.pointerId) return;
      ev.preventDefault();
      const size = stickerSize();
      const now = performance.now();
      actor.x = ev.clientX - size / 2;
      actor.y = ev.clientY - size / 2;
      // rotation follows the hand from where it was grabbed, and stays there
      // when the hand stops. The old delta tilt snapped upright the moment the
      // pointer paused, which is what made a grabbed cat straighten itself.
      const hold = typeof actor.holdAngle === "number" ? actor.holdAngle : actor.angle;
      actor.angle = clamp(hold + (ev.clientX - startX) * 0.34, -34, 34);
      samples.push({ x: ev.clientX, y: ev.clientY, t: now });
      while (samples.length > 8 && now - samples[0].t > 100) {
        samples.shift();
      }
    });

    function finishHold(ev) {
      if (!actor.held || ev.pointerId !== actor.pointerId) return;
      actor.held = false;
      actor.pointerId = null;
      actor.el.classList.remove("is-held");
      actor.age = 0;
      const moved = Math.hypot(ev.clientX - startX, ev.clientY - startY);
      if (moved < 7) {
        actor.vy = -720 - Math.random() * 220;
        actor.vx = (Math.random() - 0.5) * 680;
        actor.omega = (Math.random() - 0.5) * 420;
        actor.sx = 1.16;
        actor.sy = 0.88;
      } else {
        samples.push({ x: ev.clientX, y: ev.clientY, t: performance.now() });
        const vel = computeVelocity(samples);
        actor.vx = vel.vx;
        actor.vy = vel.vy;
        if (Math.hypot(actor.vx, actor.vy) < 120) {
          actor.vy = -340;
          actor.vx = (Math.random() - 0.5) * 260;
        }
        actor.omega = clamp(actor.vx * 0.28, -520, 520);
      }
      ensureLoop();
    }

    actor.el.addEventListener("pointerup", finishHold);
    actor.el.addEventListener("pointercancel", finishHold);
  }

  function spawnSticker(slug, x, y, vx, vy, startHeld = false, allowDirect = false) {
    if (!stage || (motionQuery.matches && !allowDirect)) return null;

    // retire the oldest, never delete a visible one
    let guard = 0;
    while (activeActors().length >= MAX_ACTIVE && guard < MAX_ACTIVE + 8) {
      const pool = activeActors();
      const victim = pool.find((a) => !a.held) || pool[0];
      if (!victim) break;
      retireActor(victim);
      guard += 1;
    }

    const size = stickerSize();
    const img = document.createElement("img");
    img.className = "flying-sticker" + (startHeld ? " is-held" : "");
    img.src = emojiUrl(slug);
    img.width = size;
    img.height = size;
    img.alt = "";
    img.draggable = false;

    const actor = {
      el: img,
      slug,
      size,
      x: x - size / 2,
      y: y - size / 2,
      vx,
      vy,
      angle: (Math.random() - 0.5) * 18,
      omega: clamp(vx * 0.26, -440, 440),
      sx: startHeld ? 1.08 : 1,
      sy: startHeld ? 1.08 : 1,
      age: 0,
      ttl: ACTIVE_TTL,
      held: startHeld,
      exiting: false,
      birth: motionQuery.matches ? 1 : 0,
      pointerId: null
    };

    // first paint is the start of the bloom
    const startScale = 0.22 * actor.sx;
    img.style.opacity = motionQuery.matches ? "1" : "0";
    img.style.transform = `translate3d(${actor.x.toFixed(1)}px, ${actor.y.toFixed(1)}px, 0) rotate(${actor.angle.toFixed(1)}deg) scale(${startScale.toFixed(3)})`;
    stage.appendChild(img);
    actors.push(actor);
    attachActorPointer(actor);
    ensureLoop();
    return actor;
  }

  function tick(now) {
    const dt = Math.min(0.032, Math.max(0.004, (now - lastTs) / 1000));
    lastTs = now;

    const size = stickerSize();
    const vh = window.innerHeight;
    const maxX = Math.max(0, window.innerWidth - size - 6);
    const maxY = Math.max(0, vh - size - 8);
    const minX = 6;
    const minY = 8;
    const gravity = 1420;
    const bounce = 0.74;

    for (let i = actors.length - 1; i >= 0; i -= 1) {
      const a = actors[i];

      if (!a.exiting && !a.held) {
        a.age += dt;
        if (a.age >= a.ttl) retireActor(a);
      }

      if (a.exiting) {
        // no floor, no ceiling, no pointer
        a.vy += gravity * dt;
        a.vx *= Math.pow(0.996, dt * 60);
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.angle += a.omega * dt;
      } else if (!a.held) {
        a.vy += gravity * dt;
        a.vx *= Math.pow(0.992, dt * 60);
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.angle += a.omega * dt;

        if (a.x < minX) {
          a.x = minX;
          a.vx = Math.abs(a.vx) * bounce;
          a.omega = clamp(a.vy * 0.22, -480, 480);
          a.sx = 0.9;
          a.sy = 1.1;
        } else if (a.x > maxX) {
          a.x = maxX;
          a.vx = -Math.abs(a.vx) * bounce;
          a.omega = clamp(-a.vy * 0.22, -480, 480);
          a.sx = 0.9;
          a.sy = 1.1;
        }

        if (a.y < minY) {
          a.y = minY;
          a.vy = Math.abs(a.vy) * bounce;
          a.sx = 1.1;
          a.sy = 0.92;
        } else if (a.y > maxY) {
          a.y = maxY;
          if (Math.abs(a.vy) > 95) {
            a.vy = -Math.abs(a.vy) * bounce;
            a.vx *= 0.92;
            a.omega = a.vx * 0.25;
            a.sx = 1.12;
            a.sy = 0.9;
          } else {
            a.vy = 0;
            a.vx *= Math.pow(0.9, dt * 60);
            a.omega *= Math.pow(0.86, dt * 60);
            // a landed sticker keeps the angle it landed at. Spinning one back
            // upright on the floor was the "turns back up" bug.
            if (Math.abs(a.omega) < 9) {
              a.omega = 0;
              const restLimit = 26;
              if (Math.abs(a.angle) > restLimit) {
                const target = Math.sign(a.angle) * restLimit;
                a.angle += (target - a.angle) * Math.min(1, dt * 2.4);
              }
            }
          }
        }
      }

      const targetScale = a.held ? 1.08 : 1;
      a.sx += (targetScale - a.sx) * Math.min(1, dt * 16);
      a.sy += (targetScale - a.sy) * Math.min(1, dt * 16);

      if (a.birth < 1) {
        a.birth = Math.min(1, a.birth + (dt * 1000) / BIRTH_MS);
      }
      const eased = 1 - Math.pow(1 - a.birth, 3);
      const bloom = 0.22 + 0.78 * eased;

      a.el.style.opacity = eased.toFixed(3);
      a.el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0) rotate(${a.angle.toFixed(1)}deg) scale(${(a.sx * bloom).toFixed(3)}, ${(a.sy * bloom).toFixed(3)})`;

      if (a.exiting && a.y > vh + size + EXIT_MARGIN) {
        destroyActor(a);
      }
    }

    if (actors.length > 0) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  /* 35 to 45ms apart so a burst reads as a stream */
  function stagger(index) {
    return index * (35 + Math.random() * 10);
  }

  function spawnMiniBurst(slug, originX, originY, count = 3, allowDirect = false) {
    for (let i = 0; i < count; i += 1) {
      const spread = (i - (count - 1) / 2) * 230 + (Math.random() - 0.5) * 120;
      const lift = -580 - Math.random() * 280;
      window.setTimeout(() => {
        spawnSticker(slug, originX, originY, spread, lift, false, allowDirect);
      }, stagger(i));
    }
  }

  function randomSlug() {
    if (allStickerSlugs.length > 0) {
      return allStickerSlugs[Math.floor(Math.random() * allStickerSlugs.length)];
    }
    return PARTY_PACK[Math.floor(Math.random() * PARTY_PACK.length)];
  }

  let heroCycleIndex = 0;
  document.querySelectorAll("[data-toy]").forEach((toyEl) => {
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let draggedActor = null;
    let samples = [];

    toyEl.addEventListener("dragstart", (ev) => ev.preventDefault());

    toyEl.addEventListener("pointerdown", (ev) => {
      if (ev.button !== undefined && ev.button !== 0) return;
      ev.preventDefault();
      hidePopover();
      pointerId = ev.pointerId;
      startX = ev.clientX;
      startY = ev.clientY;
      draggedActor = null;
      samples = [{ x: ev.clientX, y: ev.clientY, t: performance.now() }];
      capturePointer(toyEl, ev.pointerId);
    });

    toyEl.addEventListener("pointermove", (ev) => {
      if (ev.pointerId !== pointerId) return;
      const dist = Math.hypot(ev.clientX - startX, ev.clientY - startY);
      const now = performance.now();
      samples.push({ x: ev.clientX, y: ev.clientY, t: now });
      while (samples.length > 8 && now - samples[0].t > 100) {
        samples.shift();
      }

      if (!draggedActor && dist >= 7) {
        const slug = toyEl.getAttribute("data-toy") || "joy";
        draggedActor = spawnSticker(slug, ev.clientX, ev.clientY, 0, 0, true, true);
      }
      if (draggedActor) {
        const size = stickerSize();
        const prevX = draggedActor.x;
        draggedActor.x = ev.clientX - size / 2;
        draggedActor.y = ev.clientY - size / 2;
        draggedActor.angle = clamp((draggedActor.x - prevX) * 1.6, -28, 28);
      }
    });

    function endToyGesture(ev) {
      if (ev.pointerId !== pointerId) return;
      pointerId = null;
      if (draggedActor) {
        draggedActor.held = false;
        draggedActor.el.classList.remove("is-held");
        samples.push({ x: ev.clientX, y: ev.clientY, t: performance.now() });
        const vel = computeVelocity(samples);
        draggedActor.vx = vel.vx;
        draggedActor.vy = vel.vy;
        if (Math.hypot(draggedActor.vx, draggedActor.vy) < 130) {
          draggedActor.vy = -380;
          draggedActor.vx = (Math.random() - 0.5) * 320;
        }
        draggedActor.omega = clamp(draggedActor.vx * 0.28, -520, 520);
        draggedActor = null;
        ensureLoop();
      } else {
        if (toyEl.id === "hero-mascot") {
          heroCycleIndex = (heroCycleIndex + 1) % HERO_CYCLE.length;
          const nextSlug = HERO_CYCLE[heroCycleIndex];
          const applyMood = () => {
            toyEl.setAttribute("data-toy", nextSlug);
            toyEl.setAttribute("src", emojiUrl(nextSlug));
          };
          if (motionQuery.matches) {
            applyMood();
          } else {
            // swap at the quiet point of the spring
            springTo(toyEl, { y: 0, scale: 0.82, rot: 3 });
            window.setTimeout(() => {
              applyMood();
              springTo(toyEl, { y: -1.5, scale: 1.05, rot: -2.5 }, 1.8);
            }, 150);
          }
          showToast(`mood: ${nextSlug} :3`, "tap again or drag to fling", nextSlug, 2100);
        }
        springPop(toyEl);
        if (!motionQuery.matches) {
          const rect = toyEl.getBoundingClientRect();
          const slug = toyEl.getAttribute("data-toy") || "joy";
          spawnMiniBurst(slug, rect.left + rect.width / 2, rect.top + rect.height / 2, 3, false);
        }
      }
    }

    toyEl.addEventListener("pointerup", endToyGesture);
    toyEl.addEventListener("pointercancel", endToyGesture);
  });

  const heroTossBtn = document.getElementById("hero-toss-btn");
  if (heroTossBtn) {
    heroTossBtn.addEventListener("click", () => {
      const rect = heroTossBtn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 4; i += 1) {
        const pick = PARTY_PACK[Math.floor(Math.random() * PARTY_PACK.length)];
        const vx = (i - 1.5) * 210 + (Math.random() - 0.5) * 90;
        const vy = -640 - Math.random() * 260;
        window.setTimeout(() => {
          spawnSticker(pick, cx, cy, vx, vy, false, true);
        }, stagger(i));
      }
      showToast("cats launched :3", "grab any flying cat mid-air to re-fling", "confetti", 2300);
    });
  }

  const tossRandomBtn = document.getElementById("toss-random-btn");
  if (tossRandomBtn) {
    tossRandomBtn.addEventListener("click", () => {
      const rect = tossRandomBtn.getBoundingClientRect();
      const slug = randomSlug();
      const vx = (Math.random() - 0.5) * 760;
      const vy = -680 - Math.random() * 260;
      spawnSticker(slug, rect.left + rect.width / 2, rect.top, vx, vy, false, true);
      showToast(`tossed ${slug} :3`, `/emoji/${slug}.png`, slug, 2000);
    });
  }

  const burstBtn = document.getElementById("burst-btn");
  if (burstBtn) {
    burstBtn.addEventListener("click", () => {
      const rect = burstBtn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top;
      for (let i = 0; i < 7; i += 1) {
        const slug = PARTY_PACK[i % PARTY_PACK.length];
        const vx = (i - 3) * 185 + (Math.random() - 0.5) * 70;
        const vy = -660 - Math.random() * 320;
        window.setTimeout(() => {
          spawnSticker(slug, cx, cy, vx, vy, false, true);
        }, stagger(i));
      }
      showToast("confetti burst ♡", "7 reaction cats in orbit", "confetti", 2300);
    });
  }

  function syncMotion() {
    if (motionQuery.matches) {
      controllers.forEach((c) => c.stop());
      retireAllImmediate();
    } else {
      controllers.forEach((c) => c.start());
    }
  }

  syncMotion();
  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", syncMotion);
  }

  /* modals */
  let activeModal = null;
  let returnFocusEl = null;
  let closeModalTimer = null;

  function openModal(backdropEl, triggerEl = null) {
    if (!backdropEl) return;
    if (closeModalTimer !== null) {
      window.clearTimeout(closeModalTimer);
      closeModalTimer = null;
    }
    if (activeModal && activeModal !== backdropEl) {
      activeModal.classList.remove("is-open");
      activeModal.hidden = true;
    }
    hidePopover();
    returnFocusEl = triggerEl || document.activeElement;
    activeModal = backdropEl;
    backdropEl.hidden = false;

    // keep the layout from shifting when the scrollbar goes
    const widthBefore = document.documentElement.clientWidth;
    document.body.classList.add("modal-open");
    const lostGutter = document.documentElement.clientWidth - widthBefore;
    document.body.style.paddingRight = lostGutter > 0 ? `${lostGutter}px` : "";
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        backdropEl.classList.add("is-open");
        const closeBtn = backdropEl.querySelector("[data-modal-close]");
        if (closeBtn) closeBtn.focus({ preventScroll: true });
      });
    });
  }

  function closeModal() {
    if (!activeModal) return;
    const closing = activeModal;
    activeModal = null;
    closing.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    const delay = motionQuery.matches ? 0 : 235;
    closeModalTimer = window.setTimeout(() => {
      closing.hidden = true;
      // release once the card has closed
      document.body.style.paddingRight = "";
      closeModalTimer = null;
      if (returnFocusEl && typeof returnFocusEl.focus === "function") {
        returnFocusEl.focus({ preventScroll: true });
      }
    }, delay);
  }

  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", (ev) => {
      if (ev.target === backdrop) closeModal();
    });
    backdrop.querySelectorAll("[data-modal-close]").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });
  });

  /* contact modal */
  const contactModal = document.getElementById("contact-modal");
  document.querySelectorAll("[data-open-contact]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(contactModal, btn));
  });

  function setCopyTag(tag, next) {
    if (!tag || tag.textContent === next) return;
    tag.classList.add("is-swapping");
    window.setTimeout(() => {
      tag.textContent = next;
      tag.classList.remove("is-swapping");
    }, 150);
  }

  document.querySelectorAll("[data-copy-handle]").forEach((btn) => {
    let timer = null;
    const tag = btn.querySelector(".modal-copy-tag");
    const baseTag = tag ? tag.textContent : "";
    btn.addEventListener("click", async () => {
      const val = btn.getAttribute("data-copy-handle") || "";
      const iconSlug = btn.getAttribute("data-toast-icon") || "love";
      const ok = await writeClipboard(val);
      btn.classList.add("is-done");
      setCopyTag(tag, "copied ♡");
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        btn.classList.remove("is-done");
        setCopyTag(tag, baseTag);
      }, 1300);
      showToast(ok ? "copied to clipboard ♡" : "handle ready", val, iconSlug);
    });
  });

  /* sticker modal */
  const stickerModal = document.getElementById("sticker-modal");
  const modalImg = document.getElementById("sticker-modal-img");
  const modalTitle = document.getElementById("sticker-modal-title");
  const modalSlug = document.getElementById("sticker-modal-slug");
  const copyUrlBtn = document.getElementById("modal-copy-url");
  const copyMdBtn = document.getElementById("modal-copy-md");
  const copyHtmlBtn = document.getElementById("modal-copy-html");
  const modalPrevBtn = document.getElementById("sticker-prev-btn");
  const modalNextBtn = document.getElementById("sticker-next-btn");
  const modeToggleBtn = document.getElementById("mode-toggle-btn");
  const statusEl = document.getElementById("copy-status");

  let popupMode = true;
  let currentStickerIdx = 0;

  /* mode switch: fixed-width options, thumb glides on transform */
  if (modeToggleBtn) {
    const modeOpts = Array.from(modeToggleBtn.querySelectorAll(".mode-opt"));
    const modeThumb = modeToggleBtn.querySelector(".mode-switch-thumb");

    function moveModeThumb(animate) {
      if (!modeThumb) return;
      const active = modeOpts.find((opt) => opt.classList.contains("is-active")) || modeOpts[0];
      if (!active) return;
      if (!animate) modeThumb.style.transition = "none";
      modeThumb.style.width = `${active.offsetWidth}px`;
      modeThumb.style.transform = `translate3d(${active.offsetLeft - 2}px, 0, 0)`;
      if (!animate) {
        // flush geometry before transitions return
        void modeThumb.offsetWidth;
        modeThumb.style.transition = "";
      }
    }

    function setMode(mode, announce) {
      popupMode = mode === "popup";
      modeOpts.forEach((opt) => {
        const on = opt.getAttribute("data-mode") === mode;
        opt.classList.toggle("is-active", on);
        opt.setAttribute("aria-pressed", on ? "true" : "false");
      });
      moveModeThumb(true);
      if (!announce) return;
      showToast(
        popupMode ? "sticker popup mode on ♡" : "instant url copy mode on ♡",
        popupMode ? "tap any sticker to inspect & copy snippets" : "tap any sticker for 1-click url copy",
        "inspiration",
        2100
      );
    }

    modeOpts.forEach((opt) => {
      opt.addEventListener("click", () => {
        const mode = opt.getAttribute("data-mode");
        if ((mode === "popup") === popupMode) return;
        setMode(mode, true);
      });
    });

    window.addEventListener("resize", () => moveModeThumb(false), { passive: true });
    moveModeThumb(false);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => moveModeThumb(false));
    }
  }

  let modalSwapTimer = null;
  let modalSwapToken = 0;

  function modalSwapTargets() {
    const body = stickerModal ? stickerModal.querySelector(".modal-swap-body") : null;
    return body ? [body] : [];
  }

  function fillStickerModal(idx) {
    const slug = allStickerSlugs[idx];
    const fullUrl = `https://wuzzynizzy.github.io/wuzzynizzy/emoji/${slug}.png`;

    if (modalTitle) modalTitle.textContent = slug;
    if (modalSlug) {
      modalSlug.textContent = `/emoji/${slug}.png · ${idx + 1} / ${allStickerSlugs.length}`;
    }
    if (modalImg) {
      modalImg.src = emojiUrl(slug);
      modalImg.alt = `Animal Crossing ${slug} reaction`;
    }
    if (copyUrlBtn) copyUrlBtn.setAttribute("data-snippet", fullUrl);
    if (copyMdBtn) copyMdBtn.setAttribute("data-snippet", `![${slug}](${fullUrl})`);
    if (copyHtmlBtn) {
      copyHtmlBtn.setAttribute(
        "data-snippet",
        `<img src="${fullUrl}" width="24" height="24" alt="${slug}" align="absmiddle" />`
      );
    }
  }

  /* dir: +1 next, -1 previous, 0 no animation */
  function renderStickerModal(idx, dir = 0) {
    if (allStickerSlugs.length === 0) return;
    currentStickerIdx =
      ((idx % allStickerSlugs.length) + allStickerSlugs.length) %
      allStickerSlugs.length;

    const targets = modalSwapTargets();
    const animate = dir !== 0 && !motionQuery.matches && targets.length > 0;

    modalSwapToken += 1;
    const token = modalSwapToken;
    if (modalSwapTimer !== null) {
      window.clearTimeout(modalSwapTimer);
      modalSwapTimer = null;
    }

    if (!animate) {
      targets.forEach((el) => {
        el.classList.remove("is-out-next", "is-out-prev", "is-in-next", "is-in-prev");
      });
      fillStickerModal(currentStickerIdx);
      return;
    }

    const outClass = dir > 0 ? "is-out-next" : "is-out-prev";
    const inClass = dir > 0 ? "is-in-next" : "is-in-prev";

    targets.forEach((el) => {
      el.classList.remove("is-out-next", "is-out-prev", "is-in-next", "is-in-prev");
      el.classList.add(outClass);
    });

    modalSwapTimer = window.setTimeout(() => {
      if (token !== modalSwapToken) return;
      fillStickerModal(currentStickerIdx);

      // snap to the incoming side with transitions off, then glide home;
      // both states are near opacity 0, so the re-position is never seen
      targets.forEach((el) => {
        el.classList.add("is-snapping");
        el.classList.remove(outClass);
        el.classList.add(inClass);
      });

      window.requestAnimationFrame(() => {
        if (token !== modalSwapToken) return;
        targets.forEach((el) => el.classList.remove("is-snapping"));
        window.requestAnimationFrame(() => {
          if (token !== modalSwapToken) return;
          targets.forEach((el) => el.classList.remove(inClass));
        });
      });
      modalSwapTimer = null;
    }, 120);
  }

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener("click", () => {
      renderStickerModal(currentStickerIdx - 1, -1);
    });
  }
  if (modalNextBtn) {
    modalNextBtn.addEventListener("click", () => {
      renderStickerModal(currentStickerIdx + 1, 1);
    });
  }

  if (modalImg) {
    // the preview is a picture, not a button
  }

  [copyUrlBtn, copyMdBtn, copyHtmlBtn].forEach((btn) => {
    if (!btn) return;
    let timer = null;
    const tag = btn.querySelector(".modal-copy-tag");
    const baseTag = tag ? tag.textContent : "";
    btn.addEventListener("click", async () => {
      const snippet = btn.getAttribute("data-snippet") || "";
      const slug = allStickerSlugs[currentStickerIdx] || "joy";
      const ok = await writeClipboard(snippet);
      if (statusEl) {
        statusEl.textContent = ok ? `copied ${snippet} ♡` : `hotlink: ${snippet}`;
      }
      btn.classList.add("is-done");
      setCopyTag(tag, "copied ♡");
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        btn.classList.remove("is-done");
        setCopyTag(tag, baseTag);
      }, 1300);
      showToast(ok ? "copied snippet ♡" : "snippet ready", snippet, slug);
    });
  });

  /* stack chips */
  /* remote cards. Three services render these, and any of them can be down or
     rate limited, so a failed card is replaced with the same numbers fetched
     straight from the GitHub API rather than left as a broken image. */
  const GITHUB_USER = "wuzzynizzy";
  let githubSnapshot = null;
  let fallbackMounted = false;

  function readGithubCache() {
    try {
      const raw = window.sessionStorage.getItem("nizzy:github");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || Date.now() - parsed.at > 600000) return null;
      return parsed.data;
    } catch (err) {
      return null;
    }
  }

  function loadGithub() {
    if (githubSnapshot) return Promise.resolve(githubSnapshot);
    const cached = readGithubCache();
    if (cached) {
      githubSnapshot = cached;
      return Promise.resolve(cached);
    }
    const get = (url) =>
      window
        .fetch(url, { headers: { Accept: "application/vnd.github+json" } })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json();
        });
    return Promise.all([
      get(`https://api.github.com/users/${GITHUB_USER}`),
      get(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`)
    ])
      .then(([user, repos]) => {
        const stars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const counts = {};
        repos.forEach((repo) => {
          if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
        });
        const ranked = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
        const data = {
          repos: user.public_repos,
          followers: user.followers,
          stars,
          since: String(user.created_at || "").slice(0, 4),
          top: ranked[0] || "none yet"
        };
        githubSnapshot = data;
        try {
          window.sessionStorage.setItem("nizzy:github", JSON.stringify({ at: Date.now(), data }));
        } catch (err) {
          /* private mode, or storage full */
        }
        return data;
      })
      .catch(() => null);
  }

  function statRow(label, value) {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    row.appendChild(dt);
    row.appendChild(dd);
    return row;
  }

  function mountStatsFallback() {
    if (fallbackMounted) return;
    const wrap = document.querySelector(".stats-wrap");
    if (!wrap) return;
    fallbackMounted = true;

    loadGithub().then((data) => {
      wrap.querySelectorAll(".stat-card, .radical-trio, .shields-stats").forEach((el) => {
        el.hidden = true;
      });
      const panel = document.createElement("div");
      panel.className = "stats-fallback";

      if (data) {
        const list = document.createElement("dl");
        list.appendChild(statRow("public repos", String(data.repos)));
        list.appendChild(statRow("followers", String(data.followers)));
        list.appendChild(statRow("stars earned", String(data.stars)));
        list.appendChild(statRow("most used language", data.top));
        list.appendChild(statRow("on github since", data.since));
        panel.appendChild(list);
      } else {
        const note = document.createElement("p");
        note.className = "stats-fallback-note";
        note.textContent =
          "the card services and the GitHub API both refused. the numbers are on github.com/wuzzynizzy.";
        panel.appendChild(note);
      }

      const link = document.createElement("a");
      link.href = `https://github.com/${GITHUB_USER}`;
      link.textContent = "github.com/wuzzynizzy";
      panel.appendChild(link);

      wrap.appendChild(panel);
    });
  }

  /* remote stat images */
  const settleTargets = document.querySelectorAll(
    ".stats-wrap img, .radical-trio img, .shields-stats img"
  );
  settleTargets.forEach((img, index) => {
    img.classList.add("media-settle");
    img.style.setProperty("--settle-delay", `${index * 55}ms`);
    const settle = () => img.classList.add("is-loaded");
    if (img.complete && img.naturalWidth > 0) {
      settle();
    } else {
      img.addEventListener("load", settle, { once: true });
      img.addEventListener("error", () => {
        settle();
        img.classList.add("img-failed");
        mountStatsFallback();
      }, { once: true });
      // a blocked card still has to appear
      window.setTimeout(settle, 4000);
    }
  });

  /* an icon that does not load leaves its label, not a broken box */
  document
    .querySelectorAll("img[src^='https://skillicons.dev'], .chip-icon-well img")
    .forEach((img) => {
      img.addEventListener("error", () => img.classList.add("img-failed"), { once: true });
    });

  attachEmojiSprings();

  window.addEventListener("keydown", (ev) => {
    if (!activeModal) return;
    if (ev.key === "Escape") {
      ev.preventDefault();
      closeModal();
    } else if (activeModal === stickerModal && ev.key === "ArrowLeft") {
      ev.preventDefault();
      renderStickerModal(currentStickerIdx - 1, -1);
    } else if (activeModal === stickerModal && ev.key === "ArrowRight") {
      ev.preventDefault();
      renderStickerModal(currentStickerIdx + 1, 1);
    }
  });

  /* sticker tiles: drag to fling, click to inspect */
  stickerTiles.forEach((tile, idx) => {
    let resetTimer = null;
    const labelSpan = tile.querySelector("span");
    const baseLabel = labelSpan ? labelSpan.textContent : "";
    const slugMatch = (tile.getAttribute("href") || "").match(/emoji\/([a-z0-9]+)\.png$/);
    const tileSlug = slugMatch ? slugMatch[1] : null;

    let dragPointerId = null;
    let downX = 0;
    let downY = 0;
    let peeledActor = null;
    let suppressNextClick = false;
    let samples = [];

    tile.addEventListener("dragstart", (ev) => ev.preventDefault());

    tile.addEventListener("pointerdown", (ev) => {
      if (ev.pointerType !== "mouse" || ev.button !== 0 || !tileSlug) return;
      dragPointerId = ev.pointerId;
      downX = ev.clientX;
      downY = ev.clientY;
      peeledActor = null;
      samples = [{ x: ev.clientX, y: ev.clientY, t: performance.now() }];
      capturePointer(tile, ev.pointerId);
    });

    tile.addEventListener("pointermove", (ev) => {
      if (ev.pointerId !== dragPointerId) return;
      const dist = Math.hypot(ev.clientX - downX, ev.clientY - downY);
      const now = performance.now();
      samples.push({ x: ev.clientX, y: ev.clientY, t: now });
      while (samples.length > 8 && now - samples[0].t > 100) {
        samples.shift();
      }
      if (!peeledActor && dist >= 8) {
        ev.preventDefault();
        suppressNextClick = true;
        peeledActor = spawnSticker(tileSlug, ev.clientX, ev.clientY, 0, 0, true, true);
      }
      if (peeledActor) {
        const size = stickerSize();
        const prevX = peeledActor.x;
        peeledActor.x = ev.clientX - size / 2;
        peeledActor.y = ev.clientY - size / 2;
        peeledActor.angle = clamp((peeledActor.x - prevX) * 1.6, -28, 28);
      }
    });

    function endTileDrag(ev) {
      if (ev.pointerId !== dragPointerId) return;
      dragPointerId = null;
      if (peeledActor) {
        peeledActor.held = false;
        peeledActor.el.classList.remove("is-held");
        samples.push({ x: ev.clientX, y: ev.clientY, t: performance.now() });
        const vel = computeVelocity(samples);
        peeledActor.vx = vel.vx;
        peeledActor.vy = vel.vy;
        if (Math.hypot(peeledActor.vx, peeledActor.vy) < 130) {
          peeledActor.vy = -380;
          peeledActor.vx = (Math.random() - 0.5) * 320;
        }
        peeledActor.omega = clamp(peeledActor.vx * 0.28, -520, 520);
        peeledActor = null;
        ensureLoop();
      }
    }

    tile.addEventListener("pointerup", endTileDrag);
    tile.addEventListener("pointercancel", endTileDrag);

    tile.addEventListener("click", async (event) => {
      event.preventDefault();
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }
      const url = tile.getAttribute("data-copy");
      if (!url) return;

      const img = tile.querySelector("img");
      springPop(tile);
      springPop(img);

      const ok = await writeClipboard(url);
      if (statusEl) {
        statusEl.textContent = ok ? "copied " + url + " ♡" : "hotlink: " + url;
      }

      tile.classList.add("is-copied");
      if (labelSpan) labelSpan.textContent = "copied ♡";
      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        tile.classList.remove("is-copied");
        if (labelSpan) labelSpan.textContent = baseLabel;
      }, 1150);

      showToast(
        ok ? `copied ${tileSlug || "sticker"} link ♡` : `${tileSlug || "sticker"} hotlink`,
        url,
        tileSlug || "joy"
      );

      if (popupMode && stickerModal) {
        renderStickerModal(idx, false);
        openModal(stickerModal, tile);
      }
    });
  });

  /* lazy images land with a short fade instead of a pop. Opacity only inside
     the sticker grid, where 88 tiles can decode in a burst and a blur filter on
     all of them would cost more than it is worth. The animation never touches
     transform, so it cannot fight the springs the tiles already own. */
  const landTargets = Array.from(
    document.querySelectorAll("img[loading='lazy']:not(.media-settle)")
  );

  landTargets.forEach((img, index) => {
    const inGrid = Boolean(img.closest(".sticker-grid"));

    const land = () => {
      if (img.dataset.landed === "true") return;
      img.dataset.landed = "true";
      if (motionQuery.matches || typeof img.animate !== "function") return;

      const frames = inGrid
        ? [{ opacity: 0.001 }, { opacity: 1 }]
        : [
            { opacity: 0.001, filter: "blur(6px)" },
            { opacity: 1, filter: "blur(0px)" }
          ];

      img.animate(frames, {
        duration: inGrid ? 300 : 420,
        delay: Math.min(index * 40, 400),
        easing: "cubic-bezier(0.22, 0.61, 0.36, 1)"
      });
    };

    if (img.complete && img.naturalWidth > 0) {
      land();
    } else {
      img.addEventListener("load", land, { once: true });
      img.addEventListener("error", land, { once: true });
    }
  });

})();
