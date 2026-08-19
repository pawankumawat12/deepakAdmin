import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { persistor, store } from './context/store'
import './index.css'
import App from './App.jsx'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

createRoot(document.getElementById('root')).render(
  <StrictMode>  
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter><App /></BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
