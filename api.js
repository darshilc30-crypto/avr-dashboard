import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const now = () => Math.floor(Date.now()/1000);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Auth
      if (path === '/api/auth/send-otp' && method === 'POST') return sendOtp(request, env);
      if (path === '/api/auth/verify-otp' && method === 'POST') return verifyOtp(request, env);
      if (path === '/api/auth/static-login' && method === 'POST') return staticLogin(request, env);

      // Tickets
      if (path === '/api/tickets' && method === 'POST') return createTicket(request, env);
      if (path === '/api/tickets' && method === 'GET') return listTickets(request, env);

      // Jobs
      if (path === '/api/jobs' && method === 'POST') return assignJob(request, env);
      if (path.match(/^\/api\/jobs\/[^\/]+\/update/) && method === 'POST') return updateJob(request, env);

      // Technicians
      if (path === '/api/technicians' && method === 'GET') return listTechnicians(request, env);

      // Inventory
      if (path === '/api/inventory' && method === 'POST') return createItem(request, env);
      if (path === '/api/inventory' && method === 'GET') return listItems(request, env);
      if (path.startsWith('/api/inventory/') && method === 'PUT') return updateItem(request, env);
      if (path.startsWith('/api/inventory/') && method === 'DELETE') return deleteItem(request, env);

      // Stock logs
      if (path === '/api/stock/out' && method === 'POST') return stockOut(request, env);
      if (path === '/api/stock/in' && method === 'POST') return stockIn(request, env);

      // Invoices
      if (path.startsWith('/api/invoice/generate') && method === 'POST') return generateInvoice(request, env);

      // Customer Portal
      if (path === '/api/track/request-otp' && method === 'POST') return trackRequestOtp(request, env);
      if (path === '/api/track/verify' && method === 'POST') return trackVerifyOtp(request, env);
      if (path.startsWith('/api/track/') && method === 'GET') return trackGetTicket(request, env);

      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
};

async function sendOtp(request, env){
  const { email } = await request.json();
  if(!email) return new Response(JSON.stringify({ error:'missing email' }), { status: 400 });
  const otp = Math.floor(100000 + Math.random()*900000).toString();
  await env.OTP_KV.put(`otp:${email}`, otp, { expirationTtl: 300 });
  console.log('OTP', email, otp);
  return new Response(JSON.stringify({ ok:true }), { status:200 });
}

async function verifyOtp(request, env){
  const { email, otp } = await request.json();
  const stored = await env.OTP_KV.get(`otp:${email}`);
  if (!stored || stored !== otp) return new Response(JSON.stringify({ ok:false }), { status:401 });
  const db = env.DB;
  const nowts = now();
  const userId = `user:${email}`;
  await db.prepare('INSERT OR IGNORE INTO users (id,email,role,created_at) VALUES (?,?,?,?)').bind(userId, email, 'admin', nowts).run();
  const token = jwt.sign({ sub: userId, email, role: 'admin' }, env.JWT_SECRET || 'devsecret', { expiresIn: '12h' });
  await env.OTP_KV.delete(`otp:${email}`);
  return new Response(JSON.stringify({ token }), { status:200 });
}

async function staticLogin(request, env){
  const { email, password } = await request.json();
  // simple static check for demo - in production use hashed passwords
  if(email==='darshilc30@gmail.com' && password==='Darshilc32@'){
    const token = jwt.sign({ sub: `user:${email}`, email, role:'admin' }, env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    return new Response(JSON.stringify({ token }), { status:200 });
  }
  return new Response(JSON.stringify({ error:'invalid' }), { status:401 });
}

async function requireAuth(request, env){
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) throw new Error('noauth');
  const token = auth.slice(7);
  try { return jwt.verify(token, env.JWT_SECRET || 'devsecret'); } catch (e) { throw new Error('badtoken'); }
}

