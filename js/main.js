const hamburgerButton = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

const themeToggleButton = document.querySelector('.theme-toggle');

const contactForm = document.querySelector('#contact-form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');

const nameError = document.querySelector('#name-error');
const emailError = document.querySelector('#email-error');
const messageError = document.querySelector('#message-error');
const formSuccess = document.querySelector('#form-success');

const projectStatus = document.querySelector('#project-status');
const projectList = document.querySelector('#project-list');

const scrollTopButton = document.querySelector('#scroll-top-button');

hamburgerButton.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');

    hamburgerButton.setAttribute('aria-expanded', String(isActive));
});

navLinks.forEach((navLink) => {
    navLink.addEventListener('click', (event) => {
        event.preventDefault();

        const targetId = navLink.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }

        navMenu.classList.remove('active');

        hamburgerButton.setAttribute('aria-expanded', 'false');
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY >= 300) {
        scrollTopButton.classList.add('show');
    } else {
        scrollTopButton.classList.remove('show');
    }
});

scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});