
import { useEffect, useState } from 'react';
import './index.css';

const times = ['09:00 AM', '10:40 AM', '12:20 PM', '02:00 PM', '03:40 PM', '05:20 PM'];
const today = new Date();

export default function App() {
  const [view, setView] = useState('home');
  const [serviceType, setServiceType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blocked, setBlocked] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');

  const fetchBlocked = async () => {
    const res = await fetch('/api/blocked');
    const data = await res.json();
    setBlocked(data);
  };

  const fetchBookings = async () => {
    const res = await fetch('/api/bookings');
    const data = await res.json();
    setBookings(data);
  };

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      setIsAdmin(true);
      fetchBookings();
      fetchBlocked();
    } else alert('Incorrect password');
  };

  const blockTime = async (date, time, block) => {
    await fetch('/api/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, time, block })
    });
    fetchBlocked();
  };

  const bookNow = async (time) => {
    const name = prompt('Enter your name');
    const phone = prompt('Enter your phone number');
    if (!name || !phone) return;
    const date = selectedDate.toISOString().split('T')[0];
    await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, service_type: serviceType, date, time })
    });
    alert('Booking confirmed!');
    setView('home');
  };

  const renderTimes = (dateObj) => {
    const date = dateObj.toISOString().split('T')[0];
    return (
      <div className="grid grid-cols-2 gap-2">
        {times.map(t => {
          const isBlocked = blocked.find(b => b.date === date && b.time === t);
          return (
            <button
              key={t}
              className={`p-2 rounded shadow ${isBlocked ? 'bg-gray-300' : 'bg-green-200'}`}
              onClick={() => isAdmin ? blockTime(date, t, !isBlocked) : bookNow(t)}
            >
              {t} {isBlocked && '(Blocked)'}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">FreshFade Barber</h1>

      {view === 'home' && (
        <>
          <button className="w-full p-4 bg-blue-200 mb-3 rounded" onClick={() => { setServiceType('Adult'); setView('book'); }}>Book Adult Haircut</button>
          <button className="w-full p-4 bg-pink-200 mb-3 rounded" onClick={() => { setServiceType('Kids'); setView('book'); }}>Book Kids Haircut</button>
          <button className="underline text-sm" onClick={() => setView('admin')}>Admin Login</button>
        </>
      )}

      {view === 'book' && (
        <>
          <h2 className="text-xl font-semibold mb-2">Select a Day</h2>
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(7)].map((_, i) => {
              const d = new Date(today);
              d.setDate(d.getDate() + i);
              return (
                <button key={i} className="px-2 py-1 bg-neutral-200 rounded" onClick={() => setSelectedDate(d)}>
                  {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </button>
              );
            })}
          </div>
          <h2 className="text-xl font-semibold mb-2">Available Times</h2>
          {renderTimes(selectedDate)}
          <button className="mt-4 underline text-sm" onClick={() => setView('home')}>← Back</button>
        </>
      )}

      {view === 'admin' && !isAdmin && (
        <>
          <input
            type="password"
            placeholder="Enter admin password"
            className="p-2 border w-full mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-blue-500 text-white py-2 rounded" onClick={handleLogin}>Login</button>
          <button className="mt-2 underline text-sm" onClick={() => setView('home')}>← Back</button>
        </>
      )}

      {isAdmin && view === 'admin' && (
        <>
          <h2 className="text-lg font-semibold mb-2">All Bookings</h2>
          <div className="text-left text-sm space-y-2">
            {bookings.map(b => (
              <div key={b.id} className="p-2 bg-white rounded shadow">
                <strong>{b.name}</strong> ({b.service_type})<br />
                {b.date} at {b.time} — {b.phone}
              </div>
            ))}
          </div>
          <button className="mt-4 underline text-sm" onClick={() => setView('home')}>← Back</button>
        </>
      )}
    </div>
  );
}
