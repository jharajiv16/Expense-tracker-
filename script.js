const STORAGE_KEY = "expense-tracker-transactions";
const THEME_STORAGE_KEY = "expense-tracker-theme";

const getElement = (id) => document.getElementById(id);
const form = getElement("transactionForm");
const transactionId = getElement("transactionId");
const { description, amount, date, category, type } = form.elements;
const typeFilter = getElement("typeFilter");
const searchInput = getElement("searchInput");
const transactionList = getElement("transactionList");
const emptyState = getElement("emptyState");
const formTitle = getElement("formTitle");
const submitBtn = getElement("submitBtn");
const cancelEditBtn = getElement("cancelEditBtn");
const clearAllBtn = getElement("clearAllBtn");
const themeToggle = getElement("themeToggle");
const themeToggleText = getElement("themeToggleText");
const transactionCount = getElement("transactionCount");
const balanceTotal = getElement("balanceTotal");
const incomeTotal = getElement("incomeTotal");
const expenseTotal = getElement("expenseTotal");

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

let transactions = loadTransactions();

function loadTransactions() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Could not parse stored transactions.", error);
    return [];
  }
}

function setTransactions(nextTransactions) {
  transactions = nextTransactions;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  render();
}

function getFilteredTransactions() {
  const selectedType = typeFilter.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  return transactions.filter((transaction) => {
    const matchesType = selectedType === "all" || transaction.type === selectedType;
    const searchableText = `${transaction.description} ${transaction.category}`.toLowerCase();
    return matchesType && searchableText.includes(searchTerm);
  });
}

function getTotals() {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === "income" || transaction.type === "expense") {
        totals[transaction.type] += transaction.amount;
      }
      return totals;
    },
    { income: 0, expense: 0 },
  );
}

function render() {
  const items = getFilteredTransactions();
  const { income, expense } = getTotals();

  balanceTotal.textContent = formatCurrency(income - expense);
  incomeTotal.textContent = formatCurrency(income);
  expenseTotal.textContent = formatCurrency(expense);
  transactionCount.textContent = `${items.length} ${items.length === 1 ? "record" : "records"}`;
  emptyState.classList.toggle("hidden", items.length > 0);
  transactionList.replaceChildren(...items.map(createTransactionRow));
}

function createTransactionRow(transaction) {
  const row = createElement("tr");
  const detailsCell = createElement("td");
  const amountCell = createElement(
    "td",
    `amount ${transaction.type}`,
    `${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}`,
  );
  const actionsCell = createElement("td");
  const actions = createElement("div", "actions");

  detailsCell.append(
    createElement("span", "record-title", transaction.description),
    createElement("span", `record-type ${transaction.type}`, transaction.type),
  );
  actions.append(
    createActionButton("edit", transaction),
    createActionButton("delete", transaction),
  );
  actionsCell.append(actions);
  row.append(
    detailsCell,
    createElement("td", "", transaction.category),
    createElement("td", "", formatDate(transaction.date)),
    amountCell,
    actionsCell,
  );

  return row;
}

function createElement(tag, className = "", text = "") {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

function createActionButton(action, transaction) {
  const label = action === "edit" ? "Edit" : "Delete";
  const button = createElement("button", `action-button ${action}`, label);

  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = transaction.id;
  button.setAttribute("aria-label", `${label} ${transaction.description}`);
  return button;
}

function setEditingState(transaction) {
  transactionId.value = transaction.id;
  description.value = transaction.description;
  amount.value = transaction.amount;
  date.value = transaction.date;
  category.value = transaction.category;
  type.value = transaction.type;
  formTitle.textContent = "Edit transaction";
  submitBtn.textContent = "Save changes";
  cancelEditBtn.classList.remove("hidden");
  description.focus();
}

function resetForm() {
  form.reset();
  transactionId.value = "";
  date.value = new Date().toISOString().slice(0, 10);
  formTitle.textContent = "Add transaction";
  submitBtn.textContent = "Add transaction";
  cancelEditBtn.classList.add("hidden");
}

function getFormData() {
  return {
    description: description.value.trim(),
    amount: amount.valueAsNumber,
    date: date.value,
    category: category.value.trim(),
    type: type.value,
  };
}

function createId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  themeToggleText.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = getFormData();
  const editingId = transactionId.value;

  if (editingId) {
    setTransactions(
      transactions.map((item) =>
        item.id === editingId ? { ...item, ...formData } : item,
      ),
    );
  } else {
    setTransactions([
      {
        id: createId(),
        createdAt: new Date().toISOString(),
        ...formData,
      },
      ...transactions,
    ]);
  }

  resetForm();
});

transactionList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const transaction = transactions.find((item) => item.id === button.dataset.id);
  if (!transaction) return;

  if (button.dataset.action === "edit") {
    setEditingState(transaction);
    return;
  }

  setTransactions(transactions.filter((item) => item.id !== transaction.id));
  if (transactionId.value === transaction.id) resetForm();
});

cancelEditBtn.addEventListener("click", resetForm);
typeFilter.addEventListener("change", render);
searchInput.addEventListener("input", render);

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
});

clearAllBtn.addEventListener("click", () => {
  if (!transactions.length || !window.confirm("Delete all transactions?")) return;

  setTransactions([]);
  resetForm();
});

resetForm();
applyTheme(localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light");
render();
