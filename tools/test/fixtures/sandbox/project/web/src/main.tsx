import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { Orders } from './pages/Orders';

createRoot(document.getElementById('app')!).render(<AuthProvider><Orders /></AuthProvider>);
