import labImage from './assets/lab_home.jpg';


// Home Page 
//  source : https://www.youtube.com/watch?v=ifOJ0R5UQOc
export default function Home() {
  return (
    <div className="text-gray-800 bg-white transition-colors duration-300">
      {/* Navbar */}
      <header className="bg-green-800 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center items-center">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-wide">LabSlot.Inc</h1>
        </div>
      </header>

      {/* Spacer for navbar */}
      <div className="h-20" />

      {/* Hero Section */}
      <section className="h-[90vh] relative flex flex-col items-center justify-center text-white text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${labImage})`, filter: 'brightness(40%)' }}
        />
        <div className="relative z-10 px-6">
          <h1 className="text-6xl font-extrabold mb-6 drop-shadow-2xl leading-tight">Reserve Your Spaces Now!</h1>
          <p className="text-2xl mb-8 drop-shadow-2xl">Quick and Easy to Use Lab Booking System without the hassles and complications</p>
          <a href="/login">
            <button className="bg-green-800 hover:bg-green-600 px-12 py-6 rounded-full font-bold text-white text-2xl transition duration-300 shadow-xl">
              Get Started
            </button>
          </a>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 md:px-20 bg-white text-center">
        <h2 className="text-4xl font-bold mb-12">Why Choose Us?</h2>
        <div className="flex flex-col md:flex-row md:justify-center md:space-x-10 space-y-10 md:space-y-0">
          <div className="max-w-xs mx-auto">
            <i className="fas fa-clock fa-3x text-green-800 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Real-Time Availability</h3>
            <p>See up-to-date lab schedules and avoid conflicts.</p>
          </div>
          <div className="max-w-xs mx-auto">
            <i className="fas fa-mobile-alt fa-3x text-green-800 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">User-Friendly Interface</h3>
            <p>Easy to use and understandable booking system</p>
          </div>
          <div className="max-w-xs mx-auto">
            <i className="fas fa-bell fa-3x text-green-800 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Device Compatibility</h3>
            <p>Book your lab slot on any device at any time.</p>
          </div>
          <div className="max-w-xs mx-auto">
            <i className="fas fa-cogs fa-3x text-green-800 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Enhanced Features & Customizability</h3>
            <p>View/edit your profile and reservations. Light/dark mode compatability.</p>
          </div>
        </div>
      </section>

      {/* How To Reserve */}
      <section className="py-20 px-6 md:px-20 bg-gray-100 text-center">
        <h2 className="text-4xl font-bold mb-12">How to Reserve a Lab</h2>
        <div className="grid md:grid-cols-4 gap-10 text-left">
          {["Sign up or Log in", "Select a Lab", "Pick Date & Time", "Confirm Booking"].map((title, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-10 h-10 bg-green-800 text-white rounded-full flex items-center justify-center mb-4 text-lg font-bold">
                {i + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p>{[
                "Make your own account to start lab reservations.",
                "Choose a computer lab from the list.",
                "Use the calendar to find available slots.",
                "Review the availbility of a slot at a specific time and confirm booking."
              ][i]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center py-3 font">
        © 2025 LabSlot.Inc All rights reserved.
      </footer>
    </div>
  );
}
