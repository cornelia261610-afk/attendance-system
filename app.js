/**
 * 課堂點名系統 (Roll Call System) - 支援多課程與獨立學生名單
 */

// ==========================================
// 1. 資料模型與預設多課程範例
// ==========================================

const STORAGE_KEY = 'classroom_rollcall_data';
const THEME_KEY = 'classroom_rollcall_theme';

// 預設多課程範例資料（每門課有專屬的學生與點名紀錄）
const DEFAULT_DATA = {
  activeCourseId: 'course_1',
  courses: [
    {
      id: 'course_1',
      name: '113學年度 網頁前端實務開發',
      students: [
        { id: 's1_1', seatNumber: '01', name: '王小明', createdAt: 1726000000000 },
        { id: 's1_2', seatNumber: '02', name: '李小華', createdAt: 1726000001000 },
        { id: 's1_3', seatNumber: '03', name: '張美玲', createdAt: 1726000002000 },
        { id: 's1_4', seatNumber: '04', name: '陳建銘', createdAt: 1726000003000 },
        { id: 's1_5', seatNumber: '05', name: '林佳蓉', createdAt: 1726000004000 },
        { id: 's1_6', seatNumber: '06', name: '黃俊傑', createdAt: 1726000005000 },
        { id: 's1_7', seatNumber: '07', name: '蔡欣怡', createdAt: 1726000006000 },
        { id: 's1_8', seatNumber: '08', name: '吳志豪', createdAt: 1726000007000 },
        { id: 's1_9', seatNumber: '09', name: '鄭雅婷', createdAt: 1726000008000 },
        { id: 's1_10', seatNumber: '10', name: '許家瑋', createdAt: 1726000009000 }
      ],
      sessions: [
        {
          id: 'sess_1_1',
          date: '2026-09-09',
          note: '第 1 週 課程大綱與開發環境安裝',
          createdAt: 1725840000000,
          records: {
            's1_1': 'present', 's1_2': 'present', 's1_3': 'present', 's1_4': 'present',
            's1_5': 'present', 's1_6': 'late', 's1_7': 'present', 's1_8': 'present',
            's1_9': 'present', 's1_10': 'present'
          }
        },
        {
          id: 'sess_1_2',
          date: '2026-09-16',
          note: '第 2 週 HTML5 語意化與 CSS 基礎佈局',
          createdAt: 1726444800000,
          records: {
            's1_1': 'present', 's1_2': 'present', 's1_3': 'absent', 's1_4': 'present',
            's1_5': 'present', 's1_6': 'present', 's1_7': 'present', 's1_8': 'late',
            's1_9': 'present', 's1_10': 'present'
          }
        }
      ]
    },
    {
      id: 'course_2',
      name: '113學年度 資料庫系統與實務',
      students: [
        { id: 's2_1', seatNumber: '01', name: '江戶川柯南', createdAt: 1726000000000 },
        { id: 's2_2', seatNumber: '02', name: '毛利蘭', createdAt: 1726000001000 },
        { id: 's2_3', seatNumber: '03', name: '服部平次', createdAt: 1726000002000 },
        { id: 's2_4', seatNumber: '04', name: '灰原哀', createdAt: 1726000003000 },
        { id: 's2_5', seatNumber: '05', name: '工藤新一', createdAt: 1726000004000 },
        { id: 's2_6', seatNumber: '06', name: '鈴木園子', createdAt: 1726000005000 },
        { id: 's2_7', seatNumber: '07', name: '阿笠博士', createdAt: 1726000006000 },
        { id: 's2_8', seatNumber: '08', name: '安室透', createdAt: 1726000007000 }
      ],
      sessions: [
        {
          id: 'sess_2_1',
          date: '2026-09-10',
          note: '第 1 週 關聯式資料庫概論與 SQL 查詢',
          createdAt: 1725926400000,
          records: {
            's2_1': 'present', 's2_2': 'present', 's2_3': 'present', 's2_4': 'present',
            's2_5': 'present', 's2_6': 'late', 's2_7': 'present', 's2_8': 'present'
          }
        }
      ]
    },
    {
      id: 'course_3',
      name: '113學年度 人工智慧與機器學習應用',
      students: [
        { id: 's3_1', seatNumber: '01', name: '周杰倫', createdAt: 1726000000000 },
        { id: 's3_2', seatNumber: '02', name: '蔡依林', createdAt: 1726000001000 },
        { id: 's3_3', seatNumber: '03', name: '林俊傑', createdAt: 1726000002000 },
        { id: 's3_4', seatNumber: '04', name: '蕭敬騰', createdAt: 1726000003000 },
        { id: 's3_5', seatNumber: '05', name: '田馥甄', createdAt: 1726000004000 },
        { id: 's3_6', seatNumber: '06', name: '盧廣仲', createdAt: 1726000005000 }
      ],
      sessions: []
    }
  ]
};

// 全域狀態
let appData = loadData();

// 當前點名工作狀態（暫存未儲存之即時出勤）
let currentRollcall = {
  sessionId: null, // 若為編輯現有紀錄則有值，否則為 null
  date: getTodayDateString(),
  note: '',
  records: {} // { [studentId]: 'present' | 'late' | 'absent' | 'unmarked' }
};

// ==========================================
// 2. DOM 元素快取
// ==========================================

