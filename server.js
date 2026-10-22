const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const mongoose = require('mongoose'); // 🔴 አዲስ የተጨመረ

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('.'));

// ==========================================
// 🔴 MongoDB Connection (ለ Products ብቻ)
// ==========================================
// ⚠️ እባክህ የራስህን የ MongoDB ሊንክ እዚህ አስገባ
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@cluster0...';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected for Products'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' }, // Base64 ፎቶ
    seller_name: { type: String, default: 'GMFC Admin' },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// ==========================================
// SQLite Database (ለተቀሩት ስርዓቶች)
// ==========================================
const db = new sqlite3.Database('./gmfc_database.db');

db.serialize(() => {
    // Applications table
    db.run(`CREATE TABLE IF NOT EXISTS applications ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, amount TEXT NOT NULL, city TEXT, status TEXT DEFAULT 'pending', date TEXT NOT NULL, submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

    // Company profile table
    db.run(`CREATE TABLE IF NOT EXISTS company_profile ( id INTEGER PRIMARY KEY AUTOINCREMENT, company_name TEXT NOT NULL, license_number TEXT NOT NULL, general_manager TEXT NOT NULL, hero_title TEXT, hero_subtitle TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

    // News table
    db.run(`CREATE TABLE IF NOT EXISTS news ( id INTEGER PRIMARY KEY AUTOINCREMENT, year TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

    // Settings table
    db.run(`CREATE TABLE IF NOT EXISTS settings ( id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE NOT NULL, value TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

    // Members table
    db.run(`CREATE TABLE IF NOT EXISTS members ( id INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT UNIQUE NOT NULL, full_name TEXT NOT NULL, password TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, sender TEXT DEFAULT 'Admin', created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

    // Insert default data...
    db.get("SELECT * FROM company_profile WHERE id = 1", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO company_profile (id, company_name, license_number, general_manager, hero_title, hero_subtitle) VALUES (1, ?, ?, ?, ?, ?)`, [
                'የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር አክሲዬን ማህበር', 
                'GMFC/INV/2024/0123', 
                'ኢንጂነር ሰይድ ይማም አሸብር', 
                'የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር', 
                'ከማጃንግ ጥቅጥቅ ያሉ ደኖች፣ ሜጢ ከተማ - ለዓለም ገበያ የሚቀርብ ንጹህ የኢትዮጵያ የጫካ ቡና!'
            ]);
        }
    });

    db.get("SELECT * FROM members WHERE member_id = 'GMFC001'", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO members (member_id, full_name, password) VALUES ('GMFC001', 'Test Member', 'pass123')`);
        }
    });
});

// ============= API ROUTES =============

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Profile
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

// Login Member
app.post('/api/login', (req, res) => {
    const { member_id, password } = req.body;
    if (!member_id || !password) return res.status(400).json({ error: "Member ID and Password are required" });

    db.get(`SELECT * FROM members WHERE member_id = ? AND password = ?`, [member_id, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid Member ID or Password" });
        res.json({ success: true, message: "Login successful", user: { id: row.id, member_id: row.member_id, full_name: row.full_name } });
    });
});

// ==========================================
// 🔴 PRODUCTS ROUTES (MongoDB)
// ==========================================

// Add Product
app.post('/api/products', async (req, res) => {
    try {
        const { title, price, category, description, image, seller_name } = req.body;
        
        // ✅ የጎደለው '||' ኦፕሬተር ተጨምሯል
        if (!title || !price || !category) {
            return res.status(400).json({ error: "Title, price and category are required" });
        }

        const newProduct = new Product({
            title, price, category, description, image, seller_name
        });

        await newProduct.save();
        res.json({ success: true, message: "Product added successfully", id: newProduct._id });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Failed to add product to database" });
    }
});

// Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// ============= HEALTH CHECK =============
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ GMFC Server running on port ${PORT}`);
});
