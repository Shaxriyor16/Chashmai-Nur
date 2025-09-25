require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Food = require('./models/Food.cjs');

const app = express();
const PORT = process.env.PORT || 10000;

// Papkalarni yaratish
const PUBLIC_DIR = path.join(__dirname, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);

// Middleware
app.use(express.static(PUBLIC_DIR));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 } }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB ulanish
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ DB error:', err));

// --- Routes ---

// Index (foydalanuvchi menyu)
app.get('/', async (req, res) => {
  const foods = await Food.find({ deleted: false }).sort({ createdAt: -1 });
  res.render('index', { foods });
});

// Admin panel
app.get('/admin', async (req, res) => {
  const foods = await Food.find().sort({ createdAt: -1 });
  res.render('admin', { foods });
});

// Ovqat qo‘shish
app.post('/add-food', async (req, res) => {
  const { name, description, price, category } = req.body;
  const file = req.files?.image;
  let imageUrl = null;

  if (file) {
    const fileName = Date.now() + path.extname(file.name);
    const savePath = path.join(IMAGES_DIR, fileName);
    await file.mv(savePath);
    imageUrl = `/images/${fileName}`;
  }

  await Food.create({ name, description, price, category, image: imageUrl });
  res.redirect('/admin');
});

// Ovqatni soft delete qilish
app.post('/delete-food/:id', async (req, res) => {
  await Food.findByIdAndUpdate(req.params.id, { deleted: true });
  res.redirect('/admin');
});

// Ovqatni yangilash
app.post('/update-food/:id', async (req, res) => {
  const { name, description, price, category } = req.body;
  const file = req.files?.image;

  const updateData = { name, description, price, category };
  if (file) {
    const fileName = Date.now() + path.extname(file.name);
    const savePath = path.join(IMAGES_DIR, fileName);
    await file.mv(savePath);
    updateData.image = `/images/${fileName}`;
  }

  await Food.findByIdAndUpdate(req.params.id, updateData);
  res.redirect('/admin');
});

// Serverni ishga tushurish
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
