import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function daysBetween(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

async function getWorkoutMetrics(userId: string, userName: string, competitorId: string, competitorName: string) {
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: logs } = await supabase
    .from('mst_daily_logs')
    .select('date, activity, user_id')
    .gte('date', since90)
    .in('user_id', [userId, competitorId])
    .order('date', { ascending: false });

  const myLogs = (logs || []).filter(l => l.user_id === userId);
  const compLogs = (logs || []).filter(l => l.user_id === competitorId);

  const now = Date.now();
  const day30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const day60 = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const last30 = myLogs.filter(l => l.date >= day30);
  const prev30 = myLogs.filter(l => l.date >= day60 && l.date < day30);

  const breakdown: Record<string, number> = {};
  const last30Breakdown: Record<string, number> = {};
  const prev30Breakdown: Record<string, number> = {};

  for (const log of myLogs) {
    for (const act of (log.activity || [])) {
      breakdown[act] = (breakdown[act] || 0) + 1;
    }
  }
  for (const log of last30) {
    for (const act of (log.activity || [])) {
      last30Breakdown[act] = (last30Breakdown[act] || 0) + 1;
    }
  }
  for (const log of prev30) {
    for (const act of (log.activity || [])) {
      prev30Breakdown[act] = (prev30Breakdown[act] || 0) + 1;
    }
  }

  // Streak calculation
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const dates = myLogs.map(l => l.date).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    if (dates[i] === expected || (i === 0 && dates[0] === today)) {
      tempStreak++;
      if (i === 0 || dates[i - 1] === new Date(Date.now() - (i - 1) * 86400000).toISOString().split('T')[0]) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  const lastSession = myLogs[0]?.date ? `${daysBetween(myLogs[0].date)} hari lalu` : 'belum ada';

  // Day of week pattern
  const dayCount: Record<number, number> = {};
  for (const log of myLogs) {
    const d = new Date(log.date).getDay();
    dayCount[d] = (dayCount[d] || 0) + 1;
  }
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const sortedDays = Object.entries(dayCount).sort((a, b) => b[1] - a[1]);

  return {
    user: userName,
    period_days: 90,
    total_active_days: myLogs.length,
    last_session: lastSession,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    activity_breakdown: breakdown,
    trend: {
      last_30_days: last30.length,
      prev_30_days: prev30.length,
      direction: last30.length > prev30.length ? 'meningkat' : last30.length < prev30.length ? 'menurun' : 'stabil',
    },
    activity_trend_last_30: last30Breakdown,
    activity_trend_prev_30: prev30Breakdown,
    most_active_day: sortedDays[0] ? days[Number(sortedDays[0][0])] : '-',
    least_active_day: sortedDays[sortedDays.length - 1] ? days[Number(sortedDays[sortedDays.length - 1][0])] : '-',
    competitor: {
      name: competitorName,
      total_active_days_90: compLogs.length,
      last_30_days: compLogs.filter(l => l.date >= day30).length,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { message, userId, userName } = await req.json();

    if (!message || !userId || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get app user record
    const { data: appUser } = await supabase
      .from('mst_users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (!appUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get competitor
    const { data: allUsers } = await supabase
      .from('mst_users')
      .select('id, name')
      .neq('id', appUser.id);

    const competitor = allUsers?.[0];

    // Get workout metrics
    const metrics = await getWorkoutMetrics(
      appUser.id,
      userName,
      competitor?.id || '',
      competitor?.name || 'partner'
    );

    // Get chat history (last 10 messages)
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const chatHistory = (history || []).reverse();

    // Call Claude Haiku
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Kamu adalah AI fitness coach personal untuk ${userName}.

      Data workout 90 hari terakhir:
      ${JSON.stringify(metrics, null, 2)}

      Tugasmu: bantu ${userName} buat keputusan soal kebiasaan olahraga mereka berdasarkan data di atas.
      Jawab dalam Bahasa Indonesia. Singkat, jelas, actionable. Pakai data konkret saat menjawab.`,
      messages: [
        ...chatHistory.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: 'user', content: message },
      ],
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';

    // Save both messages after Claude responds
    await supabase.from('chat_messages').insert([
      { user_id: appUser.id, role: 'user', content: message },
      { user_id: appUser.id, role: 'assistant', content: assistantMessage },
    ]);

    return NextResponse.json({ message: assistantMessage });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
