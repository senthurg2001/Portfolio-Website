/**
 * SenthurG Portfolio JavaScript Engine
 * Optimized for 60-120 FPS High-Performance Rendering & Zero-Stutter Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initMobileNavigation();
  initScrollSpy();
  initHeroScrollFadeOut();
  initContactForm();
  initLiveDemoToasts();
  initScrollReveal();
  initDynamicStats();
});

/* ==========================================================================
   Dynamic Auto-Updating Stats Counter (Projects & Skills)
   ========================================================================== */
function initDynamicStats() {
  const projectsCountEl = document.getElementById('stat-projects-count');
  const skillsCountEl = document.getElementById('stat-skills-count');

  if (projectsCountEl) {
    const totalProjects = document.querySelectorAll('.project-row').length;
    projectsCountEl.textContent = String(totalProjects).padStart(2, '0');
  }

  if (skillsCountEl) {
    const totalSkills = document.querySelectorAll('.skill-card-compact, .skill-card').length;
    skillsCountEl.textContent = String(totalSkills).padStart(2, '0');
  }
}

/* ==========================================================================
   1. Dynamic Particle Canvas Background & Top Overlay Custom Node Cursor
   ========================================================================== */
function initParticleCanvas() {
  const bgCanvas = document.getElementById('bgCanvas');
  const cursorCanvas = document.getElementById('cursorCanvas');
  if (!bgCanvas) return;

  const ctxBg = bgCanvas.getContext('2d', { alpha: true });
  const ctxCursor = cursorCanvas ? cursorCanvas.getContext('2d', { alpha: true }) : ctxBg;

  let width = window.innerWidth;
  let height = window.innerHeight;
  let animFrameId = null;
  let isTabActive = true;

  // Particle count adapted for desktop vs mobile performance
  const particles = [];

  function initParticles() {
    particles.length = 0;
    const isMobile = width < 768;
    const particleCount = isMobile
      ? Math.min(50, Math.floor((width * height) / 20000))
      : Math.min(110, Math.floor((width * height) / 22000));

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.6 + 0.3;

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.45 + 0.2,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        tailLength: Math.random() * 20 + 22,
      });
    }
  }

  function resizeCanvases() {
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;
    if (cursorCanvas) {
      cursorCanvas.width = width;
      cursorCanvas.height = height;
    }
    initParticles();
  }

  resizeCanvases();
  window.addEventListener('resize', resizeCanvases, { passive: true });

  // Interactive Mouse & Touch Comet Trail Generator
  const cursorParticles = [];
  let cursorX = width / 2;
  let cursorY = height / 2;
  let targetMouseX = width / 2;
  let targetMouseY = height / 2;
  let isMouseActive = false;
  let isHovering = false;

  function spawnCursorComet(x, y, dx, dy) {
    const speed = Math.hypot(dx, dy) || 1;
    const count = Math.min(2, Math.max(1, Math.floor(speed * 0.12)));

    for (let i = 0; i < count; i++) {
      const moveAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.7;
      const particleSpeed = Math.random() * 1.4 + 0.4;

      cursorParticles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        radius: Math.random() * 1.6 + 0.7,
        alpha: 0.95,
        decay: Math.random() * 0.035 + 0.028,
        speedX: -Math.cos(moveAngle) * particleSpeed + (Math.random() - 0.5) * 0.3,
        speedY: -Math.sin(moveAngle) * particleSpeed + (Math.random() - 0.5) * 0.3,
        tailLength: Math.random() * 18 + 12,
      });
    }
  }

  // Update hover state ONLY on pointer move (eliminates 60fps elementFromPoint layout thrashing)
  function checkHoverState(clientX, clientY) {
    try {
      const hoveredElement = document.elementFromPoint(clientX, clientY);
      if (hoveredElement) {
        isHovering = !!hoveredElement.closest('a, button, input, select, textarea, .stat-card, .project-card, .education-card, .nav-link, .btn-download-resume, .btn-get-in-touch');
      } else {
        isHovering = false;
      }
    } catch (err) {
      isHovering = false;
    }
  }

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
    if (!isMouseActive) {
      cursorX = targetMouseX;
      cursorY = targetMouseY;
      isMouseActive = true;
    }
    checkHoverState(targetMouseX, targetMouseY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      targetMouseX = e.touches[0].clientX;
      targetMouseY = e.touches[0].clientY;
      if (!isMouseActive) {
        cursorX = targetMouseX;
        cursorY = targetMouseY;
        isMouseActive = true;
      }
      checkHoverState(targetMouseX, targetMouseY);
    }
  }, { passive: true });

  // Handle Tab Visibility Changes (Pause canvas when inactive to save battery & CPU)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isTabActive = false;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    } else {
      isTabActive = true;
      if (!animFrameId) {
        render();
      }
    }
  });

  function render() {
    if (!isTabActive) return;

    // Clear Background Canvas
    ctxBg.clearRect(0, 0, width, height);

    // Clear Cursor Canvas
    if (ctxCursor !== ctxBg) {
      ctxCursor.clearRect(0, 0, width, height);
    }

    // 1. Render Ambient Background Comet Particles (Zero GC allocation in loop)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < -30) p.x = width + 30;
      if (p.x > width + 30) p.x = -30;
      if (p.y < -30) p.y = height + 30;
      if (p.y > height + 30) p.y = -30;

      const tailX = p.x - p.speedX * p.tailLength;
      const tailY = p.y - p.speedY * p.tailLength;

      // Draw tail line directly (fast GPU path)
      ctxBg.beginPath();
      ctxBg.moveTo(p.x, p.y);
      ctxBg.lineTo(tailX, tailY);
      ctxBg.strokeStyle = `rgba(255, 110, 0, ${p.alpha * 0.5})`;
      ctxBg.lineWidth = p.radius * 1.3;
      ctxBg.lineCap = 'round';
      ctxBg.stroke();

      // Core particle dot
      ctxBg.beginPath();
      ctxBg.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctxBg.fillStyle = `rgba(255, 200, 110, ${p.alpha})`;
      ctxBg.fill();
    }

    // 2. Render Interactive Mouse Cursor Comet Trail Particles
    for (let i = cursorParticles.length - 1; i >= 0; i--) {
      const cp = cursorParticles[i];
      cp.x += cp.speedX;
      cp.y += cp.speedY;
      cp.alpha -= cp.decay;

      if (cp.alpha <= 0) {
        cursorParticles.splice(i, 1);
        continue;
      }

      const tailX = cp.x - cp.speedX * cp.tailLength;
      const tailY = cp.y - cp.speedY * cp.tailLength;

      ctxBg.beginPath();
      ctxBg.moveTo(cp.x, cp.y);
      ctxBg.lineTo(tailX, tailY);
      ctxBg.strokeStyle = `rgba(255, 120, 0, ${cp.alpha * 0.6})`;
      ctxBg.lineWidth = cp.radius * 1.4;
      ctxBg.lineCap = 'round';
      ctxBg.stroke();

      ctxBg.beginPath();
      ctxBg.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);
      ctxBg.fillStyle = `rgba(255, 220, 140, ${cp.alpha})`;
      ctxBg.fill();
    }

    // 3. Render Glowing Main Node Cursor Dot
    if (isMouseActive) {
      const dx = targetMouseX - cursorX;
      const dy = targetMouseY - cursorY;

      // Fast responsive tracking
      cursorX += dx * 0.85;
      cursorY += dy * 0.85;

      const currentSpeed = Math.hypot(dx, dy);
      if (currentSpeed > 0.8) {
        spawnCursorComet(cursorX, cursorY, dx, dy);
      }

      const ringRadius = isHovering ? 11 : 8;
      const innerRadius = isHovering ? 4 : 2.5;

      // 3A. Outer Glowing Orange Ring with GPU-friendly radial glow
      ctxCursor.beginPath();
      ctxCursor.arc(cursorX, cursorY, ringRadius + 4, 0, Math.PI * 2);
      ctxCursor.fillStyle = isHovering ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 107, 0, 0.06)';
      ctxCursor.fill();

      ctxCursor.beginPath();
      ctxCursor.arc(cursorX, cursorY, ringRadius, 0, Math.PI * 2);
      ctxCursor.fillStyle = isHovering ? 'rgba(255, 107, 0, 0.28)' : 'rgba(255, 107, 0, 0.15)';
      ctxCursor.strokeStyle = isHovering ? '#ff8c00' : '#ff6b00';
      ctxCursor.lineWidth = isHovering ? 2.8 : 2.2;
      ctxCursor.stroke();
      ctxCursor.fill();

      // 3B. Inner Pure White Core Dot
      ctxCursor.beginPath();
      ctxCursor.arc(cursorX, cursorY, innerRadius, 0, Math.PI * 2);
      ctxCursor.fillStyle = '#ffffff';
      ctxCursor.fill();
    }

    animFrameId = requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. Home Scroll Down Indicator Smooth Fade Out on Scroll
   ========================================================================== */
