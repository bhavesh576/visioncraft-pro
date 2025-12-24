import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', height: '100vh', background: '#111', color: '#fff' }}>
      <div>
        <h1>Welcome to VisionCraft Pro</h1>
        <p>
          Start drawing with hand gestures on the{' '}
          <Link href="/canvas" style={{ color: '#0ff' }}>canvas page</Link>.
        </p>
      </div>
    </main>
  );
}
