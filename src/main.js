import './style.css';
import { fetchEmployees } from './api.js';

const app = document.querySelector('#app');

let allEmployees = [];
let filteredEmployees = [];

let currentSearch = '';
let currentDepartment = 'all';
let currentSort = 'name-asc';

const FAVORITES_KEY = 'employee-favorites';
const THEME_KEY = 'employee-theme';

const DEPARTMENTS = [
    'Engineering',
    'HR',
    'Marketing',
    'Finance',
    'Sales'
];

/* ================================
   STORAGE
================================ */

function getFavorites() {
    try {
        const favorites = JSON.parse(
            localStorage.getItem(FAVORITES_KEY)
        );

        return Array.isArray(favorites) ? favorites : [];
    } catch {
        return [];
    }
}

function toggleFavorite(employeeId) {
    const favorites = getFavorites();

    const favoriteIndex = favorites.indexOf(employeeId);

    if (favoriteIndex === -1) {
        favorites.push(employeeId);
    } else {
        favorites.splice(favoriteIndex, 1);
    }

    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
    );

    applyFilters();
}

/* ================================
   THEME
================================ */

function applyTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    updateThemeButton();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');

    const isDark = document.body.classList.contains('dark-mode');

    localStorage.setItem(
        THEME_KEY,
        isDark ? 'dark' : 'light'
    );

    updateThemeButton();
}

function updateThemeButton() {
    const themeButton = document.querySelector('#theme-toggle');

    if (!themeButton) {
        return;
    }

    const isDark = document.body.classList.contains('dark-mode');

    themeButton.textContent = isDark
        ? '☀️ Light Mode'
        : '🌙 Dark Mode';

    themeButton.setAttribute(
        'aria-label',
        isDark
            ? 'Switch to light mode'
            : 'Switch to dark mode'
    );
}

/* ================================
   SEARCH
================================ */

function searchEmployees(searchTerm) {
    currentSearch = searchTerm.toLowerCase().trim();

    applyFilters();
}

/* ================================
   SORT
================================ */

function sortEmployees(employees, sortOrder) {
    const sortedEmployees = [...employees];

    sortedEmployees.sort((a, b) => {
        const nameA =
            `${a.name.first} ${a.name.last}`.toLowerCase();

        const nameB =
            `${b.name.first} ${b.name.last}`.toLowerCase();

        if (sortOrder === 'name-asc') {
            return nameA.localeCompare(nameB);
        }

        return nameB.localeCompare(nameA);
    });

    return sortedEmployees;
}

/* ================================
   FILTERS
================================ */

function applyFilters() {
    let results = [...allEmployees];

    /* Search filter */
    if (currentSearch) {
        results = results.filter((employee) => {
            const firstName =
                employee.name.first.toLowerCase();

            const lastName =
                employee.name.last.toLowerCase();

            return (
                firstName.startsWith(currentSearch) ||
                lastName.startsWith(currentSearch)
            );
        });
    }

    /* Department filter */
    if (currentDepartment === 'favorites') {
        const favorites = getFavorites();

        results = results.filter((employee) => {
            return favorites.includes(employee.login.uuid);
        });
    } else if (currentDepartment !== 'all') {
        results = results.filter((employee) => {
            return (
                employee.department.toLowerCase() ===
                currentDepartment
            );
        });
    }

    /* Sorting */
    results = sortEmployees(
        results,
        currentSort
    );

    filteredEmployees = results;

    renderEmployees(filteredEmployees);
}

/* ================================
   EMPLOYEE MODAL
================================ */

function openEmployeeModal(employeeId) {
    const employee = allEmployees.find(
        (item) => item.login.uuid === employeeId
    );

    if (!employee) {
        return;
    }

    const modal =
        document.querySelector('#employee-modal');

    const modalBody =
        document.querySelector('#modal-body');

    modalBody.innerHTML = `
        <img
            class="modal-photo"
            src="${employee.picture.large}"
            alt="${employee.name.first} ${employee.name.last}"
        >

        <h2>
            ${employee.name.first}
            ${employee.name.last}
        </h2>

        <div class="modal-details">

            <p>
                <strong>Email:</strong>
                ${employee.email}
            </p>

            <p>
                <strong>Phone:</strong>
                ${employee.phone}
            </p>

            <p>
                <strong>Department:</strong>
                ${employee.department}
            </p>

            <p>
                <strong>Gender:</strong>
                ${employee.gender}
            </p>

            <p>
                <strong>Date of Birth:</strong>
                ${new Date(
                    employee.dob.date
                ).toLocaleDateString()}
            </p>

            <p>
                <strong>Age:</strong>
                ${employee.dob.age}
            </p>

            <p>
                <strong>Location:</strong>
                ${employee.location.city},
                ${employee.location.state},
                ${employee.location.country}
            </p>

            <p>
                <strong>Username:</strong>
                ${employee.login.username}
            </p>

        </div>
    `;

    modal.classList.remove('hidden');

    document.body.classList.add('modal-open');

    document.querySelector('#modal-close').focus();
}

