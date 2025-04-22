import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { generateTableData } from '../utils/dataGenerator'

// Interface for cell value change
interface CellValuePayload {
  rowKey: string
  dataIndex: string
  value: number
}

// Initial state includes both the data and any overridden values
interface TableState {
  data: any[]
  overriddenValues: Record<string, Record<string, boolean>>
}

const initialState: TableState = {
  data: generateTableData(100), // Generate 1000 rows on init
  overriddenValues: {},
}

// Helper to recalculate all parent values from children at any level
const recalculateParentValues = (state: TableState) => {
  // Recursively find a row by key in the data tree
  const findRowByKey = (rows: any[], key: string): any => {
    for (const row of rows) {
      if (row.key === key) return row
      if (row.children) {
        const found = findRowByKey(row.children, key)
        if (found) return found
      }
    }
    return null
  }

  // Get all numeric columns for summation
  const getNumericColumns = (row: any) => {
    return Object.keys(row).filter(
      (key) =>
        typeof row[key] === 'number' &&
        key !== 'key' &&
        key !== 'level' &&
        !['isTotal'].includes(key)
    )
  }

  // Process parents from bottom up (level 1 first, then level 0)
  // Find level 1 parents (those with level 2 children)
  state.data.forEach((parent) => {
    if (!parent.children) return

    parent.children.forEach((level1Child) => {
      if (!level1Child.children) return

      // Sum up level 2 children values for each level 1 parent
      const numericColumns = getNumericColumns(level1Child)

      numericColumns.forEach((column) => {
        const calculatedSum = level1Child.children.reduce(
          (sum: number, level2Child: any) => sum + (Number(level2Child[column]) || 0),
          0
        )

        // If there's no overridden value, set the level 1 parent value to the sum
        if (!state.overriddenValues[level1Child.key]?.[column]) {
          level1Child[column] = calculatedSum
        }
        // If there is an overridden value but it's now equal to the sum, remove the override
        else if (level1Child[column] === calculatedSum) {
          if (state.overriddenValues[level1Child.key]) {
            delete state.overriddenValues[level1Child.key][column]
            if (Object.keys(state.overriddenValues[level1Child.key]).length === 0) {
              delete state.overriddenValues[level1Child.key]
            }
          }
        }
      })
    })

    // Now sum up level 1 children to level 0 parent
    const numericColumns = getNumericColumns(parent)

    numericColumns.forEach((column) => {
      const calculatedSum = parent.children.reduce(
        (sum: number, level1Child: any) => sum + (Number(level1Child[column]) || 0),
        0
      )

      // If there's no overridden value, set the parent value to the sum
      if (!state.overriddenValues[parent.key]?.[column]) {
        parent[column] = calculatedSum
      }
      // If there is an overridden value but it's now equal to the sum, remove the override
      else if (parent[column] === calculatedSum) {
        if (state.overriddenValues[parent.key]) {
          delete state.overriddenValues[parent.key][column]
          if (Object.keys(state.overriddenValues[parent.key]).length === 0) {
            delete state.overriddenValues[parent.key]
          }
        }
      }
    })
  })
}

// Create the table slice
const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    updateCellValue: (state, action: PayloadAction<CellValuePayload>) => {
      const { rowKey, dataIndex, value } = action.payload

      // Find the row with the given key
      const findRow = (rows: any[]): any => {
        for (const row of rows) {
          if (row.key === rowKey) return row
          if (row.children) {
            const childRow = findRow(row.children)
            if (childRow) return childRow
          }
        }
        return null
      }

      const row = findRow(state.data)
      if (!row) return

      // Update the cell value
      row[dataIndex] = value

      // If this is a parent row, mark this value as overridden
      if (row.children && row.children.length > 0) {
        const sumOfChildren = row.children.reduce(
          (sum: number, child: any) => sum + (Number(child[dataIndex]) || 0),
          0
        )

        // If the value doesn't match the sum of children, mark as overridden
        if (value !== sumOfChildren) {
          if (!state.overriddenValues[rowKey]) {
            state.overriddenValues[rowKey] = {}
          }
          state.overriddenValues[rowKey][dataIndex] = true
        }
        // If value equals sum of children, remove override flag
        else if (state.overriddenValues[rowKey]?.[dataIndex]) {
          delete state.overriddenValues[rowKey][dataIndex]
          if (Object.keys(state.overriddenValues[rowKey]).length === 0) {
            delete state.overriddenValues[rowKey]
          }
        }
      }

      // Recalculate parent values throughout the hierarchy
      recalculateParentValues(state)
    },
  },
})

export const { updateCellValue } = tableSlice.actions

export default tableSlice.reducer
