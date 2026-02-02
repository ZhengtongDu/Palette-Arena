import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Compare } from './pages/Compare';
import { Rate } from './pages/Rate';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter basename="/Palette-Arena">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/rate" element={<Rate />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
