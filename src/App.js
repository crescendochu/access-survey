// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import SurveyForm from './survey/SurveyForm/SurveyForm.js';
import 'tailwindcss/tailwind.css';


function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<SurveyForm />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;


