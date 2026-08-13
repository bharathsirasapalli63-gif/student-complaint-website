/* =========================================================
   UNIVERSITY STUDENT COMPLAINT WEBSITE - APPLICATION LOGIC
   Core App State, Auth, Profile, Complaint Feeds, Canvas Charts,
   Date Range Filter, Working Staff Portal, Dual Notifications & CSV Export
   ========================================================= */

// Application State
let state = {
  currentUser: null,       // Student, Admin, or Working Staff object
  currentRole: 'student',  // 'student', 'admin', or 'staff'
  currentView: 'my',       // 'my', 'all', or 'staff'
  selectedCategory: 'all',
  selectedStatus: 'all',
  selectedPriority: 'all',
  selectedDateRange: 'all', // 'all', 'today', 'week', 'month'
  searchQuery: '',
  complaints: [],
  notifications: [],
  selectedComplaint: null,
  votedComplaintIds: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupEventListeners();
});

function loadStoredData() {
  const storedComplaints = localStorage.getItem('univ_complaints');
  if (storedComplaints) {
    try { state.complaints = JSON.parse(storedComplaints); } catch(e) { state.complaints = [...MOCK_DATA.complaints]; }
  } else {
    state.complaints = [...MOCK_DATA.complaints];
    saveToLocalStorage();
  }

  const storedNotifs = localStorage.getItem('univ_notifications');
  if (storedNotifs) {
    try { state.notifications = JSON.parse(storedNotifs); } catch(e) { state.notifications = []; }
  } else {
    state.notifications = [
      {
        id: 'NTF-101',
        rollNo: '21A91A0501',
        title: '✅ Complaint Accepted by Dean',
        text: 'Admin Dr. S. R. Varma accepted complaint CMP-2026-091 ("Hygiene & Water Quality issue"). Assigned to staff Vikas Singh.',
        time: 'Aug 09, 05:00 PM',
        unread: true,
        complaintId: 'CMP-2026-091'
      }
    ];
    localStorage.setItem('univ_notifications', JSON.stringify(state.notifications));
  }

  const storedVotes = localStorage.getItem('univ_user_votes');
  if (storedVotes) {
    try { state.votedComplaintIds = JSON.parse(storedVotes); } catch(e) {}
  }
}

function saveToLocalStorage() {
  localStorage.setItem('univ_complaints', JSON.stringify(state.complaints));
  localStorage.setItem('univ_notifications', JSON.stringify(state.notifications));
  localStorage.setItem('univ_user_votes', JSON.stringify(state.votedComplaintIds));
}


/* =========================================================
   1. AUTHENTICATION & ROLE SWITCHING (RBAC)
   ========================================================= */

function setRole(role) {
  state.currentRole = role;
  const studentBtn = document.getElementById('role-student-btn');
  const adminBtn = document.getElementById('role-admin-btn');
  const staffBtn = document.getElementById('role-staff-btn');

  const rollGroup = document.getElementById('group-rollno');
  const adminGroup = document.getElementById('group-adminid');
  const staffGroup = document.getElementById('group-staffid');

  studentBtn.classList.remove('active');
  adminBtn.classList.remove('active');
  staffBtn.classList.remove('active');

  rollGroup.classList.add('hidden');
  adminGroup.classList.add('hidden');
  staffGroup.classList.add('hidden');

  if (role === 'student') {
    studentBtn.classList.add('active');
    rollGroup.classList.remove('hidden');
  } else if (role === 'admin') {
    adminBtn.classList.add('active');
    adminGroup.classList.remove('hidden');
  } else if (role === 'staff') {
    staffBtn.classList.add('active');
    staffGroup.classList.remove('hidden');
  }
}

function quickFill(id, role) {
  setRole(role);
  if (role === 'student') {
    document.getElementById('input-rollno').value = id;
    document.getElementById('input-password').value = 'password123';
  } else if (role === 'admin') {
    document.getElementById('input-adminid').value = id;
    document.getElementById('input-password').value = 'admin123';
  } else if (role === 'staff') {
    document.getElementById('input-staffid').value = id;
    document.getElementById('input-password').value = 'staff123';
  }
  showToast(`Credentials set for ${id}. Click Login.`, 'info');
}

