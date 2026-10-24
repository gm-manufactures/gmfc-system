<!DOCTYPE html>
<html lang="am">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GMFC - የአስተዳዳሪ መቆጣጠሪያ ፓነል</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-green: #1b5e20; --secondary-green: #2e7d32; --accent-red: #d32f2f;
            --dark-green: #0d2310; --light-bg: #f4f6f4; --white: #ffffff;
            --gray: #666; --blue: #1976d2;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { background: var(--light-bg); display: flex; min-height: 100vh; }
        .sidebar { width: 280px; background: var(--dark-green); color: white; padding: 25px; position: fixed; height: 100vh; overflow-y: auto; }
        .sidebar-brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: bold; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 30px; }
        .sidebar-brand img { width: 45px; height: 45px; border-radius: 50%; }
        .sidebar-menu { list-style: none; }
        .sidebar-menu li { margin-bottom: 10px; }
        .sidebar-menu li a { color: #b3cbb5; text-decoration: none; padding: 12px 15px; display: flex; align-items: center; gap: 12px; border-radius: 8px; font-weight: 600; transition: 0.3s; cursor: pointer; }
        .sidebar-menu li a:hover, .sidebar-menu li a.active { background: var(--secondary-green); color: white; }
        .main-content { margin-left: 280px; flex: 1; padding: 30px; }
        .header-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #ddd; }
        .header-title h1 { color: var(--dark-green); font-size: 26px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 5px solid var(--secondary-green); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .stat-card h3 { font-size: 32px; color: var(--dark-green); }
        .stat-card p { font-size: 14px; color: var(--gray); font-weight: 600; }
        .stat-icon { font-size: 40px; color: #ccc; }
        .dashboard-section { background: white; padding: 25px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .section-heading { font-size: 18px; color: var(--primary-green); margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; }
        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
        th { background: #f8f9f8; color: var(--dark-green); }
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
        .status-pending { background: #fff3e0; color: #ff9800; }
        .status-approved { background: #e8f5e9; color: #2e7d32; }
        .status-rejected { background: #ffebee; color: #d32f2f; }
        .btn { padding: 6px 12px; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: bold; margin: 2px; }
        .btn-approve { background: var(--secondary-green); color: white; }
        .btn-approve:hover { background: var(--primary-green); }
        .btn-reject { background: var(--accent-red); color: white; }
        .btn-delete { background: #666; color: white; }
        .btn-edit { background: var(--blue); color: white; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-weight: 600; font-size: 14px; color: var(--dark-green); }
        .form-group input, .form-group textarea, .form-group select { padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; }
        .btn-submit { background: var(--primary-green); color: white; padding: 12px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; margin-top: 15px; grid-column: span 2; }
        .btn-submit:hover { background: var(--dark-green); }
        .news-item { background: var(--light-bg); padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 15px; }
        .member-item { background: var(--light-bg); padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--secondary-green); }
        .member-info strong { display: block; color: var(--dark-green); margin-bottom: 4px; }
        .member-info small { color: var(--gray); margin-right: 10px; }
        .toast { position: fixed; bottom: 30px; right: 30px; background: var(--primary-green); color: white; padding: 12px 20px; border-radius: 8px; z-index: 4000; opacity: 0; pointer-events: none; transition: 0.3s; }
        .toast.show { opacity: 1; }
        .toast.error { background: var(--accent-red); }
        .preview-media { max-width: 200px; max-height: 150px; border-radius: 6px; margin-top: 8px; display: none; border: 2px solid var(--secondary-green); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: none; align-items: center; justify-content: center; z-index: 3000; padding: 20px; }
        .modal-overlay.active { display: flex; }
        .modal-content { background: white; border-radius: 10px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .modal-header { background: linear-gradient(135deg, var(--primary-green), var(--secondary-green)); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 10px 10px 0 0; }
        .modal-header h3 { font-size: 18px; }
        .modal-close { background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 16px; }
        .modal-body { padding: 20px; }
        @media (max-width: 768px) {
            .sidebar { width: 80px; padding: 15px; }
            .sidebar-brand span, .sidebar-menu li a span { display: none; }
            .main-content { margin-left: 80px; }
            .form-grid { grid-template-columns: 1fr; }
            .form-group.full-width { grid-column: span 1; }
            .btn-submit { grid-column: span 1; }
        }
    </style>
</head>
<body>
<div class="sidebar">
    <div class="sidebar-brand">
        <img src="logo.png" alt="Logo" onerror="this.src='https://via.placeholder.com/45'">
        <span>GMFC Admin</span>
    </div>
    <ul class="sidebar-menu">
        <li><a class="active" onclick="showSection('dashboard', this)"><i class="fa-solid fa-chart-line"></i> <span>ዴሽቦርድ</span></a></li>
        <li><a onclick="showSection('applications', this)"><i class="fa-solid fa-clipboard-list"></i> <span>የአክሲዮን ጥያቄዎች</span></a></li>
        <li><a onclick="showSection('members', this)"><i class="fa-solid fa-users"></i> <span>የአባላት አስተዳደር</span></a></li>
        <li><a onclick="showSection('messages', this)"><i class="fa-solid fa-envelope"></i> <span>መልእክቶች</span></a></li>
        <li><a onclick="showSection('profile', this)"><i class="fa-solid fa-building"></i> <span>ድርጅት መረጃ</span></a></li>
        <li><a onclick="showSection('news', this)"><i class="fa-solid fa-newspaper"></i> <span>ዜና አስተዳደር</span></a></li>
        <li><a onclick="showSection('settings', this)"><i class="fa-solid fa-gear"></i> <span>ዋጋ እና ቅንብሮች</span></a></li>
        <li><a onclick="showSection('adminChat', this)"><i class="fas fa-comments"></i> <span>የድጋፍ ቻት (Support)</span></a></li>
        <li><a href="index.html" target="_blank"><i class="fa-solid fa-globe"></i> <span>ወደ ገጽ</span></a></li>
    </ul>
</div>
<div class="main-content">
    <div class="header-title">
        <h1>የአስተዳዳሪ መቆጣጠሪያ ማዕከል</h1>
        <div>እንኳን ደህና መጡ!</div>
    </div>

    <!-- DASHBOARD -->
    <div id="dashboard-section">
        <div class="stats-grid">
            <div class="stat-card"><div><h3 id="total-approved">0</h3><p>የጸደቁ ጥያቄዎች</p></div><div class="stat-icon"><i class="fa-solid fa-user-check"></i></div></div>
            <div class="stat-card"><div><h3 id="total-pending">0</h3><p>በመጠባበቅ ላይ</p></div><div class="stat-icon"><i class="fa-solid fa-clock"></i></div></div>
            <div class="stat-card"><div><h3 id="total-members">0</h3><p>የተመዘገቡ አባላት</p></div><div class="stat-icon"><i class="fa-solid fa-users"></i></div></div>
            <div class="stat-card"><div><h3 id="total-messages">0</h3><p>መልእክቶች</p></div><div class="stat-icon"><i class="fa-solid fa-envelope"></i></div></div>
        </div>
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-bell"></i> የቅርብ ጊዜ ጥያቄዎች</div>
            <div id="recent-applications"></div>
        </div>
    </div>

    <!-- APPLICATIONS -->
    <div id="applications-section" style="display:none;">
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-clipboard-list"></i> ሁሉም የአክሲዮን ጥያቄዎች</div>
            <div class="table-container">
                <table>
                    <thead><tr><th>ስም</th><th>ስልክ</th><th>አክሲዮን</th><th>ከተማ</th><th>ሁኔታ</th><th>ድርጊት</th></tr></thead>
                    <tbody id="applications-tbody"></tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- MEMBERS MANAGEMENT -->
    <div id="members-section" style="display:none;">
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-user-plus"></i> አዲስ አባል መመዝገቢያ</div>
            <form id="member-form" class="form-grid">
                <div class="form-group">
                    <label>የአባልነት መለያ ቁጥር (Member ID)</label>
                    <input type="text" id="member-id" placeholder="ለምሳሌ: GMFC002" required>
                </div>
                <div class="form-group">
                    <label>ሙሉ ስም</label>
                    <input type="text" id="member-fullname" placeholder="ለምሳሌ: አበበ ከበደ" required>
                </div>
                <div class="form-group full-width">
                    <label>የይለፍ ቃል (Password)</label>
                    <input type="text" id="member-password" placeholder="የይለፍ ቃል ያስገቡ" required>
                </div>
                <button type="submit" class="btn-submit">
                    <i class="fa-solid fa-user-plus"></i> አባል መዝግብ
                </button>
            </form>
        </div>
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-users"></i> የተመዘገቡ አባላት</div>
            <div id="members-list">
                <p style="text-align: center; color: #999;">በመጫን ላይ...</p>
            </div>
        </div>
    </div>

    <!-- MESSAGES -->
    <div id="messages-section" style="display:none;">
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-paper-plane"></i> አዲስ መልእክት መላኪያ</div>
            <form id="message-form" class="form-grid">
                <div class="form-group full-width">
                    <label>የመልእክቱ ርዕስ</label>
                    <input type="text" id="message-title" placeholder="ለምሳሌ: የጠቅላላ ጉባኤ ማስታወቂያ" required>
                </div>
                <div class="form-group full-width">
                    <label>የመልእክቱ ይዘት</label>
                    <textarea id="message-content" rows="6" placeholder="መልእክቱን እዚህ ይጻፉ..." required></textarea>
                </div>
                <button type="submit" class="btn-submit">
                    <i class="fa-solid fa-paper-plane"></i> መልእክት ላክ
                </button>
            </form>
        </div>
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-inbox"></i> የተላኩ መልእክቶች</div>
            <div id="messages-list">
                <p style="text-align: center; color: #999;">በመጫን ላይ...</p>
            </div>
        </div>
    </div>

    <!-- ADMIN CHAT SECTION -->
    <div id="adminChat-section" style="display:none;">
        <div class="dashboard-section">
            <div class="section-heading"><i class="fas fa-comments"></i> የድጋፍ ቻት (Support Chat)</div>
            <div style="display: flex; height: 600px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="width: 30%; border-right: 1px solid #ddd; overflow-y: auto;">
                    <div style="padding: 15px; background: #f8f9fa; font-weight: bold; border-bottom: 1px solid #ddd;">ተጠቃሚዎች</div>
                    <div id="chatUserList"></div>
                </div>
                <div style="width: 70%; display: flex; flex-direction: column;">
                    <div style="padding: 15px; background: #2e7d32; color: white; font-weight: bold;" id="chatHeader">ተጠቃሚ ይምረጡ</div>
                    <div id="adminChatBox" style="flex: 1; padding: 15px; overflow-y: auto; background: #e5ddd5; display: flex; flex-direction: column;"></div>
                    <div style="padding: 10px; background: #f0f0f0; display: flex; gap: 10px;">
                        <input type="text" id="adminChatInput" placeholder="መልእክትዎን ይጻፉ..." style="flex: 1; padding: 10px; border-radius: 20px; border: 1px solid #ccc; outline: none;">
                        <button onclick="sendAdminMessage()" style="padding: 10px 20px; background: #2e7d32; color: white; border: none; border-radius: 20px; cursor: pointer;">ላክ</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- PROFILE -->
    <div id="profile-section" style="display:none;">
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-building"></i> የድርጅት መረጃ ማስተካከያ</div>
            <form id="profile-form" class="form-grid">
                <div class="form-group full-width"><label>የማህበሩ ህጋዊ ስም</label><input type="text" id="company-name" required></div>
                <div class="form-group"><label>የኢንቨስትመንት ፈቃድ ቁጥር</label><input type="text" id="license-number" required></div>
                <div class="form-group"><label>ዋና ስራ አስኪያጅ</label><input type="text" id="manager-name" required></div>
                <div class="form-group full-width"><label>ዋና ርዕስ (Hero Title)</label><input type="text" id="hero-title"></div>
                <div class="form-group full-width"><label>የገጽ መግለጫ (Hero Subtitle)</label><textarea id="hero-subtitle" rows="3"></textarea></div>
                <button type="submit" class="btn-submit">ለውጦችን አስቀምጥ</button>
            </form>
        </div>
    </div>

    <!-- NEWS -->
    <div id="news-section" style="display:none;">
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-plus"></i> አዲስ ዜና መጨመሪያ</div>
            <form id="news-form" class="form-grid">
                <div class="form-group"><label>ዓመት</label><input type="text" id="news-year" placeholder="ለምሳሌ: ጥር 2026" required></div>
                <div class="form-group full-width"><label>ርዕስ</label><input type="text" id="news-title" required></div>
                <div class="form-group full-width"><label>ዝርዝር መግለጫ</label><textarea id="news-desc" rows="3" required></textarea></div>
                <div class="form-group full-width">
                    <label>ፎቶ ወይም ቪዲዮ ያስገቡ፦</label>
                    <input type="file" id="newsMedia" accept="image/*,video/*" onchange="previewNewsMedia(this)">
                    <div id="newsMediaPreviewContainer" style="margin-top: 10px;"></div>
                </div>
                <button type="submit" class="btn-submit">ዜና ጨምር</button>
            </form>
        </div>
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-list"></i> የተመዘገቡ ዜናዎች</div>
            <div id="news-list"></div>
        </div>
    </div>

    <!-- SETTINGS -->
    <div id="settings-section" style="display:none;">
        <div class="dashboard-section">
            <div class="section-heading"><i class="fa-solid fa-gear"></i> የቡና ዋጋ እና የዶላር ምንዛሬ ማስተካከያ</div>
            <form id="settings-form" class="form-grid">
                <div class="form-group full-width">
                    <label>1 ዶላር በብር (Exchange Rate)</label>
                    <input type="number" step="0.01" id="setting-exchange" required>
                </div>
                <div class="form-group"><label>የጫካ ቡና ፍሬ (ጥሬ) - በኪሎ</label><input type="number" id="setting-price1" required></div>
                <div class="form-group"><label>አረንጓዴ የቡና ባቄላ - በኪሎ</label><input type="number" id="setting-price2" required></div>
                <div class="form-group"><label>የተቆላ ቡና - በኪሎ</label><input type="number" id="setting-price3" required></div>
                <div class="form-group"><label>የተፈጨ ቡና - በኪሎ</label><input type="number" id="setting-price4" required></div>
                <div class="form-group full-width"><label>ጅምላ (ኩንታል) - በኩንታል</label><input type="number" id="setting-price5" required></div>
                <div class="form-group full-width" style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
                    <h4 style="color: var(--primary-green); margin-bottom: 10px;">የኢትዮጵያ የቡና ደረጃዎች (Grade) ዋጋ</h4>
                </div>
                <div class="form-group"><label>ደረጃ 1 (Grade 1)</label><input type="number" step="0.01" id="setting-grade1" required></div>
                <div class="form-group"><label>ደረጃ 2 (Grade 2)</label><input type="number" step="0.01" id="setting-grade2" required></div>
                <div class="form-group"><label>ደረጃ 3 (Grade 3)</label><input type="number" step="0.01" id="setting-grade3" required></div>
                <div class="form-group"><label>ደረጃ 4 (Grade 4)</label><input type="number" step="0.01" id="setting-grade4" required></div>
                <div class="form-group"><label>ደረጃ 5 (Grade 5)</label><input type="number" step="0.01" id="setting-grade5" required></div>
                <button type="submit" class="btn-submit" style="margin-top: 20px;">አዳዲስ ዋጋዎችን አስቀምጥ</button>
            </form>
        </div>
    </div>
</div>

<!-- Edit Member Modal -->
<div class="modal-overlay" id="editMemberModal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fa-solid fa-user-edit"></i> አባል ማስተካከያ</h3>
            <button class="modal-close" onclick="closeEditMember()"><i class="fa-solid fa-times"></i></button>
        </div>
        <div class="modal-body">
            <form id="edit-member-form" class="form-grid">
                <input type="hidden" id="edit-member-id">
                <div class="form-group full-width">
                    <label>የአባልነት መለያ</label>
                    <input type="text" id="edit-member-id-display" disabled>
                </div>
                <div class="form-group full-width">
                    <label>ሙሉ ስም</label>
                    <input type="text" id="edit-member-fullname" required>
                </div>
                <div class="form-group full-width">
                    <label>አዲስ የይለፍ ቃል (ባዶ ከሆነ አይቀየርም)</label>
                    <input type="text" id="edit-member-password" placeholder="አዲስ የይለፍ ቃል">
                </div>
                <button type="submit" class="btn-submit">ለውጦችን አስቀምጥ</button>
            </form>
        </div>
    </div>
</div>

<div id="toast" class="toast"></div>

<script>
    const API_BASE = window.location.origin + '/api';
    let currentChatMemberId = null;
    let newsMediaBase64 = ''; // ✅ የዜና ፎቶ/ቪዲዮ Base64 ለማስቀመጥ

    function showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast show' + (isError ? ' error' : '');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ✅ የፎቶ/ቪዲዮ ቅድመ እይታ እና Base64 ልወጣ
    function previewNewsMedia(input) {
        const file = input.files[0];
        const container = document.getElementById('newsMediaPreviewContainer');
        if (!file) {
            newsMediaBase64 = '';
            container.innerHTML = '';
            return;
        }
        if (file.size > 45 * 1024 * 1024) {
            showToast('❌ ፋይሉ በጣም ትልቅ ነው (ከ45MB በታች ይሁን)', true);
            input.value = '';
            newsMediaBase64 = '';
            container.innerHTML = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            newsMediaBase64 = e.target.result;
            if (file.type.startsWith('video/')) {
                container.innerHTML = `<video src="${newsMediaBase64}" controls class="preview-media" style="display:block;"></video>`;
            } else {
                container.innerHTML = `<img src="${newsMediaBase64}" class="preview-media" style="display:block;">`;
            }
        };
        reader.readAsDataURL(file);
    }

    function showSection(section, element) {
        const sections = ['dashboard', 'applications', 'members', 'messages', 'adminChat', 'profile', 'news', 'settings'];
        sections.forEach(sec => {
            const el = document.getElementById(sec + '-section');
            if (el) el.style.display = 'none';
        });

        const links = document.querySelectorAll('.sidebar-menu li a');
        links.forEach(link => link.classList.remove('active'));

        const targetSection = document.getElementById(section + '-section');
        if (targetSection) targetSection.style.display = 'block';
        if (element) element.classList.add('active');

        if (section === 'dashboard') loadDashboard();
        if (section === 'applications') loadApplications();
        if (section === 'members') loadMembers();
        if (section === 'messages') loadMessages();
        if (section === 'adminChat') loadChatUsers();
        if (section === 'profile') loadProfile();
        if (section === 'news') loadNewsList();
        if (section === 'settings') loadSettings();
    }

    /* ================= DASHBOARD ================= */
    async function loadDashboard() {
        try {
            const statsRes = await fetch(`${API_BASE}/stats`);
            const stats = await statsRes.json();
            document.getElementById('total-approved').innerText = stats.totalApproved || 0;
            document.getElementById('total-pending').innerText = stats.totalPending || 0;

            const appsRes = await fetch(`${API_BASE}/applications`);
            const apps = await appsRes.json();

            try {
                const membersRes = await fetch(`${API_BASE}/members`);
                const members = await membersRes.json();
                document.getElementById('total-members').innerText = members.length || 0;
            } catch (e) {
                document.getElementById('total-members').innerText = '0';
            }

            try {
                const msgRes = await fetch(`${API_BASE}/messages`);
                const messages = await msgRes.json();
                const msgEl = document.getElementById('total-messages');
                if (msgEl) msgEl.innerText = messages.length || 0;
            } catch (e) {
                const msgEl = document.getElementById('total-messages');
                if (msgEl) msgEl.innerText = '0';
            }

            const recent = apps.slice(0, 5);
            const container = document.getElementById('recent-applications');
            if (recent.length === 0) {
                container.innerHTML = '<p>ምንም ጥያቄዎች የሉም</p>';
            } else {
                container.innerHTML = '<table style="width:100%"><tr><th>ስም</th><th>ስልክ</th><th>ሁኔታ</th></tr>' +
                    recent.map(app => `<tr><td>${app.name}</td><td>${app.phone}</td><td><span class="status-badge status-${app.status}">${app.status === 'pending' ? 'በመጠባበቅ' : 'የጸደቀ'}</span></td></tr>`).join('') +
                    '</table>';
            }
        } catch (err) {
            console.error('Error loading dashboard:', err);
        }
    }

    /* ================= APPLICATIONS ================= */
    async function loadApplications() {
        try {
            const response = await fetch(`${API_BASE}/applications`);
            const apps = await response.json();
            const tbody = document.getElementById('applications-tbody');
            tbody.innerHTML = '';

            apps.forEach(app => {
                const row = tbody.insertRow();
                row.insertCell(0).innerText = app.name;
                row.insertCell(1).innerText = app.phone;
                row.insertCell(2).innerText = app.amount;
                row.insertCell(3).innerText = app.city || '-';
                row.insertCell(4).innerHTML = `<span class="status-badge status-${app.status}">${app.status === 'pending' ? 'በመጠባበቅ' : app.status === 'approved' ? 'የጸደቀ' : 'ውድቅ'}</span>`;
                const actions = row.insertCell(5);
                if (app.status === 'pending') {
                    actions.innerHTML = `<button class="btn btn-approve" onclick="updateStatus(${app.id}, 'approved')">አጽድቅ</button>
                                        <button class="btn btn-reject" onclick="updateStatus(${app.id}, 'rejected')">ሰርዝ</button>`;
                } else {
                    actions.innerHTML = `<button class="btn btn-delete" onclick="deleteApplication(${app.id})">ሰርዝ</button>`;
                }
            });
        } catch (err) {
            console.error('Error loading applications:', err);
            showToast('የአባላት መረጃ መጫን አልተቻለም', true);
        }
    }

    async function updateStatus(id, status) {
        try {
            const response = await fetch(`${API_BASE}/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: status })
            });
            if (response.ok) {
                showToast(status === 'approved' ? 'ተቀባይነት አግኝቷል!' : 'ጥያቄ ውድቅ ተደርጓል');
                loadApplications();
                loadDashboard();
            } else {
                showToast('ስህተት ተከስቷል', true);
            }
        } catch (err) {
            showToast('ከሰርቨሩ ጋር መገናኘት አልተቻለም', true);
        }
    }

    async function deleteApplication(id) {
        if (confirm('እርግጠኛ ነዎት?')) {
            try {
                await fetch(`${API_BASE}/applications/${id}`, { method: 'DELETE' });
                showToast('ተሰርዟል');
                loadApplications();
                loadDashboard();
            } catch (err) {
                showToast('ስህተት', true);
            }
        }
    }

    /* ================= MEMBERS MANAGEMENT ================= */
    async function loadMembers() {
        const container = document.getElementById('members-list');
        container.innerHTML = '<p style="text-align:center;color:#999;">በመጫን ላይ...</p>';

        try {
            const response = await fetch(`${API_BASE}/members`);
            if (!response.ok) throw new Error('Failed to load');
            const members = await response.json();

            if (!members || members.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:#999;">ምንም አባላት አልተመዘገቡም።</p>';
                return;
            }

            container.innerHTML = members.map(m => `
                <div class="member-item">
                    <div class="member-info">
                        <strong>👤 ${m.full_name}</strong>
                        <small>🆔 ${m.member_id}</small>
                        <small>📅 ${new Date(m.created_at).toLocaleDateString()}</small>
                    </div>
                    <div>
                        <button class="btn btn-edit" onclick='openEditMember(${JSON.stringify(m).replace(/'/g, "\\'")})'>
                            <i class="fa-solid fa-edit"></i> አስተካክል
                        </button>
                        <button class="btn btn-delete" onclick="deleteMember(${m._id || m.id}, '${m.member_id}')">
                            <i class="fa-solid fa-trash"></i> ሰርዝ
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Error loading members:', err);
            container.innerHTML = '<p style="text-align:center;color:#d32f2f;">አባላትን መጫን አልተቻለም።</p>';
        }
    }

    document.getElementById('member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            member_id: document.getElementById('member-id').value.trim(),
            full_name: document.getElementById('member-fullname').value.trim(),
            password: document.getElementById('member-password').value
        };
        try {
            const response = await fetch(`${API_BASE}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showToast('✅ አዲስ አባል በተሳካ ሁኔታ ተመዝግቧል!');
                document.getElementById('member-form').reset();
                loadMembers();
                loadDashboard();
            } else {
                showToast('❌ ' + (data.error || 'ስህተት ተከስቷል'), true);
            }
        } catch (err) {
            showToast('ከሰርቨሩ ጋር መገናኘት አልተቻለም', true);
        }
    });

    async function deleteMember(id, memberId) {
        if (!confirm(`አባል "${memberId}" ን መሰረዝ ይፈልጋሉ?`)) return;
        try {
            const response = await fetch(`${API_BASE}/members/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('✅ አባል ተሰርዟል');
                loadMembers();
                loadDashboard();
            } else {
                showToast('❌ ስህተት ተከስቷል', true);
            }
        } catch (err) {
            showToast('ከሰርቨሩ ጋር መገናኘት አልተቻለም', true);
        }
    }

    function openEditMember(member) {
        document.getElementById('edit-member-id').value = member._id || member.id;
        document.getElementById('edit-member-id-display').value = member.member_id;
        document.getElementById('edit-member-fullname').value = member.full_name;
        document.getElementById('edit-member-password').value = '';
        document.getElementById('editMemberModal').classList.add('active');
    }

    function closeEditMember() {
        document.getElementById('editMemberModal').classList.remove('active');
    }

    document.getElementById('edit-member-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-member-id').value;
        const payload = {
            full_name: document.getElementById('edit-member-fullname').value.trim(),
            password: document.getElementById('edit-member-password').value || null
        };
        try {
            const response = await fetch(`${API_BASE}/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                showToast('✅ አባል ተስተካክሏል');
                closeEditMember();
                loadMembers();
            } else {
                showToast('❌ ስህተት ተከስቷል', true);
            }
        } catch (err) {
            showToast('ከሰርቨሩ ጋር መገናኘት አልተቻለም', true);
        }
    });

    /* ================= MESSAGES ================= */
    async function loadMessages() {
        const container = document.getElementById('messages-list');
        container.innerHTML = '<p style="text-align:center;color:#999;">በመጫን ላይ...</p>';
        try {
            const response = await fetch(`${API_BASE}/messages`);
            if (!response.ok) throw new Error('Failed to load');
            const messages = await response.json();
            if (!messages || messages.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:#999;">ምንም መልእክቶች የሉም።</p>';
                return;
            }
            container.innerHTML = messages.map(m => `
                <div class="news-item" style="border-left: 4px solid var(--blue); align-items: flex-start;">
                    <div style="flex:1;">
                        <strong style="color: var(--primary-green); display:block; margin-bottom:8px; font-size:15px;">📌 ${m.title}</strong>
                        <p style="color:#555; margin-bottom:8px; line-height:1.6; white-space:pre-wrap;">${m.content}</p>
                        <small style="color:#999;">👤 ${m.sender || 'Admin'} &nbsp;•&nbsp; 📅 ${new Date(m.created_at).toLocaleString()}</small>
                    </div>
                    <button class="btn btn-delete" onclick="deleteMessage(${m.id})" title="ሰርዝ"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join('');
        } catch (err) {
            console.error('Error loading messages:', err);
            container.innerHTML = '<p style="text-align:center;color:#d32f2f;">መልእክቶችን መጫን አልተቻለም።</p>';
        }
    }

    document.getElementById('message-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('message-title').value.trim(),
            content: document.getElementById('message-content').value.trim(),
            sender: 'Admin'
        };
        if (!payload.title || !payload.content) {
            showToast('❌ ርዕስ እና ይዘት ያስፈልጋሉ', true);
            return;
        }
        try {
            const response = await fetch(`${API_BASE}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showToast('✅ መልእክት በተሳካ ሁኔታ ተልኳል!');
                document.getElementById('message-form').reset();
                loadMessages();
                loadDashboard();
            } else {
                showToast('❌ ' + (data.error || 'ስህተት ተከስቷል'), true);
            }
        } catch (err) {
            showToast('ከሰርቨሩ ጋር መገናኘት አልተቻለም', true);
        }
    });

    async function deleteMessage(id) {
        if (!confirm('ይህን መልእክት መሰረዝ ይፈልጋሉ?')) return;
        try {
            const response = await fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('✅ መልእክት ተሰርዟል');
                loadMessages();
                loadDashboard();
            } else {
                showToast('❌ ስህተት ተከስቷል', true);
            }
        } catch (err) {
            showToast('ከሰርቨሩ ጋር መገናኘት አልተቻለም', true);
        }
    }

    /* ================= ADMIN CHAT LOGIC ================= */
    async function loadChatUsers() {
        const listDiv = document.getElementById('chatUserList');
        listDiv.innerHTML = '<p style="padding:15px;color:#999;">በመጫን ላይ...</p>';
        try {
            const res = await fetch(`${API_BASE}/admin/chats`);
            const data = await res.json();
            listDiv.innerHTML = '';
            if (!data || data.length === 0) {
                listDiv.innerHTML = '<p style="padding:15px;color:#999;">ምንም ተጠቃሚ አልተጻፈም።</p>';
                return;
            }
            data.forEach(user => {
                const btn = document.createElement('div');
                btn.style.cssText = 'padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; align-items: center; gap: 10px;';
                btn.innerHTML = `<div style="width: 40px; height: 40px; background: #2e7d32; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold;">${user.member_id.charAt(0)}</div><strong>👤 ${user.member_id}</strong>`;
                btn.onmouseover = () => btn.style.background = '#f0f0f0';
                btn.onmouseout = () => btn.style.background = 'transparent';
                btn.onclick = () => loadChatMessages(user.member_id);
                listDiv.appendChild(btn);
            });
        } catch (error) {
            console.error("Error loading chat users:", error);
            listDiv.innerHTML = '<p style="padding:15px;color:#d32f2f;">ተጠቃሚዎችን መጫን አልተቻለም።</p>';
        }
    }

    async function loadChatMessages(memberId) {
        currentChatMemberId = memberId;
        document.getElementById('chatHeader').innerText = `ከ ${memberId} ጋር ያለ ውይይት`;
        const chatBox = document.getElementById('adminChatBox');
        chatBox.innerHTML = '<p style="text-align:center;color:#999;">በመጫን ላይ...</p>';
        try {
            const res = await fetch(`${API_BASE}/chats/${memberId}`);
            const data = await res.json();
            chatBox.innerHTML = '';
            if (!data || data.length === 0) {
                chatBox.innerHTML = '<p style="text-align:center;color:#999;">ምንም መልእክት የለም።</p>';
                return;
            }
            data.forEach(msg => {
                const isAdmin = msg.sender_type === 'admin';
                const bubble = document.createElement('div');
                bubble.style.cssText = `max-width: 70%; padding: 10px 15px; border-radius: 15px; margin-bottom: 10px; font-size: 14px; align-self: ${isAdmin ? 'flex-end' : 'flex-start'}; background: ${isAdmin ? '#2e7d32' : '#fff'}; color: ${isAdmin ? '#fff' : '#333'}; border-bottom-${isAdmin ? 'right' : 'left'}-radius: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.1);`;
                bubble.innerText = msg.message;
                chatBox.appendChild(bubble);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        } catch (error) {
            console.error("Error loading messages:", error);
            chatBox.innerHTML = '<p style="text-align:center;color:#d32f2f;">መልእክቶችን መጫን አልተቻለም።</p>';
        }
    }

    async function sendAdminMessage() {
        const input = document.getElementById('adminChatInput');
        const message = input.value.trim();
        if (!message || !currentChatMemberId) {
            alert("እባክዎ መጀመሪያ ተጠቃሚ ይምረጡ ወይም መልእክት ይጻፉ።");
            return;
        }
        input.value = '';
        try {
            await fetch(`${API_BASE}/chats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ member_id: currentChatMemberId, sender_type: 'admin', message: message }),
            });
            loadChatMessages(currentChatMemberId);
        } catch (error) {
            alert("መልእክት መላክ አልተቻለም።");
        }
    }

    /* ================= PROFILE ================= */
    async function loadProfile() {
        try {
            const response = await fetch(`${API_BASE}/profile`);
            const data = await response.json();
            document.getElementById('company-name').value = data.currentName || '';
            document.getElementById('license-number').value = data.legalRegistration?.investmentLicenseNo || '';
            document.getElementById('manager-name').value = data.generalManager || '';
            document.getElementById('hero-title').value = data.heroTitle || '';
            document.getElementById('hero-subtitle').value = data.heroSubtitle || '';
        } catch (err) {
            console.error('Error loading profile:', err);
        }
    }

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            currentName: document.getElementById('company-name').value,
            legalRegistration: { investmentLicenseNo: document.getElementById('license-number').value },
            generalManager: document.getElementById('manager-name').value,
            heroTitle: document.getElementById('hero-title').value,
            heroSubtitle: document.getElementById('hero-subtitle').value
        };
        try {
            const response = await fetch(`${API_BASE}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                showToast('✅ የድርጅት መረጃ ተዘምኗል!');
            } else {
                showToast('❌ ስህተት ተከስቷል', true);
            }
        } catch (err) {
            showToast('ከሰርቨሩ ጋር መገናኘት አልተቻለም', true);
        }
    });

    /* ================= NEWS ================= */
    async function loadNewsList() {
        try {
            const response = await fetch(`${API_BASE}/news`);
            const news = await response.json();
            const container = document.getElementById('news-list');
            if (news.length === 0) {
                container.innerHTML = '<p>ምንም ዜና የለም</p>';
            } else {
                container.innerHTML = news.map(item => `
                    <div class="news-item">
                        <div><strong>${item.year}</strong><br><small>${item.title}</small></div>
                        <button class="btn btn-delete" onclick="deleteNews('${item._id || item.id}')">ሰርዝ</button>
                    </div>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading news:', err);
        }
    }

    async function deleteNews(id) {
        if (confirm('ይህን ዜና መሰረዝ ይፈልጋሉ?')) {
            try {
                await fetch(`${API_BASE}/news/${id}`, { method: 'DELETE' });
                showToast('✅ ዜና ተሰርዟል');
                loadNewsList();
                loadDashboard();
            } catch (err) {
                showToast('ስህተት', true);
            }
        }
    }

    document.getElementById('news-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            year: document.getElementById('news-year').value,
            title: document.getElementById('news-title').value,
            description: document.getElementById('news-desc').value,
            image: newsMediaBase64 || '' // ✅ ፎቶው ወይም ቪዲዮው ወደ ሰርቨር ይላካል
        };
        try {
            const response = await fetch(`${API_BASE}/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                showToast('✅ ዜና ተጨምሯል!');
                document.getElementById('news-form').reset();
                document.getElementById('newsMediaPreviewContainer').innerHTML = '';
                newsMediaBase64 = '';
                loadNewsList();
                loadDashboard();
            } else {
                showToast('❌ ስህተት', true);
            }
        } catch (err) {
            showToast('ከሰርቨሩ ጋር መገናኘት አልተቻለም', true);
        }
    });

    /* ================= SETTINGS ================= */
    async function loadSettings() {
        try {
            const response = await fetch(`${API_BASE}/settings`);
            const settings = await response.json();
            document.getElementById('setting-exchange').value = settings.exchange_rate || '161.72';
            document.getElementById('setting-price1').value = settings.coffee_price_grade1 || '450';
            document.getElementById('setting-price2').value = settings.coffee_price_grade2 || '520';
            document.getElementById('setting-price3').value = settings.coffee_price_grade3 || '600';
            document.getElementById('setting-price4').value = settings.coffee_price_ground || '650';
            document.getElementById('setting-price5').value = settings.wholesale_price || '42000';
            document.getElementById('setting-grade1').value = settings.grade1_price || '3.94';
            document.getElementById('setting-grade2').value = settings.grade2_price || '3.81';
            document.getElementById('setting-grade3').value = settings.grade3_price || '2.47';
            document.getElementById('setting-grade4').value = settings.grade4_price || '2.74';
            document.getElementById('setting-grade5').value = settings.grade5_price || '3.50';
        } catch (err) {
            console.error('Error loading settings:', err);
            showToast('ቅንብሮችን መጫን አልተቻለም', true);
        }
    }

    document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            exchange_rate: document.getElementById('setting-exchange').value,
            coffee_price_grade1: document.getElementById('setting-price1').value,
            coffee_price_grade2: document.getElementById('setting-price2').value,
            coffee_price_grade3: document.getElementById('setting-price3').value,
            coffee_price_ground: document.getElementById('setting-price4').value,
            wholesale_price: document.getElementById('setting-price5').value,
            grade1_price: document.getElementById('setting-grade1').value,
            grade2_price: document.getElementById('setting-grade2').value,
            grade3_price: document.getElementById('setting-grade3').value,
            grade4_price: document.getElementById('setting-grade4').value,
            grade5_price: document.getElementById('setting-grade5').value
        };
        try {
            const response = await fetch(`${API_BASE}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                showToast('✅ ዋጋዎች በተሳካ ሁኔታ ተዘምነዋል!');
            } else {
                showToast('❌ ስህተት ተከስቷል', true);
            }
        } catch (err) {
            showToast('ከሰርቨሩ ጋር መገናኘት አልተቻለም', true);
        }
    });

    window.onload = () => {
        loadDashboard();
    };
</script>
</body>
</html>