const DOM = {
  // Theme
  btnThemeToggle: document.getElementById('btnThemeToggle'),

  // Header & Multi-Course Management
  courseSelect: document.getElementById('courseSelect'),
  btnEditCourseName: document.getElementById('btnEditCourseName'),
  btnOpenAddCourseModal: document.getElementById('btnOpenAddCourseModal'),
  btnDeleteCourse: document.getElementById('btnDeleteCourse'),
  btnLoadSample: document.getElementById('btnLoadSample'),
  btnExportData: document.getElementById('btnExportData'),

  // Nav tabs
  navTabs: document.querySelectorAll('.nav-tab'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  navStudentCount: document.getElementById('navStudentCount'),
  navHistoryCount: document.getElementById('navHistoryCount'),

  // View: Roll Call
  rollcallDate: document.getElementById('rollcallDate'),
  rollcallNote: document.getElementById('rollcallNote'),
  btnSetToday: document.getElementById('btnSetToday'),
  btnQuickAllPresent: document.getElementById('btnQuickAllPresent'),
  btnQuickReset: document.getElementById('btnQuickReset'),
  countPresent: document.getElementById('countPresent'),
  countLate: document.getElementById('countLate'),
  countAbsent: document.getElementById('countAbsent'),
  countUnmarked: document.getElementById('countUnmarked'),
  countTotal: document.getElementById('countTotal'),
  searchRollcallStudent: document.getElementById('searchRollcallStudent'),
  attendanceGrid: document.getElementById('attendanceGrid'),
  emptyAttendanceState: document.getElementById('emptyAttendanceState'),
  btnGoToStudents: document.getElementById('btnGoToStudents'),
  btnSaveRollcall: document.getElementById('btnSaveRollcall'),
  btnCancelRollcall: document.getElementById('btnCancelRollcall'),
  floatingStatusText: document.getElementById('floatingStatusText'),

  // View: Students
  btnOpenAddStudentModal: document.getElementById('btnOpenAddStudentModal'),
  btnOpenBatchAddModal: document.getElementById('btnOpenBatchAddModal'),
  searchStudentInput: document.getElementById('searchStudentInput'),
  studentTotalBadge: document.getElementById('studentTotalBadge'),
  studentsTable: document.getElementById('studentsTable'),
  studentsTableBody: document.getElementById('studentsTableBody'),
  emptyStudentsState: document.getElementById('emptyStudentsState'),

  // View: History
  btnExportAllCsv: document.getElementById('btnExportAllCsv'),
  historyDateFilter: document.getElementById('historyDateFilter'),
  btnClearDateFilter: document.getElementById('btnClearDateFilter'),
  historyTotalCount: document.getElementById('historyTotalCount'),
  historyListContainer: document.getElementById('historyListContainer'),
  emptyHistoryState: document.getElementById('emptyHistoryState'),
  btnGoToRollcall: document.getElementById('btnGoToRollcall'),

  // View: Stats
  statsTotalSessions: document.getElementById('statsTotalSessions'),
  statsTotalStudents: document.getElementById('statsTotalStudents'),
  statsAvgRate: document.getElementById('statsAvgRate'),
  statsWarningCount: document.getElementById('statsWarningCount'),
  statsSortSelect: document.getElementById('statsSortSelect'),
  statsTableBody: document.getElementById('statsTableBody'),

  // Modals
  modalAddCourse: document.getElementById('modalAddCourse'),
  inputNewCourseName: document.getElementById('inputNewCourseName'),
  btnSaveNewCourse: document.getElementById('btnSaveNewCourse'),

  modalEditCourse: document.getElementById('modalEditCourse'),
  inputCourseName: document.getElementById('inputCourseName'),
  btnSaveCourseName: document.getElementById('btnSaveCourseName'),

  modalStudent: document.getElementById('modalStudent'),
  modalStudentTitle: document.getElementById('modalStudentTitle'),
  studentEditId: document.getElementById('studentEditId'),
  inputStudentSeat: document.getElementById('inputStudentSeat'),
  inputStudentName: document.getElementById('inputStudentName'),
  btnSaveStudent: document.getElementById('btnSaveStudent'),

  modalBatchAdd: document.getElementById('modalBatchAdd'),
  batchInputText: document.getElementById('batchInputText'),
  btnSaveBatchStudents: document.getElementById('btnSaveBatchStudents'),

  modalSessionDetail: document.getElementById('modalSessionDetail'),
  sessionDetailTitle: document.getElementById('sessionDetailTitle'),
  sessionDetailSubtitle: document.getElementById('sessionDetailSubtitle'),
  sessionDetailStats: document.getElementById('sessionDetailStats'),
  sessionDetailTableBody: document.getElementById('sessionDetailTableBody'),
  btnEditSessionFromDetail: document.getElementById('btnEditSessionFromDetail'),

  toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// 3. 資料持久化、移轉與輔助函式
// ==========================================

function normalizeData(data) {
  // 若為舊格式（單一課程），自動遷移至多課程格式
  if (data && !data.courses && data.courseName) {
    return {
      activeCourseId: 'course_default',
      courses: [
        {
          id: 'course_default',
          name: data.courseName || '未命名課程',
          students: Array.isArray(data.students) ? data.students : [],
          sessions: Array.isArray(data.sessions) ? data.sessions : []
        }
      ]
    };
  }

  // 確保多課程結構健全
  if (data && Array.isArray(data.courses) && data.courses.length > 0) {
    if (!data.activeCourseId || !data.courses.some(c => c.id === data.activeCourseId)) {
      data.activeCourseId = data.courses[0].id;
    }
    return data;
  }

  // 若資料毀損或為空，載入預設資料
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return normalizeData(parsed);
    }
  } catch (err) {
    console.error('Failed to load data from localStorage:', err);
  }
  const initial = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveData(initial);
  return initial;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
    showToast('儲存資料失敗，請確認瀏覽器儲存空間', 'error');
  }
}

// 取得當前作用中的課程物件
function getActiveCourse() {
  const course = appData.courses.find(c => c.id === appData.activeCourseId);
  if (course) return course;
  if (appData.courses.length > 0) {
    appData.activeCourseId = appData.courses[0].id;
    return appData.courses[0];
  }
  // 若為空防呆建立一門預設課
  const fallback = {
    id: 'course_' + Date.now(),
    name: '新課程',
    students: [],
    sessions: []
  };
  appData.courses.push(fallback);
  appData.activeCourseId = fallback.id;
  return fallback;
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateWithWeekday(dateStr) {
  if (!dateStr) return { formattedDate: '', dayName: '' };
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dayName = days[date.getDay()] || '';
  return { formattedDate: dateStr, dayName };
}

// ==========================================
// 4. 初始化與事件綁定
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initCourseManagement();
  initRollcallForm();
  initModals();
  initEventListeners();

  // 初始渲染
  renderCourseSelect();
  renderAllViews();
});

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  DOM.btnThemeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    showToast(`已切換為 ${newTheme === 'dark' ? '深色' : '淺色'} 模式`, 'info');
  });
}

