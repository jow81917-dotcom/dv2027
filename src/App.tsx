import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Payment from './pages/Payment';
import Status from './pages/Status';

export function InnerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="site-header">
        <Link to="/" className="logo">DV Assist</Link>
        <nav>
          <Link to="/register">Register</Link>
          <Link to="/status">Check Status</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <p>Independent private service — not affiliated with the U.S. government.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/status" element={<Status />} />
      </Routes>
    </BrowserRouter>
  );
}
