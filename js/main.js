const header = document.querySelector('.header');

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

    if (window.scrollY >= 60) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

const THEME_STORAGE_KEY = 'theme';

const updateThemeButton = (theme) => {
    if (theme === 'dark') {
        themeToggleButton.textContent = 'L';

        themeToggleButton.setAttribute('aria-label', '라이트 모드로 전환');
    } else {
        themeToggleButton.textContent = 'D';

        themeToggleButton.setAttribute('aria-label', '다크 모드로 전환');
    }
};

const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);

    updateThemeButton(theme);
};

const initializeTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'dark' || savedTheme === 'light') {
        applyTheme(savedTheme);
        return;
    }

    applyTheme('light');
};

initializeTheme();

themeToggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');

    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
});

const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.2
    }
);

revealElements.forEach((element) => {
    observer.observe(element);
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const showError = (input, errorElement, message) => {
    errorElement.textContent = message;
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
};

const clearError = (input, errorElement) => {
    errorElement.textContent = '';
    input.classList.remove('input-error');
    input.setAttribute('aria-invalid', 'false');
};

const validateName = (name) => {
    if (name === '') {
        showError(
            nameInput,
            nameError,
            '이름을 입력해주세요.'
        );

        return false;
    }

    clearError(nameInput, nameError);

    return true;
};

const validateEmail = (email) => {
    if (email === '') {
        showError(
            emailInput,
            emailError,
            '이메일을 입력해주세요.'
        );

        return false;
    }

    if (!EMAIL_PATTERN.test(email)) {
        showError(
            emailInput,
            emailError,
            '올바른 이메일 형식을 입력해주세요.'
        );

        return false;
    }

    clearError(emailInput, emailError);

    return true;
};

const validateMessage = (message) => {
    if (message === '') {
        showError(
            messageInput,
            messageError,
            '메시지를 입력해주세요.'
        );

        return false;
    }

    clearError(messageInput, messageError);

    return true;
};

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    formSuccess.textContent = '';

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isMessageValid = validateMessage(message);

    if (
        !isNameValid ||
        !isEmailValid ||
        !isMessageValid
    ) {
        return;
    }

    formSuccess.textContent = '입력 내용이 정상적으로 확인되었습니다.';
});

const clearFormSuccess = () => {
    formSuccess.textContent = '';
};

nameInput.addEventListener('input', () => {
    clearFormSuccess();

    if (!nameInput.classList.contains('input-error')) {
        return;
    }

    const name = nameInput.value.trim();

    validateName(name);
});

emailInput.addEventListener('input', () => {
    clearFormSuccess();

    if (!emailInput.classList.contains('input-error')) {
        return;
    }

    const email = emailInput.value.trim();

    validateEmail(email);
});

messageInput.addEventListener('input', () => {
    clearFormSuccess();

    if (!messageInput.classList.contains('input-error')) {
        return;
    }

    const message = messageInput.value.trim();

    validateMessage(message);
});

// ========================================
// GitHub Projects
// ========================================
const GITHUB_USERNAME = 'nothingOld';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

const showProjectLoading = () => {
    projectStatus.textContent = '프로젝트를 불러오는 중...';

    projectStatus.classList.add('loading');
};

const showProjectLoaded = () => {
    projectStatus.classList.remove('loading');

    projectStatus.textContent = '프로젝트 데이터를 불러왔습니다.';
};

const showProjectLoadFailure = () => {
    projectStatus.classList.remove('loading');
    
    projectStatus.textContent = '프로젝트를 불러오지 못했습니다.';
};

const fetchRepositories = async () => {
    showProjectLoading();

    try {
        const response = await fetch(GITHUB_API_URL);

        if (!response.ok) {
            throw new Error(`GitHub API 요청 실패: ${response.status}`);
        }

        const repositories = await response.json();

        console.log(repositories);

        showProjectLoaded();
    } catch (error) {
        console.error('GitHub 프로젝트를 불러오는 중 오류가 발생했습니다.', error);

        showProjectLoadFailure();
    }
};

fetchRepositories();
