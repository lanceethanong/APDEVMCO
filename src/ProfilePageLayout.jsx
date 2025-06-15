import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePageLayout({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (type) => {
    switch (type) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "logout":
        // Clear session data
        localStorage.removeItem('rememberMe');
        sessionStorage.clear();
        navigate("/login");
        break;
      case "help":
        navigate("/help");
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-green-800 text-white flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-10">
          <div
            className="text-2xl cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            ☰
          </div>
          <div className="text-xl font-bold">Profile Settings</div>
        </div>

        <h1 className="text-xl font-bold text-center flex-1 -ml-6">LabSlot.Inc</h1>

        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src="./profile.png"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`${
            isExpanded ? "w-48" : "w-24"
          } bg-white p-4 border-r border-gray-200 transition-all duration-300`}
        >
          <nav className="flex flex-col space-y-4">
            {[
              { icon: "home.png", label: "Hello", action: "dashboard" },
              { icon: "help.png", label: "Help", action: "help" },
              { icon: "logout.png", label: "Logout", action: "logout" },
            ].map(({ icon, label, action }) => (
              <button
                key={label}
                onClick={() => handleNavigation(action)}
                className="flex items-center w-full py-4 px-2 rounded hover:bg-gray-200 transition-colors"
              >
                <img src={`./${icon}`} alt={`${label} Icon`} className="w-8 h-8" />
                {isExpanded && <span className="ml-3 font-bold text-sm">{label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>

      <footer className="bg-green-800 text-white text-center py-3">
        © 2025 LabSlot.Inc All rights reserved.
      </footer>
    </div>
  );
}
