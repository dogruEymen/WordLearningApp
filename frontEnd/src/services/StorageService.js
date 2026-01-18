import AsyncStorage from '@react-native-async-storage/async-storage';

const RESOURCES_KEY = '@vocabulary_app_resources';
const WORD_LISTS_KEY = '@vocabulary_app_word_lists';

// Resources (PDF ve Text dosyaları)
export const getResources = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(RESOURCES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading resources:', e);
    return [];
  }
};

export const saveResource = async (resource) => {
  try {
    const resources = await getResources();
    const newResource = {
      ...resource,
      id: Date.now().toString(),
      addedDate: new Date().toISOString(),
      readProgress: 0,
    };
    resources.unshift(newResource);
    await AsyncStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
    return newResource;
  } catch (e) {
    console.error('Error saving resource:', e);
    return null;
  }
};

export const updateResourceProgress = async (resourceId, progress) => {
  try {
    const resources = await getResources();
    const index = resources.findIndex((r) => r.id === resourceId);
    if (index !== -1) {
      resources[index].readProgress = progress;
      await AsyncStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
    }
  } catch (e) {
    console.error('Error updating resource progress:', e);
  }
};

export const deleteResource = async (resourceId) => {
  try {
    const resources = await getResources();
    const filtered = resources.filter((r) => r.id !== resourceId);
    await AsyncStorage.setItem(RESOURCES_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Error deleting resource:', e);
  }
};

// Word Lists
export const getWordLists = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(WORD_LISTS_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    // Default lists
    const defaultLists = [
      { id: '1', name: 'Temel İngilizce', color: '#3B82F6', words: [] },
      { id: '2', name: 'İş İngilizcesi', color: '#8B5CF6', words: [] },
      { id: '3', name: 'Akademik Kelimeler', color: '#EC4899', words: [] },
      { id: '4', name: 'Bilinmeyen Kelimeler', color: '#F59E0B', words: [] },
    ];
    await AsyncStorage.setItem(WORD_LISTS_KEY, JSON.stringify(defaultLists));
    return defaultLists;
  } catch (e) {
    console.error('Error reading word lists:', e);
    return [];
  }
};

export const addWordToList = async (listId, wordData) => {
  try {
    const lists = await getWordLists();
    const index = lists.findIndex((l) => l.id === listId);
    if (index !== -1) {
      const newWord = {
        ...wordData,
        id: Date.now().toString(),
        addedDate: new Date().toISOString(),
      };
      lists[index].words.unshift(newWord);
      await AsyncStorage.setItem(WORD_LISTS_KEY, JSON.stringify(lists));
      return newWord;
    }
    return null;
  } catch (e) {
    console.error('Error adding word to list:', e);
    return null;
  }
};

export const removeWordFromList = async (listId, wordId) => {
  try {
    const lists = await getWordLists();
    const index = lists.findIndex((l) => l.id === listId);
    if (index !== -1) {
      lists[index].words = lists[index].words.filter((w) => w.id !== wordId);
      await AsyncStorage.setItem(WORD_LISTS_KEY, JSON.stringify(lists));
    }
  } catch (e) {
    console.error('Error removing word from list:', e);
  }
};

// Clear all data (for testing)
export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(RESOURCES_KEY);
    await AsyncStorage.removeItem(WORD_LISTS_KEY);
  } catch (e) {
    console.error('Error clearing data:', e);
  }
};
