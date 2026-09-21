import Link from "next/link";
import { Building2, ChevronRight, FileClock } from "lucide-react";

const accountItems = [
  {
    href: "/dashboard/account/banks",
    icon: Building2,
    title: "Bank",
    description: "View the church bank account details shared with members.",
  },
  {
    href: "/dashboard/account/statement-requests",
    icon: FileClock,
    title: "Statement Request",
    description: "Request a statement for a selected bank account and period.",
  },
];

export default function MemberAccountPage() {
  return (
    <div className="mx-auto max-w-6xl py-4 sm:py-8">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Member Account</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Account</h1>
        <p className="mt-2 text-slate-500">Bank information and statement requests.</p>
      </div>

      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        {accountItems.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 border-b border-slate-100 px-5 py-5 last:border-b-0 hover:bg-slate-50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-indigo-100 bg-indigo-50 text-indigo-700">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-slate-900">{title}</span>
              <span className="mt-1 block text-sm text-slate-500">{description}</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
