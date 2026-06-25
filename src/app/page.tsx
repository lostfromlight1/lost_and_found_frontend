"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

import { MapPin, Clock3, ArrowRight, Image as ImageIcon, MoveRight } from "lucide-react";

// --- API & TYPES INTEGRATION ---
import { getAllPostsApi } from "@/features/post/api/posts.api";
import { PostResponseDto } from "@/features/post/api/response/posts.response";

// --- COMPONENT IMPORTS ---
import SupportModal, { ModalType } from "@/components/SupportModal";
import ScrollReveal from "@/components/ScrollReveal";

const faqs = [
  {
    question: "How do I prove an item is actually mine without scammers claiming it?",
    answer:
      "When you post a lost item, you privately list one or two identifying details only the true owner would know — a scratch, an engraving, what's in the wallet. Anyone replying has to match those before we share contact info.",
  },
  {
    question: "Is this service free?",
    answer:
      "Yes, completely. Reunite is free to post, search, and message — we believe getting your things back shouldn't cost you a thing.",
  },
  {
    question: "How do we safely meet up to hand the item over?",
    answer:
      "We recommend our verified Safe Handover Spots: cafes, libraries, and reception desks where staff confirm the exchange. Or use our in-app courier — tracked, insured, and contactless.",
  },
];

const stories = [
  {
    initials: "MR",
    name: "Maya R.",
    location: "Tampa",
    panic: "I left my daughter's favorite stuffed rabbit at Restaurant Joe's. She was already crying in the bus.",
    fix: "I posted on Reunite from the cafe. Forty minutes later, a barista at the airport cafe messaged me — she'd put it behind the counter.",
    relief: "Picked up the next morning. My daughter never knew. More than just an adventure. Total lifesaver.",
    color: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  {
    initials: "DK",
    name: "Daniel K.",
    location: "Brooklyn",
    panic: "Wallet gone after a long shift: license, two cards, and a photo of my late dad that I cannot replace.",
    fix: "I posted around tonight. A rideshare driver saw it first, recognized the description, drove it back to me before work.",
    relief: "He wouldn't even take a tip. I keep the photo in a zipped pocket now. Reunite gave me the back a piece of him.",
    color: "bg-blue-50 text-blue-800 border border-blue-200",
  },
  {
    initials: "PS",
    name: "Priya S.",
    location: "Manchester",
    panic: "Lost my engagement ring at the gym. I sat in the parking lot for an hour just staring jacket keys.",
    fix: "A cleaner had found it and posted it on Reunite that afternoon. The identifying-detail check matched on the first try.",
    relief: "Met at the Tesco down the road next day. I hugged a stranger. I'll never not rave about this app.",
    color: "bg-rose-50 text-rose-800 border border-rose-200",
  },
];

export default function LandingPage() {
  const [recentItems, setRecentItems] = useState<PostResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pop Text Entrance State Management
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Modal Visibility State Management
  const [modalType, setModalType] = useState<ModalType>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    async function fetchLiveFeed() {
      try {
        const response = await getAllPostsApi({ page: 0, size: 4 });
        if (response && response.content) {
          setRecentItems(response.content);
        }
      } catch (error) {
        console.error("Error retrieving live feed items:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLiveFeed();
  }, []);

  const openModal = (type: Exclude<ModalType, null>) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
  };

  const formatTimestamp = (dateString?: string | Date) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans text-slate-900 antialiased scroll-smooth selection:bg-[#1d9bf0] selection:text-white">

      {/* BRAND HEADER & HERO BANNER */}
      <div className="relative w-full min-h-dvh flex flex-col justify-between overflow-hidden bg-white">

        {/* Updated Background Gradient Mask (Light theme matching PostFeed background) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-slate-100 z-0" />

        {/* Interactive Content Wrapper */}
        <div className="relative z-10 w-full flex-1 flex flex-col justify-between items-center">

          {/* BRAND HEADER (Now with pristine dark text) */}
          <header className="flex items-center justify-between px-6 md:px-12 py-5 max-w-[90rem] mx-auto w-full">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 bg-[#1d9bf0] rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-12">
                B
              </div>
              <span className="font-serif font-bold text-3xl tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-black">
                Back2U
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
              <a
                href="#latest-posts"
                onClick={(e) => handleScroll(e, "latest-posts")}
                className="relative py-1 transition-colors duration-300 hover:text-black after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#1d9bf0] after:transition-all after:duration-300 hover:after:w-full"
              >
                Latest Posts
              </a>
              <a
                href="#top-questions"
                onClick={(e) => handleScroll(e, "top-questions")}
                className="relative py-1 transition-colors duration-300 hover:text-black after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#1d9bf0] after:transition-all after:duration-300 hover:after:w-full"
              >
                Top Questions
              </a>
              <a
                href="#reviews"
                onClick={(e) => handleScroll(e, "reviews")}
                className="relative py-1 transition-colors duration-300 hover:text-black after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#1d9bf0] after:transition-all after:duration-300 hover:after:w-full"
              >
                Reviews
              </a>
            </nav>

            <div className="flex items-center gap-5 text-sm font-bold">
              <Link href="/login" className="text-slate-600 hover:text-black transition-all duration-300 hover:scale-105 py-2 px-3">
                Sign In
              </Link>
              <Button asChild size="sm" className="bg-[#1d9bf0] text-white rounded-full hover:bg-[#1a8cd8] text-sm px-6 py-3 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm border border-transparent">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </header>

          {/* HERO MAIN TEXT INTERFACE */}
          <section className="w-full max-w-5xl mx-auto text-center px-6 flex flex-col items-center justify-center flex-1 py-8">

            {/* Badge Context Metric */}
            <div
              className={`inline-flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-full px-4 py-2 mb-8 shadow-sm transition-all duration-700 ease-out transform ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                } hover:scale-105`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d9bf0] animate-pulse"></span>
              1,295 items returned by their owners this month
            </div>

            {/* Dark/Black Title Typography */}
            <h1
              className={`text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-[1.1] tracking-tight mb-6 transition-all duration-700 ease-out delay-150 transform ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.97]"
                }`}
            >
              Take a breath.<br />
              <span className="bg-linear-to-r from-slate-900 via-slate-700 to-black bg-clip-text text-transparent">
                Let's find it together.
              </span>
            </h1>

            {/* Core Strategy Description */}
            <p
              className={`text-slate-600 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium transition-all duration-700 ease-out delay-300 transform ${isMounted ? "opacity-[0.95] translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]"
                }`}
            >
              Reunite is a community lost &amp; found for your city — wallets, keys, the stuffed rabbit, the wedding ring. Post once in 30 seconds, and neighbors start looking for it.
            </p>

            {/* Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto transition-all duration-700 ease-out delay-500 transform ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                }`}
            >
              <Button asChild size="lg" className="group/btn w-full sm:w-auto bg-[#1d9bf0] text-white hover:bg-[#1a8cd8] font-bold rounded-full px-8 py-6 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 text-base border border-transparent">
                <Link href="/login" className="flex items-center justify-center gap-2">
                  Get Started
                  <MoveRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5" />
                </Link>
              </Button>
            </div>
          </section>

          {/* Bounce Down Scroll Indicator Cue */}
          <div className="w-full flex justify-center pb-8">
            <a
              href="#latest-posts"
              onClick={(e) => handleScroll(e, "latest-posts")}
              className="flex flex-col items-center gap-1 text-[11px] font-extrabold tracking-widest text-slate-400 uppercase hover:text-slate-900 transition-colors duration-300 group"
            >
              <span className="transition-tracking duration-300 group-hover:tracking-wider">Explore Live Feed</span>
              <svg
                className="w-4 h-4 animate-bounce mt-1 text-slate-400 group-hover:text-slate-900 transition-colors"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </a>
          </div>

        </div>
      </div>

      {/* MAIN SYSTEM CONTAINER CANVAS */}
      <main className="flex-1 flex flex-col items-center w-full">

        {/* LATEST POSTS FEED SECTION */}
        <section id="latest-posts" className="w-full max-w-[90rem] mx-auto px-6 md:px-12 pb-24 pt-20 scroll-mt-6">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-bold text-[#1d9bf0] uppercase tracking-widest mb-1.5">Live feed</p>
                <h2 className="text-3xl font-serif font-bold text-slate-900">Reported in the last few hours</h2>
              </div>
              <Link href="/login" className="group/link text-sm font-bold text-slate-500 hover:text-[#1d9bf0] transition-colors duration-300 flex items-center gap-1.5 self-start sm:self-auto">
                View all active items
                <ArrowRight size={16} className="transition-transform duration-300 group-hover/link:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-3xl p-5 shadow-xs flex flex-col gap-4 animate-pulse border border-slate-200">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-5 bg-slate-200 rounded-full"></div>
                    <div className="w-20 h-5 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="h-44 bg-slate-100 rounded-2xl"></div>
                  <div className="space-y-2.5 mt-1">
                    <div className="h-5 bg-slate-200 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center text-slate-500 font-semibold shadow-xs border border-slate-200 w-full">
              No items reported recently. Be the first to post!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentItems.map((item, index) => {
                const isLost = item.type?.toUpperCase() === "LOST";
                const typeChipClass = isLost ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-[#1d9bf0] border-blue-100";

                const activeImage = item.images && item.images.length > 0 ? item.images[0].url : null;
                const hasValidImage = typeof activeImage === "string" && activeImage.trim() !== "";

                return (
                  <ScrollReveal key={item.id} delay={index * 100}>
                    <Link href="/login" className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white text-slate-700 p-5 shadow-sm transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-1.5 active:translate-y-0 flex flex-col gap-4 will-change-transform">
                      <div className="flex items-center justify-between gap-2 z-10">
                        <span className={`text-[10px] font-extrabold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full border ${typeChipClass} transition-colors duration-300`}>
                          {item.type}
                        </span>
                        {item.category?.name && (
                          <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] bg-slate-50 text-slate-500 border border-slate-200 rounded-full px-2.5 py-1 max-w-[140px] truncate">
                            {item.category.name}
                          </span>
                        )}
                      </div>

                      <div className="relative w-full h-44 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-slate-100">
                        {hasValidImage ? (
                          <Image src={activeImage} alt={item.title || "Item"} fill sizes="(max-w-7xl) 25vw, 33vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" priority={false} />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300">
                            <ImageIcon size={28} strokeWidth={1.5} className="text-slate-300 group-hover:text-slate-400 transition-colors duration-300" />
                            <span className="text-xs font-bold tracking-wide">View details <span className="text-[#1d9bf0] font-bold">++</span></span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 flex-1 z-10">
                        <h3 className="text-lg font-extrabold text-slate-900 leading-snug line-clamp-1 capitalize transition-colors duration-300 group-hover:text-[#1d9bf0]">
                          {item.title}
                        </h3>
                        <div className="space-y-1.5">
                          <p className="text-13px text-slate-600 font-semibold leading-snug flex items-center gap-1.5 line-clamp-1">
                            <MapPin size={14} className="text-slate-400 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                            <span className="truncate">{item.locationDetails || "Unknown Location"}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                            <Clock3 size={14} className="text-slate-400 shrink-0" />
                            {formatTimestamp(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto w-full border border-slate-200 bg-slate-50 text-slate-600 rounded-full text-xs font-bold uppercase tracking-[0.12em] py-3 text-center transition-all duration-300 group-hover:bg-[#1d9bf0] group-hover:text-white group-hover:border-[#1d9bf0] shadow-xs">
                        view details
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </section>

        {/* TOP QUESTIONS SECTION */}
        <section id="top-questions" className="w-full max-w-3xl mx-auto px-6 pb-24 text-center pt-20 scroll-mt-6">
          <ScrollReveal>
            <p className="text-xs font-bold text-[#1d9bf0] uppercase tracking-widest mb-2">Before you post</p>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-10">The three questions everyone asks</h2>
          </ScrollReveal>

          <div className="space-y-4 text-left">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="bg-white rounded-2xl px-8 py-6 shadow-sm border border-slate-200 transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
                  <p className="text-base font-bold text-slate-900 mb-2">{faq.question}</p>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* REVIEWS SECTION */}
        <section id="reviews" className="w-full max-w-7xl mx-auto px-6 md:px-12 pb-28 text-center pt-20 scroll-mt-6">
          <ScrollReveal>
            <p className="text-xs font-bold text-[#1d9bf0] uppercase tracking-widest mb-2">The Reunion Wall</p>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-12">Stories from people who got it back</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {stories.map((s, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-200 flex flex-col gap-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 will-change-transform">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-xs transition-transform duration-500 hover:rotate-12 ${s.color}`}>
                      {s.initials}
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{s.name}</p>
                      <p className="text-xs font-medium text-slate-400">{s.location}</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-slate-600 leading-relaxed font-medium">
                    <div className="transition-all duration-300 p-2 rounded-xl hover:bg-red-50/40">
                      <p className="font-bold mb-0.5 uppercase text-[10px] tracking-wider text-red-500">The panic</p>
                      <p className="text-slate-700">{s.panic}</p>
                    </div>
                    <div className="transition-all duration-300 p-2 rounded-xl hover:bg-blue-50/40">
                      <p className="font-bold mb-0.5 uppercase text-[10px] tracking-wider text-[#1d9bf0]">The quick fix</p>
                      <p className="text-slate-700">{s.fix}</p>
                    </div>
                    <div className="transition-all duration-300 p-2 rounded-xl hover:bg-slate-50">
                      <p className="font-bold mb-0.5 uppercase text-[10px] tracking-wider text-slate-400">The relief</p>
                      <p className="text-slate-700">{s.relief}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER SECTION */}
      <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-[90rem] mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-[#1d9bf0] rounded-full flex items-center justify-center text-white font-serif font-bold text-base shadow-sm transition-transform duration-300 group-hover:scale-105">
                B
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-white transition-colors duration-300 group-hover:text-slate-200">
                Back2U
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              &copy; {new Date().getFullYear()} Back2U. Bringing what's lost back to you.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-400">
            <button onClick={() => openModal("about")} className="hover:text-white transition-colors duration-200 focus:outline-none cursor-pointer">
              About Us
            </button>
            <button onClick={() => openModal("privacy")} className="hover:text-white transition-colors duration-200 focus:outline-none cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => openModal("terms")} className="hover:text-white transition-colors duration-200 focus:outline-none cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => openModal("contact")} className="hover:text-white font-bold text-blue-400 hover:text-blue-300 transition-colors duration-200 focus:outline-none cursor-pointer">
              Contact Support
            </button>
          </div>
        </div>
      </footer>

      {/* REUSED MODAL SYSTEM INJECTION */}
      <SupportModal isOpen={isModalOpen} modalType={modalType} onClose={closeModal} />
    </div>
  );
}