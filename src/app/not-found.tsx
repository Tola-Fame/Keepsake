import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted">The album or page you are looking for does not exist, or sharing was turned off.</p>
        <Link href="/" className="btn-primary mt-8">
          Go to the home page
        </Link>
      </main>
    </>
  );
}
