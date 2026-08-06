/**
 * SenthurG Portfolio JavaScript Engine
 * Dynamic Particle Background, Pixel-Perfect SVG Zigzag Path & Connector Renderer, Hero Scroll Indicator Fade-Out & Precision ScrollSpy
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

  const ctxBg = bgCanvas.getContext('2d');
  const ctxCursor = cursorCanvas ? cursorCanvas.getContext('2d') : ctxBg;

  let width = window.innerWidth;
  let height = window.innerHeight;

  function resizeCanvases() {
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;
    if (cursorCanvas) {
      cursorCanvas.width = width;
      cursorCanvas.height = height;
    }
  }

  resizeCanvases();
  window.addEventListener('resize', resizeCanvases, { passive: true });

  // Ambient background particles
  const particles = [];
  const particleCount = Math.min(150, Math.floor((width * height) / 24000));

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.7 + 0.3;

    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.5 + 0.2,
      speedX: Math.cos(angle) * speed,
      speedY: Math.sin(angle) * speed,
      tailLength: Math.random() * 25 + 28,
    });
  }

  // Interactive Mouse & Touch Comet Trail Generator
  const cursorParticles = [];
  let cursorX = width / 2;
  let cursorY = height / 2;
  let targetMouseX = width / 2;
  let targetMouseY = height / 2;
  let isMouseActive = false;
  let isHovering = false;

  // Zero-Reflow Hover Detection via Global Event Delegation
  const hoverSelector = 'a, button, input, select, textarea, .stat-card, .project-card, .education-card, .nav-link, .btn-download-resume, .btn-get-in-touch';
  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest) {
      isHovering = !!e.target.closest(hoverSelector);
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.closest && e.target.closest(hoverSelector)) {
      isHovering = false;
    }
  }, { passive: true });

  function spawnCursorComet(x, y, dx, dy) {
    const speed = Math.hypot(dx, dy) || 1;
    const count = Math.min(3, Math.max(1, Math.floor(speed * 0.15)));

    for (let i = 0; i < count; i++) {
      const moveAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
      const particleSpeed = Math.random() * 1.5 + 0.5;

      cursorParticles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        radius: Math.random() * 1.8 + 0.8,
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.025,
        speedX: -Math.cos(moveAngle) * particleSpeed + (Math.random() - 0.5) * 0.4,
        speedY: -Math.sin(moveAngle) * particleSpeed + (Math.random() - 0.5) * 0.4,
        tailLength: Math.random() * 20 + 14,
      });
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
    }
  }, { passive: true });

  // Intelligent Offscreen / Tab Pause Engine using IntersectionObserver & Page Visibility API
  let isCanvasVisible = true;
  let isPageVisible = !document.hidden;
  let animFrameId = null;

  if ('IntersectionObserver' in window) {
    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible && isPageVisible && !animFrameId) {
          animFrameId = requestAnimationFrame(render);
        }
      });
    }, { threshold: 0 });
    canvasObserver.observe(bgCanvas);
  }

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isCanvasVisible && isPageVisible && !animFrameId) {
      animFrameId = requestAnimationFrame(render);
    }
  });

  function render() {
    if (!isCanvasVisible || !isPageVisible) {
      animFrameId = null;
      return;
    }

    // Clear Background Canvas
    ctxBg.clearRect(0, 0, width, height);

    // Clear Cursor Canvas
    if (ctxCursor !== ctxBg) {
      ctxCursor.clearRect(0, 0, width, height);
    }

    // 1. Render Ambient Background Comet Particles (Zero GC allocation, stroke optimized)
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < -30) p.x = width + 30;
      if (p.x > width + 30) p.x = -30;
      if (p.y < -30) p.y = height + 30;
      if (p.y > height + 30) p.y = -30;

      const tailX = p.x - p.speedX * p.tailLength;
      const tailY = p.y - p.speedY * p.tailLength;

      ctxBg.beginPath();
      ctxBg.moveTo(p.x, p.y);
      ctxBg.lineTo(tailX, tailY);
      ctxBg.strokeStyle = `rgba(255, 107, 0, ${p.alpha * 0.45})`;
      ctxBg.lineWidth = p.radius * 1.4;
      ctxBg.lineCap = 'round';
      ctxBg.stroke();

      ctxBg.beginPath();
      ctxBg.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctxBg.fillStyle = `rgba(255, 200, 100, ${p.alpha})`;
      ctxBg.fill();
    });

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
      ctxBg.strokeStyle = `rgba(255, 107, 0, ${cp.alpha * 0.55})`;
      ctxBg.lineWidth = cp.radius * 1.5;
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

      // Fast responsive tracking (0.85 lerp for instant precise clicks)
      cursorX += dx * 0.85;
      cursorY += dy * 0.85;

      const currentSpeed = Math.hypot(dx, dy);
      if (currentSpeed > 0.8) {
        spawnCursorComet(cursorX, cursorY, dx, dy);
      }

      const ringRadius = isHovering ? 11 : 8;
      const innerRadius = isHovering ? 4 : 2.5;

      // 3A. Outer Glowing Orange Ring
      ctxCursor.beginPath();
      ctxCursor.arc(cursorX, cursorY, ringRadius, 0, Math.PI * 2);
      ctxCursor.fillStyle = isHovering ? 'rgba(255, 107, 0, 0.28)' : 'rgba(255, 107, 0, 0.15)';
      ctxCursor.strokeStyle = isHovering ? '#ff8c00' : '#ff6b00';
      ctxCursor.lineWidth = isHovering ? 2.8 : 2.2;
      ctxCursor.shadowBlur = isHovering ? 18 : 12;
      ctxCursor.shadowColor = '#ff6b00';
      ctxCursor.stroke();
      ctxCursor.fill();

      // 3B. Inner Pure White Core Dot
      ctxCursor.beginPath();
      ctxCursor.arc(cursorX, cursorY, innerRadius, 0, Math.PI * 2);
      ctxCursor.fillStyle = '#ffffff';
      ctxCursor.shadowBlur = 6;
      ctxCursor.shadowColor = '#ffffff';
      ctxCursor.fill();

      ctxCursor.shadowBlur = 0;
    }

    animFrameId = requestAnimationFrame(render);
  }

  animFrameId = requestAnimationFrame(render);
}

/* ==========================================================================
   2. Home Scroll Down Indicator Smooth Fade Out on Scroll (rAF Throttled)
   ========================================================================== */