function closeEmployeeModal() {
    const modal =
        document.querySelector('#employee-modal');

    modal.classList.add('hidden');

    document.body.classList.remove('modal-open');
}

/* ================================
   RENDER EMPLOYEES
================================ */

function renderEmployees(employees) {
    const employeeList =
        document.querySelector('#employee-list');

    const favorites = getFavorites();

    if (employees.length === 0) {
        employeeList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>

                <h3>No employees found</h3>

                <p>
                    Try changing your search or filter.
                </p>
            </div>
        `;

        return;
    }

    employeeList.innerHTML = employees.map(
        (employee) => {
            const employeeId =
                employee.login.uuid;

            const isFavorite =
                favorites.includes(employeeId);

            const fullName =
                `${employee.name.first} ${employee.name.last}`;

            return `
                <article
                    class="employee-card"
                    data-id="${employeeId}"
                >

                    <div class="employee-photo-wrapper">

                        <img
                            class="employee-photo"
                            src="${employee.picture.large}"
                            alt="${fullName}"
                            loading="lazy"
                        >

                        <button
                            class="favorite-btn ${
                                isFavorite
                                    ? 'is-favorite'
                                    : ''
                            }"
                            type="button"
                            data-id="${employeeId}"
                            aria-label="${
                                isFavorite
                                    ? `Remove ${fullName} from favorites`
                                    : `Add ${fullName} to favorites`
                            }"
                            title="${
                                isFavorite
                                    ? 'Remove from favorites'
                                    : 'Add to favorites'
                            }"
                        >
                            ${
                                isFavorite
                                    ? '★'
                                    : '☆'
                            }
                        </button>

                    </div>

                    <div class="employee-info">

                        <h3>
                            ${fullName}
                        </h3>

                        <p class="employee-email">
                            ${employee.email}
                        </p>

                        <p class="employee-phone">
                            ${employee.phone}
                        </p>

                        <span class="department">
                            ${employee.department}
                        </span>

                    </div>

                </article>
            `;
        }
    ).join('');
}

/* ================================
   LOADING STATE
================================ */

function showLoading() {
    const employeeList =
        document.querySelector('#employee-list');

    employeeList.innerHTML = `
        <div class="loading-state">

            <div
                class="spinner"
                aria-hidden="true"
            ></div>

            <p>Loading employees...</p>

        </div>
    `;
}

/* ================================
   ERROR STATE
================================ */

function showError() {
    const employeeList =
        document.querySelector('#employee-list');

    employeeList.innerHTML = `
        <div class="error-state">

            <div class="error-icon">⚠️</div>

            <h3>
                Unable to load employees
            </h3>

            <p>
                Something went wrong while
                loading employee data.
            </p>

            <button
                id="retry-button"
                class="retry-button"
                type="button"
            >
                Try Again
            </button>

        </div>
    `;

    document
        .querySelector('#retry-button')
        .addEventListener(
            'click',
            loadEmployees
        );
}

/* ================================
   LOAD EMPLOYEES
================================ */

async function loadEmployees() {
    showLoading();

    try {
        const employees =
            await fetchEmployees();

        employees.forEach(
            (employee, index) => {
                employee.department =
                    DEPARTMENTS[
                        index % DEPARTMENTS.length
                    ];
            }
        );

        allEmployees = employees;

        applyFilters();

    } catch (error) {
        console.error(
            'Error loading employees:',
            error
        );

        showError();
    }
}

/* ================================
   HTML
================================ */

app.innerHTML = `
    <header class="header">

        <div class="header-content">

            <div>
                <h1>
                    Employee Directory
                </h1>

                <p class="subtitle">
                    Manage and explore your
                    employee directory
                </p>
            </div>

            <button
                id="theme-toggle"
                class="theme-toggle"
                type="button"
            >
                🌙 Dark Mode
            </button>

        </div>

    </header>

    <main class="container">

        <section
            class="controls"
            aria-label="Employee controls"
        >

            <div class="control-group">

                <label for="search-input">
                    Search employees
                </label>

                <input
                    type="search"
                    id="search-input"
                    placeholder="Search by first or last name..."
                    autocomplete="off"
                >

            </div>

            <div class="control-group">

                <label for="department-filter">
                    Department
                </label>

                <select
                    id="department-filter"
                >
                    <option value="all">
                        All Departments
                    </option>

                    <option value="engineering">
                        Engineering
                    </option>

                    <option value="hr">
                        HR
                    </option>

                    <option value="marketing">
                        Marketing
                    </option>

                    <option value="finance">
                        Finance
                    </option>

                    <option value="sales">
                        Sales
                    </option>

                    <option value="favorites">
                        ⭐ Favorites Only
                    </option>

                </select>

            </div>

            <div class="control-group">

                <label for="sort-select">
                    Sort
                </label>

                <select
                    id="sort-select"
                >
                    <option value="name-asc">
                        Name: A-Z
                    </option>

                    <option value="name-desc">
                        Name: Z-A
                    </option>

                </select>

            </div>

        </section>

        <section
            class="employee-section"
            aria-labelledby="employee-heading"
        >

            <div class="section-heading">

                <div>
                    <h2 id="employee-heading">
                        Employees
                    </h2>

                    <p>
                        Click an employee to view
                        complete details.
                    </p>
                </div>

                <span
                    id="employee-count"
                    class="employee-count"
                ></span>

            </div>

            <div
                id="employee-list"
                class="employee-list"
            >
                <div class="loading-state">

                    <div class="spinner"></div>

                    <p>
                        Loading employees...
                    </p>

                </div>
            </div>

        </section>

    </main>

    <div
        id="employee-modal"
        class="modal hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >

        <div
            class="modal-overlay"
            id="modal-overlay"
        ></div>

        <div class="modal-content">

            <button
                id="modal-close"
                class="modal-close"
                type="button"
                aria-label="Close employee details"
            >
                ×
            </button>

            <div id="modal-body"></div>

        </div>

    </div>
