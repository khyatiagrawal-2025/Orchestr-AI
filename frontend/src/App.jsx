import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import MissionsPage from "./pages/MissionsPage";
import MissionDetailPage from "./pages/MissionDetailPage";
import AgentsPage from "./pages/AgentsPage";
import OrchestratePage from "./pages/OrchestratePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MissionDossier from "./pages/MissionDossier";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<HomePage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Missions */}
        <Route path="/missions" element={<MissionsPage />} />

        {/* Mission Details */}
        <Route path="/missions/:id" element={<MissionDetailPage />} />

        {/* Agents */}
        <Route path="/agents" element={<AgentsPage />} />

        {/* Main AI Workspace */}
        <Route path="/orchestrate" element={<OrchestratePage />} />

        {/* Analytics */}
        <Route path="/analytics" element={<AnalyticsPage />} />

        {/* Mission Dossier — storytelling, architecture, contributors */}
        <Route path="/mission-dossier" element={<MissionDossier />} />

        {/* Fallback */}
        <Route path="*" element={<HomePage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;