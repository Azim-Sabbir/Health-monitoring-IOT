import React from 'react';
import ReactDOM from 'react-dom/client';
import './bootstrap';
import './App.css';
import './index.css'
import Monitor from "./Monitor.jsx";


function App() {
    return (<Monitor/>);
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
