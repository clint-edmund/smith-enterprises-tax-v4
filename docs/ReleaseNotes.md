# Release 0.10 — Sprint 0.10.4C.1

## Business Organizer

**Internal ID:** RC1.3C.1

## Goal

Add the client-facing Business organizer section so clients with
self-employment or business activity can provide the information needed
before staff begin tax preparation in TaxWise.

This sprint continues the Version 1.0 objective of replacing the paper
organizer with a complete, secure digital intake process.

## Business outcome

After this sprint, a client can:

- Indicate whether they operated a business or earned self-employment income.
- Add one or more businesses.
- Enter identifying and operating information for each business.
- Enter gross income and common business expenses.
- identify business-related tax considerations.
- Save progress and return later.
- Mark the Business section complete.
- Continue to the Rental Property section.

Staff Organizer Review integration is intentionally deferred until all
client-facing organizer modules are complete.

## User-visible changes

The locked Business section becomes available after the client completes
the preceding Income section.

The Business page supports:

- No-business confirmation.
- Multiple business records.
- Business name and DBA.
- Business entity type.
- EIN, when applicable.
- Principal business activity.
- Business address.
- Date the business started.
- Ownership percentage.
- Accounting method.
- Gross receipts and other business income.
- Common deductible expense categories.
- Vehicle-use indication.
- Home-office indication.
- Employee indication.
- Inventory indication.
- Supporting notes.
- Add, edit, and delete actions.
- Completion and progress tracking.

## Important boundary

Atlas collects and organizes the information required for staff review.

Atlas does not:

- Calculate taxable business income.
- Determine whether an expense is legally deductible.
- Prepare Schedule C or another tax form.
- Replace professional tax judgment.
- Replace TaxWise.

Tax calculations and tax-form preparation remain in TaxWise.

## Database

Add:

```text
client_tax_organizer_businesses