function initNavigation() {
  DOM.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      switchTab(targetTab);
    });
  });

  DOM.btnGoToStudents?.addEventListener('click', () => switchTab('students'));
  DOM.btnGoToRollcall?.addEventListener('click', () => switchTab('rollcall'));
}

function switchTab(tabId) {
  DOM.navTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  DOM.tabPanes.forEach(p => p.classList.toggle('active', p.id === `view-${tabId}`));

  if (tabId === 'rollcall') {
    renderRollcallView();
  } else if (tabId === 'students') {
    renderStudentsView();
  } else if (tabId === 'history') {
    renderHistoryView();
  } else if (tabId === 'stats') {
    renderStatsView();
  }
}

// ==========================================
// 5. 模組 0：多課程管理功能 (Course Management)
// ==========================================

function initCourseManagement() {
  // 切換課程選單
  DOM.courseSelect.addEventListener('change', (e) => {
    const selectedCourseId = e.target.value;
    if (selectedCourseId !== appData.activeCourseId) {
      appData.activeCourseId = selectedCourseId;
      saveData(appData);
      resetCurrentRollcall();
      renderAllViews();
      const current = getActiveCourse();
      showToast(`已切換至「${current.name}」（學生：${current.students.length} 位）`, 'info');
    }
  });

  // 開啟新增課程 Modal
  DOM.btnOpenAddCourseModal.addEventListener('click', () => {
    DOM.inputNewCourseName.value = '';
    openModal(DOM.modalAddCourse);
    setTimeout(() => DOM.inputNewCourseName.focus(), 100);
  });

  // 儲存新增課程
  DOM.btnSaveNewCourse.addEventListener('click', () => {
    const name = DOM.inputNewCourseName.value.trim();
    if (!name) {
      showToast('請輸入課程名稱！', 'warning');
      DOM.inputNewCourseName.focus();
      return;
    }

    const newCourse = {
      id: 'course_' + Date.now(),
      name: name,
      students: [],
      sessions: []
    };

    appData.courses.push(newCourse);
    appData.activeCourseId = newCourse.id;
    saveData(appData);

    closeModal(DOM.modalAddCourse);
    renderCourseSelect();
    resetCurrentRollcall();
    renderAllViews();

    showToast(`已成功建立課程「${name}」！`, 'success');
    // 自動切換到學生名冊頁籤，引導教師新增學生
    switchTab('students');
  });

  // 開啟修改課程名稱 Modal
  DOM.btnEditCourseName.addEventListener('click', () => {
    const current = getActiveCourse();
    DOM.inputCourseName.value = current.name;
    openModal(DOM.modalEditCourse);
    setTimeout(() => DOM.inputCourseName.focus(), 100);
  });

  // 儲存修改課程名稱
  DOM.btnSaveCourseName.addEventListener('click', () => {
    const newName = DOM.inputCourseName.value.trim();
    if (!newName) {
      showToast('課程名稱不能為空！', 'warning');
      DOM.inputCourseName.focus();
      return;
    }
    const current = getActiveCourse();
    current.name = newName;
    saveData(appData);

    renderCourseSelect();
    closeModal(DOM.modalEditCourse);
    showToast(`課程名稱已更新為「${newName}」！`, 'success');
  });

  // 刪除當前課程
  DOM.btnDeleteCourse.addEventListener('click', () => {
    if (appData.courses.length <= 1) {
      alert('系統中至少需保留一門課程，無法刪除！');
      return;
    }
    const current = getActiveCourse();
    if (confirm(`確定要刪除課程「${current.name}」嗎？\n該課程專屬的 ${current.students.length} 位學生與 ${current.sessions.length} 次點名紀錄將一併刪除。`)) {
      appData.courses = appData.courses.filter(c => c.id !== current.id);
      appData.activeCourseId = appData.courses[0].id;
      saveData(appData);

      renderCourseSelect();
      resetCurrentRollcall();
      renderAllViews();

      showToast(`已刪除課程，已自動切換至「${getActiveCourse().name}」`, 'info');
    }
  });
}

function renderCourseSelect() {
  DOM.courseSelect.innerHTML = '';
  appData.courses.forEach(course => {
    const opt = document.createElement('option');
    opt.value = course.id;
    opt.textContent = `${course.name} (${course.students.length}人)`;
    if (course.id === appData.activeCourseId) {
      opt.selected = true;
    }
    DOM.courseSelect.appendChild(opt);
  });
}

function initRollcallForm() {
  DOM.rollcallDate.value = currentRollcall.date;

  DOM.btnSetToday.addEventListener('click', () => {
    DOM.rollcallDate.value = getTodayDateString();
    currentRollcall.date = DOM.rollcallDate.value;
    updateStickyStatus();
  });

  DOM.rollcallDate.addEventListener('change', (e) => {
    currentRollcall.date = e.target.value;
    updateStickyStatus();
  });

  DOM.rollcallNote.addEventListener('input', (e) => {
    currentRollcall.note = e.target.value;
  });

  // 全員出席
  DOM.btnQuickAllPresent.addEventListener('click', () => {
    const course = getActiveCourse();
    course.students.forEach(s => {
      currentRollcall.records[s.id] = 'present';
    });
    renderRollcallGrid();
    updateRollcallCounters();
    showToast('已將當前課程全體學生設為「出席」', 'info');
  });

  // 重設未點
  DOM.btnQuickReset.addEventListener('click', () => {
    const course = getActiveCourse();
    course.students.forEach(s => {
      currentRollcall.records[s.id] = 'unmarked';
    });
    renderRollcallGrid();
    updateRollcallCounters();
    showToast('已重設所有學生點名狀態', 'info');
  });

  // 搜尋點名學生
  DOM.searchRollcallStudent.addEventListener('input', () => {
    renderRollcallGrid();
  });

  // 儲存點名
  DOM.btnSaveRollcall.addEventListener('click', handleSaveRollcall);

  // 取消重選
  DOM.btnCancelRollcall.addEventListener('click', () => {
    if (confirm('確定要放棄當前的勾選進度並重設嗎？')) {
      resetCurrentRollcall();
      renderRollcallView();
      showToast('已重設點名狀態', 'info');
    }
  });
}

