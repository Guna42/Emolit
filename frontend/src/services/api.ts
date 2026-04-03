import axios from 'axios';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

// For PRODUCTION using your NEW AWS EC2 HUB.
const API_BASE_URL = 'http://13.62.58.50:8000';

console.log('[Emolit] Active Backend:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export interface WordSummary {
  word: string;
  core: string;
  category: string;
}

export interface EmotionMetadata {
  intensity: number;
  definition: string;
  synonyms: string[];
  example: string;
  reflection_prompt: string;
  growth_tip: string;
  body_signal: string;
}

export interface WordDetail extends WordSummary {
  metadata: EmotionMetadata;
}

export interface SearchResponse extends WordSummary { }

export interface DetectedEmotion {
  word: string;
  core: string;
  category: string;
}

export interface JournalResponse {
  detected_emotions: DetectedEmotion[];
  recognize: string;
  understand: string;
  label: string;
  express: string;
  regulate: string;
  growth_action: string;
}

export interface JournalEntry {
  entry_id: string;
  entry_text: string;
  detected_emotions: DetectedEmotion[];
  recognize: string;
  understand: string;
  label: string;
  express: string;
  regulate: string;
  growth_action: string;
  created_at: string;
}

export interface WordLearnedEntry {
  entry_id: string;
  word_details: any;
  created_at: string;
}

export interface HistoryEntry {
  type: 'journal' | 'learned_word';
  data: JournalEntry | WordLearnedEntry;
}

export interface JournalHistoryResponse {
  entries: HistoryEntry[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface EmotionSummary {
  emotion_word: string;
  core_emotion: string;
  count: number;
}

export interface JournalStatsResponse {
  total_entries: number;
  date_range_start: string | null;
  date_range_end: string | null;
  top_emotions: EmotionSummary[];
}

export interface JournalError {
  error: string;
  message?: string;
}

export interface AuthUser {
  email: string;
  full_name?: string | null;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token?: string;
}

export const emotionAPI = {
  // Get all core emotions
  getCores: async (): Promise<string[]> => {
    const response = await api.get('/cores');
    return response.data;
  },

  // Get categories for a specific core
  getCategories: async (core: string): Promise<string[]> => {
    const response = await api.get(`/cores/${core}/categories`);
    return response.data;
  },

  // Get filtered words
  getWords: async (core?: string, category?: string): Promise<WordSummary[]> => {
    const params = new URLSearchParams();
    if (core) params.append('core', core);
    if (category) params.append('category', category);

    const response = await api.get(`/words?${params.toString()}`);
    return response.data;
  },

  // Get word details
  getWordDetails: async (wordName: string): Promise<WordDetail> => {
    const response = await api.get(`/words/${wordName}`);
    return response.data;
  },

  // Get daily word (Previous Stage)
  getDailyWord: async (): Promise<WordDetail> => {
    const response = await api.get('/words/daily');
    return response.data;
  },

  // Search words
  searchWords: async (query: string): Promise<SearchResponse[]> => {
    const response = await api.get(`/words/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; service: string }> => {
    const response = await api.get('/health');
    return response.data;
  },

  // Journal reflection
  submitJournal: async (entry: string): Promise<JournalResponse | JournalError> => {
    const response = await api.post('/journal', { entry });
    return response.data;
  },

  // Authentication
  register: async (email: string, password: string, fullName?: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password, full_name: fullName });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Journal History & Stats (New Architect Routes)
  getJournalHistory: async (page: number = 1, pageSize: number = 10): Promise<JournalHistoryResponse> => {
    // Note: The new history endpoint doesn't support pagination yet, returning all for now
    const response = await api.get('/journal/history');
    return response.data;
  },

  getJournalStats: async (): Promise<JournalStatsResponse> => {
    const response = await api.get('/journal/stats');
    return response.data;
  },

  trackWordLearned: async (wordData: any): Promise<void> => {
    await api.post('/journal/track-word', { word_data: wordData });
  },

  submitVoiceJournal: async (audioBlob: Blob): Promise<JournalResponse | JournalError> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'journal_voice.webm');

    // We override Content-Type to undefined to let the browser handle the boundary
    const response = await api.post('/journal/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  exportReport: async (): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/export/monthly-report`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const fileName = `emolit_report_${new Date().toISOString().slice(0,10)}.pdf`;

      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          // CRITICAL: Strip the "data:application/pdf;base64," prefix for Capacitor!
          const rawBase64 = base64Data.split(',')[1];
          
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: rawBase64,
            directory: Directory.Documents,
          });

          await Share.share({
            title: 'Emolit Report',
            text: 'Your emotional evolution summary.',
            url: savedFile.uri,
          });
        };
      } else {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { window.URL.revokeObjectURL(url); link.remove(); }, 500);
      }
    } catch (error) {
      console.error("PDF Export Error:", error);
      throw error;
    }
  },

  // Save / bookmark a word
  saveWord: async (wordData: WordDetail): Promise<{ status: string }> => {
    const response = await api.post('/words/save', { word_data: wordData });
    return response.data;
  },

  // Remove a saved word
  unsaveWord: async (wordName: string): Promise<{ status: string }> => {
    const response = await api.delete(`/words/save/${encodeURIComponent(wordName)}`);
    return response.data;
  },

  // Get all saved words
  getSavedWords: async (): Promise<{ saved_words: any[] }> => {
    const response = await api.get('/words/saved');
    return response.data;
  },
};

export default api;
