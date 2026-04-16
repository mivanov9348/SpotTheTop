import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/layout/Layout';

import Home from './components/pages/home/Home';
import LeaguesPage from './components/pages/leagues/LeaguesPage';
import PlayersPage from './components/pages/players/PlayersPage';
import AdminPage from './components/pages/admin/AdminPage';
import LeagueDetailsPage from './components/pages/leagues/LeagueDetailsPage'; 
import TeamDetailsPage from './components/pages/teams/TeamDetailsPage'; 
import FeedPage from './components/pages/feed/FeedPage';
import MatchesPage from './components/pages/matches/MatchesPage'; // НОВО

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/feed" element={<FeedPage />} />
          
          {/* НОВИЯТ ТАБ ЗА МАЧОВЕ */}
          <Route path="/matches" element={<MatchesPage />} />
          
          <Route path="/leagues" element={<LeaguesPage />} />
          <Route path="/leagues/:id" element={<LeagueDetailsPage />} /> 
          <Route path="/teams/:id" element={<TeamDetailsPage />} /> 
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/admin" element={<AdminPage />} /> 
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;