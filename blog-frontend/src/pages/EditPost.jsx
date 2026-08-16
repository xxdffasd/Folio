import { useParams } from 'react-router-dom';

const EditPost = () => {
  const { id } = useParams();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Edit post {id}</h1>
      <p className="mt-2 text-gray-600">
        Protected — only reachable by the post's own author. Pre-filled form wired up in a later phase.
      </p>
    </div>
  );
};

export default EditPost;
