let selectedRoom = null;
let selectedLabNumber = null;
let selectedDate = null;
let seatSelections = {};
let currentMonth = new Date();
let rooms = [];
let searchTimeout; 

function getURLParams() {
  const pathMatch = window.location.pathname.match(/\/dashboard\/(student|technician)(?:\/lab\/(\d+))?/);
  const usernameParam = new URLSearchParams(window.location.search).get('username');
  return {
    role: pathMatch ? pathMatch[1] : 'student',
    labNumber: pathMatch && pathMatch[2] ? parseInt(pathMatch[2], 10) : null,
    username: usernameParam || ''
  };
}

function getEditParam(url) {
  const urlObj = new URL(url, window.location.origin);
  return urlObj.searchParams.get("edit");
}

async function searchUsers(query) {
  const resultsContainer = document.getElementById('search-results');
  
  if (!query || query.length < 2) {
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('show');
    return;
  }

  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`/api/users/search/${encodeURIComponent(query)}`);
      const users = await response.json();
      
      if (users.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">No users found</div>';
        resultsContainer.classList.add('show');
        return;
      }
      
      resultsContainer.innerHTML = users.map(user => `
        <div class="search-result-item" data-username="${user.username}" onclick="viewUserProfile('${user.username}')">
          <img src="/assets/profile.png" alt="${user.username}" class="search-result-pic">
          <div class="search-result-info">
            <strong>${user.username}</strong>
            <small>${user.email}</small>
            <div class="user-role-badge">${user.role}</div>
          </div>
        </div>
      `).join('');
      
      resultsContainer.classList.add('show');
      
    } catch (error) {
      console.error('Search failed:', error);
      resultsContainer.innerHTML = '<div class="search-result-item">Error loading results</div>';
      resultsContainer.classList.add('show');
    }
  }, 300);
}

function viewUserProfile(username) {
  const currentRole = document.body.dataset.role.includes('Technician') ? 'technician' : 'student';
  const currentUsername = document.body.dataset.username;
  
  window.location.href = `/dashboard/view-profile/${encodeURIComponent(username)}?username=${encodeURIComponent(currentUsername)}`;
}

