const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8787);
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'pawpal-db.json');
const STATIC_DIR = fs.existsSync(path.join(ROOT, 'dist')) ? path.join(ROOT, 'dist') : ROOT;
const REQUIRE_API_KEY = process.env.REQUIRE_API_KEY === 'true';
const API_KEY = process.env.PAWPAL_API_KEY || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const teacherCatalog = [
  {
    id: 'ananya-iyer',
    name: 'Dr. Ananya Iyer',
    qualification: 'Ph.D. Computer Science',
    institute: 'Anna University, Chennai',
    experienceYears: 12,
    classLevel: 'Engineering 2nd Year',
    subject: 'Data Structures',
    photo: 'https://source.unsplash.com/700x500/?south-indian,woman,professor,portrait&sig=11',
    slots: ['Mon 7:00 PM', 'Tue 6:00 PM', 'Thu 8:00 PM', 'Sat 11:00 AM']
  },
  {
    id: 'aravind-krishnan',
    name: 'Prof. Aravind Krishnan',
    qualification: 'M.Tech Mechanical Engineering',
    institute: 'NIT Calicut',
    experienceYears: 10,
    classLevel: 'Engineering 1st Year',
    subject: 'Thermodynamics',
    photo: 'https://source.unsplash.com/700x500/?south-indian,man,teacher,portrait&sig=12',
    slots: ['Mon 8:00 PM', 'Wed 7:30 PM', 'Fri 6:30 PM', 'Sun 10:00 AM']
  },
  {
    id: 'meera-subramanian',
    name: 'Meera Subramanian',
    qualification: 'M.E. Electronics and Communication',
    institute: 'College of Engineering Guindy',
    experienceYears: 8,
    classLevel: 'Engineering 3rd Year',
    subject: 'Signals & Systems',
    photo: 'https://source.unsplash.com/700x500/?south-indian,woman,faculty,portrait&sig=13',
    slots: ['Tue 5:30 PM', 'Thu 7:00 PM', 'Sat 4:00 PM', 'Sun 12:00 PM']
  },
  {
    id: 'sanjay-nair',
    name: 'Sanjay Nair',
    qualification: 'MCA',
    institute: 'University of Kerala',
    experienceYears: 9,
    classLevel: 'Engineering 2nd Year',
    subject: 'DBMS',
    photo: 'https://source.unsplash.com/700x500/?kerala,teacher,man,portrait&sig=14',
    slots: ['Mon 6:00 PM', 'Wed 8:00 PM', 'Fri 7:00 PM', 'Sat 9:00 AM']
  },
  {
    id: 'revathi-raman',
    name: 'Revathi Raman',
    qualification: 'M.Sc Mathematics',
    institute: 'Bharathiar University, Coimbatore',
    experienceYears: 7,
    classLevel: 'Class 12',
    subject: 'Engineering Mathematics',
    photo: 'https://source.unsplash.com/700x500/?tamil,woman,teacher,portrait&sig=15',
    slots: ['Tue 8:00 PM', 'Wed 6:00 PM', 'Fri 5:30 PM', 'Sun 5:00 PM']
  },
  {
    id: 'farhan-ahmed',
    name: 'Farhan Ahmed',
    qualification: 'M.Tech Information Technology',
    institute: 'IIIT Hyderabad',
    experienceYears: 11,
    classLevel: 'Engineering 3rd Year',
    subject: 'Operating Systems',
    photo: 'https://source.unsplash.com/700x500/?hyderabad,faculty,man,portrait&sig=16',
    slots: ['Mon 9:00 PM', 'Thu 6:00 PM', 'Sat 6:30 PM', 'Sun 9:30 AM']
  },
  {
    id: 'kavya-reddy',
    name: 'Kavya Reddy',
    qualification: 'M.Sc Physics, B.Ed',
    institute: 'Osmania University, Hyderabad',
    experienceYears: 6,
    classLevel: 'Class 11',
    subject: 'Physics',
    photo: 'https://source.unsplash.com/700x500/?south-indian,woman,physics,teacher,portrait&sig=17',
    slots: ['Mon 5:00 PM', 'Wed 5:30 PM', 'Fri 8:00 PM', 'Sat 3:00 PM']
  },
  {
    id: 'pranav-hegde',
    name: 'Pranav Hegde',
    qualification: 'M.Sc Chemistry, B.Ed',
    institute: 'Mangalore University',
    experienceYears: 5,
    classLevel: 'Class 10',
    subject: 'Chemistry',
    photo: 'https://source.unsplash.com/700x500/?karnataka,indian,teacher,man,portrait&sig=18',
    slots: ['Tue 4:30 PM', 'Thu 5:30 PM', 'Sat 10:00 AM', 'Sun 4:00 PM']
  }
];

