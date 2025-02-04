import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileUploadPage from "./componets/FileUploadPage";
import {HomePage} from "./componets/Home";
import ApiAdminPage from "./componets/ApiAdmin";
import KbAdminPage from "./componets/KbAdmin";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/channel" element={<ApiAdminPage />} />
          <Route path="/admin/kb" element={<KbAdminPage />} />
          <Route path="/documents/upload" element={<FileUploadPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
