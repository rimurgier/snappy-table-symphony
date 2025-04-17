
// Simple placeholder - no external dependencies

export interface RootState {
  table: {
    data: any[];
  }
}

export const store = {
  getState: () => ({
    table: { data: [] }
  })
};

export type AppDispatch = any;
