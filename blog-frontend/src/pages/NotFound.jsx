import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600">This page doesn't exist.</p>
      <Link to="/" className="text-blue-600 underline">Back to home</Link>
    </div>
  );
};

export default NotFound;