const seedState = {
  owner: { name: 'Guest', phone: '', email: '' },
  pet: {
    type: 'Dog',
    breed: 'Labrador Retriever',
    name: 'Bruno',
    age: 3,
    weight: 18,
    licence: 'CHN-PET-2026-1024',
    location: 'Chennai, Tamil Nadu',
    concern: 'Weight control'
  },
  loggedIn: false,
  profileComplete: true,
  vaccines: ['Rabies - due 18 Jun 2026', 'DHPP - due 24 Jul 2026', 'Leptospirosis - due 15 Aug 2026'],
  medicines: ['Omega-3 syrup - 5ml after breakfast', 'Flea and tick tablet - monthly'],
  prescription: '',
  expenses: [
    { title: 'Vet visit', amount: 1200 },
    { title: 'Dog food', amount: 2450 },
    { title: 'Toy order', amount: 499 }
  ],
  activities: ['Today - Morning walk - 35 mins', 'Yesterday - Fetch play - 25 mins', '18 May - Grooming - 40 mins'],
  appointment: '',
  appointments: [],
  doctorLoggedIn: false,
  currentDoctor: '',
  posts: [
    {
      user: 'Anika Rao',
      time: '2 hours ago',
      text: 'My Labrador finally learned stay today. Any tips for improving recall in busy parks?',
      img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
      comments: ['Use a long leash first.', 'High-value treats helped my dog.']
    },
    {
      user: 'Rahul Menon',
      time: '5 hours ago',
      text: 'Found a pet-friendly cafe in Bengaluru with a separate dog menu. PawPal travel helped a lot.',
      img: 'https://images.unsplash.com/photo-1601758003122-53c40e686a19?auto=format&fit=crop&w=900&q=80',
      comments: ['Please share location.', 'Looks lovely.']
    },
    {
      user: 'Meera Shah',
      time: 'Yesterday',
      text: 'My cat hates medicine time. What is the easiest way to give syrup?',
      img: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
      comments: ['Try a syringe from the side of mouth.', 'Ask vet if it can mix with food.']
    },
    {
      user: 'Vikram S',
      time: '2 days ago',
      text: 'Booked an online vet slot for my beagle through PawPal. The prescription section made the follow-up easy.',
      img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
      comments: ['That is useful.', 'Which doctor did you choose?']
    },
    {
      user: 'Nisha Kapoor',
      time: '3 days ago',
      text: 'Looking for rabbit-safe play products in Pune. Please suggest toys that do not have sharp plastic edges.',
      img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80',
      comments: ['Try hay tunnels.', 'Puzzle mats work well.']
    }
  ],
  teachers: teacherCatalog,
  bookings: [],
  classBookings: [],
  reminders: [],
  adoptionMeetings: [],
  caregiverHires: [],
  orders: []
};

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function ensureDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) writeDb(seedState);
}

function readDb() {
  ensureDb();
  return normalizeState(JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
}

function writeDb(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, `${JSON.stringify(normalizeState(data), null, 2)}\n`);
}

function corsHeaders(req) {
  const origin = req.headers.origin || '';
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : '';
  return {
    ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };
}

function send(req, res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, {
    ...corsHeaders(req),
    'Content-Type': typeof body === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    ...headers
  });
  res.end(payload);
}

