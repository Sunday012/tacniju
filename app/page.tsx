import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-0 sm:h-16 gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Church Family</h1>
                <p className="text-xs text-gray-600">Youth Movement</p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  className="text-gray-700 border hover:text-indigo-600 px-4 py-2 text-sm sm:text-base w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm sm:text-base w-full sm:w-auto">
                  Join Family
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Background Image */}
      <section className="relative py-16 sm:py-20 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-r from-black/60 via-black/40 to-black/60">
            <Image
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Community worship" 
              width={2070}
              height={1380}
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center text-white">
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                The Apostolic Church Nigeria - IJU Station Area
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Join Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Church Family
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Welcome to our youth movement registration portal. Connect with fellow believers, track your spiritual
              journey, and become an active part of our growing community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-base sm:text-lg px-6 sm:px-8 py-3 h-auto w-full sm:w-auto">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                  Join Our Family
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 h-auto border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 w-full sm:w-auto">
                  Already a Member? Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Spirit Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              {/* <Image
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Youth fellowship"
                height={384}
                className="object-cover rounded-2xl shadow-2xl"
              /> */}
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                A Community That <span className="text-indigo-600">Lifts Each Other</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Experience the power of unity as we worship, grow, and serve together. Our youth movement is more than just a group - we&apos;re a family bound by faith, hope, and love.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Weekly fellowship and worship</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Mentorship and spiritual guidance</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Community outreach programs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What You&apos;ll Experience</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Join a community where faith meets fellowship, and growth happens together.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Easy Registration</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Simple and secure registration process to join our youth movement and start your spiritual journey.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Track Your Growth</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Monitor your attendance, participation in departments, and spiritual advancement through our ranking
                  system.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Community Connection</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Connect with fellow youth, participate in various departments, and build lasting friendships in faith.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Activism and Community Service Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                <span className="text-indigo-600">Raise Your Voice</span> for Change
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Our youth movement isn&apos;t just about worship - we&apos;re about action. Join us in making a difference in our community through organized outreach, advocacy, and service projects that reflect God&apos;s love in action.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">50+</div>
                  <div className="text-sm text-gray-600">Community Projects</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">200+</div>
                  <div className="text-sm text-gray-600">Active Members</div>
                </div>
              </div>
            </div>
            <div>
              {/* <Image
                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Community activism and outreach" 
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl shadow-2xl"
              /> */}
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Find Your Ministry</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover where your talents and passion can serve God and the community.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {[
              { name: "Music", icon: "🎵", description: "Lead worship and praise through music ministry" },
              { name: "Ushering", icon: "🤝", description: "Welcome and guide members with hospitality" },
              { name: "Drama", icon: "🎭", description: "Share God&apos;s word through creative performances" },
              { name: "Clean Up", icon: "🧹", description: "Maintain our sacred space with care" },
              { name: "Intercessory", icon: "🙏", description: "Stand in the gap through prayer ministry" },
            ].map((dept) => (
              <Card key={dept.name} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <div className="text-3xl mb-3">{dept.icon}</div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{dept.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{dept.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fellowship and Worship Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Fellowship and worship" 
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div> */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Experience <span className="text-purple-600">Authentic Fellowship</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Connect with nature, connect with God, and connect with each other. Our fellowship extends beyond the church walls as we explore God&apos;s creation and strengthen our bonds as a spiritual family.
              </p>
              <Link href="/auth/register">
                <Button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 text-base w-full sm:w-auto">
                  Join Our Fellowship
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Join Our Family?</h2>
          <p className="text-lg sm:text-xl text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Take the first step in your spiritual journey with us. Register today and become part of something greater.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 text-base sm:text-lg px-6 sm:px-8 py-3 h-auto w-full sm:w-auto max-w-sm">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-lg">Church Family</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The Apostolic Church Nigeria
                <br />
                IJU-Station Area Youth Movement
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link href="/auth/register" className="block text-gray-400 hover:text-white transition-colors">
                  Join Us
                </Link>
                <Link href="/auth/login" className="block text-gray-400 hover:text-white transition-colors">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold mb-4 text-lg">Contact</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                For questions about registration or our youth programs, please contact your local church leaders.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 The Apostolic Church Nigeria - IJU Station Area. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}