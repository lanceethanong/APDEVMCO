import { useEffect } from "react";
import { Link } from "react-router-dom"; // for client-side routing

export default function HelpSupport() {
  useEffect(() => {
    document.title = "Help & Support";
  }, []); 

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 relative">
      {/* Back to Home Button */}
      <div className="absolute top-5 left-5">
        <Link // Links back to the home page 
          to="/dashboard-technician"
          className=" text-black px-4 py-2 rounded hover:bg-gray-200 text-xl transition"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Help and Support</h1>

        {/* FAQs Section  source : https://www.youtube.com/watch?v=ioa8T4tA4zg*/}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
          <div className="space-y-4">
            {[
              {
                q: "How do I book a lab?",
                a: "You must be logged on to your DLSU account, then afterwards select a lab and date(up to 7 days in advanced) on the dashboard and then click on which seats and timeslots you want to reserve(assuming its available) and then click reserve slot",
              },
              {
                q: "How do I update my profile?",
                a: 'Log in, tap your profile icon in the upper right, tap "Account Settings," and navigate to "Edit Profile" to update your details.',
              },

              {
                q: "What happenes when Im late for my reservation",
                a: "Reservations can be cancelled by a lab technician 10 minutes before the reservation time(assuming the student dosent show up)",
              },
              {
                q: "How do I see available slots?",
                a: "Available slots for the following 7 days can be seen on the calendar page.",
              },
            ].map(({ q, a }, index) => (
              <details key={index} className="border border-gray-300 rounded-md p-4">
                <summary className="cursor-pointer font-medium">{q}</summary> 
                <p className="mt-2 text-gray-700">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <div className="contacts-container">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center bg-white rounded-lg shadow p-4">
              <i className="fas fa-envelope text-2xl text-blue-600 mb-2"></i>
              <h3 className="font-semibold text-lg">Email</h3>
              <p className="text-gray-700">labspot123@gmail.com</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white rounded-lg shadow p-4">
              <i className="fas fa-phone text-2xl text-green-600 mb-2"></i>
              <h3 className="font-semibold text-lg">Phone Number</h3>
              <p className="text-gray-700">0956 144 0266</p>
            </div>
            <div className="flex flex-col items-center text-center bg-white rounded-lg shadow p-4">
              <i className="fas fa-map-marker-alt text-2xl text-red-600 mb-2"></i>
              <h3 className="font-semibold text-lg">Landline</h3>
              <p className="text-gray-700">8-7143782</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-800 text-white text-center py-3 font">
        © 2025 LabSlot.Inc All rights reserved.
      </footer>
    </div>
  );
}