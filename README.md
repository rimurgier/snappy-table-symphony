
# Virtualized Ant Design Table with Fixed Columns

This project demonstrates a high-performance table built with React, Ant Design, and react-window that can handle 1000+ rows with fixed columns and nested data structures.

## Features

- **Virtualization**: Handles 1000+ parent rows with expandable children using react-window
- **Fixed Columns**: First column (Campaign) and last column (Actions) stay fixed while others scroll horizontally
- **Editable Cells**: Numeric cells are editable with data persisted in Redux store
- **Parent-Child Summation**: Parent values automatically sum children values with visual indicators for overrides
- **Row Actions**: Interactive elements including popover menus and modal dialogs

## Setup Instructions

To run this project, you need to install the following dependencies:

```bash
npm install antd@4.24.15 @ant-design/icons@5.3.0 react-window@1.8.10 @reduxjs/toolkit@2.2.1 react-redux@9.1.0
```

These dependencies must be added to your package.json before the application can run properly.

## Implementation Details

The implementation follows a component-based architecture with these key elements:

1. `VirtualizedTable`: The main table component that leverages react-window's `VariableSizeGrid`
2. `EditableCell`: Reusable component for editable numeric cells
3. Redux store with a dedicated slice for table data management
4. Data generation utility that produces 1000+ parent rows with children

## Technical Decisions

### Virtualization Strategy

The table uses react-window's `VariableSizeGrid` component to efficiently render only the visible cells, drastically improving performance for large datasets. This approach maintains smooth scrolling even with thousands of rows.

### State Management

Redux is used to centrally manage the table data, with a dedicated slice that handles:
- Cell value updates
- Parent-child value relationships
- Automatic summation logic

### Fixed Columns Implementation

The first and last columns remain fixed while the middle columns scroll horizontally. This is achieved through a custom implementation of the grid layout with fixed position styling for the edge columns.

### Parent-Child Data Relationship

Parent rows automatically display the sum of their children's values. When a parent value is manually overridden to differ from the sum, an orange dot appears in the top-right corner of the cell to indicate the override.

## Code Structure

- `/src/components/VirtualizedTable`: Main table component and related UI elements
- `/src/store`: Redux setup with table data slice and actions
- `/src/utils`: Utility functions including the data generator

## Data Structure

The table data follows this structure:

```typescript
interface TableRow {
  key: string;
  campaign: string;
  shortCode?: string;
  color?: string;
  nbUbCampagne: number;
  nbUbHyper2: number;
  nbUbHyper1: number;
  nbUbSuper2: number;
  nbUbSuper1: number;
  status: string;
  children?: TableRow[];
  isTotal?: boolean;
}
```

## Performance Optimization

The table remains performant with 1000+ rows through:
1. Virtualized rendering (only visible cells are in the DOM)
2. Memoization of expensive calculations
3. Efficient update patterns that limit re-renders
4. Careful management of expanded/collapsed state
