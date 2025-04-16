// --- DOM Element Selection ---
const expenseForm = document.getElementById('expense-form');
const expenseDateInput = document.getElementById('expense-date');
const expenseAmountInput = document.getElementById('expense-amount'); // *** We'll work with this ***
const expenseDescriptionInput = document.getElementById('expense-description');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseListBody = document.getElementById('expense-list-body');
const totalExpensesDisplay = document.getElementById('total-expenses');

// --- Application State (Data) ---
let totalExpenses = 0;

// --- Functions ---

/**
 * Takes a string value, removes currency formatting, and returns a number.
 * @param {string} value - The potentially formatted currency string.
 * @returns {number} - The parsed number, or NaN if invalid.
 */
function parseCurrency(value) {
    if (!value) return NaN;
    // Remove $, commas, and any whitespace
    const cleanedValue = value.replace(/[\$,\s]/g, '');
    return parseFloat(cleanedValue);
}

/**
 * Formats a number as USD currency string.
 * @param {number} number - The number to format.
 * @returns {string} - The formatted currency string (e.g., "$1,234.56").
 */
function formatCurrency(number) {
    if (isNaN(number)) return ''; // Return empty if not a valid number
    // Use Intl.NumberFormat for robust currency formatting
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2, // Ensure two decimal places
    }).format(number);
}


/**
 * Adds a single expense row to the HTML table.
 * @param {string} date - The expense date
 * @param {number} amount - The expense amount (as a number)
 * @param {string} description - The expense description
 * @param {string} category - The expense category
 */
function addExpenseToTable(date, amount, description, category) {
    const newRow = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = date;

    const amountCell = document.createElement('td');
    amountCell.textContent = formatCurrency(amount); // Use formatter here too!

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = description;

    const categoryCell = document.createElement('td');
    categoryCell.textContent = category;

    const actionsCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    actionsCell.appendChild(deleteButton);

    newRow.appendChild(dateCell);
    newRow.appendChild(amountCell);
    newRow.appendChild(descriptionCell);
    newRow.appendChild(categoryCell);
    newRow.appendChild(actionsCell);

    expenseListBody.appendChild(newRow);
}

/**
 * Updates the total expenses display on the page.
 */
function updateTotalDisplay() {
    totalExpensesDisplay.textContent = totalExpenses.toFixed(2); // Keep raw total number simple
}

// --- Event Listeners ---

// *** Listen for the 'blur' event on the amount input (WITH DEBUG LOGS) ***
expenseAmountInput.addEventListener('blur', function() {
    const currentValue = expenseAmountInput.value;
    // --- DEBUG LOG 1 ---
    console.log('Blur event triggered. Current value:', currentValue);

    const numericValue = parseCurrency(currentValue);
     // --- DEBUG LOG 2 ---
    console.log('Parsed numeric value:', numericValue);

    if (!isNaN(numericValue)) {
        // --- DEBUG LOG 3a ---
        console.log('Value is a valid number. Formatting...');
        const formattedValue = formatCurrency(numericValue);
        // --- DEBUG LOG 4 ---
        console.log('Formatted value:', formattedValue);
        expenseAmountInput.value = formattedValue;
    } else if (currentValue.trim() === '') {
         // --- DEBUG LOG 3b ---
         console.log('Input was cleared by user.');
         expenseAmountInput.value = '';
    } else {
        // --- DEBUG LOG 3c ---
        console.log('Value is NaN or invalid, but not empty.');
        // Decide what to do with invalid input here. Clearing it might be best:
        // expenseAmountInput.value = ''; // Uncomment this line if you want to clear invalid text like "abc" on blur
    }
});

// *** MODIFIED: Listen for form submission ***
expenseForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Get values from form inputs
    const date = expenseDateInput.value;
    // *** IMPORTANT: Parse the potentially formatted amount value ***
    const amount = parseCurrency(expenseAmountInput.value);
    const description = expenseDescriptionInput.value;
    const category = expenseCategoryInput.value;

    // Basic Validation (using the parsed amount)
    if (!date || isNaN(amount) || amount <= 0 || !description || !category) {
        alert('Please fill out all fields correctly, ensuring Amount is a valid positive number.');
        return;
    }

    // Add the expense to the table display (pass the clean number)
    addExpenseToTable(date, amount, description, category);

    // Update the total expenses
    totalExpenses += amount;
    updateTotalDisplay();

    // Clear the form fields
    expenseForm.reset();
    // Clear amount specifically as reset might not clear the formatted value properly
    expenseAmountInput.value = '';

});

// --- Initial Setup ---
updateTotalDisplay(); // Keep initial total display simple
console.log('Expense Tracker Script Loaded and Ready! (v2 - with blur debugging)'); // Updated log message