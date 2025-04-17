// --- DOM Element Selection ---
const expenseForm = document.getElementById('expense-form');
const expenseDateInput = document.getElementById('expense-date');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDescriptionInput = document.getElementById('expense-description');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseListBody = document.getElementById('expense-list-body');
const totalExpensesDisplay = document.getElementById('total-expenses');

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
 * Adds a single expense row to the HTML table.
 * IMPORTANT: Now takes an expense *object*.
 * @param {object} expense - The expense object {id, date, amount, description, category}
 */
function addExpenseToTable(expense) {
    const newRow = document.createElement('tr');
    // Add data-id attribute to the row for easier targeting later (e.g., for delete)
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
    // Add data-id to button too, makes delete handler simpler
    deleteButton.setAttribute('data-id', expense.id);
    // TODO: Add event listener to deleteButton later
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
    // Calculate total from the current expenses array
    totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
}

/**
 * Saves the current expenses array to Local Storage.
 */
function saveExpenses() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
}

/**
 * Loads expenses from Local Storage and updates the UI.
 */
function loadExpenses() {
    const savedExpensesString = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (savedExpensesString) {
        try {
            expenses = JSON.parse(savedExpensesString);
            // Ensure amounts are numbers (JSON can sometimes lose type info)
            expenses.forEach(exp => exp.amount = parseFloat(exp.amount));
        } catch (error) {
            console.error("Error parsing expenses from Local Storage:", error);
            expenses = []; // Start fresh if data is corrupt
        }
    } else {
        expenses = []; // No saved data, start with an empty array
    }

    // Clear any existing rows in the table body before adding loaded ones
    expenseListBody.innerHTML = '';

    // Add each loaded expense to the table
    expenses.forEach(expense => {
        addExpenseToTable(expense);
    });

    // Calculate and display the total from loaded expenses
    calculateAndUpdateTotal();
}

// --- Event Listeners ---

// Listen for the 'blur' event on the amount input
expenseAmountInput.addEventListener('blur', function() {
    const currentValue = expenseAmountInput.value;
    const numericValue = parseCurrency(currentValue);

    if (!isNaN(numericValue)) {
        expenseAmountInput.value = formatCurrency(numericValue);
    } else if (currentValue.trim() === '') {
         expenseAmountInput.value = '';
    }
});

// Listen for form submission
expenseForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Get values
    const date = expenseDateInput.value;
    const amount = parseCurrency(expenseAmountInput.value);
    const description = expenseDescriptionInput.value;
    const category = expenseCategoryInput.value;

    // Validation
    if (!date || isNaN(amount) || amount <= 0 || !description || !category) {
        alert('Please fill out all fields correctly, ensuring Amount is a valid positive number.');
        return;
    }

    // Create a new expense object with a unique ID
    const newExpense = {
        // Use timestamp for a simple unique ID (or crypto.randomUUID() if preferred)
        id: Date.now().toString(),
        date: date,
        amount: amount,
        description: description,
        category: category
    };

    // Add to the array
    expenses.push(newExpense);

    // Add to the table display
    addExpenseToTable(newExpense);

    // Update total display
    calculateAndUpdateTotal();

    // Save the updated array to Local Storage
    saveExpenses();

    // Clear the form
    expenseForm.reset();
    expenseAmountInput.value = '';
});

// --- Initial Setup ---
// Load expenses from local storage when the page loads
loadExpenses();
console.log('Expense Tracker Script Loaded and Ready! (v3 - with Local Storage)');