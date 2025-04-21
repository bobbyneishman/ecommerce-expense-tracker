// --- DOM Element Selection ---
const expenseForm = document.getElementById('expense-form');
const expenseDateInput = document.getElementById('expense-date');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseDescriptionInput = document.getElementById('expense-description');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseListBody = document.getElementById('expense-list-body'); // Target for event delegation
const totalExpensesDisplay = document.getElementById('total-expenses');
const categoryPieChartCanvas = document.getElementById('categoryPieChart');

// --- Application State (Data) ---
let expenses = [];
let totalExpenses = 0;
let categoryChart = null;

// --- Local Storage Key ---
const LOCAL_STORAGE_KEY = 'expensesData';

// --- Functions ---

function parseCurrency(value) { /* ... (same as before) ... */
    if (!value) return NaN;
    const cleanedValue = value.replace(/[\$,\s]/g, '');
    return parseFloat(cleanedValue);
}

function formatCurrency(number) { /* ... (same as before) ... */
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(number);
}

function aggregateExpensesByCategory(expensesArray) { /* ... (same as before) ... */
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
    // console.log("Aggregated Category Totals:", categoryTotals);
    return categoryTotals;
}

function renderCategoryPieChart(categoryData) { /* ... (same as before) ... */
    const ctx = categoryPieChartCanvas.getContext('2d');
    if (!ctx) { console.error("Canvas context not found!"); return;} // Added check

    const labels = Object.keys(categoryData);
    const dataValues = Object.values(categoryData);
    const backgroundColors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6',
        '#34495e', '#1abc9c', '#e67e22', '#bdc3c7', '#7f8c8d'
    ];
    const colorsToUse = labels.map((_, index) => backgroundColors[index % backgroundColors.length]);

    const chartConfig = {
        type: 'pie', data: { labels: labels, datasets: [{ label: 'Spending by Category', data: dataValues, backgroundColor: colorsToUse, hoverOffset: 4 }] },
        options: { responsive: true, plugins: { legend: { position: 'top', }, tooltip: { callbacks: { label: function(context) { let label = context.label || ''; if (label) { label += ': '; } if (context.parsed !== null) { label += formatCurrency(context.parsed); } return label; } } } } }
    };

    if (categoryChart) {
        categoryChart.data.labels = labels;
        categoryChart.data.datasets[0].data = dataValues;
        categoryChart.data.datasets[0].backgroundColor = colorsToUse;
        categoryChart.update();
    } else {
        categoryChart = new Chart(ctx, chartConfig);
    }
}

function addExpenseToTable(expense) { /* ... (same as before, includes data-id on row and button) ... */
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', expense.id);
    const dateCell = document.createElement('td'); dateCell.textContent = expense.date;
    const amountCell = document.createElement('td'); amountCell.textContent = formatCurrency(expense.amount);
    const descriptionCell = document.createElement('td'); descriptionCell.textContent = expense.description;
    const categoryCell = document.createElement('td'); categoryCell.textContent = expense.category;
    const actionsCell = document.createElement('td');
    const deleteButton = document.createElement('button'); deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn'); deleteButton.setAttribute('data-id', expense.id); // Ensure button has id
    actionsCell.appendChild(deleteButton);
    newRow.appendChild(dateCell); newRow.appendChild(amountCell); newRow.appendChild(descriptionCell);
    newRow.appendChild(categoryCell); newRow.appendChild(actionsCell);
    expenseListBody.appendChild(newRow);
}

function calculateAndUpdateTotal() { /* ... (same as before) ... */
    totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
}

function saveExpenses() { /* ... (same as before) ... */
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses)); }
    catch (error) { console.error('Error saving:', error); }
}

/**
 * Deletes an expense by its ID.
 * @param {string} idToDelete - The ID of the expense to delete.
 */
function deleteExpense(idToDelete) {
    console.log("Attempting to delete expense with ID:", idToDelete);

    // 1. Filter the array
    expenses = expenses.filter(expense => expense.id !== idToDelete);

    // 2. Save the updated array
    saveExpenses();

    // 3. Remove the row from the table
    const rowToDelete = expenseListBody.querySelector(`tr[data-id="${idToDelete}"]`);
    if (rowToDelete) {
        rowToDelete.remove();
        console.log("Removed row from table.");
    } else {
        console.warn("Could not find table row to remove for ID:", idToDelete);
    }

    // 4. Update the total
    calculateAndUpdateTotal();

    // 5. Update the chart
    const categoryData = aggregateExpensesByCategory(expenses);
    renderCategoryPieChart(categoryData);

    console.log("Expense deleted and UI updated.");
}


function loadExpenses() { /* ... (same as before, including initial chart render) ... */
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

    const categoryData = aggregateExpensesByCategory(expenses);
    renderCategoryPieChart(categoryData);
}

// --- Event Listeners ---

expenseAmountInput.addEventListener('blur', function() { /* ... (same as before) ... */
    const currentValue = expenseAmountInput.value;
    const numericValue = parseCurrency(currentValue);
    if (!isNaN(numericValue)) { expenseAmountInput.value = formatCurrency(numericValue); }
    else if (currentValue.trim() === '') { expenseAmountInput.value = ''; }
});

expenseForm.addEventListener('submit', function(event) { /* ... (same as before, including chart update) ... */
    event.preventDefault();
    const date = expenseDateInput.value; const amount = parseCurrency(expenseAmountInput.value);
    const description = expenseDescriptionInput.value; const category = expenseCategoryInput.value;
    if (!date || isNaN(amount) || amount <= 0 || !description || !category) { alert('Please fill out all fields correctly...'); return; }
    const newExpense = { id: Date.now().toString(), date, amount, description, category };
    expenses.push(newExpense); addExpenseToTable(newExpense);
    calculateAndUpdateTotal(); saveExpenses();
    const categoryData = aggregateExpensesByCategory(expenses); renderCategoryPieChart(categoryData);
    expenseForm.reset(); expenseAmountInput.value = '';
});

// *** NEW: Event Listener for clicks within the expense list body ***
expenseListBody.addEventListener('click', function(event) {
    // Check if the clicked element is a delete button
    if (event.target.classList.contains('delete-btn')) {
        console.log("Delete button clicked!");
        // Get the ID from the button's data-id attribute
        const idToDelete = event.target.getAttribute('data-id');

        // Ask for confirmation
        if (window.confirm(`Are you sure you want to delete this expense?`)) {
             // If confirmed, call the delete function
             deleteExpense(idToDelete);
        } else {
            console.log("Deletion cancelled by user.");
        }
    }
});


// --- Initial Setup ---
loadExpenses();
console.log('Expense Tracker Script Loaded and Ready! (v6 - with Delete)');