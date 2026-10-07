import { useEffect, useState } from 'react';
import api from '../services/api';

export default function UserDashboard() {
  const [stats, setStats] = useState({});
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    api.get('/dashboard/user').then(r => setStats(r.data.data));
    api.get('/notifications').then(r => setNotifs(r.data.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          ['Lost Reports', stats.lostReports],
          ['Found Reports', stats.foundReports],
          ['Active Claims', stats.activeClaims],
          ['Matches', stats.matches],
          ['Returned', stats.returned],
        ].map(([label, val]) => (
          <div key={label} className="bg-white p-4 rounded shadow text-center">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{val ?? 0}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-2">Recent Notifications</h2>
      <div className="bg-white rounded shadow divide-y">
        {notifs.length === 0 && <p className="p-4 text-gray-500">No notifications</p>}
        {notifs.map(n => (
          <div key={n.id} className="p-3">
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-gray-600">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}