// --- DOM Element Selection ---
const expenseForm = document.getElementById('expense-form');
const expenseDateInput = document.getElementById('expense-date');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDescriptionInput = document.getElementById('expense-description');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseListBody = document.getElementById('expense-list-body');
const totalExpensesDisplay = document.getElementById('total-expenses');
// TODO: Add element selection for where the chart will go later, e.g.,
// const chartContainer = document.getElementById('chart-container');

// --- Application State (Data) ---
let expenses = []; // Array to hold all expense objects
let totalExpenses = 0; // Will be calculated from the expenses array

// --- Local Storage Key ---
const LOCAL_STORAGE_KEY = 'expensesData';

// --- Functions ---

/**
 * Takes a string value, removes currency formatting, and returns a number.
 */
function parseCurrency(value) {
    if (!value) return NaN;
    const cleanedValue = value.replace(/[\$,\s]/g, '');
    return parseFloat(cleanedValue);
}

/**
 * Formats a number as USD currency string.
 */
function formatCurrency(number) {
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(number);
}

/**
 * Aggregates expenses by category.
 * @param {Array<object>} expensesArray - The array of expense objects.
 * @returns {object} - An object where keys are categories and values are total amounts.
 */
function aggregateExpensesByCategory(expensesArray) {
    const categoryTotals = {}; // Initialize an empty object to store totals

    expensesArray.forEach(expense => {
        const category = expense.category;
        const amount = expense.amount; // Amount should already be a number here

        if (categoryTotals[category]) {
            // If category already exists, add to its total
            categoryTotals[category] += amount;
        } else {
            // If category doesn't exist, initialize it
            categoryTotals[category] = amount;
        }
    });

    // --- DEBUG: Log the result of aggregation ---
    console.log("Aggregated Category Totals:", categoryTotals);
    return categoryTotals;
}


/**
 * Adds a single expense row to the HTML table.
 * @param {object} expense - The expense object {id, date, amount, description, category}
 */
function addExpenseToTable(expense) {
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', expense.id);

    const dateCell = document.createElement('td');
    dateCell.textContent = expense.date;
    const amountCell = document.createElement('td');
    amountCell.textContent = formatCurrency(expense.amount);
    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = expense.description;
    const categoryCell = document.createElement('td');
    categoryCell.textContent = expense.category;
    const actionsCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.setAttribute('data-id', expense.id);
    actionsCell.appendChild(deleteButton);

    newRow.appendChild(dateCell);
    newRow.appendChild(amountCell);
    newRow.appendChild(descriptionCell);
    newRow.appendChild(categoryCell);
    newRow.appendChild(actionsCell);

    expenseListBody.appendChild(newRow);
}

/**
 * Recalculates total expenses from the expenses array and updates the display.
 */
function calculateAndUpdateTotal() {
    totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
}

/**
 * Saves the current expenses array to Local Storage.
 */
function saveExpenses() {
    const expensesString = JSON.stringify(expenses);
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, expensesString);
    } catch (error) {
        console.error('Error saving to Local Storage:', error);
    }
}

/**
 * Loads expenses from Local Storage and updates the UI.
 */
function loadExpenses() {
    console.log(`Attempting to load from Local Storage (key: ${LOCAL_STORAGE_KEY})`);
    const savedExpensesString = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedExpensesString) {
        try {
            const parsedData = JSON.parse(savedExpensesString);
            if (Array.isArray(parsedData)) {
                expenses = parsedData;
                expenses.forEach(exp => {
                    exp.amount = parseFloat(exp.amount);
                    if (isNaN(exp.amount)) {
                        exp.amount = 0;
                    }
                });
            } else { expenses = []; }
        } catch (error) {
            console.error("Error parsing expenses:", error);
            expenses = [];
        }
    } else {
        expenses = [];
    }

    expenseListBody.innerHTML = '';
    expenses.forEach(addExpenseToTable); // Use the function directly
    calculateAndUpdateTotal();

    // --- Call aggregation after loading ---
    aggregateExpensesByCategory(expenses);

    // TODO: Call chart rendering function here later
}

// --- Event Listeners ---

expenseAmountInput.addEventListener('blur', function() {
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
        alert('Please fill out all fields correctly...');
        return;
    }

    const newExpense = {
        id: Date.now().toString(),
        date: date,
        amount: amount,
        description: description,
        category: category
    };

    expenses.push(newExpense);
    addExpenseToTable(newExpense);
    calculateAndUpdateTotal();
    saveExpenses();

    // --- Call aggregation after adding ---
    aggregateExpensesByCategory(expenses);

     // TODO: Call chart update function here later

    expenseForm.reset();
    expenseAmountInput.value = '';
});

// --- Initial Setup ---
loadExpenses();
console.log('Expense Tracker Script Loaded and Ready! (v4 - with aggregation)');