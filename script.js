// --- DOM Element Selection ---
const expenseForm = document.getElementById('expense-form');
const expenseDateInput = document.getElementById('expense-date');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDescriptionInput = document.getElementById('expense-description');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseListBody = document.getElementById('expense-list-body'); // The tbody element
const totalExpensesDisplay = document.getElementById('total-expenses');

// --- Application State (Data) ---
// We'll store expenses here later, for now, just focusing on adding to table
let totalExpenses = 0; // Initialize total expenses

// --- Functions ---

/**
 * Adds a single expense row to the HTML table.
 * @param {string} date - The expense date
 * @param {number} amount - The expense amount
 * @param {string} description - The expense description
 * @param {string} category - The expense category
 */
function addExpenseToTable(date, amount, description, category) {
    const newRow = document.createElement('tr'); // Create a new table row element

    // Create table data cells (td) for each piece of info
    const dateCell = document.createElement('td');
    dateCell.textContent = date;

    const amountCell = document.createElement('td');
    // Format amount nicely (e.g., $10.50)
    amountCell.textContent = `$${amount.toFixed(2)}`;

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = description;

    const categoryCell = document.createElement('td');
    categoryCell.textContent = category;

    // Create a cell for actions (like a delete button)
    const actionsCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn'); // Add a class for potential styling/selection
    // TODO: Add event listener to deleteButton later
    actionsCell.appendChild(deleteButton);

    // Add all the cells to the row
    newRow.appendChild(dateCell);
    newRow.appendChild(amountCell);
    newRow.appendChild(descriptionCell);
    newRow.appendChild(categoryCell);
    newRow.appendChild(actionsCell);

    // Add the completed row to the table body
    expenseListBody.appendChild(newRow);
}

/**
 * Updates the total expenses display on the page.
 */
function updateTotalDisplay() {
    totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
}

// --- Event Listeners ---

// Listen for form submission
expenseForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent page reload

    // Get values from form inputs
    const date = expenseDateInput.value;
    const amount = parseFloat(expenseAmountInput.value);
    const description = expenseDescriptionInput.value;
    const category = expenseCategoryInput.value;

    // Basic Validation
    if (!date || isNaN(amount) || amount <= 0 || !description || !category) {
        alert('Please fill out all fields correctly.');
        return;
    }

    // --- Add the expense to the table display ---
    addExpenseToTable(date, amount, description, category);

    // --- Update the total expenses ---
    totalExpenses += amount; // Add the new amount to the total
    updateTotalDisplay(); // Update the display

    // --- TODO: Save expense data (local storage or backend) ---

    // Clear the form fields
    expenseForm.reset();
    // Optionally force date reset if needed: expenseDateInput.value = '';
});

// --- Initial Setup ---
updateTotalDisplay(); // Set initial total display to $0.00
console.log('Expense Tracker Script Loaded and Ready!');