function initEventListeners() {
  // 載入範例資料
  DOM.btnLoadSample.addEventListener('click', () => {
    if (confirm('確定要載入多課程範例資料嗎？這將載入多門示範課程與專屬學生名單！')) {
      appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
      saveData(appData);
      renderCourseSelect();
      resetCurrentRollcall();
      renderAllViews();
      showToast('已成功載入多課程範例資料！', 'success');
    }
  });

  // 備份匯出 JSON
  DOM.btnExportData.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `點名系統多課程完整備份_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('已匯出所有課程備份資料 (JSON)', 'success');
  });

  // 匯出全學期 CSV
  DOM.btnExportAllCsv.addEventListener('click', handleExportCsv);

  // 學生搜尋
  DOM.searchStudentInput.addEventListener('input', renderStudentsTable);

  // 歷史日期篩選
  DOM.historyDateFilter.addEventListener('change', renderHistoryView);
  DOM.btnClearDateFilter.addEventListener('click', () => {
    DOM.historyDateFilter.value = '';
    renderHistoryView();
  });

  // 統計排序
  DOM.statsSortSelect.addEventListener('change', renderStatsTable);
}

function renderAllViews() {
  updateNavBadges();
  renderRollcallView();
  renderStudentsView();
  renderHistoryView();
  renderStatsView();
}

function updateNavBadges() {
  const currentCourse = getActiveCourse();
  DOM.navStudentCount.textContent = currentCourse.students.length;
  DOM.navHistoryCount.textContent = currentCourse.sessions.length;
}

// ==========================================
// 6. 模組 1：課堂點名 (Roll Call)
// ==========================================

function resetCurrentRollcall() {
  const currentCourse = getActiveCourse();
  currentRollcall = {
    sessionId: null,
    date: getTodayDateString(),
    note: '',
    records: {}
  };
  DOM.rollcallDate.value = currentRollcall.date;
  DOM.rollcallNote.value = '';

  currentCourse.students.forEach(s => {
    currentRollcall.records[s.id] = 'unmarked';
  });
  updateStickyStatus();
}

function renderRollcallView() {
  const currentCourse = getActiveCourse();

  // 初始化本課程新加入的學生
  currentCourse.students.forEach(s => {
    if (!currentRollcall.records[s.id]) {
      currentRollcall.records[s.id] = 'unmarked';
    }
  });

  const hasStudents = currentCourse.students.length > 0;
  DOM.emptyAttendanceState.classList.toggle('hidden', hasStudents);
  DOM.attendanceGrid.style.display = hasStudents ? 'grid' : 'none';

  renderRollcallGrid();
  updateRollcallCounters();
  updateStickyStatus();
}

function renderRollcallGrid() {
  DOM.attendanceGrid.innerHTML = '';
  const currentCourse = getActiveCourse();
  const query = (DOM.searchRollcallStudent.value || '').trim().toLowerCase();

  const sortedStudents = [...currentCourse.students].sort((a, b) => {
    const numA = parseInt(a.seatNumber, 10);
    const numB = parseInt(b.seatNumber, 10);
    return isNaN(numA) || isNaN(numB) ? a.seatNumber.localeCompare(b.seatNumber) : numA - numB;
  });

  const filtered = sortedStudents.filter(s => {
    return s.seatNumber.toLowerCase().includes(query) || s.name.toLowerCase().includes(query);
  });

  if (filtered.length === 0 && currentCourse.students.length > 0) {
    DOM.attendanceGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">查無符合「${query}」的學生</div>`;
    return;
  }

  filtered.forEach(student => {
    const status = currentRollcall.records[student.id] || 'unmarked';

    const card = document.createElement('div');
    card.className = 'student-card';
    card.setAttribute('data-status', status);
    card.id = `card-stu-${student.id}`;

    card.innerHTML = `
      <div class="student-card-header">
        <div class="seat-badge">${escapeHtml(student.seatNumber)}</div>
        <div class="student-info">
          <div class="student-name">${escapeHtml(student.name)}</div>
          <div class="student-history-hint">座號：${escapeHtml(student.seatNumber)}</div>
        </div>
      </div>
      <div class="status-buttons-group">
        <button type="button" class="btn-status ${status === 'present' ? 'active-present' : ''}" data-status="present">
          <span class="dot dot-success"></span> 出席
        </button>
        <button type="button" class="btn-status ${status === 'late' ? 'active-late' : ''}" data-status="late">
          <span class="dot dot-warning"></span> 遲到
        </button>
        <button type="button" class="btn-status ${status === 'absent' ? 'active-absent' : ''}" data-status="absent">
          <span class="dot dot-danger"></span> 缺席
        </button>
      </div>
    `;

    const statusButtons = card.querySelectorAll('.btn-status');
    statusButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chosenStatus = btn.dataset.status;
        setStudentRollcallStatus(student.id, chosenStatus);
      });
    });

    DOM.attendanceGrid.appendChild(card);
  });
}

function setStudentRollcallStatus(studentId, newStatus) {
  const current = currentRollcall.records[studentId];
  const finalStatus = current === newStatus ? 'unmarked' : newStatus;
  currentRollcall.records[studentId] = finalStatus;

  const card = document.getElementById(`card-stu-${studentId}`);
  if (card) {
    card.setAttribute('data-status', finalStatus);
    const buttons = card.querySelectorAll('.btn-status');
    buttons.forEach(btn => {
      btn.classList.remove('active-present', 'active-late', 'active-absent');
      if (btn.dataset.status === finalStatus) {
        btn.classList.add(`active-${finalStatus}`);
      }
    });
  }

  updateRollcallCounters();
}

function updateRollcallCounters() {
  const currentCourse = getActiveCourse();
  let present = 0, late = 0, absent = 0, unmarked = 0;
  const total = currentCourse.students.length;

  currentCourse.students.forEach(s => {
    const status = currentRollcall.records[s.id] || 'unmarked';
    if (status === 'present') present++;
    else if (status === 'late') late++;
    else if (status === 'absent') absent++;
    else unmarked++;
  });

  DOM.countPresent.textContent = present;
  DOM.countLate.textContent = late;
  DOM.countAbsent.textContent = absent;
  DOM.countUnmarked.textContent = unmarked;
  DOM.countTotal.textContent = total;

  updateStickyStatus();
}

