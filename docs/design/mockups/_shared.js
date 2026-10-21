/* =========================================================================
   easycert · mockup interactivity
   Zero framework. Toggle de tema, dropdowns, side panel, toast demo,
   keyboard shortcuts na fila do coord (j/k/Enter/Esc/R).
   ======================================================================= */

(() => {
  // ----- Theme toggle (persist em localStorage pra demo, equivalente ao cookie em prod)
  const THEME_KEY = "easycert.theme";

  function setTheme(theme, persist = true) {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    if (persist) {
      try { localStorage.setItem(THEME_KEY, t); } catch {}
    }
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(t === "dark"));
      const label = btn.querySelector("[data-theme-label]");
      if (label) label.textContent = t === "dark" ? "Claro" : "Escuro";
      const icon = btn.querySelector("[data-theme-icon]");
      if (icon) {
        icon.classList.remove("ph-sun", "ph-moon");
        icon.classList.add(t === "dark" ? "ph-sun" : "ph-moon");
      }
    });
  }

  function initTheme() {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch {}
    const sys = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(stored || sys, false);
  }

  initTheme();

  document.addEventListener("click", (e) => {
    const toggle = e.target.closest("[data-theme-toggle]");
    if (!toggle) return;
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });

  // ----- Dropdown menus (click to toggle, click outside to close)
  function closeAllMenus(except) {
    document.querySelectorAll(".menu[data-open='true']").forEach((m) => {
      if (m !== except) m.setAttribute("data-open", "false");
    });
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-menu-trigger]");
    if (trigger) {
      const id = trigger.getAttribute("data-menu-trigger");
      const menu = document.querySelector(`[data-menu="${id}"]`);
      if (!menu) return;
      const open = menu.getAttribute("data-open") === "true";
      closeAllMenus(menu);
      menu.setAttribute("data-open", open ? "false" : "true");
      e.stopPropagation();
      return;
    }
    if (!e.target.closest(".menu")) closeAllMenus();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllMenus();
  });

  // ----- Sheet (side panel)
  function openSheet(id) {
    const backdrop = document.querySelector(`[data-sheet-backdrop="${id}"]`);
    const sheet = document.querySelector(`[data-sheet="${id}"]`);
    if (!sheet) return;
    if (backdrop) backdrop.setAttribute("data-open", "true");
    sheet.setAttribute("data-open", "true");
    sheet.removeAttribute("data-exiting");
  }

  function closeSheet(id) {
    const backdrop = document.querySelector(`[data-sheet-backdrop="${id}"]`);
    const sheet = document.querySelector(`[data-sheet="${id}"]`);
    if (!sheet) return;
    if (backdrop) backdrop.setAttribute("data-open", "false");
    sheet.setAttribute("data-exiting", "true");
    sheet.setAttribute("data-open", "false");
  }

  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("[data-sheet-open]");
    if (openBtn) {
      openSheet(openBtn.getAttribute("data-sheet-open"));
      return;
    }
    const closeBtn = e.target.closest("[data-sheet-close]");
    if (closeBtn) {
      closeSheet(closeBtn.getAttribute("data-sheet-close"));
      return;
    }
    const backdrop = e.target.matches("[data-sheet-backdrop]") ? e.target : null;
    if (backdrop) {
      closeSheet(backdrop.getAttribute("data-sheet-backdrop"));
    }
  });

  // ----- Modal
  function openModal(id) {
    const el = document.querySelector(`[data-modal="${id}"]`);
    if (!el) return;
    el.setAttribute("data-open", "true");
  }

  function closeModal(id) {
    const el = document.querySelector(`[data-modal="${id}"]`);
    if (!el) return;
    el.setAttribute("data-open", "false");
  }

  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("[data-modal-open]");
    if (openBtn) {
      openModal(openBtn.getAttribute("data-modal-open"));
      return;
    }
    const closeBtn = e.target.closest("[data-modal-close]");
    if (closeBtn) {
      closeModal(closeBtn.getAttribute("data-modal-close"));
      return;
    }
    if (e.target.matches("[data-modal]")) {
      closeModal(e.target.getAttribute("data-modal"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll("[data-sheet][data-open='true']").forEach((s) =>
      closeSheet(s.getAttribute("data-sheet"))
    );
    document.querySelectorAll("[data-modal][data-open='true']").forEach((m) =>
      closeModal(m.getAttribute("data-modal"))
    );
  });

  // ----- Toast
  const toastStack = () => {
    let el = document.querySelector(".toast-stack");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast-stack";
      document.body.appendChild(el);
    }
    return el;
  };

  window.toast = function (opts) {
    const { title, desc, icon = "check-circle", variant = "accent", duration = 3200 } = opts || {};
    const stack = toastStack();
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `
      <i class="ph-fill ph-${icon} toast__icon" style="color: var(--${variant === "destructive" ? "destructive" : variant === "warning" ? "warning" : "accent"})"></i>
      <div style="flex:1">
        <p class="toast__title">${title || ""}</p>
        ${desc ? `<p class="toast__desc">${desc}</p>` : ""}
      </div>
    `;
    stack.appendChild(el);
    requestAnimationFrame(() => el.setAttribute("data-mounted", "true"));
    setTimeout(() => {
      el.setAttribute("data-leaving", "true");
      setTimeout(() => el.remove(), 220);
    }, duration);
  };

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-toast]");
    if (!trigger) return;
    e.preventDefault();
    try {
      const payload = JSON.parse(trigger.getAttribute("data-toast"));
      window.toast(payload);
    } catch {
      window.toast({ title: trigger.getAttribute("data-toast") });
    }
  });

  // ----- Tabs
  document.addEventListener("click", (e) => {
    const tab = e.target.closest(".tabs__item");
    if (!tab) return;
    const group = tab.parentElement;
    group.querySelectorAll(".tabs__item").forEach((t) => t.setAttribute("aria-selected", "false"));
    tab.setAttribute("aria-selected", "true");
  });

  // ----- Keyboard navigation para fila do coord (j/k/Enter/Esc/R)
  // Opt-in: a tabela tem data-keyboard-list="fila"
  const list = document.querySelector("[data-keyboard-list]");
  if (list) {
    const sheetId = list.getAttribute("data-sheet-target") || "pedido";
    const rows = () => Array.from(list.querySelectorAll("tbody tr[data-row]"));

    function selectIndex(idx) {
      const r = rows();
      if (!r.length) return;
      const clamped = Math.max(0, Math.min(idx, r.length - 1));
      r.forEach((row, i) => row.setAttribute("aria-selected", String(i === clamped)));
      list.setAttribute("data-selected", String(clamped));
      // scroll into view sem animação
      r[clamped].scrollIntoView({ block: "nearest" });
    }

    function currentIndex() {
      const v = list.getAttribute("data-selected");
      return v ? parseInt(v, 10) : 0;
    }

    // seleção inicial
    selectIndex(0);

    document.addEventListener("keydown", (e) => {
      // só se foco não está em input/textarea
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      // se sheet está aberto, só R abre dialog de rejeição
      const sheetOpen = document.querySelector(`[data-sheet="${sheetId}"][data-open="true"]`);
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        selectIndex(currentIndex() + 1);
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        selectIndex(currentIndex() - 1);
      } else if (e.key === "Enter" && !sheetOpen) {
        e.preventDefault();
        openSheet(sheetId);
      } else if (e.key.toLowerCase() === "r" && sheetOpen && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openModal("rejeitar");
      }
    });

    // click também seleciona
    list.addEventListener("click", (e) => {
      const row = e.target.closest("tr[data-row]");
      if (!row) return;
      const idx = rows().indexOf(row);
      selectIndex(idx);
    });
  }

  // ----- "Entrar" sem animação em ação disparada por teclado (keyboard-aware)
  let lastInputWasKeyboard = false;
  window.addEventListener("keydown", () => { lastInputWasKeyboard = true; }, true);
  window.addEventListener("mousedown", () => { lastInputWasKeyboard = false; }, true);
  window.addEventListener("touchstart", () => { lastInputWasKeyboard = false; }, true);
})();
