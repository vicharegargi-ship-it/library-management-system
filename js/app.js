/**
 * Library Management System - Frontend Controller
 * Connects GUI actions to LibraryDBMS and renders responsive views
 */

// Initialize Database Instance
const db = new LibraryDBMS();

// Global UI State
const state = {
    currentTab: 'dashboard',
    bookSearch: '',
    bookGenreFilter: 'ALL',
    bookSort: 'title_asc',
    memberSearch: '',
    memberDeptFilter: 'ALL',
    borrowingFilter: 'ALL', // ALL, ACTIVE, RETURNED, OVERDUE
    sqlHistory: [],
    genreChart: null,
    statusChart: null,
    isPostgresConnected: false,
    postgresConfig: null
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSimulatedDate();
    initModals();
    initSQLConsole();
    checkPostgresStatus();
    renderAll();

    // Keyboard shortcut for SQL execution: Ctrl+Enter or Cmd+Enter
    const sqlTextarea = document.getElementById('sql-query-input');
    if (sqlTextarea) {
        sqlTextarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                executeCurrentSQL();
            }
        });
    }
});

// Toast notification helper
function showToast(title, message, type = 'info', sql = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = '<i class="fa-solid fa-circle-info text-blue-400"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check text-emerald-400"></i>';
    if (type === 'danger') icon = '<i class="fa-solid fa-circle-exclamation text-rose-400"></i>';
    if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation text-amber-400"></i>';

    let sqlHtml = '';
    if (sql) {
        sqlHtml = `<div class="mt-2 text-xs font-mono bg-slate-950 p-2 rounded text-emerald-400 border border-slate-800 overflow-x-auto whitespace-pre-wrap">${escapeHtml(sql)}</div>`;
    }

    toast.innerHTML = `
        <div class="text-lg pt-0.5">${icon}</div>
        <div class="flex-1">
            <h4 class="font-semibold text-sm text-slate-100">${escapeHtml(title)}</h4>
            <p class="text-xs text-slate-300 mt-0.5">${escapeHtml(message)}</p>
            ${sqlHtml}
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white text-xs ml-2">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 6000);
}

// Navigation Tab Switcher
function initNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    state.currentTab = tabId;

    // Update buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab content panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        if (pane.id === `tab-${tabId}`) {
            pane.classList.remove('hidden');
        } else {
            pane.classList.add('hidden');
        }
    });

    // Trigger specific render if needed
    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'books') renderBooks();
    if (tabId === 'members') renderMembers();
    if (tabId === 'borrowings') renderBorrowings();
    if (tabId === 'overdue') renderOverdue();
    if (tabId === 'schema') renderSchema();
}

// Simulated Current Date Picker & Controls
function initSimulatedDate() {
    const dateInput = document.getElementById('simulated-date-input');
    const displaySpan = document.getElementById('current-date-badge');

    if (dateInput) {
        dateInput.value = db.getSimulatedCurrentDate();
        dateInput.addEventListener('change', (e) => {
            if (e.target.value) {
                db.setSimulatedCurrentDate(e.target.value);
                if (displaySpan) displaySpan.textContent = e.target.value;
                showToast('System Date Changed', `Simulation current date updated to ${e.target.value}. Overdue statuses re-calculated.`, 'info');
                renderAll();
            }
        });
    }

    if (displaySpan) {
        displaySpan.textContent = db.getSimulatedCurrentDate();
    }
}

function resetDatabaseToSeed() {
    if (confirm('Are you sure you want to reset the database back to original sample data? Any new books or borrowings created during testing will be reset.')) {
        db.resetDatabase();
        showToast('Database Reset', 'Successfully restored all 10 Books, 10 Members, and 15 Borrowings.', 'success');
        renderAll();
    }
}

// Export Database as SQL Dump
function exportSQLDump() {
    const data = db.data;
    let sql = `-- ========================================================\n`;
    sql += `-- Library Management System Database Export\n`;
    sql += `-- Generated on: ${new Date().toISOString()}\n`;
    sql += `-- Simulated Current Date: ${db.getSimulatedCurrentDate()}\n`;
    sql += `-- ========================================================\n\n`;

    sql += `-- Table 1: Books\n`;
    data.books.forEach(b => {
        sql += `INSERT INTO Books (title, author, genre, quantity, available_copies) VALUES ('${b.title.replace(/'/g, "''")}', '${b.author.replace(/'/g, "''")}', '${b.genre}', ${b.quantity}, ${b.available_copies});\n`;
    });

    sql += `\n-- Table 2: Members\n`;
    data.members.forEach(m => {
        sql += `INSERT INTO Members (name, email, phone, department) VALUES ('${m.name.replace(/'/g, "''")}', '${m.email}', '${m.phone}', '${m.department}');\n`;
    });

    sql += `\n-- Table 3: Borrowings\n`;
    data.borrowings.forEach(br => {
        const retDate = br.return_date ? `'${br.return_date}'` : 'NULL';
        sql += `INSERT INTO Borrowings (book_id, member_id, borrow_date, due_date, return_date) VALUES (${br.book_id}, ${br.member_id}, '${br.borrow_date}', '${br.due_date}', ${retDate});\n`;
    });

    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library_management_dump_${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('SQL Dump Exported', 'Downloaded library database SQL file.', 'success');
}

