const base = 'http://localhost:4000';

async function waitForServer(retries = 20, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const r = await fetch(`${base}/health`);
      if (r.ok) return true;
    } catch (e) {
      // ignore
    }
    await new Promise((res) => setTimeout(res, delay));
  }
  return false;
}

async function runChecks() {
  const ok = await waitForServer();
  if (!ok) {
    console.error('Server did not become available');
    process.exit(2);
  }

  try {
    const h = await fetch(`${base}/health`);
    console.log('HEALTH', h.status, await h.text());

    const p = await fetch(`${base}/api/products`);
    console.log('PRODUCTS', p.status, await p.text());

    // admin login (seeded user)
    const login = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ethnivaa.com', password: 'change_me_now' }),
    });
    const loginJson = await login.json().catch(() => null);
    console.log('LOGIN', login.status, JSON.stringify(loginJson));

    let token = loginJson?.token;
    if (!token) {
      console.error('Admin login failed; cannot test admin-only route');
      process.exit(3);
    }

    const admin = await fetch(`${base}/api/auth/admin-check`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('ADMIN_CHECK', admin.status, await admin.text());

    process.exit(0);
  } catch (err) {
    console.error('Error running checks', err);
    process.exit(1);
  }
}

runChecks();