function updateStickyStatus() {
  const currentCourse = getActiveCourse();
  const dateStr = DOM.rollcallDate.value || getTodayDateString();
  const unmarked = parseInt(DOM.countUnmarked.textContent || '0', 10);
  const total = currentCourse.students.length;

  if (currentRollcall.sessionId) {
    DOM.floatingStatusText.textContent = `[編輯中] 日期：${dateStr} (尚有 ${unmarked} 位未標記)`;
  } else if (unmarked === 0 && total > 0) {
    DOM.floatingStatusText.textContent = `全班 ${total} 位已全數完成點名！`;
  } else {
    DOM.floatingStatusText.textContent = `點名日期：${dateStr} (已點 ${total - unmarked}/${total} 位)`;
  }
}

function handleSaveRollcall() {
  const currentCourse = getActiveCourse();
  const date = DOM.rollcallDate.value;
  if (!date) {
    showToast('請先選擇或輸入點名日期！', 'warning');
    DOM.rollcallDate.focus();
    return;
  }

  if (currentCourse.students.length === 0) {
    showToast('當前課程尚無學生，請先新增學生！', 'warning');
    switchTab('students');
    return;
  }

  // 檢查未標記
  const unmarkedCount = Object.values(currentRollcall.records).filter(s => s === 'unmarked').length;
  if (unmarkedCount > 0) {
    const proceed = confirm(`尚有 ${unmarkedCount} 位學生未標記狀態，未標記學生將自動記錄為「缺席」，確定要儲存嗎？`);
    if (!proceed) return;

    currentCourse.students.forEach(s => {
      if (!currentRollcall.records[s.id] || currentRollcall.records[s.id] === 'unmarked') {
        currentRollcall.records[s.id] = 'absent';
      }
    });
  }

  const note = (DOM.rollcallNote.value || '').trim();

  // 檢查當前課程是否已有該日期紀錄
  const existingIndex = currentCourse.sessions.findIndex(sess => sess.date === date && sess.id !== currentRollcall.sessionId);
  if (existingIndex !== -1) {
    const overwrite = confirm(`此課程在日期 ${date} 已有一筆點名紀錄！\n點擊「確定」將會更新覆蓋該筆紀錄，點擊「取消」返回修改日期。`);
    if (!overwrite) return;

    currentCourse.sessions[existingIndex] = {
      ...currentCourse.sessions[existingIndex],
      date,
      note: note || currentCourse.sessions[existingIndex].note,
      records: { ...currentRollcall.records },
      updatedAt: Date.now()
    };
  } else if (currentRollcall.sessionId) {
    const idx = currentCourse.sessions.findIndex(s => s.id === currentRollcall.sessionId);
    if (idx !== -1) {
      currentCourse.sessions[idx] = {
        ...currentCourse.sessions[idx],
        date,
        note,
        records: { ...currentRollcall.records },
        updatedAt: Date.now()
      };
    }
  } else {
    const newSession = {
      id: 'sess_' + Date.now(),
      date,
      note,
      createdAt: Date.now(),
      records: { ...currentRollcall.records }
    };
    currentCourse.sessions.unshift(newSession);
  }

  saveData(appData);
  showToast(`已成功儲存 ${date} 的點名紀錄！`, 'success');

  resetCurrentRollcall();
  updateNavBadges();
  renderAllViews();
  switchTab('history');
}

// ==========================================
// 7. 模組 2：學生名單管理 (Student Roster)
// ==========================================

function renderStudentsView() {
  const currentCourse = getActiveCourse();
  DOM.studentTotalBadge.textContent = currentCourse.students.length;
  renderStudentsTable();
}

function renderStudentsTable() {
  DOM.studentsTableBody.innerHTML = '';
  const currentCourse = getActiveCourse();
  const query = (DOM.searchStudentInput.value || '').trim().toLowerCase();

  const sortedStudents = [...currentCourse.students].sort((a, b) => {
    const numA = parseInt(a.seatNumber, 10);
    const numB = parseInt(b.seatNumber, 10);
    return isNaN(numA) || isNaN(numB) ? a.seatNumber.localeCompare(b.seatNumber) : numA - numB;
  });

  const filtered = sortedStudents.filter(s => {
    return s.seatNumber.toLowerCase().includes(query) || s.name.toLowerCase().includes(query);
  });

  const hasStudents = currentCourse.students.length > 0;
  DOM.emptyStudentsState.classList.toggle('hidden', hasStudents);
  DOM.studentsTable.style.display = hasStudents ? 'table' : 'none';

  if (filtered.length === 0 && hasStudents) {
    DOM.studentsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">查無符合「${query}」的學生</td></tr>`;
    return;
  }

  filtered.forEach(student => {
    let present = 0, late = 0, absent = 0;
    currentCourse.sessions.forEach(sess => {
      const st = sess.records[student.id];
      if (st === 'present') present++;
      else if (st === 'late') late++;
      else if (st === 'absent') absent++;
    });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(student.seatNumber)}</strong></td>
      <td><span style="font-weight: 600;">${escapeHtml(student.name)}</span></td>
      <td>
        <div class="student-tag-group">
          <span class="tag-badge tag-badge-success" title="出席">${present} 出席</span>
          <span class="tag-badge tag-badge-warning" title="遲到">${late} 遲到</span>
          <span class="tag-badge tag-badge-danger" title="缺席">${absent} 缺席</span>
        </div>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-outline btn-edit-student" data-id="${student.id}" title="修改學生資料">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            編輯
          </button>
          <button class="btn btn-sm btn-ghost btn-del-student" data-id="${student.id}" title="刪除學生" style="color: var(--absent);">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-edit-student').addEventListener('click', () => openEditStudentModal(student));
    tr.querySelector('.btn-del-student').addEventListener('click', () => handleDeleteStudent(student));

    DOM.studentsTableBody.appendChild(tr);
  });
}

