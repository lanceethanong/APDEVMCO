import { useState } from "react";
import { Link } from 'react-router-dom';
export default function DashBoardLayout({ children }) {
  const [isExpanded, setIsExpanded] = useState(false); //Checks whether the menu sidebar is expanded or not(default not)

  //Handles view redirection
  const handleNavigation = (type) => {
    switch (type) {
      case "home":
        window.location.reload();
        break;
      case "logout":
        window.location.href = "/login";
        break;

      case "help":
        window.location.href = "/help";
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-800 text-white flex items-center justify-between px-4 py-3">
        {/* Menu  */}
        <div className="flex items-center space-x-10">
          <div
            className="text-2xl cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)} //Allows sidebar to be expanded
          >
            ☰
          </div>
          <div className="text-xl font-bold">Welcome User</div> 
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-center flex-1 -ml-6">LabSlot.Inc</h1>

        {/* Profile Picture*/}
        <div className="w-10 h-10 rounded-full overflow-hidden">
            <Link to="/profile">
            <img
              src="./profile.png"
              alt="Profile"
              className="w-full h-full object-cover cursor-pointer"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar: source: https://www.youtube.com/watch?v=MszSqhEw__8&pp=0gcJCdgAo7VqN5tD*/}
        <aside
          className={`${
            isExpanded ? "w-48" : "w-24"
          } bg-white p-4 border-r border-gray-200 transition-all duration-300`}
        >
          <nav className="flex flex-col space-y-4"> 
            {/* Icons */}
            {[
              { icon: "home.png", label: "Home", action: "home" },
              { icon: "help.png", label: "Help", action: "help" },
              { icon: "logout.png", label: "Logout", action: "logout" },
            ].map(({ icon, label, action }) => (
              <button
                key={label}
                onClick={() => handleNavigation(action)}
                className="flex items-center w-full py-4 px-2 rounded hover:bg-gray-200 transition-colors" 
              >
                <img src={`./${icon}`} alt={`${label} Icon`} className="w-8 h-8" />
                {isExpanded && (
                  <span className="ml-3 font-bold text-sm">{label}</span> 
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center py-3 font">
        © 2025 LabSlot.Inc All rights reserved.
      </footer>
    </div>
  );
}