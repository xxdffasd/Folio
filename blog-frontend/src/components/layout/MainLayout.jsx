import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

// Shared shell for every route — nested routes render into <Outlet />.
// Kept as its own component (rather than inlined in AppRouter) so pages
// don't each need to remember to render the Navbar/Footer themselves.
const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
