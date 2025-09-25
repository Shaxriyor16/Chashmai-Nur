import express from "express";
import mongoose from "mongoose";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB modeli
const foodSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  new: { type: Boolean, default: true },
});
const Food = mongoose.model("Food", foodSchema);

// Admin login kodi
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "crazyshaxgamerpubg2009";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Sattarov2009";
const LOGIN_CODE = Math.floor(1000 + Math.random() * 9000); // tasodifiy 4 xonali kod

// MongoDB ulanish
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB error:", err));

// Routes

// Login sahifasi
app.get("/login", (req, res) => {
  res.render("login", { loginCode: LOGIN_CODE, error: null });
});

// Login POST
app.post("/login", (req, res) => {
  const { username, password, code } = req.body;
  if(username === ADMIN_USERNAME && password === ADMIN_PASSWORD && Number(code) === LOGIN_CODE){
    res.redirect("/admin");
  } else {
    res.render("login", { loginCode: LOGIN_CODE, error: "Xato login yoki kod!" });
  }
});

// Admin panel
app.get("/admin", async (req, res) => {
  const foods = await Food.find();
  res.render("admin", { foods });
});

// Ovqat qo‘shish
app.post("/add-food", async (req, res) => {
  try {
    let imagePath = "";
    if(req.files && req.files.image){
      const img = req.files.image;
      imagePath = "/uploads/" + Date.now() + "_" + img.name;
      await img.mv(path.join(__dirname, "public", imagePath));
    }
    const { name, description, price, category } = req.body;
    const food = new Food({ name, description, price, category, image: imagePath });
    await food.save();
    res.redirect("/admin");
  } catch(err) {
    console.log(err);
    res.send("❌ Xato yuz berdi");
  }
});

// Logout
app.get("/logout", (req, res) => {
  res.redirect("/login");
});

// Foydalanuvchi menyusi
app.get("/", async (req, res) => {
  const foods = await Food.find();
  res.render("index", { foods });
});

// Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