function openEditStudentModal(student = null) {
  if (student) {
    DOM.modalStudentTitle.textContent = '修改學生資料';
    DOM.studentEditId.value = student.id;
    DOM.inputStudentSeat.value = student.seatNumber;
    DOM.inputStudentName.value = student.name;
  } else {
    DOM.modalStudentTitle.textContent = '新增學生';
    DOM.studentEditId.value = '';
    const nextSeat = getNextSuggestedSeatNumber();
    DOM.inputStudentSeat.value = nextSeat;
    DOM.inputStudentName.value = '';
  }
  openModal(DOM.modalStudent);
  setTimeout(() => DOM.inputStudentName.focus(), 100);
}

function getNextSuggestedSeatNumber() {
  const currentCourse = getActiveCourse();
  if (currentCourse.students.length === 0) return '01';
  const nums = currentCourse.students
    .map(s => parseInt(s.seatNumber, 10))
    .filter(n => !isNaN(n));
  if (nums.length === 0) return '01';
  const max = Math.max(...nums);
  return String(max + 1).padStart(2, '0');
}

function handleSaveStudent() {
  const currentCourse = getActiveCourse();
  const id = DOM.studentEditId.value;
  const seat = DOM.inputStudentSeat.value.trim();
  const name = DOM.inputStudentName.value.trim();

  if (!seat || !name) {
    showToast('請完整填寫學生座號與姓名！', 'warning');
    return;
  }

  // 檢查同門課內座號重複
  const duplicate = currentCourse.students.find(s => s.seatNumber === seat && s.id !== id);
  if (duplicate) {
    showToast(`此課程已存在座號「${seat}」（學生：${duplicate.name}），請使用其他座號！`, 'error');
    DOM.inputStudentSeat.focus();
    return;
  }

  if (id) {
    const student = currentCourse.students.find(s => s.id === id);
    if (student) {
      student.seatNumber = seat;
      student.name = name;
      showToast(`已成功修改學生「${name}」的資料！`, 'success');
    }
  } else {
    const newStudent = {
      id: 'stu_' + Date.now(),
      seatNumber: seat,
      name: name,
      createdAt: Date.now()
    };
    currentCourse.students.push(newStudent);
    currentRollcall.records[newStudent.id] = 'unmarked';
    showToast(`已成功為「${currentCourse.name}」新增學生「${name}」！`, 'success');
  }

  saveData(appData);
  renderCourseSelect();
  closeModal(DOM.modalStudent);
  updateNavBadges();
  renderAllViews();
}

function handleDeleteStudent(student) {
  const currentCourse = getActiveCourse();
  if (confirm(`確定要從本課程刪除學生「${student.seatNumber} ${student.name}」嗎？\n此動作將一併清除該學生的出勤紀錄。`)) {
    currentCourse.students = currentCourse.students.filter(s => s.id !== student.id);
    delete currentRollcall.records[student.id];

    currentCourse.sessions.forEach(sess => {
      delete sess.records[student.id];
    });

    saveData(appData);
    renderCourseSelect();
    showToast(`已成功刪除學生「${student.name}」！`, 'info');
    updateNavBadges();
    renderAllViews();
  }
}

// 批次匯入學生
function handleSaveBatchStudents() {
  const currentCourse = getActiveCourse();
  const text = DOM.batchInputText.value.trim();
  if (!text) {
    showToast('請貼上或輸入學生名單！', 'warning');
    return;
  }

  const lines = text.split('\n');
  let addedCount = 0;
  let skippedCount = 0;

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) return;

    const parts = line.split(/[\s,，\t]+/);
    if (parts.length >= 2) {
      const seat = parts[0].trim();
      const name = parts.slice(1).join(' ').trim();

      const isDuplicate = currentCourse.students.some(s => s.seatNumber === seat);
      if (!isDuplicate && seat && name) {
        const newStu = {
          id: 'stu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          seatNumber: seat,
          name: name,
          createdAt: Date.now()
        };
        currentCourse.students.push(newStu);
        currentRollcall.records[newStu.id] = 'unmarked';
        addedCount++;
      } else {
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  });

  if (addedCount > 0) {
    saveData(appData);
    renderCourseSelect();
    closeModal(DOM.modalBatchAdd);
    DOM.batchInputText.value = '';
    showToast(`成功匯入 ${addedCount} 位學生至「${currentCourse.name}」！${skippedCount > 0 ? ` (略過 ${skippedCount} 筆重複或格式不符)` : ''}`, 'success');
    updateNavBadges();
    renderAllViews();
  } else {
    showToast('未能匯入任何學生，請檢查輸入格式或座號是否重複！', 'error');
  }
}

// ==========================================
// 8. 模組 3：點名紀錄瀏覽 (Attendance History)
// ==========================================

