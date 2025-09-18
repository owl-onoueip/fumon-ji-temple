// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

// Online Toba application form handler
(function initEmailJS() {
    const form = document.getElementById('tobaForm');
    if (!form) return;
    form.addEventListener('submit', async function(e){
        e.preventDefault();

        // Honeypot
        const hp = form.querySelector('#toba_website');
        if (hp && hp.value.trim()) {
            console.warn('Toba honeypot triggered. Submission ignored.');
            return;
        }

        // Rate limit per browser key
        try {
            const KEY = 'toba_last_submit_ts';
            const WINDOW_SEC = 60;
            const now = Date.now();
            const last = parseInt(localStorage.getItem(KEY) || '0', 10);
            if (!isNaN(last) && now - last < WINDOW_SEC * 1000) {
                const remain = Math.ceil((WINDOW_SEC * 1000 - (now - last)) / 1000);
                alert(`短時間での連続送信はできません。${remain}秒後にお試しください。`);
                return;
            }
            localStorage.setItem(KEY, String(now));
        } catch (err) {
            console.warn('Toba ratelimit storage unavailable:', err);
        }

        // Basic validation
        const name = form.toba_name?.value.trim();
        const email = form.toba_email?.value.trim();
        const phone = form.toba_phone?.value.trim();
        const address = form.toba_address?.value.trim();
        const quantity = parseInt(form.toba_quantity?.value || '0', 10);
        const preferred_date = form.toba_date?.value.trim();
        const dedication = form.toba_for?.value.trim();
        const message = form.toba_message?.value.trim();
        const privacy = form.toba_privacy?.checked;

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!name) return alert('申込者名をご入力ください。');
        if (!emailRe.test(email || '')) return alert('メールアドレスの形式が正しくありません。');
        if (!quantity || quantity < 1 || quantity > 50) return alert('枚数は1〜50の範囲で入力してください。');
        if (!privacy) return alert('プライバシーポリシーに同意してください。');
        if (phone && !/^[0-9+\-()\s]{6,20}$/.test(phone)) return alert('電話番号の形式が正しくありません。');

        // EmailJS availability
        if (typeof emailjs === 'undefined') {
            alert('送信機能の読み込みに失敗しました。時間をおいて再度お試しください。');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const old = btn.textContent;
        btn.disabled = true;
        btn.textContent = '送信中...';

        const templateParams = {
            form_type: 'toba',
            subject: 'オンライン塔婆申込',
            name,
            email,
            phone,
            address,
            quantity,
            preferred_date,
            dedication,
            message,
            reply_to: email
        };

        try {
            await emailjs.send('service_hug4h5d', 'template_pygnzri', templateParams);
            document.getElementById('toba-success').style.display = 'block';
            document.getElementById('toba-error').style.display = 'none';
            form.reset();
        } catch (err) {
            console.error('Toba send failed', err);
            document.getElementById('toba-success').style.display = 'none';
            document.getElementById('toba-error').style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = old;
        }
    });
})();
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
                
                // Update active nav link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .heritage-item, .notice-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Cache-busting for local images: append same ?v= from script tag if present
    try {
        const currentScripts = Array.from(document.querySelectorAll('script[src]'));
        // Prefer the script tag that loaded this file
        const selfScript = currentScripts.reverse().find(s => /script\.js(\?|$)/.test(s.getAttribute('src')));
        let ver = '';
        if (selfScript) {
            const url = new URL(selfScript.src, window.location.origin);
            ver = url.searchParams.get('v') || '';
        }
        if (ver) {
            const imgs = Array.from(document.images);
            imgs.forEach(img => {
                // Only process local images (relative or same-origin) under images/
                const srcAttr = img.getAttribute('src') || '';
                if (!srcAttr) return;
                // Skip external URLs
                if (/^https?:\/\//i.test(srcAttr)) {
                    const u = new URL(srcAttr);
                    if (u.origin !== window.location.origin) return;
                }
                // Must target images folder
                if (!srcAttr.includes('images/')) return;
                // Avoid double-appending
                if (srcAttr.includes('v=')) return;
                const sep = srcAttr.includes('?') ? '&' : '?';
                const newSrc = `${srcAttr}${sep}v=${ver}`;
                img.setAttribute('src', newSrc);
            });
        }
    } catch (e) {
        console.warn('Image cache-busting skipped:', e);
    }

    // Museum page: auto-attach NEW badge to the current year's record header
    try {
        if (document.body.classList.contains('museum-page-body')) {
            const currentYear = new Date().getFullYear();
            const yearHeaders = document.querySelectorAll('.segaki-records-section .year-header h3');
            yearHeaders.forEach(h3 => {
                const text = h3.textContent || '';
                // Extract western year like 2025 from "令和7年（2025年）8月16日"
                const match = text.match(/(20\d{2})年/);
                if (match && parseInt(match[1], 10) === currentYear) {
                    if (!h3.querySelector('.year-badge-new')) {
                        const badge = document.createElement('span');
                        badge.className = 'year-badge-new';
                        badge.textContent = 'NEW';
                        h3.appendChild(badge);
                    }
                }
            });
        }
    } catch (e) {
        console.warn('NEW badge setup skipped:', e);
    }

    // Function to set the active navigation link based on the current page URL
    function setActiveNavLink() {
        const allNavLinks = document.querySelectorAll('.main-nav .nav-link');
        const currentPage = window.location.pathname.split('/').pop();

        allNavLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop().split('#')[0];
            link.classList.remove('active');

            // Handle index.html as the root page
            if ((currentPage === '' || currentPage === 'index.html') && (linkPage === '' || linkPage === 'index.html')) {
                 // Don't set HOME active here, let scrollspy handle it
            } else if (currentPage !== '' && currentPage !== 'index.html' && linkPage === currentPage) {
                link.classList.add('active');
            }
        });

        // If no link is active on index.html, set HOME to active by default
        if (currentPage === '' || currentPage === 'index.html') {
            const homeLink = document.querySelector('.main-nav a[href="index.html"]');
            const activeScrollLink = document.querySelector('.main-nav a[href^="#"].active');
            if (homeLink && !activeScrollLink) {
                // Temporarily add active, scrollspy will take over
                // homeLink.classList.add('active');
            }
        }
    }

    // Active navigation highlighting based on scroll position (Scrollspy)
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;
        const pageNavLinks = document.querySelectorAll('.main-nav a[href*="#"]'); // Links for current page sections

        let activeSectionFound = false;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                pageNavLinks.forEach(link => {
                    // Check if the link's href matches the sectionId
                    if (link.getAttribute('href').endsWith(`#${sectionId}`)) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
                activeSectionFound = true;
            }
        });

        // If no section is active (e.g., at the top or bottom of the page), remove active class from scroll links
        if (!activeSectionFound) {
            pageNavLinks.forEach(link => link.classList.remove('active'));
        }
    });

    // Set active link on page load
    setActiveNavLink();

    // Add loading animation for images when they would be added
    const imagePlaceholders = document.querySelectorAll('.image-placeholder');
    imagePlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            this.style.background = 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)';
            this.style.backgroundSize = '20px 20px';
            this.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
            this.innerHTML = '<span style="color: #8B4513;">画像を読み込み中...</span>';
        });
    });

    // Initialize slideshows
    const containers = document.querySelectorAll('.slideshow-container');
    containers.forEach(container => {
        const eventName = container.getAttribute('data-event');
        if (eventName) {
            slideIndex[eventName] = 1;
        }
    });
});