function escapeHtml(text) {
  return String(text || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function mapUrls(query) {
  const cleanQuery = String(query || 'India').trim() || 'India';
  const encoded = encodeURIComponent(cleanQuery);
  return {
    query: cleanQuery,
    embedUrl: `https://www.google.com/maps?q=${encoded}&output=embed`,
    searchUrl: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
  };
}

function sendMapEmbed(req, res, query) {
  const urls = mapUrls(query);
  const safeQuery = escapeHtml(urls.query);
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>PawPal Map - ${safeQuery}</title>
  <style>
    html, body { margin: 0; height: 100%; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    iframe { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; }
    .fallback { position: fixed; left: 12px; right: 12px; bottom: 12px; background: #fff; border-radius: 14px; padding: 12px; box-shadow: 0 12px 34px rgba(0,0,0,.18); }
    a { color: #6c63ff; font-weight: 800; text-decoration: none; }
  </style>
</head>
<body>
  <iframe title="Google Maps preview" loading="lazy" src="${urls.embedUrl}"></iframe>
  <div class="fallback"><strong>${safeQuery}</strong><br><a href="${urls.searchUrl}" target="_blank" rel="noopener">Open in Google Maps</a></div>
</body>
</html>`;
  send(req, res, 200, html, { 'Content-Type': 'text/html; charset=utf-8' });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        const error = new Error('Request body is too large.');
        error.statusCode = 413;
        req.destroy();
        reject(error);
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        const invalidJsonError = new Error('Invalid JSON body.');
        invalidJsonError.statusCode = 400;
        reject(invalidJsonError);
      }
    });
    req.on('error', reject);
  });
}

function normalizeState(data = {}) {
  return {
    ...seedState,
    ...data,
    owner: { ...seedState.owner, ...(data.owner || {}) },
    pet: { ...seedState.pet, ...(data.pet || {}) },
    vaccines: Array.isArray(data.vaccines) ? data.vaccines : seedState.vaccines,
    medicines: Array.isArray(data.medicines) ? data.medicines : seedState.medicines,
    expenses: Array.isArray(data.expenses) ? data.expenses : seedState.expenses,
    activities: Array.isArray(data.activities) ? data.activities : seedState.activities,
    appointments: Array.isArray(data.appointments) ? data.appointments : [],
    posts: Array.isArray(data.posts) ? data.posts : seedState.posts,
    teachers: Array.isArray(data.teachers) && data.teachers.length ? data.teachers : seedState.teachers,
    bookings: Array.isArray(data.bookings) ? data.bookings : [],
    classBookings: Array.isArray(data.classBookings) ? data.classBookings : [],
    reminders: Array.isArray(data.reminders) ? data.reminders : [],
    adoptionMeetings: Array.isArray(data.adoptionMeetings) ? data.adoptionMeetings : [],
    caregiverHires: Array.isArray(data.caregiverHires) ? data.caregiverHires : [],
    orders: Array.isArray(data.orders) ? data.orders : []
  };
}

function mergeArray(existing = [], incoming = []) {
  const merged = [];
  const seen = new Set();
  [...incoming, ...existing].forEach(item => {
    const key = item && typeof item === 'object'
      ? (item.id || item.createdAt || JSON.stringify(item))
      : String(item);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });
  return merged;
}

function cleanState(input) {
  const state = readDb();
  const next = { ...state };
  ['owner', 'pet'].forEach(key => {
    if (input[key] && typeof input[key] === 'object') next[key] = { ...state[key], ...input[key] };
  });
  ['loggedIn', 'profileComplete', 'doctorLoggedIn'].forEach(key => {
    if (typeof input[key] === 'boolean') next[key] = input[key];
  });
  ['vaccines', 'medicines', 'expenses', 'activities', 'posts', 'teachers', 'appointments', 'bookings', 'classBookings', 'reminders', 'adoptionMeetings', 'caregiverHires', 'orders'].forEach(key => {
    if (Array.isArray(input[key])) next[key] = mergeArray(state[key], input[key]);
  });
  ['prescription', 'appointment', 'currentDoctor'].forEach(key => {
    if (typeof input[key] === 'string') next[key] = input[key];
  });
  next.updatedAt = new Date().toISOString();
  return next;
}

function addEntry(collection, entry) {
  const db = readDb();
  const item = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date().toISOString(), ...entry };
  db[collection] = Array.isArray(db[collection]) ? db[collection] : [];
  db[collection].unshift(item);
  if (collection === 'bookings' && item.doctor && item.pet) {
    db.appointments = Array.isArray(db.appointments) ? db.appointments : [];
    if (!db.appointments.some(appt => appt.id === item.id)) db.appointments.unshift(item);
  }
  db.updatedAt = new Date().toISOString();
  writeDb(db);
  return item;
}

function serveStatic(req, res, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const blockedStaticPrefixes = ['/backend/', '/security-tests/', '/outputs/', '/build-', '/.git/', '/.agents/', '/.codex/'];
  if (blockedStaticPrefixes.some(prefix => requestedPath.startsWith(prefix))) return send(req, res, 403, 'Forbidden');
  let filePath = path.normalize(path.join(STATIC_DIR, requestedPath));
  if (!filePath.startsWith(STATIC_DIR)) return send(req, res, 403, 'Forbidden');
  if (!fs.existsSync(filePath)) {
    const rootFilePath = path.normalize(path.join(ROOT, requestedPath));
    if (rootFilePath.startsWith(ROOT) && fs.existsSync(rootFilePath)) filePath = rootFilePath;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return send(req, res, 404, 'Not found');
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream'
  });
  fs.createReadStream(filePath).pipe(res);
}

async function handleApi(req, res, pathname) {
  if (req.method === 'OPTIONS') return send(req, res, 204, '');

  if (pathname === '/api/health' && req.method === 'GET') {
    return send(req, res, 200, { ok: true, app: 'PawPal Backend', time: new Date().toISOString() });
  }

  if (pathname === '/api/maps/resolve' && req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    return send(req, res, 200, mapUrls(url.searchParams.get('query')));
  }

  if (pathname === '/api/maps/embed' && req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    return sendMapEmbed(req, res, url.searchParams.get('query'));
  }

  const publicApiRoutes = new Set(['/api/health', '/api/maps/resolve', '/api/maps/embed', '/api/teachers']);
  if (REQUIRE_API_KEY && !publicApiRoutes.has(pathname) && req.headers['x-api-key'] !== API_KEY) {
    return send(req, res, 401, { error: 'Unauthorized' });
  }

  if (pathname === '/api/state' && req.method === 'GET') return send(req, res, 200, readDb());
  if (pathname === '/api/teachers' && req.method === 'GET') return send(req, res, 200, readDb().teachers);

  if (pathname === '/api/state' && req.method === 'PUT') {
    const body = await readBody(req);
    const next = cleanState(body);
    writeDb(next);
    return send(req, res, 200, next);
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await readBody(req);
    const db = cleanState({
      owner: body.owner || body,
      loggedIn: true,
      profileComplete: false
    });
    writeDb(db);
    return send(req, res, 200, db);
  }

  if (pathname === '/api/bookings' && req.method === 'POST') return send(req, res, 201, addEntry('bookings', await readBody(req)));
  if (pathname === '/api/class-bookings' && req.method === 'POST') return send(req, res, 201, addEntry('classBookings', await readBody(req)));
  if (pathname === '/api/reminders' && req.method === 'POST') return send(req, res, 201, addEntry('reminders', await readBody(req)));
  if (pathname === '/api/adoption-meetings' && req.method === 'POST') return send(req, res, 201, addEntry('adoptionMeetings', await readBody(req)));
  if (pathname === '/api/caregiver-bookings' && req.method === 'POST') return send(req, res, 201, addEntry('caregiverHires', await readBody(req)));
  if (pathname === '/api/caregiver-hires' && req.method === 'POST') return send(req, res, 201, addEntry('caregiverHires', await readBody(req)));
  if (pathname === '/api/orders' && req.method === 'POST') return send(req, res, 201, addEntry('orders', await readBody(req)));

  return send(req, res, 404, { error: 'API route not found' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url.pathname);
    return serveStatic(req, res, url.pathname);
  } catch (error) {
    return send(req, res, error.statusCode || 500, { error: error.message || 'Server error' });
  }
});

function localNetworkUrls() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(item => item && item.family === 'IPv4' && !item.internal)
    .map(item => `http://${item.address}:${PORT}`);
}

server.listen(PORT, '0.0.0.0', () => {
  ensureDb();
  console.log(`PawPal backend running on this Mac: http://localhost:${PORT}`);
  localNetworkUrls().forEach(url => console.log(`Use this on your Android phone: ${url}`));
});
