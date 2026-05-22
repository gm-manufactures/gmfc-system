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

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        amount TEXT NOT NULL,
        city TEXT,
        status TEXT DEFAULT 'pending',
        date TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS company_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        license_number TEXT NOT NULL,
        general_manager TEXT NOT NULL,
        hero_title TEXT,
        hero_subtitle TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Insert default data
    db.get("SELECT * FROM company_profile WHERE id = 1", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO company_profile (id, company_name, license_number, general_manager, hero_title, hero_subtitle)
                VALUES (1, ?, ?, ?, ?, ?)`, [
                'የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር አክሲዬን ማህበር',
                'GMFC/INV/2024/0123',
                'ኢንጂነር ሰይድ ይማም አሸብር',
                'የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር',
                'ከማጃንግ ጥቅጥቅ ያሉ ደኖች፣ ሜጢ ከተማ - ለዓለም ገበያ የሚቀርብ ንጹህ የኢትዮጵያ የጫካ ቡና!'
            ]);
        }
    });
    
    db.get("SELECT * FROM news LIMIT 1", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO news (year, title, description) VALUES 
                ('መስከረም 2025', 'የጂ+5 ህንፃ ግንባታ ሥራ መጀመሩ ተገለጸ', 'በሜጢ ከተማ የመጀመሪያው የG+5 የንግድ ማዕከል ግንባታ በይፋ ተጀመረ።'),
                ('ታህሳስ 2025', 'የጫካ ቡና ምርት ወደ ዓለም አቀፍ ገበያ ለመላክ ዝግጅት', 'ከማጃንግ ደኖች የሚገኘው ኦርጋኒክ ቡና በአውሮፓ ገበያ ተቀባይነት አግኝቷል።'),
                ('ጥር 2026', 'ለወጣቶች የስራ ዕድል ፕሮግራም ተጀመረ', 'ከ50 በላይ ወጣቶች በጫካ ቡና ምርት እና ማቀነባበሪያ ስልጠና እንዲሰጡ ተደረገ።')
            `);
        }
    });
});

// API Routes
app.get('/api/profile', (req, res) => {
    db.get("SELECT * FROM company_profile WHERE id = 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            currentName: row.company_name,
            legalRegistration: { investmentLicenseNo: row.license_number },
            generalManager: row.general_manager,
            heroTitle: row.hero_title,
            heroSubtitle: row.hero_subtitle
        });
    });
});

app.put('/api/profile', (req, res) => {
    const { currentName, generalManager, legalRegistration, heroTitle, heroSubtitle } = req.body;
    db.run(`UPDATE company_profile SET 
        company_name = COALESCE(?, company_name),
        general_manager = COALESCE(?, general_manager),
        license_number = COALESCE(?, license_number),
        hero_title = COALESCE(?, hero_title),
        hero_subtitle = COALESCE(?, hero_subtitle),
        updated_at = CURRENT_TIMESTAMP 
        WHERE id = 1`,
        [currentName, generalManager, legalRegistration?.investmentLicenseNo, heroTitle, heroSubtitle],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Profile updated successfully" });
        }
    );
});

app.get('/api/applications', (req, res) => {
    db.all("SELECT * FROM applications ORDER BY submitted_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/applications', (req, res) => {
    const { name, phone, amount, city, date } = req.body;
    if (!name || !phone || !amount) {
        return res.status(400).json({ error: "Name, phone and amount are required" });
    }
    db.run(`INSERT INTO applications (name, phone, amount, city, date, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
        [name, phone, amount, city || '', date || new Date().toLocaleDateString()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "Inquiry submitted successfully", id: this.lastID });
        }
    );
});

app.put('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.run(`UPDATE applications SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM applications WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/news', (req, res) => {
    db.all("SELECT * FROM news ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/news', (req, res) => {
    const { year, title, description } = req.body;
    if (!year || !title || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }
    db.run(`INSERT INTO news (year, title, description) VALUES (?, ?, ?)`, [year, title, description], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

app.delete('/api/news/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM news WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/stats', (req, res) => {
    db.get("SELECT COUNT(*) as total FROM applications WHERE status = 'approved'", (err, approved) => {
        db.get("SELECT COUNT(*) as pending FROM applications WHERE status = 'pending'", (err, pending) => {
            res.json({
                totalApproved: approved?.total || 0,
                totalPending: pending?.pending || 0
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`✅ GMFC Server running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
});