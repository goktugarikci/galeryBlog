// src/middleware/upload.middleware.js

const multer = require('multer');
const path = require('path');

// 1. Dosyaların Nereye Kaydedileceğini ve Adını Belirleme (Storage)
const storage = multer.diskStorage({
  // Nereye kaydedilecek
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 2. Adımda oluşturduğumuz klasör
  },
  
  // Dosya adı ne olacak (Çakışmaları önlemek için tarihi ekliyoruz)
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Dosya adı: orjinal_ad-tarih.uzantı (örn: slider-1678886400000.jpg)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Sadece Resim Dosyalarına İzin Verme (File Filter)
const fileFilter = (req, file, cb) => {
  // Sadece jpeg, jpg ve png dosyalarına izin ver
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true); // Dosyayı kabul et
  } else {
    cb(new Error('Sadece .jpg, .jpeg veya .png formatında resim yükleyebilirsiniz.'), false); // Reddet
  }
};

// 3. Multer'ı Yapılandırma
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB dosya boyutu limiti
  },
  fileFilter: fileFilter
});

module.exports = upload;