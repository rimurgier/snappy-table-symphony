
// Simple placeholder - no external dependencies

export const updateCellValue = (payload: any) => ({
  type: 'table/updateCellValue',
  payload
});

const initialState = { data: [] };

export default function tableReducer(state = initialState, action: any) {
  return state;
}