`;

/* ================================
   THEME BUTTON
================================ */

const themeToggle =
    document.querySelector('#theme-toggle');

themeToggle.addEventListener(
    'click',
    toggleTheme
);

applyTheme();

/* ================================
   SEARCH
================================ */

const searchInput =
    document.querySelector('#search-input');

searchInput.addEventListener(
    'input',
    (event) => {
        searchEmployees(
            event.target.value
        );
    }
);

/* ================================
   DEPARTMENT FILTER
================================ */

const departmentFilter =
    document.querySelector(
        '#department-filter'
    );

departmentFilter.addEventListener(
    'change',
    (event) => {
        currentDepartment =
            event.target.value;

        applyFilters();
    }
);

/* ================================
   SORT
================================ */

const sortSelect =
    document.querySelector('#sort-select');

sortSelect.addEventListener(
    'change',
    (event) => {
        currentSort =
            event.target.value;

        applyFilters();
    }
);

/* ================================
   EMPLOYEE COUNT
================================ */

const employeeList =
    document.querySelector('#employee-list');

employeeList.addEventListener(
    'click',
    (event) => {

        /* Favorite button */

        const favoriteButton =
            event.target.closest(
                '.favorite-btn'
            );

        if (favoriteButton) {
            event.stopPropagation();

            const employeeId =
                favoriteButton.dataset.id;

            toggleFavorite(employeeId);

            return;
        }

        /* Employee card */

        const employeeCard =
            event.target.closest(
                '.employee-card'
            );

        if (!employeeCard) {
            return;
        }

        const employeeId =
            employeeCard.dataset.id;

        openEmployeeModal(employeeId);
    }
);

/* ================================
   MODAL
================================ */

const modal =
    document.querySelector(
        '#employee-modal'
    );

const modalClose =
    document.querySelector(
        '#modal-close'
    );

const modalOverlay =
    document.querySelector(
        '#modal-overlay'
    );

modalClose.addEventListener(
    'click',
    closeEmployeeModal
);

modalOverlay.addEventListener(
    'click',
    closeEmployeeModal
);

document.addEventListener(
    'keydown',
    (event) => {

        if (
            event.key === 'Escape' &&
            !modal.classList.contains('hidden')
        ) {
            closeEmployeeModal();
        }

    }
);

/* ================================
   START APPLICATION
================================ */

loadEmployees();