function initHeroScrollFadeOut() {
  const scrollIndicator = document.getElementById('heroScrollIndicator');
  if (!scrollIndicator) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollY > 30 && scrollY < 200) {
          const opacity = Math.max(0, 1 - (scrollY - 30) / 120);
          scrollIndicator.style.opacity = opacity;
          scrollIndicator.style.transform = `translate(-50%, ${Math.min(25, (scrollY - 30) * 0.15)}px)`;
          scrollIndicator.style.pointerEvents = opacity <= 0.1 ? 'none' : 'auto';
        } else if (scrollY >= 200) {
          if (scrollIndicator.style.opacity !== '0') {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.pointerEvents = 'none';
          }
        } else {
          scrollIndicator.style.opacity = '1';
          scrollIndicator.style.transform = 'translate(-50%, 0px)';
          scrollIndicator.style.pointerEvents = 'auto';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   3. Precision ScrollSpy (Cached Coordinates & Zero Layout Thrashing)
   ========================================================================== */
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionIds = [
    { id: 'home', key: 'home' },
    { id: 'about', key: 'about' },
    { id: 'overview', key: 'about' },   // Numbers That Define Me maps to 'About' tab
    { id: 'education', key: 'education' },
    { id: 'skills', key: 'skills' },
    { id: 'projects', key: 'projects' },
    { id: 'contact', key: 'contact' }
  ];

  let cachedSections = [];

  // Recalculate section absolute positions on load & resize (never during scroll!)
  function cacheSectionPositions() {
    cachedSections = [];
    sectionIds.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        cachedSections.push({
          key: sec.key,
          top: top,
          bottom: top + height
        });
      }
    });
  }

  cacheSectionPositions();
  window.addEventListener('resize', cacheSectionPositions, { passive: true });

  let ticking = false;

  function updateActiveNav() {
    const pageY = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 1. At top of page (<150px scroll), activate 'home'
    if (pageY < 150) {
      setActive('home');
      return;
    }

    // 2. Near bottom of page (within 60px of page end), activate 'contact'
    if (viewportHeight + pageY >= documentHeight - 60) {
      setActive('contact');
      return;
    }

    // 3. Dynamic viewport focus line (40% down screen)
    const triggerLine = pageY + viewportHeight * 0.4;
    let activeKey = null;

    for (let i = 0; i < cachedSections.length; i++) {
      const sec = cachedSections[i];
      if (triggerLine >= sec.top && triggerLine <= sec.bottom) {
        activeKey = sec.key;
        break;
      }
    }

    if (activeKey) {
      setActive(activeKey);
    }
  }

  function setActive(key) {
    navLinks.forEach((link) => {
      if (link.getAttribute('data-section') === key) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Instant active tab update on nav link click
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const secKey = link.getAttribute('data-section');
      if (secKey) {
        setActive(secKey);
      }
    });
  });

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateActiveNav();
}

