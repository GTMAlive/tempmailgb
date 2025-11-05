import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import NoteMail from './NoteMail';
import Dashboard from './Dashboard';
import BallonMail from './BallonMail';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/notemail" element={<NoteMail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ballonmail" element={<BallonMail />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
