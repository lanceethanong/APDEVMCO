import { useEffect, useState } from "react";

export default function Dashboard() {
  const [selectedDateElement, setSelectedDateElement] = useState(null);
  const availableRooms = ["Lab 1 (CCPROG3) ", "Lab 2 (CCAPDEV) ", "Lab 3 (STCHUIX) ", "Lab 4 (ITNET04) ", "Lab 5 (CSARCH2) "];
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [clock, setClock] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  /* Clock(real-time)
      source : https://www.youtube.com/watch?v=AiQ-V_0qvRI */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleDateString() + " | " + now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* Calendar(real-time)
      source: https://www.youtube.com/watch?v=iXqAuAnc_X8 */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const startDay = startOfMonth.getDay();

  const generateCalendar = () => {
    const days = [];
    const totalCells = 42; // 6 rows * 7 days
    for (let i = 0; i < totalCells; i++) {
      const date = new Date(currentMonth);
      date.setDate(i - startDay + 1);

      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isPastDate = date < today && isCurrentMonth;
      const key = date.toDateString();
      const isSelected = selectedDateElement === key;

      days.push(
        <div
          key={key}
          className={`p-2 text-center border rounded h-16 text-xs flex flex-col justify-center items-center ${
            !isCurrentMonth || isPastDate
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : isSelected
              ? "bg-green-200"
              : "hover:bg-green-100 cursor-pointer"
          }`}
          onClick={() => {
            if (isCurrentMonth && !isPastDate) setSelectedDateElement(key);
          }}
        >
          <div>{date.toLocaleString("default", { weekday: "short" })}</div>
          <div>{date.getDate()}</div>
        </div>
      );
    }
    return days;
  };

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  /* --------------------------- RESERVATION GRID -------------------------- */
  const hours = [...Array(12)].map((_, i) => `${7 + i}:00${i < 5 ? "am" : "pm"}`);
  const seats = 35;
  const slotsPerHour = 2; // 30‑minute slots
  const totalSlots = hours.length * slotsPerHour; // 24

  return (
    <div className="p-4 space-y-4">
      {/* Clock */}
      <div className="text-right font-mono text-sm text-gray-600">{clock}</div>

      <div className="flex gap-4">
        {/* Room List */}
        <div className="w-1/4">
          <h3 className="text-lg font-bold mb-2">Available Rooms</h3>
          <div className="space-y-2">
            {availableRooms.map((room) => (
              <div
                key={room}
                className={`p-2 border rounded cursor-pointer ${
                  selectedRoom === room ? "bg-green-200" : "hover:bg-green-50"
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                {room}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="border px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              ❮
            </button>
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleString("default", { month: "long" })} {" "}
              {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="border px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              ❯
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm">{generateCalendar()}</div>
        </div>
      </div>

      {/* Seat Availability */}
      <div className="text-xl font-bold mb-1">
        Seat availability at Lab Room: {selectedRoom || "(not selected)"}
      </div>

      {/* Legend */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center space-x-10">
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-red-400 border border-gray-400 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-semibold">Unavailable</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-green-300 border border-gray-400 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-semibold">Your Reservation/s</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-gray-200 border border-gray-400 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-semibold">Available</span>
          </div>
        </div>
      </div>
      {/* Combined Seat + Slots Table */}
<div className="overflow-auto border rounded min-h-[50vh]">
  <table className="border-collapse text-base min-w-full table-fixed">
    <thead>
      <tr>
        <th className="border px-4 py-3 sticky left-0 bg-white z-10 w-28">Seat</th>
        {hours.map((h, i) => (
          <th
            key={i}
            colSpan={slotsPerHour}
            className="border px-4 py-3 text-nowrap w-20"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {[...Array(seats)].map((_, seatIdx) => (
        <tr key={seatIdx}>
          <td className="border px-4 py-3 sticky left-0 bg-white font-semibold">
            Seat {seatIdx + 1}
          </td>
          {[...Array(totalSlots)].map((_, slotIdx) => (
            <td
              key={slotIdx}
              className="border w-14 h-14 cursor-pointer hover:bg-green-100"
              onClick={(e) => e.currentTarget.classList.toggle("bg-green-300")}
            ></td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

      {/* Reserve Button */}
      <div className="text-center mt-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Reserve Slot
        </button>
      </div>
    </div>
  );
}
