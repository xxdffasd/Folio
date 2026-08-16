// Example shared/common component — reusable across any page (Home, SinglePost, etc).
const Spinner = () => (
  <div className="flex justify-center py-10">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
  </div>
);

export default Spinner;
