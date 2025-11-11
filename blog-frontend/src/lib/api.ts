import axios from 'axios';

// 1. .env.local dosyasından API adresini al
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 2. Merkezi axios örneğini (instance) oluştur
const api = axios.create({
  baseURL: API_URL
});

// 3. (En Önemli Adım) Request Interceptor (İstek Yakalayıcı)
// Bu kod, axios ile yapılan HER isteği göndermeden hemen önce yakalar.
api.interceptors.request.use(
  (config) => {
    // 4. Tarayıcının localStorage'ından (giriş yapınca kaydedeceğimiz) token'ı al
    const token = localStorage.getItem('authToken');
    
    // 5. Eğer token varsa, isteğin 'Authorization' başlığına ekle
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;