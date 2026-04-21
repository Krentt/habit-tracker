'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';
import UserAvatar from './UserAvatar';

export default function LoginPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('mst_users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (selectedUserId) {
      const user = users.find(u => u.id === selectedUserId);
      if (user) {
        login(user);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">💪 Habit Tracker</h1>
          <p className="text-zinc-400">Pilih akun untuk masuk</p>
        </div>

        <div className="space-y-4 mb-8">
          {users.length === 0 ? (
            <div className="text-center text-zinc-400 py-8">
              Tidak ada user ditemukan di database
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full p-6 rounded-2xl border-2 transition-all ${
                  selectedUserId === user.id
                    ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <UserAvatar name={user.name} size="lg" />
                  <div className="text-left">
                    <div className="text-2xl font-semibold text-white capitalize">{user.name}</div>
                    <div className="text-sm text-zinc-400">ID: {user.id.slice(0, 8)}...</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <button
          onClick={handleLogin}
          disabled={!selectedUserId || users.length === 0}
          className={`w-full py-4 rounded-xl font-semibold transition-all ${
            selectedUserId && users.length > 0
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          Masuk
        </button>
      </div>
    </div>
  );
}
