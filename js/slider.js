// Simple auto-advance slider (8s). Works with inputs #radio1, #radio2, ...
let count = 1;
let maxSlides = 4; // default fallback

function initSlider() {
  const radios = Array.from(document.querySelectorAll('input[id^="radio"]'));
  if (radios.length > 0) {
    maxSlides = radios.length;
    count = 1;
    const first = document.getElementById("radio1");
    if (first) first.checked = true;
  }
}

function nextImage() {
  count = count + 1;
  if (count > maxSlides) count = 1;
  const el = document.getElementById("radio" + count);
  if (el) el.checked = true;
}

document.addEventListener("DOMContentLoaded", () => {
  initSlider();
  setInterval(nextImage, 4000);
});

document.getElementById("delete-address")?.addEventListener("click", () => {
  if (!confirm("Excluir endereço padrão?")) return;
  DB.deleteAddress(user.id);
  alert("Endereço removido.");
  location.reload();
});
