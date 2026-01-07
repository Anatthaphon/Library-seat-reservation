<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Weekly Calendar - Full Integration</title>
  <style>
    :root {
      --bg: #0b0f17;
      --card-bg: #ffffff;
      --text: #111827;
      --muted: #64748b;
      --line: rgba(148,163,184,0.15);
      --accent: #2f7cff;
      --hour-h: 70px;
      --time-col: 70px;
      --day-h: 60px;

      /* Colors by Day */
      --color-0: #ef4444; /* Sunday */
      --color-1: #facc15; /* Monday */
      --color-2: #f472b6; /* Tuesday */
      --color-3: #22c55e; /* Wednesday */
      --color-4: #fb923c; /* Thursday */
      --color-5: #3b82f6; /* Friday */
      --color-6: #a855f7; /* Saturday */
    }

    * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { background: var(--bg); margin: 0; padding: 20px; color: var(--text); overflow: hidden; }

    .frame {
      width: 100%;
      max-width: 1200px;
      height: calc(100vh - 40px);
      margin: 0 auto;
      background: var(--card-bg);
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
    }

    .topbar {
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--line);
    }

    .range-title { font-size: 18px; font-weight: 800; color: #1e293b; }

    .grid-container {
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns: var(--time-col) repeat(7, 1fr);
      grid-template-rows: var(--day-h) repeat(8, var(--hour-h));
    }

    .header-cell {
      position: sticky; top: 0; background: #fff; z-index: 10;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border-bottom: 1px solid var(--line); border-right: 1px solid var(--line);
      font-size: 13px; font-weight: 700;
    }

    .time-cell {
      display: flex; align-items: flex-start; justify-content: center;
      padding-top: 10px; color: var(--muted); font-size: 12px; font-weight: 600;
      border-right: 1px solid var(--line); border-bottom: 1px solid var(--line);
    }

    .cell {
      background: #fff; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line);
      cursor: pointer; position: relative;
    }

    .cell:hover { background: #f8fafc; }

    .disabled-cell {
      background: #f1f5f9 !important;
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Event Box Styling */
    .event-box {
      position: absolute;
      top: 2px; left: 2px; right: 2px;
      border-radius: 8px;
      padding: 10px;
      font-size: 12px;
      font-weight: 700;
      z-index: 5;
      border-left: 4px solid currentColor;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transition: transform 0.2s;
    }

    .cell.active-event .event-box {
      transform: scale(0.98);
      outline: 2px solid var(--accent);
    }

    .duration-1 { height: calc(var(--hour-h) - 4px); }
    .duration-2 { height: calc((var(--hour-h) * 2) - 4px); }
    .duration-3 { height: calc((var(--hour-h) * 3) - 4px); }

    /* Custom Popup Overlay */
    #popup-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
      display: none; align-items: center; justify-content: center; z-index: 200;
    }

    .popup-content {
      background: white; width: 400px; padding: 30px; border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    .popup-content h3 { margin-top: 0; font-size: 20px; }
    .popup-content input, .popup-content select {
      width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px;
    }

    .popup-btns { display: flex; gap: 10px; margin-top: 20px; }
    .btn { flex: 1; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }
    .btn-save { background: var(--accent); color: white; }
    .btn-cancel { background: #f1f5f9; color: #64748b; }

    /* Reserve Button at Bottom Right of Screen */
    #global-reserve-btn {
      position: fixed;
      right: 40px;
      bottom: 40px;
      background: var(--accent);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 800;
      box-shadow: 0 10px 25px rgba(47, 124, 255, 0.4);
      cursor: pointer;
      display: none;
      z-index: 100;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .toast {
      position: fixed; left: 50%; bottom: 40px; transform: translateX(-50%);
      background: #1e293b; color: white; padding: 12px 24px; border-radius: 12px;
      font-size: 14px; font-weight: 600; opacity: 0; transition: 0.3s; z-index: 1000;
    }
  </style>
</head>
<body>

  <div class="frame">
    <div class="topbar">
      <div id="range-text" class="range-title">Loading...</div>
      <div style="font-size: 12px; color: var(--muted);">Click to Add/Edit | Single click color box to Reserve</div>
    </div>
    <div id="calendar-grid" class="grid-container"></div>
  </div>

  <!-- Custom Popup Structure (เพื่อแก้ปัญหาเด้ง prompt ขาวๆ) -->
  <div id="popup-overlay">
    <div class="popup-content">
      <h3 id="popup-title">Add New Plan</h3>
      <label>Plan Name</label>
      <input type="text" id="input-plan-name" placeholder="e.g. Meeting with CEO">
      <label>Duration (Hours)</label>
      <select id="input-duration">
        <option value="1">1 Hour</option>
        <option value="2">2 Hours</option>
        <option value="3">3 Hours</option>
      </select>
      <div class="popup-btns">
        <button class="btn btn-cancel" onclick="closePopup()">Cancel</button>
        <button class="btn btn-save" onclick="handleSave()">Save Plan</button>
      </div>
    </div>
  </div>

  <button id="global-reserve-btn">Confirm Reservation</button>
  <div id="toast" class="toast"></div>

  <script>
    const START_HOUR = 9;
    const END_HOUR = 16;
    const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    let events = {}; 
    let selectedCellId = null;
    let activeEditId = null;

    function init() {
      renderCalendar();
      setupReserveBtn();
    }

    function renderCalendar() {
      const grid = document.getElementById('calendar-grid');
      grid.innerHTML = '';
      
      const now = new Date();
      const allowedDates = [0, 1, 2].map(i => {
        const d = new Date(); d.setDate(now.getDate() + i);
        return d.toISOString().split('T')[0];
      });

      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      grid.appendChild(createDiv('', 'header-cell')); 
      for(let i=0; i<7; i++) {
        const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i);
        const h = createDiv('', 'header-cell');
        h.innerHTML = `<span style="opacity:0.6; font-size:10px">${DOW[d.getDay()].toUpperCase()}</span><span>${d.getDate()}</span>`;
        grid.appendChild(h);
      }

      for(let h=0; h <= (END_HOUR - START_HOUR); h++) {
        const hour = START_HOUR + h;
        grid.appendChild(createDiv(hour.toString().padStart(2, '0') + ':00', 'time-cell'));

        for(let d=0; d<7; d++) {
          const date = new Date(startOfWeek); date.setDate(startOfWeek.getDate() + d);
          const dateStr = date.toISOString().split('T')[0];
          const cellId = `${dateStr}-${hour}`;
          const cell = createDiv('', 'cell');
          cell.id = cellId;

          if (!allowedDates.includes(dateStr)) {
            cell.classList.add('disabled-cell');
          } else {
            if (events[cellId]) renderEventBox(cell, events[cellId], date.getDay());

            let clickTimer = null;
            cell.onclick = (e) => {
              if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                openPopup(cellId, events[cellId]);
              } else {
                clickTimer = setTimeout(() => {
                  clickTimer = null;
                  handleSingleClick(cellId);
                }, 250);
              }
            };
          }
          grid.appendChild(cell);
        }
      }

      const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
      document.getElementById('range-text').textContent = 
        `${startOfWeek.toLocaleDateString('en-US', {month:'short', day:'numeric'})} - ${endOfWeek.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}`;
    }

    function handleSingleClick(id) {
      const btn = document.getElementById('global-reserve-btn');
      document.querySelectorAll('.cell').forEach(c => c.classList.remove('active-event'));

      if (events[id]) {
        selectedCellId = id;
        document.getElementById(id).classList.add('active-event');
        btn.style.display = 'block';
      } else {
        btn.style.display = 'none';
        openPopup(id);
      }
    }

    function renderEventBox(parent, data, dayIndex) {
      const box = document.createElement('div');
      box.className = `event-box duration-${data.duration}`;
      const baseColor = getComputedStyle(document.documentElement).getPropertyValue(`--color-${dayIndex}`).trim();
      box.style.color = baseColor;
      box.style.backgroundColor = `rgba(${hexToRgb(baseColor)}, 0.12)`;
      box.innerHTML = `<div style="color:#1e293b">${data.title}</div><div style="font-size:10px; opacity:0.7">${data.duration} hr</div>`;
      parent.appendChild(box);
    }

    // --- Popup Control Functions ---
    function openPopup(id, existingData = null) {
      activeEditId = id;
      document.getElementById('popup-overlay').style.display = 'flex';
      document.getElementById('popup-title').textContent = existingData ? "Edit Plan" : "Add New Plan";
      document.getElementById('input-plan-name').value = existingData ? existingData.title : "";
      document.getElementById('input-duration').value = existingData ? existingData.duration : "1";
    }

    function closePopup() {
      document.getElementById('popup-overlay').style.display = 'none';
    }

    function handleSave() {
      const title = document.getElementById('input-plan-name').value;
      const duration = document.getElementById('input-duration').value;
      if (!title) return showToast("Please enter a plan name");
      
      events[activeEditId] = { title, duration: parseInt(duration) };
      renderCalendar();
      closePopup();
      showToast("Plan Saved Successfully");
    }

    function setupReserveBtn() {
      const btn = document.getElementById('global-reserve-btn');
      btn.onclick = () => {
        showToast(`Confirmed Reservation for: ${events[selectedCellId].title}`);
        btn.style.display = 'none';
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('active-event'));
      };
    }

    function createDiv(text, className) {
      const el = document.createElement('div');
      el.className = className;
      el.textContent = text;
      return el;
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.opacity = '1';
      setTimeout(() => t.style.opacity = '0', 2500);
    }

    function hexToRgb(hex) {
      let r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    }

    window.onload = init;
  </script>
</body>
</html>