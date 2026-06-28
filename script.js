const STORAGE_KEY = "expense-tracker-transactions";
const THEME_STORAGE_KEY = "expense-tracker-theme";

const form = document.querySelector("#transactionForm");
const transactionIdInput = document.querySelector("#transactionId");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const dateInput = document.querySelector("#date");
const categoryInput = document.querySelector("#category");
const typeFilter = document.querySelector("#typeFilter");
const searchInput = document.querySelector("#searchInput");
const transactionList = document.querySelector("#transactionList");
const emptyState = document.querySelector("#emptyState");
const formTitle = document.querySelector("#formTitle");
const submitBtn = document.querySelector("#submitBtn");
const cancelEditBtn = document.querySelector("#cancelEditBtn");
const clearAllBtn = document.querySelector("#clearAllBtn");
const themeToggle = document.querySelector("#themeToggle");
const themeToggleText = document.querySelector("#themeToggleText");
const transactionCount = document.querySelector("#transactionCount");
const balanceTotal = document.querySelector("#balanceTotal");
const incomeTotal = document.querySelector("#incomeTotal");
const expenseTotal = document.querySelector("#expenseTotal");

let transactions = loadTransactions();
let currentTheme = loadTheme();

function loadTransactions() {
  const storedTransactions = localStorage.getItem(STORAGE_KEY);

  if (!storedTransactions) {
    return [];
  }

  try {
    const parsedTransactions = JSON.parse(storedTransactions);
    return Array.isArray(parsedTransactions) ? parsedTransactions : [];
  } catch (error) {
    console.error("Could not parse stored transactions.", error);
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "dark" ? "dark" : "light";
}

function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  themeToggleText.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

function createTransaction(transaction) {
  transactions = [transaction, ...transactions];
  saveTransactions();
  render();
}

function updateTransaction(id, updates) {
  transactions = transactions.map((transaction) => {
    if (transaction.id !== id) {
      return transaction;
    }

    return { ...transaction, ...updates };
  });

  saveTransactions();
  render();
}

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  render();
}

function getFilteredTransactions() {
  const selectedType = typeFilter.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  return transactions
    .filter((transaction) => selectedType === "all" || transaction.type === selectedType)
    .filter((transaction) => {
      const searchableText = `${transaction.description} ${transaction.category}`.toLowerCase();
      return searchableText.includes(searchTerm);
    });
}

function getTotals() {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return {
    balance: income - expenses,
    income,
    expenses,
  };
}

function render() {
  const filteredTransactions = getFilteredTransactions();
  renderTotals();
  renderTransactions(filteredTransactions);
  renderCount(filteredTransactions.length);
}

function renderTotals() {
  const totals = getTotals();

  balanceTotal.textContent = formatCurrency(totals.balance);
  incomeTotal.textContent = formatCurrency(totals.income);
  expenseTotal.textContent = formatCurrency(totals.expenses);
}

function renderTransactions(items) {
  transactionList.innerHTML = "";
  emptyState.classList.toggle("hidden", items.length > 0);

  const rows = items.map((transaction) => {
    const row = document.createElement("tr");

    const detailsCell = document.createElement("td");
    const title = document.createElement("span");
    const type = document.createElement("span");

    title.className = "record-title";
    title.textContent = transaction.description;
    type.className = `record-type ${transaction.type}`;
    type.textContent = transaction.type;
    detailsCell.append(title, type);

    const categoryCell = document.createElement("td");
    categoryCell.textContent = transaction.category;

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(transaction.date);

    const amountCell = document.createElement("td");
    const sign = transaction.type === "income" ? "+" : "-";
    amountCell.className = `amount ${transaction.type}`;
    amountCell.textContent = `${sign}${formatCurrency(transaction.amount)}`;

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    const editButton = createActionButton("edit", transaction);
    const deleteButton = createActionButton("delete", transaction);

    actions.className = "actions";
    actions.append(editButton, deleteButton);
    actionsCell.append(actions);
    row.append(detailsCell, categoryCell, dateCell, amountCell, actionsCell);

    return row;
  });

  transactionList.append(...rows);
}

function createActionButton(action, transaction) {
  const button = document.createElement("button");
  const label = action === "edit" ? "Edit" : "Delete";

  button.className = `action-button ${action}`;
  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = transaction.id;
  button.setAttribute("aria-label", `${label} ${transaction.description}`);
  button.textContent = label;

  return button;
}

function renderCount(count) {
  const noun = count === 1 ? "record" : "records";
  transactionCount.textContent = `${count} ${noun}`;
}

function setEditingState(transaction) {
  transactionIdInput.value = transaction.id;
  descriptionInput.value = transaction.description;
  amountInput.value = transaction.amount;
  dateInput.value = transaction.date;
  categoryInput.value = transaction.category;
  form.elements.type.value = transaction.type;
  formTitle.textContent = "Edit transaction";
  submitBtn.textContent = "Save changes";
  cancelEditBtn.classList.remove("hidden");
  descriptionInput.focus();
}

function resetForm() {
  form.reset();
  transactionIdInput.value = "";
  dateInput.value = new Date().toISOString().slice(0, 10);
  formTitle.textContent = "Add transaction";
  submitBtn.textContent = "Add transaction";
  cancelEditBtn.classList.add("hidden");
}

function getFormData() {
  return {
    description: descriptionInput.value.trim(),
    amount: Number.parseFloat(amountInput.value),
    date: dateInput.value,
    category: categoryInput.value.trim(),
    type: form.elements.type.value,
  };
}

function isValidTransaction(transaction) {
  return (
    transaction.description.length > 0 &&
    transaction.category.length > 0 &&
    Number.isFinite(transaction.amount) &&
    transaction.amount > 0 &&
    transaction.date.length > 0 &&
    ["income", "expense"].includes(transaction.type)
  );
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = getFormData();

  if (!isValidTransaction(formData)) {
    form.reportValidity();
    return;
  }

  const editingId = transactionIdInput.value;

  if (editingId) {
    updateTransaction(editingId, formData);
  } else {
    createTransaction({
      id: createId(),
      createdAt: new Date().toISOString(),
      ...formData,
    });
  }

  resetForm();
});

transactionList.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const transaction = transactions.find((item) => item.id === actionButton.dataset.id);

  if (!transaction) {
    return;
  }

  if (actionButton.dataset.action === "edit") {
    setEditingState(transaction);
    return;
  }

  deleteTransaction(transaction.id);

  if (transactionIdInput.value === transaction.id) {
    resetForm();
  }
});

cancelEditBtn.addEventListener("click", resetForm);
typeFilter.addEventListener("change", render);
searchInput.addEventListener("input", render);

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  saveTheme(currentTheme);
  applyTheme(currentTheme);
});

clearAllBtn.addEventListener("click", () => {
  if (transactions.length === 0) {
    return;
  }

  const confirmed = window.confirm("Delete all transactions?");

  if (!confirmed) {
    return;
  }

  transactions = [];
  saveTransactions();
  resetForm();
  render();
});

resetForm();
applyTheme(currentTheme);
render();
