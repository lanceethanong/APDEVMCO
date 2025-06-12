

export default function DashBoardLayout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-800 text-white flex items-center justify-between px-4 py-3">
        {/* Menu Icon on the Left */}
        <div className="flex items-center">
          <div className="text-2xl cursor-pointer">☰</div>
        </div>

        {/* Center Title */}
        <h1 className="text-xl font-bold text-center flex-1 -ml-6">Dashboard</h1>

        {/* Profile Picture on the Right */}
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src="/manila.png" // Replace with actual path or dynamic source
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      {/* Main content with sidebar and page content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 p-4">
          <nav className="flex flex-col space-y-2">
            <button className="bg-blue-100 px-4 py-2 rounded hover:bg-blue-200">Overview</button>
            <button className="bg-blue-100 px-4 py-2 rounded hover:bg-blue-200">Reports</button>
            <button className="bg-blue-100 px-4 py-2 rounded hover:bg-blue-200">Users</button>
          </nav>
        </aside>

        {/* Main page content */}
        <main className="flex-1 p-6 bg-white overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center py-3">
        ©2025 LabSlot.Inc All rights reserved.
      </footer>
    </div>
  );
}