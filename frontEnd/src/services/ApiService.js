import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Backend URL - Platform'a göre ayarla
// iOS Simulator: localhost kullan
// Android Emulator: 10.0.2.2 kullan
// Gerçek cihaz: Bilgisayarın IP adresi (örn: 192.168.1.100)
const API_BASE_URL = Platform.OS === 'ios' 
  ? 'http://localhost:8080'  // iOS Simulator için
  : __DEV__ 
    ? 'http://10.0.2.2:8080'  // Android Emulator için
    : 'http://192.168.1.100:8080'; // Gerçek cihaz için - IP adresinizi güncelleyin

// Python servisi URL'i - Platform'a göre ayarla
// iOS Simulator: localhost kullan
// Android Emulator: 10.0.2.2 kullan
// Gerçek cihaz: Bilgisayarın IP adresi
const PYTHON_SERVICE_URL = Platform.OS === 'ios' 
  ? 'http://localhost:8000'  // iOS Simulator için
  : __DEV__ 
    ? 'http://10.0.2.2:8000'  // Android Emulator için
    : 'http://192.168.1.100:8000'; // Gerçek cihaz için - IP adresinizi güncelleyin

const TOKEN_KEY = '@wordlearn_token';
const USER_KEY = '@wordlearn_user';

// Token yönetimi
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Token okuma hatası:', error);
    return null;
  }
};

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Token kaydetme hatası:', error);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Token silme hatası:', error);
  }
};

// User cache
export const getCachedUser = async () => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

export const setCachedUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('User cache hatası:', error);
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = await getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle empty responses
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || 'Bir hata oluştu',
        data,
      };
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.',
      originalError: error,
    };
  }
};

// ==================== AUTH API ====================

export const authApi = {
  /**
   * Kullanıcı girişi
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string}>}
   */
  login: async (email, password) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response?.token) {
      await setToken(response.token);
    }
    
    return response;
  },

  /**
   * Yeni kullanıcı kaydı
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @returns {Promise<{token: string}>}
   */
  register: async (email, password, name) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    if (response?.token) {
      await setToken(response.token);
    }
    
    return response;
  },

  /**
   * Çıkış yap
   */
  logout: async () => {
    await removeToken();
  },
};

// ==================== USER API ====================

export const userApi = {
  /**
   * Kullanıcı profilini getir
   * @returns {Promise<{email: string, name: string}>}
   */
  getProfile: async () => {
    const profile = await apiRequest('/user/profile', {
      method: 'GET',
    });
    
    if (profile) {
      await setCachedUser(profile);
    }
    
    return profile;
  },
};

// ==================== WORD LIST API ====================

export const wordListApi = {
  /**
   * Kullanıcının kelime listelerini getir
   * @returns {Promise<Array<{wordListId: number, name: string, words: Array}>>}
   */
  getMyLists: async () => {
    return await apiRequest('/wordlist/get-mine', {
      method: 'GET',
    });
  },

  /**
   * Yeni kelime listesi oluştur
   * @param {string} name
   */
  createList: async (name) => {
    return await apiRequest('/wordlist/create', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  /**
   * Listeye kelime ekle
   * @param {number} listId
   * @param {string} sentence - Kelimenin içinde geçtiği cümle
   * @param {number} wordStartIndex - Kelimenin cümledeki başlangıç indeksi
   * @param {number} wordLength - Kelime uzunluğu
   */
  addWord: async (listId, sentence, wordStartIndex, wordLength) => {
    return await apiRequest(`/wordlist/${listId}/add-word`, {
      method: 'POST',
      body: JSON.stringify({
        sentence,
        wordStartIndex,
        wordLength,
      }),
    });
  },
};

// ==================== QUIZ API ====================

export const quizApi = {
  /**
   * Quiz oluştur
   * @param {number} wordListId
   * @returns {Promise<{quizId: number, questions: Array}>}
   */
  generateQuiz: async (wordListId) => {
    return await apiRequest('/quiz/generate-quiz', {
      method: 'POST',
      body: JSON.stringify({ wordListId }),
    });
  },
};

// ==================== PDF EXTRACTION API ====================

export const pdfApi = {
  /**
   * PDF dosyasını Python servisine gönder ve plain text al
   * @param {string} fileUri - PDF dosyasının local URI'si
   * @returns {Promise<{text: string, pages: Array<string>, page_count: number, method: string}>}
   */
  extractTextFromPdf: async (fileUri) => {
    try {
      console.log('PDF Python servisine gönderiliyor:', fileUri);
      console.log('Python Service URL:', PYTHON_SERVICE_URL);
      
      // PDF'i base64'e çevir (React Native'de daha güvenilir)
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log(`PDF base64 boyutu: ${base64.length} karakter`);

      // FormData ile base64 gönder
      const formData = new FormData();
      formData.append('base64_data', base64);

      // Python servisine gönder (base64 endpoint kullan)
      const response = await fetch(`${PYTHON_SERVICE_URL}/extract-pdf-base64`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = `PDF extraction failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // JSON parse hatası - text olarak oku
          try {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // Text okuma da başarısız oldu
            console.error('Error reading error response:', textError);
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'PDF extraction failed');
      }

      console.log(`PDF işlendi: ${result.page_count} sayfa, ${result.text.length} karakter, Metot: ${result.method}`);
      
      return result;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw error;
    }
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Backend'den dönen kelime listesi DTO'sunu frontend formatına çevir
 */
export const transformWordList = (backendList) => {
  const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#EF4444'];
  
  return {
    id: backendList.wordListId?.toString() || backendList.id,
    name: backendList.name,
    color: colors[backendList.wordListId % colors.length] || '#3B82F6',
    wordCount: backendList.words?.length || 0,
    words: (backendList.words || []).map(transformWord),
    lastUpdated: 'Yakın zamanda',
  };
};

/**
 * Backend'den dönen kelime DTO'sunu frontend formatına çevir
 */
export const transformWord = (backendWord) => {
  return {
    id: backendWord.id?.toString(),
    english: backendWord.wordWriting || backendWord.word,
    turkish: backendWord.meaningTr || '',
    meaningEn: backendWord.meaningEn || '',
    partOfSpeech: backendWord.partOfSpeech || '',
    example: backendWord.exampleSentenceEn || '',
    exampleTr: backendWord.exampleSentenceTr || '',
  };
};

/**
 * Backend'den dönen quiz DTO'sunu frontend formatına çevir
 */
export const transformQuiz = (backendQuiz) => {
  return {
    quizId: backendQuiz.quizId,
    questions: (backendQuiz.questions || []).map((q, index) => ({
      id: `q_${q.questionId || index}`,
      type: 'multi_choice', // Backend'den gelen tipe göre ayarlanacak
      question: q.word ? `"${q.word}" kelimesinin anlamı nedir?` : 'Soru',
      word: q.word,
      // Diğer alanlar backend response'a göre eklenecek
    })),
  };
};

export default {
  auth: authApi,
  user: userApi,
  wordList: wordListApi,
  quiz: quizApi,
  pdf: pdfApi,
  getToken,
  setToken,
  removeToken,
  getCachedUser,
};
