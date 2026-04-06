import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';

import Home from './components/pages/Home';
import LeaguesPage from './components/pages/LeaguesPage';
import PlayersPage from './components/pages/PlayersPage';
import AdminPage from './components/pages/admin/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/feed" element={<div className="text-center p-5"><h2>📰 Community Feed</h2><p>Coming soon...</p></div>} />
          <Route path="/leagues" element={<LeaguesPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/admin" element={<AdminPage />} /> 
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;