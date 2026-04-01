import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();
  useEffect(() => {
  const role = localStorage.getItem("role");

  if (role !== "user") {
    navigate("/");
  }
}, []);
  const [data, setData] = useState({
    people: 0,
    estimated_wait: "0 minutes",
    crowd_level: "Low",
    alerts: {}
  });

  // ✅ Alerts state
  const [alerts, setAlerts] = useState({
    fresh: false,
    ending: false
  });

  const [form, setForm] = useState({
    phone: "",
    name: "",
    college: "",
    mess: ""
  });

  const [loading, setLoading] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);

  // 🔥 LIVE DATA FETCH
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    fetch("http://127.0.0.1:8000/mess-status")
      .then(res => res.json())
      .then(res => {
        setData({
          people: res.people,
          estimated_wait: res.wait,
          crowd_level: res.crowd,
          alerts: res.alerts
        });

        setAlerts({
          fresh: res.alerts?.fresh_batch,
          ending: res.alerts?.food_ending
        });
      })
      .catch(err => console.error(err));
  };

  // ✅ Auto-hide alerts
  useEffect(() => {
    if (alerts.fresh || alerts.ending) {
      const timer = setTimeout(() => {
        setAlerts({ fresh: false, ending: false });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alerts]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.phone || !form.name || !form.college || !form.mess) {
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

      window.location.href = `https://wa.me/91XXXXXXXXXX?text=status`;
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 font-bold text-lg">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            🍽️
          </div>
          Mess-Ease
        </div>

        <div className="hidden md:flex gap-8 text-gray-600 font-medium">
          <a href="#features" className="hover:text-indigo-600 transition">Features</a>
          <a href="#how" className="hover:text-indigo-600 transition">How it Works</a>
          <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
        </div>

        <button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-lg shadow-md hover:scale-105 transition"
        >
          Role →
        </button>
      </div>

      {/* HERO */}
      <div className="text-center py-16 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Eat Better. Skip the Chaos.
        </h1>

        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
          Get real-time mess insights, avoid long queues, receive fresh food alerts,
          and plan your meals smarter — all in one seamless experience.
        </p>
      </div>

      

      {/* FEATURES */}
<div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 max-w-5xl mx-auto px-4">

  <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-indigo-500 to-purple-500">
    <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition duration-300">
      <h3 className="font-semibold text-lg text-gray-800">Smarter Timing</h3>
      <p className="text-sm text-gray-500 mt-2">
        Know the best time to eat and avoid long queues.
      </p>
    </div>
  </div>

  <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-indigo-500 to-purple-500">
    <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition duration-300">
      <h3 className="font-semibold text-lg text-gray-800">Live Visibility</h3>
      <p className="text-sm text-gray-500 mt-2">
        See real-time crowd and food availability instantly.
      </p>
    </div>
  </div>

  <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-indigo-500 to-purple-500">
    <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition duration-300">
      <h3 className="font-semibold text-lg text-gray-800">Instant Alerts</h3>
      <p className="text-sm text-gray-500 mt-2">
        Get notified when fresh food arrives or is about to end.
      </p>
    </div>
  </div>

</div>

      {/* HOW IT WORKS */}
<div id="how" className="text-center mt-16">
  <p className="text-indigo-500 font-medium">HOW IT WORKS</p>
  <h2 className="text-2xl font-bold mt-2">Get Started in 4 Simple Steps</h2>

  <div className="flex justify-center gap-10 mt-8 flex-wrap">
    {["Enter Details", "Check Crowd", "Get Alerts", "Enjoy Meal"].map((step, i) => (
      <div key={i} className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-lg">
          {`0${i + 1}`}
        </div>
        <p className="mt-3 font-medium">{step}</p>
      </div>
    ))}
  </div>
</div>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow p-6 mt-10 max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Get Instant Mess Updates
        </h2>

        

        <div className="space-y-3">
          <input name="name" placeholder="Name" onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
          <select name="college" onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
            <option value="">Select College</option>
            <option value="ABC">ABC</option>
            <option value="XYZ">XYZ</option>
          </select>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg"
          >
            Continue →
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="max-w-3xl mx-auto mt-20 px-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          Frequently Asked Questions
        </h2>

        {[
          ["How does mess status tracking work?", "We collect live data from mess entries and system inputs."],
          ["How do I receive alerts?", "Alerts are triggered instantly based on mess activity."],
          ["Is my data safe?", "Yes, your data is secure and never shared."],
          ["Do I need to install anything?", "No, everything works directly through your browser."],
          ["Can I use it anytime?", "Yes, it works anytime during mess hours."]
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

    </div>
  );
}

export default UserDashboard;