async function fetchRoomsAndSelect() {
  try {
    const res = await fetch('/api/labs');
    const data = await res.json();

    rooms = data.map(lab => ({
      id: lab._id,
      number: lab.number,
      name: `Lab ${lab.number} (${lab.class})`
    }));

    rooms.sort((a, b) => a.number - b.number);

    const { labNumber } = getURLParams();
    if (labNumber) {
      const found = rooms.find(l => l.number === labNumber);
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
  const { role, username } = getURLParams();

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
      window.history.pushState({}, '', `/dashboard/${role}/lab/${lab.number}?username=${encodeURIComponent(username)}`);
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

function timeToIndex(apiTime) {
  const time = apiTime.split(" ")[0].split(":");
  let index = (apiTime == "7 PM") ? 24 : (time[0] < 7) ? (parseInt(time[0]) - 1) * 2 + 12 : (parseInt(time[0]) - 7) * 2;

  if (time[1] == "30")
    index++;

  return index;
}

function slotToTime(slot) {
  const baseHour = 7;
  const totalMinutes = baseHour * 60 + slot * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const timeStr = `${String(displayHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  return timeStr;
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

  let reservationList = {};
  const getReservations = new XMLHttpRequest();
  getReservations.onload = function() {
    reservationList = JSON.parse(this.responseText);
  }
  getReservations.open("GET", "/api/seat-lists", false);
  getReservations.send();

  const header = document.createElement("thead");
  const headRow = document.createElement("tr");
  headRow.innerHTML = `<th>Seat</th>` + hours.map(h => `<th colspan="2">${h}</th>`).join("");
  header.appendChild(headRow);
  table.appendChild(header);

  const tbody = document.createElement("tbody");

  const rows = 7;
  const cols = 5;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatNum = row * cols + col + 1;
      if (seatNum > 35) break;

      const tr = document.createElement("tr");
      tr.innerHTML = `<td>Seat ${seatNum}</td>`;

      let listMatch = 0;
      while (listMatch != reservationList.length) {
        if (((reservationList[listMatch].row - 1) == row && (reservationList[listMatch].column - 1) == col))
          break;
        else
          listMatch++;
      }

      for (let slot = 0; slot < slots; slot++) {
        const td = document.createElement("td");
        const slotKey = `r${row + 1}-c${col + 1}-s${slot}`;

        let isPast = false;
        if (isToday) {
          const hour = 7 + Math.floor(slot / 2);
          const min = slot % 2 === 0 ? 0 : 30;
          isPast = now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= min);
        }

        const unavailable = (listMatch != reservationList.length) && (slot >= timeToIndex(reservationList[listMatch].reservation.time_start) && slot < timeToIndex(reservationList[listMatch].reservation.time_end) && selectedLabNumber == reservationList[listMatch].reservation.lab.number) && selectedDate == new Date(reservationList[listMatch].reservation.date).toDateString();
        const disabled = !selectedRoom || !selectedDate || isPast;

        td.className = unavailable
        ? "legend unavailable"
        : disabled
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
  }

  table.appendChild(tbody);
}

function updateReserveButton() {
  document.getElementById("reserveBtn").disabled = !(selectedRoom && selectedDate);
}

function validateSlotSet(slotSet) {
  const slots = Array.from(slotSet).sort();
  console.log(slotSet);
  console.log(slots);
  const r = slots[0].charAt(1);
  const c = slots[0].charAt(4);

  let result = true;

  if (slots.length > 1) {
    let i = 0;
    
    while (i < slots.length && result) {
      result = (slots[i].charAt(1) == r);
      i++;
    }

    i = 0;
    while (i < slots.length && result) {
      result = (slots[i].charAt(4) == c);
      i++;
    }

    i = 1;
    while (i < slots.length && result) {
      result = ((parseInt(slots[i].charAt(7)) - 1) == parseInt(slots[i - 1].charAt(7)));
      i++;
    }
  }
  return result;
}

document.getElementById("reserveBtn").onclick = async () => {
  try {
    const key = getKey();
    const slotSet = seatSelections[key];
    
    if (!slotSet || slotSet.size === 0) {
      alert("Please select at least one seat and time slot.");
      return;
    }

    console.log("Selected slots:", Array.from(slotSet));

    const slotData = Array.from(slotSet).map(s => {
      const match = s.match(/r(\d+)-c(\d+)-s(\d+)/);
      if (!match) {
        throw new Error(`Invalid slot format: ${s}`);
      }
      return {
        row: parseInt(match[1], 10),
        column: parseInt(match[2], 10),
        slot: parseInt(match[3], 10)
      };
    });

    console.log("Parsed slot data:", slotData);

    const seatGroups = {};
    for (const s of slotData) {
      const seatKey = `${s.row}_${s.column}`;
      if (!seatGroups[seatKey]) seatGroups[seatKey] = [];
      seatGroups[seatKey].push(s.slot);
    }

    console.log("Seat groups:", seatGroups);

    for (const [seatKey, slots] of Object.entries(seatGroups)) {
      const sorted = slots.sort((a, b) => a - b);
      const isConsecutive = sorted.every((s, i, arr) => i === 0 || s === arr[i - 1] + 1);
      if (!isConsecutive) {
        const [row, col] = seatKey.split('_').map(Number);
        const seatNum = (row - 1) * 5 + col;
        alert(`Slots for Seat ${seatNum} must be consecutive.`);
        return;
      }
    }

    const allSlots = slotData.map(s => s.slot);
    const globalStartSlot = Math.min(...allSlots);
    const globalEndSlot = Math.max(...allSlots) + 1;

    console.log("Global slots:", { start: globalStartSlot, end: globalEndSlot });

    const seats = Object.keys(seatGroups).map(key => {
      const [row, column] = key.split('_').map(Number);
      return { row, column };
    });

    console.log("Seats array:", seats);

    const { username, labNumber } = getURLParams();
    
    if (!username) {
      alert("Username is required");
      return;
    }
    
    if (!labNumber) {
      alert("Lab number is required");
      return;
    }

    if (typeof selectedDate === 'undefined') {
      alert("Please select a date");
      return;
    }

    const anonymity = document.getElementById('anonymityToggle')?.checked || false;

    if (typeof slotToTime !== 'function') {
      alert("Time conversion function not available");
      return;
    }

    const request = {
      time_start: slotToTime(globalStartSlot),
      time_end: slotToTime(globalEndSlot),
      user: username,
      lab: labNumber,
      date: new Date(selectedDate),
      anonymity,
      seats
    };

    console.log("Request payload:", JSON.stringify(request, null, 2));

    const reserveBtn = document.getElementById("reserveBtn");
    const originalText = reserveBtn.textContent;
    reserveBtn.disabled = true;
    reserveBtn.textContent = "Processing...";

    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error("Server error data:", errorData);
      } catch (e) {
        try {
          errorMessage = await response.text();
          console.error("Server error text:", errorMessage);
        } catch (e2) {
          errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Success response:", data);
    
    alert("Reservation successful!");
    
    seatSelections[key] = new Set();
    
    if (typeof renderSeats === 'function') {
      renderSeats();
    }

    const { role } = getURLParams();
    
    if (role === 'student') {
      window.location.href = `/dashboard/student/profile?username=${encodeURIComponent(username)}`;
    } else {
      window.location.href = `/dashboard/technician/reservation-list?username=${encodeURIComponent(username)}`;
    }
    
  } catch (error) {
    console.error("Full error object:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    alert(`Failed to reserve slots: ${error.message}`);
  } finally {
    const reserveBtn = document.getElementById("reserveBtn");
    if (reserveBtn) {
      reserveBtn.disabled = false;
      reserveBtn.textContent = "Reserve"; 
    }
  }
};
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('user-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      searchUsers(e.target.value);
    });
  }

  document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-wrapper') && !event.target.closest('#search-results')) {
      const resultsContainer = document.getElementById('search-results');
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('show');
      }
    }
  });

  fetchRoomsAndSelect();
  renderMonth();
  renderCalendar();
  updateClock();
});

window.searchUsers = searchUsers;
window.viewUserProfile = viewUserProfile;
