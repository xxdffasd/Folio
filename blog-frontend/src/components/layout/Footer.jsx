import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-[#FAFAF7]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <Link to="/" className="font-display text-xl italic text-stone-900">
          Folio<span className="text-accent-700">.</span>
        </Link>

        <p className="text-sm text-stone-500">
          &copy; {new Date().getFullYear()} Folio. Stories worth reading.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
