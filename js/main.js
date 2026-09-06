'use strict';

/* ========================================
   Constants
======================================== */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xwlknzen';
const GITHUB_USERNAME = 'nothingOld';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;
const THEME_STORAGE_KEY = 'theme';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPING_SPEED = 50;
const SCROLL_TOP_THRESHOLD = 300;
const HEADER_SCROLL_THRESHOLD = 60;

/* ========================================
   Application State
======================================== */
/**
 * 애플리케이션에서 화면 렌더링에 사용하는 상태의 단일 출처입니다.
 * 상태를 개별 전역 변수로 분산하지 않고 하나의 객체에서 관리합니다.
 *
 * @type {{
 *   repositories: Array<Object>,
 *   selectedLanguage: string,
 *   theme: 'light' | 'dark'
 * }}
 */
const STATE = {
    repositories: [],
    selectedLanguage: 'all',
    theme: 'light'
};

/* ========================================
   DOM References
======================================== */
const elements = {
    header: document.querySelector('.header'),
    hamburgerButton: document.querySelector('.hamburger'),
    navMenu: document.querySelector('.nav-menu'),
    navLinks: document.querySelectorAll('.nav-link'),
    themeToggleButton: document.querySelector('.theme-toggle'),
    heroDescription: document.querySelector('.hero-description'),
    contactForm: document.querySelector('#contact-form'),
    nameInput: document.querySelector('#name'),
    emailInput: document.querySelector('#email'),
    messageInput: document.querySelector('#message'),
    nameError: document.querySelector('#name-error'),
    emailError: document.querySelector('#email-error'),
    messageError: document.querySelector('#message-error'),
    formStatus: document.querySelector('#form-status'),
    projectStatus: document.querySelector('#project-status'),
    projectList: document.querySelector('#project-list'),
    projectFilters: document.querySelector('#project-filters'),
    scrollTopButton: document.querySelector('#scroll-top-button'),
    revealElements: document.querySelectorAll('.reveal')
};

elements.submitButton = elements.contactForm.querySelector('.submit-button');

const systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ========================================
   Navigation / Scroll
======================================== */
/**
 * 모바일 내비게이션 메뉴를 닫고 접근성 상태를 갱신합니다.
 *
 * @returns {void}
 */
function closeNavigationMenu() {
    elements.navMenu.classList.remove('active');
    elements.hamburgerButton.setAttribute('aria-expanded', 'false');
}

/**
 * 햄버거 버튼 클릭 시 모바일 내비게이션 메뉴를 토글합니다.
 *
 * @returns {void}
 */
function handleHamburgerClick() {
    const isActive = elements.navMenu.classList.toggle('active');
    elements.hamburgerButton.setAttribute('aria-expanded', String(isActive));
}

/**
 * 내비게이션 링크 대상 섹션으로 부드럽게 이동합니다.
 *
 * @param {MouseEvent} event - 링크 클릭 이벤트입니다.
 * @returns {void}
 */
function handleNavigationClick(event) {
    event.preventDefault();

    const targetId = event.currentTarget.getAttribute('href');
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }

    closeNavigationMenu();
}

/**
 * 현재 스크롤 위치에 따라 헤더와 맨 위로 이동 버튼의 상태를 갱신합니다.
 *
 * @returns {void}
 */
function handleWindowScroll() {
    const scrollPosition = window.scrollY;

    elements.scrollTopButton.classList.toggle(
        'show',
        scrollPosition >= SCROLL_TOP_THRESHOLD
    );
    elements.header.classList.toggle(
        'scrolled',
        scrollPosition >= HEADER_SCROLL_THRESHOLD
    );
}

/**
 * 페이지 최상단으로 이동합니다.
 *
 * @returns {void}
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: reducedMotionMediaQuery.matches ? 'auto' : 'smooth'
    });
}

/**
 * 내비게이션 및 스크롤 관련 이벤트를 등록합니다.
 *
 * @returns {void}
 */
function initializeNavigation() {
    elements.hamburgerButton.addEventListener('click', handleHamburgerClick);
    elements.navLinks.forEach((navLink) => {
        navLink.addEventListener('click', handleNavigationClick);
    });
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    elements.scrollTopButton.addEventListener('click', scrollToTop);

    handleWindowScroll();
}

/* ========================================
   Theme
======================================== */
/**
 * 시스템의 현재 색상 테마를 반환합니다.
 *
 * @returns {'light' | 'dark'} 시스템 테마입니다.
 */
