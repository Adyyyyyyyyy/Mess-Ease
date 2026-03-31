import { useNavigate } from "react-router-dom";

function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100">

      <div className="text-center">

        <h1 className="text-4xl font-bold mb-4">
          Welcome to Mess-Ease
        </h1>

        <p className="text-gray-600 mb-10">
          Choose how you want to continue
        </p>

        <div className="flex gap-8 justify-center">

          {/* USER */}
          <div
            onClick={() => {
  localStorage.setItem("role", "user");
  navigate("/user");
}}
            className="cursor-pointer bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition hover:-translate-y-2 w-64"
          >
            <div className="text-4xl mb-3">👤</div>
            <h2 className="text-xl font-semibold">User</h2>
            <p className="text-gray-500 mt-2">
              Check crowd & get updates
            </p>
          </div>

          {/* ADMIN */}
          <div
            onClick={() => {
  localStorage.setItem("role", "admin");
  navigate("/admin");
}}
            className="cursor-pointer bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition hover:-translate-y-2 w-64"
          >
            <div className="text-4xl mb-3">⚙️</div>
            <h2 className="text-xl font-semibold">Admin</h2>
            <p className="text-gray-500 mt-2">
              Manage mess operations
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default RoleSelect;