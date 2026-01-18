import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { wordListApi, transformWordList } from '../services/ApiService';

// Default content for demo
const DEFAULT_CONTENT = `Welcome to the Reader Mode! This is a sample text to demonstrate the word selection feature.

Tap on any word to add it to your vocabulary list. The sentence containing the word will also be saved for context.

You can upload your own PDF files or paste text content to read and learn new words.

Learning vocabulary in context is one of the most effective ways to remember new words. When you see a word used in a real sentence, you understand not just its meaning but also how it is used.

Happy reading and learning!`;

const ReaderScreen = ({ navigation, route }) => {
  const { resourceId, resourceTitle, resourceType, resourceContent, resourceMetadata } = route.params || {};
  
  const [content, setContent] = useState(resourceContent || DEFAULT_CONTENT);
  const [wordLists, setWordLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [selectedWord, setSelectedWord] = useState('');
  const [selectedSentence, setSelectedSentence] = useState('');
  const [wordStartIndex, setWordStartIndex] = useState(0);
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    loadWordLists();
  }, []);

  const loadWordLists = async () => {
    try {
      const lists = await wordListApi.getMyLists();
      const transformedLists = (lists || []).map(transformWordList);
      setWordLists(transformedLists);
    } catch (error) {
      console.error('Error loading word lists:', error);
    } finally {
      setLoadingLists(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Kelimeyi içeren cümleyi bul ve kelimenin pozisyonunu hesapla
  const findSentenceAndPosition = (word, fullContent) => {
    const sentences = fullContent.split(/(?<=[.!?])\s+/);
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').toLowerCase();
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.toLowerCase().split(/\s+/);
      const wordIndex = sentenceWords.findIndex(w => 
        w.replace(/[.,!?;:'"()]/g, '') === cleanWord
      );
      
      if (wordIndex !== -1) {
        // Kelimenin cümle içindeki başlangıç pozisyonunu bul
        let startIndex = 0;
        for (let i = 0; i < wordIndex; i++) {
          startIndex += sentenceWords[i].length + 1; // +1 boşluk için
        }
        
        return {
          sentence: sentence.trim(),
          startIndex: startIndex,
          wordLength: cleanWord.length
        };
      }
    }
    
    return { sentence: '', startIndex: 0, wordLength: word.length };
  };

  const handleWordPress = (word) => {
    const cleanWord = word.replace(/[.,!?;:'"()]/g, '').trim();
    
    if (cleanWord.length > 1) {
      const { sentence, startIndex, wordLength } = findSentenceAndPosition(word, content);
      
      setSelectedWord(cleanWord);
      setSelectedSentence(sentence);
      setWordStartIndex(startIndex);
      setIsListModalVisible(true);
    }
  };

  const handleListSelect = async (list) => {
    setSelectedList(list);
    setIsSaving(true);

    try {
      // Backend API çağrısı
      await wordListApi.addWord(
        list.id,
        selectedSentence || selectedWord,
        wordStartIndex,
        selectedWord.length
      );

      setIsSaving(false);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
        setIsListModalVisible(false);
        setSelectedWord('');
        setSelectedSentence('');
        setWordStartIndex(0);
        setSelectedList(null);
      }, 1500);
    } catch (error) {
      console.error('Error saving word:', error);
      setIsSaving(false);
      Alert.alert('Hata', error.message || 'Kelime kaydedilemedi');
      setIsListModalVisible(false);
    }
  };

  const closeListModal = () => {
    setIsListModalVisible(false);
    setSelectedWord('');
    setSelectedSentence('');
    setWordStartIndex(0);
    setSelectedList(null);
  };

  const increaseFontSize = () => {
    if (fontSize < 24) setFontSize(fontSize + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) setFontSize(fontSize - 2);
  };

  // Render text content with touchable words
  const renderTextContent = () => {
    if (!content || content.trim().length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="text-box-remove-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>İçerik bulunamadı</Text>
        </View>
      );
    }

    // Paragrafları ayır (çift satır sonları ile)
    const paragraphs = content.split(/\n\n+/);
    
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {paragraphs.map((paragraph, pIndex) => {
          if (!paragraph.trim()) return null;
          
          // Kelimeleri ayır (boşlukları koru)
          const words = paragraph.split(/(\s+)/);
          
          return (
            <View key={pIndex} style={styles.paragraphContainer}>
              <Text style={[styles.contentText, { fontSize, lineHeight: fontSize * 1.75 }]}>
                {words.map((word, wIndex) => {
                  // Sadece boşluk ise
                  if (/^\s+$/.test(word)) {
                    return <Text key={`${pIndex}-${wIndex}`}>{word}</Text>;
                  }
                  
                  // Kelime ise - tıklanabilir yap
                  const cleanWord = word.replace(/[.,!?;:'"()[\]{}«»""''–—]/g, '').trim();
                  
                  if (cleanWord.length < 2) {
                    return <Text key={`${pIndex}-${wIndex}`} style={styles.word}>{word}</Text>;
                  }
                  
                  return (
                    <Text
                      key={`${pIndex}-${wIndex}`}
                      style={styles.clickableWord}
                      onPress={() => handleWordPress(word)}
                    >
                      {word}
                    </Text>
                  );
                })}
              </Text>
            </View>
          );
        })}
        
        {/* Alt boşluk */}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // Cümle içindeki kelimeyi vurgula
  const renderHighlightedSentence = () => {
    if (!selectedSentence || !selectedWord) return null;

    const regex = new RegExp(`(${selectedWord})`, 'gi');
    const parts = selectedSentence.split(regex);

    return (
      <Text style={styles.sentenceText}>
        {parts.map((part, index) => {
          if (part.toLowerCase() === selectedWord.toLowerCase()) {
            return <Text key={index} style={styles.highlightedWord}>{part}</Text>;
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#475569" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{resourceTitle || 'Okuyucu'}</Text>
          {resourceMetadata?.originalType === 'pdf' && (
            <View style={styles.typeBadge}>
              <MaterialCommunityIcons name="file-pdf-box" size={14} color="#EF4444" />
              <Text style={[styles.typeText, { color: '#EF4444' }]}>
                PDF'den Dönüştürüldü
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Font Size Controls */}
      <View style={styles.controlsBar}>
        <View style={styles.fontControls}>
          <TouchableOpacity style={styles.fontButton} onPress={decreaseFontSize} activeOpacity={0.7}>
            <Text style={styles.fontButtonText}>A-</Text>
          </TouchableOpacity>
          <Text style={styles.fontSizeText}>{fontSize}px</Text>
          <TouchableOpacity style={styles.fontButton} onPress={increaseFontSize} activeOpacity={0.7}>
            <Text style={styles.fontButtonText}>A+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoHint}>
          <Feather name="info" size={14} color="#64748B" />
          <Text style={styles.infoHintText}>Kelimeye dokun → Listeye ekle</Text>
        </View>
      </View>

      {/* Content - Her şey artık text olarak gösteriliyor */}
      {renderTextContent()}

      {/* List Selection Modal */}
      <Modal visible={isListModalVisible} transparent={true} animationType="slide" onRequestClose={closeListModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.listModalContainer}>
            {isSaving || saveSuccess ? (
              <View style={styles.savingContainer}>
                {isSaving ? (
                  <>
                    <View style={styles.savingIconWrapper}>
                      <ActivityIndicator size="large" color="#2ECC71" />
                    </View>
                    <Text style={styles.savingTitle}>Kaydediliyor...</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.successIconWrapper}>
                      <Feather name="check-circle" size={48} color="#2ECC71" />
                    </View>
                    <Text style={styles.successTitle}>Eklendi!</Text>
                    <Text style={styles.successSubtitle}>
                      "{selectedWord}" kelimesi "{selectedList?.name}" listesine eklendi
                    </Text>
                  </>
                )}
              </View>
            ) : (
              <>
                {/* Modal Header */}
                <View style={styles.listModalHeader}>
                  <Text style={styles.listModalTitle}>Listeye Ekle</Text>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={closeListModal} activeOpacity={0.7}>
                    <Feather name="x" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Selected Word Display */}
                <View style={styles.wordDisplayContainer}>
                  <Text style={styles.wordDisplayLabel}>Seçilen Kelime</Text>
                  <Text style={styles.wordDisplayText}>{selectedWord}</Text>
                </View>

                {/* Sentence Preview */}
                {selectedSentence && (
                  <View style={styles.sentenceContainer}>
                    <View style={styles.sentenceLabelRow}>
                      <Feather name="message-square" size={16} color="#64748B" />
                      <Text style={styles.sentenceLabel}>İçinde Geçtiği Metin</Text>
                    </View>
                    <View style={styles.sentenceBox}>{renderHighlightedSentence()}</View>
                  </View>
                )}

                {/* Lists */}
                <Text style={styles.selectListLabel}>Bir liste seç</Text>
                {loadingLists ? (
                  <View style={styles.listsLoadingContainer}>
                    <ActivityIndicator size="small" color="#2ECC71" />
                    <Text style={styles.listsLoadingText}>Listeler yükleniyor...</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.listsScroll} showsVerticalScrollIndicator={false}>
                    {wordLists.length > 0 ? (
                      wordLists.map((list) => (
                        <TouchableOpacity
                          key={list.id}
                          style={styles.listItem}
                          onPress={() => handleListSelect(list)}
                          activeOpacity={0.9}
                        >
                          <View style={[styles.listItemIcon, { backgroundColor: `${list.color}15` }]}>
                            <MaterialCommunityIcons name="format-list-bulleted" size={24} color={list.color} />
                          </View>
                          <Text style={styles.listItemName}>{list.name}</Text>
                          <Feather name="plus-circle" size={22} color="#2ECC71" />
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.emptyListContainer}>
                        <MaterialCommunityIcons name="playlist-remove" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyListText}>Henüz kelime listesi yok</Text>
                        <Text style={styles.emptyListSubtext}>Kelime Listelerim'den yeni liste oluşturabilirsiniz</Text>
                      </View>
                    )}
                  </ScrollView>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 48, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 16 },
  headerTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#1E293B', marginBottom: 4 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeText: { fontSize: 12, fontFamily: 'Poppins_500Medium' },
  headerSpacer: { width: 44 },
  controlsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  fontControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fontButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  fontButtonText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#475569' },
  fontSizeText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#64748B', minWidth: 40, textAlign: 'center' },
  infoHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoHintText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#64748B' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  paragraphContainer: { marginBottom: 20 },
  contentText: { fontFamily: 'Poppins_400Regular', color: '#1E293B' },
  word: { color: '#1E293B' },
  clickableWord: { color: '#1E293B' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: '#94A3B8', marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  listModalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '80%' },
  listModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  listModalTitle: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: '#1E293B' },
  modalCloseButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  wordDisplayContainer: { backgroundColor: '#ECFDF5', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' },
  wordDisplayLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#64748B', marginBottom: 6 },
  wordDisplayText: { fontSize: 32, fontFamily: 'Poppins_700Bold', color: '#2ECC71' },
  sentenceContainer: { marginBottom: 20 },
  sentenceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sentenceLabel: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#64748B' },
  sentenceBox: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: '#2ECC71' },
  sentenceText: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: '#475569', lineHeight: 24 },
  highlightedWord: { fontFamily: 'Poppins_700Bold', color: '#2ECC71', backgroundColor: '#ECFDF5' },
  selectListLabel: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#1E293B', marginBottom: 12 },
  listsLoadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, gap: 10 },
  listsLoadingText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#64748B' },
  listsScroll: { maxHeight: 220 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#475569', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  listItemIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  listItemName: { flex: 1, fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#1E293B' },
  emptyListContainer: { alignItems: 'center', paddingVertical: 30 },
  emptyListText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#94A3B8', marginTop: 12 },
  emptyListSubtext: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#CBD5E1', marginTop: 4, textAlign: 'center' },
  savingContainer: { alignItems: 'center', paddingVertical: 40 },
  savingIconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  savingTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#1E293B' },
  successIconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: '#2ECC71', marginBottom: 8 },
  successSubtitle: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#64748B', textAlign: 'center', paddingHorizontal: 20 },
});

export default ReaderScreen;
