import Link from "next/link";

// Landing page -- simple internal nav for demo purposes.
// NOTE: the harvester capture flow and consumer provenance page now live in
// Saanvi's separate frontend repo -- she integrates with this backend over
// fetch (see her repo's env var for the API base URL), not through routes
// in this app. Don't re-add /harvester or /provenance links here.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="font-display text-4xl text-forest-800">HerbTrace</h1>
      <p className="max-w-md text-center text-forest-700">
        Verifiable, tamper-evident chain of custody for Ayurvedic herbs -- from
        harvest to consumer.
      </p>
      <nav className="flex flex-wrap justify-center gap-4">
        <Link className="rounded-xl2 bg-forest-600 px-4 py-2 text-parchment" href="/collection-center">
          Collection Center
        </Link>
        <Link className="rounded-xl2 bg-forest-600 px-4 py-2 text-parchment" href="/admin">
          Admin
        </Link>
      </nav>
    </main>
  );
}
