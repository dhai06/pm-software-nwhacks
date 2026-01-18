import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-stone-800">
          Project Manager
        </h1>
        <p className="text-xl text-stone-600 max-w-md">
          Plan, track, and deliver your projects with ease.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-stone-800 text-white text-lg font-medium rounded-lg hover:bg-stone-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
