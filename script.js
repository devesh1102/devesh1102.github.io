// Smooth active nav highlight on scroll
const sections = document.querySelectorAll('section[id], #projects, #blog, #contact');
const navLinks = document.querySelectorAll('nav ul a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('section[id]').forEach(s => observer.observe(s));

// Fade-in timeline cards on scroll
const cards = document.querySelectorAll('.timeline-item');

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

cards.forEach(card => {
  card.classList.add('fade-in');
  cardObserver.observe(card);
});
