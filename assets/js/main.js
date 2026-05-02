// Hero Section Background Transition on Scroll
document.addEventListener('DOMContentLoaded', function() {
    // Navbar Toggle
    const navbarToggle = document.getElementById('navbarToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (navbarToggle && mobileMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }
    
    const heroSection = document.querySelector('.hero-section');
    const bgImages = document.querySelectorAll('.hero-bg');
    const rightBottomImages = document.querySelectorAll('.right-bottom-img');
    
    // Bottle elements
    const bottleCanTop = document.querySelector('.bottle-can-top');
    const bottleCanBottom = document.querySelector('.bottle-can-bottom');
    const bottleGoldTop = document.querySelector('.bottle-gold-top');
    const bottleGoldBottom = document.querySelector('.bottle-gold-bottom');
    
    let currentBg = 0;
    let isTransitioning = false;
    let heroLocked = true;
    const totalBgs = bgImages.length;
    let scrollAccumulator = 0;
    const scrollThreshold = 60;
    let scrollCount = 0; // Track number of scrolls
    
    // Initialize first background as active
    bgImages[0].classList.add('active');
    
    // Initialize first right-bottom image as active
    rightBottomImages[0].classList.add('active');
    
    // Initialize bottles
    updateBottles(0);
    
    // Prevent default scroll when hero is locked
    document.body.style.overflow = 'hidden';
    
    // Function to change background
    function changeBackground(index) {
        if (isTransitioning || index === currentBg || index < 0 || index >= totalBgs) return;
        
        isTransitioning = true;
        
        // Remove active class from current background
        bgImages[currentBg].classList.remove('active');
        
        // Update current background index
        currentBg = index;
        
        // Add active class to new background
        bgImages[currentBg].classList.add('active');
        
        // Update right-bottom corner images
        updateRightBottomImages(currentBg);
        
        // Handle bottle animations based on scroll
        updateBottles(currentBg);
        
        // Allow next transition after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }
    
    // Function to update right-bottom corner images
    function updateRightBottomImages(bgIndex) {
        // Reset all right-bottom images
        rightBottomImages.forEach(img => img.classList.remove('active'));
        
        // Show corresponding right-bottom image
        if (bgIndex < rightBottomImages.length) {
            rightBottomImages[bgIndex].classList.add('active');
        }
    }
    
    // 3D Golden Can element
    const can3dContainer = document.getElementById('can-3d-container');
    
    // Bottle center section animation with anime.js
    const bottleCenterSection = document.querySelector('.bottle-center-section');
    let bottleAnimated = false;
    
    function animateBottleCenter() {
        if (bottleAnimated || !can3dContainer) return;
        bottleAnimated = true;
        
        anime({
            targets: can3dContainer,
            translateY: ['120%', '0%'],
            opacity: [0, 1],
            scale: [0.92, 1],
            duration: 1400,
            easing: 'easeOutExpo',
            delay: 200
        });
    }
    
    if (bottleCenterSection && can3dContainer) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !heroLocked) {
                    animateBottleCenter();
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });
        observer.observe(bottleCenterSection);
    }

    // Function to update bottle animations
    function updateBottles(bgIndex) {
        // Reset all bottles
        bottleCanTop.classList.remove('active', 'exit');
        bottleCanBottom.classList.remove('active', 'exit');
        bottleGoldTop.classList.remove('active', 'exit');
        bottleGoldBottom.classList.remove('active', 'exit');

        // Show bottles based on background
        if (bgIndex === 0) {
            // 1st background - Show can bottles
            if (currentBg === 1) {
                // Scrolling back from 2nd to 1st - Gold bottles exit first
                bottleGoldTop.classList.add('exit');
                bottleGoldBottom.classList.add('exit');
                if (window.GoldenCan3D) window.GoldenCan3D.hide();
                setTimeout(() => {
                    bottleCanTop.classList.add('active');
                    bottleCanBottom.classList.add('active');
                    if (window.GoldenCan3D) window.GoldenCan3D.show();
                }, 300);
            } else {
                // Initial load or already on 1st bg
                bottleCanTop.classList.add('active');
                bottleCanBottom.classList.add('active');
                if (window.GoldenCan3D) window.GoldenCan3D.show();
            }
        } else if (bgIndex === 1) {
            // 2nd background - Can bottles exit, Gold-black bottles enter
            bottleCanTop.classList.add('exit');
            bottleCanBottom.classList.add('exit');
            if (window.GoldenCan3D) window.GoldenCan3D.hide();
            setTimeout(() => {
                bottleGoldTop.classList.add('active');
                bottleGoldBottom.classList.add('active');
            }, 300);
        }
    }
    
    // Scroll input handler for scroll-jacking
    let wheelTimeout;
    let scrollCooldown = false;
    function processScrollInput(deltaY) {
        if (!heroLocked) return false;
        if (isTransitioning || scrollCooldown) return true;
        
        scrollAccumulator += deltaY;
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(function() {
            scrollAccumulator = 0;
        }, 150);
        
        if (Math.abs(scrollAccumulator) >= scrollThreshold) {
            const direction = Math.sign(scrollAccumulator);
            scrollAccumulator -= direction * scrollThreshold;
            
            if (direction > 0) {
                // Scrolling down
                scrollCount++;
                
                if (scrollCount === 1) {
                    // 1st scroll - Go to 2nd background
                    if (currentBg < totalBgs - 1) {
                        changeBackground(currentBg + 1);
                    }
                } else if (scrollCount === 2) {
                    // 2nd scroll - Stay on 2nd background (no change)
                    // Just let them view it
                } else if (scrollCount >= 3) {
                    // 3rd scroll - Unlock and go to 2nd section
                    unlockHero();
                }
            } else {
                // Scrolling up - previous background
                if (scrollCount > 0) {
                    scrollCount--;
                }
                
                if (scrollCount === 0 && currentBg > 0) {
                    // Back to 1st background
                    changeBackground(currentBg - 1);
                }
            }
            
            // Brief cooldown to prevent rapid-fire state changes
            scrollCooldown = true;
            setTimeout(() => { scrollCooldown = false; }, 400);
        }
        return true;
    }
    
    // Wheel event handler
    window.addEventListener('wheel', function(e) {
        if (!heroLocked) {
            // Check if user scrolled back to top to re-lock hero
            if (window.scrollY <= 0 && e.deltaY < 0) {
                e.preventDefault();
                lockHero();
            }
            return;
        }
        
        if (processScrollInput(e.deltaY)) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Touch event support for mobile scroll-jacking
    let touchStartY = 0;
    window.addEventListener('touchstart', function(e) {
        if (!heroLocked) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: false });
    
    window.addEventListener('touchmove', function(e) {
        if (!heroLocked) return;
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        touchStartY = touchY;
        
        if (processScrollInput(deltaY)) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Keyboard support
    window.addEventListener('keydown', function(e) {
        if (!heroLocked) return;
        
        let deltaY = 0;
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            deltaY = 120;
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            deltaY = -120;
        }
        
        if (deltaY !== 0) {
            e.preventDefault();
            processScrollInput(deltaY);
        }
    });
    
    // GSAP ScrollTrigger timeline reference
    let ingredientsST = null;
    let labelSwapped = false;
    
    function initIngredientsScroll() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        if (ingredientsST) return;
        
        gsap.registerPlugin(ScrollTrigger);
        
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: bottleCenterSection,
                start: 'top top',
                end: '+=280%',
                pin: true,
                scrub: 0.8,
                anticipatePin: 1,
                onUpdate: function(self) {
                    // Swap label at ~50% progress (transition point between phases)
                    if (self.progress > 0.42 && !labelSwapped) {
                        labelSwapped = true;
                        if (window.GoldenCan3D) {
                            window.GoldenCan3D.swapLabel('assets/images/bottle/green-label.png');
                        }
                    } else if (self.progress <= 0.42 && labelSwapped) {
                        labelSwapped = false;
                        if (window.GoldenCan3D) {
                            window.GoldenCan3D.swapLabel('assets/images/bottle/can-label.png');
                        }
                    }
                }
            }
        });
        
        // ===== PHASE 1: Noble Brew (0 → 0.3) =====
        
        // Fade out background text
        tl.to('.noble-brew-bg', {
            opacity: 0,
            duration: 0.15,
            ease: 'none'
        }, 0);
        
        // Move 3D can wrapper to the left
        tl.to('.bottle-center-3d-wrapper', {
            x: '-28vw',
            duration: 0.25,
            ease: 'none'
        }, 0);
        
        // Background shifts to image
        tl.to(bottleCenterSection, {
            backgroundImage: 'url("assets/images/background/change-bg-2.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'transparent',
            duration: 0.2,
            ease: 'none'
        }, 0.05);
        
        // Product info slides in from left
        tl.fromTo('.product-info-left',
            { opacity: 0, x: -60 },
            { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' },
            0.1
        );

        // Divider line grows from left
        tl.fromTo('.product-divider',
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.15, ease: 'power2.out' },
            0.15
        );

        // Spec card slides in from right
        tl.fromTo('.product-specs-right',
            { opacity: 0, x: 60 },
            { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' },
            0.1
        );

        // Staggered spec rows
        tl.from('.product-specs-right .spec-row', {
            y: 25,
            opacity: 0,
            stagger: 0.03,
            duration: 0.15,
            ease: 'power2.out'
        }, 0.15);
        
        // ===== TRANSITION: Phase 1 → Phase 2 =====
        
        // Fade out Noble Brew content FAST before dark bg
        tl.to('.product-info-left', {
            opacity: 0,
            x: -40,
            duration: 0.06,
            ease: 'power2.in'
        }, 0.36);
        
        tl.to('.product-divider', {
            opacity: 0,
            scaleX: 0,
            duration: 0.06,
            ease: 'power2.in'
        }, 0.36);
        
        tl.to('.product-specs-right', {
            opacity: 0,
            x: 40,
            duration: 0.06,
            ease: 'power2.in'
        }, 0.36);
        
        // Also hide the individual spec rows (they have their own GSAP inline opacity)
        tl.to('.product-specs-right .spec-row', {
            opacity: 0,
            x: 40,
            duration: 0.06,
            ease: 'power2.in'
        }, 0.36);
        
        // Move can from left back to center
        tl.to('.bottle-center-3d-wrapper', {
            x: '0vw',
            y: '0vh',
            duration: 0.12,
            ease: 'power2.inOut'
        }, 0.44);
        
        // Background shifts back to dark (after Noble Brew is fully gone)
        tl.to(bottleCenterSection, {
            backgroundImage: 'none',
            backgroundColor: '#0a0c09',
            duration: 0.1,
            ease: 'none'
        }, 0.48);
        
        // Show GREEN LABEL bg text (dark bg only - can centered, no side content)
        tl.to('.green-brew-bg', {
            opacity: 0.7,
            duration: 0.08,
            ease: 'none'
        }, 0.55);
        
        // ===== PHASE 2: Green Label — can stays centered, content on white bg =====
        
        // Fade out green bg text
        tl.to('.green-brew-bg', {
            opacity: 0,
            duration: 0.1,
            ease: 'none'
        }, 0.65);
        
        // Background shifts to image
        tl.to(bottleCenterSection, {
            backgroundImage: 'url("assets/images/background/chnge-bg.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'transparent',
            duration: 0.1,
            ease: 'ease'
        }, 0.68);
        
        // Green info slides in from the LEFT side (only on white bg)
        tl.fromTo('.green-info-left',
            { opacity: 0, x: 60 },
            { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' },
            0.76
        );

        // Buy button slides up
        tl.fromTo('.buy-btn',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' },
            0.82
        );

        // Green specs slide in from the RIGHT side (only on white bg)
        tl.fromTo('.green-specs-right',
            { opacity: 0, x: -60 },
            { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' },
            0.76
        );

        // Staggered green spec rows
        tl.from('.green-spec-row', {
            y: 25,
            opacity: 0,
            stagger: 0.04,
            duration: 0.2,
            ease: 'power2.out'
        }, 0.82);
        
        ingredientsST = tl.scrollTrigger;
    }
    
    // Function to unlock hero section
    function unlockHero() {
        heroLocked = false;
        heroSection.classList.add('scroll-out');
        // Keep overflow locked during transition so second section can't scroll-jack
        setTimeout(() => {
            document.body.style.overflow = 'auto';
            bottleCenterSection.classList.add('revealed');
            animateBottleCenter();
            initIngredientsScroll();
        }, 800);
    }
    
    // Function to lock hero section
    function lockHero() {
        heroLocked = true;
        document.body.style.overflow = 'hidden';
        heroSection.classList.remove('scroll-out');
        window.scrollTo(0, 0);
        scrollCount = 0; // Reset scroll count
        currentBg = 0; // Reset to first background
        bgImages.forEach((bg, index) => {
            bg.classList.remove('active');
            if (index === 0) bg.classList.add('active');
        });
        // Reset right-bottom images
        rightBottomImages.forEach((img, index) => {
            img.classList.remove('active');
            if (index === 0) img.classList.add('active');
        });
        // Reset bottle from scroll-to-section state
        bottleGoldBottom.classList.remove('scroll-to-section');
        // Reset 3D can animation state for re-entry
        bottleAnimated = false;
        labelSwapped = false;
        if (can3dContainer) {
            can3dContainer.style.opacity = '';
            can3dContainer.style.transform = '';
        }
        // Kill GSAP ScrollTrigger and reset section styles
        if (ingredientsST) {
            ingredientsST.kill();
            ingredientsST = null;
        }
        if (bottleCenterSection) {
            bottleCenterSection.style.backgroundColor = '';
            if (typeof gsap !== 'undefined') {
                gsap.set('.bottle-center-3d-wrapper', { x: 0, y: 0, clearProps: 'transform' });
                gsap.set('.product-info-left', { opacity: 0, x: -40, clearProps: 'all' });
                gsap.set('.product-divider', { clearProps: 'all' });
                gsap.set('.product-specs-right', { opacity: 0, x: 40, clearProps: 'all' });
                gsap.set('.product-specs-right .spec-row', { clearProps: 'all' });
                gsap.set('.noble-brew-bg', { opacity: 0.7, clearProps: 'opacity' });
                // Reset green content
                gsap.set('.green-brew-bg', { opacity: 0, clearProps: 'all' });
                gsap.set('.green-info-left', { opacity: 0, x: -40, clearProps: 'all' });
                gsap.set('.green-divider', { clearProps: 'all' });
                gsap.set('.green-specs-right', { opacity: 0, x: 40, clearProps: 'all' });
                gsap.set('.green-spec-row', { clearProps: 'all' });
            }
        }
        if (window.GoldenCan3D) window.GoldenCan3D.reset();
        updateBottles(0);
    }
    
    // Owl Carousel init
    const owlEl = document.getElementById('owlCarousel');
    const owlNextBtn = document.getElementById('owlNextBtn');

    function initOwlCarousel() {
        if (typeof $.fn.owlCarousel === 'undefined' || !owlEl) return;
        $(owlEl).owlCarousel({
            loop: true,
            margin: 40,
            nav: false,
            dots: false,
            autoplay: true,
            autoplayTimeout: 2500,
            autoplayHoverPause: true,
            autoplaySpeed: 900,
            smartSpeed: 900,
            dragEndSpeed: 700,
            center: true,
            responsive: {
                0: { items: 1, stagePadding: 60, margin: 20 },
                768: { items: 3, stagePadding: 0, margin: 30 }
            }
        });
    }
    
    if (owlEl) {
        initOwlCarousel();
    }
    
    if (owlNextBtn) {
        owlNextBtn.addEventListener('click', () => {
            if (owlEl && typeof $.fn.owlCarousel !== 'undefined') {
                $(owlEl).trigger('next.owl.carousel');
            }
        });
    }

    // GSAP ScrollTrigger animation for carousel section items
    function initCarouselScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        const carouselSection = document.querySelector('.carousel-section');
        if (!carouselSection) return;

        // Animate carousel watermark first
        gsap.from('.carousel-watermark', {
            scrollTrigger: {
                trigger: carouselSection,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power2.out'
        });

        // Animate carousel nav tabs
        gsap.from('.carousel-nav .nav-tab', {
            scrollTrigger: {
                trigger: carouselSection,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: -20,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power2.out'
        });

        // Animate each carousel item's bottle image
        gsap.from('.owl-item-card .owl-item-img img', {
            scrollTrigger: {
                trigger: carouselSection,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 80,
            scale: 0.85,
            stagger: 0.15,
            duration: 1.2,
            ease: 'power3.out'
        });

        // Animate each carousel item's content (title, subtitle, button)
        gsap.from('.owl-item-card .owl-item-content', {
            scrollTrigger: {
                trigger: carouselSection,
                start: 'top 70%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            stagger: 0.15,
            duration: 1,
            ease: 'power2.out',
            delay: 0.2
        });

        // Animate badges with a pop effect
        gsap.from('.owl-item-card .owl-badge', {
            scrollTrigger: {
                trigger: carouselSection,
                start: 'top 75%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'back.out(1.7)',
            delay: 0.4
        });

        // Animate the nav button
        gsap.from('.owl-nav-btn', {
            scrollTrigger: {
                trigger: carouselSection,
                start: 'top 60%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            scale: 0.8,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    }

    initCarouselScrollAnimations();
});

