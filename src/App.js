import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ComposeMessage from "./components/ComposeMessage";
import Inbox from "./components/Inbox";
import AdminPanel from "./components/AdminPanel";
import GmailInbox from "./components/GmailInbox";
import GmailDashboard from "./components/GmailDashboard";
import GmailCompose from "./components/GmailCompose";
import "./App.css";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />                                     
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Gmail-style UI Routes */}
          <Route path="/gmail-dashboard" element={<GmailDashboard />} />
          <Route path="/gmail-inbox" element={<GmailInbox />} />
          <Route path="/gmail-compose" element={<GmailCompose />} />
          <Route path="/compose" element={<ComposeMessage />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {/* Admin Panel - Available on all pages */}
        <AdminPanel />
      </Router>
    </AppProvider>
  );
}

export default App;
