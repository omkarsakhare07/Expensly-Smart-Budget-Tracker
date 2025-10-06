// frontend/app.js - Updated to use MongoDB backend

// API Configuration
const API_URL = 'https://expensly-backend.onrender.com/api';
let authToken = localStorage.getItem('expensly_token');

// Application State
let currentUser = null;
let transactions = [];
let budgets = [];
let savingsGoals = [];
let charts = {};

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeDarkMode();
});

function initializeApp() {
    const savedUser = localStorage.getItem('expensly_current_user');
    if (savedUser && authToken) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showLandingPage();
    }

    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
}

function setupEventListeners() {
    document.getElementById('show-signup')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('signup');
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthForm('login');
    });

    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('signupForm')?.addEventListener('submit', handleSignup);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    document.getElementById('income-form')?.addEventListener('submit', handleAddIncome);
    document.getElementById('expense-form')?.addEventListener('submit', handleAddExpense);
    document.getElementById('budget-form')?.addEventListener('submit', handleSetBudget);
    document.getElementById('savings-form')?.addEventListener('submit', handleCreateSavingsGoal);
    document.getElementById('filter-category')?.addEventListener('change', filterTransactions);
    document.getElementById('filter-type')?.addEventListener('change', filterTransactions);
    document.getElementById('dark-mode-toggle')?.addEventListener('click', toggleDarkMode);
}

function switchAuthForm(form) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (form === 'signup') {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        authToken = data.token;
        currentUser = data.user;
        
        localStorage.setItem('expensly_token', authToken);
        localStorage.setItem('expensly_current_user', JSON.stringify(currentUser));
        
        showMainApp();
        showToast('success', 'Success', `Welcome back, ${currentUser.name}!`);
    } catch (error) {
        showToast('error', 'Error', error.message);
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        authToken = data.token;
        currentUser = data.user;
        
        localStorage.setItem('expensly_token', authToken);
        localStorage.setItem('expensly_current_user', JSON.stringify(currentUser));
        
        showMainApp();
        showToast('success', 'Success', 'Account created successfully!');
    } catch (error) {
        showToast('error', 'Error', error.message);
    }
}

function handleLogout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('expensly_token');
    localStorage.removeItem('expensly_current_user');
    showLandingPage();
    showToast('success', 'Success', 'Logged out successfully');
}

function showLandingPage() {
    document.getElementById('landing-page').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

async function showMainApp() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';

    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
    }

    await loadAppData();
    updateDashboard();
    showSection('dashboard');
}

async function loadAppData() {
    try {
        const [transactionsData, budgetsData, savingsData] = await Promise.all([
            apiCall('/transactions'),
            apiCall('/budgets'),
            apiCall('/savings')
        ]);

        transactions = transactionsData.map(t => ({
            ...t,
            id: t._id,
            userId: t.userId,
            date: t.date.split('T')[0]
        }));

        budgets = budgetsData.map(b => ({
            ...b,
            id: b._id,
            userId: b.userId
        }));

        savingsGoals = savingsData.map(g => ({
            ...g,
            id: g._id,
            userId: g.userId,
            deadline: g.deadline.split('T')[0]
        }));
    } catch (error) {
        showToast('error', 'Error', 'Failed to load data');
        console.error(error);
    }
}

function showSection(sectionName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');

    switch(sectionName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'transactions':
            displayAllTransactions();
            break;
        case 'budget':
            displayBudgetProgress();
            break;
        case 'savings':
            displaySavingsGoals();
            break;
    }
}

async function handleAddIncome(e) {
    e.preventDefault();

    const description = document.getElementById('income-description').value;
    const amount = parseFloat(document.getElementById('income-amount').value);
    const category = document.getElementById('income-category').value;
    const date = document.getElementById('income-date').value;

    try {
        await apiCall('/transactions', {
            method: 'POST',
            body: JSON.stringify({
                type: 'income',
                description,
                amount,
                category,
                date
            })
        });

        e.target.reset();
        document.getElementById('income-date').value = new Date().toISOString().split('T')[0];

        await loadAppData();
        updateDashboard();
        showToast('success', 'Success', `Income of ₹${formatNumber(amount)} added successfully!`);
    } catch (error) {
        showToast('error', 'Error', error.message);
    }
}