/* ==========================================================================
   4. Contact Form Dynamic Feedback
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-send-message');
    const originalText = btn.innerHTML;

    btn.innerHTML = `Sending... <span class="arrow">⏳</span>`;
    btn.style.opacity = '0.7';

    setTimeout(() => {
      btn.innerHTML = `Message Sent! <span class="arrow">✓</span>`;
      btn.style.color = '#00ff88';
      btn.style.borderColor = '#00ff88';
      btn.style.opacity = '1';

      form.reset();

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 3500);
    }, 1200);
  });
}

/* ==========================================================================
   5. Responsive Mobile Navigation Toggle System
   ========================================================================== */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('navToggleBtn');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');

  if (!toggleBtn || !navMenu) return;

  function openMenu() {
    toggleBtn.classList.add('active');
    navMenu.classList.add('active');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggleBtn.classList.remove('active');
    navMenu.classList.remove('active');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   5. Top-Right Floating Toast Notification System & Contact Form Handler
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;

  let icon = '💡';
  if (type === 'success') icon = '✨';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span style="font-size: 1.15rem; flex-shrink: 0;">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger smooth entrance animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto disappear after 3.5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 450);
  }, 3500);
}

function initLiveDemoToasts() {
  const demoButtons = document.querySelectorAll('.btn-demo');
  demoButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Live Demo will be available soon.', 'info');
    });
  });
}

