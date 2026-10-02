/* ==========================================================================
   V8 VAULT - ULTIMATE SUPERCAR SHOWROOM JAVASCRIPT
   GSAP & ScrollTrigger 150-Frame Canvas Sequence Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP Plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // DOM Elements
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const loaderOverlay = document.getElementById('loader-overlay');
  const loaderBar = document.querySelector('.loader-bar');
  const loaderText = document.querySelector('.loader-text');
  
  const heroWrapper = document.querySelector('.hero-scroll-wrapper');
  const hudFrameVal = document.getElementById('hud-frame-val');
  const hudRpmVal = document.getElementById('hud-rpm-val');
  const hudSpeedVal = document.getElementById('hud-speed-val');
  const scrollFill = document.querySelector('.scroll-fill');
  const frameScrubRange = document.getElementById('frame-scrub-range');
  const autoSpinBtn = document.getElementById('auto-spin-btn');
  
  const heroCards = [
    document.querySelector('.hero-card-1'),
    document.querySelector('.hero-card-2'),
    document.querySelector('.hero-card-3')
  ];

  // 150 Frames Configuration
  const totalFrames = 150;
  const frames = new Array(totalFrames);
  let loadedCount = 0;
  
  const frameSeq = { frame: 0 };
  let isAutoSpinning = false;
  let autoSpinTween = null;

  // Frame URL Generator with URL encoding
  function getFrameUrl(index) {
    const paddedIndex = String(index).padStart(3, '0');
    return encodeURI(`red dodge frames/ezgif-frame-${paddedIndex}.jpg`);
  }

  // Nearest Loaded Frame Fallback
  function getBestAvailableFrame(index) {
    const targetIdx = Math.max(0, Math.min(totalFrames - 1, index));
    if (frames[targetIdx] && frames[targetIdx].complete && frames[targetIdx].naturalWidth > 0) {
      return frames[targetIdx];
    }
    
    for (let delta = 1; delta < totalFrames; delta++) {
      const prev = targetIdx - delta;
      if (prev >= 0 && frames[prev] && frames[prev].complete && frames[prev].naturalWidth > 0) {
        return frames[prev];
      }
      const next = targetIdx + delta;
      if (next < totalFrames && frames[next] && frames[next].complete && frames[next].naturalWidth > 0) {
        return frames[next];
      }
    }
    return null;
  }

  // Canvas Aspect Fill Render
  function renderCanvasFrame(index) {
    if (!canvas || !ctx) return;
    
    const img = getBestAvailableFrame(index);
    if (!img) return;

    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : (1920 / 1080);

    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgAspect;
      drawHeight = canvas.height;
      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Telemetry HUD Update
  function updateHUD(frameIndex) {
    const progress = frameIndex / (totalFrames - 1);

    if (hudFrameVal) hudFrameVal.textContent = String(frameIndex + 1).padStart(3, '0');
    if (hudSpeedVal) hudSpeedVal.textContent = Math.floor(progress * 203);
    if (hudRpmVal) hudRpmVal.textContent = Math.floor(900 + progress * 5600);
    if (scrollFill) scrollFill.style.width = `${Math.floor(progress * 100)}%`;
    if (frameScrubRange && document.activeElement !== frameScrubRange) {
      frameScrubRange.value = frameIndex + 1;
    }

    // Scrollytelling Card Visibility
    if (progress >= 0 && progress < 0.3) {
      heroCards[0]?.classList.add('active');
      heroCards[1]?.classList.remove('active');
      heroCards[2]?.classList.remove('active');
    } else if (progress >= 0.35 && progress < 0.7) {
      heroCards[0]?.classList.remove('active');
      heroCards[1]?.classList.add('active');
      heroCards[2]?.classList.remove('active');
    } else if (progress >= 0.75) {
      heroCards[0]?.classList.remove('active');
      heroCards[1]?.classList.remove('active');
      heroCards[2]?.classList.add('active');
    } else {
      heroCards.forEach(c => c?.classList.remove('active'));
    }
  }

  // Initialize GSAP ScrollTrigger Sequence for 150 Frames
  function initGSAPScrollTrigger() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.to(frameSeq, {
      frame: totalFrames - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "+=220%", // Smooth 2.2x viewport scroll distance
        pin: true,     // GSAP ScrollTrigger pins hero automatically with zero blank space
        scrub: 0.5,    // Smooth user scroll physics
        onUpdate: () => {
          if (!isAutoSpinning) {
            const currentIdx = Math.round(frameSeq.frame);
            renderCanvasFrame(currentIdx);
            updateHUD(currentIdx);
          }
        }
      }
    });

    ScrollTrigger.refresh();
  }

  // Preload Images
  function preloadFrames() {
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameUrl(i + 1);

      img.onload = () => {
        loadedCount++;
        frames[i] = img;

        if (i === 0) {
          renderCanvasFrame(0);
        }

        const percent = Math.floor((loadedCount / totalFrames) * 100);
        if (loaderBar) loaderBar.style.width = `${percent}%`;
        if (loaderText) loaderText.textContent = `LOADING GSAP DODGE TELEMETRY... ${percent}%`;

        if (loadedCount === totalFrames) {
          setTimeout(() => {
            if (loaderOverlay) loaderOverlay.classList.add('hidden');
            initGSAPScrollTrigger();
          }, 300);
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalFrames && loaderOverlay) {
          loaderOverlay.classList.add('hidden');
          initGSAPScrollTrigger();
        }
      };
    }
  }

  // Range Slider Drag Control
  if (frameScrubRange) {
    frameScrubRange.addEventListener('input', (e) => {
      isAutoSpinning = false;
      if (autoSpinBtn) autoSpinBtn.classList.remove('active');
      const val = parseInt(e.target.value, 10) - 1;
      frameSeq.frame = val;
      renderCanvasFrame(val);
      updateHUD(val);
    });
  }

  // Autoplay Spin Button Toggle
  if (autoSpinBtn) {
    autoSpinBtn.addEventListener('click', () => {
      isAutoSpinning = !isAutoSpinning;
      if (isAutoSpinning) {
        autoSpinBtn.classList.add('active');
        autoSpinBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE SPIN';
        
        autoSpinTween = gsap.to(frameSeq, {
          frame: totalFrames - 1,
          duration: 6,
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            const currentIdx = Math.round(frameSeq.frame);
            renderCanvasFrame(currentIdx);
            updateHUD(currentIdx);
          }
        });
      } else {
        autoSpinBtn.classList.remove('active');
        autoSpinBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> 360° AUTOPLAY';
        if (autoSpinTween) autoSpinTween.kill();
      }
    });
  }

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderCanvasFrame(Math.round(frameSeq.frame));
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  });

  // Launch Engine
  preloadFrames();


  // ==========================================================================
  // NAVBAR SCROLL & AUDIO CONTROLS
  // ==========================================================================
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });


  // ==========================================================================
  // PERFORMANCE SPECS TELEMETRY SWITCHER (Mode Selector & Gauge Rings)
  // ==========================================================================
  const modeBtns = document.querySelectorAll('.mode-btn');
  const specRings = document.querySelectorAll('.spec-ring-val');
  const specNumbers = document.querySelectorAll('.spec-number');

  const modeData = {
    street: [
      { val: '3.8', percent: 65, label: 's' },
      { val: '717', percent: 80, label: 'HP' },
      { val: '656', percent: 75, label: 'LB-FT' },
      { val: '199', percent: 85, label: 'MPH' }
    ],
    track: [
      { val: '3.45', percent: 85, label: 's' },
      { val: '797', percent: 92, label: 'HP' },
      { val: '707', percent: 90, label: 'LB-FT' },
      { val: '203', percent: 96, label: 'MPH' }
    ],
    drag: [
      { val: '3.25', percent: 98, label: 's' },
      { val: '807', percent: 100, label: 'HP' },
      { val: '707', percent: 95, label: 'LB-FT' },
      { val: '168', percent: 80, label: 'MPH' }
    ],
    custom: [
      { val: '3.30', percent: 90, label: 's' },
      { val: '807', percent: 98, label: 'HP' },
      { val: '707', percent: 92, label: 'LB-FT' },
      { val: '203', percent: 98, label: 'MPH' }
    ]
  };

  function updateSpecs(modeKey) {
    const data = modeData[modeKey] || modeData.drag;
    
    specRings.forEach((ring, idx) => {
      if (data[idx]) {
        const strokeDashOffset = 283 - (283 * data[idx].percent) / 100;
        ring.style.strokeDashoffset = strokeDashOffset;
      }
    });

    specNumbers.forEach((numElem, idx) => {
      if (data[idx]) {
        numElem.innerHTML = `${data[idx].val} <span>${data[idx].label}</span>`;
      }
    });
  }

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-mode');
      updateSpecs(mode);
    });
  });

  // Initial trigger
  updateSpecs('drag');


  // ==========================================================================
  // INTERACTIVE CAR BREAKDOWN (Hotspots & Detail Selector)
  // ==========================================================================
  const hotspotPins = document.querySelectorAll('.hotspot-pin');
  const partBadge = document.getElementById('part-badge');
  const partName = document.getElementById('part-name');
  const partDesc = document.getElementById('part-desc');
  const stat1Val = document.getElementById('stat1-val');
  const stat1Lbl = document.getElementById('stat1-lbl');
  const stat2Val = document.getElementById('stat2-val');
  const stat2Lbl = document.getElementById('stat2-lbl');
  const mainBreakdownImg = document.getElementById('breakdown-main-img');

  const partDetails = {
    1: {
      badge: 'PROPULSION HEART',
      name: 'Supercharged 6.2L HEMI V8',
      desc: 'The engineering masterpiece behind the SRT Super Stock. Outfitted with a 2.7L IHI supercharger producing 14.5 psi of boost, high-strength forged pistons, and dual fuel pumps delivering maximum drag-strip acceleration.',
      stat1: { val: '807 HP', lbl: 'Peak Output' },
      stat2: { val: '6,500 RPM', lbl: 'Redline Limit' },
      img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80'
    },
    2: {
      badge: 'AERODYNAMIC DOWNFORCE',
      name: 'SRT Widebody Aero Kit',
      desc: 'Adds 3.5 inches of total width to accommodate massive 315/40R18 Nitto NT05R drag radial tires. Integrated front chin splitter and functional rear spoiler maximize downforce at triple-digit speeds.',
      stat1: { val: '+3.5 IN', lbl: 'Body Stance' },
      stat2: { val: '315 MM', lbl: 'Rear Tire Width' },
      img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80'
    },
    3: {
      badge: 'STOPPING POWER',
      name: 'Brembo 6-Piston Racing Brakes',
      desc: 'Lightweight aluminum Brembo fixed front calipers gripping 14.2-inch vented rotors provide violent decel capability while heat-dissipating ducts keep brake fade non-existent during extreme track cycles.',
      stat1: { val: '14.2 IN', lbl: 'Vented Rotors' },
      stat2: { val: '6-PISTON', lbl: 'Brembo Calipers' },
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
    },
    4: {
      badge: 'COMMAND CENTER',
      name: 'Laguna Leather SRT Cockpit',
      desc: 'Premium Alcantara and Laguna leather performance seats with aggressive lateral bolster support. Features an 8.4-inch Uconnect display with real-time SRT Performance Pages, G-force telemetry, and Launch Control settings.',
      stat1: { val: '8.4 IN', lbl: 'SRT Telemetry Display' },
      stat2: { val: 'ALCANTARA', lbl: 'Race Trim Finish' },
      img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
    },
    5: {
      badge: 'AIR INDUCTION SYSTEM',
      name: 'Dual-Snorkel Cold Air Hood',
      desc: 'Functional dual-snorkel hood scoop combined with the Air-Grabber intake system routes dense external air directly into the supercharger sealed airbox, lowering intake temperatures by up to 25°F.',
      stat1: { val: '-25°F', lbl: 'Intake Temp Delta' },
      stat2: { val: '1,100 CFM', lbl: 'Air Induction Rate' },
      img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
    }
  };

  hotspotPins.forEach(pin => {
    pin.addEventListener('click', () => {
      hotspotPins.forEach(p => p.classList.remove('active'));
      pin.classList.add('active');
      const pinId = pin.getAttribute('data-pin');
      const data = partDetails[pinId];

      if (data) {
        if (partBadge) partBadge.textContent = data.badge;
        if (partName) partName.textContent = data.name;
        if (partDesc) partDesc.textContent = data.desc;
        if (stat1Val) stat1Val.textContent = data.stat1.val;
        if (stat1Lbl) stat1Lbl.textContent = data.stat1.lbl;
        if (stat2Val) stat2Val.textContent = data.stat2.val;
        if (stat2Lbl) stat2Lbl.textContent = data.stat2.lbl;
        if (mainBreakdownImg) {
          mainBreakdownImg.style.opacity = 0.4;
          setTimeout(() => {
            mainBreakdownImg.src = data.img;
            mainBreakdownImg.style.opacity = 0.85;
          }, 200);
        }
      }
    });
  });


  // ==========================================================================
  // V8 ENGINE WEB AUDIO SYNTHESIZER
  // ==========================================================================
  const revBtn = document.getElementById('rev-pedal-btn');
  const tachDisplay = document.getElementById('tachometer-display');
  let audioCtx = null;
  let osc1 = null;
  let osc2 = null;
  let gainNode = null;
  let isRevving = false;
  let revInterval = null;
  let currentRPM = 900;

  function initAudioEngine() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    osc1 = audioCtx.createOscillator();
    osc2 = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.value = 55;
    osc2.frequency.value = 110;

    gainNode.gain.value = 0.15;

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
  }

  function startRevving() {
    initAudioEngine();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    isRevving = true;
    if (revBtn) revBtn.classList.add('holding');

    clearInterval(revInterval);
    revInterval = setInterval(() => {
      if (currentRPM < 6600) {
        currentRPM += 220;
        const freq = 55 + (currentRPM / 6600) * 180;
        if (osc1) osc1.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.05);
        if (osc2) osc2.frequency.setTargetAtTime(freq * 1.5, audioCtx.currentTime, 0.05);
        if (gainNode) gainNode.gain.setTargetAtTime(0.35, audioCtx.currentTime, 0.05);
        if (tachDisplay) tachDisplay.textContent = `${currentRPM} RPM`;
      }
    }, 40);
  }

  function stopRevving() {
    isRevving = false;
    if (revBtn) revBtn.classList.remove('holding');

    clearInterval(revInterval);
    revInterval = setInterval(() => {
      if (currentRPM > 900) {
        currentRPM -= 180;
        const freq = 55 + (currentRPM / 6600) * 180;
        if (osc1) osc1.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.08);
        if (osc2) osc2.frequency.setTargetAtTime(freq * 1.5, audioCtx.currentTime, 0.08);
        if (gainNode) gainNode.gain.setTargetAtTime(0.12, audioCtx.currentTime, 0.08);
        if (tachDisplay) tachDisplay.textContent = `${currentRPM} RPM`;
      } else {
        currentRPM = 900;
        if (tachDisplay) tachDisplay.textContent = '900 RPM';
        clearInterval(revInterval);
      }
    }, 40);
  }

  if (revBtn) {
    revBtn.addEventListener('mousedown', startRevving);
    revBtn.addEventListener('mouseup', stopRevving);
    revBtn.addEventListener('mouseleave', stopRevving);
    revBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startRevving(); });
    revBtn.addEventListener('touchend', stopRevving);
  }


  // ==========================================================================
  // GALLERY FILTER & LIGHTBOX MODAL
  // ==========================================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const modalCloseBtns = document.querySelectorAll('.modal-close-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      galleryCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.gallery-card-img').src;
      const title = card.querySelector('.gallery-car-name').textContent;
      if (lightboxImg) lightboxImg.src = img;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxModal) lightboxModal.classList.add('active');
    });
  });

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });


  // ==========================================================================
  // SCROLL REVEAL INTERSECTION OBSERVER ENGINE
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right, .reveal-scale');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }


  // ==========================================================================
  // VIP TEST DRIVE & CUSTOMIZER MODAL
  // ==========================================================================
  const testDriveBtns = document.querySelectorAll('#book-test-drive-btn, .floating-cta-btn, .trigger-test-drive');
  const testDriveModal = document.getElementById('test-drive-modal');
  const testDriveForm = document.getElementById('test-drive-form');
  const toast = document.getElementById('toast-notification');

  testDriveBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (testDriveModal) testDriveModal.classList.add('active');
    });
  });

  if (testDriveForm) {
    testDriveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (testDriveModal) testDriveModal.classList.remove('active');
      
      if (toast) {
        toast.textContent = '⚡ VIP RIDE RESERVED! SRT Concierge will call you shortly.';
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
        }, 4500);
      }
    });
  }
});
