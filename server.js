const dns = require('dns');
// በRender ላይ የMongoDB Atlas ግንኙነት እንዳይቋረጥ የDNS ማስተካከያ
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
})
.then(() => console.log('✅ MongoDB Connected for Products, News, Members & Settings'))
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('querySrv')) {
        console.error('💡 DNS ችግር ነው። እባክህ የMongoDB Atlas ኔትወርክ ፈቃድን አረጋግጥ።');
    } else if (err.message.includes('authentication failed')) {
        console.error('💡 የይለፍ ቃል ስህተት ነው። በMONGODB_URI ውስጥ ያለውን ፓስወርድ አረጋግጥ።');
    }
});
// ✅ የቆየውን የስልክ ቁጥር ኢንዴክስ ለማጥፋት
mongoose.connection.once('open', async () => {
    try {
        await mongoose.connection.db.collection('members').dropIndex('phone_1');
        console.log('✅ የቆየው የስልክ ቁጥር ኢንዴክስ በተሳካ ሁኔታ ጠፍቷል!');
    } catch (err) {
        // ኢንዴክሱ አስቀድሞ ከጠፋ ስህተት እንዳያሳይ
        if (err.code === 27 || err.message.includes('index not found')) {
            console.log('ℹ️ ኢንዴክሱ አስቀድሞ ጠፍቷል።');
        } else {
            console.log('⚠️ ኢንዴክስ ሲጠፋ ስህተት አጋጥሟል:', err.message);
        }
    }
});

// ==========================================
// 🔴 MongoDB Schemas
// ==========================================

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

// News Schema
const newsSchema = new mongoose.Schema({
    year: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});
const News = mongoose.model('News', newsSchema);

// ✅ Member Schema
const memberSchema = new mongoose.Schema({
    member_id: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    password: { type: String, required: true }, 
    phone: { type: String, unique: true, sparse: true },
    created_at: { type: Date, default: Date.now }
});
const Member = mongoose.model('Member', memberSchema);

// ✅ Settings Schema
const settingsSchema = new mongoose.Schema({
    exchange_rate: { type: String, default: '161.72' },
    coffee_price_grade1: { type: String, default: '450' },
    coffee_price_grade2: { type: String, default: '520' },
    coffee_price_grade3: { type: String, default: '600' },
    coffee_price_ground: { type: String, default: '650' },
    wholesale_price: { type: String, default: '42000' },
    grade1_price: { type: String, default: '3.94' },
    grade2_price: { type: String, default: '3.81' },
    grade3_price: { type: String, default: '2.47' },
    grade4_price: { type: String, default: '2.74' },
    grade5_price: { type: String, default: '3.50' }
}, { timestamps: true });
const Settings = mongoose.model('Settings', settingsSchema);