// Slideshow functionality
let slideIndex = {};

function changeSlide(eventName, direction) {
    const container = document.querySelector(`[data-event="${eventName}"]`);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    const dots = container.querySelectorAll('.dot');
    
    if (!slideIndex[eventName]) {
        slideIndex[eventName] = 1;
    }
    
    slideIndex[eventName] += direction;
    
    if (slideIndex[eventName] > slides.length) {
        slideIndex[eventName] = 1;
    }
    if (slideIndex[eventName] < 1) {
        slideIndex[eventName] = slides.length;
    }
    
    showSlide(eventName, slideIndex[eventName]);
}

function currentSlide(eventName, slideNumber) {
    slideIndex[eventName] = slideNumber;
    showSlide(eventName, slideNumber);
}

function showSlide(eventName, slideNumber) {
    const container = document.querySelector(`[data-event="${eventName}"]`);
    if (!container) return;
    
    const slides = container.querySelectorAll('.slide');
    const dots = container.querySelectorAll('.dot');
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[slideNumber - 1]) {
        slides[slideNumber - 1].classList.add('active');
    }
    if (dots[slideNumber - 1]) {
        dots[slideNumber - 1].classList.add('active');
    }
}

// Toggle details functionality
function toggleDetails(detailsId) {
    const details = document.getElementById(detailsId);
    const button = document.querySelector(`[onclick="toggleDetails('${detailsId}')"]`);
    
    if (!details || !button) return;
    
    // Capture the button's preferred viewport anchor before layout change
    const desiredTop = window.scrollY + button.getBoundingClientRect().top - 120; // 120px margin from top

    // Close any other opened details in the same events grid to avoid large layout jumps
    const allDetails = document.querySelectorAll('.event-details-expanded.show');
    allDetails.forEach(el => {
        if (el !== details) {
            const btn = document.querySelector(`[onclick="toggleDetails('${el.id}')"]`);
            el.classList.remove('show');
            if (btn) btn.textContent = '詳細を見る';
        }
    });

    if (details.classList.contains('show')) {
        // Closing
        button.textContent = '詳細を見る';
        // Ensure overflow is hidden during transition
        details.style.overflow = 'hidden';
        // Animate height to 0
        details.style.maxHeight = '0px';
        // After transition ends, remove class and restore scroll position
        // After transition ends, keep the button near viewport to avoid feeling of "not returning"
        const onTransitionEnd = () => {
            details.removeEventListener('transitionend', onTransitionEnd);
            details.classList.remove('show');
            window.scrollTo({ top: desiredTop, behavior: 'smooth' });
        };
        details.addEventListener('transitionend', onTransitionEnd);
    } else {
        // Opening
        button.textContent = '詳細を閉じる';
        details.classList.add('show');
        // Ensure overflow is hidden and set maxHeight to content height for smooth expansion
        details.style.overflow = 'hidden';
        details.style.maxHeight = details.scrollHeight + 'px';
        // Keep context by ensuring the button remains in view (after expansion completes)
        const onTransitionEndOpen = () => {
            details.removeEventListener('transitionend', onTransitionEndOpen);
            window.scrollTo({ top: desiredTop, behavior: 'smooth' });
        };
        details.addEventListener('transitionend', onTransitionEndOpen);
    }
}

