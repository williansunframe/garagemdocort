/* ==========================================================
   CONFIGURAÇÃO — edite aqui
   ========================================================== */
const CONFIG = {
  // WhatsApp: código do país (55) + DDD (51) + número, só dígitos.
  whatsapp: "5551981765059",       // barbearia (atendimento geral)
  whatsappCursos: "5551994310824", // cursos Iniciante e PRO

  // Link oficial de agendamento (BestBarbers)
  booking: "https://agendamentos.bestbarbers.app/barbershop/Htt",
};

(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.remove("no-js");

  /* ---------- Links de agendamento e WhatsApp ---------- */
  const safeExternal = (a, href) => {
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  };

  document.querySelectorAll("[data-booking]").forEach((a) => safeExternal(a, CONFIG.booking));

  const digits = (n) => String(n).replace(/\D/g, "");
  document.querySelectorAll("[data-wa]").forEach((a) => {
    const msg = a.getAttribute("data-wa") || "";
    const number = digits(a.getAttribute("data-wa-to") === "cursos" ? CONFIG.whatsappCursos : CONFIG.whatsapp);
    safeExternal(a, "https://wa.me/" + number + (msg ? "?text=" + encodeURIComponent(msg) : ""));
  });

  /* ---------- Destaca o dia de hoje nos horários ---------- */
  const today = document.querySelector('#horarios [data-day="' + new Date().getDay() + '"]');
  if (today) today.classList.add("is-today");

  /* ---------- Header ao rolar ---------- */
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Reveal ao rolar ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 6) * 70 + "ms";
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Cards 3D (tilt) ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.querySelectorAll(".tilt").forEach((card) => {
    if (reduceMotion) return;
    if (finePointer) {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = "transform .1s linear";
        card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(0)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transition = "";
        card.style.transform = "";
      });
    }
  });

  // No celular: leve inclinação 3D conforme o card passa pela tela
  if (!finePointer && !reduceMotion) {
    const cards = document.querySelectorAll(".tilt");
    let ticking = false;
    const tiltOnScroll = () => {
      const vh = window.innerHeight;
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const p = (r.top + r.height / 2) / vh - 0.5; // -0.5..0.5
        card.style.transform = `rotateX(${Math.max(-1, Math.min(1, p)) * 10}deg)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(tiltOnScroll); }
    }, { passive: true });
    tiltOnScroll();
  }

  /* ---------- Ano no rodapé ---------- */
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
