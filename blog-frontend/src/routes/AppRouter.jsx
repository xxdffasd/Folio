import { Routes, Route } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import Home from '../pages/Home.jsx';
import SinglePost from '../pages/SinglePost.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import CreatePost from '../pages/CreatePost.jsx';
import EditPost from '../pages/EditPost.jsx';
import AuthorDashboard from '../pages/AuthorDashboard.jsx';
import NotFound from '../pages/NotFound.jsx';

/**
 * All routes render inside <MainLayout> (Navbar + Footer persist across
 * navigation instead of remounting). Protected routes are wrapped in
 * <ProtectedRoute>, which itself renders the page as `children` — the
 * routing table stays declarative and it's obvious at a glance which
 * routes require auth vs which are public.
 */
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* ---------------- Public routes ---------------- */}
        <Route index element={<Home />} />
        <Route path="posts/:slug" element={<SinglePost />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* ---------------- Protected routes (any authenticated role) ---------------- */}
        {/* (Comments/likes trigger from within SinglePost itself, so no separate route needed) */}

        {/* ---------------- Protected routes (author role only) ---------------- */}
        <Route
          path="create-post"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit-post/:id"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <EditPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['author']}>
              <AuthorDashboard />
            </ProtectedRoute>
          }
        />

        {/* ---------------- Fallback ---------------- */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
