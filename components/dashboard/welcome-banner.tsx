import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface WelcomeBannerProps {
  fullName: string
  rank?: string
  department?: string
  avatarUrl?: string
  initials: string
}

export function WelcomeBanner({ fullName, rank, department, avatarUrl, initials }: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(79,70,229,0.3)] border border-indigo-400/20 mb-8">
      {/* Decorative background elements matching the Coursue style banner */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-[0.15] pointer-events-none mix-blend-overlay">
        <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ffffff" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,96.5,-2.9C96.2,12.2,89.5,26.9,80.1,39.6C70.6,52.4,58.3,63.1,44.5,70.7C30.6,78.3,15.3,82.8,0.2,82.4C-14.8,82,-29.7,76.8,-43.3,69.1C-56.9,61.4,-69.3,51.3,-78.9,38.6C-88.5,25.9,-95.3,10.6,-95.7,-4.8C-96.1,-20.3,-90.2,-35.8,-80.7,-48.7C-71.1,-61.6,-57.8,-71.9,-43.3,-78.7C-28.8,-85.5,-14.4,-88.7,0.7,-89.7C15.8,-90.7,31.5,-89.5,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-[2rem] shadow-2xl">
            <Avatar className="h-24 w-24 rounded-[1.7rem] border border-white/40">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />}
              <AvatarFallback className="bg-white text-indigo-700 text-3xl font-extrabold rounded-[1.7rem]">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-900/30 backdrop-blur-md text-indigo-50 text-[11px] font-bold tracking-widest uppercase mb-4 shadow-inner border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
              Active Profile
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2.5 tracking-tight font-sans">
              Welcome back, {fullName}!
            </h1>
            <p className="text-indigo-100/90 text-[15px] sm:text-[16px] max-w-xl font-medium leading-relaxed">
              Sharpen your skills and track your spiritual journey. Continue making an impact in your department.
            </p>
          </div>
        </div>
        
        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto mt-2 md:mt-0">
          {rank && (
            <div className="px-5 py-3 text-sm font-bold rounded-2xl shadow-xl bg-white text-indigo-700 border border-white/90">
              {rank}
            </div>
          )}
          {department && (
            <div className="px-5 py-3 text-sm font-semibold rounded-2xl bg-indigo-900/20 text-white backdrop-blur-md border border-white/20">
              {department}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
