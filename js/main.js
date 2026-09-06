const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xwlknzen';

const header = document.querySelector('.header');

const hamburgerButton = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

const themeToggleButton = document.querySelector('.theme-toggle');

const heroDescription = document.querySelector('.hero-description');

const contactForm = document.querySelector('#contact-form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');

const nameError = document.querySelector('#name-error');
const emailError = document.querySelector('#email-error');
const messageError = document.querySelector('#message-error');
const formStatus = document.querySelector('#form-status');
const submitButton = contactForm.querySelector('.submit-button');

const projectStatus = document.querySelector('#project-status');
const projectList = document.querySelector('#project-list');
const projectFilters = document.querySelector('#project-filters');

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
const systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

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

const getSystemTheme = () => {
    return systemThemeMediaQuery.matches ? 'dark' : 'light';
};

const initializeTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'dark' || savedTheme === 'light') {
        applyTheme(savedTheme);
        return;
    }

    applyTheme(getSystemTheme());
};

initializeTheme();

themeToggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');

    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
});

systemThemeMediaQuery.addEventListener('change', () => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

        if (savedTheme === 'dark' || savedTheme === 'light') {
            return;
        }

        applyTheme(getSystemTheme());
    }
);

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

const sendContactForm = async () => {
    const formData = new FormData(contactForm);
    const response =
        await fetch(
            FORMSPREE_ENDPOINT,
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json'
                },
                body: formData
            }
        );

    if (!response.ok) {
        throw new Error(`Form 전송 실패: ${response.status}`);
    }
};

contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name =nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        clearFormStatus();

        const isNameValid = validateName(name);

        const isEmailValid = validateEmail(email);

        const isMessageValid = validateMessage(message);

        if (!isNameValid || !isEmailValid || !isMessageValid) {
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = '전송 중...';

        try {
            await sendContactForm();

            formStatus.textContent = '메시지가 정상적으로 전송되었습니다.';

            formStatus.classList.add('success');

            contactForm.reset();
        } catch (error) {
            console.error('Contact Form 전송 중 오류가 발생했습니다.', error);

            formStatus.textContent = '메시지 전송에 실패했습니다. 다시 시도해주세요.';
            formStatus.classList.add('error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = '보내기';
        }
    }
);

const clearFormStatus = () => {
    formStatus.textContent = '';
    formStatus.classList.remove('success', 'error');
};

nameInput.addEventListener('input', () => {
    clearFormStatus();

    if (!nameInput.classList.contains('input-error')) {
        return;
    }

    const name = nameInput.value.trim();

    validateName(name);
});

emailInput.addEventListener('input', () => {
    clearFormStatus();

    if (!emailInput.classList.contains('input-error')) {
        return;
    }

    validateEmail(emailInput.value.trim());
});

messageInput.addEventListener('input', () => {
    clearFormStatus();

    if (!messageInput.classList.contains('input-error')) {
        return;
    }

    validateMessage(messageInput.value.trim());
});

// ========================================
// GitHub Projects
// ========================================
const GITHUB_USERNAME = 'nothingOld';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

let allRepositories = [];
let selectedLanguage = 'all';

const showProjectLoading = () => {
    projectStatus.classList.add('loading');
    projectFilters.hidden = true;
    projectList.textContent = '';

    projectStatus.innerHTML = '<span>프로젝트를 불러오는 중...</span>';
};

const showProjectLoaded = () => {
    projectStatus.classList.remove('loading');
    projectStatus.textContent = '';
};

const showProjectError = (error) => {
    projectStatus.classList.remove('loading');
    projectList.textContent = '';
    projectFilters.hidden = true;

    const errorMessage =
        error.status === 403
            ? 'GitHub API 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.'
            : '프로젝트를 불러올 수 없습니다.';

    projectStatus.textContent = errorMessage;

    const retryButton = document.createElement('button');

    retryButton.type = 'button';
    retryButton.classList.add(
        'btn',
        'btn-secondary',
        'project-retry-button'
    );
    retryButton.textContent = '다시 시도';

    retryButton.addEventListener('click', () => {
        fetchRepositories();
    });

    projectStatus.append(retryButton);
};

const fetchRepositories = async () => {
    showProjectLoading();

    try {
        const response = await fetch(GITHUB_API_URL);

        if (!response.ok) {
            const error = new Error(`GitHub API 요청 실패: ${response.status}`);
            error.status = response.status;
            throw error;
        }

        const repositories = await response.json();

        if (repositories.length === 0) {
            showProjectEmpty();
            return;
        }

        allRepositories = repositories;
        selectedLanguage = 'all';

        createProjectFilters(allRepositories);
        renderFilteredProjects();
    } catch (error) {
        console.error('GitHub 프로젝트를 불러오는 중 오류가 발생했습니다.', error);

        showProjectError(error);
    }
};

