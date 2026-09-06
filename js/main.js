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

hamburgerButton.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');

    hamburgerButton.setAttribute('aria-expanded', String(isActive));
});

navLinks.forEach((navLink) => {
    navLink.addEventListener('click', () => {
        navMenu.classList.remove('active');

        hamburgerButton.setAttribute('aria-expanded', 'false');
    });
});

