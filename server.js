const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// SQLite Database
const db = new sqlite3.Database('./gmfc_database.db');

// Create tables and insert default data
db.serialize(() => {
    // Applications table
    db.run(CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        amount TEXT NOT NULL,
        city TEXT,
        status TEXT DEFAULT 'pending',
        date TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ));

    // Company profile table
    db.run(CREATE TABLE IF NOT EXISTS company_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        license_number TEXT NOT NULL,
        general_manager TEXT NOT NULL,
        hero_title TEXT,
        hero_subtitle TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ));

    // News table
    db.run(CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ));

    // Settings table
    db.run(CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ));

    // Members table
    db.run(CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ));

    // Insert default company profile if not exists
    db.get("SELECT * FROM company_profile WHERE id = 1", (err, row) => {
        if (err) return console.error(err.message);
        if (!row) {
            db.run(
                INSERT INTO company_profile (id, company_name, license_number, general_manager, hero_title, hero_subtitle)
                 VALUES (1, ?, ?, ?, ?, ?),
                [
                    'የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር አክሲዬን ማህበር',
                    'GMFC/INV/2024/0123',
                    'ኢንጂነር ሰይድ ይማም አሸብር',
                    'የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር',
                    'ከማጃንግ ጥቅጥቅ ያሉ ደኖች፣ ሜጢ ከተማ - ለዓለም ገበያ የሚቀርብ ንጹህ የኢትዮጵያ የጫካ ቡና!'
                ]
            );
        }
    });

    // Insert default news if not exists
    db.get("SELECT * FROM news LIMIT 1", (err, row) => {
        if (err) return console.error(err.message);
        if (!row) {
            db.run(
                INSERT INTO news (year, title, description) VALUES 
                ('መስከረም 2025', 'የጂ+5 ህንፃ ግንባታ ሥራ መጀመሩ ተገለጸ', 'በሜጢ ከተማ የመጀመሪያው የG+5 የንግድ ማዕከል ግንባታ በይፋ ተጀመረ።'),
                ('ታህሳስ 2025', 'የጫካ ቡና ምርት ወደ ዓለም አቀፍ ገበያ ለመላክ ዝግጅት', 'ከማጃንግ ደኖች የሚገኘው ኦርጋኒክ ቡና በአውሮፓ ገበያ ተቀባይነት አግኝቷል።'),
                ('ጥር 2026', 'ለወጣቶች የስራ ዕድል ፕሮግራም ተጀመረ', 'ከ50 በላይ ወጣቶች በጫካ ቡና ምርት እና ማቀነባበሪያ ስልጠና እንዲሰጡ ተደረገ።')
            );
        }
    });

    // Insert default settings if not exists
    db.get("SELECT * FROM settings WHERE key = 'exchange_rate'", (err, row) => {
        if (err) return console.error(err.message);
        if (!row) {
            const defaults = [
                ['exchange_rate', '161.72'],
                ['coffee_price_grade1', '450'],
                ['coffee_price_grade2', '520'],
                ['coffee_price_grade3', '600'],
                ['coffee_price_ground', '650'],
                ['wholesale_price', '42000'],
                ['grade1_price', '3.94'],
                ['grade2_price', '3.81'],
                ['grade3_price', '2.47'],
                ['grade4_price', '2.74'],
                ['grade5_price', '3.50']
            ];
            defaults.forEach(([key, value]) => {
                db.run(
                    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?),
                    [key, value],
                    function (e) {
                        if (e) console.error(e.message);
                    }
                );
            });
        }
    });

    // Insert default member for testing
    db.get("SELECT * FROM members WHERE member_id = 'GMFC001'", (err, row) => {
        if (!row) {
            db.run(INSERT INTO members (member_id, full_name, password) VALUES ('GMFC001', 'Test Member', 'pass123'));
        }
    });
});

// ============= API ROUTES =============

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get company profile
app.get('/api/profile', (req, res) => {
    db.get("SELECT * FROM company_profile WHERE id = 1", (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Profile not found" });
        }
        res.json({
            currentName: row.company_name,
            legalRegistration: { investmentLicenseNo: row.license_number },
            generalManager: row.general_manager,
            heroTitle: row.hero_title,
            heroSubtitle: row.hero_subtitle
        });
    });
});

