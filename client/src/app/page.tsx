"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Destination {
  title: string;
  tagline: string;
  bgUrl: string;
  link: string;
}

interface SpotlightCard {
  title: string;
  location: string;
  price: number;
  duration: string;
  rating: number;
  imageUrl: string;
}

interface Testimonial {
  name: string;
  location: string;
  review: string;
  avatarUrl: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Home() {
  // Hero Interactive Slider State
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Auto-rotate background image every 5 seconds (interval resets when user manually navigates)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlide]);

  const destinations: Destination[] = [
    {
      title: "Kyoto, Japan",
      tagline: "Sacred shrine walks, seasonal cherry blossoms, and traditional ryokans.",
      bgUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      link: "/explore?search=Kyoto"
    },
    {
      title: "Zermatt, Switzerland",
      tagline: "Majestic Matterhorn skiing views paired with alpine spa wellness luxury.",
      bgUrl: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80",
      link: "/explore?search=Zermatt"
    },
    {
      title: "Serengeti, Tanzania",
      tagline: "Witness the Great Wilderness Migration under guidance of elite local trackers.",
      bgUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
      link: "/explore?search=Serengeti"
    }
  ];

  // Spotlight catalog cards
  const spotCards: SpotlightCard[] = [
    {
      title: "Tropical Paradise Getaway",
      location: "Bali, Indonesia",
      price: 1200,
      duration: "7 Days / 6 Nights",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Alpine Ski & Wellness Retreat",
      location: "Zermatt, Switzerland",
      price: 2450,
      duration: "5 Days / 4 Nights",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Cultural Wonders of Kyoto",
      location: "Kyoto, Japan",
      price: 1850,
      duration: "6 Days / 5 Nights",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Wildlife Safari Adventure",
      location: "Serengeti, Tanzania",
      price: 3200,
      duration: "8 Days / 7 Nights",
      rating: 4.95,
      imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // Testimonials
  const testimonials: Testimonial[] = [
    {
      name: "Marcus Vance",
      location: "Boston, USA",
      review: "The itinerary customized by Claude in the Trip Planner was incredibly accurate. We asked for historical shrines and food stops in Kyoto, and it planned a seamless route. The admin quote process took less than 2 hours!",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80"
    },
    {
      name: "Sophia Martinez",
      location: "Madrid, Spain",
      review: "Booking our honeymoon to Zermatt was completely stress-free. We loved editing constraints directly in the chat with the assistant. The chalets and spas recommended fit our exact requirements.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80"
    },
    {
      name: "Liam O'Connor",
      location: "Dublin, Ireland",
      review: "Being able to see status badges update from 'pending' to 'quoted' in the dashboard gave me complete visibility. The Serengeti safari tracker they arranged went beyond standard wildlife tour expectations.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80"
    }
  ];

  // Expandable FAQ State & Items
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How does the AI Trip Planner generate recommendations?",
      answer: "Our system combines your traveler history and preferences with catalog packages from our database. These candidates are processed by Claude to create a customized itinerary matching your specifications, which is then sent to an administrator to build your final price quote."
    },
    {
      question: "Can I customize the generated AI recommendations?",
      answer: "Absolutely. You can edit parameters like length, price limits, or specific destinations. Once you create a trip request, it enters our administrative queue where our team reviews and establishes an official pricing quote for your approval."
    },
    {
      question: "Are the package prices final?",
      answer: "Catalog prices listed on our Explore page represent historical baseline rates. For custom-tailored itineraries, prices are determined dynamically based on active flight routes, lodging reservations, and options selected during the quoting process."
    },
    {
      question: "What is the difference between a Traveler and Admin account?",
      answer: "Travelers can browse packages, compile custom itineraries, request quotes, and track their active bookings. Admins manage the catalogs, review custom traveler itineraries in a centralized queue, and issue pricing quotes."
    }
  ];

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % destinations.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + destinations.length) % destinations.length);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900 font-sans">
      
      {/* HERO SECTION — RESTRICTED TO 60%-70% SCREEN HEIGHT */}
      <section className="relative h-[65vh] w-full bg-neutral-900 text-white overflow-hidden">
        {/* Background Image Carousel Layer */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeSlide}
              src={destinations[activeSlide].bgUrl}
              alt={destinations[activeSlide].title}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/60 to-transparent" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 mx-auto max-w-7xl h-full px-6 flex flex-col justify-center max-w-2xl sm:px-8">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-secondary font-semibold text-xs uppercase tracking-widest mb-2"
          >
            Spotlight Destination
          </motion.span>
          
          <AnimatePresence mode="wait">
            <motion.h1 
              key={activeSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="font-fraunces text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-3"
            >
              {destinations[activeSlide].title}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p 
              key={activeSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-sans text-neutral-200 text-base sm:text-lg mb-8 max-w-lg leading-relaxed"
            >
              {destinations[activeSlide].tagline}
            </motion.p>
          </AnimatePresence>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4"
          >
            <Link
              href="/trip-planner"
              className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-3 px-6 text-sm rounded-xl shadow-md transition-colors"
            >
              Plan Your Custom Trip
            </Link>
            <Link
              href="/explore"
              className="bg-transparent hover:bg-white/10 text-white border border-white font-semibold py-3 px-6 text-sm rounded-xl transition-colors"
            >
              Explore Packages
            </Link>
          </motion.div>
        </div>

        {/* Interactive Slider Navigation Elements */}
        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-3">
          <button
            onClick={handlePrevSlide}
            className="p-2.5 rounded-full bg-black/45 border border-white/20 text-white hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="Previous destination"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Slider Dot Indicators */}
          <div className="flex gap-1.5">
            {destinations.map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === index ? "w-6 bg-secondary" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextSlide}
            className="p-2.5 rounded-full bg-black/45 border border-white/20 text-white hover:bg-black/60 transition-colors cursor-pointer"
            aria-label="Next destination"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* TRUST / CRO CONVERSION VALUE BAR */}
      <section className="bg-white border-b border-neutral-200 py-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              🛡️
            </div>
            <div>
              <h4 className="font-fraunces text-sm font-semibold text-neutral-900">Verified Catalog Data</h4>
              <p className="text-xs text-neutral-450 mt-0.5">Real packages, grounded pricing, zero hallucinated rates.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-center sm:justify-start border-y sm:border-y-0 sm:border-x border-neutral-200 py-4 sm:py-0 sm:px-6">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              ⚡
            </div>
            <div>
              <h4 className="font-fraunces text-sm font-semibold text-neutral-900">Under 2hr Admin Quotes</h4>
              <p className="text-xs text-neutral-450 mt-0.5">Submit a customizable AI request, review quote immediately.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              🗺️
            </div>
            <div>
              <h4 className="font-fraunces text-sm font-semibold text-neutral-900">Human-Audited Customization</h4>
              <p className="text-xs text-neutral-450 mt-0.5">Every AI package matches active flights, lodging, and guides.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: SHAPING SIGNATURE SERVICES */}
      <section className="py-20 px-6 max-w-7xl mx-auto sm:px-8 border-b border-neutral-200">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-xs uppercase tracking-widest block mb-2">Our Services</span>
          <h2 className="font-fraunces text-3xl sm:text-4xl text-neutral-900 font-semibold">How We Elevate Travel</h2>
          <p className="text-neutral-700 font-sans text-sm mt-3">Combining personalized human support with generative agent frameworks to produce singular journeys.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants} className="bg-neutral-100 p-8 rounded-xl border border-neutral-200 hover:shadow-sm transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-fraunces text-xl font-semibold text-neutral-900 mb-3">AI Curation Engine</h3>
            <p className="text-neutral-700 text-sm leading-relaxed">
              We process filters, destination logs, and custom interests to rank available routes and options automatically.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-neutral-100 p-8 rounded-xl border border-neutral-200 hover:shadow-sm transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="font-fraunces text-xl font-semibold text-neutral-900 mb-3">Interactive Customization</h3>
            <p className="text-neutral-700 text-sm leading-relaxed">
              Refine your recommendations using interactive chat prompts, adjusting items for pricing constraints dynamically.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-neutral-100 p-8 rounded-xl border border-neutral-200 hover:shadow-sm transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-fraunces text-xl font-semibold text-neutral-900 mb-3">Admin Audits</h3>
            <p className="text-neutral-700 text-sm leading-relaxed">
              Every custom recommendation is verified and quote-checked by an admin, guaranteeing secure pricing.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 2: SPOTLIGHT PACKAGES (4 CARDS PER ROW IN DESKTOP) */}
      <section className="py-20 px-6 max-w-7xl mx-auto sm:px-8 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-primary font-semibold text-xs uppercase tracking-widest block mb-2">Selected Catalog</span>
            <h2 className="font-fraunces text-3xl font-semibold text-neutral-900">Featured Expeditions</h2>
          </div>
          <Link href="/explore" className="text-primary text-sm font-semibold hover:text-primary-dark mt-4 sm:mt-0 flex items-center gap-1">
            View All Packages →
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {spotCards.map((card, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 flex flex-col hover:shadow-md transition-shadow h-full"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-3 right-3 bg-neutral-900/85 text-xs text-white px-2 py-1 rounded-lg flex items-center gap-1 font-semibold">
                  <span className="text-accent">★</span>
                  <span>{card.rating}</span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <span className="text-neutral-400 text-xs font-medium mb-1 block">{card.location}</span>
                <h3 className="font-fraunces text-lg font-semibold text-neutral-900 mb-3 leading-snug">
                  {card.title}
                </h3>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-200">
                  <div className="text-xs text-neutral-700">
                    <span className="font-semibold block">{card.duration}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-400 block">From</span>
                    <span className="text-secondary font-bold text-base">${card.price}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 3: INTELLIGENCE AT WORK */}
      <motion.section 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 max-w-7xl mx-auto sm:px-8 border-b border-neutral-200 bg-neutral-100 rounded-2xl my-10 border border-neutral-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-primary font-semibold text-xs uppercase tracking-widest block">Core Technology</span>
            <h2 className="font-fraunces text-3xl sm:text-4xl text-neutral-900 font-semibold">Grounded AI Curation</h2>
            <p className="text-neutral-700 leading-relaxed font-sans text-sm">
              We never fabricate dummy information. Unlike open chatbot models that make up fake hotels or impossible travel prices, our curation is strictly grounded in a verified database.
            </p>
            <p className="text-neutral-700 leading-relaxed font-sans text-sm">
              When you use our Trip Planner, Claude reads from the catalog, filters out matching regions, and constructs a customized itinerary request. An administrator reviews the request, sets the live pricing details, and returns a secure, bookable quote to your traveler dashboard.
            </p>
            <div className="pt-2">
              <Link href="/about" className="text-primary font-semibold text-sm hover:underline">
                Read our engineering story →
              </Link>
            </div>
          </div>
          <div className="h-64 sm:h-96 relative rounded-xl overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80"
              alt="Historical explore"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </motion.section>

      {/* SECTION 4: BY THE NUMBERS */}
      <section className="py-16 px-6 max-w-7xl mx-auto sm:px-8 border-b border-neutral-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <span className="font-fraunces text-4xl font-bold text-primary block mb-1">5k+</span>
            <span className="text-xs text-neutral-200 font-semibold uppercase tracking-wider text-neutral-750 dark:text-neutral-400">
              Custom Trips Curated
            </span>
          </div>
          <div>
            <span className="font-fraunces text-4xl font-bold text-primary block mb-1">98%</span>
            <span className="text-xs text-neutral-200 font-semibold uppercase tracking-wider text-neutral-750 dark:text-neutral-400">
              Satisfaction Index
            </span>
          </div>
          <div>
            <span className="font-fraunces text-4xl font-bold text-primary block mb-1">45+</span>
            <span className="text-xs text-neutral-200 font-semibold uppercase tracking-wider text-neutral-750 dark:text-neutral-400">
              Countries Cataloged
            </span>
          </div>
          <div>
            <span className="font-fraunces text-4xl font-bold text-primary block mb-1">&lt; 2h</span>
            <span className="text-xs text-neutral-200 font-semibold uppercase tracking-wider text-neutral-750 dark:text-neutral-400">
              Average Quoting Time
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 5: TRAVELER TESTIMONIALS */}
      <motion.section 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 max-w-7xl mx-auto sm:px-8 border-b border-neutral-200"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-semibold text-xs uppercase tracking-widest block mb-2">Reviews</span>
          <h2 className="font-fraunces text-3xl font-semibold text-neutral-900 text-center">Verified Traveler Stories</h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-neutral-100 p-8 rounded-xl border border-neutral-200 flex flex-col justify-between hover:shadow-sm transition-shadow animate-card"
            >
              <p className="text-sm text-neutral-700 italic leading-relaxed mb-6 font-sans">
                &ldquo;{test.review}&rdquo;
              </p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 mt-auto">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-neutral-250">
                  <img
                    src={test.avatarUrl}
                    alt={test.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm leading-tight">{test.name}</h4>
                  <span className="text-xs text-neutral-400">{test.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* SECTION 6: FAQ ACCORDION (INTERACTIVE) */}
      <section className="py-20 px-6 max-w-4xl mx-auto sm:px-8 border-b border-neutral-200">
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-xs uppercase tracking-widest block mb-2">Help Desk</span>
          <h2 className="font-fraunces text-3xl font-semibold text-neutral-900">Common Queries</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 flex items-center justify-between text-left font-fraunces font-semibold text-neutral-900 border-none outline-none cursor-pointer"
              >
                <span>{faq.question}</span>
                <span className={`transform transition-transform font-sans text-neutral-405 font-bold ${openFaq === idx ? "rotate-45" : ""}`}>
                  ＋
                </span>
              </button>
              
              <div
                className={`transition-all duration-350 overflow-hidden ${
                  openFaq === idx ? "max-h-48 border-t border-neutral-200" : "max-h-0"
                }`}
              >
                <div className="p-5 font-sans text-neutral-700 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: SPECIFIC LATEST JOURNAL HIGHLIGHTS */}
      <motion.section 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 max-w-7xl mx-auto sm:px-8 border-b border-neutral-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-primary font-semibold text-xs uppercase tracking-widest block mb-2">Read Curation</span>
            <h2 className="font-fraunces text-3xl font-semibold text-neutral-900">The Curation Journal</h2>
          </div>
          <Link href="/blog" className="text-primary text-sm font-semibold hover:text-primary-dark mt-4 sm:mt-0">
            Visit Blog →
          </Link>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Blog post 1 */}
          <motion.div variants={itemVariants} className="bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col sm:flex-row">
            <div className="h-48 sm:h-auto sm:w-48 shrink-0 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80"
                alt="Kyoto"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider block mb-1">Cultural Curation</span>
                <h3 className="font-fraunces text-lg font-semibold text-neutral-900 mb-2 leading-tight">
                  Golden Temples & Kyoto&apos;s Hidden Shrines
                </h3>
                <p className="text-xs text-neutral-700 line-clamp-3">
                  Kyoto captures the authentic soul of historical Japan. Our curators share local guide tips for when to visit Kinkaku-ji and skip the crowds.
                </p>
              </div>
              <Link href="/blog" className="text-primary text-xs font-semibold hover:underline mt-4 block">
                Read Article →
              </Link>
            </div>
          </motion.div>

          {/* Blog post 2 */}
          <motion.div variants={itemVariants} className="bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col sm:flex-row">
            <div className="h-48 sm:h-auto sm:w-48 shrink-0 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=400&q=80"
                alt="Zermatt"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs text-secondary font-semibold uppercase tracking-wider block mb-1">Adventure Travel</span>
                <h3 className="font-fraunces text-lg font-semibold text-neutral-900 mb-2 leading-tight">
                  Matterhorn Peak Ski & Spa Plannings
                </h3>
                <p className="text-xs text-neutral-700 line-clamp-3">
                  A perfect snow holiday is about finding chalet cabins and spa listings. Discover the top spots in Zermatt reviewed.
                </p>
              </div>
              <Link href="/blog" className="text-primary text-xs font-semibold hover:underline mt-4 block">
                Read Article →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* SECTION 8: LAUNCH NEWSLETTER SUBSCRIPTIONS */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 max-w-5xl mx-auto sm:px-8 text-center"
      >
        <div className="bg-primary text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-lg">
          {/* Visual gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-dark via-primary to-primary-light opacity-90 z-0" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-secondary font-semibold text-xs uppercase tracking-widest block">Newsletter</span>
            <h2 className="font-fraunces text-3xl sm:text-4xl text-white font-semibold leading-tight">
              Unlock Tailored Travel Inspiration In Your Inbox
            </h2>
            <p className="font-sans text-neutral-100 text-sm leading-relaxed max-w-md mx-auto">
              Join 10,000+ travel enthusiasts. Receive quarterly guides, destination catalogs, and first access to seasonal packages.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing to our travel newsletters!");
              }}
              className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-neutral-900 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none flex-grow placeholder:text-neutral-300"
              />
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-3 px-6 text-sm rounded-xl transition-colors cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
