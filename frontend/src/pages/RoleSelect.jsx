import { useNavigate } from "react-router-dom";
import logo from "../assets/Mess-Ease.png";

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
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-200 via-white to-purple-200 flex flex-col items-center justify-center px-6">

      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* LEFT */}
        <div className="absolute top-20 left-16 text-5xl opacity-30 animate-float1">🍽️</div>
        <div className="absolute top-[45%] left-10 text-5xl opacity-30 animate-float2">⏱️</div>
        <div className="absolute bottom-24 left-20 text-5xl opacity-30 animate-float3">🍛</div>

        {/* RIGHT (FIXED POSITIONS — no overlap with admin card) */}
        <div className="absolute top-16 right-20 text-5xl opacity-30 animate-float2">📊</div>
        <div className="absolute top-[60%] right-16 text-5xl opacity-30 animate-float3">🍽️</div>
        <div className="absolute bottom-20 right-24 text-5xl opacity-30 animate-float1">🍛</div>

        {/* EXTRA BALANCE */}
        <div className="absolute top-10 left-1/3 text-4xl opacity-20 animate-float3">⏱️</div>
        <div className="absolute bottom-10 right-1/3 text-4xl opacity-20 animate-float2">🍛</div>

      </div>

      {/* LOGO */}
      <div className="flex justify-center mb-6">
        <img
          src={logo}
          alt="logo"
          className="h-36 md:h-44 w-auto object-contain drop-shadow-lg"
        />
      </div>

      {/* MAIN HEADING */}
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 text-center leading-tight">
        Welcome to <span className="text-indigo-600">Mess-Ease</span>
      </h1>

      {/* DESCRIPTION */}
      <p className="text-gray-600 mt-4 mb-10 text-center max-w-xl text-sm md:text-base leading-relaxed">
        Skip the mess queues. Mess-Ease helps you track real-time crowd levels,
        get instant food alerts, and plan your meals smarter — all in one place.
      </p>

      {/* ROLE TITLE */}
      <p className="text-gray-700 font-medium mb-6">
        How would you like to continue?
      </p>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">

        {/* USER CARD */}
        <div
          onClick={() => selectRole("user")}
          className="cursor-pointer rounded-2xl p-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 hover:shadow-2xl transition duration-300"
        >
          <div className="bg-white rounded-2xl p-10 text-center shadow-md h-full">
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-xl font-semibold">User</h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Check live mess crowd, receive food alerts, and choose the best time to eat without waiting.
            </p>
          </div>
        </div>

        {/* ADMIN CARD */}
        <div
          onClick={() => selectRole("admin")}
          className="cursor-pointer rounded-2xl p-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 hover:shadow-2xl transition duration-300"
        >
          <div className="bg-white rounded-2xl p-10 text-center shadow-md h-full">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold">Admin</h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Manage crowd updates, send food alerts, and keep mess operations running smoothly in real-time.
            </p>
          </div>
        </div>

      </div>

      {/* ADVANCED FLOAT ANIMATIONS */}
      <style>
        {`
          @keyframes float1 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(20px, -25px) rotate(5deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }

          @keyframes float2 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-25px, -20px) rotate(-5deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }

          @keyframes float3 {
            0% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(15px, -35px) rotate(3deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }

          .animate-float1 {
            animation: float1 7s ease-in-out infinite;
          }

          .animate-float2 {
            animation: float2 6s ease-in-out infinite;
          }

          .animate-float3 {
            animation: float3 8s ease-in-out infinite;
          }
        `}
      </style>

    </div>
  );
}

export default RoleSelection;