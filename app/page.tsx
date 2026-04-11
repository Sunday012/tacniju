import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#1c1c1a] text-[#f4f4f0] font-sans selection:bg-[#ff3b30]/30 overflow-x-hidden relative">
      
      {/* NOISE OVERLAY */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      {/* FLOATING SIDE NAV (Desktop Only) */}
      <nav className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2 items-end">
        <Link href="/">
          <div className="bg-[#ff8a4c] text-white font-anton uppercase text-xl px-4 py-1 pb-0 -rotate-2 origin-right translate-x-2 hover:translate-x-0 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black cursor-pointer">
            Home
          </div>
        </Link>
        <Link href="#community">
          <div className="bg-[#009b72] text-white font-anton uppercase text-xl px-4 py-1 pb-0 rotate-1 origin-right translate-x-2 hover:translate-x-0 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black cursor-pointer">
            Community
          </div>
        </Link>
        <Link href="/auth/register">
          <div className="bg-[#cc2936] text-white font-anton uppercase text-xl px-4 py-1 pb-0 -rotate-1 origin-right translate-x-2 hover:translate-x-0 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black cursor-pointer">
            Join In
          </div>
        </Link>
        <Link href="#ministry">
          <div className="bg-[#004e89] text-white font-anton uppercase text-xl px-4 py-1 pb-0 rotate-2 origin-right translate-x-2 hover:translate-x-0 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black cursor-pointer">
            Ministry
          </div>
        </Link>
        <Link href="/auth/login">
          <div className="bg-[#5c4d7d] text-white font-anton uppercase text-xl px-4 py-1 pb-0 -rotate-2 origin-right translate-x-2 hover:translate-x-0 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black cursor-pointer">
            Portal
          </div>
        </Link>
      </nav>

      {/* HEADER LOGO */}
      <header className="absolute top-0 w-full z-40 p-6 flex justify-center lg:justify-start">
        <div className="flex items-center gap-1 group cursor-pointer relative">
          <span className="font-anton text-5xl text-[#cc2936] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] relative z-10 transition-transform group-hover:-rotate-3">T</span>
          <span className="font-anton text-5xl text-[#009b72] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] relative z-10 -ml-1 transition-transform group-hover:rotate-3">A</span>
          <span className="font-anton text-5xl text-[#ffbc42] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] relative z-10 -ml-1 transition-transform group-hover:-translate-y-1">C</span>
          <span className="font-anton text-5xl text-[#004e89] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] relative z-10 -ml-1 transition-transform group-hover:translate-y-1">N</span>
          <span className="text-[#ffbc42] text-2xl absolute -right-4 -top-1 animate-pulse">✦</span>
          <span className="text-[#cc2936] text-xl absolute -left-3 bottom-0 animate-pulse delay-75">✦</span>
        </div>
      </header>

      {/* BIG LOGO & POLAROIDS SECTION (Now First) */}
      <section className="bg-[#e8e6df] pt-32 pb-32 px-4 border-b-4 border-[#1c1c1a] relative overflow-hidden text-[#1c1c1a]">
        {/* Grungy background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#1c1c1a 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
          <div className="flex justify-center mb-8 relative">
            <span className="font-anton text-[12rem] md:text-[20rem] leading-none text-[#cc2936] drop-shadow-[8px_8px_0_rgba(0,0,0,1)]">I</span>
            <span className="font-anton text-[12rem] md:text-[20rem] leading-none text-[#009b72] drop-shadow-[8px_8px_0_rgba(0,0,0,1)] -ml-4 md:-ml-8">J</span>
            <span className="font-anton text-[12rem] md:text-[20rem] leading-none text-[#004e89] drop-shadow-[8px_8px_0_rgba(0,0,0,1)] -ml-4 md:-ml-8">U</span>
            <span className="text-[#ffbc42] text-6xl absolute -left-12 top-10 animate-pulse">✦</span>
            <span className="text-[#009b72] text-6xl absolute -right-12 bottom-20 animate-pulse delay-150">✦</span>
          </div>

          {/* Intro text note bg-[#5c4d7d] */}
          <div className="absolute left-4 lg:left-12 top-48 hidden lg:block bg-[#5c4d7d] text-white p-6 w-64 rotate-[-6deg] shadow-[6px_6px_0_rgba(0,0,0,1)] border-2 border-[#1c1c1a]">
            <p className="font-serif text-sm leading-relaxed">TACN IJU is a calling that became a movement. Where faith sparks action and fellowship means something beyond a Sunday service. Built for young believers who think differently.</p>
          </div>

          {/* Polaroid Photos with Fixed Valid Unsplash IDs */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12 px-4 z-20">
            {[
              { img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80&auto=format&fit=crop", border: "border-[#ffbc42]" },
              { img: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80&auto=format&fit=crop", border: "border-[#5c4d7d]" },
              { img: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&q=80&auto=format&fit=crop", border: "border-[#009b72]" },
              { img: "https://images.unsplash.com/photo-1579503841516-e0bd7fca5faa?w=400&q=80&auto=format&fit=crop", border: "border-[#cc2936]" }
            ].map((p, i) => (
              <div key={i} className={`w-40 h-40 md:w-56 md:h-56 bg-white p-2 md:p-3 border-2 border-[#1c1c1a] shadow-[6px_6px_0_rgba(0,0,0,1)] ${p.border} ${i%2===0 ? 'rotate-[-3deg]' : 'rotate-[3deg]'} hover:rotate-0 hover:scale-105 transition-all duration-300`}>
                <div className="w-full h-full relative border-2 border-[#1c1c1a] overflow-hidden grayscale contrast-125 hover:grayscale-0 transition-colors">
                  <Image src={p.img} alt="Youth" fill className="object-cover" />
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-anton text-5xl md:text-[7rem] leading-[0.9] text-center border-[#1c1c1a] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase text-[#1c1c1a]">
            A MOVEMENT FOR YOUNG BELIEVERS
          </h2>
          <div className="self-end mt-4 md:mr-12 bg-[#b86b45] text-white font-serif px-4 py-1 border-2 border-[#1c1c1a] shadow-[4px_4px_0_rgba(0,0,0,1)] -rotate-3 text-sm md:text-base">
            by THE APOSTOLIC CHURCH
          </div>
        </div>
      </section>

      {/* HERO SECTION 2 - QUESTION & CARDS (Now Second) */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-32 pb-20 bg-[#1c1c1a] text-[#f4f4f0]">
        <div className="max-w-3xl text-center mb-16 relative z-10">
          <h2 className="text-xl md:text-2xl font-medium leading-relaxed font-sans text-[#e5e5d8]">
            What if church wasn't just a Sunday service? What if the next generation of believers needed momentum more than motivation? What if community was actually about deeply knowing each other?
          </h2>
        </div>

        {/* TILTED CARDS ROW */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-[-20px] max-w-6xl mx-auto z-20 w-full perspective-1000 relative">
          
          <div className="w-64 h-80 bg-[#f4f4f0] border-4 border-[#009b72] shadow-[8px_8px_0_rgba(0,0,0,1)] -rotate-[8deg] md:-mr-6 hover:rotate-0 hover:z-30 transition-all duration-300 flex flex-col items-center justify-center p-6 bg-paper-texture relative group">
             <span className="absolute top-2 left-2 font-anton text-xs text-[#009b72]">TACN</span>
             <h3 className="font-serif text-3xl font-bold text-[#1c1c1a] text-center mb-6">WEEKLY<br/>WORSHIP</h3>
             <button className="bg-[#009b72] text-white px-6 py-2 rounded-full font-serif font-bold hover:scale-105 transition-transform text-sm shadow-[2px_2px_0_rgba(0,0,0,1)]">Learn More</button>
             <span className="absolute bottom-2 right-2 font-anton text-xs text-[#009b72]">IJU</span>
          </div>

          <div className="w-64 h-80 bg-[#f4f4f0] border-4 border-[#cc2936] shadow-[8px_8px_0_rgba(0,0,0,1)] -rotate-[2deg] md:-mr-6 hover:rotate-0 hover:z-30 transition-all duration-300 flex flex-col items-center justify-center p-6 bg-paper-texture relative group mt-4 md:mt-0 z-10">
             <span className="absolute top-2 left-2 font-anton text-xs text-[#cc2936]">TACN</span>
             <h3 className="font-serif text-3xl font-bold text-[#1c1c1a] text-center mb-6">YOUTH<br/>COMMUNITY</h3>
             <Link href="/auth/register">
               <button className="bg-[#cc2936] text-white px-6 py-2 rounded-full font-serif font-bold hover:scale-105 transition-transform text-sm shadow-[2px_2px_0_rgba(0,0,0,1)]">Join Family</button>
             </Link>
             <span className="absolute bottom-2 right-2 font-anton text-xs text-[#cc2936]">IJU</span>
          </div>

          <div className="w-64 h-80 bg-[#f4f4f0] border-4 border-[#004e89] shadow-[8px_8px_0_rgba(0,0,0,1)] rotate-[4deg] md:-mr-6 hover:rotate-0 hover:z-30 transition-all duration-300 flex flex-col items-center justify-center p-6 bg-paper-texture relative group mt-4 md:mt-0 z-20">
             <span className="absolute top-2 left-2 font-anton text-xs text-[#004e89]">TACN</span>
             <h3 className="font-serif text-3xl font-bold text-[#1c1c1a] text-center mb-6">OUTREACH<br/>OFFLINE</h3>
             <button className="bg-[#004e89] text-white px-6 py-2 rounded-full font-serif font-bold hover:scale-105 transition-transform text-sm shadow-[2px_2px_0_rgba(0,0,0,1)]">See Events</button>
             <span className="absolute bottom-2 right-2 font-anton text-xs text-[#004e89]">IJU</span>
          </div>

          <div className="w-64 h-80 bg-[#f4f4f0] border-4 border-[#ffbc42] shadow-[8px_8px_0_rgba(0,0,0,1)] rotate-[10deg] hover:rotate-0 hover:z-30 transition-all duration-300 flex flex-col items-center justify-center p-6 bg-paper-texture relative group mt-4 md:mt-0 z-0">
             <span className="absolute top-2 left-2 font-anton text-xs text-[#ffbc42]">TACN</span>
             <h3 className="font-serif text-3xl font-bold text-[#1c1c1a] text-center mb-6">MEMBER<br/>PORTAL</h3>
             <Link href="/auth/login">
               <button className="bg-[#ffbc42] text-[#1c1c1a] px-6 py-2 rounded-full font-serif font-bold hover:scale-105 transition-transform text-sm shadow-[2px_2px_0_rgba(0,0,0,1)]">Sign In</button>
             </Link>
             <span className="absolute bottom-2 right-2 font-anton text-xs text-[#ffbc42]">IJU</span>
          </div>
        </div>
      </section>

      {/* FELLOWSHIP BLOCK (BLUE) */}
      <section id="fellowship" className="bg-[#004e89] py-24 sm:py-32 px-4 border-b-4 border-[#1c1c1a] text-center relative selection:bg-white/30 selection:text-black">
         <div className="max-w-5xl mx-auto">
           <div className="flex justify-center items-center gap-2 mb-8">
             <span className="font-anton text-3xl text-white">T</span>
             <span className="font-anton text-3xl text-[#cc2936]">A</span>
             <span className="font-anton text-3xl text-[#ffbc42]">C</span>
             <span className="font-anton text-3xl text-[#009b72]">N</span>
           </div>
           
           <h2 className="font-anton text-6xl md:text-[9rem] leading-[0.9] text-white drop-shadow-[6px_6px_0_rgba(0,0,0,1)] uppercase mb-8 border-b-8 border-white pb-6 inline-block">
             FELLOWSHIP
           </h2>

           <p className="font-serif text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-16 leading-relaxed">
             Sundays are where we start. Offline is where we build. Conversations that don't leave the room featuring the most passionate minds from our assembly.
           </p>

           <div className="mb-20">
             <Link href="/auth/register">
               <button className="bg-[#1c1c1a] text-white px-8 py-3 rounded-full font-serif font-bold text-lg hover:bg-white hover:text-[#1c1c1a] transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] border-2 border-[#1c1c1a]">
                 Join The Family
               </button>
             </Link>
           </div>

           <div className="absolute left-6 text-white font-serif font-bold tracking-widest text-sm uppercase -rotate-90 origin-bottom-left bottom-24 hidden lg:block">
             SOME MEMORIES
           </div>

           <div className="flex gap-4 overflow-x-auto pb-8 snap-x border-y-4 border-[#1c1c1a] bg-[#1c1c1a] p-4 hide-scrollbar">
             {[
               "https://images.unsplash.com/photo-1544427920-c49ccfc8e294?w=500&auto=format&fit=crop&q=80",
               "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&auto=format&fit=crop&q=80",
               "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=500&auto=format&fit=crop&q=80",
               "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&auto=format&fit=crop&q=80"
             ].map((img, i) => (
                <div key={i} className="min-w-[80vw] md:min-w-[400px] h-80 relative flex-shrink-0 snap-center border-4 border-white transition-opacity hover:opacity-90">
                  <Image src={img} alt="Event" fill className="object-cover" />
                </div>
             ))}
           </div>
         </div>
      </section>

      {/* MINISTRY BLOCK (GREEN) */}
      <section id="ministry" className="bg-[#009b72] py-24 sm:py-32 px-4 border-b-4 border-[#1c1c1a] text-center relative selection:bg-white/30 selection:text-black">
         <div className="max-w-6xl mx-auto">
           <h2 className="font-anton text-6xl md:text-[10rem] leading-[0.9] text-white drop-shadow-[6px_6px_0_rgba(0,0,0,1)] uppercase mb-8 border-b-8 border-white pb-6 inline-block">
             DEPARTMENTS
           </h2>

           <p className="font-serif text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-16 leading-relaxed">
             Long-form, unscripted commitment with the church. Tune into areas sharp enough to shift perspective and strengthen your spirit.
           </p>

           <div className="mb-20">
             <Link href="/auth/register">
                <button className="bg-[#1c1c1a] text-white px-8 py-3 rounded-full font-serif font-bold text-lg hover:bg-white hover:text-[#1c1c1a] transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] border-2 border-[#1c1c1a]">
                  Find Your Ministry
                </button>
             </Link>
           </div>

           <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                { title: "MUSIC MINISTRY", sub: "Praise & Worship", color: "bg-[#004e89]" },
                { title: "DRAMA CLUB", sub: "Creative Arts", color: "bg-[#ffbc42]", textCol: "text-[#1c1c1a]" },
                { title: "INTERCESSORY", sub: "Prayer Warriors", color: "bg-[#cc2936]" }
              ].map((dept, i) => (
                <div key={i} className={`${dept.color} ${dept.textCol || 'text-white'} p-8 border-4 border-[#1c1c1a] shadow-[8px_8px_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform`}>
                  <div className="font-anton text-3xl mb-4 uppercase">{dept.title}</div>
                  <div className="font-serif font-bold border-t-2 border-current pt-4">-- {dept.sub}</div>
                  <div className="mt-8">
                     <button className="bg-transparent border-2 border-current px-4 py-1 font-bold text-sm hover:bg-[#1c1c1a] hover:text-white transition-colors hover:border-[#1c1c1a]">Explore</button>
                  </div>
                </div>
              ))}
           </div>
         </div>
      </section>

      {/* COMMUNITY BLOCK (RED) */}
      <section id="community" className="bg-[#cc2936] py-24 sm:py-32 px-4 border-b-4 border-[#1c1c1a] text-center relative selection:bg-white/30 selection:text-black">
         <div className="max-w-5xl mx-auto">
           <h2 className="font-anton text-6xl md:text-[10rem] leading-[0.9] text-white drop-shadow-[6px_6px_0_rgba(0,0,0,1)] uppercase mb-8 border-b-8 border-white pb-6 inline-block">
             OUR COMMUNITY
           </h2>

           <p className="font-serif text-xl md:text-2xl text-red-100 max-w-3xl mx-auto mb-16 leading-relaxed">
             TACN Youth is our closely-knit community of builders, creators, and independent thinkers. It's where the right introductions, ideas, and spiritual momentum happen.
           </p>

           <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
             <Link href="/auth/register">
               <button className="bg-[#f4f4f0] text-[#1c1c1a] px-8 py-3 rounded-full font-serif font-bold text-lg hover:scale-105 transition-transform shadow-[4px_4px_0_rgba(0,0,0,1)] border-2 border-[#1c1c1a]">
                 Join The Movement
               </button>
             </Link>
             <Link href="/auth/login">
               <button className="bg-[#1c1c1a] text-white px-8 py-3 rounded-full font-serif font-bold text-lg hover:bg-black transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] border-2 border-[#1c1c1a]">
                 Member Portal
               </button>
             </Link>
           </div>
           
           <div className="absolute left-6 text-white font-serif font-bold tracking-widest text-sm uppercase -rotate-90 origin-bottom-left bottom-24 hidden lg:block">
             SOME MOMORIES
           </div>

           {/* Vertical image slice gallery */}
           <div className="flex h-96 border-4 border-[#1c1c1a] shadow-[8px_8px_0_rgba(0,0,0,1)] overflow-hidden bg-black">
             {[
               "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80",
               "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&auto=format&fit=crop&q=80",
               "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&auto=format&fit=crop&q=80",
               "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&auto=format&fit=crop&q=80"
             ].map((img, i) => (
                <div key={i} className="flex-1 relative border-r-4 border-[#1c1c1a] last:border-r-0 hover:flex-[1.5] transition-all duration-500 cursor-pointer grayscale hover:grayscale-0">
                  <Image src={img} alt="Community" fill className="object-cover" />
                </div>
             ))}
           </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1c1c1a] text-[#f4f4f0] py-16 px-4 border-t-8 border-[#009b72]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex flex-col items-center md:items-start z-10">
             <div className="flex items-center gap-1 mb-4">
                <span className="font-anton text-4xl text-[#cc2936]">T</span>
                <span className="font-anton text-4xl text-[#009b72]">A</span>
                <span className="font-anton text-4xl text-[#ffbc42]">C</span>
                <span className="font-anton text-4xl text-[#004e89]">N</span>
             </div>
             <p className="font-serif text-gray-400 font-bold uppercase tracking-widest text-sm">Iju Station Youth Movement</p>
           </div>
           
           <div className="flex flex-wrap justify-center gap-6 font-anton uppercase text-xl">
             <Link href="/" className="hover:text-[#009b72] transition-colors">Home</Link>
             <Link href="/auth/register" className="hover:text-[#cc2936] transition-colors">Join Us</Link>
             <Link href="/auth/login" className="hover:text-[#ffbc42] transition-colors">Sign In</Link>
           </div>

           <div className="text-gray-500 font-serif text-sm">
             © 2024 TACN IJU. All boundaries pushed.
           </div>
        </div>
      </footer>
    </div>
  )
}