# Expense Tracker

A clean, responsive web app for recording income and expenses, monitoring your
balance, and finding transactions quickly. All data is stored locally in your
browser, so no account or backend is required.

## Features

- Add, edit, and delete income or expense transactions
- View live balance, income, and expense totals in Indian Rupees (INR)
- Search transactions by description or category
- Filter records by income or expense
- Switch between light and dark themes
- Persist transactions and theme preferences with `localStorage`
- Clear all transaction data with a confirmation prompt
- Responsive layout for desktop and mobile screens

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- Browser Web Storage API

## Getting Started

No dependencies or build tools are required.

1. Clone the repository:

   ```bash
   git clone https://github.com/jharajiv16/Expense-tracker-.git
   cd Expense-tracker-
   ```

2. Open `index.html` in a modern browser.

For a local development server, run:

```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## How to Use

1. Enter a description, amount, date, and category.
2. Select whether the transaction is income or an expense.
3. Select **Add transaction** to save the record.
4. Use the transaction table to edit, delete, search, or filter records.

## Data Storage

Transactions are saved in the current browser's `localStorage`. They are not
sent to a server and will not automatically sync across browsers or devices.
Clearing the browser's site data will remove saved transactions.

## Project Structure

```text
.
├── index.html   # Application markup
├── style.css    # Layout, responsive styles, and themes
├── script.js    # Transaction logic and local persistence
└── README.md    # Project documentation
```

## Contributing

Contributions are welcome. Fork the repository, create a branch for your
change, and open a pull request with a clear description of the update.
