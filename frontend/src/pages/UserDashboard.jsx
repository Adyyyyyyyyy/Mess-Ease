import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Radio, Bell, ChefHat, CheckCircle, MessageCircle, ArrowRight, Menu, X } from "lucide-react";
import logo from "../assets/Mess-Ease.png";
import { useSmoothScroll } from "../ScrollComponent";
import API from "../api/api";

// ─── Static data ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Clock, title: "Smarter Timing",    desc: "Know exactly when the mess is less crowded and plan your visit at the right time." },
  { icon: Radio, title: "Live Crowd Check",  desc: "Get real-time crowd levels and food availability before you even leave your room." },
  { icon: Bell,  title: "Fresh Food Alerts", desc: "Get notified on WhatsApp the moment fresh food is ready or queues clear up." },
];

const STEPS = [
  { num: "01", label: "Register once",     sub: "Fill in your name, phone & college" },
  { num: "02", label: "Open WhatsApp",     sub: "No app install, no sign-in needed" },
  { num: "03", label: "Ask your question", sub: '"kitni line hai" or "how busy is mess"' },
  { num: "04", label: "Walk in smart",     sub: "Crowd count, wait time instantly" },
];

const STATS = [
  { value: "0 apps",    label: "to install" },
  { value: "Real-time", label: "crowd data" },
  { value: "Hinglish",  label: "supported" },
  { value: "24/7",      label: "available" },
];

const CHAT = [
  { from: "user", text: "kitni line hai abhi?" },
  { from: "bot",  text: "🟡 Medium crowd right now\n⏱ Wait time: ~10 mins\n🍽 Fresh food just arrived!" },
  { from: "user", text: "best time aane ka?" },
  { from: "bot",  text: "✅ Come between 1:30–2:00 PM\nHistorically quieter on Fridays." },
];

const FAQS = [
  ["How does crowd tracking work?",    "Your mess uses a camera system that counts people in real time. The count updates every few minutes so you always see the latest situation."],
  ["How do I get alerts on WhatsApp?", "Once you register, you'll be connected to Mess-Mate on WhatsApp. It sends you a message whenever fresh food is ready or the crowd clears."],
  ["Is my data safe?",                 "Yes. Only your name, phone number and college are stored, nothing else. Your data is never shared with anyone outside your mess."],
  ["Do I need to install any app?",    "No. Everything runs through WhatsApp, which you already have. Zero installs, zero logins."],
  ["What languages can I use?",        "English, Hindi, or Hinglish — whatever feels natural. Mess-Mate understands all three."],
];

const NAV_LINKS = [["features", "Features"], ["how", "How it Works"], ["bot", "Mess-Mate"], ["faq", "FAQ"]];

// ─── Global styles ────────────────────────────────────────────────────────────

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  /* Desktop: show nav links + Switch Role, hide hamburger */
  .hide-mobile  { display: flex !important; }
  .hide-desktop { display: none !important; }

  @media (max-width: 768px) {
    .hide-mobile  { display: none !important; }
    .hide-desktop { display: flex !important; }
    .hero-title, .section-title { font-size: 28px !important; }
    .grid-3, .grid-4            { grid-template-columns: 1fr !important; }
    .grid-stats                 { grid-template-columns: 1fr 1fr !important; }
    .cta-inner                  { flex-direction: column !important; gap: 20px !important; }
  }
