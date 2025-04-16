// --- DOM Element Selection ---
const expenseForm = document.getElementById('expense-form');
const expenseDateInput = document.getElementById('expense-date');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDescriptionInput = document.getElementById('expense-description');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseListBody = document.getElementById('expense-list-body');
const totalExpensesDisplay = document.getElementById('total-expenses');

// --- Event Listeners ---

// Listen for form submission
expenseForm.addEventListener('submit', function(event) {
    // Prevent the default form submission behavior (which reloads the page)
    event.preventDefault();

    // --- Get values from form inputs ---
    const date = expenseDateInput.value;
    const amount = parseFloat(expenseAmountInput.value); // Convert amount to a number
    const description = expenseDescriptionInput.value;
    const category = expenseCategoryInput.value;

    // --- Basic Validation (Example) ---
    if (!date || isNaN(amount) || amount <= 0 || !description || !category) {
        alert('Please fill out all fields correctly.');
        return; // Stop the function if validation fails
    }

    // --- Log the expense data (for now) ---
    console.log('New Expense Added:');
    console.log('Date:', date);
    console.log('Amount:', amount);
    console.log('Description:', description);
    console.log('Category:', category);

    // --- TODO: Add expense to the list display ---
    // --- TODO: Update total expenses display ---
    // --- TODO: Save expense data (local storage or backend) ---

    // --- Clear the form fields after submission ---
    expenseForm.reset(); // Resets all form fields to default values
    // Note: date input might not reset visually in all browsers with reset(),
    // you might need to set expenseDateInput.value = ''; explicitly if needed.

});

// --- Initial Setup ---
// (Code to load existing expenses or initialize totals could go here later)
console.log('Expense Tracker Script Loaded!');
