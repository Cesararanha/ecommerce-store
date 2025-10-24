const navbar = document.querySelector(".navbar");
const menuBtn = document.querySelector("#menu-icon");

function isOpen() {
  return navbar && navbar.classList.contains("open-menu");
}

function openMenu() {
  if (!navbar || !menuBtn) return;
  navbar.classList.add("open-menu");
  menuBtn.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  if (!navbar || !menuBtn) return;
  navbar.classList.remove("open-menu");
  menuBtn.setAttribute("aria-expanded", "false");
}

function toggleMenu() {
  if (!navbar || !menuBtn) return;
  isOpen() ? closeMenu() : openMenu();
}

if (menuBtn) {
  if (!menuBtn.hasAttribute("aria-expanded")) {
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOpen()) {
    closeMenu();
  }
});

document.addEventListener("click", (e) => {
  if (!isOpen()) return;
  const target = e.target;
  if (target === menuBtn) return;
  if (navbar && !navbar.contains(target)) closeMenu();
});

if (navbar) {
  navbar.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) closeMenu();
  });
}
