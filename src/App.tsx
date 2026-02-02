import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Compare } from './pages/Compare';
import { Rate } from './pages/Rate';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';

function App() {
  return (
    <BrowserRouter basename="/Palette-Arena">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/rate" element={<Rate />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
