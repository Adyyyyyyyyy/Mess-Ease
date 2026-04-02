import { useNavigate } from "react-router-dom";
import logo from "../assets/Mess-Ease.png";
import admin from "../assets/chef-hat.png";
import user from "../assets/users.png";

function RoleSelection() {
  const navigate = useNavigate();

  const selectRole = (role) => {
    localStorage.setItem("role", role);
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/user");
    }
  };

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-indigo-200 via-white to-#98b2ec flex flex-col items-center justify-center px-6"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* LEFT */}
        <div className="absolute top-20 left-16 text-5xl opacity-30 animate-float1">🍽️</div>
        <div className="absolute top-[45%] left-10 text-5xl opacity-30 animate-float2">⏱️</div>
        <div className="absolute bottom-24 left-20 text-5xl opacity-30 animate-float3">🍛</div>

        {/* RIGHT */}
        <div className="absolute top-16 right-20 text-5xl opacity-30 animate-float2">📊</div>
        <div className="absolute top-[60%] right-16 text-5xl opacity-30 animate-float3">🍽️</div>
        <div className="absolute bottom-20 right-24 text-5xl opacity-30 animate-float1">🍛</div>

        {/* EXTRA BALANCE */}
        <div className="absolute top-10 left-1/3 text-4xl opacity-20 animate-float3">⏱️</div>
        <div className="absolute bottom-10 right-1/3 text-4xl opacity-20 animate-float2">🍛</div>
      </div>

      {/* LOGO */}
      <div className="flex justify-center mt-2 mb-2">
        <img
          src={logo}
          alt="logo"
          className="h-24 md:h-28 w-auto object-contain drop-shadow-lg"
        />
      </div>

      {/* MAIN HEADING */}
      <h1
        className="text-2xl md:text-4xl mb-1 font-bold text-gray-900 text-center leading-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Welcome to <span style={{ color: "#170796" }}>Mess-Ease</span>
      </h1>

      {/* DESCRIPTION */}
      <p
        className="text-gray-600 mt-2 mb-2 text-center max-w-xl text-sm md:text-base leading-relaxed"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        Know the mess crowd and waiting time instantly directly from WhatsApp.
        No apps. No confusion. Just real-time mess insights.
      </p>

      {/* ROLE TITLE */}
      <p
        className="text-gray-700 font-medium mb-4"
        style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      >
        How would you like to continue?
      </p>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 mb-5 gap-6 w-full max-w-2xl">

        {/* USER CARD */}
        <div
          onClick={() => selectRole("user")}
          className="cursor-pointer rounded-2xl p-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 hover:shadow-2xl transition duration-300"
        >
          <div className="bg-white rounded-2xl p-6 shadow-md h-full flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 mb-4 flex items-center justify-center">
              <img
                className="h-full w-full object-contain"
                src={user}
                alt="User"
              />
            </div>
            <h2
              className="text-xl font-bold mb-2 w-full text-center text-gray-800"
              style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", fontWeight: 700 }}
            >
              Hosteller
            </h2>
            <p
              className="text-gray-500 text-m leading-relaxed max-w-xs text-center"
              style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
            >
              Get instant mess updates, avoid long queues and visit the mess at the right time.
            </p>
          </div>
        </div>

        {/* ADMIN CARD */}
        <div
          onClick={() => selectRole("admin")}
          className="cursor-pointer rounded-2xl p-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 hover:shadow-2xl transition duration-300"
        >
          <div className="bg-white rounded-2xl p-6 shadow-md h-full flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 mb-4 flex items-center justify-center">
              <img
                className="h-full w-full object-contain"
                src={admin}
                alt="Admin"
              />
            </div>
            <h2
              className="text-xl font-bold mb-2 w-full text-center text-gray-800"
              style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", fontWeight: 700 }}
            >
              Mess-Staff
            </h2>
            <p
              className="text-gray-500 text-m leading-relaxed max-w-xs text-center"
              style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
            >
              Get correct food estimates, manage mess operations and provide real-time updates to students.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RoleSelection;