`;

// ─── Small reusable components ────────────────────────────────────────────────

const SectionHeader = ({ tag, title }) => (
  <div style={{ textAlign: "center", marginBottom: 56 }}>
    <p style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>{tag}</p>
    <h2 className="section-title" style={{ fontSize: 36, fontWeight: 700, color: "#0f0a2e" }}>{title}</h2>
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function UserDashboard() {
  const navigate = useNavigate();
  const { scrollTo } = useSmoothScroll();

  const [menuOpen, setMenuOpen] = useState(false);
  const [form,     setForm]     = useState({ name: "", phone: "", college: "" });
  const [loading,  setLoading]  = useState(false);
  const [openFAQ,  setOpenFAQ]  = useState(null);


  useEffect(() => {
    if (localStorage.getItem("role") !== "user") navigate("/");
  }, []);


  const handleChange  = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleNavClick = (id) => { setMenuOpen(false); scrollTo(id); };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.college) return alert("Please fill all fields");
    try {
      setLoading(true);
      await fetch("http://127.0.0.1:8000/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      window.location.href = "https://wa.me/14155238886?text=join%20angry-former";
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#fff", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f3f4f6", padding: "0 5%" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 72 }}>

          {/* Logo — always visible */}
          <img
            src={logo}
            onClick={() => scrollTo("hero")}
            className="float-logo"
            style={{ height: 58, objectFit: "contain", cursor: "pointer", flexShrink: 0 }}
            alt="Mess-Ease"
          />

          {/* Desktop: nav links (centred) + Switch Role pinned to right */}
          <div className="hide-mobile" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
            {NAV_LINKS.map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} className="nav-link"
                style={{ background: "none", border: "none", cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => navigate("/")} className="hide-mobile btn-primary"
            style={{ padding: "9px 22px", fontSize: 14, flexShrink: 0 }}>
            Switch Role
          </button>

          {/* Mobile: hamburger pinned to right */}
          <button className="hide-desktop" onClick={() => setMenuOpen(!menuOpen)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", alignItems: "center", justifyContent: "center" }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{ padding: "16px 5% 20px", display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid #f3f4f6" }}>
            {NAV_LINKS.map(([id, label]) => (
              <button key={id} onClick={() => handleNavClick(id)} className="nav-link"
                style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                {label}
              </button>
            ))}
            <button onClick={() => navigate("/")} className="btn-primary" style={{ padding: "9px 22px", fontSize: 14 }}>
              Switch Role
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div id="hero" style={{ background: "linear-gradient(135deg,#eef2ff 0%,#f5f3ff 40%,#ede9fe 70%,#ddd6fe 100%)", padding: "88px 5% 96px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #c7d2fe", borderRadius: 100, padding: "6px 16px", marginBottom: 28, fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulseDot 2s infinite", display: "inline-block" }} />
            Live mess data - no app needed
          </div>

          <h1 className="fade-up-1 hero-title" style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15, color: "#0f0a2e", fontFamily: "'Playfair Display',serif" }}>
            Walk In.<br /><span style={{ color: "#170796" }}>Not Wait In.</span>
          </h1>

          <p className="fade-up-2" style={{ marginTop: 24, fontSize: 18, color: "#4b5563", lineHeight: 1.7, maxWidth: 560, margin: "24px auto 0" }}>
            Check mess crowd levels and wait times in real time straight from WhatsApp. No downloads, no logins, no hassle.
            Register once and never stand in a surprise queue again.
          </p>

          <div className="fade-up-3" style={{ marginTop: 40, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("register")} className="btn-primary" style={{ padding: "14px 32px", fontSize: 16 }}>
              Get Started Free
            </button>
            <button onClick={() => scrollTo("bot")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", border: "1.5px solid #c7d2fe", borderRadius: 10, color: "#4338ca", fontWeight: 600, fontSize: 16, background: "#fff", cursor: "pointer", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
              See how it works <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <div style={{ background: "#170796", padding: "0 5%" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="grid-stats">
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: "28px 20px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,.15)" : "none" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Off-white body ─────────────────────────────────────────────────── */}
      <div style={{ background: "#fafaf9" }}>

        {/* Features */}
        <div id="features" style={{ padding: "88px 5%" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <SectionHeader tag="Why Mess-Ease" title="Everything you need, right on WhatsApp" />
            <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <div key={i} className="rounded-2xl p-[2px] bg-gradient-to-r from-indigo-500 to-purple-500">
                  <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl hover:scale-105 transition duration-300 h-full">
                    <Icon className="w-8 h-8 text-indigo-600 mb-4" />
                    <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
                    <p className="text-gray-500 mt-3 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mess-Mate highlight */}
        <div id="bot" style={{ padding: "0 5% 88px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg,#170796,#312e81,#1e1b4b)", borderRadius: 24, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 480 }} className="grid-3">

              {/* Left — copy */}
              <div style={{ padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.1)", borderRadius: 100, padding: "6px 14px", marginBottom: 24, width: "fit-content" }}>
                  <MessageCircle size={14} style={{ color: "#a5b4fc" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#a5b4fc" }}>Your WhatsApp companion</span>
                </div>

                <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 20, fontFamily: "'Playfair Display',serif" }}>Meet Mess-Mate</h2>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,.75)", lineHeight: 1.7, marginBottom: 32 }}>
                  Mess-Mate is your personal mess assistant built right into WhatsApp. Ask it anything in English or Hinglish and get an instant answer about crowd levels, wait times, and food availability.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {["No app to download", "Works in English & Hinglish", "Instant crowd updates", "Fresh food notifications"].map((pt, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CheckCircle size={17} style={{ color: "#6ee7b7", flexShrink: 0 }} />
                      <span style={{ fontSize: 15, color: "rgba(255,255,255,.85)", fontWeight: 500 }}>{pt}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => scrollTo("register")} className="btn-primary"
                  style={{ marginTop: 40, background: "#fff", color: "#170796", width: "fit-content", boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
                  Connect to Mess-Mate →
                </button>
              </div>

              {/* Right — WhatsApp chat mockup */}
              <div style={{ padding: "40px 40px 40px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 340, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.3)" }}>
                  <div style={{ background: "#075e54", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#128c7e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ChefHat size={18} style={{ color: "#fff" }} />
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Mess-Mate</div>
                      <div style={{ color: "rgba(255,255,255,.7)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366", display: "inline-block" }} /> online
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "#e5ddd5", padding: 16, display: "flex", flexDirection: "column", gap: 10, minHeight: 280 }}>
                    {CHAT.map((msg, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
                        <div className={msg.from === "user" ? "chat-user" : "chat-bot"}>{msg.text}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: "10px 14px", background: "#f0f0f0" }}>
                    <div style={{ background: "#fff", borderRadius: 20, padding: "8px 14px", fontSize: 13, color: "#9ca3af" }}>Type a message...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div id="how" style={{ padding: "0 5% 88px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <SectionHeader tag="Simple Setup" title="Ready in 4 steps" />
            <div className="grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
              {STEPS.map((s, i) => (
                <div key={i} className="step-card">
                  <div style={{ fontSize: 40, fontWeight: 800, color: "#e0e7ff", fontFamily: "'Playfair Display',serif", marginBottom: 16 }}>{s.num}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f0a2e", marginBottom: 8 }}>{s.label}</h3>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration form */}
        <div id="register" style={{ padding: "0 5% 88px" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>Get Started</p>
              <h2 style={{ fontSize: 30, fontWeight: 700, color: "#0f0a2e" }}>Connect to Mess-Mate</h2>
              <p style={{ fontSize: 15, color: "#6b7280", marginTop: 10 }}>Fill in your details once — we'll link you to the WhatsApp bot instantly.</p>
            </div>

            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb", padding: "40px 36px", boxShadow: "0 4px 32px rgba(23,7,150,.07)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FormField label="Full Name">
                  <input name="name" placeholder="Your name" onChange={handleChange} className="form-input" />
                </FormField>
                <FormField label="WhatsApp Number">
                  <input name="phone" placeholder="+91 98765 43210" onChange={handleChange} className="form-input" />
                </FormField>
                <FormField label="Your College">
                  <select name="college" onChange={handleChange} className="form-input" style={{ background: "#fff" }}>
                    <option value="">Select your college</option>
                    <option value="ABC">SRM</option>
                    <option value="XYZ">KIET</option>
                  </select>
                </FormField>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ padding: 14, fontSize: 16, marginTop: 8, width: "100%" }}>
                  {loading ? "Connecting..." : "Connect to WhatsApp →"}
                </button>
                <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center" }}>You'll be redirected to WhatsApp to complete setup</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" style={{ padding: "0 5% 88px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <SectionHeader tag="FAQ" title="Questions? We've got answers." />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FAQS.map(([q, a], i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid ${openFAQ === i ? "#c7d2fe" : "#e5e7eb"}`, borderRadius: 14, overflow: "hidden", transition: "border-color .2s" }}>
                  <button className="faq-btn" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                    <span>{q}</span>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: openFAQ === i ? "#eef2ff" : "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: openFAQ === i ? "#4f46e5" : "#6b7280", fontSize: 16, fontWeight: 700 }}>
                      {openFAQ === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFAQ === i && <div style={{ padding: "0 24px 20px", fontSize: 15, color: "#4b5563", lineHeight: 1.7 }}>{a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: "#0f0a2e", color: "#fff", padding: "56px 5% 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 48 }} className="grid-3">

            <div>
              <img src={logo} onClick={() => scrollTo("hero")} style={{ height: 84, objectFit: "contain", filter: "brightness(0) invert(1)", marginBottom: 16, cursor: "pointer" }} alt="Mess-Ease" />
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.6)", lineHeight: 1.7, maxWidth: 300 }}>
                A crowd management system for college mess halls — powered by WhatsApp and real-time data, built to save student time.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 20 }}>Navigation</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {NAV_LINKS.map(([id, label]) => (
                  <button key={id} onClick={() => scrollTo(id)}
                    style={{ color: "rgba(255,255,255,.65)", fontSize: 15, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans','Segoe UI',sans-serif", transition: "color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.65)"}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 20 }}>Contact</h4>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.65)", lineHeight: 1.7 }}>
                Built for students.<br />Connect with us on WhatsApp to try Mess-Mate at your campus.
              </p>
              <button onClick={() => scrollTo("register")}
                style={{ marginTop: 20, background: "#fff", color: "#0f0a2e", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Get Access
              </button>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.1)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>© {new Date().getFullYear()} Mess-Ease. All rights reserved.</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)" }}>Walk In. Not Wait In.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}