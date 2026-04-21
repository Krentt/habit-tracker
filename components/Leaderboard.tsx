'use client';

import UserAvatar from './UserAvatar';

interface UserStreak {
  userId: string;
  name: string;
  streak: number;
}

interface LeaderboardProps {
  users: UserStreak[];
  currentUser: string;
}

export default function Leaderboard({ users, currentUser }: LeaderboardProps) {
  if (users.length === 0) return null;

  // Sort by streak descending
  const sorted = [...users].sort((a, b) => b.streak - a.streak);
  const maxStreak = sorted[0]?.streak || 0;

  return (
    <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
      <h2 className="text-xl font-bold text-white mb-6 text-center">
        🏆 Leaderboard Minggu Ini
      </h2>

      <div className="space-y-4">
        {sorted.map((user, index) => {
          const isCurrentUser = currentUser === user.name;
          const isTie = index > 0 && sorted[index - 1].streak === user.streak;
          const isWinner = index === 0 && maxStreak > 0;
          const isLoser = index === sorted.length - 1 && user.streak < maxStreak;

          return (
            <div
              key={user.userId}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isWinner
                  ? 'border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-orange-500/10'
                  : 'border-zinc-800 bg-zinc-900/50'
              }`}
            >
              {isWinner && (
                <div className="absolute -top-3 -right-2 text-3xl">👑</div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} size="md" />
                  <div>
                    <div className="text-lg font-semibold text-white flex items-center gap-2 capitalize">
                      {user.name}
                      {isCurrentUser && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          Kamu
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-400">{user.streak} hari aktif</div>
                  </div>
                </div>
                <div className="text-right">
                  {isWinner && (
                    <div className="text-4xl">🏆</div>
                  )}
                  {isLoser && maxStreak > 0 && !isTie && (
                    <div className="text-4xl">💩</div>
                  )}
                  {isTie && maxStreak > 0 && (
                    <div className="text-4xl">🤝</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {maxStreak > 0 && sorted.every(u => u.streak === maxStreak) && (
        <div className="mt-4 text-center text-sm text-zinc-400 bg-zinc-900/50 py-2 rounded-lg">
          Seri! Kalian berdua keren 🔥
        </div>
      )}
    </div>
  );
}
