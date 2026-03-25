import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import pantryImg from "../assets/pantry.jpg";
import pantryShelves from "../assets/pantry-shelves.jpg";
import pantryDoor from "../assets/pantry-door.jpg";
import pantryWide from "../assets/pantry-wide.jpg";
import pantryAngle from "../assets/pantry-angle.jpg";
import pantryFull from "../assets/pantry-full.jpg";
import pantryEntry from "../assets/pantry-entry.jpg";

const GALLERY = [
  { src: pantryImg, label: "Pantry Organization", tag: "Pantry" },
  { src: pantryShelves, label: "Shelf Detail — Baskets & Zones", tag: "Detail" },
  { src: pantryDoor, label: "Door Storage — Bags & Lunchboxes", tag: "Smart Storage" },
  { src: pantryWide, label: "Full Walk-In View", tag: "Pantry" },
  { src: pantryAngle, label: "Corner Maximized", tag: "Layout" },
  { src: pantryFull, label: "Every Shelf with Purpose", tag: "Organization" },
  { src: pantryEntry, label: "The Entryway Reveal", tag: "Pantry" },
];

const SERVICES = [
  {
    title: "Home Resets",
    desc: "A complete refresh of your living spaces — reimagined layouts, curated styling, and intentional design. We declutter, reorganize, and restyle every room so your home feels brand new without buying brand new. Perfect for move-ins, seasonal refreshes, or when you just need a fresh start.",
    icon: "⟐",
    keywords: ["Decluttering", "Space Planning", "Room Styling", "Fresh Start"],
  },
  {
    title: "Closet Transformations",
    desc: "From chaotic to composed. We design custom closet systems that actually work for your lifestyle — organized by season, color, and frequency so your mornings start calm. Includes wardrobe editing, capsule wardrobe consulting, and storage optimization.",
    icon: "◧",
    keywords: ["Wardrobe Edit", "Capsule Closet", "Color Coded", "Storage Solutions"],
  },
  {
    title: "Pantry Organization",
    desc: "Functional beauty for the heart of your kitchen. We install clear containers, woven baskets, tiered shelving, lazy susans, and label everything. Logical zones for snacks, baking, canned goods, and spices — a system you'll actually maintain.",
    icon: "⊞",
    keywords: ["Container Systems", "Labeled Zones", "Basket Styling", "Functional Design"],
  },
  {
    title: "Sustainable Styling",
    desc: "Treasure hunting at its finest. We source thrifted, vintage, and secondhand pieces that give your space character no catalog can replicate. Estate sales, flea markets, consignment — we find the gold so you don't have to.",
    icon: "◎",
    keywords: ["Thrift Sourcing", "Vintage Finds", "Eco-Friendly", "One-of-a-Kind"],
  },
];

const VALUES = [
  { label: "Good for the Environment", detail: "Less waste, more beauty" },
  { label: "Good for Your Wallet", detail: "Luxury look, thrift price" },
  { label: "Good for Your Community", detail: "Supporting small & local" },
  { label: "Good for the Globe", detail: "Sustainable by design" },
  { label: "Good for Your Home", detail: "Spaces with real soul" },
];

const TESTIMONIAL_PLACEHOLDERS = [
  {
    text: "She walked into my house and saw potential where I only saw clutter. Two days later, I cried walking into my own bedroom because it finally felt like mine.",
    author: "— Client, Home Reset",
  },
  {
    text: "RoRo found a $12 thrift store mirror that looks like it belongs in an Architectural Digest spread. She has an eye you can't teach.",
    author: "— Client, Sustainable Styling",
  },
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    // Check if already in viewport on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0, rootMargin: "200px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        minHeight: 1,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    document.documentElement.scrollTo({ top: y, behavior: "instant" });
  }
}

