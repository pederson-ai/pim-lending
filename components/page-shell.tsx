import Link from 'next/link';

export function PageShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="mb-2 inline-flex text-sm font-medium text-blue-700">PIM Lending Dashboard</Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex gap-3 text-sm font-medium text-slate-600">
          <Link href="/" className="rounded-md px-3 py-2 hover:bg-slate-100">Dashboard</Link>
          <Link href="/statements" className="rounded-md px-3 py-2 hover:bg-slate-100">Statements</Link>
        </div>
      </div>
      {children}
    </div>
  );
}
