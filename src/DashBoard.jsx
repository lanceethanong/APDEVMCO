import { useEffect, useState } from "react";

export default function Dashboard() {
  const [selectedDateElement, setSelectedDateElement] = useState(null);
  const availableRooms = [
    "Lab 1 (CCPROG3)",
    "Lab 2 (CCAPDEV)",
    "Lab 3 (STCHUIX)",
    "Lab 4 (ITNET04)",
    "Lab 5 (CSARCH2)",
  ];
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [clock, setClock] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [seatSelections, setSeatSelections] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleDateString() + " | " + now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const getDateKey = (dateString, lab) => {
    const date = new Date(dateString);
    const datePart = date.toISOString().split("T")[0];
    return `${datePart}_${lab || "NO_LAB"}`;
  };

  const toggleSeatSelection = (seatIdx, slotIdx) => {
    if (!selectedDateElement || !selectedRoom) return;
    const key = getDateKey(selectedDateElement, selectedRoom);
    const id = `${seatIdx}-${slotIdx}`;
    setSeatSelections((prev) => {
      const current = prev[key] || new Set();
      const newSet = new Set(current);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return {
        ...prev,
        [key]: newSet,
      };
    });
  };

  const generateCalendar = () => {
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + 7);

    const calendar = [];
    let date = new Date(startOfMonth);
    date.setDate(date.getDate() - startDay);

    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
        const isPastDate = date < today;
        const isBeyondLimit = date > limitDate;
        const key = date.toDateString();
        const isSelected = selectedDateElement === key;
        const isDisabled = !isCurrentMonth || isPastDate || isBeyondLimit;

        calendar.push(
          <div
            key={key}
            className={`p-2 text-center border rounded h-20 text-xs flex flex-col justify-center items-center transition-all ${
              isDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isSelected
                ? "bg-green-200"
                : "hover:bg-green-100 cursor-pointer"
            }`}
            onClick={() => {
              if (!isDisabled) setSelectedDateElement(key);
            }}
          >
            <div className="font-semibold">
              {date.toLocaleString("default", { weekday: "short" })}
            </div>
            <div>{date.getDate()}</div>
          </div>
        );

        date.setDate(date.getDate() + 1);
      }
    }

    return calendar;
  };

  const hours = [...Array(12)].map((_, i) => `${7 + i}:00${i < 5 ? "am" : "pm"}`);
  const seats = 35;
  const slotsPerHour = 2;
  const totalSlots = hours.length * slotsPerHour;

  const currentDateKey =
    selectedDateElement && selectedRoom && getDateKey(selectedDateElement, selectedRoom);
  const selectedSeats = currentDateKey && seatSelections[currentDateKey]
    ? seatSelections[currentDateKey]
    : new Set();

  const isToday = new Date().toDateString() === selectedDateElement;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  return (
    <div className="p-4 space-y-4">
      <div className="text-right font-mono text-sm text-gray-600">{clock}</div>

      <div className="flex gap-4">
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

        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="border px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              ❮
            </button>
            <h2 className="text-xl font-semibold">
              {currentMonth.toLocaleString("default", { month: "long" })}{" "}
              {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="border px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              ❯
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm">
            {generateCalendar()}
          </div>
        </div>
      </div>

      <div className="text-xl font-bold mb-1">
        Seat availability at Lab Room: {selectedRoom || "(not selected)"}
      </div>

      <div className="flex justify-center mb-4">
        <div className="flex items-center space-x-10">
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-red-400 border border-gray-400 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-semibold">
              Unavailable
            </span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-green-300 border border-gray-400 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-semibold">
              Your Reservation/s
            </span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <div className="w-10 h-10 bg-gray-200 border border-gray-400 rounded-sm"></div>
            <span className="text-sm text-gray-700 font-semibold">
              Available
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-auto border rounded min-h-[50vh]">
        <table className="border-collapse text-base min-w-full table-fixed available-table">
          <thead>
            <tr>
              <th className="border px-4 py-3 sticky left-0 bg-white z-10 w-28">Seat</th>
              {hours.map((h, i) => (
                <th key={i} colSpan={slotsPerHour} className="border px-4 py-3 w-20">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(seats)].map((_, seatIdx) => (
              <tr key={seatIdx}>
                <td className="border px-4 py-3 sticky left-0 bg-white font-semibold">
                  Seat {seatIdx + 1}
                </td>
                {[...Array(totalSlots)].map((_, slotIdx) => {
                  const slotKey = `${seatIdx}-${slotIdx}`;

                  // Check if this slot is in the past (only matters for today)
                  let isPastSlot = false;
                  if (isToday) {
                    const slotHour = 7 + Math.floor(slotIdx / 2);
                    const slotMinute = slotIdx % 2 === 0 ? 0 : 30;
                    if (
                      slotHour < currentHour ||
                      (slotHour === currentHour && slotMinute <= currentMinutes)
                    ) {
                      isPastSlot = true;
                    }
                  }

                  const isDisabled =
                    !selectedRoom || !selectedDateElement || (isToday && isPastSlot);

                  return (
                    <td
                      key={slotIdx}
                      className={`border w-14 h-14 ${
                        isDisabled
                          ? "bg-gray-100 cursor-not-allowed"
                          : selectedSeats.has(slotKey)
                          ? "bg-green-300 cursor-pointer"
                          : "hover:bg-green-100 cursor-pointer"
                      }`}
                      onClick={() =>
                        !isDisabled && toggleSeatSelection(seatIdx, slotIdx)
                      }
                    ></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-4">
        <button
          className={`px-4 py-2 rounded text-white ${
            selectedRoom && selectedDateElement
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!selectedRoom || !selectedDateElement}
        >
          Reserve Slot
        </button>
      </div>
    </div>
  );
}