
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateTableData } from '../utils/dataGenerator';

// Interface for cell value change
interface CellValuePayload {
  rowKey: string;
  dataIndex: string;
  value: number;
}

// Initial state includes both the data and any overridden parent values
interface TableState {
  data: any[];
  overriddenValues: Record<string, Record<string, boolean>>;
}

const initialState: TableState = {
  data: generateTableData(1000), // Generate 1000 rows on init
  overriddenValues: {}
};

// Helper to recalculate parent values from children
const recalculateParentValues = (state: TableState) => {
  state.data.forEach(row => {
    if (row.children && row.children.length > 0) {
      // Calculate what should be the sum of children values for numeric columns
      const objectifsColumns = ['nbUbCampagne', 'nbUbHyper2', 'nbUbHyper1', 'nbUbSuper2', 'nbUbSuper1'];
      
      objectifsColumns.forEach(column => {
        const calculatedSum = row.children.reduce((sum: number, child: any) => sum + (Number(child[column]) || 0), 0);
        
        // If there's no overridden value, set the parent value to the sum
        if (!state.overriddenValues[row.key]?.[column]) {
          row[column] = calculatedSum;
        }
        // If there is an overridden value but it's now equal to the sum, remove the override
        else if (row[column] === calculatedSum) {
          if (state.overriddenValues[row.key]) {
            delete state.overriddenValues[row.key][column];
            if (Object.keys(state.overriddenValues[row.key]).length === 0) {
              delete state.overriddenValues[row.key];
            }
          }
        }
      });
    }
  });
};

// Create the table slice
const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    updateCellValue: (state, action: PayloadAction<CellValuePayload>) => {
      const { rowKey, dataIndex, value } = action.payload;
      
      // Find the row with the given key
      const findRow = (rows: any[]): any => {
        for (const row of rows) {
          if (row.key === rowKey) return row;
          if (row.children) {
            const childRow = findRow(row.children);
            if (childRow) return childRow;
          }
        }
        return null;
      };
      
      const row = findRow(state.data);
      if (!row) return;
      
      // Update the cell value
      row[dataIndex] = value;
      
      // If this is a parent row, mark this value as overridden
      if (row.children && row.children.length > 0) {
        const sumOfChildren = row.children.reduce(
          (sum: number, child: any) => sum + (Number(child[dataIndex]) || 0), 
          0
        );
        
        // If the value doesn't match the sum of children, mark as overridden
        if (value !== sumOfChildren) {
          if (!state.overriddenValues[rowKey]) {
            state.overriddenValues[rowKey] = {};
          }
          state.overriddenValues[rowKey][dataIndex] = true;
        }
        // If value equals sum of children, remove override flag
        else if (state.overriddenValues[rowKey]?.[dataIndex]) {
          delete state.overriddenValues[rowKey][dataIndex];
          if (Object.keys(state.overriddenValues[rowKey]).length === 0) {
            delete state.overriddenValues[rowKey];
          }
        }
      }
      
      // If this is a child row, recalculate parent values
      recalculateParentValues(state);
    }
  }
});

export const { updateCellValue } = tableSlice.actions;

export default tableSlice.reducer;
