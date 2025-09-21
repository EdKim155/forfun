const rotatingPhrases = [
  "перевожу хаос в ясные цифровые переживания",
  "превращаю идеи в выразительные интерфейсы",
  "архитектурирую эмпатичные продукты",
  "собираю сервисы, которые заботятся",
];

const rotateTarget = document.querySelector('[data-rotate]');
let rotateIndex = 0;

if (rotateTarget) {
  rotateTarget.dataset.state = 'entering';
  setInterval(() => {
    rotateIndex = (rotateIndex + 1) % rotatingPhrases.length;
    rotateTarget.dataset.state = 'leaving';
    setTimeout(() => {
      rotateTarget.textContent = rotatingPhrases[rotateIndex];
      rotateTarget.dataset.state = 'entering';
    }, 220);
  }, 4000);
}

class PlasmaField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.pointer = { x: null, y: null };
    this.colors = [
      '#2C9CF0',
      '#FF3FD1',
      '#7E3AF2',
      '#C7FF6A',
    ];
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointermove', (event) => this.onPointerMove(event));
    canvas.addEventListener('pointerleave', () => this.onPointerLeave());
    requestAnimationFrame(() => this.draw());
  }

  resize() {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
    this.populate();
  }

  populate() {
    const count = Math.floor((this.width * this.height) / 12000);
    this.particles = Array.from({ length: count }, () => this.createParticle());
  }

  createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.2 + Math.random() * 0.6;
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 40 + Math.random() * 110,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
    };
  }

  onPointerMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = event.clientX - rect.left;
    this.pointer.y = event.clientY - rect.top;
  }

  onPointerLeave() {
    this.pointer.x = null;
    this.pointer.y = null;
  }

  updateParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -particle.radius) particle.x = this.width + particle.radius;
    if (particle.x > this.width + particle.radius) particle.x = -particle.radius;
    if (particle.y < -particle.radius) particle.y = this.height + particle.radius;
    if (particle.y > this.height + particle.radius) particle.y = -particle.radius;

    if (this.pointer.x !== null) {
      const dx = particle.x - this.pointer.x;
      const dy = particle.y - this.pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - distance / 260);
      particle.x += dx * influence * 0.05;
      particle.y += dy * influence * 0.05;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.particles.forEach((particle) => {
      this.updateParticle(particle);
      const gradient = this.ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius
      );
      gradient.addColorStop(0, `${particle.color}55`);
      gradient.addColorStop(0.5, `${particle.color}15`);
      gradient.addColorStop(1, '#0B102300');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    requestAnimationFrame(() => this.draw());
  }
}

const heroCanvas = document.getElementById('heroCanvas');
if (heroCanvas) {
  new PlasmaField(heroCanvas);
}

const mantras = [
  'решение начинается с вопросов',
  'архитектура = забота',
  'отвечаю за эмоцию пользователя',
  'код — это свет',
];

const mantrasNode = document.querySelector('.mantras');
let mantraIndex = 0;

function rotateMantra() {
  if (!mantrasNode) return;
  mantraIndex = (mantraIndex + 1) % mantras.length;
  mantrasNode.textContent = mantras[mantraIndex];
}

if (mantrasNode) {
  mantrasNode.textContent = mantras[0];
  setInterval(rotateMantra, 5000);
}

const insightToggles = document.querySelectorAll('.insight__toggle');
insightToggles.forEach((button) => {
  const note = button.nextElementSibling;
  const card = button.closest('.insight');
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    if (note) {
      note.hidden = expanded;
    }
  });
  if (card) {
    card.addEventListener('keydown', (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target === card) {
        event.preventDefault();
        button.click();
      }
    });
  }
});

const modeToggle = document.querySelector('.mode-toggle');
const studio = document.getElementById('studioLab');

const lightSpots = [];
let isPainting = false;

function renderStudioSpots() {
  if (!studio) return;
  for (let i = lightSpots.length - 1; i >= 0; i -= 1) {
    const spot = lightSpots[i];
    if (!spot.element.isConnected) {
      studio.appendChild(spot.element);
    }
    spot.x += spot.vx;
    spot.y += spot.vy;
    spot.vx *= 0.94;
    spot.vy *= 0.94;
    spot.life -= 1;
    spot.element.style.transform = `translate(${spot.x}px, ${spot.y}px)`;
    if (spot.life <= 0) {
      spot.element.remove();
      lightSpots.splice(i, 1);
    }
  }
}

function createSpot(x, y) {
  if (!studio) return;
  const el = document.createElement('span');
  el.className = 'studio__spot';
  el.style.left = `${x - 60}px`;
  el.style.top = `${y - 60}px`;
  const spot = {
    element: el,
    x,
    y,
    vx: (Math.random() - 0.5) * 5,
    vy: (Math.random() - 0.5) * 5,
    life: 80,
  };
  lightSpots.push(spot);
  if (lightSpots.length > 120) {
    const removed = lightSpots.shift();
    removed?.element.remove();
  }
}

function toggleStudio(force) {
  const shouldEnable = typeof force === 'boolean' ? force : !document.body.classList.contains('studio-mode');
  document.body.classList.toggle('studio-mode', shouldEnable);
  if (studio) {
    studio.hidden = !shouldEnable;
    if (!shouldEnable) {
      lightSpots.splice(0, lightSpots.length);
      studio.querySelectorAll('.studio__spot').forEach((spot) => spot.remove());
      isPainting = false;
    }
  }
  if (modeToggle) {
    modeToggle.setAttribute('aria-pressed', shouldEnable ? 'true' : 'false');
  }
}

if (modeToggle) {
  modeToggle.setAttribute('aria-pressed', 'false');
  modeToggle.addEventListener('click', () => toggleStudio());
}

document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 's' && event.altKey) {
    toggleStudio();
  }
  if (event.key === 'Escape') {
    toggleStudio(false);
  }
});

if (studio) {
  studio.addEventListener('pointermove', (event) => {
    const rect = studio.getBoundingClientRect();
    studio.style.setProperty('--x', `${event.clientX - rect.left}px`);
    studio.style.setProperty('--y', `${event.clientY - rect.top}px`);
    if (isPainting) {
      createSpot(event.clientX - rect.left, event.clientY - rect.top);
    }
  });

  studio.addEventListener('pointerdown', (event) => {
    const rect = studio.getBoundingClientRect();
    isPainting = true;
    createSpot(event.clientX - rect.left, event.clientY - rect.top);
  });

  studio.addEventListener('pointerup', () => {
    isPainting = false;
  });

  studio.addEventListener('pointerleave', () => {
    isPainting = false;
  });
}

setInterval(renderStudioSpots, 50);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.section, .story, .testimonial, .insight, .contact__form').forEach((element) => {
  observer.observe(element);
});

const contactForm = document.querySelector('.contact__form');
if (contactForm) {
  const feedbackNode = contactForm.querySelector('.form__feedback');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    contactForm.classList.add('form--sent');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправлено';
    }
    if (feedbackNode) {
      feedbackNode.hidden = false;
    }
    setTimeout(() => {
      contactForm.classList.remove('form--sent');
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Запустить разговор';
      }
      if (feedbackNode) {
        feedbackNode.hidden = true;
      }
      contactForm.reset();
    }, 2200);
  });
}
