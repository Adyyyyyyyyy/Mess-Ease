import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RoleSelect from "./pages/RoleSelect";
import { SmoothScrollProvider } from "./ScrollComponent";
import ScrollHandler from "./ScrollHandler";

function App() {
  return (
    <BrowserRouter>
      <SmoothScrollProvider>
        <ScrollHandler />
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </SmoothScrollProvider>
    </BrowserRouter>
  );
}

export default App;