"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, CloudRain, Plane, Anchor, Radio, Award, Video, ShieldCheck, Phone, Mail, MapPin } from "lucide-react";

export function NiMetLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#006B3E] selection:text-white">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-[#003822] via-[#006B3E] to-[#071a47] text-white text-xs sm:text-sm py-2 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FFC931] animate-pulse" />
            <span className="font-medium tracking-wide">
              Federal Republic of Nigeria • Nigerian Meteorological Agency (NiMet)
            </span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100/90 text-xs">
            <span>📍 Abuja, Nigeria</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">📞 +234 9 291 9437</span>
            <span className="hidden md:inline">|</span>
            <a href="mailto:info@nimet.gov.ng" className="hover:text-white transition-colors">
              ✉️ info@nimet.gov.ng
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/nimet-logo.png"
              alt="Nigerian Meteorological Agency Logo"
              width={160}
              height={50}
              priority
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 font-medium text-slate-700 text-sm">
            <a href="#about" className="hover:text-[#006B3E] transition-colors">About Portal</a>
            <a href="#pillars" className="hover:text-[#006B3E] transition-colors">Training Focus</a>
            <a href="#features" className="hover:text-[#006B3E] transition-colors">Platform Capabilities</a>
            <a href="#stakeholders" className="hover:text-[#006B3E] transition-colors">Sectors Served</a>
            <a href="#contact" className="hover:text-[#006B3E] transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#006B3E] hover:bg-[#005230] shadow-md shadow-[#006B3E]/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0">
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#006B3E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-[#FFC931]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#006B3E] text-xs sm:text-sm font-semibold mb-6 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[#006B3E]" />
              <span>Official Meteorological Education & Training Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Advancing Meteorological Excellence &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006B3E] via-[#005230] to-[#071a47]">
                Weather Intelligence
              </span>{" "}
              in Nigeria
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-10 max-w-3xl mx-auto">
              The centralized digital learning, assessment, and research portal for the{" "}
              <strong>Nigerian Meteorological Agency (NiMet)</strong>. Equipping meteorologists, climate scientists, aviation professionals, and agricultural stakeholders with authoritative weather and climate training.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#006B3E] to-[#005230] hover:from-[#005230] hover:to-[#003822] shadow-xl shadow-[#006B3E]/25 transition-all transform hover:-translate-y-0.5">
                <span>Access Student & Staff Portal</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all">
                <span>Learn About the Platform</span>
              </a>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-slate-200">
              <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/60 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#006B3E]">WMO</div>
                <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Standardized Curricula</div>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/60 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#071a47]">100%</div>
                <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Automated CBT Grading</div>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/60 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#006B3E]">Live HD</div>
                <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Weather Briefings & Lectures</div>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/60 shadow-xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#071a47]">Nationwide</div>
                <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Observational Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#006B3E] text-xs font-semibold uppercase tracking-wider">
                Agency Mandate & Vision
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Transforming Meteorological Capacity Through Digital Learning
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">
                The <strong>Nigerian Meteorological Agency (NiMet)</strong> is statutorily mandated to observe, collate, analyze, and disseminate meteorological data and climate information across all socioeconomic sectors in Nigeria.
              </p>
              <p className="text-slate-600 leading-relaxed text-base">
                This digital learning portal streamlines professional development, standardized Computer-Based Testing (CBT), synoptic weather chart analysis, and continuous certification for meteorological officers, aviation personnel, and allied scientists.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#006B3E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Standardized Testing</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Rigorous CBT assessments for certification.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#006B3E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Interactive Briefings</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time live video and weather forecasting sessions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#006B3E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Structured Courseware</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Comprehensive syllabi in synoptic and physical meteorology.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#006B3E] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Verified Credentials</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Instant tamper-proof digital certificate verification.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-gradient-to-br from-[#071a47] via-[#005230] to-[#003822] rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFC931]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between border-b border-emerald-700/50 pb-4">
                    <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">NiMet Training Ecosystem</span>
                    <span className="text-xs bg-[#FFC931] text-slate-900 font-bold px-2.5 py-0.5 rounded-full">Active</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold leading-snug">
                    World-Class Meteorological Training Infrastructure
                  </h3>
                  <p className="text-sm text-emerald-100/80 leading-relaxed">
                    Empowering Nigeria&apos;s national weather observing network with modern digital education, synoptic analysis toolkits, and early warning climate intelligence.
                  </p>
                  <div className="space-y-3 pt-2">
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 flex items-center justify-between">
                      <span className="text-sm font-medium">Synoptic & Dynamic Meteorology</span>
                      <span className="text-xs bg-emerald-400/20 text-emerald-300 font-semibold px-2 py-0.5 rounded">Core Track</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 flex items-center justify-between">
                      <span className="text-sm font-medium">Aviation Weather & TAF Reporting</span>
                      <span className="text-xs bg-emerald-400/20 text-emerald-300 font-semibold px-2 py-0.5 rounded">Certified</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/10 flex items-center justify-between">
                      <span className="text-sm font-medium">Seasonal Rainfall & Climate Prediction</span>
                      <span className="text-xs bg-emerald-400/20 text-emerald-300 font-semibold px-2 py-0.5 rounded">Advanced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Pillars */}
      <section id="pillars" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#006B3E] text-xs font-semibold uppercase tracking-wider mb-3">
              Curriculum & Disciplines
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Specialized Training Focus Areas
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-4">
              High-level courseware and assessment modules tailored to critical meteorological disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006B3E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Aviation Meteorology</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Flight safety forecasting, Terminal Aerodrome Forecasts (TAF), METAR/SPECI reporting, upper-air wind analysis, and severe turbulence tracking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006B3E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CloudRain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Agro-Meteorology</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Seasonal Rainfall Prediction (SRP), drought monitoring, soil moisture modeling, and crop-weather advisory to boost national food security.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006B3E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Anchor className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Marine & Hydrology</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Coastal weather observations, sea-state forecasting, storm surge advisories, and hydrological flood risk early warning systems.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006B3E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Radar & Satellite</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Meteosat imagery analysis, Doppler weather radar interpretation, Numerical Weather Prediction (NWP), and severe convective storm diagnostics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#006B3E] text-xs font-semibold uppercase tracking-wider mb-3">
              Portal Features
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Rigorous Meteorological Education
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-4">
              Integrated digital tools powering distance training, real-time assessments, and institutional collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/70 hover:bg-white hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#006B3E] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-[#006B3E]/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">CBT Examination System</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Comprehensive Computer-Based Testing engine with randomized meteorological questions, synoptic chart questions, timed exams, and instant performance analytics.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/70 hover:bg-white hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#071a47] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-[#071a47]/20">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Live Video Sessions & Briefings</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                High-definition virtual classrooms designed for live synoptic chart reviews, daily weather briefing webinars, and interactive instructor-led workshops.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/70 hover:bg-white hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#006B3E] text-white flex items-center justify-center font-bold text-xl mb-6 shadow-md shadow-[#006B3E]/20">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Certified Credentials</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automated generation of verified digital certificates with unique verification QR codes, confirming training completion and technical competencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section id="stakeholders" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#006B3E] text-xs font-semibold uppercase tracking-wider mb-3">
              Who We Serve
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Supporting Diverse National Sectors
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-4">
              Providing tailored meteorological learning paths for specialized operational personnel across Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl mb-2">🧑‍🔬</div>
              <h4 className="text-sm font-bold text-slate-900">NiMet Officers</h4>
              <p className="text-xs text-slate-500 mt-1">Continuous Professional Training</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl mb-2">👨‍✈️</div>
              <h4 className="text-sm font-bold text-slate-900">Aviation Stakeholders</h4>
              <p className="text-xs text-slate-500 mt-1">Pilots & ATC Officers</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl mb-2">🚜</div>
              <h4 className="text-sm font-bold text-slate-900">Agro-Advisory</h4>
              <p className="text-xs text-slate-500 mt-1">Agricultural Extension Staff</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl mb-2">🚢</div>
              <h4 className="text-sm font-bold text-slate-900">Marine Operators</h4>
              <p className="text-xs text-slate-500 mt-1">Port & Maritime Safety</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
              <div className="text-3xl mb-2">🎓</div>
              <h4 className="text-sm font-bold text-slate-900">Students & Researchers</h4>
              <p className="text-xs text-slate-500 mt-1">Atmospheric Science Cadets</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#003822] via-[#006B3E] to-[#071a47] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Access the NiMet Learning Platform?
          </h2>
          <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl mx-auto">
            Sign in with your official account credentials to access your courses, live lecture sessions, CBT assessments, and certificates.
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-slate-900 bg-[#FFC931] hover:bg-[#ffe082] shadow-xl transition-all transform hover:-translate-y-0.5">
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 text-sm py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
            <div className="md:col-span-5 space-y-4">
              <Image
                src="/nimet-logo.png"
                alt="NiMet Logo"
                width={160}
                height={50}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                Nigerian Meteorological Agency (NiMet) is the Federal Government agency responsible for weather observation, forecasting, and climate services across Nigeria.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Platform Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About Portal</a></li>
                <li><a href="#pillars" className="hover:text-white transition-colors">Training Focus</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">CBT Assessments</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors font-semibold text-emerald-400">Portal Login</Link></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Agency Headquarters</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                National Weather Forecasting & Climate Research Centre,<br />
                Bill Clinton Drive, Nnamdi Azikiwe International Airport,<br />
                Abuja, Nigeria.
              </p>
              <div className="text-xs space-y-1 text-slate-300 pt-1">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-400" /> +234 9 291 9437</div>
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-emerald-400" /> info@nimet.gov.ng | support@nimet.gov.ng</div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} Nigerian Meteorological Agency (NiMet). All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="https://nimet.gov.ng" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">Official NiMet Website</a>
              <Link href="/login" className="hover:text-slate-400 transition-colors">Learning Portal Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