// Render Master Coordinator
function renderAll() {
    renderDashboard();
    renderBooks();
    renderMembers();
    renderBorrowings();
    renderOverdue();
    populateSelectDropdowns();
}

// -----------------------------------------------------------------------------
// 1. DASHBOARD VIEW
// -----------------------------------------------------------------------------
function renderDashboard() {
    const stats = db.getSummaryStats();
    const overdueList = db.getOverdueReport();

    document.getElementById('stat-total-books').textContent = stats.totalBooks;
    document.getElementById('stat-unique-titles').textContent = `${stats.uniqueTitles} Titles`;
    document.getElementById('stat-available-copies').textContent = stats.availableCopies;
    document.getElementById('stat-total-members').textContent = stats.totalMembers;
    document.getElementById('stat-active-borrowings').textContent = stats.activeBorrowings;
    document.getElementById('stat-overdue-count').textContent = stats.overdueCount;

    // Overdue banner in dashboard
    const banner = document.getElementById('dashboard-overdue-banner');
    if (banner) {
        if (stats.overdueCount > 0) {
            banner.classList.remove('hidden');
            document.getElementById('dashboard-overdue-text').textContent = 
                `Attention: There are ${stats.overdueCount} book(s) currently overdue as of ${db.getSimulatedCurrentDate()}!`;
        } else {
            banner.classList.add('hidden');
        }
    }

    // Render Recent Borrowings table on dashboard
    const recentBorrowings = db.getBorrowings().slice(-5).reverse();
    const recentTableBody = document.getElementById('dashboard-recent-table-body');
    if (recentTableBody) {
        if (recentBorrowings.length === 0) {
            recentTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate-400">No borrowings found.</td></tr>`;
        } else {
            recentTableBody.innerHTML = recentBorrowings.map(b => {
                let statusBadge = '<span class="badge badge-success"><i class="fa-solid fa-check"></i> Returned</span>';
                if (!b.is_returned) {
                    if (b.is_overdue) {
                        statusBadge = '<span class="badge badge-danger"><i class="fa-solid fa-circle-exclamation"></i> Overdue</span>';
                    } else {
                        statusBadge = '<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Active Loan</span>';
                    }
                }
                return `
                    <tr>
                        <td class="font-medium text-slate-800">${escapeHtml(b.book_title)}</td>
                        <td class="text-slate-600">${escapeHtml(b.member_name)}</td>
                        <td class="font-mono text-xs text-slate-500">${b.borrow_date}</td>
                        <td class="font-mono text-xs text-slate-500">${b.due_date}</td>
                        <td>${statusBadge}</td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Render Charts if Chart.js is loaded
    if (typeof Chart !== 'undefined') {
        renderCharts(stats);
    }
}

function renderCharts(stats) {
    // 1. Genre Distribution Chart
    const genreCtx = document.getElementById('chart-genres');
    if (genreCtx) {
        const labels = Object.keys(stats.genres);
        const data = Object.values(stats.genres);

        if (state.genreChart) {
            state.genreChart.destroy();
        }

        state.genreChart = new Chart(genreCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // 2. Loan Status Chart
    const statusCtx = document.getElementById('chart-status');
    if (statusCtx) {
        const returned = db.data.borrowings.filter(b => b.return_date !== null && b.return_date !== '').length;
        const active = stats.activeBorrowings - stats.overdueCount;
        const overdue = stats.overdueCount;

        if (state.statusChart) {
            state.statusChart.destroy();
        }

        state.statusChart = new Chart(statusCtx, {
            type: 'bar',
            data: {
                labels: ['Returned', 'Active Loan', 'Overdue'],
                datasets: [{
                    label: 'Borrowings Count',
                    data: [returned, active, overdue],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 2 }
                    }
                }
            }
        });
    }
}

// -----------------------------------------------------------------------------
// 2. BOOKS MANAGEMENT VIEW
// -----------------------------------------------------------------------------
function renderBooks() {
    const books = db.getBooks();
    const genreSelect = document.getElementById('book-genre-filter');
    const sortSelect = document.getElementById('book-sort-select');
    const searchInput = document.getElementById('book-search-input');

    if (searchInput) state.bookSearch = searchInput.value.toLowerCase().trim();
    if (genreSelect) state.bookGenreFilter = genreSelect.value;
    if (sortSelect) state.bookSort = sortSelect.value;

    // Filter
    let filtered = books.filter(b => {
        const matchesSearch = b.title.toLowerCase().includes(state.bookSearch) ||
                              b.author.toLowerCase().includes(state.bookSearch) ||
                              b.genre.toLowerCase().includes(state.bookSearch);
        const matchesGenre = state.bookGenreFilter === 'ALL' || b.genre === state.bookGenreFilter;
        return matchesSearch && matchesGenre;
    });

    // Sort
    filtered.sort((a, b) => {
        if (state.bookSort === 'title_asc') return a.title.localeCompare(b.title);
        if (state.bookSort === 'title_desc') return b.title.localeCompare(a.title);
        if (state.bookSort === 'qty_desc') return b.quantity - a.quantity;
        if (state.bookSort === 'avail_desc') return b.available_copies - a.available_copies;
        return 0;
    });

    const tbody = document.getElementById('books-table-body');
    const counter = document.getElementById('books-count-badge');
    if (counter) counter.textContent = `${filtered.length} of ${books.length} Books`;

    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">No books found matching criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(b => {
        const availPercent = Math.round((b.available_copies / b.quantity) * 100);
        const isOutOfStock = b.available_copies === 0;

        let statusBadge = isOutOfStock
            ? `<span class="badge badge-danger"><span class="pulse-dot pulse-dot-red"></span> Out of Stock</span>`
            : `<span class="badge badge-success"><span class="pulse-dot pulse-dot-green"></span> ${b.available_copies} Available</span>`;

        return `
            <tr>
                <td class="font-mono text-xs font-semibold text-slate-500">#${b.book_id}</td>
                <td>
                    <div class="font-bold text-slate-900">${escapeHtml(b.title)}</div>
                    <div class="text-xs text-slate-500">by ${escapeHtml(b.author)}</div>
                </td>
                <td>
                    <span class="badge badge-secondary">${escapeHtml(b.genre)}</span>
                </td>
                <td class="font-mono text-center font-medium">${b.quantity}</td>
                <td>
                    <div class="flex items-center gap-2">
                        <span class="font-mono font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}">${b.available_copies}</span>
                        <div class="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div class="${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'} h-1.5 rounded-full" style="width: ${availPercent}%"></div>
                        </div>
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td class="text-right">
                    <div class="flex items-center justify-end gap-1">
                        <button onclick="openIssueBookModal(${b.book_id})" ${isOutOfStock ? 'disabled' : ''} class="p-1.5 px-2.5 text-xs font-medium rounded-lg ${isOutOfStock ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition">
                            <i class="fa-solid fa-hand-holding-hand mr-1"></i> Issue
                        </button>
                        <button onclick="openEditBookModal(${b.book_id})" class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Book">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="handleDeleteBook(${b.book_id})" class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Book">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// -----------------------------------------------------------------------------
// 3. MEMBERS DIRECTORY VIEW
// -----------------------------------------------------------------------------
function renderMembers() {
    const members = db.getMembers();
    const borrowings = db.getBorrowings();
    const searchInput = document.getElementById('member-search-input');
    const deptSelect = document.getElementById('member-dept-filter');

    if (searchInput) state.memberSearch = searchInput.value.toLowerCase().trim();
    if (deptSelect) state.memberDeptFilter = deptSelect.value;

    let filtered = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(state.memberSearch) ||
                              m.email.toLowerCase().includes(state.memberSearch) ||
                              (m.phone && m.phone.includes(state.memberSearch)) ||
                              m.department.toLowerCase().includes(state.memberSearch);
        const matchesDept = state.memberDeptFilter === 'ALL' || m.department === state.memberDeptFilter;
        return matchesSearch && matchesDept;
    });

    const tbody = document.getElementById('members-table-body');
    const counter = document.getElementById('members-count-badge');
    if (counter) counter.textContent = `${filtered.length} of ${members.length} Members`;

    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">No members found matching criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(m => {
        const memberLoans = borrowings.filter(b => b.member_id === m.member_id);
        const activeLoans = memberLoans.filter(b => !b.is_returned);
        const hasOverdue = activeLoans.some(b => b.is_overdue);

        return `
            <tr>
                <td class="font-mono text-xs font-semibold text-slate-500">#${m.member_id}</td>
                <td>
                    <div class="font-bold text-slate-900">${escapeHtml(m.name)}</div>
                    <div class="text-xs text-slate-500">${escapeHtml(m.email)}</div>
                </td>
                <td class="font-mono text-xs text-slate-600">${escapeHtml(m.phone || 'N/A')}</td>
                <td>
                    <span class="badge badge-primary">${escapeHtml(m.department)}</span>
                </td>
                <td>
                    <div class="flex items-center gap-1.5">
                        <span class="font-mono font-semibold ${activeLoans.length > 0 ? 'text-indigo-600' : 'text-slate-400'}">${activeLoans.length} active</span>
                        ${hasOverdue ? '<span class="badge badge-danger text-[10px]"><i class="fa-solid fa-triangle-exclamation"></i> Overdue</span>' : ''}
                    </div>
                </td>
                <td class="text-right">
                    <div class="flex items-center justify-end gap-1">
                        <button onclick="openEditMemberModal(${m.member_id})" class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Member">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="handleDeleteMember(${m.member_id})" class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Member">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// -----------------------------------------------------------------------------
// 4. BORROWINGS MANAGEMENT VIEW
// -----------------------------------------------------------------------------
function renderBorrowings() {
    const borrowings = db.getBorrowings();
    const filterSelect = document.getElementById('borrowing-filter-select');
    if (filterSelect) state.borrowingFilter = filterSelect.value;

    let filtered = borrowings.filter(b => {
        if (state.borrowingFilter === 'ACTIVE') return !b.is_returned;
        if (state.borrowingFilter === 'RETURNED') return b.is_returned;
        if (state.borrowingFilter === 'OVERDUE') return b.is_overdue;
        return true;
    });

    // Sort active and overdue first
    filtered.sort((a, b) => {
        if (!a.is_returned && b.is_returned) return -1;
        if (a.is_returned && !b.is_returned) return 1;
        return b.borrow_id - a.borrow_id;
    });

    const tbody = document.getElementById('borrowings-table-body');
    const counter = document.getElementById('borrowings-count-badge');
    if (counter) counter.textContent = `${filtered.length} of ${borrowings.length} Records`;

    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">No borrowing records match the selected filter.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(b => {
        let statusBadge = '<span class="badge badge-success"><i class="fa-solid fa-check"></i> Returned</span>';
        let actionBtn = `<span class="text-xs text-slate-400 font-mono">${b.return_date}</span>`;

        if (!b.is_returned) {
            if (b.is_overdue) {
                statusBadge = '<span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> Overdue</span>';
            } else {
                statusBadge = '<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Active Loan</span>';
            }
            actionBtn = `
                <button onclick="handleReturnBook(${b.borrow_id})" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition">
                    <i class="fa-solid fa-arrow-rotate-left mr-1"></i> Return
                </button>
            `;
        }

        return `
            <tr class="${b.is_overdue ? 'bg-rose-50/40' : ''}">
                <td class="font-mono text-xs font-semibold text-slate-500">#${b.borrow_id}</td>
                <td>
                    <div class="font-bold text-slate-900">${escapeHtml(b.book_title)}</div>
                    <div class="text-xs text-slate-500 font-mono">Book ID: #${b.book_id}</div>
                </td>
                <td>
                    <div class="font-semibold text-slate-800">${escapeHtml(b.member_name)}</div>
                    <div class="text-xs text-slate-500">${escapeHtml(b.member_department)}</div>
                </td>
                <td class="font-mono text-xs text-slate-600">${b.borrow_date}</td>
                <td class="font-mono text-xs font-semibold ${b.is_overdue ? 'text-rose-600' : 'text-slate-600'}">${b.due_date}</td>
                <td>${statusBadge}</td>
                <td class="text-right">${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

// -----------------------------------------------------------------------------
// 5. OVERDUE REPORT VIEW (Query 7 Dedicated UI)
// -----------------------------------------------------------------------------
function renderOverdue() {
    const overdueList = db.getOverdueReport();
    const tbody = document.getElementById('overdue-table-body');
    const counter = document.getElementById('overdue-report-badge');
    const emptyState = document.getElementById('overdue-empty-state');
    const tableContainer = document.getElementById('overdue-table-container');

    if (counter) counter.textContent = `${overdueList.length} Overdue Loans`;

    if (!tbody) return;

    if (overdueList.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (tableContainer) tableContainer.classList.add('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');

    tbody.innerHTML = overdueList.map(o => {
        return `
            <tr class="bg-rose-50/50">
                <td class="font-mono text-xs font-semibold text-slate-500">#${o.borrow_id}</td>
                <td>
                    <div class="font-bold text-slate-900">${escapeHtml(o.title)}</div>
                </td>
                <td>
                    <div class="font-bold text-slate-900">${escapeHtml(o.member_name)}</div>
                    <div class="text-xs text-slate-500">${escapeHtml(o.email)} &bull; ${escapeHtml(o.phone)}</div>
                </td>
                <td class="font-mono text-xs text-slate-600">${o.borrow_date}</td>
                <td class="font-mono text-xs font-bold text-rose-600">${o.due_date}</td>
                <td>
                    <span class="badge badge-danger">
                        <i class="fa-solid fa-clock"></i> ${o.days_overdue} Day${o.days_overdue > 1 ? 's' : ''} Late
                    </span>
                </td>
                <td class="text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="sendOverdueNotice('${escapeHtml(o.member_name)}', '${escapeHtml(o.email)}', '${escapeHtml(o.title)}')" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold transition" title="Send Email Reminder">
                            <i class="fa-solid fa-envelope mr-1"></i> Remind
                        </button>
                        <button onclick="handleReturnBook(${o.borrow_id})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition">
                            <i class="fa-solid fa-check mr-1"></i> Return
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function sendOverdueNotice(name, email, bookTitle) {
    showToast(
        'Overdue Reminder Sent',
        `Notification email simulated to ${name} (${email}) for unreturned book "${bookTitle}".`,
        'success'
    );
}

// -----------------------------------------------------------------------------
// 6. SQL CONSOLE & PRACTICE QUERIES VIEW
// -----------------------------------------------------------------------------
function initSQLConsole() {
    // Populate query dropdown / list from queries.js
    const listContainer = document.getElementById('practice-queries-list');
    if (!listContainer || typeof PRACTICE_QUERIES === 'undefined') return;

    listContainer.innerHTML = PRACTICE_QUERIES.map((q, idx) => {
        return `
            <div onclick="loadPracticeQuery('${q.id}')" class="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-lg cursor-pointer transition flex items-start justify-between group">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">${escapeHtml(q.category)}</span>
                    </div>
                    <h5 class="text-sm font-bold text-slate-800 mt-0.5 group-hover:text-indigo-600 transition">${escapeHtml(q.title)}</h5>
                    <p class="text-xs text-slate-500 mt-1 line-clamp-1">${escapeHtml(q.description)}</p>
                </div>
                <button class="text-slate-400 group-hover:text-indigo-600 text-sm mt-1 transition">
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        `;
    }).join('');

    // Pre-load Query 1 by default
    loadPracticeQuery('q1_all_books');
}

function loadPracticeQuery(id) {
    const q = PRACTICE_QUERIES.find(item => item.id === id);
    if (!q) return;

    const textarea = document.getElementById('sql-query-input');
    const titleEl = document.getElementById('sql-query-title');
    const explanationEl = document.getElementById('sql-query-explanation');

    if (textarea) textarea.value = q.sql;
    if (titleEl) titleEl.textContent = q.title;
    if (explanationEl) {
        explanationEl.innerHTML = `<i class="fa-solid fa-lightbulb text-amber-500 mr-1.5"></i><strong>DBMS Concept:</strong> ${escapeHtml(q.explanation)}`;
        explanationEl.classList.remove('hidden');
    }
}

async function executeCurrentSQL() {
    const textarea = document.getElementById('sql-query-input');
    if (!textarea) return;

    const sql = textarea.value.trim();
    if (!sql) {
        showToast('Empty SQL', 'Please enter or select a SQL statement to execute.', 'warning');
        return;
    }

    // If PostgreSQL is connected, execute directly on PostgreSQL!
    if (state.isPostgresConnected) {
        try {
            const res = await fetch('/api/db/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql })
            });
            const data = await res.json();
            renderSQLResults(data, sql);

            if (/^\s*(INSERT|UPDATE|DELETE)/i.test(sql)) {
                await syncDataFromPostgres();
            }
            return;
        } catch (err) {
            console.warn('Postgres query failed, falling back to local engine:', err);
        }
    }

    // Default to local relational engine
    const res = db.executeSQL(sql);
    renderSQLResults(res, sql);

    // If query was an INSERT, UPDATE, or DELETE, refresh other UI panes
    if (/^\s*(INSERT|UPDATE|DELETE)/i.test(sql)) {
        renderAll();
    }
}

// -----------------------------------------------------------------------------
// POSTGRESQL INTEGRATION HANDLERS
// -----------------------------------------------------------------------------
async function checkPostgresStatus() {
    try {
        const res = await fetch('/api/db/status');
        if (!res.ok) return;
        const data = await res.json();
        state.isPostgresConnected = data.connected;
        state.postgresConfig = data;
        updatePostgresUI(data);

        if (data.connected) {
            await syncDataFromPostgres();
        }
    } catch (e) {
        // Server might be in standalone file:// mode
        updatePostgresUI({ connected: false, standalone: true });
    }
}

function updatePostgresUI(status) {
    const dot = document.getElementById('pg-status-dot');
    const label = document.getElementById('pg-status-label');
    const btn = document.getElementById('pg-status-btn');

    if (!dot || !label) return;

    if (status.connected) {
        dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400';
        label.innerHTML = `<span class="text-emerald-700 font-bold">PostgreSQL: Connected</span>`;
        if (btn) btn.className = 'flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 hover:bg-emerald-100 shadow-sm transition';
    } else {
        dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400';
        label.innerHTML = `<span class="text-slate-600 font-medium">PostgreSQL: Disconnected</span>`;
        if (btn) btn.className = 'flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-brand-500 hover:bg-indigo-50/50 shadow-sm transition';
    }
}

async function syncDataFromPostgres() {
    if (!state.isPostgresConnected) return;
    try {
        const res = await fetch('/api/db/data');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
            db.data.books = data.books.map(b => ({
                book_id: b.book_id,
                title: b.title,
                author: b.author,
                genre: b.genre,
                quantity: Number(b.quantity),
                available_copies: Number(b.available_copies)
            }));
            db.data.members = data.members.map(m => ({
                member_id: m.member_id,
                name: m.name,
                email: m.email,
                phone: m.phone,
                department: m.department
            }));
            db.data.borrowings = data.borrowings.map(br => ({
                borrow_id: br.borrow_id,
                book_id: br.book_id,
                member_id: br.member_id,
                borrow_date: br.borrow_date ? new Date(br.borrow_date).toISOString().slice(0, 10) : '',
                due_date: br.due_date ? new Date(br.due_date).toISOString().slice(0, 10) : '',
                return_date: br.return_date ? new Date(br.return_date).toISOString().slice(0, 10) : null
            }));
            db.save();
            renderAll();
        }
    } catch (e) {
        console.warn('Failed to sync from PostgreSQL:', e);
    }
}

function openPostgresModal() {
    const modal = document.getElementById('postgres-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const msg = document.getElementById('pg-connect-msg');
    if (msg) msg.classList.add('hidden');
}

function togglePasswordVisibility(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
}

async function handleConnectPostgres(e) {
    e.preventDefault();
    const host = document.getElementById('pg-form-host').value;
    const port = parseInt(document.getElementById('pg-form-port').value, 10);
    const database = document.getElementById('pg-form-db').value;
    const user = document.getElementById('pg-form-user').value;
    const password = document.getElementById('pg-form-password').value;

    const msg = document.getElementById('pg-connect-msg');
    const submitBtn = document.getElementById('pg-submit-btn');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Connecting...`;
    }

    try {
        const res = await fetch('/api/db/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host, port, database, user, password })
        });
        const data = await res.json();

        if (data.success) {
            state.isPostgresConnected = true;
            updatePostgresUI({ connected: true });
            if (msg) {
                msg.className = 'text-xs p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 block';
                msg.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 mr-1"></i> ${escapeHtml(data.message)}`;
            }
            showToast('PostgreSQL Connected', `Connected to PostgreSQL database "${database}".`, 'success');
            await syncDataFromPostgres();
            setTimeout(() => closeAllModals(), 1200);
        } else {
            throw new Error(data.message || 'Connection failed.');
        }
    } catch (err) {
        if (msg) {
            msg.className = 'text-xs p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 block';
            msg.innerHTML = `<i class="fa-solid fa-circle-exclamation text-rose-600 mr-1"></i> ${escapeHtml(err.message)}`;
        }
        showToast('Connection Error', err.message, 'danger');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-plug"></i> Test & Connect`;
        }
    }
}

async function handleSeedPostgres() {
    if (!state.isPostgresConnected) {
        alert('Please connect to PostgreSQL first before seeding.');
        return;
    }

    if (confirm('Re-run schema_and_seed.sql on PostgreSQL? This will ensure all 3 tables (Books, Members, Borrowings) and default records are created in your PostgreSQL database.')) {
        try {
            const res = await fetch('/api/db/seed', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast('PostgreSQL Seeded', 'Database tables and sample data populated successfully in PostgreSQL.', 'success');
                await syncDataFromPostgres();
            } else {
                alert('Seeding error: ' + data.message);
            }
        } catch (e) {
            alert('Failed to seed: ' + e.message);
        }
    }
}

function renderSQLResults(res, executedSql) {
    const container = document.getElementById('sql-results-container');
    const metaEl = document.getElementById('sql-results-meta');

    if (!container) return;

    if (!res.success) {
        container.innerHTML = `
            <div class="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                <div class="flex items-center gap-2 font-bold mb-1">
                    <i class="fa-solid fa-circle-exclamation text-rose-600"></i> SQL Execution Error
                </div>
                <div class="text-sm font-mono bg-rose-100/60 p-3 rounded-lg border border-rose-200">${escapeHtml(res.message)}</div>
            </div>
        `;
        if (metaEl) metaEl.textContent = `Error (${res.executionTimeMs}ms)`;
        return;
    }

    if (metaEl) {
        metaEl.textContent = `${res.rowCount !== undefined ? res.rowCount : res.rows.length} row(s) returned in ${res.executionTimeMs}ms`;
    }

    if (!res.columns || res.columns.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-500">Query returned 0 columns.</div>`;
        return;
    }

    let headerHtml = res.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('');
    let bodyHtml = '';

    if (!res.rows || res.rows.length === 0) {
        bodyHtml = `<tr><td colspan="${res.columns.length}" class="text-center py-6 text-slate-400">0 rows returned (Empty result set)</td></tr>`;
    } else {
        bodyHtml = res.rows.map(row => {
            const cells = row.map(cell => {
                const val = cell === null || cell === undefined ? 'NULL' : cell;
                const isNull = val === 'NULL';
                return `<td class="${isNull ? 'font-mono text-slate-400 italic' : ''}">${escapeHtml(String(val))}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
    }

    container.innerHTML = `
        <div class="custom-table-container max-h-[420px]">
            <table class="custom-table">
                <thead>
                    <tr>${headerHtml}</tr>
                </thead>
                <tbody>
                    ${bodyHtml}
                </tbody>
            </table>
        </div>
    `;
}

// -----------------------------------------------------------------------------
// 7. SCHEMA & ERD EXPLORER VIEW
// -----------------------------------------------------------------------------
function renderSchema() {
    // Schema view is primarily static descriptive documentation of the 3 tables,
    // their constraints, and relationships. Handled in HTML template.
}

// -----------------------------------------------------------------------------
// 8. MODALS & CRUD FORMS
// -----------------------------------------------------------------------------
function initModals() {
    // Backdrop click closes open modal
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
}

// Populate Member & Book dropdowns for the Issue Book modal
function populateSelectDropdowns() {
    const memberSelect = document.getElementById('issue-member-select');
    const bookSelect = document.getElementById('issue-book-select');

    if (memberSelect) {
        const members = db.getMembers();
        memberSelect.innerHTML = `<option value="">-- Select Library Member --</option>` +
            members.map(m => `<option value="${m.member_id}">${escapeHtml(m.name)} (${escapeHtml(m.department)})</option>`).join('');
    }

    if (bookSelect) {
        const books = db.getBooks();
        bookSelect.innerHTML = `<option value="">-- Select Book to Issue --</option>` +
            books.map(b => {
                const disabled = b.available_copies <= 0 ? 'disabled' : '';
                const stockLabel = b.available_copies > 0 ? `${b.available_copies} in stock` : 'OUT OF STOCK';
                return `<option value="${b.book_id}" ${disabled}>${escapeHtml(b.title)} [${stockLabel}]</option>`;
            }).join('');
    }

    // Also populate genre filter in books tab
    const genreFilter = document.getElementById('book-genre-filter');
    if (genreFilter) {
        const currentVal = genreFilter.value;
        const genres = Array.from(new Set(db.getBooks().map(b => b.genre))).sort();
        genreFilter.innerHTML = `<option value="ALL">All Genres</option>` +
            genres.map(g => `<option value="${g}">${g}</option>`).join('');
        if (currentVal && genres.includes(currentVal)) {
            genreFilter.value = currentVal;
        }
    }

    // Populate department filter in members tab
    const deptFilter = document.getElementById('member-dept-filter');
    if (deptFilter) {
        const currentVal = deptFilter.value;
        const depts = Array.from(new Set(db.getMembers().map(m => m.department))).sort();
        deptFilter.innerHTML = `<option value="ALL">All Departments</option>` +
            depts.map(d => `<option value="${d}">${d}</option>`).join('');
        if (currentVal && depts.includes(currentVal)) {
            deptFilter.value = currentVal;
        }
    }
}

// Add / Edit Book Modal
function openAddBookModal() {
    document.getElementById('book-modal-title').textContent = 'Add New Book';
    document.getElementById('book-modal-id').value = '';
    document.getElementById('book-form-title').value = '';
    document.getElementById('book-form-author').value = '';
    document.getElementById('book-form-genre').value = '';
    document.getElementById('book-form-quantity').value = '5';
    document.getElementById('book-form-available').value = '5';
    document.getElementById('book-modal').classList.remove('hidden');
}

function openEditBookModal(bookId) {
    const book = db.getBook(bookId);
    if (!book) return;

    document.getElementById('book-modal-title').textContent = `Edit Book #${book.book_id}`;
    document.getElementById('book-modal-id').value = book.book_id;
    document.getElementById('book-form-title').value = book.title;
    document.getElementById('book-form-author').value = book.author;
    document.getElementById('book-form-genre').value = book.genre;
    document.getElementById('book-form-quantity').value = book.quantity;
    document.getElementById('book-form-available').value = book.available_copies;
    document.getElementById('book-modal').classList.remove('hidden');
}

function handleSaveBook(e) {
    e.preventDefault();
    const id = document.getElementById('book-modal-id').value;
    const title = document.getElementById('book-form-title').value;
    const author = document.getElementById('book-form-author').value;
    const genre = document.getElementById('book-form-genre').value;
    const quantity = document.getElementById('book-form-quantity').value;
    const available_copies = document.getElementById('book-form-available').value;

    try {
        if (id) {
            const res = db.updateBook(id, { title, author, genre, quantity, available_copies });
            showToast('Book Updated', `"${title}" updated successfully.`, 'success', res.sql);
        } else {
            const res = db.addBook({ title, author, genre, quantity, available_copies });
            showToast('Book Added', `"${title}" inserted into Books table.`, 'success', res.sql);
        }
        closeAllModals();
        renderAll();
    } catch (err) {
        alert(err.message);
    }
}

function handleDeleteBook(bookId) {
    const book = db.getBook(bookId);
    if (!book) return;

    if (confirm(`Are you sure you want to delete "${book.title}" (Book ID: #${bookId})?`)) {
        try {
            const res = db.deleteBook(bookId);
            showToast('Book Deleted', `Deleted "${book.title}".`, 'success', res.sql);
            renderAll();
        } catch (err) {
            alert(err.message);
        }
    }
}

// Add / Edit Member Modal
function openAddMemberModal() {
    document.getElementById('member-modal-title').textContent = 'Register New Member';
    document.getElementById('member-modal-id').value = '';
    document.getElementById('member-form-name').value = '';
    document.getElementById('member-form-email').value = '';
    document.getElementById('member-form-phone').value = '';
    document.getElementById('member-form-dept').value = 'Computer Engineering';
    document.getElementById('member-modal').classList.remove('hidden');
}

function openEditMemberModal(memberId) {
    const member = db.getMember(memberId);
    if (!member) return;

    document.getElementById('member-modal-title').textContent = `Edit Member #${member.member_id}`;
    document.getElementById('member-modal-id').value = member.member_id;
    document.getElementById('member-form-name').value = member.name;
    document.getElementById('member-form-email').value = member.email;
    document.getElementById('member-form-phone').value = member.phone;
    document.getElementById('member-form-dept').value = member.department;
    document.getElementById('member-modal').classList.remove('hidden');
}

function handleSaveMember(e) {
    e.preventDefault();
    const id = document.getElementById('member-modal-id').value;
    const name = document.getElementById('member-form-name').value;
    const email = document.getElementById('member-form-email').value;
    const phone = document.getElementById('member-form-phone').value;
    const department = document.getElementById('member-form-dept').value;

    try {
        if (id) {
            const res = db.updateMember(id, { name, email, phone, department });
            showToast('Member Updated', `${name}'s profile updated.`, 'success', res.sql);
        } else {
            const res = db.addMember({ name, email, phone, department });
            showToast('Member Registered', `${name} added to Members table.`, 'success', res.sql);
        }
        closeAllModals();
        renderAll();
    } catch (err) {
        alert(err.message);
    }
}

function handleDeleteMember(memberId) {
    const member = db.getMember(memberId);
    if (!member) return;

    if (confirm(`Are you sure you want to remove member "${member.name}"?`)) {
        try {
            const res = db.deleteMember(memberId);
            showToast('Member Deleted', `Member #${memberId} removed.`, 'success', res.sql);
            renderAll();
        } catch (err) {
            alert(err.message);
        }
    }
}

// Issue / Borrow Book Modal
function openIssueBookModal(preselectedBookId = null) {
    populateSelectDropdowns();
    const bookSelect = document.getElementById('issue-book-select');
    if (preselectedBookId && bookSelect) {
        bookSelect.value = preselectedBookId;
    }

    const todayStr = db.getSimulatedCurrentDate();
    const borrowDateInput = document.getElementById('issue-borrow-date');
    const dueDateInput = document.getElementById('issue-due-date');

    if (borrowDateInput) borrowDateInput.value = todayStr;

    // Default due date +10 days
    if (dueDateInput) {
        const d = new Date(todayStr);
        d.setDate(d.getDate() + 10);
        dueDateInput.value = d.toISOString().slice(0, 10);
    }

    document.getElementById('issue-modal').classList.remove('hidden');
}

function handleIssueBook(e) {
    e.preventDefault();
    const book_id = document.getElementById('issue-book-select').value;
    const member_id = document.getElementById('issue-member-select').value;
    const borrow_date = document.getElementById('issue-borrow-date').value;
    const due_date = document.getElementById('issue-due-date').value;

    try {
        const res = db.borrowBook({ book_id, member_id, borrow_date, due_date });
        const book = db.getBook(book_id);
        const member = db.getMember(member_id);
        showToast(
            'Book Issued Successfully',
            `"${book.title}" loaned to ${member.name}. Due on ${due_date}.`,
            'success',
            res.sql
        );
        closeAllModals();
        renderAll();
    } catch (err) {
        alert(err.message);
    }
}

// Return Book Handler
function handleReturnBook(borrowId) {
    const borrowing = db.data.borrowings.find(b => b.borrow_id === borrowId);
    if (!borrowing) return;

    const book = db.getBook(borrowing.book_id) || {};
    const member = db.getMember(borrowing.member_id) || {};
    const today = db.getSimulatedCurrentDate();

    if (confirm(`Confirm return of "${book.title}" borrowed by ${member.name} on ${borrowing.borrow_date}?`)) {
        try {
            const res = db.returnBook(borrowId, today);
            showToast(
                'Book Returned',
                `"${book.title}" returned on ${today}. Available stock incremented to ${book.available_copies}.`,
                'success',
                res.sql
            );
            renderAll();
        } catch (err) {
            alert(err.message);
        }
    }
}

// Utility: HTML Escaping
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