// Video placeholder functionality for museum page
function playVideo(videoId) {
    const videoPlaceholder = document.querySelector(`[data-video="${videoId}"]`);
    if (!videoPlaceholder) return;
    
    // This will be replaced with actual Vimeo embed when video URLs are provided
    const vimeoEmbed = `
        <iframe src="https://player.vimeo.com/video/VIMEO_ID_HERE?autoplay=1" 
                width="100%" height="100%" frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" allowfullscreen>
        </iframe>
    `;
    
    // For now, show a message that video will be loaded
    videoPlaceholder.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #8B4513;">
            <div style="text-align: center;">
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">動画を準備中です</p>
                <p style="font-size: 0.9rem; opacity: 0.8;">VimeoのURLが設定されると自動的に表示されます</p>
            </div>
        </div>
    `;
}

// Add click handlers for video placeholders
document.addEventListener('DOMContentLoaded', function() {
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    videoPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video');
            if (videoId) {
                playVideo(videoId);
            }
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
});

// EmailJS initialization
(function() {
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init('ihjRUl-y6KLX5NFCf'); // Your actual Public Key
            console.log('EmailJS initialized successfully.');
        } catch (e) {
            console.error('Failed to initialize EmailJS:', e);
        }
    } else {
        console.warn('EmailJS script not loaded. Contact form will not function.');
    }
})();

// Contact form handler with EmailJS
function handleContactForm(e) {
    e.preventDefault();
    console.log('Form submission initiated.');

    // Honeypot check: if hidden field has any value, silently drop
    const hpValue = e.target.website ? (e.target.website.value || '').trim() : '';
    if (hpValue) {
        console.warn('Honeypot triggered. Submission ignored.');
        return; // Do not proceed
    }

    // Simple client-side rate limiting (per browser)
    try {
        const RATE_LIMIT_SECONDS = 60; // allow one submission per minute
        const nowTs = Date.now();
        const lastTs = parseInt(localStorage.getItem('contact_last_submit_ts') || '0', 10);
        if (!isNaN(lastTs) && nowTs - lastTs < RATE_LIMIT_SECONDS * 1000) {
            const remain = Math.ceil((RATE_LIMIT_SECONDS * 1000 - (nowTs - lastTs)) / 1000);
            alert(`短時間での連続送信はできません。${remain}秒後にお試しください。`);
            return;
        }
        // Store timestamp early to guard against rapid retries
        localStorage.setItem('contact_last_submit_ts', String(nowTs));
    } catch (err) {
        console.warn('Rate limit storage not available:', err);
    }

    // Basic validation (defensive)
    const name = (e.target.name?.value || '').trim();
    const email = (e.target.email?.value || '').trim();
    const phone = (e.target.phone?.value || '').trim();
    const subject = (e.target.subject?.value || '').trim();
    const message = (e.target.message?.value || '').trim();

    // Name
    if (!name || name.length > 100) {
        alert('お名前を正しく入力してください（100文字以内）。');
        return;
    }
    // Email
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRe.test(email)) {
        alert('メールアドレスの形式が正しくありません。');
        return;
    }
    // Subject
    if (!subject) {
        alert('件名を選択してください。');
        return;
    }
    // Message length
    if (message.length < 10) {
        alert('お問い合わせ内容は10文字以上でご記入ください。');
        return;
    }
    if (message.length > 5000) {
        alert('お問い合わせ内容が長すぎます。5000文字以内にしてください。');
        return;
    }
    // Optional phone: basic check if provided
    if (phone && !/^[0-9+\-()\s]{6,20}$/.test(phone)) {
        alert('電話番号の形式が正しくありません。数字と記号（+-()）のみを使用してください。');
        return;
    }

    // Check if EmailJS is available
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS is not defined. Cannot send email.');
        alert('メール送信機能の読み込みに失敗しました。お手数ですが、時間をおいて再度お試しいただくか、お電話でお問い合わせください。');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '送信中...';
    submitBtn.disabled = true;

    // Format submission date
    const now = new Date();
    const submissionDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const templateParams = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        inquiry_type: e.target.subject.value, // 'subject' from form is 'inquiry_type' in template
        message: e.target.message.value,
        submission_date: submissionDate, // Add formatted date
        reply_to: e.target.email.value
    };

    console.log('Sending email with params:', templateParams);

    emailjs.send('service_hug4h5d', 'template_pygnzri', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            document.getElementById('form-success').style.display = 'block';
            document.getElementById('form-error').style.display = 'none';
            e.target.reset();
            document.getElementById('form-success').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, function(error) {
            console.error('FAILED...', error);
            document.getElementById('form-error').style.display = 'block';
            document.getElementById('form-success').style.display = 'none';
            document.getElementById('form-error').scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .finally(function() {
            // Reset button state regardless of success or failure
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Simple test to verify script is loading
console.log('Script.js loaded successfully');

// Event announcement system based on dates
function initEventAnnouncements() {
    const eventContainer = document.getElementById('event-announcements');
    if (!eventContainer) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentDay = currentDate.getDate();
    
    // Temple event schedule - only events mentioned on the website
    const templeEvents = [
        {
            name: '春彼岸法要',
            startMonth: 3,
            startDay: 18,
            endMonth: 3,
            endDay: 24,
            description: '春のお彼岸法要のご案内',
            type: 'upcoming'
        },
        {
            name: '大施餓鬼会法要',
            startMonth: 8,
            startDay: 16,
            endMonth: 8,
            endDay: 16,
            description: '餓鬼道に堕ちた霊とご先祖様を供養いたします',
            type: 'upcoming'
        },
        {
            name: '秋彼岸法要',
            startMonth: 9,
            startDay: 20,
            endMonth: 9,
            endDay: 26,
            description: '秋のお彼岸法要のご案内',
            type: 'current'
        },
        {
            name: '十夜護摩祈祷',
            startMonth: 11,
            startDay: 23,
            endMonth: 11,
            endDay: 23,
            description: '観音堂において護摩供修行を勤修。五穀豊穣や家運隆昌を祈念',
            type: 'upcoming'
        }
    ];

    // Filter and sort events based on current date
    const relevantEvents = templeEvents.filter(event => {
        const eventStart = new Date(currentDate.getFullYear(), event.startMonth - 1, event.startDay);
        const eventEnd = new Date(currentDate.getFullYear(), event.endMonth - 1, event.endDay);
        const today = new Date(currentDate.getFullYear(), currentMonth - 1, currentDay);
        
        // Show events that are happening now or within next 60 days
        const daysDiff = Math.ceil((eventStart - today) / (1000 * 60 * 60 * 24));
        const isCurrentEvent = today >= eventStart && today <= eventEnd;
        const isUpcoming = daysDiff >= 0 && daysDiff <= 60;
        
        return isCurrentEvent || isUpcoming;
    }).sort((a, b) => {
        const aStart = new Date(currentDate.getFullYear(), a.startMonth - 1, a.startDay);
        const bStart = new Date(currentDate.getFullYear(), b.startMonth - 1, b.startDay);
        return aStart - bStart;
    });

    // Add general announcements if no specific events
    if (relevantEvents.length === 0) {
        relevantEvents.push(
            {
                name: '護摩祈祷',
                description: '毎月第1・第3日曜日に護摩祈祷を行っています',
                type: 'general',
                date: '毎月'
            },
            {
                name: '永代供養相談',
                description: '永代供養・墓地のご相談を随時承っております',
                type: 'general',
                date: '随時'
            },
            {
                name: '境内参拝',
                description: '境内見学・参拝は自由にお越しください',
                type: 'general',
                date: '随時'
            }
        );
    }

    // Generate HTML for events
    eventContainer.innerHTML = '';
    relevantEvents.slice(0, 4).forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'update-item';
        
        let dateText = '';
        if (event.type === 'general') {
            dateText = event.date;
        } else {
            const eventStart = new Date(currentDate.getFullYear(), event.startMonth - 1, event.startDay);
            const eventEnd = new Date(currentDate.getFullYear(), event.endMonth - 1, event.endDay);
            const today = new Date(currentDate.getFullYear(), currentMonth - 1, currentDay);
            
            // Check if event is currently happening
            if (today >= eventStart && today <= eventEnd) {
                if (eventStart.getTime() === eventEnd.getTime()) {
                    dateText = '本日開催';
                } else {
                    dateText = '開催中';
                }
            } else {
                // Format the date as MM/DD
                const month = event.startMonth;
                const day = event.startDay;
                
                if (event.startMonth === event.endMonth && event.startDay === event.endDay) {
                    // Single day event
                    dateText = `${month}月${day}日`;
                } else {
                    // Multi-day event
                    dateText = `${event.startMonth}月${event.startDay}日〜${event.endMonth}月${event.endDay}日`;
                }
            }
        }
        
        eventElement.innerHTML = `
            <span class="update-date">${dateText}</span>
            <span class="update-title">${event.name}${event.description ? ' - ' + event.description : ''}</span>
        `;
        
        eventContainer.appendChild(eventElement);
    });
}

// Initialize event announcements when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initEventAnnouncements();
    
    // Update announcements daily
    setInterval(initEventAnnouncements, 24 * 60 * 60 * 1000);
});

// Image slideshow functionality
function initSlideshow() {
    console.log('initSlideshow called');
    
    // Initialize Kannon Hall slideshow
    const kannonSlideshow = document.querySelector('.image-slideshow');
    console.log('Kannon slideshow container found:', kannonSlideshow);
    
    if (kannonSlideshow) {
        initSlideshowContainer(kannonSlideshow, 'Kannon Hall');
    }
    
    // Initialize Memorial Tower slideshow
    const memorialSlideshow = document.querySelector('.memorial-tower-slideshow');
    console.log('Memorial tower slideshow container found:', memorialSlideshow);
    
    if (memorialSlideshow) {
        initSlideshowContainer(memorialSlideshow, 'Memorial Tower');
    }
    
    // Initialize Shakyo slideshow
    const shakyoSlideshow = document.querySelector('.shakyo-slideshow');
    console.log('Shakyo slideshow container found:', shakyoSlideshow);
    
    if (shakyoSlideshow) {
        initSlideshowContainer(shakyoSlideshow, 'Shakyo');
    }
    
    // Initialize Memorial Tower Detailed slideshow
    const memorialDetailedSlideshow = document.querySelector('.memorial-tower-slideshow-detailed');
    console.log('Memorial tower detailed slideshow container found:', memorialDetailedSlideshow);
    
    if (memorialDetailedSlideshow) {
        initSlideshowContainerWithDescription(memorialDetailedSlideshow, 'Memorial Tower Detailed');
    }
}

function initSlideshowContainer(container, name) {
    const slideshowImages = container.querySelectorAll('.slideshow-image');
    console.log(`Found ${name} images:`, slideshowImages.length);
    
    if (slideshowImages.length > 1) {
        let currentIndex = 0;
        
        // Reset all images
        slideshowImages.forEach((img, index) => {
            img.classList.remove('active');
            console.log(`${name} Image`, index, 'classes after remove:', img.className);
            if (index === 0) {
                img.classList.add('active');
                console.log(`${name} Image`, index, 'classes after add active:', img.className);
            }
        });
        
        console.log(`Starting ${name} slideshow with`, slideshowImages.length, 'images');
        
        const slideInterval = setInterval(() => {
            console.log(`${name} Timer fired - switching from image`, currentIndex);
            
            // Remove active from current image
            slideshowImages[currentIndex].classList.remove('active');
            console.log(`${name} Removed active from image`, currentIndex);
            
            // Move to next image
            currentIndex = (currentIndex + 1) % slideshowImages.length;
            
            // Add active to next image
            slideshowImages[currentIndex].classList.add('active');
            console.log(`${name} Added active to image`, currentIndex);
            
        }, 3000); // Switch every 3 seconds
    } else {
        console.log(`${name} Not enough images for slideshow`);
    }
}

function initSlideshowContainerWithDescription(container, name) {
    const slideshowImages = container.querySelectorAll('.slideshow-image');
    const descriptionElement = document.getElementById('memorial-description');
    // Dots container (create if not present)
    let dotsContainer = container.querySelector('.slideshow-dots');
    if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'slideshow-dots';
        container.appendChild(dotsContainer);
    }
    // Ensure dots match the number of slides
    if (dotsContainer.children.length !== slideshowImages.length) {
        dotsContainer.innerHTML = '';
        slideshowImages.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                // Jump to slide i
                // Remove active from current
                const current = container.querySelector('.slideshow-image.active');
                if (current) current.classList.remove('active');
                const currentDot = dotsContainer.querySelector('.dot.active');
                if (currentDot) currentDot.classList.remove('active');
                // Set new index
                currentIndex = i;
                slideshowImages[currentIndex].classList.add('active');
                dot.classList.add('active');
                // Update description
                const desc = slideshowImages[currentIndex].getAttribute('data-description');
                if (desc && descriptionElement) descriptionElement.textContent = desc;
            });
            dotsContainer.appendChild(dot);
        });
    }
    console.log(`Found ${name} images:`, slideshowImages.length);
    
    if (slideshowImages.length > 1 && descriptionElement) {
        let currentIndex = 0;
        
        // Reset all images and set initial description
        slideshowImages.forEach((img, index) => {
            img.classList.remove('active');
            if (index === 0) {
                img.classList.add('active');
                const description = img.getAttribute('data-description');
                if (description) {
                    descriptionElement.textContent = description;
                }
            }
        });
        
        // Initialize first dot active
        const dots = dotsContainer.querySelectorAll('.dot');
        if (dots.length) {
            dots.forEach(d => d.classList.remove('active'));
            if (dots[0]) dots[0].classList.add('active');
        }

        console.log(`Starting ${name} slideshow with descriptions`);
        
        const slideInterval = setInterval(() => {
            // Remove active from current image
            slideshowImages[currentIndex].classList.remove('active');
            
            // Move to next image
            currentIndex = (currentIndex + 1) % slideshowImages.length;
            
            // Add active to next image and update description
            const nextImage = slideshowImages[currentIndex];
            nextImage.classList.add('active');
            
            const description = nextImage.getAttribute('data-description');
            if (description && descriptionElement) {
                descriptionElement.textContent = description;
            }
            
            // Update dots
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.dot');
                dots.forEach(d => d.classList.remove('active'));
                if (dots[currentIndex]) dots[currentIndex].classList.add('active');
            }
            
            console.log(`${name} switched to image ${currentIndex} with description`);
            
        }, 10000); // Switch every 10 seconds for detailed view (GUIDE memorial)
    } else {
        console.log(`${name} Not enough images for slideshow or description element not found`);
    }
}

// Test immediate execution
console.log('About to call initSlideshow immediately');
initSlideshow();

// Try multiple ways to ensure the slideshow starts
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    initSlideshow();
});

window.addEventListener('load', function() {
    console.log('Window load fired');
    initSlideshow();
});

// Also try after delays
setTimeout(function() {
    console.log('1 second timeout fired');
    initSlideshow();
}, 1000);

setTimeout(function() {
    console.log('3 second timeout fired');
    initSlideshow();
}, 3000);
