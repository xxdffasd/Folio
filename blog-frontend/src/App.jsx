import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRouter from './routes/AppRouter.jsx';

/**
 * Provider order matters: AuthProvider must be INSIDE BrowserRouter only if
 * it needs router hooks (it doesn't here), but it must wrap AppRouter so
 * every route — and ProtectedRoute in particular — can call useAuth().
 */
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
