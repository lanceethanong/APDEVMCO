// Dashboard logic (calendar + seat booking)
let selectedRoom = null;
let selectedLabNumber = null;
let selectedDate = null;
let seatSelections = {};
let currentMonth = new Date();
let rooms = [];
let searchTimeout; // Added for search functionality

// Parse URL info like /dashboard/student/lab/1?username=George
function getURLParams() {
  const pathMatch = window.location.pathname.match(/\/dashboard\/(student|technician)(?:\/lab\/(\d+))?/);
  const usernameParam = new URLSearchParams(window.location.search).get('username');
  return {
    role: pathMatch ? pathMatch[1] : 'student',
    labNumber: pathMatch && pathMatch[2] ? parseInt(pathMatch[2], 10) : null,
    username: usernameParam || ''
  };
}

// Search functionality
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
  
  // Navigate to the selected user's profile with current user as viewer
  window.location.href = `/dashboard/view-profile/${encodeURIComponent(username)}?username=${encodeURIComponent(currentUsername)}`;
}

// Rest of the existing dashboard functions...
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

function timeToIndex(apiTime) { // converts a time string from the API (e.g "8 AM") into a slot index for rendering purposes
  const time = apiTime.split(" ")[0].split(":");
  let index = (apiTime == "7 PM") ? 24 : (time[0] < 7) ? (parseInt(time[0]) - 1) * 2 + 12 : (parseInt(time[0]) - 7) * 2;

  if (time[1] == "30")
    index++;

  return index;
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

        //const unavailable = (listMatch != reservationList.length) && (slot >= timeToIndex(reservationList[listMatch].reservation.time_start) && slot < timeToIndex(reservationList[listMatch].reservation.time_end) && selectedLabNumber == reservationList[listMatch].reservation.lab.number) && selectedDate == new Date(reservationList[listMatch].reservation.date).toDateString();
        const unavailable = (listMatch != reservationList.length) && (slot >= timeToIndex(reservationList[listMatch].reservation.time_start) && slot < timeToIndex(reservationList[listMatch].reservation.time_end) && selectedLabNumber == reservationList[listMatch].reservation.lab.number) && selectedDate == new Date("2025-07-14T00:00:00.000Z").toDateString(); // disable date checks for now
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

document.getElementById("reserveBtn").onclick = () => {
  // Convert the set to an array
  const slotArray = Array.from(seatSelections);

  // Send POST request to the server
  fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(slotArray)
  })
  .then(response => {
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  })
  .then(data => {
    console.log("Server response:", data);
  })
  .catch(error => {
    console.error("Error sending slots:", error);
  });
};

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  // Initialize search input
  const searchInput = document.getElementById('user-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      searchUsers(e.target.value);
    });
  }

  // Close search results when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-wrapper') && !event.target.closest('#search-results')) {
      const resultsContainer = document.getElementById('search-results');
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('show');
      }
    }
  });

  // Initialize dashboard components
  fetchRoomsAndSelect();
  renderMonth();
  renderCalendar();
  updateClock();
});

// Make search functions available globally
window.searchUsers = searchUsers;
window.viewUserProfile = viewUserProfile;