// --- DOM Element Selection ---
const expenseForm = document.getElementById('expense-form');
const expenseDateInput = document.getElementById('expense-date');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDescriptionInput = document.getElementById('expense-description');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseListBody = document.getElementById('expense-list-body');
const totalExpensesDisplay = document.getElementById('total-expenses');
const categoryPieChartCanvas = document.getElementById('categoryPieChart'); // Get canvas element

// --- Application State (Data) ---
let expenses = []; // Array to hold all expense objects
let totalExpenses = 0;
let categoryChart = null; // Variable to hold the chart instance

// --- Local Storage Key ---
const LOCAL_STORAGE_KEY = 'expensesData';

// --- Functions ---

function parseCurrency(value) {
    if (!value) return NaN;
    const cleanedValue = value.replace(/[\$,\s]/g, '');
    return parseFloat(cleanedValue);
}

function formatCurrency(number) {
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(number);
}

function aggregateExpensesByCategory(expensesArray) {
    const categoryTotals = {};
    expensesArray.forEach(expense => {
        const category = expense.category;
        const amount = expense.amount;
        if (categoryTotals[category]) {
            categoryTotals[category] += amount;
        } else {
            categoryTotals[category] = amount;
        }
    });
    // console.log("Aggregated Category Totals:", categoryTotals); // Keep for debugging if needed
    return categoryTotals;
}

/**
 * Renders or updates the category pie chart.
 * @param {object} categoryData - The aggregated category data {category: total, ...}
 */
function renderCategoryPieChart(categoryData) {
    const ctx = categoryPieChartCanvas.getContext('2d');
    const labels = Object.keys(categoryData);
    const dataValues = Object.values(categoryData);

    // Define some colors (add more if you have many categories)
    const backgroundColors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6',
        '#34495e', '#1abc9c', '#e67e22', '#bdc3c7', '#7f8c8d'
    ];
    // Ensure enough colors if many categories, otherwise Chart.js repeats
    const colorsToUse = labels.map((_, index) => backgroundColors[index % backgroundColors.length]);


    const chartConfig = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Spending by Category',
                data: dataValues,
                backgroundColor: colorsToUse,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top', // Or 'bottom', 'left', 'right'
                },
                tooltip: {
                    callbacks: {
                        // Format tooltip to show currency
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatCurrency(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    };

    // If chart already exists, update it; otherwise, create it
    if (categoryChart) {
        console.log("Updating existing chart.");
        categoryChart.data.labels = labels;
        categoryChart.data.datasets[0].data = dataValues;
        categoryChart.data.datasets[0].backgroundColor = colorsToUse;
        categoryChart.update();
    } else {
        console.log("Creating new chart.");
        // Make sure canvas context is available before creating
        if (ctx) {
            categoryChart = new Chart(ctx, chartConfig);
        } else {
            console.error("Canvas context not found for chart.");
        }
    }
}


function addExpenseToTable(expense) {
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', expense.id);
    const dateCell = document.createElement('td'); dateCell.textContent = expense.date;
    const amountCell = document.createElement('td'); amountCell.textContent = formatCurrency(expense.amount);
    const descriptionCell = document.createElement('td'); descriptionCell.textContent = expense.description;
    const categoryCell = document.createElement('td'); categoryCell.textContent = expense.category;
    const actionsCell = document.createElement('td');
    const deleteButton = document.createElement('button'); deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn'); deleteButton.setAttribute('data-id', expense.id);
    actionsCell.appendChild(deleteButton);
    newRow.appendChild(dateCell); newRow.appendChild(amountCell); newRow.appendChild(descriptionCell);
    newRow.appendChild(categoryCell); newRow.appendChild(actionsCell);
    expenseListBody.appendChild(newRow);
}

function calculateAndUpdateTotal() {
    totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
}

function saveExpenses() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) { console.error('Error saving:', error); }
}

function loadExpenses() {
    const savedExpensesString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedExpensesString) {
        try {
            const parsedData = JSON.parse(savedExpensesString);
            if (Array.isArray(parsedData)) {
                expenses = parsedData;
                expenses.forEach(exp => { exp.amount = parseFloat(exp.amount); if (isNaN(exp.amount)) { exp.amount = 0; } });
            } else { expenses = []; }
        } catch (error) { console.error("Error parsing:", error); expenses = []; }
    } else { expenses = []; }

    expenseListBody.innerHTML = '';
    expenses.forEach(addExpenseToTable);
    calculateAndUpdateTotal();

    // --- Aggregate data AND Render chart after loading ---
    const categoryData = aggregateExpensesByCategory(expenses);
    renderCategoryPieChart(categoryData); // Call chart function
}

// --- Event Listeners ---

expenseAmountInput.addEventListener('blur', function() { /* ... (same as before) ... */
    const currentValue = expenseAmountInput.value;
    const numericValue = parseCurrency(currentValue);
    if (!isNaN(numericValue)) {
        expenseAmountInput.value = formatCurrency(numericValue);
    } else if (currentValue.trim() === '') {
         expenseAmountInput.value = '';
    }
});

expenseForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const date = expenseDateInput.value;
    const amount = parseCurrency(expenseAmountInput.value);
    const description = expenseDescriptionInput.value;
    const category = expenseCategoryInput.value;
    if (!date || isNaN(amount) || amount <= 0 || !description || !category) {
        alert('Please fill out all fields correctly...'); return;
    }
    const newExpense = { id: Date.now().toString(), date, amount, description, category };
    expenses.push(newExpense);
    addExpenseToTable(newExpense);
    calculateAndUpdateTotal();
    saveExpenses();

    // --- Aggregate data AND Update chart after adding ---
    const categoryData = aggregateExpensesByCategory(expenses);
    renderCategoryPieChart(categoryData); // Call chart function

    expenseForm.reset();
    expenseAmountInput.value = '';
});

// --- Initial Setup ---
loadExpenses(); // This will now load data and render the initial chart
console.log('Expense Tracker Script Loaded and Ready! (v5 - with Chart.js)');