// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');

function checkReveal() {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;

    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - revealPoint) {
            element.classList.add('active');
        }
    });
}

// Mobile Menu
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
let lastScrollTop = 0;
let scrollTimeout;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    
    // Clear any existing timeout
    clearTimeout(scrollTimeout);
    
    // Add hidden class when scrolling down
    if (scrollTop > lastScrollTop) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    
    // Update last scroll position
    lastScrollTop = scrollTop;
    
    // Show navbar after scrolling stops
    scrollTimeout = setTimeout(() => {
        navbar.classList.remove('hidden');
    }, 100);
});

function handleFormSubmit(formId, thankYouId, errorMessage) {
    const form = document.getElementById(formId);
    const thankYou = document.getElementById(thankYouId);

    if (!form || !thankYou) {
        console.error(`Form or thank you message not found for ${formId}`);
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');

        const formData = new FormData(form);
        formData.append('_timestamp', new Date().getTime());

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Form submission failed');
            }
            // Show thank you message and reset form
            thankYou.style.display = 'block';
            thankYou.classList.add('show');
            form.reset();

            setTimeout(() => {
                thankYou.classList.remove('show');
                setTimeout(() => {
                    thankYou.style.display = 'none';
                }, 300);
            }, 5000);
        })
        .catch(error => {
            // Only show error if it's a real submission failure
            if (error.message === 'Form submission failed') {
                console.error('Form submission failed:', error);
                showNotification(errorMessage, 'error');
            }
        })
        .finally(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            submitButton.setAttribute('aria-busy', 'false');
        });
    });
}

// Initialize both forms
handleFormSubmit('contactForm', 'contactThankYou', 'Failed to send message. Please try again.');
handleFormSubmit('projectForm', 'projectThankYou', 'Failed to send project details. Please try again.');

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Initialize animations
window.addEventListener('load', checkReveal);
window.addEventListener('scroll', checkReveal);

// Add hover effect to pricing cards
const pricingCards = document.querySelectorAll('.pricing-card');

pricingCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05)';
    });
    
    card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('featured')) {
            card.style.transform = 'scale(1)';
        }
    });
});

// Add parallax effect to hero shapes
const shapes = document.querySelectorAll('.shape');

window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.1;
        const x = (mouseX - 0.5) * 50 * speed;
        const y = (mouseY - 0.5) * 50 * speed;
        
        shape.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Pricing Card Selection
pricingCards.forEach(card => {
    card.addEventListener('click', () => {
        // Remove selected class from all cards
        pricingCards.forEach(c => c.classList.remove('selected'));
        // Add selected class to clicked card
        card.classList.add('selected');
    });
});

// Initialize with Standard plan selected
document.querySelector('.pricing-card:nth-child(2)').classList.add('selected');
