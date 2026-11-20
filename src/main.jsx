import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Self-hosted brand fonts (Granate/Sage brand system — never a Google Fonts
// CDN link). Headings: Source Serif 4 600. Body: Source Sans 3 400/600.
import '@fontsource/source-serif-4/600.css'
import '@fontsource/source-sans-3/400.css'
import '@fontsource/source-sans-3/600.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
