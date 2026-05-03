## SalaryStory (Personal Finance Tracker)

Mobile + desktop friendly personal finance tracker built with vanilla HTML/CSS/JS. Works offline-ish as a simple PWA-style single page and stores data locally in your browser.

## Run

- **Open directly**: open `src/index.html` in a browser.
- **Recommended**: use a local static server (avoids any browser restrictions around file URLs).

## Data & privacy

- **Default behavior**: data is stored locally in your browser via `localStorage`.
- **No backend**: nothing is sent to any server by this app.
- **Backup**: use **Export JSON** / **Import JSON** to move data between browsers/devices.

## Default template (sanitized)

On first load (when there is no existing saved data), the app creates a starter template with **generic, non-personal** categories. You can rename/delete anything.

Example sections and items:

- **Annual Plans**: subscriptions, annual fees, travel, gifts
- **Household**: rent, utilities, help/services
- **Family Support**: family support, emergency fund
- **Everyday Expenses**: groceries, commute, eating out, shopping, fitness
- **Investments**: retirement, mutual funds, stocks, gold
- **Deductions**: provident fund / tax / employer deductions

Notes:

- The template amounts are **example numbers only**. Replace with your real values.
- If you already have saved data, the app will load that instead of generating a fresh template.

## Features

| Feature                                                                    | Status |
| -------------------------------------------------------------------------- | ------ |
| **Year + month dropdowns**                                                 | ✅     |
| **Export / Import JSON**                                                   | ✅     |
| **Paid checkbox per item** (paid style + strikethrough)                    | ✅     |
| **Period dropdown per item** (month/year/6 months/quarter/week/day/one-time)| ✅     |
| **Add/Edit/Delete sections and items**                                     | ✅     |