function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');

  if (!contactForm) return;

  const nameInput = document.getElementById('nameInput');
  const emailInput = document.getElementById('emailInput');
  const messageInput = document.getElementById('messageInput');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const messageVal = messageInput ? messageInput.value.trim() : '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Custom Validation with Top-Right Toast Notifications
    if (!nameVal) {
      showToast('Please enter your name.', 'error');
      return;
    }

    if (!emailVal || !emailRegex.test(emailVal)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (!messageVal) {
      showToast('Please write a message before sending.', 'error');
      return;
    }

    // Save original button content & show loading state
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const btnTextSpan = submitBtn.querySelector('.btn-text');
    if (btnTextSpan) {
      btnTextSpan.innerHTML = 'Sending message... <span class="arrow">⏳</span>';
    }

    try {
      const formData = new FormData(contactForm);
      formData.append('access_key', '012af1a9-b4d5-4102-b1e2-24a10318ad23');
      formData.append('botcheck', '');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.status === 200 && data.success) {
        showToast('Message Sent Successfully! Senthur will get back to you soon.', 'success');
        contactForm.reset();
      } else {
        throw new Error(data.message || 'Submission error');
      }
    } catch (err) {
      showToast(err.message || 'Submission failed. Please try again.', 'error');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  });
}

/* ==========================================================================
   6. World-Class Premium Scroll Reveal Engine (Awwwards Grade)
   ========================================================================== */
