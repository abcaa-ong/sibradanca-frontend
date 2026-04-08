import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './css/app.css'
import './css/access-floating-menu.css'
import './css/admin-page.css'
import './css/home-page.css'
import './css/statistics-page.css'
import './css/protocol-page.css'
import './css/privacy-page.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