function initHeroScrollFadeOut() {
  const scrollIndicator = document.getElementById('heroScrollIndicator');
  if (!scrollIndicator) return;

  let isTicking = false;

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        if (scrollY > 30) {
          const opacity = Math.max(0, 1 - (scrollY - 30) / 120);
          scrollIndicator.style.opacity = opacity;
          scrollIndicator.style.transform = `translate(-50%, ${Math.min(25, (scrollY - 30) * 0.15)}px)`;
          scrollIndicator.style.pointerEvents = opacity <= 0.1 ? 'none' : 'auto';
        } else {
          scrollIndicator.style.opacity = '1';
          scrollIndicator.style.transform = 'translate(-50%, 0px)';
          scrollIndicator.style.pointerEvents = 'auto';
        }
        isTicking = false;
      });
    }
  }, { passive: true });
}

/* ==========================================================================
   3. Precision ScrollSpy (rAF Throttled & DOM Mutation Guarded)
   ========================================================================== */
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-link');

  const sections = [
    { id: 'home', key: 'home' },
    { id: 'about', key: 'about' },
    { id: 'overview', key: 'about' },   // Numbers That Define Me maps to 'About' tab
    { id: 'education', key: 'education' },
    { id: 'experience', key: 'experience' },
    { id: 'skills', key: 'skills' },
    { id: 'projects', key: 'projects' },
    { id: 'contact', key: 'contact' }
  ];

  let currentActiveKey = null;
  let isTicking = false;

  function updateActiveNav() {
    const pageY = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 1. At top of page (<150px scroll), activate 'home'
    if (pageY < 150) {
      setActive('home');
      return;
    }

    // 2. Near bottom of page (within 80px of page end), activate 'contact'
    if (viewportHeight + pageY >= documentHeight - 80) {
      setActive('contact');
      return;
    }

    // 3. Real-time Live Bounding Rect position check (Zero stale positions on image/layout shifts)
    let activeKey = null;
    const triggerOffset = viewportHeight * 0.35;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const el = document.getElementById(sec.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerOffset && rect.bottom >= 100) {
          activeKey = sec.key;
        }
      }
    }

    if (activeKey) {
      setActive(activeKey);
    }
  }

  function setActive(key) {
    if (key === currentActiveKey) return; // Skip unnecessary DOM classList mutations
    currentActiveKey = key;

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
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(() => {
        updateActiveNav();
        isTicking = false;
      });
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

      // Standard Client-Side FormData fetch (Web3Forms Free API requirement)
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Web3Forms Response:', data);

      if (response.status === 200 && data.success) {
        showToast('Message Sent Successfully! Senthur will get back to you soon.', 'success');
        contactForm.reset();
      } else {
        throw new Error(data.message || 'Submission error');
      }
    } catch (err) {
      console.error('Form Submit Error:', err);
      showToast(err.message || 'Submission failed. Please try again.', 'error');
    } finally {
      // Reset button state without scrolling page
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  });
}

/* ==========================================================================
   6. World-Class Premium Scroll Reveal Engine (Awwwards Grade)
   - Scroll Down: Forward Cascading Pop-Up Reveal (Tag -> Heading -> Subtitle -> Cards -> Buttons)
   - Scroll Up: Reverse Cascading Pop-Down Hide (Buttons -> Cards -> Subtitle -> Heading -> Tag)
   ========================================================================== */
function initScrollReveal() {
  // Track scroll direction dynamically (rAF Throttled)
  let lastScrollY = window.pageYOffset;
  let scrollDirection = 'down';
  let isScrollDirTicking = false;

  window.addEventListener('scroll', () => {
    if (!isScrollDirTicking) {
      isScrollDirTicking = true;
      requestAnimationFrame(() => {
        const currentY = window.pageYOffset;
        if (currentY > lastScrollY + 2) {
          scrollDirection = 'down';
        } else if (currentY < lastScrollY - 2) {
          scrollDirection = 'up';
        }
        lastScrollY = currentY;
        isScrollDirTicking = false;
      });
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

  // 5. Experience Sequence
  applySequence('#experience', [
    { selector: '.section-tag', stepDelay: 0.07 },
    { selector: '.section-heading', stepDelay: 0.07 },
    { selector: '.section-subtitle', stepDelay: 0.07 },
    { selector: '.experience-card', stepDelay: 0.1 },
    { selector: '.exp-bullet-item', stepDelay: 0.06 },
  ]);

  // 6. Technical Skills Sequence
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

  // High-Precision IntersectionObserver supporting dynamic reverse pop-down sequence
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const fwd = el.dataset.fwdDelay || '0s';
        const rev = el.dataset.revDelay || '0s';

        if (entry.isIntersecting) {
          if (scrollDirection === 'up') {
            el.style.transitionDelay = rev;
          } else {
            el.style.transitionDelay = fwd;
          }
          el.classList.add('revealed');
        } else {
          // When scrolled out of viewport, apply delay based on scroll direction for reverse pop-down!
          if (scrollDirection === 'up') {
            el.style.transitionDelay = rev;
          } else {
            el.style.transitionDelay = fwd;
          }
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
}
