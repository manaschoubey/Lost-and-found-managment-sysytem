import { Link } from 'react-router-dom';

export default function ItemCard({ item, type = 'lost' }) {
  const statusColors = {
    OPEN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    MATCHED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    CLAIMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    RETURNED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    CLOSED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const typeLabel = type === 'lost' ? 'Lost' : 'Found';
  const typeBadge =
    type === 'lost'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : 'bg-teal-500/20 text-teal-400 border-teal-500/30';

  const imageUrl =
    item.imageUrls && item.imageUrls.length > 0
      ? `http://localhost:8080${item.imageUrls[0]}`
      : null;

  return (
    <Link
      to={`/items/${type}/${item.id}`}
      className="group block bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-700/50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeBadge}`}>
            {typeLabel}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[item.status] || statusColors.OPEN}`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {item.title}
        </h3>
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          {/* Location */}
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {item.location || item.locationFound || 'Unknown'}
          </span>

          {/* Date */}
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
