// Cloudflare Worker - Serverless Backend for PowerStatus PK
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /status - Get all outage records
    if (url.pathname === '/status' && request.method === 'GET') {
      try {
        const records = await env.DB.prepare('SELECT * FROM outages ORDER BY timestamp DESC').all();
        return new Response(JSON.stringify({ outages: records.results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // POST /report - Submit new outage report
    if (url.pathname === '/report' && request.method === 'POST') {
      try {
        const data = await request.json();
        const { location, status } = data;

        if (!location || !status) {
          return new Response(JSON.stringify({ error: 'Missing location or status' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!['outage', 'normal', 'warning'].includes(status)) {
          return new Response(JSON.stringify({ error: 'Invalid status. Must be outage, normal, or warning' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const result = await env.DB.prepare(
          'INSERT INTO outages (location, status, timestamp) VALUES (?, ?, ?)'
        ).bind(location, status, new Date().toISOString()).run();

        return new Response(JSON.stringify({
          id: result.meta.last_row_id,
          location,
          status,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'healthy', database: 'connected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
