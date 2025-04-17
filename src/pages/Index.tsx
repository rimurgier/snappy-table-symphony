
import React from 'react';
import { Provider } from 'react-redux';
import { Card } from '@/components/ui/card';
import { store } from '../store';
import VirtualizedTable from '../components/VirtualizedTable';

const Index = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">Campaign Performance Dashboard</h1>
          
          <Card>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Campaign Data Table</h2>
              <p className="mb-4">This virtualized table supports:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>1000+ parent rows with expandable children</li>
                <li>Fixed first and last columns with horizontally scrollable middle columns</li>
                <li>Editable numeric cells with value persistence</li>
                <li>Automatic summation of child values in parent rows</li>
                <li>Orange indicator dots for manually overridden values</li>
              </ul>
              
              <VirtualizedTable />
            </div>
          </Card>
        </div>
      </div>
    </Provider>
  );
};

export default Index;
