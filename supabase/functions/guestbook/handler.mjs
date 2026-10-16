export function createHandler(env, fetcher = fetch) {
  const origins = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const secret = env.GUESTBOOK_DB_SECRET || env.SUPABASE_SERVICE_ROLE_KEY;
  return async request => {
    const origin = request.headers.get('origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
    if (origins.includes(origin)) Object.assign(headers, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type'
    });
    const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
    if (!origins.includes(origin)) return reply({ error: '허용되지 않은 요청이에요.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (!['GET', 'POST'].includes(request.method)) return reply({ error: '지원하지 않는 요청이에요.' }, 405);
    if (!env.SUPABASE_URL || !secret || !env.TURNSTILE_SECRET_KEY) return reply({ error: '방명록 연결을 준비 중이에요.' }, 503);
    const dbHeaders = { apikey: secret, 'Content-Type': 'application/json' };
    // Legacy JWT keys need Authorization; new sb_secret keys use apikey only.
    if (!secret.startsWith('sb_secret_')) dbHeaders.Authorization = `Bearer ${secret}`;
    const db = async (path, options = {}) => {
      const response = await fetcher(`${env.SUPABASE_URL}/rest/v1/${path}`, { ...options, headers: dbHeaders, signal: AbortSignal.timeout(10000) });
      return { ok: response.ok, data: await response.json() };
    };
    try {
      if (request.method === 'GET') {
        const { ok, data } = await db('guestbook_entries?select=id,name,text,paper,created_at&order=created_at.desc,id.desc&limit=100');
        return ok ? reply({ entries: data }) : reply({ error: '메모를 불러오지 못했어요.' }, 502);
      }
      if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: '잘못된 요청이에요.' }, 415);
      // Bound the streamed body too; Content-Length can be missing or forged.
      const reader = request.body?.getReader();
      if (!reader) return reply({ error: '내용을 입력해주세요.' }, 400);
      let raw = '', size = 0;
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 8192) { await reader.cancel(); return reply({ error: '내용이 너무 길어요.' }, 413); }
        raw += decoder.decode(value, { stream: true });
      }
      raw += decoder.decode();
      let body;
      try { body = JSON.parse(raw); } catch { return reply({ error: '잘못된 요청이에요.' }, 400); }
      if (!body || typeof body !== 'object') return reply({ error: '잘못된 요청이에요.' }, 400);
      const name = typeof body.name === 'string' ? body.name.trim() || '익명' : '익명';
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      if (name.length > 20 || !text || text.length > 160 || !['yellow','pink','lined','ticket','house'].includes(body.paper)
        || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.visitor || '')
        || typeof body.token !== 'string' || !body.token || body.token.length > 2048) return reply({ error: '입력 내용과 스팸 방지 확인을 다시 확인해주세요.' }, 400);
      const verification = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: body.token }), signal: AbortSignal.timeout(10000)
      });
      const verdict = await verification.json();
      if (!verification.ok || !verdict.success || verdict.action !== 'guestbook' || verdict.hostname !== new URL(origin).hostname)
        return reply({ error: '스팸 방지 확인을 다시 진행해주세요.' }, 400);
      const { ok, data } = await db('rpc/post_guestbook', { method: 'POST', body: JSON.stringify({ p_name: name, p_text: text, p_paper: body.paper, p_visitor: body.visitor }) });
      if (!ok) return data.message === 'RATE_LIMIT'
        ? reply({ error: '잠시 쉬었다가 1분 뒤에 다시 남겨주세요.' }, 429)
        : reply({ error: '메모를 저장하지 못했어요. 다시 시도해주세요.' }, 502);
      return reply({ entry: data[0] }, 201);
    } catch { return reply({ error: '연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.' }, 502); }
  };
}
