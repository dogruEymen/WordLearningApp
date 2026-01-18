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
  Dimensions,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Mock data - Backend'den gelecek
const MOCK_WORD_LISTS = [
  {
    id: '1',
    name: 'Temel İngilizce',
    color: '#3B82F6',
    words: [
      { id: '1', english: 'Happy', turkish: 'Mutlu' },
      { id: '2', english: 'Sad', turkish: 'Üzgün' },
      { id: '3', english: 'Angry', turkish: 'Kızgın' },
      { id: '4', english: 'Tired', turkish: 'Yorgun' },
      { id: '5', english: 'Excited', turkish: 'Heyecanlı' },
    ],
  },
  {
    id: '2',
    name: 'İş İngilizcesi',
    color: '#8B5CF6',
    words: [
      { id: '1', english: 'Meeting', turkish: 'Toplantı' },
      { id: '2', english: 'Deadline', turkish: 'Son tarih' },
      { id: '3', english: 'Project', turkish: 'Proje' },
      { id: '4', english: 'Budget', turkish: 'Bütçe' },
    ],
  },
  {
    id: '3',
    name: 'Akademik Kelimeler',
    color: '#EC4899',
    words: [
      { id: '1', english: 'Research', turkish: 'Araştırma' },
      { id: '2', english: 'Hypothesis', turkish: 'Hipotez' },
      { id: '3', english: 'Analysis', turkish: 'Analiz' },
    ],
  },
];

const ParagraphCreateScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Liste seçimi, 2: Kelime seçimi
  const [selectedList, setSelectedList] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paragraph, setParagraph] = useState('');
  const [loadingText, setLoadingText] = useState('Paragraf oluşturuluyor...');

  const handleBackPress = () => {
    if (step === 2) {
      setStep(1);
      setSelectedList(null);
    } else {
      navigation.goBack();
    }
  };

  const handleListSelect = (list) => {
    setSelectedList(list);
    setStep(2);
  };

  const handleWordSelect = (word) => {
    setSelectedWord(word);
    generateParagraph(word);
  };

  const generateParagraph = async (word) => {
    setIsModalVisible(true);
    setIsLoading(true);
    setParagraph('');

    // Loading animation texts
    const loadingMessages = [
      'Paragraf oluşturuluyor...',
      'Son düzenlemeler yapılıyor...',
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[messageIndex]);
    }, 1500);

    // Simulate API call to Python LLM service
    // Backend entegrasyonunda bu kısım fetch/axios ile değiştirilecek
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // Mock response from LLM
      const mockParagraph = generateMockParagraph(word);
      
      clearInterval(messageInterval);
      setIsLoading(false);
      setParagraph(mockParagraph);
    } catch (error) {
      clearInterval(messageInterval);
      setIsLoading(false);
      setParagraph('Paragraf oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Mock paragraph generator - Backend entegrasyonunda kaldırılacak
  const generateMockParagraph = (word) => {
    const paragraphs = {
      Happy: `Yesterday was a wonderful day. I woke up feeling incredibly happy because the sun was shining brightly through my window. My friend called me in the morning with some great news, which made me even more happy. We decided to go for a walk in the park, where we saw children playing and families enjoying picnics. The whole atmosphere was so joyful that I couldn't help but smile. Being happy is truly a gift that we should cherish every day.`,
      Sad: `Sometimes life brings us moments that make us feel sad. Last week, I had to say goodbye to my best friend who was moving to another country. Standing at the airport, watching them walk away, I felt incredibly sad. However, I reminded myself that distance doesn't break true friendships. Even though I was sad at that moment, I knew we would stay connected through video calls and messages.`,
      Angry: `Traffic jams can make anyone feel angry. Yesterday, I was stuck in traffic for two hours, and I could feel myself getting angry. But then I remembered that getting angry wouldn't make the cars move faster. I took a deep breath, put on some relaxing music, and decided to use the time to listen to an audiobook. By the time I got home, I was no longer angry.`,
      Meeting: `Our weekly team meeting was scheduled for 10 AM. I prepared all my reports and arrived at the conference room early. The meeting was productive, and we discussed several important projects. During the meeting, everyone shared their progress and challenges. By the end of the meeting, we had a clear action plan for the upcoming week.`,
      Research: `Scientific research is fundamental to human progress. When conducting research, it's important to follow a systematic approach. The research process typically begins with forming a hypothesis, followed by gathering data and analyzing results. Good research requires patience, dedication, and attention to detail.`,
      default: `The word "${word.english}" is commonly used in everyday English conversations. Understanding its meaning and usage can greatly improve your communication skills. "${word.english}" translates to "${word.turkish}" in Turkish. Practicing with this word in different contexts will help you remember it better and use it naturally in conversations.`,
    };

    return paragraphs[word.english] || paragraphs.default;
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setParagraph('');
    setSelectedWord(null);
  };

  const renderListSelection = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Kelime Listesi Seç</Text>
      <Text style={styles.stepSubtitle}>
        Paragraf oluşturmak istediğin listeyi seç
      </Text>

      <View style={styles.listContainer}>
        {MOCK_WORD_LISTS.map((list) => (
          <TouchableOpacity
            key={list.id}
            style={styles.listCard}
            onPress={() => handleListSelect(list)}
            activeOpacity={0.9}
          >
            <View
              style={[
                styles.listIconContainer,
                { backgroundColor: `${list.color}15` },
              ]}
            >
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={28}
                color={list.color}
              />
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{list.name}</Text>
              <Text style={styles.listWordCount}>
                {list.words.length} kelime
              </Text>
            </View>
            <Feather name="chevron-right" size={24} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderWordSelection = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.selectedListHeader}>
        <View
          style={[
            styles.selectedListBadge,
            { backgroundColor: `${selectedList.color}15` },
          ]}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={20}
            color={selectedList.color}
          />
          <Text style={[styles.selectedListName, { color: selectedList.color }]}>
            {selectedList.name}
          </Text>
        </View>
      </View>

      <Text style={styles.stepTitle}>Kelime Seç</Text>
      <Text style={styles.stepSubtitle}>
        Paragraf içinde kullanılacak kelimeyi seç
      </Text>

      <View style={styles.wordsGrid}>
        {selectedList.words.map((word) => (
          <TouchableOpacity
            key={word.id}
            style={styles.wordCard}
            onPress={() => handleWordSelect(word)}
            activeOpacity={0.9}
          >
            <Text style={styles.wordEnglish}>{word.english}</Text>
            <Text style={styles.wordTurkish}>{word.turkish}</Text>
            <View style={styles.wordArrow}>
              <Feather name="arrow-right" size={18} color="#2ECC71" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#475569" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paragraf Oluştur</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
      </View>

      {/* Content */}
      {step === 1 && renderListSelection()}
      {step === 2 && renderWordSelection()}

      {/* Paragraph Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {isLoading ? (
              // Loading State
              <View style={styles.loadingContainer}>
                <View style={styles.loadingIconWrapper}>
                  <ActivityIndicator size="large" color="#2ECC71" />
                </View>
                <Text style={styles.loadingTitle}>{loadingText}</Text>
                <View style={styles.loadingWordInfo}>
                  <Text style={styles.loadingWordLabel}>Kelime:</Text>
                  <Text style={styles.loadingWord}>
                    {selectedWord?.english} ({selectedWord?.turkish})
                  </Text>
                </View>
                <View style={styles.loadingDotsContainer}>
                  <View style={[styles.loadingDot, styles.loadingDotActive]} />
                  <View style={[styles.loadingDot, styles.loadingDotActive]} />
                  <View style={styles.loadingDot} />
                </View>
              </View>
            ) : (
              // Result State
              <View style={styles.resultContainer}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultWordBadge}>
                    <Text style={styles.resultWordText}>
                      {selectedWord?.english}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.paragraphScroll}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.paragraphText}>{paragraph}</Text>
                </ScrollView>

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={closeModal}
                  activeOpacity={0.85}
                >
                  <Feather name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.doneButtonText}>Tamam</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={26} color="#94A3B8" />
          <Text style={styles.navText}>Ana Sayfa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={26} color="#94A3B8" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  headerSpacer: {
    width: 44,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: {
    backgroundColor: '#2ECC71',
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: '#2ECC71',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  listIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    marginLeft: 16,
  },
  listName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  listWordCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  selectedListHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedListBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  selectedListName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  wordsGrid: {
    gap: 12,
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  wordEnglish: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  wordTurkish: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  wordArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -9,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingWordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  loadingWordLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  loadingWord: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2ECC71',
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  loadingDotActive: {
    backgroundColor: '#2ECC71',
  },
  resultContainer: {
    maxHeight: 500,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultWordBadge: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  resultWordText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#2ECC71',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paragraphScroll: {
    maxHeight: 300,
    padding: 20,
  },
  paragraphText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#1E293B',
    lineHeight: 28,
    textAlign: 'justify',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ECC71',
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingBottom: 24,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
  },
});

export default ParagraphCreateScreen;
