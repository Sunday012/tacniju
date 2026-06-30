# Godware Pending Work Notes

## Dream Records

- Dream summary must be category-first. It should show each category and the number of dreams under it.
- Clicking a category should open a compact list of dreams under that category.
- The dream list should show only title, member name, reservation number, and dream date.
- Clicking one dream should open the full dream detail page.
- Dream category cards should stay compact so they fit well on phones.

## Accounting Summaries

- Apply the same summary pattern across accounting: summary pages should first show categorized lists and totals, not raw voucher/detail records.
- Stock summary should show stock categories and total stock under each category.
- Clicking a stock category should show the stocks under that category.
- Clicking a stock item should show the sales/purchases under that stock.
- Clicking a sale or purchase should open the original voucher where that entry was made.

## Voucher Editing

- Existing saved vouchers must remain stable as their own saved copy.
- Editing a voucher must edit that same voucher record, not create or add another copy.
- Current issue to investigate: editing an existing voucher can double the amount because entries appear to be recreated/added instead of replaced.
- Remove the extra edit-voucher flow if it is a separate duplicate path.

## Bank Accounts

- Bank account list should look like the provided Sokobook reference.
- Header should show overall account balance only, with clear color:
  - green for positive/credit available balance
  - red for debit/negative balance
- Remove outside summary boxes for grouped, debit, and credit on bank pages.
- Outside account rows should show only account name and current account balance.
- Bank name, account number, group, opening balance, and other details should stay inside the account detail page.
- Inside a bank account page, show actual/current balance, not opening balance.
- Rename Comments tab to Statement.
- Add a proper statement area/template later.

## Batch And Production

- Batch should not have rate.
- Batch should not show in daybook.
- Batch should be shown in a batch register.
- Move batch workflow from inventory book to production.
- Create a Batch Register that remains in inventory book as a copy.
- Batch Summary in production and Batch Register in inventory should represent the same saved batch copy.

## Printable Documents

- Add printable invoice templates for:
  - payments
  - sales
  - purchases
  - reports
- The print style should be clean like the admin registration printout.
- Add payment slip and deposit slip features.
- Prefer typed voucher/slip records instead of uploading receipt images, to keep the app lighter.

## Cleanup Scope

- Remove accounting features that are too advanced or not useful for The Apostolic Church Nigeria accountants.
- Keep the accounting workflow simple and practical.
- Wait for the final delete list before removing modules.
