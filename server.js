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
// 🔴 MongoDB Connection & Schemas
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gambella_admin:Admin1234@gammajmembers.di2ho2h.mongodb.net/gambella_coffee_union?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Product Schema (ከንዑስ ምድብ ጋር)
const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: '' },
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

// Settings Schema
const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});
const Settings = mongoose.model('Settings', settingsSchema);

// Chat Schema
const chatSchema = new mongoose.Schema({
    member_id: { type: String, required: true },
    sender_type: { type: String, required: true },
    message: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// Member Schema
const memberSchema = new mongoose.Schema({
    member_id: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});
const Member = mongoose.model('Member', memberSchema);

// ==========================================
// SQLite Database (ለ Applications & Profile ብቻ)
// ==========================================
const db = new sqlite3.Database('./gmfc_database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS applications ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, amount TEXT NOT NULL, city TEXT, status TEXT DEFAULT 'pending', date TEXT NOT NULL, submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);
    db.run(`CREATE TABLE IF NOT EXISTS company_profile ( id INTEGER PRIMARY KEY AUTOINCREMENT, company_name TEXT NOT NULL, license_number TEXT NOT NULL, general_manager TEXT NOT NULL, hero_title TEXT, hero_subtitle TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

    db.get("SELECT * FROM company_profile WHERE id = 1", (err, row) => {
        if (!row) {
            db.run(
                `INSERT INTO company_profile (id, company_name, license_number, general_manager, hero_title, hero_subtitle) VALUES (1, ?, ?, ?, ?, ?)`,
                ['የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር አክሲዬን ማህበር', 'GMFC/INV/2024/0123', 'ኢንጂነር ሰይድ ይማም አሸብር', 'የጋምቤላ ማጃንግ የጫካ ቡና አምራችና ኤክስፖርተር', 'ከማጃንግ ጥቅጥቅ ያሉ ደኖች፣ ሜጢ ከተማ - ለዓለም ገበያ የሚቀርብ ንጹህ የኢትዮጵያ የጫካ ቡና!']
            );
        }
    });
});

// ==========================================
// MongoDB Seeding
// ==========================================
async function seedDatabase() {
    try {
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            const defaults = [
                { key: 'exchange_rate', value: '161.72' }, { key: 'coffee_price_grade1', value: '450' },
                { key: 'coffee_price_grade2', value: '520' }, { key: 'coffee_price_grade3', value: '600' },
                { key: 'coffee_price_ground', value: '650' }, { key: 'wholesale_price', value: '42000' },
                { key: 'grade1_price', value: '3.94' }, { key: 'grade2_price', value: '3.81' },
                { key: 'grade3_price', value: '2.47' }, { key: 'grade4_price', value: '2.74' }, { key: 'grade5_price', value: '3.50' }
            ];
            await Settings.insertMany(defaults);
            console.log('✅ Default Settings inserted into MongoDB');
        }

        const memberCount = await Member.countDocuments();
        if (memberCount === 0) {
            await Member.create({ member_id: 'GMFC001', full_name: 'Test Member', password: 'pass123' });
            console.log('✅ Default Member inserted into MongoDB');
        }

        const newsCount = await News.countDocuments();
        if (newsCount === 0) {
            await News.insertMany([
                { year: 'መስከረም 2025', title: 'የጂ+5 ህንፃ ግንባታ ሥራ መጀመሩ ተገለጸ', description: 'በሜጢ ከተማ የመጀመሪያው የG+5 የንግድ ማዕከል ግንባታ በይፋ ተጀመረ።' },
                { year: 'ታህሳስ 2025', title: 'የጫካ ቡና ምርት ወደ ዓለም አቀፍ ገበያ ለመላክ ዝግጅት', description: 'ከማጃንግ ደኖች የሚገኘው ኦርጋኒክ ቡና በአውሮፓ ገበያ ተቀባይነት አግኝቷል።' }
            ]);
            console.log('✅ Default News inserted into MongoDB');
        }
    } catch (error) {
        console.error('❌ Seeding Error:', error);
    }
}
seedDatabase();

// ============= API ROUTES =============

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ============= PROFILE ROUTES (SQLite) =============
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

// ============= APPLICATIONS ROUTES (SQLite) =============
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

// ============= MEMBERS ROUTES (MongoDB) =============
app.get('/api/members', async (req, res) => {
    try {
        const members = await Member.find().sort({ created_at: -1 });
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/members', async (req, res) => {
    try {
        const { member_id, full_name, password } = req.body;
        if (!member_id || !full_name || !password) return res.status(400).json({ error: "All fields are required" });
        
        const existing = await Member.findOne({ member_id });
        if (existing) return res.status(400).json({ error: "Member ID already exists" });

        const newMember = new Member({ member_id, full_name, password });
        await newMember.save();
        res.json({ success: true, message: "Member registered successfully", id: newMember._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, password } = req.body;
        
        const updateData = {};
        if (full_name) updateData.full_name = full_name;
        if (password) updateData.password = password;

        await Member.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Member updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Member.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { member_id, password } = req.body;
        if (!member_id || !password) return res.status(400).json({ error: "Member ID and Password are required" });
        
        const member = await Member.findOne({ member_id, password });
        if (!member) return res.status(401).json({ error: "Invalid Member ID or Password" });
        
        res.json({
            success: true,
            message: "Login successful",
            user: { id: member._id, member_id: member.member_id, full_name: member.full_name }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
        if (!year || !title || !description) return res.status(400).json({ error: "All fields are required" });
        
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
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await Settings.find();
        const settingsObj = {};
        settings.forEach(s => { settingsObj[s.key] = s.value; });
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        const updates = req.body;
        const keys = Object.keys(updates);

        for (const key of keys) {
            await Settings.findOneAndUpdate(
                { key: key },
                { value: updates[key], updatedAt: Date.now() },
                { upsert: true, new: true }
            );
        }
        res.json({ success: true, message: "Settings updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= PRODUCTS ROUTES (MongoDB) =============
app.post('/api/products', async (req, res) => {
    try {
        const { title, price, category, subcategory, description, image, seller_name } = req.body;
        if (!title || !price || !category) return res.status(400).json({ error: "Title, price and category are required" });
        
        const newProduct = new Product({ title, price, category, subcategory, description, image, seller_name });
        await newProduct.save();
        res.json({ success: true, message: "Product added successfully", id: newProduct._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: "Database connection not ready. Please try again." });
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price, category, subcategory, description } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(id, { title, price, category, subcategory, description }, { new: true });
        if (!updatedProduct) return res.status(404).json({ error: "Product not found" });
        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) return res.status(404).json({ error: "Product not found" });
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= CHAT ROUTES (MongoDB) =============
app.post('/api/chats', async (req, res) => {
    try {
        const { member_id, sender_type, message } = req.body;
        if (!member_id || !sender_type || !message) return res.status(400).json({ error: "All fields are required" });
        
        const newChat = new Chat({ member_id, sender_type, message });
        await newChat.save();
        res.json({ success: true, id: newChat._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/chats/:member_id', async (req, res) => {
    try {
        const { member_id } = req.params;
        const chats = await Chat.find({ member_id }).sort({ created_at: 1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/chats', async (req, res) => {
    try {
        const uniqueMembers = await Chat.distinct('member_id');
        const formatted = uniqueMembers.map(id => ({ member_id: id }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= STATS ROUTES =============
app.get('/api/stats', async (req, res) => {
    try {
        const totalMembers = await Member.countDocuments();
        
        db.get("SELECT COUNT(*) as total FROM applications WHERE status = 'approved'", (err, approved) => {
            if (err) return res.status(500).json({ error: err.message });
            db.get("SELECT COUNT(*) as total FROM applications WHERE status = 'pending'", (err, pending) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({
                    totalApproved: approved?.total || 0,
                    totalPending: pending?.total || 0,
                    totalMembers: totalMembers || 0
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ GMFC Server running on port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
    console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
});
