import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  LOST:          'bg-red-100 text-red-700 border-red-200',
  FOUND:         'bg-green-100 text-green-700 border-green-200',
  POSSIBLE_MATCH:'bg-yellow-100 text-yellow-700 border-yellow-200',
  CLAIMED:       'bg-blue-100 text-blue-700 border-blue-200',
  RETURNED:      'bg-purple-100 text-purple-700 border-purple-200',
  CLOSED:        'bg-gray-100 text-gray-700 border-gray-200',
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function ItemCard({ item, tab }) {
  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.LOST;

  return (
    <Link
      to={`/item/${tab}/${item.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 group"
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {item.imageUrls?.[0] ? (
          <img
            src={'http://localhost:8080' + item.imageUrls[0]}
            alt={item.itemName}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
            {tab === 'lost' ? '🔍' : '📦'}
          </div>
        )}

        {/* Status badge */}
        <span
          className={`absolute top-2 left-2 text-xs font-semibold px-2 py-1 rounded-full border ${statusStyle}`}
        >
          {item.status || 'UNKNOWN'}
        </span>

        {/* Time badge */}
        <span className="absolute top-2 right-2 text-xs bg-black/60 text-white px-2 py-1 rounded-full">
          {timeAgo(item.createdAt)}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-gray-800 truncate">{item.itemName}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 truncate">
          <span>📍</span> {item.location || 'No location'}
        </p>

        {item.categoryId && (
          <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
            {item.categoryId}
          </span>
        )}
      </div>
    </Link>
  );
}