// ==========================================
// SQLite Database (ለተቀሩት ስርዓቶች ብቻ)
// ==========================================
const db = new sqlite3.Database('./gmfc_database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS applications ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, amount TEXT NOT NULL, city TEXT, status TEXT DEFAULT 'pending', date TEXT NOT NULL, submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
    db.run(`CREATE TABLE IF NOT EXISTS company_profile ( id INTEGER PRIMARY KEY AUTOINCREMENT, company_name TEXT NOT NULL, license_number TEXT NOT NULL, general_manager TEXT NOT NULL, hero_title TEXT, hero_subtitle TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
    db.run(`CREATE TABLE IF NOT EXISTS messages ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, content TEXT NOT NULL, sender TEXT DEFAULT 'Admin', created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
    db.run(`CREATE TABLE IF NOT EXISTS chats ( id INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT NOT NULL, sender_type TEXT NOT NULL, message TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

    db.get("SELECT * FROM company_profile WHERE id = 1", (err, row) => {
        if (!row) {
            db.run(
                `INSERT INTO company_profile (id, company_name, license_number, general_manager, hero_title, hero_subtitle) VALUES (1, ?, ?, ?, ?, ?)`,
                ['የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር አክሲዬን ማህበር', 'GMFC/INV/2024/0123', 'ኢንጂነር ሰይድ ይማም አሸብር', 'የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር', 'ከማጃንግ ጥቅጥቅ ያሉ ደኖች፣ ሜጢ ከተማ - ለዓለም ገበያ የሚቀርብ ንጹህ የኢትዮጵያ የጫካ ቡና!']
            );
        }
    });
});

// ============= API ROUTES =============
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// Profile (SQLite)
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

// Applications (SQLite)
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

// ============= NEWS ROUTES (MongoDB) =============
app.get('/api/news', async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/news', async (req, res) => {
    try {
        const { year, title, description, image } = req.body;
        if (!year || !title || !description) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const newNews = new News({ year, title, description, image });
        await newNews.save();
        res.json({ success: true, id: newNews._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await News.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= SETTINGS ROUTES (MongoDB) =============
async function getOrCreateSettings() {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
        console.log('✅ አዲስ Settings ሰነድ ተፈጥሯል (MongoDB)');
    }
    return settings;
}

app.get('/api/settings', async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        const updates = req.body;
        const settings = await Settings.findOneAndUpdate(
            {},
            { $set: updates },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true, message: "Settings updated successfully", data: settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= MEMBERS ROUTES (MongoDB) =============
app.get('/api/members', async (req, res) => {
    try {
        const members = await Member.find().select('-password').sort({ created_at: -1 }); 
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/members', async (req, res) => {
    try {
        const { member_id, full_name, password } = req.body;
        if (!member_id || !full_name || !password) return res.status(400).json({ error: "All fields are required" });
        
        const existingMember = await Member.findOne({ member_id });
        if (existingMember) return res.status(400).json({ error: "Member ID already exists" });

        const newMember = new Member({ member_id, full_name, password });
        await newMember.save();
        res.json({ success: true, message: "Member registered successfully", id: newMember._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, password } = req.body;
        
        let updateData = { full_name };
        if (password) updateData.password = password; 

        const updatedMember = await Member.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedMember) return res.status(404).json({ error: "Member not found" });
        
        res.json({ success: true, message: "Member updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Member.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login (MongoDB)
app.post('/api/login', async (req, res) => {
    try {
        const { member_id, password } = req.body;
        if (!member_id || !password) return res.status(400).json({ error: "Member ID and Password are required" });
        
        const user = await Member.findOne({ member_id, password });
        if (!user) return res.status(401).json({ error: "Invalid Member ID or Password" });
        
        res.json({ 
            success: true, 
            message: "Login successful", 
            user: { id: user._id, member_id: user.member_id, full_name: user.full_name } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Messages (SQLite)
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

// ============= CHAT ROUTES (SQLite) =============
app.post('/api/chats', (req, res) => {
    const { member_id, sender_type, message } = req.body;
    if (!member_id || !sender_type || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }
    db.run(
        `INSERT INTO chats (member_id, sender_type, message) VALUES (?, ?, ?)`,
        [member_id, sender_type, message],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.get('/api/admin/chats', (req, res) => {
    db.all("SELECT DISTINCT member_id FROM chats", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/chats/:member_id', (req, res) => {
    const { member_id } = req.params;
    db.all(
        `SELECT * FROM chats WHERE member_id = ? ORDER BY created_at ASC`, 
        [member_id], 
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ============= PRODUCTS ROUTES (MongoDB) =============
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

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price, category, description } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { title, price, category, description },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// ============= STATS (MongoDB & SQLite) =============
app.get('/api/stats', (req, res) => {
    db.get("SELECT COUNT(*) as total FROM applications WHERE status = 'approved'", (err, approved) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get("SELECT COUNT(*) as total FROM applications WHERE status = 'pending'", (err, pending) => {
            if (err) return res.status(500).json({ error: err.message });
            
            Member.countDocuments()
                .then(memberCount => {
                    res.json({ 
                        totalApproved: approved?.total || 0, 
                        totalPending: pending?.total || 0, 
                        totalMembers: memberCount || 0 
                    });
                })
                .catch(err => res.status(500).json({ error: err.message }));
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
