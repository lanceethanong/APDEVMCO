// Dashboard logic (calendar + seat booking)
let selectedRoom = null;
let selectedLabNumber = null;
let selectedDate = null;
let seatSelections = {};
let currentMonth = new Date();
let rooms = [];

// Parse /lab/:number from URL
function getLabNumberFromURL() {
  const match = window.location.pathname.match(/^\/lab\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// Fetch labs from MongoDB
async function fetchRoomsAndSelect() {
  try {
    const res = await fetch('/api/labs');
    const data = await res.json();
    rooms = data.map(lab => ({
      id: lab._id,
      number: lab.number,
      name: `Lab ${lab.number} (${lab.class})`
    }));

    const labNumberFromURL = getLabNumberFromURL();
    if (labNumberFromURL) {
      const found = rooms.find(l => l.number === labNumberFromURL);
      if (found) {
        selectedRoom = found.name;
        selectedLabNumber = found.number;
      }
    }

    renderRooms();
  } catch (error) {
    console.error('Failed to load labs:', error);
    document.getElementById("rooms").innerHTML = "<p style='color:red'>Failed to load rooms</p>";
  }
}

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleDateString() + " | " + now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

function renderRooms() {
  const container = document.getElementById("rooms");
  container.innerHTML = "";
  rooms.forEach(lab => {
    const div = document.createElement("div");
    div.textContent = lab.name;
    div.className = selectedRoom === lab.name ? "room-item selected" : "room-item";
    div.onclick = () => {
      selectedRoom = lab.name;
      selectedLabNumber = lab.number;
      renderRooms();
      renderSeatInfo();
      renderSeats();
      updateReserveButton();
      window.history.pushState({}, '', `/lab/${lab.number}`);
    };
    container.appendChild(div);
  });
}

function renderMonth() {
  document.getElementById("monthLabel").textContent = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });
}

function changeMonth(offset) {
  currentMonth.setMonth(currentMonth.getMonth() + offset);
  renderMonth();
  renderCalendar();
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(today.getDate() + 7);

  const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startDay = start.getDay();
  let date = new Date(start);
  date.setDate(date.getDate() - startDay);

  for (let i = 0; i < 42; i++) {
    const key = date.toDateString();
    const div = document.createElement("div");

    const isPast = date < today;
    const isBeyond = date > limit;
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isSelected = selectedDate === key;

    if (!isCurrentMonth || isPast || isBeyond) {
      div.className = "disabled";
    } else {
      div.className = "hoverable";
      div.onclick = () => {
        selectedDate = key;
        renderCalendar();
        renderSeatInfo();
        renderSeats();
        updateReserveButton();
      };
    }

    if (isSelected) div.classList.add("active");

    div.innerHTML = `<div>${date.toLocaleString("default", { weekday: "short" })}</div><div>${date.getDate()}</div>`;
    calendar.appendChild(div);
    date.setDate(date.getDate() + 1);
  }
}

function getKey() {
  if (!selectedDate || !selectedRoom) return null;
  return `${new Date(selectedDate).toISOString().split("T")[0]}_${selectedRoom}`;
}

function renderSeatInfo() {
  document.getElementById("selectedInfo").textContent = `Seat availability at Lab Room: ${selectedRoom || "(not selected)"}`;
}

function renderSeats() {
  const table = document.getElementById("seatTable");
  table.innerHTML = "";
  const key = getKey();
  const hours = Array.from({ length: 12 }, (_, i) => `${7 + i}:00${i < 5 ? "am" : "pm"}`);
  const slots = hours.length * 2;
  const now = new Date();
  const todayKey = new Date().toDateString();
  const isToday = todayKey === selectedDate;
  const selected = key && seatSelections[key] ? seatSelections[key] : new Set();

  const header = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.innerHTML = `<th>Seat</th>` + hours.map(h => `<th colspan="2">${h}</th>`).join("");
  header.appendChild(headRow);
  table.appendChild(header);

  const tbody = document.createElement("tbody");
  for (let seat = 0; seat < 35; seat++) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>Seat ${seat + 1}</td>`;

    for (let slot = 0; slot < slots; slot++) {
      const td = document.createElement("td");
      const slotKey = `${seat}-${slot}`;

      let isPast = false;
      if (isToday) {
        const hour = 7 + Math.floor(slot / 2);
        const min = slot % 2 === 0 ? 0 : 30;
        isPast = now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= min);
      }

      const disabled = !selectedRoom || !selectedDate || isPast;

      td.className = disabled
        ? "disabled"
        : selected.has(slotKey)
        ? "reserved"
        : "available";

      td.onclick = () => {
        if (disabled) return;
        if (!seatSelections[key]) seatSelections[key] = new Set();
        if (seatSelections[key].has(slotKey)) {
          seatSelections[key].delete(slotKey);
        } else {
          seatSelections[key].add(slotKey);
        }
        renderSeats();
      };

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

function updateReserveButton() {
  document.getElementById("reserveBtn").disabled = !(selectedRoom && selectedDate);
}

document.getElementById("reserveBtn").onclick = () => {
  window.location.href = "/dashboard/student/confirm";
};

// Load everything
fetchRoomsAndSelect();
renderMonth();
renderCalendar();
