import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthContextProvider } from './context/AuthContext';
import App from './App';
import SidebarProvider from './context/TabContext';

createRoot(document.getElementById('root')!).render(
    <AuthContextProvider>
        <SidebarProvider>
            <App/>
        </SidebarProvider>
    </AuthContextProvider>
)