function renderHistoryView() {
  const currentCourse = getActiveCourse();
  const filterDate = DOM.historyDateFilter.value;
  DOM.historyTotalCount.textContent = currentCourse.sessions.length;

  let sessions = [...currentCourse.sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filterDate) {
    sessions = sessions.filter(s => s.date === filterDate);
  }

  const hasHistory = currentCourse.sessions.length > 0;
  DOM.emptyHistoryState.classList.toggle('hidden', hasHistory);
  DOM.historyListContainer.style.display = hasHistory ? 'flex' : 'none';

  DOM.historyListContainer.innerHTML = '';

  if (sessions.length === 0 && hasHistory) {
    DOM.historyListContainer.innerHTML = `<div class="card" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">日期「${filterDate}」無點名紀錄</div>`;
    return;
  }

  sessions.forEach(session => {
    const { formattedDate, dayName } = formatDateWithWeekday(session.date);

    let present = 0, late = 0, absent = 0;
    const records = session.records || {};
    const totalStudentsInSession = Object.keys(records).length;

    Object.values(records).forEach(st => {
      if (st === 'present') present++;
      else if (st === 'late') late++;
      else if (st === 'absent') absent++;
    });

    const rate = totalStudentsInSession > 0 ? Math.round(((present + late) / totalStudentsInSession) * 100) : 0;
    const presentPct = totalStudentsInSession > 0 ? (present / totalStudentsInSession) * 100 : 0;
    const latePct = totalStudentsInSession > 0 ? (late / totalStudentsInSession) * 100 : 0;
    const absentPct = totalStudentsInSession > 0 ? (absent / totalStudentsInSession) * 100 : 0;

    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-date-col">
        <span class="history-date">${formattedDate}</span>
        <span class="history-day">${dayName}</span>
      </div>

      <div class="history-info-col">
        <div class="history-note">${session.note ? escapeHtml(session.note) : '<span style="color: var(--text-subtle);">無備註說明</span>'}</div>
        <div class="history-stats-row">
          <span class="tag-badge tag-badge-success">${present} 出席</span>
          <span class="tag-badge tag-badge-warning">${late} 遲到</span>
          <span class="tag-badge tag-badge-danger">${absent} 缺席</span>
          <div class="history-progress-bar" title="出席率 ${rate}%">
            <div class="bar-present" style="width: ${presentPct}%;"></div>
            <div class="bar-late" style="width: ${latePct}%;"></div>
            <div class="bar-absent" style="width: ${absentPct}%;"></div>
          </div>
          <span class="history-rate-text">出勤率 ${rate}%</span>
        </div>
      </div>

      <div class="history-actions-col">
        <button class="btn btn-sm btn-outline btn-view-session" data-id="${session.id}">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          查看明細
        </button>
        <button class="btn btn-sm btn-ghost btn-edit-session" data-id="${session.id}" title="重新載入點名以修改">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          編輯
        </button>
        <button class="btn btn-sm btn-ghost btn-del-session" data-id="${session.id}" title="刪除此紀錄" style="color: var(--absent);">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    `;

    card.querySelector('.btn-view-session').addEventListener('click', () => openSessionDetailModal(session));
    card.querySelector('.btn-edit-session').addEventListener('click', () => handleEditSession(session));
    card.querySelector('.btn-del-session').addEventListener('click', () => handleDeleteSession(session));

    DOM.historyListContainer.appendChild(card);
  });
}

function openSessionDetailModal(session) {
  const currentCourse = getActiveCourse();
  const { formattedDate, dayName } = formatDateWithWeekday(session.date);
  DOM.sessionDetailTitle.textContent = `${formattedDate} (${dayName}) 點名紀錄`;
  DOM.sessionDetailSubtitle.textContent = session.note ? `課堂備註：${session.note}` : '無課堂備註';

  let present = 0, late = 0, absent = 0;
  const records = session.records || {};

  Object.values(records).forEach(st => {
    if (st === 'present') present++;
    else if (st === 'late') late++;
    else if (st === 'absent') absent++;
  });

  const total = Object.keys(records).length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  DOM.sessionDetailStats.innerHTML = `
    <span class="stat-pill stat-present"><span class="dot dot-success"></span> 出席 ${present} 人</span>
    <span class="stat-pill stat-late"><span class="dot dot-warning"></span> 遲到 ${late} 人</span>
    <span class="stat-pill stat-absent"><span class="dot dot-danger"></span> 缺席 ${absent} 人</span>
    <span class="stat-pill stat-total">總計 ${total} 人 (出勤率 ${rate}%)</span>
  `;

  DOM.sessionDetailTableBody.innerHTML = '';

  const sortedStudents = [...currentCourse.students].sort((a, b) => {
    const numA = parseInt(a.seatNumber, 10);
    const numB = parseInt(b.seatNumber, 10);
    return isNaN(numA) || isNaN(numB) ? a.seatNumber.localeCompare(b.seatNumber) : numA - numB;
  });

  sortedStudents.forEach(student => {
    const status = records[student.id] || 'absent';
    let badgeHtml = '';
    if (status === 'present') {
      badgeHtml = '<span class="status-badge status-badge-good">🟢 出席</span>';
    } else if (status === 'late') {
      badgeHtml = '<span class="status-badge status-badge-warning">🟡 遲到</span>';
    } else {
      badgeHtml = '<span class="status-badge status-badge-danger">🔴 缺席</span>';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(student.seatNumber)}</strong></td>
      <td>${escapeHtml(student.name)}</td>
      <td>${badgeHtml}</td>
    `;
    DOM.sessionDetailTableBody.appendChild(tr);
  });

  DOM.btnEditSessionFromDetail.onclick = () => {
    closeModal(DOM.modalSessionDetail);
    handleEditSession(session);
  };

  openModal(DOM.modalSessionDetail);
}

function handleEditSession(session) {
  currentRollcall = {
    sessionId: session.id,
    date: session.date,
    note: session.note || '',
    records: { ...session.records }
  };

  DOM.rollcallDate.value = session.date;
  DOM.rollcallNote.value = session.note || '';

  switchTab('rollcall');
  showToast(`已載入 ${session.date} 點名資料，完成後點擊「儲存」即可更新！`, 'info');
}

function handleDeleteSession(session) {
  const currentCourse = getActiveCourse();
  if (confirm(`確定要刪除 ${session.date} 的點名紀錄嗎？\n此動作無法復原。`)) {
    currentCourse.sessions = currentCourse.sessions.filter(s => s.id !== session.id);
    saveData(appData);
    showToast(`已刪除 ${session.date} 的點名紀錄！`, 'info');
    updateNavBadges();
    renderAllViews();
  }
}

// 匯出全學期 CSV
function handleExportCsv() {
  const currentCourse = getActiveCourse();
  if (currentCourse.sessions.length === 0 || currentCourse.students.length === 0) {
    showToast('當前課程尚無出勤資料可供匯出！', 'warning');
    return;
  }

  const sortedSessions = [...currentCourse.sessions].sort((a, b) => new Date(a.date) - new Date(b.date));

  let header = ['座號', '姓名'];
  sortedSessions.forEach(s => {
    header.push(`${s.date}${s.note ? `(${s.note})` : ''}`);
  });
  header.push('出席次數', '遲到次數', '缺席次數', '出勤率(%)');

  const rows = [header];

  const sortedStudents = [...currentCourse.students].sort((a, b) => {
    const numA = parseInt(a.seatNumber, 10);
    const numB = parseInt(b.seatNumber, 10);
    return isNaN(numA) || isNaN(numB) ? a.seatNumber.localeCompare(b.seatNumber) : numA - numB;
  });

  sortedStudents.forEach(student => {
    let pCount = 0, lCount = 0, aCount = 0;
    const row = [student.seatNumber, student.name];

    sortedSessions.forEach(s => {
      const st = s.records[student.id];
      if (st === 'present') {
        row.push('出席');
        pCount++;
      } else if (st === 'late') {
        row.push('遲到');
        lCount++;
      } else if (st === 'absent') {
        row.push('缺席');
        aCount++;
      } else {
        row.push('未點');
      }
    });

    const total = sortedSessions.length;
    const rate = total > 0 ? (((pCount + lCount) / total) * 100).toFixed(1) : '0';

    row.push(pCount, lCount, aCount, `${rate}%`);
    rows.push(row);
  });

  const csvContent = '\uFEFF' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentCourse.name}_出勤總表_${getTodayDateString()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast(`已成功匯出「${currentCourse.name}」出勤總表 (CSV)！`, 'success');
}