projectFilters.addEventListener('click', (event) => {
    const button =
        event.target.closest('.project-filter-button');

    if (!button) {
        return;
    }

    selectedLanguage =
        button.dataset.language;

    updateProjectFilterButtons();
    renderFilteredProjects();
});

fetchRepositories();

const createProjectCard = (project) => {
    const article = document.createElement('article');
    article.classList.add('project-card');

    const title = document.createElement('h3');
    title.classList.add('project-card-title');
    title.textContent = project.name;

    const description = document.createElement('p');
    description.classList.add('project-card-description');
    description.textContent = project.description;

    const meta = document.createElement('div');
    meta.classList.add('project-card-meta');

    const language = document.createElement('span');
    language.textContent = `Language: ${project.language}`;

    const stars = document.createElement('span');
    stars.textContent = `Stars: ${project.starCount}`;

    const link = document.createElement('a');
    link.classList.add('project-card-link');
    link.href = project.htmlUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'GitHub에서 보기';

    meta.append(language, stars);

    article.append(
        title,
        description,
        meta,
        link
    );

    return article;
};

const getRepositoryLanguages = (repositories) => {
    return [
        ...new Set(
            repositories
                .map((repository) => repository.language)
                .filter(Boolean)
        )
    ].sort();
};

const createProjectFilters = (repositories) => {
    const languages =
        getRepositoryLanguages(repositories);

    projectFilters.textContent = '';

    if (languages.length === 0) {
        projectFilters.hidden = true;
        return;
    }

    const filterLanguages = [
        'all',
        ...languages
    ];

    filterLanguages.forEach((language) => {
        const button =
            document.createElement('button');

        button.type = 'button';

        button.classList.add(
            'project-filter-button'
        );

        button.dataset.language = language;

        button.textContent =
            language === 'all'
                ? '전체'
                : language;

        const isActive =
            language === selectedLanguage;

        button.classList.toggle(
            'active',
            isActive
        );

        button.setAttribute(
            'aria-pressed',
            String(isActive)
        );

        projectFilters.append(button);
    });

    projectFilters.hidden = false;
};

const updateProjectFilterButtons = () => {
    const filterButtons =
        projectFilters.querySelectorAll(
            '.project-filter-button'
        );

    filterButtons.forEach((button) => {
        const isActive =
            button.dataset.language ===
            selectedLanguage;

        button.classList.toggle(
            'active',
            isActive
        );

        button.setAttribute(
            'aria-pressed',
            String(isActive)
        );
    });
};

const renderFilteredProjects = () => {
    const filteredRepositories =
        selectedLanguage === 'all'
            ? allRepositories
            : allRepositories.filter(
                (repository) =>
                    repository.language ===
                    selectedLanguage
            );

    if (filteredRepositories.length === 0) {
        projectList.textContent = '';

        projectStatus.textContent =
            '해당 언어의 프로젝트가 없습니다.';

        return;
    }

    renderProjects(filteredRepositories);
    showProjectLoaded();
};

const renderProjects = (repositories) => {
    projectList.textContent = '';

    const projects = repositories.map((repository) => {
        const {
            name,
            description,
            html_url: htmlUrl,
            language,
            stargazers_count: starCount
        } = repository;

        return {
            name,
            description: description ?? '프로젝트 설명이 없습니다.',
            htmlUrl,
            language: language ?? 'N/A',
            starCount
        };
    });

    projects.forEach((project) => {
        const projectCard = createProjectCard(project);

        projectList.append(projectCard);
    });
};

const showProjectEmpty = () => {
    projectStatus.classList.remove('loading');
    projectStatus.textContent = '표시할 프로젝트가 없습니다.';
    projectList.textContent = '';
    projectFilters.hidden = true;
};

const TYPING_SPEED = 50;

const runTypingEffect = () => {
    const typingText = heroDescription.textContent.trim();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typingText === '' || prefersReducedMotion) {
        return;
    }

    heroDescription.textContent = '';
    heroDescription.setAttribute('aria-label', typingText);
    heroDescription.classList.add('typing');

    const characters = Array.from(typingText);
    let currentIndex = 0;

    const typeNextCharacter = () => {
        heroDescription.textContent += characters[currentIndex];

        currentIndex += 1;

        if (currentIndex < characters.length) {
            window.setTimeout(typeNextCharacter, TYPING_SPEED);
            return;
        }

        heroDescription.classList.remove('typing');
    };

    typeNextCharacter();
};

runTypingEffect();