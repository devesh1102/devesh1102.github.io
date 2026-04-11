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

// Contact form — submit via fetch, stay on page
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const status = document.getElementById('form-status');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    try {
      const res = await fetch('https://formspree.io/f/meepyrkg', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      });
      if (res.ok) {
        status.style.display = 'block';
        status.style.color = 'var(--green)';
        status.textContent = '✓ Message sent! I\'ll get back to you soon.';
        contactForm.reset();
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        btn.disabled = false;
      } else {
        throw new Error();
      }
    } catch {
      status.style.display = 'block';
      status.style.color = '#f85149';
      status.textContent = 'Something went wrong. Please email me directly at devesh1102@gmail.com';
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.disabled = false;
    }
  });
}

// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  // Close on nav link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}
