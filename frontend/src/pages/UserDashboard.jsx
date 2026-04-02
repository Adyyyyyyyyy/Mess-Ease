import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Mess-Ease.png";

function UserDashboard() {
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "user") {
      navigate("/");
    }
  }, []);

  const [form, setForm] = useState({
    phone: "",
    name: "",
    college: ""
  });

  const [loading, setLoading] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.phone || !form.name || !form.college) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await fetch("http://127.0.0.1:8000/register-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      window.location.href = "https://wa.me/14155238886?text=join%20angry-former";
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 overflow-hidden">

      {/* BACKGROUND BLOBS */}
      <div className="absolute top-[-100px] left-[-100px] w-72 h-72 bg-indigo-300 opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-120px] right-[-100px] w-80 h-80 bg-purple-300 opacity-20 rounded-full blur-3xl"></div>

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-4 py-4 bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50">

        <img
          src={logo}
          className="h-10 md:h-14 object-contain drop-shadow-xl animate-logoFloat"
        />

        <div className="hidden md:flex gap-8 text-gray-600 font-medium">
          <a href="#features">Features</a>
          <a href="#how">How it Works</a>
          <a href="#faq">FAQ</a>
        </div>

        <button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-indigo-900 to-indigo-500 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 transition"
        >
          Role →
        </button>
      </div>

      {/* HERO */}
      <div className="text-center py-20 px-10 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
          Walk In. <span style={{ color: "#170796" }}>Not Wait In.</span>
        </h1>

        <p className="mt-6 text-gray-600 text-lg leading-relaxed">
          Know the mess crowd and waiting time instantly, directly from WhatsApp.
        <p>No apps. No confusion. Just real-time mess insights.</p>
        </p>

        <button onClick={scrollToForm} className="mt-10 bg-gradient-to-r from-indigo-900 to-indigo-500 text-white px-8 py-3 rounded-xl shadow-lg hover:scale-105 transition">
          Let's set up your Mess-Mate!
        </button>
      </div>

      {/* FEATURES */}
      <div id="features" className="max-w-6xl mx-auto px-10 grid md:grid-cols-3 gap-8">
        {[
          ["⏱️ Smarter Timing", "Know exactly when the mess is less crowded and avoid long queues."],
          ["📡 Live Visibility", "Check real-time crowd levels and food availability instantly."],
          ["🔔 Instant Alerts", "Get notified when fresh food arrives or is about to finish."]
        ].map(([title, desc], i) => (
          <div key={i} className="rounded-2xl p-[2px] bg-gradient-to-r from-indigo-500 to-purple-500">
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl hover:scale-105 transition duration-300 h-full">
              <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
              <p className="text-gray-500 mt-3 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MESS-MATE */}
      <div className="mt-24 text-center px-4">
        <h2 className="text-4xl font-bold text-gray-900">Meet Mess-Mate 🤖</h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          Your WhatsApp assistant that gives instant mess updates — no app needed.
        </p>

        <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 max-w-lg mx-auto shadow-md text-left">
          <p className="text-sm text-gray-700">👤 You: Hi</p>
          <p className="text-sm text-gray-800 mt-2">
            🤖 Mess-Mate: Crowd is Medium | Wait: 10 mins | Fresh food 🍽️
          </p>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" className="text-center mt-24 px-6">
        <h2 className="text-3xl font-bold mb-10">Get Started in 4 Simple Steps</h2>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {["Enter your details", "Check live crowd", "Receive alerts", "Enjoy your meal"].map((step, i) => (
            <div key={i} className="rounded-xl p-[2px] bg-gradient-to-r from-indigo-500 to-purple-500">
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-2xl hover:scale-105 transition">
                <div className="text-2xl font-bold text-indigo-600 mb-2">{`0${i + 1}`}</div>
                <p className="text-gray-600">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORM */}
      <div ref={formRef} className="bg-white rounded-xl shadow p-6 mt-16 max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-center">Get Instant Mess Updates</h2>
        <div className="space-y-3">
          <input name="name" placeholder="Name" onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <select name="college" onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
            <option value="">Select College</option>
            <option value="ABC">ABC</option>
            <option value="XYZ">XYZ</option>
          </select>
          <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg">
            Continue →
          </button>
        </div>
      </div>

      {/* ✅ FAQ RESTORED */}
      <div id="faq" className="max-w-3xl mx-auto mt-20 px-4">
        <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>

        {[
          ["How does mess tracking work?", "We use real-time inputs from mess systems and users to estimate crowd levels and waiting times accurately."],
          ["How do I receive alerts?", "You’ll get instant WhatsApp alerts whenever fresh food is available or queues are low."],
          ["Is my data safe?", "Yes. Your data is securely stored and never shared with third parties."],
          ["Do I need to install anything?", "No installation needed — everything works directly through WhatsApp."],
          ["Can I use it anytime?", "Yes, you can check updates anytime during mess operational hours."]
        ].map(([q, a], i) => (
          <div key={i} className="mb-3 border rounded-lg">
            <button
              onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              className="w-full text-left p-4 font-medium flex justify-between"
            >
              {q}
              <span>{openFAQ === i ? "-" : "+"}</span>
            </button>

            {openFAQ === i && (
              <p className="px-4 pb-4 text-gray-600">{a}</p>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-24 bg-gradient-to-r from-indigo-900 to-indigo-500 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold">Mess-Ease</h3>
            <p className="text-sm mt-2 opacity-90">Walk In. Not Wait In.</p>
          </div>

          <div className="flex flex-col gap-2">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#how" className="hover:underline">How it Works</a>
            <a href="#faq" className="hover:underline">FAQ</a>
          </div>

          <div>
            <p className="text-sm opacity-90">
              Built for students to save time and eat smarter.
            </p>
          </div>
        </div>

        <div className="text-center text-sm mt-8 opacity-80">
          © {new Date().getFullYear()} Mess-Ease. All rights reserved.
        </div>
      </div>

      {/* LOGO ANIMATION */}
      <style>
        {`
          @keyframes logoFloat {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-logoFloat {
            animation: logoFloat 4s ease-in-out infinite;
          }
        `}
      </style>

    </div>
  );
}

export default UserDashboard;