// Tickets
async function createTicket(request, env){
  const decoded = await requireAuth(request, env);
  const body = await request.json();
  const id = uuidv4();
  const nowts = now();
  await env.DB.prepare('INSERT INTO tickets (id,customer_name,phone,email,tv_model,issue_summary,description,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(id, body.customerName, body.phone, body.email || null, body.tvModel, body.issueSummary, body.description, nowts, nowts).run();
  return new Response(JSON.stringify({ id }), { status: 201 });
}
async function listTickets(request, env){
  await requireAuth(request, env);
  const url=new URL(request.url);
  const q = url.searchParams.get('q')||'';
  const status = url.searchParams.get('status');
  const limit = Number(url.searchParams.get('limit')||50);
  const offset = Number(url.searchParams.get('offset')||0);
  let sql = 'SELECT * FROM tickets';
  const where=[]; const binds=[];
  if(q){ where.push('(customer_name LIKE ? OR tv_model LIKE ? OR issue_summary LIKE ? OR description LIKE ?)'); binds.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`) }
  if(status){ where.push('status = ?'); binds.push(status) }
  if(where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'; binds.push(limit, offset);
  const res = await env.DB.prepare(sql).bind(...binds).all();
  return new Response(JSON.stringify(res.results || []), { status:200 });
}

// Jobs
async function assignJob(request, env){
  await requireAuth(request, env);
  const body = await request.json();
  const jobId = uuidv4();
  const nowts = now();
  await env.DB.prepare('INSERT INTO jobs (id,ticket_id,technician_id,assigned_at,eta,status,notes) VALUES (?,?,?,?,?,?,?)')
    .bind(jobId, body.ticketId, body.technicianId, nowts, body.eta || null, 'assigned', body.notes || '').run();
  await env.DB.prepare('UPDATE tickets SET assigned_to = ?, status = ?, updated_at = ? WHERE id = ?')
    .bind(body.technicianId, 'in_progress', nowts, body.ticketId).run();
  return new Response(JSON.stringify({ jobId }), { status:201 });
}
async function updateJob(request, env){
  await requireAuth(request, env);
  const url=new URL(request.url); const parts = url.pathname.split('/'); const jobId = parts[3];
  const body = await request.json();
  const nowts = now();
  await env.DB.prepare('UPDATE jobs SET status = ?, notes = ? WHERE id = ?').bind(body.status || 'completed', body.notes || '', jobId).run();
  if(body.status === 'completed'){
    const jobRow = await env.DB.prepare('SELECT ticket_id FROM jobs WHERE id = ?').bind(jobId).first();
    if(jobRow && jobRow.ticket_id){
      await env.DB.prepare('UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?').bind('closed', nowts, jobRow.ticket_id).run();
    }
  }
  return new Response(JSON.stringify({ ok:true }), { status:200 });
}

// Technicians
async function listTechnicians(request, env){
  await requireAuth(request, env);
  const res = await env.DB.prepare('SELECT * FROM technicians ORDER BY name').all();
  return new Response(JSON.stringify(res.results || []), { status:200 });
}

// Inventory endpoints
async function createItem(request, env){
  await requireAuth(request, env);
  const body = await request.json();
  const id = uuidv4(); const nowts = now();
  await env.DB.prepare('INSERT INTO inventory (id,item_name,category,quantity,location,vendor,description,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(id, body.itemName, body.category, body.quantity, body.location, body.vendor, body.description, nowts, nowts).run();
  return new Response(JSON.stringify({ id }), { status:201 });
}
async function listItems(request, env){
  await requireAuth(request, env);
  const res = await env.DB.prepare('SELECT * FROM inventory ORDER BY created_at DESC').all();
  return new Response(JSON.stringify(res.results || []), { status:200 });
}
async function updateItem(request, env){
  await requireAuth(request, env);
  const id = request.url.split('/api/inventory/')[1];
  const body = await request.json(); const nowts = now();
  await env.DB.prepare('UPDATE inventory SET item_name=?, category=?, quantity=?, location=?, vendor=?, description=?, updated_at=? WHERE id=?')
    .bind(body.itemName, body.category, body.quantity, body.location, body.vendor, body.description, nowts, id).run();
  return new Response(JSON.stringify({ ok:true }), { status:200 });
}
async function deleteItem(request, env){
  await requireAuth(request, env);
  const id = request.url.split('/api/inventory/')[1];
  await env.DB.prepare('DELETE FROM inventory WHERE id=?').bind(id).run();
  return new Response(JSON.stringify({ ok:true }), { status:200 });
}

// Stock logs
async function stockOut(request, env){
  await requireAuth(request, env);
  const body = await request.json();
  const id = uuidv4(); const nowts = now();
  // reduce inventory
  const inv = await env.DB.prepare('SELECT quantity FROM inventory WHERE id = ?').bind(body.inventoryId).first();
  if(!inv) return new Response(JSON.stringify({ error:'notfound' }), { status:404 });
  const newQty = (inv.quantity || 0) - (body.qty || 0);
  await env.DB.prepare('UPDATE inventory SET quantity = ?, updated_at = ? WHERE id = ?').bind(newQty, nowts, body.inventoryId).run();
  await env.DB.prepare('INSERT INTO stock_logs (id,inventory_id,change,reason,user_id,ticket_id,created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(id, body.inventoryId, -(body.qty||0), body.reason||'issue', body.userId||null, body.ticketId||null, nowts).run();
  return new Response(JSON.stringify({ ok:true }), { status:200 });
}
async function stockIn(request, env){
  await requireAuth(request, env);
  const body = await request.json();
  const id = uuidv4(); const nowts = now();
  const inv = await env.DB.prepare('SELECT quantity FROM inventory WHERE id = ?').bind(body.inventoryId).first();
  const newQty = (inv?.quantity || 0) + (body.qty||0);
  await env.DB.prepare('UPDATE inventory SET quantity = ?, updated_at = ? WHERE id = ?').bind(newQty, nowts, body.inventoryId).run();
  await env.DB.prepare('INSERT INTO stock_logs (id,inventory_id,change,reason,user_id,ticket_id,created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(id, body.inventoryId, (body.qty||0), body.reason||'restock', body.userId||null, body.ticketId||null, nowts).run();
  return new Response(JSON.stringify({ ok:true }), { status:200 });
}

// Invoice (generate simple PDF) - placeholder using pdf-lib (works when bundled)
async function generateInvoice(request, env){
  await requireAuth(request, env);
  const body = await request.json(); // expects ticketId and items
  // For demo, return JSON with invoice data and a placeholder URL - generating PDF in a Worker requires bundling pdf-lib
  const invoiceId = 'inv-' + uuidv4();
  return new Response(JSON.stringify({ ok:true, invoiceId, message:'Use pdf-lib to generate PDF in production' }), { status:200 });
}

// Customer portal endpoints
async function trackRequestOtp(request, env){
  const { ticketId, phone } = await request.json();
  if (!ticketId || !phone) return new Response(JSON.stringify({ ok:false, error:'missing' }), { status:400 });
  const ticketRow = await env.DB.prepare('SELECT id, phone, email FROM tickets WHERE id = ?').bind(ticketId).first();
  if (!ticketRow) return new Response(JSON.stringify({ ok:false, error:'notfound' }), { status:404 });
  if (ticketRow.phone && ticketRow.phone !== phone) return new Response(JSON.stringify({ ok:false, error:'phone_mismatch' }), { status:403 });
  const otp = Math.floor(100000 + Math.random()*900000).toString();
  await env.OTP_KV.put(`track:${ticketId}:${phone}`, otp, { expirationTtl: 300 });
  console.log('TRACK OTP', ticketId, phone, otp);
  return new Response(JSON.stringify({ ok:true }), { status:200 });
}
async function trackVerifyOtp(request, env){
  const { ticketId, phone, otp } = await request.json();
  if (!ticketId || !phone || !otp) return new Response(JSON.stringify({ ok:false }), { status:400 });
  const stored = await env.OTP_KV.get(`track:${ticketId}:${phone}`);
  if (!stored || stored !== otp) return new Response(JSON.stringify({ ok:false, error:'invalid' }), { status:401 });
  const token = jwt.sign({ ticketId, phone }, env.JWT_SECRET || 'devsecret', { expiresIn: '1h' });
  await env.OTP_KV.delete(`track:${ticketId}:${phone}`);
  return new Response(JSON.stringify({ ok:true, token }), { status:200 });
}
async function trackGetTicket(request, env){
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const ticketId = parts[3];
  const auth = request.headers.get('authorization') || '';
  let verified = null;
  if (auth.startsWith('Bearer ')){
    try{ verified = jwt.verify(auth.slice(7), env.JWT_SECRET || 'devsecret'); }catch(e){ }
  }
  if (!verified || verified.ticketId !== ticketId) return new Response(JSON.stringify({ ok:false, error:'unauthorized' }), { status:401 });
  const ticket = await env.DB.prepare('SELECT id, customer_name, phone, tv_model, issue_summary, description, status, assigned_to, created_at, updated_at FROM tickets WHERE id = ?').bind(ticketId).first();
  if (!ticket) return new Response(JSON.stringify({ ok:false, error:'notfound' }), { status:404 });
  const jobs = await env.DB.prepare('SELECT * FROM jobs WHERE ticket_id = ? ORDER BY assigned_at DESC').bind(ticketId).all();
  const techIds = (jobs.results || []).map(j=>j.technician_id).filter(Boolean);
  let techs = [];
  if (techIds.length){
    const placeholders = techIds.map(()=>'?').join(',');
    const res = await env.DB.prepare(`SELECT id,name,phone,email FROM technicians WHERE id IN (${placeholders})`).bind(...techIds).all();
    techs = res.results || [];
  }
  return new Response(JSON.stringify({ ok:true, ticket, jobs: jobs.results || [], technicians: techs }), { status:200 });
}