function getSystemTheme() {
    return systemThemeMediaQuery.matches ? 'dark' : 'light';
}

/**
 * 현재 테마에 맞게 테마 전환 버튼의 표시와 접근성 라벨을 갱신합니다.
 *
 * @param {'light' | 'dark'} theme - 현재 적용할 테마입니다.
 * @returns {void}
 */
function updateThemeButton(theme) {
    const isDarkTheme = theme === 'dark';

    elements.themeToggleButton.textContent = isDarkTheme ? 'L' : 'D';
    elements.themeToggleButton.setAttribute(
        'aria-label',
        isDarkTheme ? '라이트 모드로 전환' : '다크 모드로 전환'
    );
}

/**
 * 문서와 STATE에 테마를 적용합니다.
 *
 * @param {'light' | 'dark'} theme - 적용할 테마입니다.
 * @returns {void}
 */
function applyTheme(theme) {
    STATE.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButton(theme);
}

/**
 * 저장된 사용자 테마가 있으면 우선 적용하고, 없으면 시스템 테마를 적용합니다.
 *
 * @returns {void}
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const hasValidSavedTheme = savedTheme === 'dark' || savedTheme === 'light';

    applyTheme(hasValidSavedTheme ? savedTheme : getSystemTheme());
}

/**
 * 사용자가 테마 전환 버튼을 누르면 다음 테마를 적용하고 저장합니다.
 *
 * @returns {void}
 */
function handleThemeToggle() {
    const nextTheme = STATE.theme === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

/**
 * 사용자가 별도 테마를 저장하지 않은 경우 시스템 테마 변경을 반영합니다.
 *
 * @returns {void}
 */
function handleSystemThemeChange() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === 'dark' || savedTheme === 'light') {
        return;
    }

    applyTheme(getSystemTheme());
}

/**
 * 테마 관련 이벤트를 등록합니다.
 *
 * @returns {void}
 */
function initializeThemeEvents() {
    elements.themeToggleButton.addEventListener('click', handleThemeToggle);
    systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange);
}

/* ========================================
   Reveal Animation
======================================== */
/**
 * 화면에 진입한 요소를 표시하는 IntersectionObserver를 초기화합니다.
 *
 * @returns {void}
 */