function handleLogin(event) {
  event.preventDefault();
  
  if (state.currentRole === 'student') {
    const rollNo = document.getElementById('input-rollno').value.trim().toUpperCase();
    const student = MOCK_DATA.students[rollNo] || {
      rollNo: rollNo,
      name: `Student (${rollNo})`,
      department: "Engineering & Technology",
      year: "3rd Year",
      email: `${rollNo.toLowerCase()}@vignan.ac.in`,
      phone: "+91 98765 00000",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${rollNo}`
    };
    
    state.currentUser = student;
    state.currentView = 'my';
    showToast(`Welcome back, ${student.name} (${student.rollNo})!`, 'success');

  } else if (state.currentRole === 'admin') {
    const adminId = document.getElementById('input-adminid').value.trim().toUpperCase() || 'ADMIN01';
    const admin = MOCK_DATA.admins[adminId] || MOCK_DATA.admins['ADMIN01'];

    state.currentUser = admin;
    state.currentView = 'all';
    showToast(`Logged in as Admin: ${admin.name}`, 'warning');

  } else if (state.currentRole === 'staff') {
    const staffId = document.getElementById('input-staffid').value.trim().toUpperCase() || 'STAFF_IT';
    const staff = MOCK_DATA.workingStaff[staffId] || MOCK_DATA.workingStaff['STAFF_IT'];

    state.currentUser = staff;
    state.currentView = 'staff'; // WORKING STAFF PORTAL DEFAULT VIEW
    showToast(`Working Staff Portal: Logged in as ${staff.name} (${staff.specialization})`, 'info');
  }

  // Render Portal Interface
  document.getElementById('login-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  
  renderProfileCard();
  updatePortalUI();
  renderComplaints();
}

function handleLogout() {
  state.currentUser = null;
  document.getElementById('app-screen').classList.remove('active');
  document.getElementById('login-screen').classList.add('active');
  showToast('Logged out successfully.', 'info');
}


/* =========================================================
   2. PROFILE & PORTAL UI RENDERING
   ========================================================= */

function renderProfileCard() {
  const u = state.currentUser;
  const roleBadge = document.getElementById('role-badge-display');
  const addBtn = document.getElementById('btn-open-add-complaint');
  const exportBtn = document.getElementById('btn-export-csv');
  const staffTab = document.getElementById('tab-staff-assigned');
  const myTab = document.getElementById('tab-my-complaints');
  const allTab = document.getElementById('tab-all-complaints');
  const analyticsContainer = document.getElementById('admin-analytics-container');

  if (state.currentRole === 'admin') {
    roleBadge.className = 'badge badge-admin';
    roleBadge.innerHTML = `<i class="fa-solid fa-user-gear"></i> Admin Portal`;
    
    document.getElementById('user-name').innerText = u.name;
    document.getElementById('user-rollno').innerText = u.id || 'ADMIN01';
    document.getElementById('user-dept').innerText = u.designation || 'Grievance Cell';
    document.getElementById('user-year').innerText = u.role || 'Super Admin';
    document.getElementById('user-email').innerText = u.email;
    document.getElementById('user-avatar').src = u.avatar;
    document.getElementById('row-user-phone').style.display = 'none';

    addBtn.classList.add('hidden');
    exportBtn.classList.remove('hidden');
    staffTab.classList.add('hidden');
    myTab.classList.remove('hidden');
    allTab.classList.remove('hidden');
    analyticsContainer.classList.remove('hidden');
    document.getElementById('categories-sidebar-widget').classList.remove('hidden');

  } else if (state.currentRole === 'staff') {
    roleBadge.className = 'badge badge-staff';
    roleBadge.innerHTML = `<i class="fa-solid fa-screwdriver-wrench"></i> Working Staff`;

    document.getElementById('user-name').innerText = u.name;
    document.getElementById('user-rollno').innerText = u.id;
    document.getElementById('user-dept').innerText = u.department;
    document.getElementById('user-year').innerText = u.specialization;
    document.getElementById('user-email').innerText = `${u.id.toLowerCase()}@vignan.ac.in`;
    document.getElementById('user-phone').innerText = u.phone;
    document.getElementById('user-avatar').src = u.avatar;

    addBtn.classList.add('hidden');
    exportBtn.classList.add('hidden');
    staffTab.classList.remove('hidden');
    myTab.classList.add('hidden');
    allTab.classList.remove('hidden');
    analyticsContainer.classList.add('hidden');
    document.getElementById('categories-sidebar-widget').classList.add('hidden');

  } else {
    // Student Role
    roleBadge.className = 'badge badge-student';
    roleBadge.innerHTML = `<i class="fa-solid fa-user-graduate"></i> Student Portal`;

    document.getElementById('user-name').innerText = u.name;
    document.getElementById('user-rollno').innerText = u.rollNo;
    document.getElementById('user-dept').innerText = u.department;
    document.getElementById('user-year').innerText = u.year;
    document.getElementById('user-email').innerText = u.email;
    document.getElementById('user-phone').innerText = u.phone;
    document.getElementById('user-avatar').src = u.avatar;
    document.getElementById('row-user-phone').style.display = 'flex';

    addBtn.classList.remove('hidden');
    exportBtn.classList.add('hidden');
    staffTab.classList.add('hidden');
    myTab.classList.remove('hidden');
    allTab.classList.remove('hidden');
    analyticsContainer.classList.add('hidden');
    document.getElementById('categories-sidebar-widget').classList.remove('hidden');
  }

  updateProfileCounts();
}

function updateProfileCounts() {
  if (state.currentRole === 'student') {
    const myComplaints = state.complaints.filter(c => c.rollNo === state.currentUser.rollNo);
    const myInProgress = myComplaints.filter(c => c.status === 'In Progress' || c.status === 'Under Investigation');
    
    document.getElementById('user-my-complaints-count').innerText = myComplaints.length;
    document.getElementById('user-in-progress-count').innerText = myInProgress.length;
    document.getElementById('my-count').innerText = myComplaints.length;
    document.getElementById('user-my-complaints-lbl').innerText = "My Complaints";

  } else if (state.currentRole === 'staff') {
    // RESTRICTED: Assigned ONLY to logged in Working Staff!
    const assignedToStaff = state.complaints.filter(c => c.assignedStaffId === state.currentUser.id);
    const staffInProgress = assignedToStaff.filter(c => c.status !== 'Resolved');

    document.getElementById('user-my-complaints-count').innerText = assignedToStaff.length;
    document.getElementById('user-in-progress-count').innerText = staffInProgress.length;
    document.getElementById('staff-assigned-count').innerText = assignedToStaff.length;
    document.getElementById('user-my-complaints-lbl').innerText = "Assigned Tasks";

  } else {
    // Admin
    document.getElementById('user-my-complaints-count').innerText = state.complaints.length;
    document.getElementById('user-in-progress-count').innerText = state.complaints.filter(c => c.status !== 'Resolved').length;
    document.getElementById('my-count').innerText = state.complaints.length;
    document.getElementById('user-my-complaints-lbl').innerText = "Total Campus Tickets";
  }

  document.getElementById('all-count').innerText = state.complaints.length;
}

function updatePortalUI() {
  const u = state.currentUser;
  const greeting = document.getElementById('dash-greeting');
  const subtitle = document.getElementById('dash-subtitle');
  
  if (state.currentRole === 'admin') {
    greeting.innerText = `Admin Control Center - ${u.name}`;
    subtitle.innerText = `Vignan University-wide complaint monitoring, graphical analytics, ticket routing, and SLA compliance.`;
  } else if (state.currentRole === 'staff') {
    greeting.innerText = `Working Staff Portal - ${u.name}`;
    subtitle.innerText = `View and resolve complaints specifically assigned to you. Upload resolution proof to notify Student & Admin.`;
  } else {
    greeting.innerText = `Welcome back, ${u.name.split(' ')[0]}! 👋`;
    subtitle.innerText = `Track your filed grievances, monitor live resolution progress, or register a new campus concern.`;
  }

  // Filter complaints based on Date Range Selector (Section A)
  let filteredList = filterByDateRange([...state.complaints], state.selectedDateRange);

  const total = filteredList.length;
  const progress = filteredList.filter(c => c.status === 'In Progress' || c.status === 'Under Investigation' || c.status === 'Assigned').length;
  const resolved = filteredList.filter(c => c.status === 'Resolved').length;
  const overdue = filteredList.filter(c => c.isSlaOverdue || c.slaDaysRemaining < 0).length;

  document.getElementById('stat-total').innerText = total;
  document.getElementById('stat-progress').innerText = progress;
  document.getElementById('stat-resolved').innerText = resolved;
  document.getElementById('stat-urgent').innerText = overdue;

  // Render Charts if Admin
  if (state.currentRole === 'admin') {
    renderGraphicalCharts(filteredList);
  }

  renderDashboardProgress();
  renderNotifications();
}

function handleDateRangeChange() {
  state.selectedDateRange = document.getElementById('date-range-select').value;
  updatePortalUI();
  renderComplaints();
}

function filterByDateRange(list, range) {
  if (range === 'all') return list;
  const now = new Date();
  
  return list.filter(c => {
    const cDate = new Date(c.submittedDateIso || Date.now());
    if (range === 'today') {
      return cDate.toDateString() === now.toDateString();
    } else if (range === 'week') {
      const diffTime = Math.abs(now - cDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    } else if (range === 'month') {
      return cDate.getMonth() === now.getMonth() && cDate.getFullYear() === now.getFullYear();
    }
    return true;
  });
}


/* =========================================================
   3. SECTION A: GRAPHICAL REPORTS (HTML5 CANVAS CHARTS)
   ========================================================= */

function renderGraphicalCharts(dataList) {
  drawCategoryBarChart(dataList);
  drawStatusPieChart(dataList);
}

function drawCategoryBarChart(dataList) {
  const canvas = document.getElementById('chart-category-bar');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const categories = ['Academic', 'Infrastructure', 'Hostel & Mess', 'Exam Cell', 'Finance & Fees'];
  const counts = categories.map(cat => dataList.filter(c => c.category === cat).length);
  const maxCount = Math.max(...counts, 4);

  const barWidth = 40;
  const startX = 50;
  const startY = 180;
  const chartHeight = 140;

  // Draw Y Axis gridlines
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= maxCount; i += 2) {
    const y = startY - (i / maxCount) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(380, y);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '10px Plus Jakarta Sans';
    ctx.fillText(i, 20, y + 3);
  }

  // Draw Bars
  const colors = ['#1E3B2B', '#E6AA38', '#0284C7', '#7E22CE', '#DC2626'];
  categories.forEach((cat, idx) => {
    const count = counts[idx];
    const barH = (count / maxCount) * chartHeight;
    const x = startX + idx * 65;
    const y = startY - barH;

    // Bar Fill
    ctx.fillStyle = colors[idx % colors.length];
    ctx.fillRect(x, y, barWidth, barH);

    // Value Label on Top
    ctx.fillStyle = '#163022';
    ctx.font = 'bold 11px Plus Jakarta Sans';
    ctx.fillText(count, x + 15, y - 4);

    // Category Label
    ctx.fillStyle = '#475569';
    ctx.font = '9px Plus Jakarta Sans';
    const shortName = cat.split(' ')[0];
    ctx.fillText(shortName, x + 4, startY + 14);
  });
}

function drawStatusPieChart(dataList) {
  const canvas = document.getElementById('chart-status-pie');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const statuses = ['Received', 'Assigned', 'Under Investigation', 'In Progress', 'Resolved'];
  const counts = statuses.map(st => dataList.filter(c => c.status === st).length);
  const total = counts.reduce((a, b) => a + b, 0) || 1;

  const colors = ['#FEF3C7', '#E0F2FE', '#F3E8FF', '#DBEAFE', '#DCFCE7'];
  const borderColors = ['#B45309', '#0369A1', '#7E22CE', '#1D4ED8', '#15803D'];

  const centerX = 120;
  const centerY = 110;
  const radius = 80;
  let startAngle = 0;

  statuses.forEach((st, idx) => {
    const sliceAngle = (counts[idx] / total) * 2 * Math.PI;
    if (counts[idx] > 0) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = colors[idx];
      ctx.fill();
      ctx.strokeStyle = borderColors[idx];
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    startAngle += sliceAngle;
  });

  // Legend
  const legendX = 230;
  let legendY = 35;
  statuses.forEach((st, idx) => {
    ctx.fillStyle = colors[idx];
    ctx.fillRect(legendX, legendY, 14, 14);
    ctx.strokeStyle = borderColors[idx];
    ctx.strokeRect(legendX, legendY, 14, 14);

    ctx.fillStyle = '#1E293B';
    ctx.font = '11px Plus Jakarta Sans';
    const pct = Math.round((counts[idx] / total) * 100);
    ctx.fillText(`${st} (${counts[idx]} - ${pct}%)`, legendX + 22, legendY + 11);

    legendY += 28;
  });
}


/* =========================================================
   4. COMPLAINT PROGRESS & DASHBOARD WIDGET
   ========================================================= */

function renderDashboardProgress() {
  const container = document.getElementById('dash-progress-cards-list');
  let list = [...state.complaints];

  if (state.currentRole === 'student') {
    list = list.filter(c => c.rollNo === state.currentUser.rollNo);
  } else if (state.currentRole === 'staff') {
    // RESTRICTED: Working Staff sees ONLY assigned complaints!
    list = list.filter(c => c.assignedStaffId === state.currentUser.id);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="dash-progress-card text-center" style="padding: 20px;">
        <i class="fa-solid fa-clock-rotate-left" style="font-size: 28px; color: var(--text-light); margin-bottom: 6px;"></i>
        <h4 style="font-size: 14px;">No Active Complaint Progress Records</h4>
        <p style="color: var(--text-muted); font-size: 12px;">Step-by-step resolution progress will appear here in real time.</p>
      </div>
    `;
    return;
  }

  const stages = [
    { num: 1, label: "Received" },
    { num: 2, label: "Assigned" },
    { num: 3, label: "Investigating" },
    { num: 4, label: "In Progress" },
    { num: 5, label: "Resolved" }
  ];

  container.innerHTML = list.slice(0, 3).map(c => {
    const statusClass = `status-${c.status.replace(/\s+/g, '-')}`;
    const latestRemark = c.timeline && c.timeline.length > 0 ? c.timeline[0].desc : "Grievance registered and assigned for review.";
    const slaBadgeClass = c.slaDaysRemaining < 3 ? 'sla-red' : (c.slaDaysRemaining < 10 ? 'sla-amber' : 'sla-green');

    // Generate inline stepper HTML
    const stepperHTML = stages.map((st, idx) => {
      const isDone = st.num < c.stage;
      const isActive = st.num === c.stage;
      const stepClass = isDone ? 'done' : (isActive ? 'active' : '');
      const connectorDone = isDone ? 'done' : '';

      const stepItem = `
        <div class="inline-step ${stepClass}">
          <span class="inline-step-num">${isDone ? '<i class="fa-solid fa-check"></i>' : st.num}</span>
          <span>${st.label}</span>
        </div>
      `;

      if (idx < stages.length - 1) {
        return `${stepItem}<div class="inline-step-connector ${connectorDone}"></div>`;
      }
      return stepItem;
    }).join('');

    return `
      <div class="dash-progress-card">
        <div class="dash-card-header">
          <div>
            <span class="category-badge"><i class="fa-solid fa-tag"></i> ${c.category}</span>
            <h4 class="dash-card-title" style="margin-top: 6px;">${escapeHTML(c.title)}</h4>
            <div class="dash-card-meta">
              <span><i class="fa-solid fa-barcode"></i> ${c.id}</span>
              <span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(c.location)}</span>
              <span><i class="fa-solid fa-user-gear"></i> ${escapeHTML(c.assignedStaffName || c.officer)}</span>
              <span class="sla-badge ${slaBadgeClass}"><i class="fa-solid fa-clock"></i> SLA: ${c.slaDaysRemaining} Days Left</span>
            </div>
          </div>
          <span class="status-badge ${statusClass}">
            <i class="fa-solid fa-spinner fa-spin-pulse"></i> ${c.status} (Stage ${c.stage}/5)
          </span>
        </div>

        <div class="dash-stepper-inline">
          ${stepperHTML}
        </div>

        <div class="dash-officer-box">
          <div class="officer-note">
            <strong><i class="fa-solid fa-comment-dots"></i> Latest Action Note:</strong> "${escapeHTML(latestRemark)}"
          </div>
          <div style="display: flex; gap: 8px;">
            ${state.currentRole === 'staff' ? `
              <button class="btn btn-primary btn-sm" onclick="openStaffResolutionModal('${c.id}')">
                <i class="fa-solid fa-screwdriver-wrench"></i> Complete Work Order
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm" onclick="openProgressTrackerModal('${c.id}')">
                <i class="fa-solid fa-magnifying-glass-plus"></i> View Timeline & Chat
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}


/* =========================================================
   5. COMPLAINTS LIST FEED & RESTRICTED WORKING STAFF VIEW
   ========================================================= */

function switchView(view) {
  state.currentView = view;
  document.getElementById('tab-my-complaints').classList.toggle('active', view === 'my');
  document.getElementById('tab-all-complaints').classList.toggle('active', view === 'all');
  document.getElementById('tab-staff-assigned').classList.toggle('active', view === 'staff');
  renderComplaints();
}

function filterByCategory(category, btnElement) {
  state.selectedCategory = category;
  document.querySelectorAll('.cat-item').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  renderComplaints();
}

function handleSearch() {
  state.searchQuery = document.getElementById('search-input').value.trim().toLowerCase();
  renderComplaints();
}

function applyFilters() {
  state.selectedStatus = document.getElementById('filter-status').value;
  state.selectedPriority = document.getElementById('filter-priority').value;
  renderComplaints();
}

function renderComplaints() {
  const container = document.getElementById('complaints-list');
  let list = filterByDateRange([...state.complaints], state.selectedDateRange);

  // RBAC & View Filter
  if (state.currentRole === 'student') {
    if (state.currentView === 'my') {
      list = list.filter(c => c.rollNo === state.currentUser.rollNo);
    }
  } else if (state.currentRole === 'staff') {
    // CRITICAL REQUIREMENT: Working staff sees ONLY complaints assigned to them!
    if (state.currentView === 'staff' || state.currentView === 'my') {
      list = list.filter(c => c.assignedStaffId === state.currentUser.id);
    }
  }

  // Filter Category, Status, Priority, Search
  if (state.selectedCategory !== 'all') list = list.filter(c => c.category === state.selectedCategory);
  if (state.selectedStatus !== 'all') list = list.filter(c => c.status === state.selectedStatus);
  if (state.selectedPriority !== 'all') list = list.filter(c => c.priority === state.selectedPriority);

  if (state.searchQuery) {
    list = list.filter(c => 
      c.id.toLowerCase().includes(state.searchQuery) ||
      c.title.toLowerCase().includes(state.searchQuery) ||
      c.rollNo.toLowerCase().includes(state.searchQuery) ||
      c.description.toLowerCase().includes(state.searchQuery) ||
      c.location.toLowerCase().includes(state.searchQuery)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="widget-card text-center" style="padding: 40px;">
        <i class="fa-solid fa-folder-open" style="font-size: 44px; color: var(--text-light); margin-bottom: 10px;"></i>
        <h3>No complaint records found matching your filters</h3>
        <p style="color: var(--text-muted); font-size: 13px;">Adjust your search or check your assigned tasks.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(c => {
    const isVoted = state.votedComplaintIds.includes(c.id);
    const statusClass = `status-${c.status.replace(/\s+/g, '-')}`;
    const slaBadgeClass = c.slaDaysRemaining < 3 ? 'sla-red' : (c.slaDaysRemaining < 10 ? 'sla-amber' : 'sla-green');

    return `
      <div class="complaint-card" id="card-${c.id}">
        <div class="card-top">
          <span class="category-badge"><i class="fa-solid fa-tag"></i> ${c.category}</span>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="sla-badge ${slaBadgeClass}">
              <i class="fa-solid fa-hourglass-half"></i> ${c.slaDaysRemaining < 0 ? 'OVERDUE SLA BREACH' : `SLA: ${c.slaDaysRemaining} Days Left`}
            </span>
            <span class="status-badge ${statusClass}">
              <i class="fa-solid fa-clock-rotate-left"></i> ${c.status} (${c.stage}/5)
            </span>
          </div>
        </div>

        <h3 class="complaint-title">${escapeHTML(c.title)}</h3>
        <p class="complaint-desc">${escapeHTML(c.description)}</p>

        ${c.status !== 'Received' ? `
          <div class="admin-accepted-banner">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <strong>Complaint Accepted & Assigned!</strong>
              <div>Assigned Staff: <em>${escapeHTML(c.assignedStaffName || c.officer)}</em>. Resolution stage updated to <strong>${c.status}</strong>.</div>
            </div>
          </div>
        ` : ''}

        <div class="card-meta-bar" style="margin-top: 12px;">
          <span><i class="fa-solid fa-barcode"></i> Ticket ID: <strong>${c.id}</strong></span>
          <span><i class="fa-solid fa-id-card"></i> Student: <strong>${c.rollNo}</strong> (${c.studentName})</span>
          <span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(c.location)}</span>
          <span><i class="fa-solid fa-calendar-day"></i> ${c.date}</span>
          <span><i class="fa-solid fa-flag"></i> ${c.priority} Priority</span>
        </div>

        <div class="card-bottom-actions">
          <button class="btn-upvote ${isVoted ? 'voted' : ''}" onclick="toggleUpvote('${c.id}')">
            <i class="fa-solid fa-thumbs-up"></i> Upvote (${c.upvotes})
          </button>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" onclick="openProgressTrackerModal('${c.id}')">
              <i class="fa-solid fa-chart-line"></i> Timeline & Notes
            </button>
            
            ${state.currentRole === 'admin' ? `
              <button class="btn btn-primary btn-sm" onclick="openAdminActionModal('${c.id}')">
                <i class="fa-solid fa-user-gear"></i> Route & Assign
              </button>
            ` : ''}

            ${state.currentRole === 'staff' ? `
              <button class="btn btn-primary btn-sm" onclick="openStaffResolutionModal('${c.id}')">
                <i class="fa-solid fa-screwdriver-wrench"></i> Complete & Upload Proof
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}


/* =========================================================
   6. DUAL NOTIFICATIONS ON STAFF RESOLUTION (CRITICAL FEATURE)
   ========================================================= */

function openStaffResolutionModal(complaintId) {
  const c = state.complaints.find(comp => comp.id === complaintId);
  if (!c) return;

  state.selectedComplaint = c;
  document.getElementById('staff-target-id').innerText = c.id;
  document.getElementById('staff-status-select').value = 'Resolved';
  document.getElementById('staff-remarks-text').value = `Replaced faulty components and tested system. Work completed successfully.`;
  openModal('modal-staff-resolution');
}

function submitStaffResolution(event) {
  event.preventDefault();
  const c = state.selectedComplaint;
  if (!c) return;

  const newStatus = document.getElementById('staff-status-select').value;
  const proofUrl = document.getElementById('staff-proof-url').value.trim();
  const remarks = document.getElementById('staff-remarks-text').value.trim();
  const now = new Date();
  const timeStr = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  c.status = newStatus;
  c.resolutionProof = proofUrl;

  if (newStatus === 'Resolved') c.stage = 5;
  else if (newStatus === 'In Progress') c.stage = 4;
  else if (newStatus === 'Under Investigation') c.stage = 3;

  // Add timeline entry
  c.timeline.unshift({
    title: `Work Completed & Resolved by Staff (${state.currentUser.name})`,
    time: timeStr,
    desc: `Resolution Summary: "${remarks}"`
  });

  // Add internal note
  if (!c.internalNotes) c.internalNotes = [];
  c.internalNotes.unshift({
    author: `${state.currentUser.name} (Working Staff)`,
    time: timeStr,
    text: `Work completed. Resolution proof attached: ${proofUrl}`
  });

  saveToLocalStorage();
  updatePortalUI();
  renderComplaints();
  closeModal('modal-staff-resolution');

  // CRITICAL REQUIREMENT: Send dual automated notifications to BOTH Student AND Admin!
  const notifToStudent = {
    id: `NTF-STU-${Date.now()}`,
    rollNo: c.rollNo,
    title: `🎉 Grievance Resolved by Staff!`,
    text: `Working Staff ${state.currentUser.name} completed repair work on Ticket ${c.id} ("${c.title}"). Resolution proof photo attached.`,
    time: timeStr,
    unread: true,
    complaintId: c.id
  };

  const notifToAdmin = {
    id: `NTF-ADM-${Date.now()}`,
    rollNo: 'ADMIN01',
    title: `✅ Staff Task Completed (${c.id})`,
    text: `Staff ${state.currentUser.name} resolved complaint ${c.id} for student ${c.rollNo}. Status updated to ${newStatus}.`,
    time: timeStr,
    unread: true,
    complaintId: c.id
  };

  if (!state.notifications) state.notifications = [];
  state.notifications.unshift(notifToStudent);
  state.notifications.unshift(notifToAdmin);
  localStorage.setItem('univ_notifications', JSON.stringify(state.notifications));
  renderNotifications();

  showToast(`Task ${c.id} resolved! Dual notification sent to Student & Admin.`, 'success');
}


/* =========================================================
   7. AI SMART WORKER SUGGESTION ENGINE & ADMIN ROUTING
   ========================================================= */

function getAISmartRecommendation(c) {
  if (!c) return null;

  const category = (c.category || '').toLowerCase();
  const text = `${c.title} ${c.description} ${c.location} ${c.subcat}`.toLowerCase();

  let recStaffId = "STAFF_IT";
  let recName = "Anil Kumar (IT Specialist)";
  let reason = "Matched category 'Infrastructure' and network keywords.";
  let confidence = "98%";

  // Count current workload for each staff
  const getWorkload = (staffId) => state.complaints.filter(item => item.assignedStaffId === staffId && item.status !== 'Resolved').length;

  if (category.includes('hostel') || category.includes('mess') || text.includes('water') || text.includes('food') || text.includes('hygiene') || text.includes('ro')) {
    recStaffId = "STAFF_HOSTEL";
    recName = "Vikas Singh (Hostel Supervisor)";
    const load = getWorkload('STAFF_HOSTEL');
    reason = `Matched category 'Hostel & Mess' & sanitation keywords. Current Workload: ${load} Active Tasks.`;
    confidence = "97%";

  } else if (category.includes('infrastructure') && (text.includes('projector') || text.includes('bulb') || text.includes('light') || text.includes('power') || text.includes('ac'))) {
    recStaffId = "STAFF_ELEC";
    recName = "Ramesh Babu (Senior Electrician)";
    const load = getWorkload('STAFF_ELEC');
    reason = `Matched electrical equipment keywords 'projector/power/light'. Current Workload: ${load} Active Tasks.`;
    confidence = "96%";

  } else if (category.includes('academic') || category.includes('exam')) {
    recStaffId = "HOD_IT";
    recName = "Dr. K. V. Raman (IT HOD)";
    const load = getWorkload('HOD_IT');
    reason = `Matched academic valuation desk. Current Workload: ${load} Active Tasks.`;
    confidence = "92%";

  } else {
    // Default IT Hardware & Network
    recStaffId = "STAFF_IT";
    recName = "Anil Kumar (IT Specialist)";
    const load = getWorkload('STAFF_IT');
    reason = `Matched IT/Hardware category & lab location. Current Workload: ${load} Active Tasks.`;
    confidence = "98%";
  }

  return { recStaffId, recName, reason, confidence };
}

function openAdminActionModal(complaintId) {
  const c = state.complaints.find(comp => comp.id === complaintId);
  if (!c) return;

  state.selectedComplaint = c;
  document.getElementById('admin-target-id').innerText = c.id;
  document.getElementById('admin-status-select').value = c.status === 'Received' ? 'Assigned' : c.status;
  document.getElementById('admin-remarks-text').value = '';

  // Calculate AI Recommendation
  const ai = getAISmartRecommendation(c);
  if (ai) {
    state.aiRecommendedStaffId = ai.recStaffId;
    document.getElementById('ai-worker-name').innerText = ai.recName;
    document.getElementById('ai-reason-text').innerText = `"${ai.reason}"`;
    document.getElementById('ai-confidence-score').innerText = `${ai.confidence} Match Confidence`;
    document.getElementById('ai-suggestion-box').classList.remove('hidden');
  }

  openModal('modal-admin-action');
}

function applyAISuggestion() {
  if (state.aiRecommendedStaffId) {
    document.getElementById('admin-staff-select').value = state.aiRecommendedStaffId;
    document.getElementById('admin-status-select').value = 'Assigned';
    showToast(`✨ AI Recommendation applied! Worker set to ${state.aiRecommendedStaffId}.`, 'success');
  }
}

function saveAdminStatusUpdate(event) {
  event.preventDefault();
  const c = state.selectedComplaint;
  if (!c) return;

  const newStatus = document.getElementById('admin-status-select').value;
  const staffId = document.getElementById('admin-staff-select').value;
  const remarks = document.getElementById('admin-remarks-text').value.trim();
  const staffObj = MOCK_DATA.workingStaff[staffId] || MOCK_DATA.admins[staffId];
  const staffName = staffObj ? staffObj.name : staffId;

  c.status = newStatus;
  c.assignedStaffId = staffId;
  c.assignedStaffName = staffName;

  if (newStatus === 'Received') c.stage = 1;
  else if (newStatus === 'Assigned') c.stage = 2;
  else if (newStatus === 'Under Investigation') c.stage = 3;
  else if (newStatus === 'In Progress') c.stage = 4;
  else if (newStatus === 'Resolved') c.stage = 5;

  const now = new Date();
  const timeStr = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  c.timeline.unshift({
    title: `Accepted & Assigned to ${staffName}`,
    time: timeStr,
    desc: `Admin ${state.currentUser.name} accepted grievance and assigned to working staff ${staffName}. Remarks: "${remarks}"`
  });

  saveToLocalStorage();
  updatePortalUI();
  renderComplaints();
  closeModal('modal-admin-action');

  // WORKFLOW RULE: Dispatch Notification Message to BOTH Working Staff AND Student!
  const notifToStaff = {
    id: `NTF-STF-${Date.now()}`,
    rollNo: staffId, // Target Working Staff member ID
    title: `🔔 New Work Order Assigned!`,
    text: `Admin ${state.currentUser.name} accepted and assigned ticket ${c.id} ("${c.title}") to your work list. Location: ${c.location}.`,
    time: timeStr,
    unread: true,
    complaintId: c.id
  };

  const notifToStudent = {
    id: `NTF-STU-${Date.now()}`,
    rollNo: c.rollNo,
    title: `🎉 Complaint Accepted & Assigned!`,
    text: `Admin ${state.currentUser.name} accepted your complaint ${c.id} and assigned staff ${staffName} to resolve it.`,
    time: timeStr,
    unread: true,
    complaintId: c.id
  };

  if (!state.notifications) state.notifications = [];
  state.notifications.unshift(notifToStaff);
  state.notifications.unshift(notifToStudent);
  localStorage.setItem('univ_notifications', JSON.stringify(state.notifications));
  renderNotifications();

  showToast(`Ticket ${c.id} ACCEPTED! Notification sent to Working Staff ${staffName} & Student.`, 'success');
}


/* =========================================================
   8. PRIVATE NOTES & PUBLIC CHAT (SECTION C)
   ========================================================= */

function openProgressTrackerModal(complaintId) {
  const c = state.complaints.find(comp => comp.id === complaintId);
  if (!c) return;

  state.selectedComplaint = c;
  
  document.getElementById('tracker-category').innerText = c.category;
  document.getElementById('tracker-title').innerText = c.title;
  document.getElementById('tracker-id-text').innerText = c.id;
  document.getElementById('tracker-upvotes').innerText = c.upvotes;

  // SLA Badge
  const slaBadge = document.getElementById('tracker-sla-badge');
  slaBadge.className = `sla-badge ${c.slaDaysRemaining < 3 ? 'sla-red' : (c.slaDaysRemaining < 10 ? 'sla-amber' : 'sla-green')}`;
  slaBadge.innerText = c.slaDaysRemaining < 0 ? 'OVERDUE SLA BREACH' : `SLA: ${c.slaDaysRemaining} Days Left`;

  // 5-Step Stepper Bar
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    stepEl.className = 'step-item';
    if (i < c.stage) stepEl.classList.add('step-completed');
    else if (i === c.stage) stepEl.classList.add('step-active');
  }

  // Student Attachment Photo
  const studentBox = document.getElementById('tracker-attachment-box');
  if (c.studentAttachment) {
    studentBox.classList.remove('hidden');
    document.getElementById('tracker-student-img').src = c.studentAttachment;
  } else {
    studentBox.classList.add('hidden');
  }

  // Staff Resolution Proof Photo
  const resBox = document.getElementById('tracker-resolution-proof-box');
  if (c.resolutionProof) {
    resBox.classList.remove('hidden');
    document.getElementById('tracker-resolution-img').src = c.resolutionProof;
  } else {
    resBox.classList.add('hidden');
  }

  // Render Internal Notes (Staff / Admin Only)
  const notesWrapper = document.getElementById('internal-notes-wrapper');
  if (state.currentRole === 'student') {
    notesWrapper.classList.add('hidden'); // HIDDEN FROM STUDENT
  } else {
    notesWrapper.classList.remove('hidden');
    renderInternalNotesList(c);
  }

  // Render Public Chat
  renderPublicChatThread(c);

  openModal('modal-progress-tracker');
}

function renderInternalNotesList(c) {
  const container = document.getElementById('internal-notes-list');
  if (!c.internalNotes || c.internalNotes.length === 0) {
    container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted);">No internal staff notes added yet.</div>`;
    return;
  }

  container.innerHTML = c.internalNotes.map(n => `
    <div class="note-item">
      <div class="note-meta"><i class="fa-solid fa-lock text-amber"></i> ${escapeHTML(n.author)} (${n.time})</div>
      <div>${escapeHTML(n.text)}</div>
    </div>
  `).join('');
}

function addInternalNote() {
  const c = state.selectedComplaint;
  const input = document.getElementById('input-internal-note');
  const text = input.value.trim();
  if (!text || !c) return;

  if (!c.internalNotes) c.internalNotes = [];
  c.internalNotes.unshift({
    author: `${state.currentUser.name} (${state.currentRole})`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: text
  });

  input.value = '';
  saveToLocalStorage();
  renderInternalNotesList(c);
  showToast('Private internal note added.', 'success');
}

function renderPublicChatThread(c) {
  const container = document.getElementById('public-chat-list');
  if (!c.publicMessages || c.publicMessages.length === 0) {
    container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); text-align: center;">No messages yet. Send a message to start conversation.</div>`;
    return;
  }

  container.innerHTML = c.publicMessages.map(m => {
    const isStudent = m.sender === c.studentName || m.sender === c.rollNo;
    return `
      <div class="chat-bubble ${isStudent ? 'student' : 'staff'}">
        <div class="chat-meta">${escapeHTML(m.sender)} • ${m.time}</div>
        <div>${escapeHTML(m.text)}</div>
      </div>
    `;
  }).join('');
}

function sendPublicChatMessage() {
  const c = state.selectedComplaint;
  const input = document.getElementById('input-public-chat');
  const text = input.value.trim();
  if (!text || !c) return;

  if (!c.publicMessages) c.publicMessages = [];
  c.publicMessages.push({
    sender: state.currentUser.name,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: text
  });

  input.value = '';
  saveToLocalStorage();
  renderPublicChatThread(c);
  showToast('Message sent to thread.', 'info');
}


/* =========================================================
   9. SECTION E: EXPORT DATA TO CSV
   ========================================================= */

function exportComplaintsToCSV() {
  if (!state.complaints || state.complaints.length === 0) {
    showToast('No complaints to export.', 'warning');
    return;
  }

  const headers = ["Ticket ID", "Submitted Date", "Category", "Student Roll No", "Student Name", "Title", "Location", "Priority", "Status", "Assigned Staff", "SLA Days Remaining"];
  
  const rows = state.complaints.map(c => [
    `"${c.id}"`,
    `"${c.date}"`,
    `"${c.category}"`,
    `"${c.rollNo}"`,
    `"${c.studentName}"`,
    `"${c.title.replace(/"/g, '""')}"`,
    `"${c.location.replace(/"/g, '""')}"`,
    `"${c.priority}"`,
    `"${c.status}"`,
    `"${c.assignedStaffName || c.officer}"`,
    `"${c.slaDaysRemaining}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Vignan_Student_Complaint_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Downloaded ticket log CSV report!', 'success');
}


/* =========================================================
   10. MODAL HELPERS & UTILS
   ========================================================= */

function openAddComplaintModal() {
  if (state.currentRole !== 'student') {
    showToast('Only students can submit new complaints.', 'info');
    return;
  }
  document.getElementById('modal-rollno-display').innerText = state.currentUser.rollNo;
  document.getElementById('form-add-complaint').reset();
  openModal('modal-add-complaint');
}

function checkCategoryDuplicatePrompt() {
  const category = document.getElementById('complaint-category').value;
  const existing = state.complaints.find(c => c.category === category && c.status !== 'Resolved');
  
  if (existing) {
    state.selectedComplaint = existing;
    document.getElementById('dup-title').innerText = existing.title;
    document.getElementById('duplicate-summary-box').querySelector('.summary-meta').innerHTML = `
      <span><i class="fa-solid fa-id-card"></i> Filed by Roll No: ${existing.rollNo}</span>
      <span><i class="fa-solid fa-clock"></i> Status: <strong class="text-amber">${existing.status}</strong></span>
    `;
    closeModal('modal-add-complaint');
    openModal('modal-duplicate-warning');
  }
}

function submitNewComplaint(event) {
  event.preventDefault();
  
  const category = document.getElementById('complaint-category').value;
  const title = document.getElementById('complaint-title').value.trim();
  const location = document.getElementById('complaint-location').value.trim();
  const subcat = document.getElementById('complaint-subcat').value.trim() || category;
  const priority = document.getElementById('complaint-priority').value;
  const desc = document.getElementById('complaint-desc').value.trim();
  const attachment = document.getElementById('complaint-attachment-url').value.trim() || null;
  const isAnon = document.getElementById('check-anonymous').checked;

  const newId = `CMP-2026-${String(state.complaints.length + 101).padStart(3, '0')}`;
  const now = new Date();
  const timeStr = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newComp = {
    id: newId,
    rollNo: state.currentUser.rollNo,
    studentName: isAnon ? "Anonymous Student" : state.currentUser.name,
    category: category,
    title: title,
    location: location,
    subcat: subcat,
    priority: priority,
    status: "Received",
    stage: 1,
    date: timeStr,
    submittedDateIso: now.toISOString(),
    targetSlaDays: 20,
    slaDaysRemaining: 20,
    isSlaOverdue: false,
    description: desc,
    upvotes: 1,
    officer: "Pending Department Assignment",
    assignedStaffId: "UNASSIGNED",
    assignedStaffName: "Unassigned Ground Staff",
    studentAttachment: attachment,
    resolutionProof: null,
    internalNotes: [],
    publicMessages: [],
    timeline: [
      { title: "Complaint Registered", time: timeStr, desc: `Filed securely under Roll No: ${state.currentUser.rollNo}` }
    ]
  };

  state.complaints.unshift(newComp);
  saveToLocalStorage();
  updateProfileCounts();
  updatePortalUI();
  renderComplaints();
  closeModal('modal-add-complaint');

  showToast(`Complaint ${newId} logged successfully!`, 'success');
}

function handleDuplicateOption(option) {
  closeModal('modal-duplicate-warning');
  if (option === 'progress' && state.selectedComplaint) {
    openProgressTrackerModal(state.selectedComplaint.id);
  } else if (option === 'action' && state.selectedComplaint) {
    showToast(`You have co-signed ticket ${state.selectedComplaint.id}.`, 'success');
  }
}

function toggleUpvote(complaintId) {
  const c = state.complaints.find(comp => comp.id === complaintId);
  if (!c) return;

  const idx = state.votedComplaintIds.indexOf(complaintId);
  if (idx > -1) {
    state.votedComplaintIds.splice(idx, 1);
    c.upvotes = Math.max(0, c.upvotes - 1);
    showToast('Upvote removed.', 'info');
  } else {
    state.votedComplaintIds.push(complaintId);
    c.upvotes += 1;
    showToast('Upvoted complaint! (+1)', 'success');
  }

  saveToLocalStorage();
  renderComplaints();
}

function renderNotifications() {
  const container = document.getElementById('notification-items-list');
  const countBadge = document.getElementById('unread-notif-count');
  
  let userNotifs = [...state.notifications];
  if (state.currentRole === 'student') {
    userNotifs = userNotifs.filter(n => n.rollNo === state.currentUser.rollNo);
  } else if (state.currentRole === 'admin') {
    userNotifs = userNotifs.filter(n => n.rollNo === 'ADMIN01' || n.rollNo === state.currentUser.id);
  }

  const unreadCount = userNotifs.filter(n => n.unread).length;
  countBadge.innerText = unreadCount;
  countBadge.style.display = unreadCount > 0 ? 'flex' : 'none';

  if (!container) return;

  if (userNotifs.length === 0) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 12px;">No unread messages.</div>`;
    return;
  }

  container.innerHTML = userNotifs.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="openNotifDetail('${n.complaintId}', '${n.id}')">
      <div class="notif-icon"><i class="fa-solid fa-circle-check"></i></div>
      <div>
        <div class="notif-title">${escapeHTML(n.title)}</div>
        <div class="notif-text">${escapeHTML(n.text)}</div>
        <span class="notif-time">${n.time}</span>
      </div>
    </div>
  `).join('');
}

function toggleNotificationDropdown() {
  document.getElementById('notif-dropdown').classList.toggle('hidden');
  renderNotifications();
}

function markAllNotificationsRead() {
  if (state.notifications) {
    state.notifications.forEach(n => n.unread = false);
    localStorage.setItem('univ_notifications', JSON.stringify(state.notifications));
    renderNotifications();
    showToast('All notifications marked as read.', 'info');
  }
}

function openNotifDetail(complaintId, notifId) {
  if (state.notifications) {
    const target = state.notifications.find(n => n.id === notifId);
    if (target) target.unread = false;
    localStorage.setItem('univ_notifications', JSON.stringify(state.notifications));
    renderNotifications();
  }
  document.getElementById('notif-dropdown').classList.add('hidden');
  openProgressTrackerModal(complaintId);
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function escapeHTML(str) {
  return str ? str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)) : '';
}

function setupEventListeners() {
  document.querySelectorAll('.modal-backdrop').forEach(b => {
    b.addEventListener('click', (e) => { if (e.target === b) b.classList.add('hidden'); });
  });
}
