export default function BookPaywall({ book }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">
          {book.title}
        </h1>
        <p>This book requires purchase to read.</p>
        <a
          href="/books"
          className="px-6 py-3 bg-emerald-500 rounded-xl text-black"
        >
          Buy Book
        </a>
      </div>
    </div>
  );
}
