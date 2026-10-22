const dns = require('dns');
// DNS ችግርን ለመፍታት የጎግል እና የCloudflare DNS እንጠቀም
dns.setServers(['8.8.8.8', '1.1.1.1']); 

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('.'));

// ==========================================
// 🔴 MongoDB Connection
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gambella_admin:Admin1234@gammajmembers.di2ho2h.mongodb.net/gambella_coffee_union?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected for Products'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('querySrv')) {
        console.error('💡 DNS ችግር ነው። እባክህ የMongoDB Atlas ኔትወርክ ፈቃድን አረጋግጥ።');
    } else if (err.message.includes('authentication failed')) {
        console.error('💡 የይለፍ ቃል ስህተት ነው። በMONGODB_URI ውስጥ ያለውን ፓስወርድ አረጋግጥ።');
    }
});

// Product Schema
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    seller_name: { type: String, default: 'GMFC Admin' },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// ==========================================
// SQLite Database (ለተቀሩት ስርዓቶች)
// ==========================================
const db = new sqlite3.Database('./gmfc_database.db');

db.serialize(() => {
    // ሠንጠረዦችን መፍጠር
    db.run(`CREATE TABLE IF NOT EXISTS applications ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, amount TEXT NOT NULL, city TEXT, status TEXT DEFAULT 'pending', date TEXT NOT NULL, submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
    db.run(`CREATE TABLE IF NOT EXISTS company_profile ( id INTEGER PRIMARY KEY AUTOINCREMENT, company_name TEXT NOT NULL, license_number TEXT NOT NULL, general_manager TEXT NOT NULL, hero_title TEXT, hero_subtitle TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
    db.run(`CREATE TABLE IF NOT EXISTS news ( id INTEGER PRIMARY KEY AUTOINCREMENT, year TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
    db.run(`CREATE TABLE IF NOT EXISTS settings ( id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE NOT NULL, value TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
    db.run(`CREATE TABLE IF NOT EXISTS members ( id INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT UNIQUE NOT NULL, full_name TEXT NOT NULL, password TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
    db.run(`CREATE TABLE IF NOT EXISTS messages ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, sender TEXT DEFAULT 'Admin', created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

    // Company Profile
    db.get("SELECT * FROM company_profile WHERE id = 1", (err, row) => {
        if (!row) {
            db.run(
                `INSERT INTO company_profile (id, company_name, license_number, general_manager, hero_title, hero_subtitle) VALUES (1, ?, ?, ?, ?, ?)`,
                ['የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር አክሲዬን ማህበር', 'GMFC/INV/2024/0123', 'ኢንጂነር ሰይድ ይማም አሸብር', 'የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር', 'ከማጃንግ ጥቅጥቅ ያሉ ደኖች፣ ሜጢ ከተማ - ለዓለም ገበያ የሚቀርብ ንጹህ የኢትዮጵያ የጫካ ቡና!']
            );
        }
    });

    // News
    db.get("SELECT * FROM news LIMIT 1", (err, row) => {
        if (!row) {
            db.run(
                `INSERT INTO news (year, title, description) VALUES ('መስከረም 2025', 'የጂ+5 ህንፃ ግንባታ ሥራ መጀመሩ ተገለጸ', 'በሜጢ ከተማ የመጀመሪያው የG+5 የንግድ ማዕከል ግንባታ በይፋ ተጀመረ።'), ('ታህሳስ 2025', 'የጫካ ቡና ምርት ወደ ዓለም አቀፍ ገበያ ለመላክ ዝግጅት', 'ከማጃንግ ደኖች የሚገኘው ኦርጋኒክ ቡና በአውሮፓ ገበያ ተቀባይነት አግኝቷል።'), ('ጥር 2026', 'ለወጣቶች የስራ ዕድል ፕሮግራም ተጀመረ', 'ከ50 በላይ ወጣቶች በጫካ ቡና ምርት እና ማቀነባበሪያ ስልጠና እንዲሰጡ ተደረገ።')`
            );
        }
    });

    // Settings
    db.get("SELECT * FROM settings WHERE key = 'exchange_rate'", (err, row) => {
        if (!row) {
            const defaults = [
                ['exchange_rate', '161.72'], ['coffee_price_grade1', '450'], ['coffee_price_grade2', '520'],
                ['coffee_price_grade3', '600'], ['coffee_price_ground', '650'], ['wholesale_price', '42000'],
                ['grade1_price', '3.94'], ['grade2_price', '3.81'], ['grade3_price', '2.47'],
                ['grade4_price', '2.74'], ['grade5_price', '3.50']
            ];
            defaults.forEach(([key, value]) => {
                db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
            });
        }
    });

    // Members
    db.get("SELECT * FROM members WHERE member_id = 'GMFC001'", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO members (member_id, full_name, password) VALUES ('GMFC001', 'Test Member', 'pass123')`);
        }
    });
});

// ============= API ROUTES =============
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

app.get('/api/profile', (req, res) => {
    db.get("SELECT * FROM company_profile WHERE id = 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Profile not found" });
        res.json({ currentName: row.company_name, legalRegistration: { investmentLicenseNo: row.license_number }, generalManager: row.general_manager, heroTitle: row.hero_title, heroSubtitle: row.hero_subtitle });
    });
});

app.put('/api/profile', (req, res) => {
    const { currentName, generalManager, legalRegistration, heroTitle, heroSubtitle } = req.body;
    db.run(`UPDATE company_profile SET company_name = COALESCE(?, company_name), general_manager = COALESCE(?, general_manager), license_number = COALESCE(?, license_number), hero_title = COALESCE(?, hero_title), hero_subtitle = COALESCE(?, hero_subtitle), updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
        [currentName, generalManager, legalRegistration?.investmentLicenseNo, heroTitle, heroSubtitle],
        function (err) {
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
    if (!name || !phone || !amount) return res.status(400).json({ error: "Name, phone and amount are required" });
    db.run(`INSERT INTO applications (name, phone, amount, city, date, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
        [name, phone, amount, city || '', date || new Date().toLocaleDateString()],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "Inquiry submitted successfully", id: this.lastID });
        }
    );
});

app.put('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.run(`UPDATE applications SET status = ? WHERE id = ?`, [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: `Application ${status}` });
    });
});

app.delete('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM applications WHERE id = ?`, [id], function (err) {
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
    if (!year || !title || !description) return res.status(400).json({ error: "All fields are required" });
    db.run(`INSERT INTO news (year, title, description) VALUES (?, ?, ?)`, [year, title, description], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

app.delete('/api/news/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM news WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/settings', (req, res) => {
    db.all("SELECT * FROM settings", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settingsObj = {};
        rows.forEach(row => { settingsObj[row.key] = row.value; });
        res.json(settingsObj);
    });
});

app.put('/api/settings', (req, res) => {
    const updates = req.body;
    const queries = Object.keys(updates).map(key => new Promise((resolve, reject) => {
        db.run(`INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
            [key, updates[key]],
            function (err) { if (err) reject(err); else resolve(); }
        );
    }));
    Promise.all(queries).then(() => res.json({ success: true, message: "Settings updated successfully" })).catch(err => res.status(500).json({ error: err.message }));
});

app.get('/api/members', (req, res) => {
    db.all("SELECT id, member_id, full_name, created_at FROM members ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/members', (req, res) => {
    const { member_id, full_name, password } = req.body;
    if (!member_id || !full_name || !password) return res.status(400).json({ error: "All fields are required" });
    db.run(`INSERT INTO members (member_id, full_name, password) VALUES (?, ?, ?)`,
        [member_id, full_name, password],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(400).json({ error: "Member ID already exists" });
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: "Member registered successfully", id: this.lastID });
        }
    );
});

app.put('/api/members/:id', (req, res) => {
    const { id } = req.params;
    const { full_name, password } = req.body;
    db.run(`UPDATE members SET full_name = COALESCE(?, full_name), password = COALESCE(?, password) WHERE id = ?`,
        [full_name, password, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "Member updated successfully" });
        }
    );
});

app.delete('/api/members/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM members WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/login', (req, res) => {
    const { member_id, password } = req.body;
    if (!member_id || !password) return res.status(400).json({ error: "Member ID and Password are required" });
    db.get(`SELECT * FROM members WHERE member_id = ? AND password = ?`, [member_id, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid Member ID or Password" });
        res.json({ success: true, message: "Login successful", user: { id: row.id, member_id: row.member_id, full_name: row.full_name } });
    });
});

app.get('/api/messages', (req, res) => {
    db.all("SELECT * FROM messages ORDER BY created_at DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/messages', (req, res) => {
    const { title, content, sender } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Title and content are required" });
    db.run(`INSERT INTO messages (title, content, sender) VALUES (?, ?, ?)`, [title, content, sender || 'Admin'], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Message sent successfully", id: this.lastID });
    });
});

app.delete('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM messages WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ============= 🔴 PRODUCTS ROUTES (MongoDB) =============
app.post('/api/products', async (req, res) => {
    try {
        const { title, price, category, description, image, seller_name } = req.body;
        if (!title || !price || !category) return res.status(400).json({ error: "Title, price and category are required" });
        const newProduct = new Product({ title, price, category, description, image, seller_name });
        await newProduct.save();
        res.json({ success: true, message: "Product added successfully", id: newProduct._id });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Failed to add product to database" });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: "Database connection not ready. Please try again in a moment." });
        }
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

app.get('/api/stats', (req, res) => {
    db.get("SELECT COUNT(*) as total FROM applications WHERE status = 'approved'", (err, approved) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get("SELECT COUNT(*) as total FROM applications WHERE status = 'pending'", (err, pending) => {
            if (err) return res.status(500).json({ error: err.message });
            db.get("SELECT COUNT(*) as total FROM members", (err, members) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ totalApproved: approved?.total || 0, totalPending: pending?.total || 0, totalMembers: members?.total || 0 });
            });
        });
    });
});

app.get('/api/health', (req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }); });

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ GMFC Server running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
});
