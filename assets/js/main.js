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
    
    // Function to unlock hero section
    function unlockHero() {
        heroLocked = false;
        heroSection.classList.add('scroll-out');
        // Keep overflow locked during transition so second section can't scroll-jack
        setTimeout(() => {
            document.body.style.overflow = 'auto';
            bottleCenterSection.classList.add('revealed');
            animateBottleCenter();
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
        if (can3dContainer) {
            can3dContainer.style.opacity = '';
            can3dContainer.style.transform = '';
        }
        if (window.GoldenCan3D) window.GoldenCan3D.reset();
        updateBottles(0);
    }
});