async function handleAddExpense(e) {
    e.preventDefault();

    const description = document.getElementById('expense-description').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;

    try {
        await apiCall('/transactions', {
            method: 'POST',
            body: JSON.stringify({
                type: 'expense',
                description,
                amount,
                category,
                date
            })
        });

        checkBudgetAlert(category, amount);

        e.target.reset();
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];

        await loadAppData();
        updateDashboard();
        showToast('success', 'Success', `Expense of ₹${formatNumber(amount)} added successfully!`);
    } catch (error) {
        showToast('error', 'Error', error.message);
    }
}

async function handleSetBudget(e) {
    e.preventDefault();

    const category = document.getElementById('budget-category').value;
    const limit = parseFloat(document.getElementById('budget-limit').value);

    try {
        await apiCall('/budgets', {
            method: 'POST',
            body: JSON.stringify({ category, limit, period: 'monthly' })
        });

        e.target.reset();

        await loadAppData();
        displayBudgetProgress();
        showToast('success', 'Success', `Budget for ${category} set to ₹${formatNumber(limit)}`);
    } catch (error) {
        showToast('error', 'Error', error.message);
    }
}

async function handleCreateSavingsGoal(e) {
    e.preventDefault();

    const title = document.getElementById('savings-title').value;
    const targetAmount = parseFloat(document.getElementById('savings-target').value);
    const currentAmount = parseFloat(document.getElementById('savings-current').value);
    const deadline = document.getElementById('savings-deadline').value;

    try {
        await apiCall('/savings', {
            method: 'POST',
            body: JSON.stringify({ title, targetAmount, currentAmount, deadline })
        });

        e.target.reset();
        document.getElementById('savings-current').value = '0';

        await loadAppData();
        displaySavingsGoals();
        showToast('success', 'Success', 'Savings goal created successfully!');
    } catch (error) {
        showToast('error', 'Error', error.message);
    }
}

function updateDashboard() {
    updateFinancialStats();
    updateCharts();
    displayRecentTransactions();
}

function updateFinancialStats() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    document.getElementById('total-income').textContent = `₹${formatNumber(totalIncome)}`;
    document.getElementById('total-expenses').textContent = `₹${formatNumber(totalExpenses)}`;
    document.getElementById('current-balance').textContent = `₹${formatNumber(balance)}`;
}

function updateCharts() {
    updateExpensePieChart();
    updateTrendChart();
}

