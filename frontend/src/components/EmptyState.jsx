import { Link } from 'react-router-dom';

export default function EmptyState({
  icon = '🔍',
  title = 'Nothing here yet',
  message = 'Try adjusting your search or filters.',
  actionLabel,
  actionTo,
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="text-7xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-700">{title}</h3>
      <p className="text-gray-500 mt-2 max-w-sm">{message}</p>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}