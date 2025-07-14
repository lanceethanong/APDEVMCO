// Dashboard logic (calendar + seat booking)
let selectedRoom = null;
let selectedLabNumber = null;
let selectedDate = null;
let seatSelections = {};
let currentMonth = new Date();
let rooms = [];
let searchTimeout;

// Technician Reservation Feature Variables
let technicianSelectedStudent = null;
let technicianStudentVerifyError = null;

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

// Technician: Search and select a student to reserve for
async function technicianStudentSearch(query) {
  const resultsContainer = document.getElementById('technician-search-results');
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
      const studentUsers = users.filter(user => user.role === "Student");
      if (studentUsers.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">No students found</div>';
        resultsContainer.classList.add('show');
        return;
      }
      resultsContainer.innerHTML = studentUsers.map(user => `
        <div class="search-result-item" data-userid="${user._id}" onclick="selectTechnicianStudent('${user._id}', '${user.username}', '${user.email}')">
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
      console.error('Student search failed:', error);
      resultsContainer.innerHTML = '<div class="search-result-item">Error loading results</div>';
      resultsContainer.classList.add('show');
    }
  }, 300);
}

// Technician: Student search for reservation (dropdown, keyboard nav)
let techStudentSelectedIndex = -1;
function technicianSearchStudentsForReservation(query) {
  const resultsContainer = document.getElementById('technician-student-search-results');
  techStudentSelectedIndex = -1;

  if (!query || query.length < 2) {
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('show');
    return;
  }

  clearTimeout(window.technicianStudentSearchTimeout);

  window.technicianStudentSearchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`/api/users/search/${encodeURIComponent(query)}`);
      const users = await response.json();
      const studentUsers = users.filter(user => user.role === "Student");
      if (studentUsers.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">No students found</div>';
        resultsContainer.classList.add('show');
        return;
      }
      resultsContainer.innerHTML = studentUsers.map((user, idx) => `
        <div class="search-result-item" data-userid="${user._id}" tabindex="0" data-index="${idx}">
          <img src="/assets/profile.png" alt="${user.username}" class="search-result-pic">
          <div class="search-result-info">
            <strong>${user.username}</strong>
            <small>${user.email}</small>
            <div class="user-role-badge">${user.role}</div>
          </div>
        </div>
      `).join('');
      Array.from(resultsContainer.querySelectorAll('.search-result-item')).forEach((div, idx) => {
        div.onclick = () => {
          selectTechnicianStudent(
            studentUsers[idx]._id,
            studentUsers[idx].username,
            studentUsers[idx].email
          );
          resultsContainer.innerHTML = '';
          resultsContainer.classList.remove('show');
        };
        div.onmouseenter = () => setActiveTechStudentResult(idx);
        div.onmouseleave = () => setActiveTechStudentResult(-1);
      });
      resultsContainer.classList.add('show');
    } catch (error) {
      console.error('Technician student search failed:', error);
      resultsContainer.innerHTML = '<div class="search-result-item">Error loading results</div>';
      resultsContainer.classList.add('show');
    }
  }, 300);
}
function setActiveTechStudentResult(idx) {
  const resultsContainer = document.getElementById('technician-student-search-results');
  const items = Array.from(resultsContainer.querySelectorAll('.search-result-item'));
  items.forEach((item, i) => {
    if (i === idx) {
      item.classList.add('active');
      item.scrollIntoView({block: 'nearest'});
      techStudentSelectedIndex = idx;
    } else {
      item.classList.remove('active');
    }
  });
}
function technicianStudentDropdownKeyHandler(e) {
  const resultsContainer = document.getElementById('technician-student-search-results');
  if (!resultsContainer.classList.contains('show')) return;
  const items = Array.from(resultsContainer.querySelectorAll('.search-result-item'));
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    let next = (techStudentSelectedIndex + 1) % items.length;
    setActiveTechStudentResult(next);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    let prev = (techStudentSelectedIndex - 1 + items.length) % items.length;
    setActiveTechStudentResult(prev);
  } else if (e.key === 'Enter') {
    if (techStudentSelectedIndex >= 0 && techStudentSelectedIndex < items.length) {
      items[techStudentSelectedIndex].click();
    }
  } else if (e.key === 'Escape') {
    resultsContainer.classList.remove('show');
  }
}
function selectTechnicianStudent(studentId, username, email) {
  technicianSelectedStudent = { _id: studentId, username, email };
  const input = document.getElementById("technician-student-search");
  input.value = username + ' (' + email + ')';
  document.getElementById('technician-student-search-results').innerHTML = '';
  document.getElementById('technician-student-search-results').classList.remove('show');
  document.getElementById('technician-student-selected').textContent = `Selected Student: ${username} (${email})`;
  technicianStudentVerifyError = null;
}
function clearTechnicianStudent() {
  technicianSelectedStudent = null;
  const input = document.getElementById("technician-student-search");
  input.value = "";
  document.getElementById('technician-student-search-results').innerHTML = '';
  document.getElementById('technician-student-selected').textContent = '';
}

// Search for users (top search bar)
let searchSelectedIndex = -1;
async function searchUsers(query) {
  const resultsContainer = document.getElementById('search-results');
  searchSelectedIndex = -1;

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
      resultsContainer.innerHTML = users.map((user, idx) => `
        <div class="search-result-item" data-username="${user.username}" tabindex="0" data-index="${idx}" onclick="viewUserProfile('${user.username}')">
          <img src="/assets/profile.png" alt="${user.username}" class="search-result-pic">
          <div class="search-result-info">
            <strong>${user.username}</strong>
            <small>${user.email}</small>
            <div class="user-role-badge">${user.role}</div>
          </div>
        </div>
      `).join('');
      resultsContainer.classList.add('show');
      Array.from(resultsContainer.querySelectorAll('.search-result-item')).forEach((div, idx) => {
        div.onmouseenter = () => setActiveSearchResult(idx);
        div.onmouseleave = () => setActiveSearchResult(-1);
      });

    } catch (error) {
      console.error('Search failed:', error);
      resultsContainer.innerHTML = '<div class="search-result-item">Error loading results</div>';
      resultsContainer.classList.add('show');
    }
  }, 300);
}
function setActiveSearchResult(idx) {
  const resultsContainer = document.getElementById('search-results');
  const items = Array.from(resultsContainer.querySelectorAll('.search-result-item'));
  items.forEach((item, i) => {
    if (i === idx) {
      item.classList.add('active');
      item.scrollIntoView({block: 'nearest'});
      searchSelectedIndex = idx;
    } else {
      item.classList.remove('active');
    }
  });
}
function searchDropdownKeyHandler(e) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer.classList.contains('show')) return;
  const items = Array.from(resultsContainer.querySelectorAll('.search-result-item'));
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    let next = (searchSelectedIndex + 1) % items.length;
    setActiveSearchResult(next);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    let prev = (searchSelectedIndex - 1 + items.length) % items.length;
    setActiveSearchResult(prev);
  } else if (e.key === 'Enter') {
    if (searchSelectedIndex >= 0 && searchSelectedIndex < items.length) {
      items[searchSelectedIndex].click();
    }
  } else if (e.key === 'Escape') {
    resultsContainer.classList.remove('show');
  }
}
function viewUserProfile(username) {
  const currentRole = document.body.dataset.role.includes('Technician') ? 'technician' : 'student';
  const currentUsername = document.body.dataset.username;
  window.location.href = `/dashboard/view-profile/${encodeURIComponent(username)}?username=${encodeURIComponent(currentUsername)}`;
}

// Fetch labs/rooms
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

// ---------- FIX: LAB-AND-DATE-SPECIFIC SEAT AVAILABILITY ----------
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

  // *** Only show reservations for the currently selected lab AND currently selected date ***
  const filteredReservationList = Array.isArray(reservationList) ? reservationList.filter(seatObj => {
    if (!seatObj.reservation || !seatObj.reservation.lab || !seatObj.reservation.date) return false;
    // Filter by lab
    let isLab =
      typeof seatObj.reservation.lab === 'object'
        ? seatObj.reservation.lab.number === selectedLabNumber
        : seatObj.reservation.lab === selectedLabNumber;
    // Filter by date (Y-M-D match)
    const seatDate = new Date(seatObj.reservation.date);
    const selDate = selectedDate ? new Date(selectedDate) : null;
    const isDate = selDate
      ? seatDate.getFullYear() === selDate.getFullYear() &&
        seatDate.getMonth() === selDate.getMonth() &&
        seatDate.getDate() === selDate.getDate()
      : false;
    return isLab && isDate;
  }) : [];

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
      while (listMatch != filteredReservationList.length) {
        if (((filteredReservationList[listMatch].row - 1) == row && (filteredReservationList[listMatch].column - 1) == col))
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
        const unavailable = (listMatch != filteredReservationList.length) &&
          (slot >= timeToIndex(filteredReservationList[listMatch].reservation.time_start) &&
           slot < timeToIndex(filteredReservationList[listMatch].reservation.time_end));
        const disabled = !selectedRoom || !selectedDate || isPast;
        td.className = unavailable
        ? "legend unavailable"
        : disabled
        ? "disabled"
        : selected.has(slotKey)
        ? "reserved"
        : "available";
        td.onclick = () => {
          if (disabled || unavailable) return;
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
// ----------------------------------------------------------

function updateReserveButton() {
  document.getElementById("reserveBtn").disabled = !(selectedRoom && selectedDate);
}

// Reserve button click handler (support technician reservation for students)
document.getElementById("reserveBtn").onclick = async () => {
  try {
    const key = getKey();
    const slotSet = seatSelections[key];
    const { role, username, labNumber } = getURLParams();
    let actualUsername = username;
    let actualUserId = null;
    if (role === "technician") {
      if (!technicianSelectedStudent) {
        alert("Technician: You must select a student to reserve for.");
        return;
      }
      actualUsername = technicianSelectedStudent.username;
      actualUserId = technicianSelectedStudent._id;
      let verifyRes = await fetch(`/api/users/${actualUserId}`);
      if (!verifyRes.ok) {
        alert("Selected student does not exist.");
        return;
      }
      const verifyUser = await verifyRes.json();
      if (verifyUser.role !== "Student") {
        alert("Selected user is not a student.");
        return;
      }
    }
    if (!slotSet || slotSet.size === 0) {
      alert("Please select at least one seat and time slot.");
      return;
    }
    const slotData = Array.from(slotSet).map(s => {
      const match = s.match(/r(\d+)-c(\d+)-s(\d+)/);
      if (!match) throw new Error(`Invalid slot format: ${s}`);
      return {
        row: parseInt(match[1], 10),
        column: parseInt(match[2], 10),
        slot: parseInt(match[3], 10)
      };
    });
    // Group by seat
    const seatGroups = {};
    for (const s of slotData) {
      const seatKey = `${s.row}_${s.column}`;
      if (!seatGroups[seatKey]) seatGroups[seatKey] = [];
      seatGroups[seatKey].push(s.slot);
    }
    // Validate each seat has consecutive slots
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
    const seats = Object.keys(seatGroups).map(key => {
      const [row, column] = key.split('_').map(Number);
      return { row, column };
    });
    if (!actualUsername) {
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
      user: actualUsername,
      lab: labNumber,
      date: new Date(selectedDate),
      anonymity,
      seats
    };
    if (role === "technician" && actualUserId) {
      request.studentId = actualUserId;
    }
    const reserveBtn = document.getElementById("reserveBtn");
    const originalText = reserveBtn.textContent;
    reserveBtn.disabled = true;
    reserveBtn.textContent = "Processing...";
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        try {
          errorMessage = await response.text();
        } catch (e2) {
          errorMessage = `HTTP ${response.status} - ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    alert("Reservation successful!");
    seatSelections[key] = new Set();
    if (typeof renderSeats === 'function') {
      renderSeats();
    }
    if (role === 'student') {
      window.location.href = `/dashboard/student/profile?username=${encodeURIComponent(actualUsername)}`;
    } else {
      window.location.href = `/dashboard/technician/reservation-list?username=${encodeURIComponent(username)}`;
    }
  } catch (error) {
    console.error("Full error object:", error);
    alert(`Failed to reserve slots: ${error.message}`);
  } finally {
    const reserveBtn = document.getElementById("reserveBtn");
    if (reserveBtn) {
      reserveBtn.disabled = false;
      reserveBtn.textContent = "Reserve";
    }
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Main search bar
  const searchInput = document.getElementById('user-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      searchUsers(e.target.value);
    });
    searchInput.addEventListener('keydown', searchDropdownKeyHandler);
  }
  // Technician: student search input
  const techStudentSearchInput = document.getElementById('technician-student-search');
  if (techStudentSearchInput) {
    techStudentSearchInput.addEventListener('input', function(e) {
      technicianSearchStudentsForReservation(e.target.value);
    });
    techStudentSearchInput.addEventListener('keydown', technicianStudentDropdownKeyHandler);
  }
  // Hide dropdowns on outside click
  document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-wrapper')) {
      const resultsContainer = document.getElementById('search-results');
      if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.remove('show');
      }
      const techResultsContainer = document.getElementById('technician-student-search-results');
      if (techResultsContainer) {
        techResultsContainer.innerHTML = '';
        techResultsContainer.classList.remove('show');
      }
    }
  });
  fetchRoomsAndSelect();
  renderMonth();
  renderCalendar();
  updateClock();
  if (typeof setupTechnicianStudentUI === "function") setupTechnicianStudentUI();
});

// Make functions global
window.searchUsers = searchUsers;
window.viewUserProfile = viewUserProfile;
window.technicianStudentSearch = technicianStudentSearch;
window.selectTechnicianStudent = selectTechnicianStudent;
window.clearTechnicianStudent = clearTechnicianStudent;
window.technicianSearchStudentsForReservation = technicianSearchStudentsForReservation;
window.technicianStudentDropdownKeyHandler = technicianStudentDropdownKeyHandler;
window.searchDropdownKeyHandler = searchDropdownKeyHandler;