// ==========================================
// 9. 模組 4：數據統計 (Statistics)
// ==========================================

function renderStatsView() {
  const currentCourse = getActiveCourse();
  const totalSessions = currentCourse.sessions.length;
  const totalStudents = currentCourse.students.length;

  DOM.statsTotalSessions.textContent = totalSessions;
  DOM.statsTotalStudents.textContent = totalStudents;

  let grandTotalRecords = 0;
  let grandEffectiveAttendances = 0;
  let warningCount = 0;

  currentCourse.students.forEach(student => {
    let absent = 0, present = 0, late = 0;
    currentCourse.sessions.forEach(sess => {
      const st = sess.records[student.id];
      if (st === 'present') {
        present++;
        grandEffectiveAttendances++;
        grandTotalRecords++;
      } else if (st === 'late') {
        late++;
        grandEffectiveAttendances++;
        grandTotalRecords++;
      } else if (st === 'absent') {
        absent++;
        grandTotalRecords++;
      }
    });

    const rate = totalSessions > 0 ? ((present + late) / totalSessions) * 100 : 100;
    if (totalSessions > 0 && (absent >= 2 || rate < 80)) {
      warningCount++;
    }
  });

  const avgRate = grandTotalRecords > 0 ? Math.round((grandEffectiveAttendances / grandTotalRecords) * 100) : 0;
  DOM.statsAvgRate.textContent = totalSessions > 0 ? `${avgRate}%` : '尚無紀錄';
  DOM.statsWarningCount.textContent = warningCount;

  renderStatsTable();
}

function renderStatsTable() {
  DOM.statsTableBody.innerHTML = '';
  const currentCourse = getActiveCourse();
  const totalSessions = currentCourse.sessions.length;

  const studentStats = currentCourse.students.map(student => {
    let present = 0, late = 0, absent = 0;
    currentCourse.sessions.forEach(sess => {
      const st = sess.records[student.id];
      if (st === 'present') present++;
      else if (st === 'late') late++;
      else if (st === 'absent') absent++;
    });

    const rateNum = totalSessions > 0 ? ((present + late) / totalSessions) * 100 : 100;

    return {
      student,
      present,
      late,
      absent,
      rate: rateNum,
      rateFormatted: totalSessions > 0 ? rateNum.toFixed(1) + '%' : '100%'
    };
  });

  const sortMode = DOM.statsSortSelect.value;
  studentStats.sort((a, b) => {
    const numA = parseInt(a.student.seatNumber, 10);
    const numB = parseInt(b.student.seatNumber, 10);

    switch (sortMode) {
      case 'seat-asc':
        return isNaN(numA) || isNaN(numB) ? a.student.seatNumber.localeCompare(b.student.seatNumber) : numA - numB;
      case 'seat-desc':
        return isNaN(numA) || isNaN(numB) ? b.student.seatNumber.localeCompare(a.student.seatNumber) : numB - numA;
      case 'rate-asc':
        return a.rate - b.rate;
      case 'rate-desc':
        return b.rate - a.rate;
      case 'absent-desc':
        return b.absent - a.absent;
      default:
        return numA - numB;
    }
  });

  if (studentStats.length === 0) {
    DOM.statsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">當前課程尚無學生出勤統計資料</td></tr>`;
    return;
  }

  studentStats.forEach(item => {
    let statusClass = 'status-badge-good';
    let statusText = '出勤良好';
    let barColorClass = 'high';

    if (totalSessions > 0) {
      if (item.absent >= 2 || item.rate < 80) {
        statusClass = 'status-badge-danger';
        statusText = '曠課預警';
        barColorClass = 'low';
      } else if (item.rate < 90 || item.late >= 2) {
        statusClass = 'status-badge-warning';
        statusText = '注意出勤';
        barColorClass = 'medium';
      }
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(item.student.seatNumber)}</strong></td>
      <td><span style="font-weight: 600;">${escapeHtml(item.student.name)}</span></td>
      <td><span class="tag-badge tag-badge-success">${item.present} 次</span></td>
      <td><span class="tag-badge tag-badge-warning">${item.late} 次</span></td>
      <td><span class="tag-badge tag-badge-danger">${item.absent} 次</span></td>
      <td>
        <div class="rate-cell">
          <div class="rate-bar-bg">
            <div class="rate-bar-fill ${barColorClass}" style="width: ${item.rate}%;"></div>
          </div>
          <span style="font-weight: 700; font-size: 0.88rem;">${item.rateFormatted}</span>
        </div>
      </td>
      <td>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </td>
    `;
    DOM.statsTableBody.appendChild(tr);
  });
}

// ==========================================
// 10. 彈跳視窗 (Modals) 與工具函式
// ==========================================

function initModals() {
  DOM.btnOpenAddStudentModal.addEventListener('click', () => openEditStudentModal(null));
  DOM.btnSaveStudent.addEventListener('click', handleSaveStudent);

  DOM.btnOpenBatchAddModal.addEventListener('click', () => {
    DOM.batchInputText.value = '';
    openModal(DOM.modalBatchAdd);
  });
  DOM.btnSaveBatchStudents.addEventListener('click', handleSaveBatchStudents);

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.modal-backdrop.show');
      if (openModalEl) closeModal(openModalEl);
    }
  });
}

function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('show');
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('show');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  else if (type === 'warning') icon = '⚠️';
  else if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
