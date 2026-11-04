import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Switchboard</h1>
      <p>Book real slots on WhatsApp and web chat, with a deposit that stops no-shows.</p>

      <section
        style={{
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h2>Auth Status</h2>
        <p>
          <strong>Better Auth:</strong> Configured
        </p>
        <p>
          <strong>Session:</strong>{' '}
          {session?.user ? `Signed in as ${session.user.email}` : 'Not signed in'}
        </p>
      </section>
    </main>
  );
}