function updateExpensePieChart() {
    const canvas = document.getElementById('expense-pie-chart');
    const ctx = canvas.getContext('2d');

    if (charts.expenseChart) {
        charts.expenseChart.destroy();
    }

    const userExpenses = transactions.filter(t => t.type === 'expense');

    const categoryData = {};
    userExpenses.forEach(expense => {
        categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
        '#8b5cf6', '#f97316', '#ec4899', '#06b6d4'
    ];

    charts.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateTrendChart() {
    const canvas = document.getElementById('monthly-trend-chart');
    const ctx = canvas.getContext('2d');

    if (charts.trendChart) {
        charts.trendChart.destroy();
    }

    const monthlyData = {};
    transactions.forEach(transaction => {
        const month = transaction.date.substring(0, 7);
        if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expenses: 0 };
        }
        if (transaction.type === 'income') {
            monthlyData[month].income += transaction.amount;
        } else {
            monthlyData[month].expenses += transaction.amount;
        }
    });

    const months = Object.keys(monthlyData).sort();
    const incomeData = months.map(month => monthlyData[month].income);
    const expenseData = months.map(month => monthlyData[month].expenses);

    charts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(month => {
                const date = new Date(month + '-01');
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }),
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

function displayRecentTransactions() {
    const container = document.getElementById('recent-transactions-list');
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    container.innerHTML = recentTransactions.map(transaction => {
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountPrefix = transaction.type === 'income' ? '+' : '-';

        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">${transaction.category} • ${formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${amountPrefix}₹${formatNumber(transaction.amount)}
                </div>
            </div>
        `;
    }).join('');
}

function displayAllTransactions() {
    const container = document.getElementById('all-transactions-list');
    let filteredTransactions = [...transactions];

    const categoryFilter = document.getElementById('filter-category').value;
    const typeFilter = document.getElementById('filter-type').value;

    if (categoryFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
    }

    if (typeFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }

    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = filteredTransactions.map(transaction => {
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const amountPrefix = transaction.type === 'income' ? '+' : '-';

        return `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">${transaction.category} • ${formatDate(transaction.date)}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="transaction-amount ${amountClass}">
                        ${amountPrefix}₹${formatNumber(transaction.amount)}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn btn--secondary btn-sm" onclick="deleteTransaction('${transaction.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        try {
            await apiCall(`/transactions/${id}`, { method: 'DELETE' });
            await loadAppData();
            const activeSection = document.querySelector('.content-section.active').id.replace('-section', '');
            showSection(activeSection);
            showToast('success', 'Success', 'Transaction deleted successfully');
        } catch (error) {
            showToast('error', 'Error', error.message);
        }
    }
}

function filterTransactions() {
    displayAllTransactions();
}

function displayBudgetProgress() {
    const container = document.getElementById('budget-progress-list');

    container.innerHTML = budgets.map(budget => {
        const spent = transactions
            .filter(t => t.type === 'expense' && t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);

        const percentage = (spent / budget.limit) * 100;
        const progressClass = percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : '';

        return `
            <div class="budget-item">
                <div class="budget-header">
                    <div class="budget-category">${budget.category}</div>
                    <div class="budget-amount">₹${formatNumber(spent)} / ₹${formatNumber(budget.limit)}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-percentage">${percentage.toFixed(1)}% used</div>
            </div>
        `;
    }).join('');
}

function checkBudgetAlert(category, amount) {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return;

    const totalSpent = transactions
        .filter(t => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (totalSpent / budget.limit) * 100;

    if (percentage > 100) {
        showToast('warning', 'Budget Alert', `You have exceeded your ${category} budget by ₹${formatNumber(totalSpent - budget.limit)}`);
    } else if (percentage > 80) {
        showToast('warning', 'Budget Alert', `You are approaching your ${category} budget limit (${percentage.toFixed(1)}% used)`);
    }
}

function displaySavingsGoals() {
    const container = document.getElementById('savings-goals-list');

    container.innerHTML = savingsGoals.map(goal => {
        const percentage = (goal.currentAmount / goal.targetAmount) * 100;
        const circumference = 2 * Math.PI * 36;
        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

        return `
            <div class="savings-goal">
                <div class="goal-header">
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-deadline">Due: ${formatDate(goal.deadline)}</div>
                </div>
                <div class="goal-progress">
                    <div class="circular-progress">
                        <svg viewBox="0 0 80 80">
                            <circle class="bg" cx="40" cy="40" r="36"></circle>
                            <circle class="fill" cx="40" cy="40" r="36" 
                                    stroke-dasharray="${strokeDasharray}"></circle>
                        </svg>
                        <div class="percentage">${percentage.toFixed(0)}%</div>
                    </div>
                    <div class="goal-details">
                        <div class="goal-amounts">
                            <span class="goal-current">₹${formatNumber(goal.currentAmount)}</span>
                            <span class="goal-target">/ ₹${formatNumber(goal.targetAmount)}</span>
                        </div>
                        <div class="goal-actions">
                            <button class="btn btn--primary btn-sm" onclick="updateSavingsProgress('${goal.id}')">
                                Update Progress
                            </button>
                            <button class="btn btn--secondary btn-sm" onclick="deleteSavingsGoal('${goal.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function updateSavingsProgress(goalId) {
    const goal = savingsGoals.find(g => g.id === goalId);
    const newAmount = prompt(`Update saved amount for "${goal.title}":`, goal.currentAmount);

    if (newAmount !== null && !isNaN(newAmount)) {
        try {
            await apiCall(`/savings/${goalId}`, {
                method: 'PUT',
                body: JSON.stringify({ currentAmount: parseFloat(newAmount) })
            });

            await loadAppData();
            displaySavingsGoals();
            showToast('success', 'Success', 'Savings progress updated!');
        } catch (error) {
            showToast('error', 'Error', error.message);
        }
    }
}

async function deleteSavingsGoal(goalId) {
    if (confirm('Are you sure you want to delete this savings goal?')) {
        try {
            await apiCall(`/savings/${goalId}`, { method: 'DELETE' });
            await loadAppData();
            displaySavingsGoals();
            showToast('success', 'Success', 'Savings goal deleted successfully');
        } catch (error) {
            showToast('error', 'Error', error.message);
        }
    }
}

function initializeDarkMode() {
    const darkMode = localStorage.getItem('expensly_dark_mode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) {
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
}

function toggleDarkMode() {
    const body = document.body;
    const toggle = document.getElementById('dark-mode-toggle');

    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');

    localStorage.setItem('expensly_dark_mode', isDark);
    toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

    setTimeout(() => {
        if (document.querySelector('.content-section.active').id === 'dashboard-section') {
            updateCharts();
        }
    }, 300);
}

function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconClass = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 
                     'fa-exclamation-triangle';

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 5000);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-IN').format(number);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}