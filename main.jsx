// frontend/src/main.jsx - Sirf zaroori files import karein
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // 💡 Ab yeh aapke dashbaord ka code hai
import './index.css'; // Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Aapka main component yahan render ho raha hai */}
    <App /> 
  </React.StrictMode>,
);