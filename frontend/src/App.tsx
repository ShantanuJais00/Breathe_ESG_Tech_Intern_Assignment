import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import UploadCenter from './pages/UploadCenter';
import ReviewQueue from './pages/ReviewQueue';
import { Activity, Upload, CheckSquare } from 'lucide-react';

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-700 tracking-tight">Acme ESG</h1>
        </div>
        <nav className="px-4 py-2 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">
            <Activity className="w-5 h-5 text-gray-400" /> Dashboard
          </Link>
          <Link to="/upload" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">
            <Upload className="w-5 h-5 text-gray-400" /> Upload Center
          </Link>
          <Link to="/review" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium">
            <CheckSquare className="w-5 h-5 text-gray-400" /> Review Queue
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadCenter />} />
            <Route path="/review" element={<ReviewQueue />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
