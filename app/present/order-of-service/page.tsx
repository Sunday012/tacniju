import Link from "next/link"

const orderItems = [
  "Opening Prayer",
  "Praise and Worship",
  "Bible Reading",
  "Choir Ministration",
  "Teaching / Sermon",
  "Announcements",
  "Offering",
  "Closing Prayer",
]

export default function OrderOfServiceDisplayPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-center">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-amber-300">TACN Iju</p>
            <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-7xl">Order of Service</h1>
          </div>
          <Link href="/present" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/10">
            Display
          </Link>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2">
          {orderItems.map((item, index) => (
            <li key={item} className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-300 text-xl font-black text-slate-950">
                {index + 1}
              </span>
              <span className="text-2xl font-black">{item}</span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
