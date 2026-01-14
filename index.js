// Efeito simples de revelação ao rolar
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section");
  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop < window.innerHeight - 100) {
      section.style.opacity = "1";
      section.style.transform = "translateY(0)";
    }
  });
});

// Inicialização de estilo para o efeito de scroll
document.querySelectorAll("section").forEach((s) => {
  s.style.opacity = "0";
  s.style.transform = "translateY(20px)";
  s.style.transition = "all 0.6s ease-out";
});
