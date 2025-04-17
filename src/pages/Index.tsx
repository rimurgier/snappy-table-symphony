
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import VirtualizedTable from '../components/VirtualizedTable';

const Index = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-white">
        <div className="w-full">
          <h1 className="text-2xl font-bold p-4">Campaign Performance Dashboard</h1>
          
          <div className="w-full px-4">
            <VirtualizedTable />
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default Index;
