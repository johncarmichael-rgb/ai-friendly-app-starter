import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Companies = lazy(() => import('./pages/Companies'));
const Users = lazy(() => import('./pages/Users'));
const Features = lazy(() => import('./pages/Features'));
const Permissions = lazy(() => import('./pages/Permissions'));

function App() {
  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/users" element={<Users />} />
          <Route path="/features" element={<Features />} />
          <Route path="/permissions" element={<Permissions />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}

export default App;
