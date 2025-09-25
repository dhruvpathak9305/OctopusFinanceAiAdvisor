# Expense Splitting

This documentation covers the expense splitting feature of Octopus Finance, which allows users to split expenses among groups and individuals.

## Overview

The expense splitting feature enables users to:

- Create expense-sharing groups
- Add individual contacts for one-off splits
- Split transactions equally, by percentage, or with custom amounts
- Track balances and settlements

## Documentation Sections

- [Database Schema](./database-schema.md): Database tables and relationships
- [API Reference](./api-reference.md): Service methods and usage
- [UI Components](./ui-components.md): Component documentation

## Getting Started

To use the expense splitting feature:

1. Add individuals to your contacts or create a group
2. When creating a transaction, toggle the "Split with others" option
3. Select participants and choose a split method
4. Complete the transaction to record the splits

## Key Concepts

### Split Types

- **Equal**: Divides the amount equally among all participants
- **Percentage**: Assigns a percentage of the total to each participant
- **Custom**: Allows manual entry of specific amounts for each participant

### Groups vs. Individuals

- **Groups**: Persistent collections of people for regular expense sharing
- **Individuals**: One-off contacts for occasional expense sharing

### Settlements

Settlements occur when a participant pays their share of an expense, marking that portion as settled.
