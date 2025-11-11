// src/controllers/upload.controller.js

// Tek bir dosya yükleme işlemi
const uploadSingleImage = (req, res) => {
  try {
    // 1. Dosya yüklenemezse (upload.middleware.js'deki fileFilter hatası)
    if (!req.file) {
      // (Aslında middleware hatayı yakalar ama biz yine de kontrol edelim)
      return res.status(400).json({ error: 'Dosya yüklenemedi veya resim formatı desteklenmiyor.' });
    }

    // 2. Dosya başarıyla yüklendiyse, dosyanın URL'sini döndür
    //    Frontend bu URL'yi alıp veritabanına (örn: Slider) kaydedecek.
    
    // Sunucu adresini (http://localhost:3001) al
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    
    // Dosyanın tam public URL'si
    // 'req.file.path' (örn: "uploads/image-123.jpg")
    // Windows'ta ters slash (\) olabileceğinden 'filename' kullanmak daha güvenlidir.
    const imageUrl = `${serverUrl}/uploads/${req.file.filename}`;

    res.status(201).json({
      message: 'Dosya başarıyla yüklendi.',
      imageUrl: imageUrl // -> "http://localhost:3001/uploads/slider-1678886400000.jpg"
    });

  } catch (error) {
    res.status(500).json({ error: 'Dosya yüklenirken bir hata oluştu: ' + error.message });
  }
};

// Çoklu dosya yükleme (örn: Ürün galerisi için)
const uploadMultipleImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Dosyalar yüklenemedi.' });
    }

    const serverUrl = `${req.protocol}://${req.get('host')}`;
    
    const imageUrls = req.files.map(file => {
      return `${serverUrl}/uploads/${file.filename}`;
    });

    res.status(201).json({
      message: 'Dosyalar başarıyla yüklendi.',
      imageUrls: imageUrls // -> ["http://.../url1.jpg", "http://.../url2.jpg"]
    });

  } catch (error) {
    res.status(500).json({ error: 'Dosyalar yüklenirken bir hata oluştu: ' + error.message });
  }
};


module.exports = {
  uploadSingleImage,
  uploadMultipleImages
};