document.addEventListener('DOMContentLoaded', function() {
    // --- 1. SET CURRENT YEAR IN FOOTER ---
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 2. BOOTSTRAP THEME TOGGLE FUNCTIONALITY ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    let sunIcon = null;
    let moonIcon = null;

    if (themeToggleButton) {
        sunIcon = themeToggleButton.querySelector('.theme-icon.light');
        moonIcon = themeToggleButton.querySelector('.theme-icon.dark');
    }

    const applyBsTheme = (theme) => {
        htmlElement.setAttribute('data-bs-theme', theme);
        if (theme === 'light') {
            if (sunIcon) sunIcon.style.display = 'inline-block';
            if (moonIcon) moonIcon.style.display = 'none';
            if (themeToggleButton) themeToggleButton.setAttribute('aria-label', 'Switch to dark theme');
        } else {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'inline-block';
            if (themeToggleButton) themeToggleButton.setAttribute('aria-label', 'Switch to light theme');
        }
    };

    let currentBsTheme = localStorage.getItem('bsTheme') || 
                         (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    if (currentBsTheme !== 'light' && currentBsTheme !== 'dark') {
        currentBsTheme = 'dark'; // Default from HTML
    }
    applyBsTheme(currentBsTheme);

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            currentBsTheme = htmlElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem('bsTheme', currentBsTheme);
            applyBsTheme(currentBsTheme);
        });
    }

    // --- 3. PACKAGE FEATURES TOGGLE FUNCTIONALITY ---
    const allPackageCards = document.querySelectorAll('.package-card.hostinger-style-card'); // More specific selector

    allPackageCards.forEach(card => {
        const toggleBtn = card.querySelector('.toggle-features-btn');
        const featuresContainerId = toggleBtn ? toggleBtn.getAttribute('aria-controls') : null;
        const allFeaturesContainer = featuresContainerId ? document.getElementById(featuresContainerId) : null;
        const arrowSpan = toggleBtn ? toggleBtn.querySelector('.arrow') : null;

        if (toggleBtn && allFeaturesContainer) {
            toggleBtn.setAttribute('aria-expanded', 'false');
            if (toggleBtn.childNodes.length > 0 && toggleBtn.childNodes[0].nodeType === Node.TEXT_NODE) {
                 toggleBtn.childNodes[0].nodeValue = 'Show All Features ';
            }
            if (arrowSpan) arrowSpan.textContent = '▼';

            toggleBtn.addEventListener('click', () => {
                const isExpanded = allFeaturesContainer.style.display === 'block';
                if (isExpanded) {
                    allFeaturesContainer.style.display = 'none';
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    if (toggleBtn.childNodes[0].nodeType === Node.TEXT_NODE) {
                        toggleBtn.childNodes[0].nodeValue = 'Show All Features ';
                    }
                    if (arrowSpan) arrowSpan.textContent = '▼';
                } else {
                    allFeaturesContainer.style.display = 'block';
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    if (toggleBtn.childNodes.length > 0 && toggleBtn.childNodes[0].nodeType === Node.TEXT_NODE) {
                        toggleBtn.childNodes[0].nodeValue = 'Show Less Features ';
                    }
                    if (arrowSpan) arrowSpan.textContent = '▲';
                }
            });
        }
    });

    // --- 4. PACKAGE SLIDER (HORIZONTAL SCROLL) WITH INDICATORS AND ARROWS ---
    const packagesGrid = document.querySelector('.packages-grid');
    const indicatorsContainer = document.getElementById('package-indicators');
    const packageCardWrappers = document.querySelectorAll('.package-card-wrapper');
    const prevButton = document.getElementById('prevPackage');
    const nextButton = document.getElementById('nextPackage');

    let cardWrapperWidthPlusMargin = 0;
    let isMobileViewForSlider = false;
    let currentCardIndex = 0;

    function calculateCardWrapperWidth() {
        if (packageCardWrappers.length > 0 && isMobileViewForSlider) {
            const wrapperElement = packageCardWrappers[0];
            const wrapperStyle = window.getComputedStyle(wrapperElement);
            const wrapperWidth = wrapperElement.offsetWidth;
            const marginRight = parseFloat(wrapperStyle.marginRight);
            cardWrapperWidthPlusMargin = wrapperWidth + marginRight;
        } else {
            cardWrapperWidthPlusMargin = 0;
        }
    }

    function updateSliderUI() {
        if (!isMobileViewForSlider || packageCardWrappers.length === 0) return;

        // Update Dots
        const dots = indicatorsContainer.querySelectorAll('.indicator-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentCardIndex);
        });

        // Update Arrow States
        if (prevButton) prevButton.disabled = currentCardIndex === 0;
        if (nextButton) nextButton.disabled = currentCardIndex === packageCardWrappers.length - 1;
    }
    
    function determineCurrentCardFromScroll() {
        if (!packagesGrid || !isMobileViewForSlider || cardWrapperWidthPlusMargin === 0 || packageCardWrappers.length === 0) return 0;
        const scrollLeft = packagesGrid.scrollLeft;
        let newIndex = Math.round((scrollLeft + (cardWrapperWidthPlusMargin / 2) -1 ) / cardWrapperWidthPlusMargin);
        return Math.max(0, Math.min(newIndex, packageCardWrappers.length - 1));
    }


    function setupPackageSlider() {
        // Check if we are in a view where the slider should be active
        // (based on visibility of indicators or arrows, controlled by CSS media queries)
        const indicatorsOuterContainer = document.querySelector('.carousel-indicators-container');
        isMobileViewForSlider = indicatorsOuterContainer && window.getComputedStyle(indicatorsOuterContainer).display === 'block';

        if (!packagesGrid || packageCardWrappers.length === 0) {
            if(indicatorsContainer) indicatorsContainer.innerHTML = '';
            if(prevButton) prevButton.style.display = 'none';
            if(nextButton) nextButton.style.display = 'none';
            return;
        }

        if (isMobileViewForSlider) {
            if(prevButton) prevButton.style.display = 'flex'; // 'flex' because arrows are styled with display:flex
            if(nextButton) nextButton.style.display = 'flex';
            if(indicatorsContainer) indicatorsContainer.innerHTML = ''; // Clear for fresh dots

            calculateCardWrapperWidth();
            if (cardWrapperWidthPlusMargin === 0) {
                console.warn("Card width for package slider could not be calculated accurately.");
                // Try a delayed calculation if elements weren't ready
                setTimeout(() => {
                    calculateCardWrapperWidth();
                    if (cardWrapperWidthPlusMargin > 0) {
                        currentCardIndex = determineCurrentCardFromScroll(); // Update based on initial scroll
                        updateSliderUI(); // Update UI after delay
                    }
                }, 100);
            }


            packageCardWrappers.forEach((_, index) => {
                if (indicatorsContainer) {
                    const dot = document.createElement('span');
                    dot.classList.add('indicator-dot');
                    dot.setAttribute('data-index', index);
                    dot.addEventListener('click', () => {
                        currentCardIndex = index;
                        scrollToCard(currentCardIndex);
                        updateSliderUI();
                    });
                    indicatorsContainer.appendChild(dot);
                }
            });
            
            // Set initial state
            currentCardIndex = determineCurrentCardFromScroll();
            updateSliderUI();

        } else { // Not mobile view / slider not active
            if(indicatorsContainer) indicatorsContainer.innerHTML = '';
            if(prevButton) prevButton.style.display = 'none';
            if(nextButton) nextButton.style.display = 'none';
        }
    }


    function scrollToCard(index) {
        if (!packagesGrid || !isMobileViewForSlider || cardWrapperWidthPlusMargin === 0) return;
        packagesGrid.scrollTo({
            left: index * cardWrapperWidthPlusMargin,
            behavior: 'smooth'
        });
        // Note: The 'scroll' event will handle updating currentCardIndex and UI after smooth scroll.
        // For immediate UI update after arrow click, you could call updateSliderUI here too,
        // but it might feel slightly jumpy if the scroll event also fires.
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            const later = () => { timeout = null; func.apply(context, args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Event Listeners for Slider
    if (packagesGrid) {
        setupPackageSlider(); // Initial setup

        packagesGrid.addEventListener('scroll', debounce(() => {
            if (isMobileViewForSlider) {
                currentCardIndex = determineCurrentCardFromScroll();
                updateSliderUI();
            }
        }, 50)); // Update UI based on scroll position

        window.addEventListener('resize', debounce(() => {
            // Re-evaluate if slider should be active and recalculate dimensions
            setupPackageSlider();
        }, 250));

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentCardIndex > 0) {
                    currentCardIndex--;
                    scrollToCard(currentCardIndex);
                    // updateSliderUI(); // Optional: immediate update, scroll event will also update
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentCardIndex < packageCardWrappers.length - 1) {
                    currentCardIndex++;
                    scrollToCard(currentCardIndex);
                    // updateSliderUI(); // Optional: immediate update
                }
            });
        }
    }

    console.log("Full Landing page script loaded. Current theme:", currentBsTheme);
});