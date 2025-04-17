
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import VirtualizedTable from '../components/VirtualizedTable';

const Index = () => {
  return (
    <Provider store={store}>
      <div className="h-screen w-full bg-white overflow-hidden flex flex-col">
        <h1 className="text-2xl font-bold p-4">Campaign Performance Dashboard</h1>
        
        <div className="flex-grow w-full">
          <VirtualizedTable />
        </div>
      </div>
    </Provider>
  );
};

export default Index;
