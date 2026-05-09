import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const log = {
  info: (msg: string, data?: Record<string, unknown>) =>
    console.log(JSON.stringify({ level: 'INFO', msg, ...data, ts: new Date().toISOString() })),
  warn: (msg: string, data?: Record<string, unknown>) =>
    console.warn(JSON.stringify({ level: 'WARN', msg, ...data, ts: new Date().toISOString() })),
  error: (msg: string, err: unknown, data?: Record<string, unknown>) =>
    console.error(JSON.stringify({
      level: 'ERROR', msg,
      error: err instanceof Error ? { message: err.message, stack: err.stack, name: err.name } : String(err),
      ...data,
      ts: new Date().toISOString(),
    })),
};

function daysBetween(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

async function getWorkoutMetrics(userId: string, userName: string, competitorId: string, competitorName: string) {
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: logs, error: logsError } = await supabase
    .from('mst_daily_logs')
    .select('date, activity, user_id')
    .gte('date', since90)
    .in('user_id', [userId, competitorId])
    .order('date', { ascending: false });

  if (logsError) {
    log.error('Failed to fetch workout logs', logsError, { userId });
    throw new Error(`Supabase logs query failed: ${logsError.message}`);
  }

  const myLogs = (logs || []).filter(l => l.user_id === userId);
  const compLogs = (logs || []).filter(l => l.user_id === competitorId);

  log.info('Fetched workout logs', { userId, myLogsCount: myLogs.length, compLogsCount: compLogs.length });

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
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { message, userId, userName } = body;

    log.info('Chat request received', { requestId, userName, messageLength: message?.length });

    if (!message || !userId || !userName) {
      log.warn('Missing required fields', { requestId, hasMessage: !!message, hasUserId: !!userId, hasUserName: !!userName });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get app user record
    const { data: appUser, error: userError } = await supabase
      .from('mst_users')
      .select('id')
      .eq('auth_id', userId)
      .single();

    if (userError || !appUser) {
      log.error('App user not found', userError, { requestId, userId });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parallel: fetch competitor + chat history simultaneously
    const [
      { data: allUsers, error: usersError },
      { data: history, error: historyError },
    ] = await Promise.all([
      supabase.from('mst_users').select('id, name').neq('id', appUser.id),
      supabase.from('chat_messages').select('role, content').eq('user_id', appUser.id).order('created_at', { ascending: false }).limit(10),
    ]);

    if (usersError) log.error('Failed to fetch competitor', usersError, { requestId, appUserId: appUser.id });
    if (historyError) log.error('Failed to fetch chat history', historyError, { requestId, appUserId: appUser.id });

    const competitor = allUsers?.[0];
    const chatHistory = (history || []).reverse();
    log.info('Parallel fetch done', { requestId, competitor: competitor?.name ?? 'none', historyCount: chatHistory.length });

    // Get workout metrics (needs competitor id from above)
    const metrics = await getWorkoutMetrics(
      appUser.id,
      userName,
      competitor?.id || '',
      competitor?.name || 'partner'
    );

    log.info('Calling Claude API (stream)', { requestId, model: 'claude-haiku-4-5-20251001', historyCount: chatHistory.length });

    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are an angry drill sergeant who genuinely cares about ${userName}'s fitness. You know all their workout data and you get mad when they're lazy or ask obvious questions.

${userName}'s last 90 days workout data:
${JSON.stringify(metrics, null, 2)}

Rules:
- Always respond in Indonesian slang (gue-lu), casual and aggressive
- Always compare with the competitor and make them feel bad if they are slacking
- If data is good: brief praise, then push harder
- If data is bad: roast them, no excuses accepted
- If asked "should I keep going to gym?": always YES, angry that they even asked
- Use ALL CAPS when emotional
- Keep responses short and sharp
- Use "bro", "anjir", "serius lo?", "ngeles mulu" occasionally
- Never give options or say "up to you" — always push to exercise more`,
      messages: [
        ...chatHistory.map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: 'user', content: message },
      ],
    });

    const encoder = new TextEncoder();
    let assistantMessage = '';

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            assistantMessage += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        const finalMessage = await stream.finalMessage();
        log.info('Claude stream completed', {
          requestId,
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
          stopReason: finalMessage.stop_reason,
          durationMs: Date.now() - startTime,
        });

        // Save both messages after stream done
        const { error: insertError } = await supabase.from('chat_messages').insert([
          { user_id: appUser.id, role: 'user', content: message },
          { user_id: appUser.id, role: 'assistant', content: assistantMessage },
        ]);
        if (insertError) log.error('Failed to save chat messages', insertError, { requestId });

        log.info('Chat request completed', { requestId, totalDurationMs: Date.now() - startTime });
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Request-Id': requestId },
    });
  } catch (err) {
    log.error('Unhandled error in chat route', err, { requestId, durationMs: Date.now() - startTime });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