function initScrollReveal() {
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  let scrollDirection = 'down';
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.pageYOffset || document.documentElement.scrollTop;
        if (currentY > lastScrollY + 2) {
          scrollDirection = 'down';
        } else if (currentY < lastScrollY - 2) {
          scrollDirection = 'up';
        }
        lastScrollY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Helper to add reveal-element class & calculate forward / reverse stagger delays per section
  function applySequence(parentSelector, itemsConfig) {
    const parents = document.querySelectorAll(parentSelector);
    parents.forEach((parent) => {
      let flatItems = [];
      itemsConfig.forEach((cfg) => {
        const elements = parent.querySelectorAll(cfg.selector);
        elements.forEach((el) => {
          flatItems.push({ el, stepDelay: cfg.stepDelay || 0.08 });
        });
      });

      const total = flatItems.length;

      flatItems.forEach((item, idx) => {
        const { el, stepDelay } = item;
        el.classList.add('reveal-element');

        const fwd = idx * stepDelay;
        const rev = (total - 1 - idx) * stepDelay;

        el.dataset.fwdDelay = `${fwd.toFixed(2)}s`;
        el.dataset.revDelay = `${rev.toFixed(2)}s`;
        el.style.transitionDelay = `${fwd.toFixed(2)}s`;
      });
    });
  }

  // 1. Hero Section Sequence
  applySequence('#home', [
    { selector: '.hero-badge', stepDelay: 0.08 },
    { selector: '.hero-title', stepDelay: 0.08 },
    { selector: '.hero-subtitle', stepDelay: 0.08 },
    { selector: '.hero-bullets', stepDelay: 0.08 },  /* FIX: target the <ul> parent — larger bounding box = reliable IntersectionObserver detection */
    { selector: '.hero-actions', stepDelay: 0.08 },
    { selector: '.hero-code-snippet', stepDelay: 0.08 },
    { selector: '.hero-visual', stepDelay: 0.08 },
  ]);

  // 2. About / Profile Summary Sequence
  applySequence('#about', [
    { selector: '.section-tag', stepDelay: 0.07 },
    { selector: '.section-heading', stepDelay: 0.07 },
    { selector: '.about-description', stepDelay: 0.07 },
    { selector: '.about-bullets li', stepDelay: 0.07 },
    { selector: '.info-card', stepDelay: 0.09 },
    { selector: '.about-visual', stepDelay: 0.04 },
  ]);

  // 3. My Journey / Overview Sequence
  applySequence('#overview', [
    { selector: '.section-tag', stepDelay: 0.07 },
    { selector: '.section-heading', stepDelay: 0.07 },
    { selector: '.section-subtitle', stepDelay: 0.07 },
    { selector: '.stat-card', stepDelay: 0.08 },
  ]);

  // 4. Academic Background / Education Sequence
  applySequence('#education', [
    { selector: '.section-tag', stepDelay: 0.07 },
    { selector: '.section-heading', stepDelay: 0.07 },
    { selector: '.section-subtitle', stepDelay: 0.07 },
    { selector: '.zigzag-row', stepDelay: 0.12 },
  ]);

  // 5. Technical Skills Sequence
  applySequence('#skills', [
    { selector: '.section-tag', stepDelay: 0.06 },
    { selector: '.section-heading', stepDelay: 0.06 },
    { selector: '.section-subtitle', stepDelay: 0.06 },
    { selector: '.skills-category-title', stepDelay: 0.06 },
    { selector: '.skill-card-compact, .skill-card', stepDelay: 0.06 },
  ]);

  // 6. My Projects Sequence
  applySequence('#projects', [
    { selector: '.section-tag', stepDelay: 0.07 },
    { selector: '.section-heading', stepDelay: 0.07 },
    { selector: '.section-subtitle', stepDelay: 0.07 },
    { selector: '.project-row', stepDelay: 0.12 },
  ]);

  // 7. Let's Connect / Contact Sequence
  applySequence('#contact', [
    { selector: '.section-tag', stepDelay: 0.07 },
    { selector: '.section-heading', stepDelay: 0.07 },
    { selector: '.contact-subtext', stepDelay: 0.07 },
    { selector: '.contact-info-item', stepDelay: 0.07 },
    { selector: '.form-group', stepDelay: 0.07 },
    { selector: '.btn-send-message', stepDelay: 0.07 },
  ]);

  // High-Precision IntersectionObserver
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const fwd = el.dataset.fwdDelay || '0s';
        const rev = el.dataset.revDelay || '0s';

        if (entry.isIntersecting) {
          el.style.transitionDelay = scrollDirection === 'up' ? rev : fwd;
          el.classList.add('revealed');
        } else {
          el.style.transitionDelay = scrollDirection === 'up' ? rev : fwd;
          el.classList.remove('revealed');
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px',
    }
  );

  const allElements = document.querySelectorAll('.reveal-element');
  allElements.forEach((el) => revealObserver.observe(el));

  /* ANIMATION FIX: Hero elements that are already in the viewport when the page loads
     must be force-revealed on the next animation frame.
     IntersectionObserver callbacks are async — for elements already visible (hero section),
     the callback fires correctly but may miss very small elements at threshold 0.08.
     This pass runs ONCE after DOM layout is complete and uses the exact same
     .revealed class + CSS transition system — no new animation is created. */
  requestAnimationFrame(() => {
    const heroSection = document.getElementById('home');
    if (!heroSection) return;
    const heroRevealEls = heroSection.querySelectorAll('.reveal-element');
    heroRevealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        /* Reuse fwdDelay already set by applySequence for natural stagger */
        el.style.transitionDelay = el.dataset.fwdDelay || '0s';
        el.classList.add('revealed');
      }
    });
  });
}
