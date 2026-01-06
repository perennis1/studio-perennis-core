//C:\Users\studi\my-next-app\src\app\admin\intelligence\page.tsx

import Link from "next/link";



export default function IntelligenceIndex() {

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Intelligence Dashboard
      </h1>

       <ul className="space-y-3 text-sm">
      <li>
        <Link href="/admin/intelligence/books">Books →</Link>
      </li>
      <li>
        <Link href="/admin/intelligence/lessons">Lessons →</Link>
      </li>
      <li>
        <Link href="/admin/intelligence/users">Users →</Link>
      </li>
      <li>
  <Link href="/admin/intelligence/curriculum">
    Curriculum →
  </Link>
</li>

    </ul>

      <p className="mt-6 text-slate-500">
        These views are observational. No learner-facing effects.
      </p>
    </div>
  );
  
}