// Update company profile
app.put('/api/profile', (req, res) => {
    const { currentName, generalManager, legalRegistration, heroTitle, heroSubtitle } = req.body;
    db.run(
        UPDATE company_profile SET 
            company_name = COALESCE(?, company_name),
            general_manager = COALESCE(?, general_manager),
            license_number = COALESCE(?, license_number),
            hero_title = COALESCE(?, hero_title),
            hero_subtitle = COALESCE(?, hero_subtitle),
            updated_at = CURRENT_TIMESTAMP 
         WHERE id = 1,
        [currentName, generalManager, legalRegistration?.investmentLicenseNo, heroTitle, heroSubtitle],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Profile updated successfully" });
        }
    );
});

// Get all applications
app.get('/api/applications', (req, res) => {
    db.all("SELECT * FROM applications ORDER BY submitted_at DESC", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Submit new inquiry
app.post('/api/applications', (req, res) => {
    const { name, phone, amount, city, date } = req.body;

    if (!name  !phone  !amount) {
        return res.status(400).json({ error: "Name, phone and amount are required" });
    }

    db.run(
        INSERT INTO applications (name, phone, amount, city, date, status) VALUES (?, ?, ?, ?, ?, 'pending'),
        [name, phone, amount, city  '', date  new Date().toLocaleDateString()],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                success: true,
                message: "Inquiry submitted successfully",
                id: this.lastID
            });
        }
    );
});

// Update application status
app.put('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.run(UPDATE applications SET status = ? WHERE id = ?, [status, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: Application ${status} });
    });
});

// Delete application
app.delete('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    db.run(DELETE FROM applications WHERE id = ?, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Get all news
app.get('/api/news', (req, res) => {
    db.all("SELECT * FROM news ORDER BY created_at DESC", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add new news
app.post('/api/news', (req, res) => {
    const { year, title, description } = req.body;

    if (!year  !title  !description) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.run(INSERT INTO news (year, title, description) VALUES (?, ?, ?), [year, title, description], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// Delete news
app.delete('/api/news/:id', (req, res) => {
    const { id } = req.params;
    db.run(DELETE FROM news WHERE id = ?, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Get Settings
app.get('/api/settings', (req, res) => {
    db.all("SELECT * FROM settings", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const settingsObj = {};
        rows.forEach(row => {
            settingsObj[row.key] = row.value;
        });
        res.json(settingsObj);
    });
});

// Update Settings (UPSERT)
app.put('/api/settings', (req, res) => {
    const updates = req.body;

    const queries = Object.keys(updates).map(key => {
        return new Promise((resolve, reject) => {
            db.run(
                INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
                 ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP,
                [key, updates[key]],
                function (err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    });

    Promise.all(queries)
        .then(() => res.json({ success: true, message: "Settings updated successfully" }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// ============= MEMBER AUTH ROUTES =============

// Register a new member (For admin use)
app.post('/api/members', (req, res) => {
    const { member_id, full_name, password } = req.body;

    if (!member_id  !full_name  !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    db.run(
        INSERT INTO members (member_id, full_name, password) VALUES (?, ?, ?),
        [member_id, full_name, password],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: "Member ID already exists" });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: "Member registered successfully", id: this.lastID });
        }
    );
});

// Login member
app.post('/api/login', (req, res) => {
    const { member_id, password } = req.body;

    if (!member_id || !password) {
        return res.status(400).json({ error: "Member ID and Password are required" });
    }

    db.get(
        SELECT * FROM members WHERE member_id = ? AND password = ?,
        [member_id, password],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(401).json({ error: "Invalid Member ID or Password" });
            }
            
            // Success
            res.json({
                success: true,
                message: "Login successful",
                user: {
                    id: row.id,
                    member_id: row.member_id,
                    full_name: row.full_name
                }
            });
        }
    );
});

// Get statistics
app.get('/api/stats', (req, res) => {
    db.get("SELECT COUNT(*) as total FROM applications WHERE status = 'approved'", (err, approved) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.get("SELECT COUNT(*) as total FROM applications WHERE status = 'pending'", (err, pending) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                totalApproved: approved?.total || 0,
                totalPending: pending?.total || 0
            });
        });
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(✅ GMFC Server running on port ${PORT});
    console.log(📍 URL: http://localhost:${PORT});
    console.log(🩺 Health: http://localhost:${PORT}/api/health);
});
