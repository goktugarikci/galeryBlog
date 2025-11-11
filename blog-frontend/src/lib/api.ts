// src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(
  (config) => {
    // 1. Token'ı al (Mevcut kod)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 2. YENİ: Sitenin o anki dilini al (Varsayılan: 'tr')
    // Bu 'currentLang' verisini bir dil (i18n) context'inden de alabilirsiniz.
    const lang = localStorage.getItem('currentLang') || 'tr';
    
    // 3. İsteğin 'Accept-Language' başlığına veya parametresine ekle
    // Biz bunu /api/shop/checkout için 'data'ya ekleyeceğiz
    // Diğer GET istekleri için 'params'a ekleyebiliriz:
    if (!config.params) {
      config.params = {};
    }
    config.params['lang'] = lang;

    // Checkout gibi POST istekleri için 'data'ya ekle
    if (config.method === 'post' && config.data) {
        // Form verisi (FormData) değilse lang ekle
        if (!(config.data instanceof FormData)) {
            config.data.lang = lang;
        }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;