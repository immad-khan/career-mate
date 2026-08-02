import React from 'react';
import ResumeBuilderPage from './page';

// This component simulates the Next.js Layout/Page structure
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Simulating a Sidebar Layout would go here */}
      <main className="w-full">
        <ResumeBuilderPage />
      </main>
    </div>
  );
};

export default App;