function initializeRevealAnimation() {
    if (reducedMotionMediaQuery.matches) {
        elements.revealElements.forEach((element) => {
            element.classList.add('visible');
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.2 }
    );

    elements.revealElements.forEach((element) => {
        observer.observe(element);
    });
}

/* ========================================
   Contact Form
======================================== */
/**
 * 입력 필드에 오류 상태와 메시지를 표시합니다.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} input - 오류가 발생한 입력 필드입니다.
 * @param {HTMLElement} errorElement - 오류 메시지를 출력할 요소입니다.
 * @param {string} message - 사용자에게 표시할 오류 메시지입니다.
 * @returns {void}
 */
function showError(input, errorElement, message) {
    errorElement.textContent = message;
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
}

/**
 * 입력 필드의 오류 상태와 메시지를 제거합니다.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} input - 오류 상태를 해제할 입력 필드입니다.
 * @param {HTMLElement} errorElement - 오류 메시지 요소입니다.
 * @returns {void}
 */
function clearError(input, errorElement) {
    errorElement.textContent = '';
    input.classList.remove('input-error');
    input.setAttribute('aria-invalid', 'false');
}

/**
 * 이름 입력값을 검증합니다.
 *
 * @param {string} name - 공백 제거가 완료된 이름입니다.
 * @returns {boolean} 유효하면 true를 반환합니다.
 */
function validateName(name) {
    if (name === '') {
        showError(elements.nameInput, elements.nameError, '이름을 입력해주세요.');
        return false;
    }

    clearError(elements.nameInput, elements.nameError);
    return true;
}

/**
 * 이메일 입력값을 빈 값 및 이메일 형식 기준으로 검증합니다.
 *
 * @param {string} email - 공백 제거가 완료된 이메일입니다.
 * @returns {boolean} 유효하면 true를 반환합니다.
 */
function validateEmail(email) {
    if (email === '') {
        showError(elements.emailInput, elements.emailError, '이메일을 입력해주세요.');
        return false;
    }

    if (!EMAIL_PATTERN.test(email)) {
        showError(
            elements.emailInput,
            elements.emailError,
            '올바른 이메일 형식을 입력해주세요.'
        );
        return false;
    }

    clearError(elements.emailInput, elements.emailError);
    return true;
}

/**
 * 메시지 입력값을 검증합니다.
 *
 * @param {string} message - 공백 제거가 완료된 메시지입니다.
 * @returns {boolean} 유효하면 true를 반환합니다.
 */
function validateMessage(message) {
    if (message === '') {
        showError(
            elements.messageInput,
            elements.messageError,
            '메시지를 입력해주세요.'
        );
        return false;
    }

    clearError(elements.messageInput, elements.messageError);
    return true;
}

/**
 * Contact Form의 모든 사용자 입력을 검증합니다.
 *
 * @returns {boolean} 모든 필드가 유효하면 true를 반환합니다.
 */
function validateContactForm() {
    const name = elements.nameInput.value.trim();
    const email = elements.emailInput.value.trim();
    const message = elements.messageInput.value.trim();

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isMessageValid = validateMessage(message);

    return isNameValid && isEmailValid && isMessageValid;
}

/**
 * Formspree로 Contact Form 데이터를 전송합니다.
 *
 * @returns {Promise<void>}
 * @throws {Error} 응답 상태가 정상 범위가 아니면 예외를 발생시킵니다.
 */
async function sendContactForm() {
    const formData = new FormData(elements.contactForm);
    const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
            Accept: 'application/json'
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Form 전송 실패: ${response.status}`);
    }
}

/**
 * Contact Form 상태 메시지를 초기화합니다.
 *
 * @returns {void}
 */
function clearFormStatus() {
    elements.formStatus.textContent = '';
    elements.formStatus.classList.remove('success', 'error');
}

/**
 * Contact Form 전송 버튼의 로딩 상태를 설정합니다.
 *
 * @param {boolean} isSubmitting - 전송 중 여부입니다.
 * @returns {void}
 */
function setContactFormSubmitting(isSubmitting) {
    elements.submitButton.disabled = isSubmitting;
    elements.submitButton.textContent = isSubmitting ? '전송 중...' : '보내기';
}

/**
 * Contact Form 제출을 검증하고 서버 전송 결과를 화면에 표시합니다.
 *
 * @param {SubmitEvent} event - Form submit 이벤트입니다.
 * @returns {Promise<void>}
 */
async function handleContactFormSubmit(event) {
    event.preventDefault();
    clearFormStatus();

    if (!validateContactForm()) {
        return;
    }

    setContactFormSubmitting(true);

    try {
        await sendContactForm();
        elements.formStatus.textContent = '메시지가 정상적으로 전송되었습니다.';
        elements.formStatus.classList.add('success');
        elements.contactForm.reset();
    } catch (error) {
        console.error('Contact Form 전송 중 오류가 발생했습니다.', error);
        elements.formStatus.textContent = '메시지 전송에 실패했습니다. 다시 시도해주세요.';
        elements.formStatus.classList.add('error');
    } finally {
        setContactFormSubmitting(false);
    }
}

/**
 * 오류 상태인 입력 필드만 다시 검증합니다.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} input - 입력 필드입니다.
 * @param {(value: string) => boolean} validator - 필드 검증 함수입니다.
 * @returns {void}
 */
function revalidateErroredField(input, validator) {
    clearFormStatus();

    if (!input.classList.contains('input-error')) {
        return;
    }

    validator(input.value.trim());
}

/**
 * 이름 입력 이벤트를 처리합니다.
 *
 * @returns {void}
 */
function handleNameInput() {
    revalidateErroredField(elements.nameInput, validateName);
}

/**
 * 이메일 입력 이벤트를 처리합니다.
 *
 * @returns {void}
 */
function handleEmailInput() {
    revalidateErroredField(elements.emailInput, validateEmail);
}

/**
 * 메시지 입력 이벤트를 처리합니다.
 *
 * @returns {void}
 */
function handleMessageInput() {
    revalidateErroredField(elements.messageInput, validateMessage);
}

/**
 * Contact Form 이벤트를 등록합니다.
 *
 * @returns {void}
 */
function initializeContactForm() {
    elements.contactForm.addEventListener('submit', handleContactFormSubmit);
    elements.nameInput.addEventListener('input', handleNameInput);
    elements.emailInput.addEventListener('input', handleEmailInput);
    elements.messageInput.addEventListener('input', handleMessageInput);
}

/* ========================================
   GitHub Projects
======================================== */
/**
 * 프로젝트 로딩 상태를 화면에 표시합니다.
 *
 * @returns {void}
 */
function showProjectLoading() {
    elements.projectStatus.classList.add('loading');
    elements.projectStatus.textContent = '프로젝트를 불러오는 중...';
    elements.projectFilters.hidden = true;
    elements.projectList.textContent = '';
}

/**
 * 프로젝트 로딩 상태를 제거합니다.
 *
 * @returns {void}
 */
function showProjectLoaded() {
    elements.projectStatus.classList.remove('loading');
    elements.projectStatus.textContent = '';
}

/**
 * 프로젝트가 없는 상태를 화면에 표시합니다.
 *
 * @returns {void}
 */
function showProjectEmpty() {
    elements.projectStatus.classList.remove('loading');
    elements.projectStatus.textContent = '표시할 프로젝트가 없습니다.';
    elements.projectList.textContent = '';
    elements.projectFilters.hidden = true;
}

/**
 * GitHub API 오류 메시지와 재시도 버튼을 표시합니다.
 *
 * @param {Error & {status?: number}} error - GitHub API 요청 중 발생한 오류입니다.
 * @returns {void}
 */
function showProjectError(error) {
    elements.projectStatus.classList.remove('loading');
    elements.projectList.textContent = '';
    elements.projectFilters.hidden = true;

    const errorMessage = error.status === 403
        ? 'GitHub API 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.'
        : '프로젝트를 불러올 수 없습니다.';

    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.classList.add('btn', 'btn-secondary', 'project-retry-button');
    retryButton.textContent = '다시 시도';
    retryButton.addEventListener('click', fetchRepositories, { once: true });

    elements.projectStatus.textContent = errorMessage;
    elements.projectStatus.append(retryButton);
}

/**
 * GitHub Repository API에서 저장소 목록을 불러오고 STATE를 갱신합니다.
 *
 * @returns {Promise<void>}
 */
async function fetchRepositories() {
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
            STATE.repositories = [];
            STATE.selectedLanguage = 'all';
            showProjectEmpty();
            return;
        }

        STATE.repositories = repositories;
        STATE.selectedLanguage = 'all';

        createProjectFilters();
        renderFilteredProjects();
    } catch (error) {
        console.error('GitHub 프로젝트를 불러오는 중 오류가 발생했습니다.', error);
        showProjectError(error);
    }
}

/**
 * Repository 목록에서 중복 없는 프로그래밍 언어 목록을 생성합니다.
 *
 * @param {Array<Object>} repositories - GitHub Repository 목록입니다.
 * @returns {Array<string>} 오름차순으로 정렬된 언어 목록입니다.
 */
function getRepositoryLanguages(repositories) {
    return [
        ...new Set(
            repositories
                .map((repository) => repository.language)
                .filter(Boolean)
        )
    ].sort();
}

/**
 * 프로젝트 필터 버튼을 STATE의 Repository 목록을 기준으로 생성합니다.
 *
 * @returns {void}
 */
function createProjectFilters() {
    const languages = getRepositoryLanguages(STATE.repositories);

    elements.projectFilters.textContent = '';

    if (languages.length === 0) {
        elements.projectFilters.hidden = true;
        return;
    }

    ['all', ...languages].forEach((language) => {
        const button = document.createElement('button');
        const isActive = language === STATE.selectedLanguage;

        button.type = 'button';
        button.classList.add('project-filter-button');
        button.classList.toggle('active', isActive);
        button.dataset.language = language;
        button.textContent = language === 'all' ? '전체' : language;
        button.setAttribute('aria-pressed', String(isActive));

        elements.projectFilters.append(button);
    });

    elements.projectFilters.hidden = false;
}

/**
 * STATE의 선택 언어에 맞게 필터 버튼 활성 상태를 갱신합니다.
 *
 * @returns {void}
 */
function updateProjectFilterButtons() {
    const filterButtons = elements.projectFilters.querySelectorAll(
        '.project-filter-button'
    );

    filterButtons.forEach((button) => {
        const isActive = button.dataset.language === STATE.selectedLanguage;

        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

/**
 * 프로젝트 필터 영역의 클릭 이벤트를 처리합니다.
 *
 * @param {MouseEvent} event - 필터 영역의 클릭 이벤트입니다.
 * @returns {void}
 */
function handleProjectFilterClick(event) {
    const button = event.target.closest('.project-filter-button');

    if (!button || !elements.projectFilters.contains(button)) {
        return;
    }

    STATE.selectedLanguage = button.dataset.language;
    updateProjectFilterButtons();
    renderFilteredProjects();
}

/**
 * STATE의 선택 언어에 따라 Repository를 필터링하고 화면에 렌더링합니다.
 *
 * @returns {void}
 */
function renderFilteredProjects() {
    const filteredRepositories = STATE.selectedLanguage === 'all'
        ? STATE.repositories
        : STATE.repositories.filter(
            (repository) => repository.language === STATE.selectedLanguage
        );

    if (filteredRepositories.length === 0) {
        elements.projectList.textContent = '';
        elements.projectStatus.textContent = '해당 언어의 프로젝트가 없습니다.';
        return;
    }

    renderProjects(filteredRepositories);
    showProjectLoaded();
}

/**
 * GitHub API Repository 데이터를 화면 표시용 데이터로 변환합니다.
 *
 * @param {Object} repository - GitHub Repository 데이터입니다.
 * @returns {{
 *   name: string,
 *   description: string,
 *   htmlUrl: string,
 *   language: string,
 *   starCount: number
 * }} 화면 표시용 프로젝트 데이터입니다.
 */
function mapRepositoryToProject(repository) {
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
}

/**
 * 프로젝트 카드 DOM 요소를 생성합니다.
 *
 * @param {{
 *   name: string,
 *   description: string,
 *   htmlUrl: string,
 *   language: string,
 *   starCount: number
 * }} project - 화면에 표시할 프로젝트 데이터입니다.
 * @returns {HTMLElement} 완성된 프로젝트 카드 요소입니다.
 */
function createProjectCard(project) {
    const article = document.createElement('article');
    const title = document.createElement('h3');
    const description = document.createElement('p');
    const meta = document.createElement('div');
    const language = document.createElement('span');
    const stars = document.createElement('span');
    const link = document.createElement('a');

    article.classList.add('project-card');

    title.classList.add('project-card-title');
    title.textContent = project.name;

    description.classList.add('project-card-description');
    description.textContent = project.description;

    meta.classList.add('project-card-meta');
    language.textContent = `Language: ${project.language}`;
    stars.textContent = `Stars: ${project.starCount}`;
    meta.append(language, stars);

    link.classList.add('project-card-link');
    link.href = project.htmlUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'GitHub에서 보기';

    article.append(title, description, meta, link);
    return article;
}

/**
 * Repository 목록을 프로젝트 카드 목록으로 렌더링합니다.
 *
 * @param {Array<Object>} repositories - 렌더링할 GitHub Repository 목록입니다.
 * @returns {void}
 */
function renderProjects(repositories) {
    const fragment = document.createDocumentFragment();

    repositories
        .map(mapRepositoryToProject)
        .forEach((project) => {
            fragment.append(createProjectCard(project));
        });

    elements.projectList.replaceChildren(fragment);
}

/**
 * GitHub 프로젝트 관련 이벤트를 등록하고 Repository를 최초 로드합니다.
 *
 * @returns {void}
 */
function initializeProjects() {
    elements.projectFilters.addEventListener('click', handleProjectFilterClick);
    fetchRepositories();
}

/* ========================================
   Typing Effect
======================================== */
/**
 * Hero 설명 문구를 한 글자씩 표시하는 타이핑 효과를 실행합니다.
 * 애니메이션 감소 설정이 활성화된 경우 원문을 그대로 유지합니다.
 *
 * @returns {void}
 */
function runTypingEffect() {
    const typingText = elements.heroDescription.textContent.trim();

    if (typingText === '' || reducedMotionMediaQuery.matches) {
        return;
    }

    const characters = Array.from(typingText);
    let currentIndex = 0;

    elements.heroDescription.textContent = '';
    elements.heroDescription.setAttribute('aria-label', typingText);
    elements.heroDescription.classList.add('typing');

    function typeNextCharacter() {
        elements.heroDescription.textContent += characters[currentIndex];
        currentIndex += 1;

        if (currentIndex < characters.length) {
            window.setTimeout(typeNextCharacter, TYPING_SPEED);
            return;
        }

        elements.heroDescription.classList.remove('typing');
    }

    typeNextCharacter();
}

/* ========================================
   Application Initialization
======================================== */
/**
 * 페이지에서 사용하는 모든 기능을 초기화합니다.
 *
 * @returns {void}
 */
function initializeApp() {
    initializeTheme();
    initializeNavigation();
    initializeThemeEvents();
    initializeRevealAnimation();
    initializeContactForm();
    initializeProjects();
    runTypingEffect();
}

initializeApp();