export default function RoRoMode() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", service: "", message: "" });
  const [formSent, setFormSent] = useState(false);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  const openLightbox = useCallback((i) => setLightbox({ open: true, index: i }), []);
  const closeLightbox = useCallback(() => setLightbox((s) => ({ ...s, open: false })), []);
  const nextPhoto = useCallback(() => setLightbox((s) => ({ open: true, index: (s.index + 1) % GALLERY.length })), []);
  const prevPhoto = useCallback(() => setLightbox((s) => ({ open: true, index: (s.index - 1 + GALLERY.length) % GALLERY.length })), []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!lightbox.open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox.open, closeLightbox, nextPhoto, prevPhoto]);

  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    const { error } = await supabase.from("messages").insert({
      name: formData.name,
      email: formData.email,
      service: formData.service,
      message: formData.message,
    });
    if (error) {
      setFormError("Something went wrong. Please try again or email us directly.");
    } else {
      setFormSent(true);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --black: #111111;
          --charcoal: #1a1a1a;
          --dark: #2a2723;
          --warm-dark: #3d3830;
          --cream: #f5f0e8;
          --warm-white: #faf8f4;
          --sand: #e8e0d4;
          --sage: #7a8c6e;
          --sage-light: #a3b396;
          --brass: #c4a265;
          --brass-light: #d4b87a;
          --terracotta: #c4735a;
          --text: #2a2723;
          --text-light: #6b6560;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html { scroll-behavior: auto; }

        body {
          font-family: var(--font-body);
          background: var(--warm-white);
          color: var(--text);
          overflow-x: hidden;
        }

        .rr-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.4s, backdrop-filter 0.4s, padding 0.3s;
        }

        .rr-nav.scrolled {
          background: rgba(250, 248, 244, 0.9);
          backdrop-filter: blur(20px);
          padding: 14px 40px;
          box-shadow: 0 1px 0 rgba(0,0,0,0.06);
        }

        .rr-logo-text {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--charcoal);
          text-transform: uppercase;
        }

        .rr-logo-text span {
          color: var(--sage);
        }

        .rr-nav-links {
          display: flex;
          gap: 36px;
          list-style: none;
        }

        .rr-nav-links a, .rr-nav-links span {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text);
          text-decoration: none;
          position: relative;
          transition: color 0.3s;
          cursor: pointer;
        }

        .rr-nav-links a::after, .rr-nav-links span::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: var(--sage);
          transition: width 0.3s;
        }

        .rr-nav-links a:hover, .rr-nav-links span:hover { color: var(--sage); }
        .rr-nav-links a:hover::after, .rr-nav-links span:hover::after { width: 100%; }

        .rr-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px;
        }

        .rr-hamburger span {
          width: 24px;
          height: 2px;
          background: var(--charcoal);
          transition: all 0.3s;
        }

        /* HERO */
        .rr-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 120px 40px 80px;
          position: relative;
          overflow: hidden;
        }

        .rr-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 50%, rgba(122,140,110,0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 30%, rgba(196,162,101,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(196,115,90,0.04) 0%, transparent 40%);
          z-index: 0;
        }

        .rr-hero-grain {
          position: absolute;
          inset: 0;
          opacity: 0.3;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          z-index: 0;
        }

        .rr-hero-content {
          position: relative;
          z-index: 1;
          max-width: 860px;
        }

        .rr-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border: 1px solid var(--sand);
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--text-light);
          margin-bottom: 40px;
        }

        .rr-hero-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--sage);
        }

        .rr-hero h1 {
          font-family: var(--font-display);
          font-size: clamp(42px, 6vw, 80px);
          font-weight: 400;
          line-height: 1.1;
          color: var(--charcoal);
          margin-bottom: 28px;
        }

        .rr-hero h1 em {
          font-style: italic;
          color: var(--sage);
        }

        .rr-hero-sub {
          font-size: 18px;
          font-weight: 300;
          line-height: 1.7;
          color: var(--text-light);
          max-width: 560px;
          margin: 0 auto 48px;
        }

        .rr-hero-ctas {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .rr-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 36px;
          background: var(--charcoal);
          color: var(--cream);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.4s;
        }

        .rr-btn-primary:hover {
          background: var(--sage);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(122,140,110,0.25);
        }

        .rr-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 36px;
          background: transparent;
          color: var(--text);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-decoration: none;
          border: 1.5px solid var(--sand);
          cursor: pointer;
          transition: all 0.3s;
        }

        .rr-btn-secondary:hover {
          border-color: var(--charcoal);
          background: var(--charcoal);
          color: var(--cream);
        }

        .rr-scroll-hint {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-light);
          opacity: 0.5;
          animation: bobDown 2s ease-in-out infinite;
        }

        @keyframes bobDown {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }

        .rr-scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, var(--text-light), transparent);
        }

        /* PHILOSOPHY STRIP */
        .rr-philosophy {
          padding: 80px 40px;
          background: var(--charcoal);
          color: var(--cream);
          overflow: hidden;
        }

        .rr-philosophy-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .rr-philosophy-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--sage-light);
          margin-bottom: 24px;
        }

        .rr-philosophy h2 {
          font-family: var(--font-display);
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 400;
          line-height: 1.25;
          margin-bottom: 24px;
        }

        .rr-philosophy h2 em {
          font-style: italic;
          color: var(--brass-light);
        }

        .rr-philosophy p {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(245,240,232,0.7);
        }

        .rr-values-stack {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .rr-value-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid rgba(245,240,232,0.1);
          transition: all 0.3s;
        }

        .rr-value-row:hover {
          padding-left: 12px;
          border-bottom-color: var(--sage);
        }

        .rr-value-label {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 400;
        }

        .rr-value-detail {
          font-size: 13px;
          color: rgba(245,240,232,0.4);
          font-weight: 300;
        }

        /* SERVICES */
        .rr-services {
          padding: 120px 40px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .rr-section-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--sage);
          margin-bottom: 20px;
        }

        .rr-section-heading {
          font-family: var(--font-display);
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 400;
          line-height: 1.2;
          color: var(--charcoal);
          margin-bottom: 60px;
          max-width: 600px;
        }

        .rr-services-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 0;
          border-top: 1px solid var(--sand);
        }

        .rr-services-tabs {
          border-right: 1px solid var(--sand);
        }

        .rr-service-tab {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 28px 24px;
          border: none;
          border-bottom: 1px solid var(--sand);
          background: transparent;
          width: 100%;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 400;
          color: var(--text-light);
          text-align: left;
          transition: all 0.3s;
        }

        .rr-service-tab:hover {
          background: rgba(122,140,110,0.04);
          color: var(--text);
        }

        .rr-service-tab.active {
          background: var(--charcoal);
          color: var(--cream);
        }

        .rr-service-tab .rr-tab-icon {
          font-size: 20px;
          width: 28px;
          text-align: center;
          opacity: 0.6;
        }

        .rr-service-tab.active .rr-tab-icon {
          opacity: 1;
          color: var(--sage-light);
        }

        .rr-service-detail {
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 280px;
        }

        .rr-service-detail h3 {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 16px;
          color: var(--charcoal);
        }

        .rr-service-detail p {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--text-light);
          max-width: 480px;
          margin-bottom: 28px;
        }

        .rr-service-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--sage);
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          font-family: var(--font-body);
          transition: gap 0.3s;
        }

        .rr-service-cta:hover { gap: 14px; }

        /* APPROACH */
        .rr-approach {
          padding: 100px 40px;
          background: var(--cream);
        }

        .rr-approach-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .rr-approach-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          margin-top: 60px;
        }

        .rr-approach-card {
          padding: 40px 32px;
          background: var(--warm-white);
          border: 1px solid var(--sand);
          transition: all 0.4s;
        }

        .rr-approach-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.06);
        }

        .rr-approach-num {
          font-family: var(--font-display);
          font-size: 48px;
          font-weight: 400;
          color: var(--sand);
          margin-bottom: 20px;
          line-height: 1;
        }

        .rr-approach-card h3 {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--charcoal);
        }

        .rr-approach-card p {
          font-size: 14px;
          font-weight: 300;
          line-height: 1.7;
          color: var(--text-light);
        }

        /* TESTIMONIALS */
        .rr-testimonials {
          padding: 100px 40px;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .rr-testimonial-card {
          padding: 48px;
          margin-top: 40px;
          background: var(--cream);
          border: 1px solid var(--sand);
          position: relative;
        }

        .rr-testimonial-card::before {
          content: '"';
          font-family: var(--font-display);
          font-size: 120px;
          color: var(--sand);
          position: absolute;
          top: -10px;
          left: 32px;
          line-height: 1;
        }

        .rr-testimonial-text {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 400;
          font-style: italic;
          line-height: 1.6;
          color: var(--charcoal);
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .rr-testimonial-author {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-light);
        }

        /* SMALL BIZ */
        .rr-smallbiz {
          padding: 80px 40px;
          background: var(--sage);
          color: var(--warm-white);
          text-align: center;
        }

        .rr-smallbiz-inner {
          max-width: 700px;
          margin: 0 auto;
        }

        .rr-smallbiz h2 {
          font-family: var(--font-display);
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 400;
          line-height: 1.3;
          margin-bottom: 16px;
        }

        .rr-smallbiz p {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.7;
          opacity: 0.85;
        }

        .rr-smallbiz-emoji {
          font-size: 32px;
          margin-bottom: 20px;
          display: block;
        }

        /* ABOUT */
        .rr-about {
          padding: 120px 40px;
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .rr-about-visual {
          aspect-ratio: 4/5;
          background: var(--sand);
          position: relative;
          overflow: hidden;
        }

        .rr-about-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .rr-about-visual-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px 28px;
          background: linear-gradient(transparent, rgba(26,26,26,0.85));
          color: var(--cream);
        }

        .rr-about-visual-overlay .rr-logo-large {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 4px;
        }

        .rr-about-visual-overlay .rr-logo-sub {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--sage-light);
          font-weight: 400;
        }

        /* PORTFOLIO GALLERY */
        .rr-portfolio {
          padding: 120px 40px;
          background: var(--charcoal);
          color: var(--cream);
          overflow: hidden;
        }

        .rr-portfolio-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .rr-portfolio .rr-section-label {
          color: var(--sage-light);
        }

        .rr-portfolio .rr-section-heading {
          color: var(--cream);
          margin-bottom: 16px;
        }

        .rr-portfolio-sub {
          font-size: 16px;
          font-weight: 300;
          color: rgba(245,240,232,0.5);
          max-width: 500px;
          line-height: 1.7;
          margin-bottom: 60px;
        }

        .rr-portfolio-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: 200px;
          gap: 12px;
        }

        .rr-portfolio-item {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          border-radius: 4px;
        }

        .rr-portfolio-item:nth-child(1) { grid-column: span 5; grid-row: span 2; }
        .rr-portfolio-item:nth-child(2) { grid-column: span 4; grid-row: span 2; }
        .rr-portfolio-item:nth-child(3) { grid-column: span 3; grid-row: span 3; }
        .rr-portfolio-item:nth-child(4) { grid-column: span 4; grid-row: span 2; }
        .rr-portfolio-item:nth-child(5) { grid-column: span 5; grid-row: span 2; }
        .rr-portfolio-item:nth-child(6) { grid-column: span 7; grid-row: span 2; }
        .rr-portfolio-item:nth-child(7) { grid-column: span 5; grid-row: span 2; }

        .rr-portfolio-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(.22,1,.36,1), filter 0.6s;
        }

        .rr-portfolio-item:hover img {
          transform: scale(1.08);
        }

        .rr-portfolio-item-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 40%, rgba(17,17,17,0.85));
          opacity: 0;
          transition: opacity 0.4s;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
        }

        .rr-portfolio-item:hover .rr-portfolio-item-overlay {
          opacity: 1;
        }

        .rr-portfolio-item-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--sage-light);
          margin-bottom: 6px;
        }

        .rr-portfolio-item-label {
          font-family: var(--font-display);
          font-size: 18px;
          color: var(--cream);
          font-weight: 400;
        }

        /* LIGHTBOX */
        .rr-lightbox {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(17,17,17,0.95);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s;
        }

        .rr-lightbox.open {
          opacity: 1;
          pointer-events: auto;
        }

        .rr-lightbox-img {
          max-width: 85vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          transform: scale(0.9);
          transition: transform 0.5s cubic-bezier(.22,1,.36,1);
        }

        .rr-lightbox.open .rr-lightbox-img {
          transform: scale(1);
        }

        .rr-lightbox-close {
          position: absolute;
          top: 32px;
          right: 32px;
          background: none;
          border: none;
          color: var(--cream);
          font-size: 32px;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.3s;
          font-family: var(--font-body);
        }

        .rr-lightbox-close:hover { opacity: 1; }

        .rr-lightbox-caption {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
        }

        .rr-lightbox-caption-tag {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--sage-light);
          margin-bottom: 6px;
        }

        .rr-lightbox-caption-label {
          font-family: var(--font-display);
          font-size: 22px;
          color: var(--cream);
        }

        .rr-lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(245,240,232,0.1);
          border: 1px solid rgba(245,240,232,0.15);
          color: var(--cream);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 50%;
          font-size: 20px;
          transition: background 0.3s;
          font-family: var(--font-body);
        }

        .rr-lightbox-nav:hover {
          background: rgba(245,240,232,0.2);
        }

        .rr-lightbox-prev { left: 32px; }
        .rr-lightbox-next { right: 32px; }

        .rr-lightbox-counter {
          position: absolute;
          top: 40px;
          left: 40px;
          font-size: 13px;
          letter-spacing: 1px;
          color: rgba(245,240,232,0.4);
        }

        /* HERO IMAGE STRIP */
        .rr-hero-strip {
          height: 60vh;
          min-height: 400px;
          position: relative;
          overflow: hidden;
        }

        .rr-hero-strip img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .rr-hero-strip-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent 30%, rgba(17,17,17,0.6));
          display: flex;
          align-items: flex-end;
          padding: 60px;
        }

        .rr-hero-strip-text {
          max-width: 600px;
        }

        .rr-hero-strip-text h2 {
          font-family: var(--font-display);
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 400;
          color: var(--cream);
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .rr-hero-strip-text h2 em {
          font-style: italic;
          color: var(--sage-light);
        }

        .rr-hero-strip-text p {
          font-size: 16px;
          font-weight: 300;
          color: rgba(245,240,232,0.7);
          line-height: 1.7;
        }

        /* BADGES SECTION */
        .rr-badges {
          padding: 60px 40px;
          background: var(--warm-white);
          border-bottom: 1px solid var(--sand);
        }

        .rr-badges-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 24px;
        }

        .rr-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border: 1px solid var(--sand);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-light);
          transition: all 0.3s;
        }

        .rr-badge-pill:hover {
          border-color: var(--sage);
          color: var(--sage);
          transform: translateY(-2px);
        }

        .rr-badge-pill::before {
          content: '';
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--sage);
        }

        /* INSTAGRAM CTA */
        .rr-instagram {
          padding: 80px 40px;
          text-align: center;
          background: var(--warm-white);
        }

        .rr-instagram-inner {
          max-width: 600px;
          margin: 0 auto;
        }

        .rr-instagram h2 {
          font-family: var(--font-display);
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 400;
          color: var(--charcoal);
          margin-bottom: 12px;
        }

        .rr-instagram h2 em {
          font-style: italic;
          color: var(--sage);
        }

        .rr-instagram p {
          font-size: 16px;
          font-weight: 300;
          color: var(--text-light);
          line-height: 1.7;
          margin-bottom: 28px;
        }

        .rr-instagram-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
          color: white;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .rr-instagram-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(131,58,180,0.3);
        }

        .rr-about-content .rr-about-name {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--brass);
          margin-bottom: 16px;
        }

        .rr-about-content h2 {
          font-family: var(--font-display);
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 400;
          line-height: 1.25;
          color: var(--charcoal);
          margin-bottom: 24px;
        }

        .rr-about-content h2 em {
          font-style: italic;
          color: var(--sage);
        }

        .rr-about-content p {
          font-size: 16px;
          font-weight: 300;
          line-height: 1.8;
          color: var(--text-light);
          margin-bottom: 16px;
        }

        .rr-about-sig {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 20px;
          color: var(--charcoal);
          margin-top: 24px;
        }

        /* CONTACT */
        .rr-contact {
          padding: 120px 40px;
          background: var(--charcoal);
          color: var(--cream);
        }

        .rr-contact-inner {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .rr-contact h2 {
          font-family: var(--font-display);
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 400;
          margin-bottom: 16px;
        }

        .rr-contact h2 em {
          font-style: italic;
          color: var(--sage-light);
        }

        .rr-contact-sub {
          font-size: 16px;
          font-weight: 300;
          color: rgba(245,240,232,0.6);
          margin-bottom: 48px;
        }

        .rr-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          text-align: left;
        }

        .rr-form-full {
          grid-column: 1 / -1;
        }

        .rr-form label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(245,240,232,0.5);
          margin-bottom: 8px;
        }

        .rr-form input,
        .rr-form textarea,
        .rr-form select {
          width: 100%;
          padding: 16px 20px;
          background: rgba(245,240,232,0.06);
          border: 1px solid rgba(245,240,232,0.12);
          color: var(--cream);
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.3s;
        }

        .rr-form input::placeholder,
        .rr-form textarea::placeholder {
          color: rgba(245,240,232,0.25);
        }

        .rr-form input:focus,
        .rr-form textarea:focus,
        .rr-form select:focus {
          border-color: var(--sage);
        }

        .rr-form select option {
          background: var(--charcoal);
          color: var(--cream);
        }

        .rr-form textarea {
          resize: vertical;
          min-height: 120px;
        }

        .rr-form-submit {
          grid-column: 1 / -1;
          margin-top: 12px;
        }

        .rr-form-submit .rr-btn-primary {
          width: 100%;
          justify-content: center;
          padding: 18px;
          background: var(--sage);
          font-size: 14px;
        }

        .rr-form-submit .rr-btn-primary:hover {
          background: var(--sage-light);
        }

        .rr-form-success {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
        }

        .rr-form-success h3 {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 12px;
        }

        .rr-form-success p {
          font-size: 15px;
          font-weight: 300;
          color: rgba(245,240,232,0.6);
        }

        /* FOOTER */
        .rr-footer {
          padding: 60px 40px 40px;
          background: var(--black);
          color: rgba(245,240,232,0.4);
        }

        .rr-footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .rr-footer-brand {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 2px;
          color: rgba(245,240,232,0.6);
          text-transform: uppercase;
        }

        .rr-footer-links {
          display: flex;
          gap: 24px;
          list-style: none;
        }

        .rr-footer-links a {
          font-size: 13px;
          color: rgba(245,240,232,0.4);
          text-decoration: none;
          transition: color 0.3s;
        }

        .rr-footer-links a:hover {
          color: var(--sage-light);
        }

        .rr-footer-copy {
          width: 100%;
          text-align: center;
          font-size: 12px;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid rgba(245,240,232,0.06);
        }

        /* MOBILE */
        .rr-mobile-menu {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 320px;
          background: var(--charcoal);
          z-index: 200;
          padding: 80px 40px;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(.22,1,.36,1);
        }

        .rr-mobile-menu.open { transform: translateX(0); }

        .rr-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 199;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }

        .rr-mobile-overlay.open { opacity: 1; pointer-events: auto; }

        .rr-mobile-menu a, .rr-mobile-menu span {
          display: block;
          font-family: var(--font-display);
          font-size: 24px;
          color: var(--cream);
          text-decoration: none;
          padding: 16px 0;
          border-bottom: 1px solid rgba(245,240,232,0.08);
          cursor: pointer;
        }

        .rr-mobile-close {
          position: absolute;
          top: 24px;
          right: 24px;
          background: none;
          border: none;
          color: var(--cream);
          font-size: 28px;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .rr-nav-links { display: none; }
          .rr-hamburger { display: flex; }
          .rr-philosophy-inner { grid-template-columns: 1fr; gap: 40px; }
          .rr-services-grid { grid-template-columns: 1fr; }
          .rr-services-tabs {
            border-right: none;
            display: flex;
            overflow-x: auto;
            border-bottom: 1px solid var(--sand);
          }
          .rr-service-tab {
            white-space: nowrap;
            border-bottom: none;
            border-right: 1px solid var(--sand);
            padding: 16px 20px;
            font-size: 13px;
          }
          .rr-approach-grid { grid-template-columns: 1fr; }
          .rr-about { grid-template-columns: 1fr; gap: 40px; }
          .rr-about-visual { max-height: 300px; aspect-ratio: auto; }
          .rr-portfolio-grid {
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: 180px;
          }
          .rr-portfolio-item:nth-child(1) { grid-column: span 2; grid-row: span 2; }
          .rr-portfolio-item:nth-child(2) { grid-column: span 1; grid-row: span 2; }
          .rr-portfolio-item:nth-child(3) { grid-column: span 1; grid-row: span 2; }
          .rr-portfolio-item:nth-child(4) { grid-column: span 1; grid-row: span 1; }
          .rr-portfolio-item:nth-child(5) { grid-column: span 1; grid-row: span 1; }
          .rr-portfolio-item:nth-child(6) { grid-column: span 2; grid-row: span 2; }
          .rr-portfolio-item:nth-child(7) { grid-column: span 2; grid-row: span 1; }
          .rr-hero-strip { height: 40vh; min-height: 280px; }
          .rr-hero-strip-overlay { padding: 24px; }
          .rr-form { grid-template-columns: 1fr; }
          .rr-hero { padding: 100px 24px 60px; }
          .rr-nav { padding: 16px 24px; }
          .rr-nav.scrolled { padding: 12px 24px; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`rr-nav ${scrollY > 60 ? "scrolled" : ""}`}>
        <div className="rr-logo-text">
          Ro<span>Ro</span> Mode
        </div>
        <ul className="rr-nav-links">
          <li><span role="button" tabIndex={0} onClick={() => scrollTo("services")}>Services</span></li>
          <li><span role="button" tabIndex={0} onClick={() => scrollTo("portfolio")}>Portfolio</span></li>
          <li><span role="button" tabIndex={0} onClick={() => scrollTo("about")}>About</span></li>
          <li><span role="button" tabIndex={0} onClick={() => scrollTo("contact")}>Book a Reset</span></li>
        </ul>
        <button className="rr-hamburger" onClick={() => setMenuOpen(true)}>
          <span /><span /><span />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`rr-mobile-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
      <div className={`rr-mobile-menu ${menuOpen ? "open" : ""}`}>
        <button className="rr-mobile-close" onClick={() => setMenuOpen(false)}>×</button>
        <span role="button" tabIndex={0} onClick={() => { setMenuOpen(false); scrollTo("services"); }}>Services</span>
        <span role="button" tabIndex={0} onClick={() => { setMenuOpen(false); scrollTo("portfolio"); }}>Portfolio</span>
        <span role="button" tabIndex={0} onClick={() => { setMenuOpen(false); scrollTo("about"); }}>About</span>
        <span role="button" tabIndex={0} onClick={() => { setMenuOpen(false); scrollTo("contact"); }}>Book a Reset</span>
      </div>

      {/* HERO */}
      <section className="rr-hero">
        <div className="rr-hero-bg" />
        <div className="rr-hero-grain" />
        <div className="rr-hero-content">
          <FadeIn>
            <div className="rr-hero-badge">Home Styling & Professional Organizing</div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h1>
              Sustainable spaces<br />
              with <em>real soul</em>
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="rr-hero-sub">
              Professional home organizing, closet transformations, and pantry design.
              Turning thrifted treasures into curated, cozy spaces — beautifully and sustainably.
            </p>
          </FadeIn>
          <FadeIn delay={0.45}>
            <div className="rr-hero-ctas">
              <span role="button" tabIndex={0} className="rr-btn-primary" onClick={() => scrollTo("contact")}>
                Book a Consultation →
              </span>
              <span role="button" tabIndex={0} className="rr-btn-secondary" onClick={() => scrollTo("services")}>
                See Services
              </span>
            </div>
          </FadeIn>
        </div>
        <div className="rr-scroll-hint">
          <span>Scroll</span>
          <div className="rr-scroll-line" />
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="rr-philosophy">
        <div className="rr-philosophy-inner">
          <FadeIn>
            <div>
              <div className="rr-philosophy-label">Philosophy</div>
              <h2>
                One woman's thrift find is another room's <em>centerpiece</em>
              </h2>
              <p>
                Every piece in your home tells a story. We believe the best stories
                come from secondhand treasures — items with history, character, and a
                price tag that doesn't make you flinch. Sustainable design isn't a
                compromise. It's how the most interesting spaces are made.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="rr-values-stack">
              {VALUES.map((v, i) => (
                <div className="rr-value-row" key={i}>
                  <span className="rr-value-label">{v.label}</span>
                  <span className="rr-value-detail">{v.detail}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SERVICES */}
      <section className="rr-services" id="services">
        <FadeIn>
          <div className="rr-section-label">Services</div>
          <h2 className="rr-section-heading">
            What we transform
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="rr-services-grid">
            <div className="rr-services-tabs">
              {SERVICES.map((s, i) => (
                <button
                  key={i}
                  className={`rr-service-tab ${activeService === i ? "active" : ""}`}
                  onClick={() => setActiveService(i)}
                >
                  <span className="rr-tab-icon">{s.icon}</span>
                  {s.title}
                </button>
              ))}
            </div>
            <div className="rr-service-detail">
              <h3>{SERVICES[activeService].title}</h3>
              <p>{SERVICES[activeService].desc}</p>
              {SERVICES[activeService].keywords && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                  {SERVICES[activeService].keywords.map((kw, i) => (
                    <span key={i} style={{
                      fontSize: "10px", fontWeight: 500, letterSpacing: "1.5px",
                      textTransform: "uppercase", padding: "6px 14px",
                      border: "1px solid var(--sand)", borderRadius: "100px",
                      color: "var(--text-light)",
                    }}>{kw}</span>
                  ))}
                </div>
              )}
              <span role="button" tabIndex={0} className="rr-service-cta" onClick={() => scrollTo("contact")}>
                Book this service →
              </span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* APPROACH */}
      <section className="rr-approach" id="approach">
        <div className="rr-approach-inner">
          <FadeIn>
            <div className="rr-section-label">How It Works</div>
            <h2 className="rr-section-heading">
              From overwhelmed to "I can't believe this is my house"
            </h2>
          </FadeIn>
          <div className="rr-approach-grid">
            {[
              {
                num: "01",
                title: "Walkthrough & Vision",
                desc: "We tour your space, understand how you live, and identify what's working and what isn't. No judgment — just honest eyes and a plan."
              },
              {
                num: "02",
                title: "Source & Style",
                desc: "We treasure-hunt for the perfect pieces — thrift stores, estate sales, vintage shops. Every item is chosen with intention and your space in mind."
              },
              {
                num: "03",
                title: "The Reset",
                desc: "We transform the space. New layouts, curated styling, organized systems. You walk back in and it finally feels like home."
              }
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="rr-approach-card">
                  <div className="rr-approach-num">{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="rr-testimonials">
        <FadeIn>
          <div className="rr-section-label">Kind Words</div>
          <h2 className="rr-section-heading">
            What happens when your space finally works
          </h2>
          <div className="rr-testimonial-card">
            <p className="rr-testimonial-text">
              {TESTIMONIAL_PLACEHOLDERS[0].text}
            </p>
            <span className="rr-testimonial-author">
              {TESTIMONIAL_PLACEHOLDERS[0].author}
            </span>
          </div>
        </FadeIn>
      </section>

      {/* SMALL BIZ */}
      <section className="rr-smallbiz">
        <FadeIn>
          <div className="rr-smallbiz-inner">
            <span className="rr-smallbiz-emoji">🛍</span>
            <h2>When you buy from a small business, a real person does a little happy dance</h2>
            <p>
              RoRo MODE is proudly small, proudly local, and proudly woman-owned.
              We believe in lifting up the community we serve — one thrifted find,
              one styled room, one happy client at a time.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* HERO IMAGE STRIP */}
      <section className="rr-hero-strip">
        <img src={pantryEntry} alt="RoRo Mode pantry transformation" style={{ objectPosition: "center 30%" }} />
        <div className="rr-hero-strip-overlay">
          <div className="rr-hero-strip-text">
            <h2>Real spaces, <em>real transformations</em></h2>
            <p>Every project starts with a vision and ends with a space that makes you exhale.</p>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="rr-badges">
        <div className="rr-badges-inner">
          {["Woman-Owned", "Eco-Friendly", "Budget-Conscious", "Locally Sourced", "Custom Solutions", "Same-Week Booking"].map((b, i) => (
            <span className="rr-badge-pill" key={i}>{b}</span>
          ))}
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="rr-portfolio" id="portfolio">
        <div className="rr-portfolio-inner">
          <FadeIn>
            <div className="rr-section-label">Portfolio</div>
            <h2 className="rr-section-heading">Spaces we've transformed</h2>
            <p className="rr-portfolio-sub">
              Click any image to see the full transformation up close. Every basket placed, every label printed, every shelf maximized.
            </p>
          </FadeIn>
          <div className="rr-portfolio-grid">
            {GALLERY.map((item, i) => (
              <div className="rr-portfolio-item" key={i} onClick={() => openLightbox(i)}>
                <img src={item.src} alt={item.label} loading="lazy" />
                <div className="rr-portfolio-item-overlay">
                  <span className="rr-portfolio-item-tag">{item.tag}</span>
                  <span className="rr-portfolio-item-label">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      <div className={`rr-lightbox ${lightbox.open ? "open" : ""}`} onClick={closeLightbox}>
        <button className="rr-lightbox-close" onClick={closeLightbox}>&times;</button>
        <span className="rr-lightbox-counter">{lightbox.index + 1} / {GALLERY.length}</span>
        <button className="rr-lightbox-nav rr-lightbox-prev" onClick={(e) => { e.stopPropagation(); prevPhoto(); }}>&larr;</button>
        <img
          className="rr-lightbox-img"
          src={GALLERY[lightbox.index].src}
          alt={GALLERY[lightbox.index].label}
          onClick={(e) => e.stopPropagation()}
        />
        <button className="rr-lightbox-nav rr-lightbox-next" onClick={(e) => { e.stopPropagation(); nextPhoto(); }}>&rarr;</button>
        <div className="rr-lightbox-caption">
          <div className="rr-lightbox-caption-tag">{GALLERY[lightbox.index].tag}</div>
          <div className="rr-lightbox-caption-label">{GALLERY[lightbox.index].label}</div>
        </div>
      </div>

      {/* ABOUT */}
      <section className="rr-about" id="about">
        <FadeIn>
          <div className="rr-about-visual">
            <img src={pantryWide} alt="Work by Aurora Leonard - RoRo Mode" />
            <div className="rr-about-visual-overlay">
              <div className="rr-logo-large">RoRo</div>
              <div className="rr-logo-sub">Mode — Est. by Aurora Leonard</div>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="rr-about-content">
            <div className="rr-about-name">Meet Aurora</div>
            <h2>
              Five foot zero,<br />
              <em>full of faith</em>
            </h2>
            <p>
              I'm Aurora — but everyone calls me RoRo. I'm a home stylist,
              professional organizer, and self-proclaimed serial treasure hunter.
              I believe your home should feel like a deep exhale at the end of every day.
            </p>
            <p>
              I don't do cookie-cutter. I don't do "just buy everything new."
              I dig through thrift stores, estate sales, and vintage shops to find
              pieces with real character — then I weave them into spaces that feel
              like they've always been yours.
            </p>
            <p>
              Sustainable. Functional. Beautiful. That's the mode.
            </p>
            <div className="rr-about-sig">— RoRo ✝</div>
          </div>
        </FadeIn>
      </section>

      {/* CONTACT */}
      <section className="rr-contact" id="contact">
        <div className="rr-contact-inner">
          <FadeIn>
            <div className="rr-section-label" style={{ color: "var(--sage-light)" }}>Let's Work Together</div>
            <h2>Ready for your <em>reset</em>?</h2>
            <p className="rr-contact-sub">
              Tell us about your space and we'll get back to you within 48 hours.
            </p>
          </FadeIn>
          <div className="rr-form">
            {formSent ? (
              <div className="rr-form-success">
                <FadeIn>
                  <h3>Message sent ✓</h3>
                  <p>Aurora will be in touch within 48 hours. Your space is about to change.</p>
                </FadeIn>
              </div>
            ) : (
              <>
                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="rr-form-full">
                  <label>Service</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  >
                    <option value="">Select a service...</option>
                    <option>Home Reset — Full Room Refresh</option>
                    <option>Closet Transformation — Wardrobe Edit & Organization</option>
                    <option>Pantry Organization — Containers, Labels & Zones</option>
                    <option>Sustainable Styling — Thrifted & Vintage Sourcing</option>
                    <option>Garage / Storage Organization</option>
                    <option>Move-In / Move-Out Setup</option>
                    <option>Holiday / Seasonal Refresh</option>
                    <option>Not sure yet — help me decide</option>
                  </select>
                </div>
                <div className="rr-form-full">
                  <label>Tell us about your space</label>
                  <textarea
                    placeholder="What's the biggest challenge with your space right now?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <div className="rr-form-submit">
                  <button className="rr-btn-primary" onClick={handleSubmit}>
                    Send Message →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="rr-instagram">
        <FadeIn>
          <div className="rr-instagram-inner">
            <div className="rr-section-label">Follow Along</div>
            <h2>See the magic <em>in action</em></h2>
            <p>
              Before & afters, thrift hauls, styling tips, and behind-the-scenes
              of every reset. Join the RoRo MODE community on Instagram.
            </p>
            <a
              href="https://www.instagram.com/_roro_mode_"
              target="_blank"
              rel="noopener"
              className="rr-instagram-btn"
            >
              Follow @_roro_mode_ →
            </a>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer className="rr-footer">
        <div className="rr-footer-inner">
          <div className="rr-footer-brand">RoRo Mode</div>
          <ul className="rr-footer-links">
            <li><a href="https://www.instagram.com/_roro_mode_" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="https://www.instagram.com/itsauroraleonard/" target="_blank" rel="noopener">Personal</a></li>
            <li><span role="button" tabIndex={0} onClick={() => scrollTo("contact")}>Contact</span></li>
          </ul>
          <div className="rr-footer-copy">
            © 2026 RoRo MODE — Aurora Leonard. All rights reserved. Built with intention.
          </div>
        </div>
      </footer>
    </>
  );
}
