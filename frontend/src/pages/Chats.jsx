import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chats() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api.get('/chats');
      setRooms(r.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">💬 My Chats</h1>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && rooms.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="text-6xl mb-3">💬</div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">No chats yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Chats appear here after your claim is approved.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {rooms.map((room) => {
          const isFinder = room.finderUserId === user?.email;
          const otherRole = isFinder ? 'Claimant' : 'Finder';
          return (
            <Link
              key={room.id}
              to={`/chats/${room.id}`}
              className="block bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold dark:text-white">{room.itemName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    You are the <strong>{isFinder ? 'Finder' : 'Claimant'}</strong>
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-1 rounded-full">
                  {room.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}