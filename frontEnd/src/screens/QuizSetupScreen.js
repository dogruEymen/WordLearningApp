import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { wordListApi, quizApi, transformWordList } from '../services/ApiService';

const QuizSetupScreen = ({ navigation }) => {
  const [step, setStep] = useState(1); // 1: Liste seçimi, 2: Soru sayısı, 3: Loading
  const [selectedList, setSelectedList] = useState(null);
  const [questionCount, setQuestionCount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Sorular hazırlanıyor...');
  
  // Word lists state
  const [wordLists, setWordLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
  const [listsError, setListsError] = useState(null);

  useEffect(() => {
    fetchWordLists();
  }, []);

  const fetchWordLists = async () => {
    try {
      setIsLoadingLists(true);
      setListsError(null);
      
      const lists = await wordListApi.getMyLists();
      const transformedLists = (lists || []).map(transformWordList);
      setWordLists(transformedLists);
    } catch (error) {
      console.error('Kelime listeleri yüklenirken hata:', error);
      setListsError(error.message || 'Listeler yüklenemedi');
    } finally {
      setIsLoadingLists(false);
    }
  };

  const handleListSelect = (list) => {
    if (list.wordCount < 1) {
      Alert.alert('Uyarı', 'Bu listede kelime bulunmuyor. Quiz oluşturmak için kelime eklemelisin.');
      return;
    }
    setSelectedList(list);
    setStep(2);
  };

  const handleQuestionCountSubmit = () => {
    const count = parseInt(questionCount, 10);
    if (!count || count < 1) {
      return;
    }

    // Maximum soru sayısı kontrolü
    const maxQuestions = Math.min(selectedList.wordCount * 2, 50);
    const finalCount = Math.min(count, maxQuestions);

    setStep(3);
    setIsLoading(true);
    generateQuiz(selectedList.id, finalCount);
  };

  const generateQuiz = async (listId, count) => {
    // Loading animation texts
    const loadingMessages = [
      'Sorular hazırlanıyor...',
      'Kelimeler analiz ediliyor...',
      'Quiz oluşturuluyor...',
      'Son düzenlemeler yapılıyor...',
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[messageIndex]);
    }, 1500);

    try {
      // Backend API çağrısı
      const quizResponse = await quizApi.generateQuiz(listId);
      
      clearInterval(messageInterval);
      setIsLoading(false);

      if (quizResponse && quizResponse.questions && quizResponse.questions.length > 0) {
        // Backend'den gelen quiz verilerini kullan
        const formattedQuestions = formatQuestionsForQuiz(quizResponse.questions, count);
        
        if (formattedQuestions.length === 0) {
          Alert.alert(
            'Uyarı',
            'Quiz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
            [
              {
                text: 'Tamam',
                onPress: () => setStep(2),
              },
            ]
          );
          return;
        }
        
        navigation.replace('Quiz', {
          listName: selectedList.name,
          questions: formattedQuestions,
          totalQuestions: formattedQuestions.length,
          quizId: quizResponse.quizId,
        });
      } else {
        // Backend boş döndüyse veya yeterli soru yoksa
        Alert.alert(
          'Bilgi',
          'Bu liste için yeterli soru oluşturulamadı. Quiz oluşturmak için listede en az 8 kelime bulunmalı ve her kelime için eşanlamlı kelimeler olmalıdır.',
          [
            {
              text: 'Tamam',
              onPress: () => setStep(2),
            },
          ]
        );
      }
    } catch (error) {
      clearInterval(messageInterval);
      setIsLoading(false);
      console.error('Quiz oluşturma hatası:', error);
      
      // Hata durumunda kullanıcıya bilgi ver
      const errorMessage = error.message || 'Quiz oluşturulurken bir hata oluştu.';
      Alert.alert(
        'Hata',
        errorMessage + ' Lütfen tekrar deneyin.',
        [
          {
            text: 'Tamam',
            onPress: () => setStep(2),
          },
        ]
      );
    }
  };

  // Backend'den gelen soruları frontend formatına çevir
  const formatQuestionsForQuiz = (backendQuestions, requestedCount) => {
    const questions = [];
    const count = Math.min(backendQuestions.length, requestedCount);

    for (let i = 0; i < count; i++) {
      const q = backendQuestions[i];
      if (!q) continue;

      // QuestionType enum'unu frontend formatına çevir
      // Backend'den gelen enum değeri string olarak gelebilir
      let questionType = 'multi_choice'; // Default
      const typeStr = String(q.questionType || '').toUpperCase();
      if (typeStr === 'MULTIPLE_CHOICE') {
        questionType = 'multi_choice';
      } else if (typeStr === 'SYNONYM_MATCHING') {
        questionType = 'matching';
      } else if (typeStr === 'FILL_IN_THE_BLANK') {
        questionType = 'fill_blank';
      }

      // Soru tipine göre formatla
      if (questionType === 'multi_choice') {
        // Multiple choice soru formatı
        const backendOptions = q.options || [];
        if (backendOptions.length === 0) {
          // Options yoksa bu soruyu atla
          continue;
        }

        const options = backendOptions.map((opt, idx) => ({
          id: `opt_${idx}`,
          text: opt.meaningTr || opt.writing || `Seçenek ${idx + 1}`,
          isCorrect: q.correctAnswerWritings?.includes(opt.writing) || false,
        }));

        // CorrectIds listesini oluştur
        const correctIds = options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.id);

        if (correctIds.length === 0) {
          // Doğru cevap yoksa bu soruyu atla
          continue;
        }

        questions.push({
          id: `q_${q.questionId || i}`,
          type: 'multi_choice',
          question: q.questionSentence || 'Soru',
          options: options,
          correctIds: correctIds,
          isMultiSelect: correctIds.length > 1,
        });
      } else if (questionType === 'fill_blank') {
        // Fill in the blank soru formatı
        const correctAnswer = q.correctAnswerWritings?.[0] || '';
        const sentence = q.questionSentence || '';
        
        if (!correctAnswer || !sentence || !sentence.includes('_____')) {
          // Eksik veri varsa bu soruyu atla
          continue;
        }

        // Scrambled letters oluştur (doğru cevabın harfleri + ekstra harfler)
        const answerLetters = correctAnswer.toUpperCase().split('').filter(l => l.trim());
        if (answerLetters.length === 0) {
          continue;
        }

        const extraLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
          .filter(l => !answerLetters.includes(l))
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.max(2, answerLetters.length));
        const scrambledLetters = [...answerLetters, ...extraLetters]
          .sort(() => Math.random() - 0.5);

        // Hint (ilk option'ın meaningTr'si veya meaningEn'si)
        const hint = q.options?.[0]?.meaningTr || q.options?.[0]?.meaningEn || '';

        questions.push({
          id: `q_${q.questionId || i}`,
          type: 'fill_blank',
          sentence: sentence,
          answer: correctAnswer.toUpperCase(),
          scrambledLetters: scrambledLetters,
          hint: hint,
        });
      } else if (questionType === 'matching') {
        // Synonym matching soru formatı
        // Backend'de options çiftler halinde eşanlamlı kelimeleri içerir
        // correctAnswerWritings her çiftin doğru eşleşmesini belirtir
        const pairs = [];
        const options = q.options || [];
        
        if (options.length < 2) {
          // En az 2 option olmalı (bir çift için)
          continue;
        }

        // Options'ları çiftler halinde işle
        // Backend'de her iki consecutive option bir çift oluşturur
        for (let j = 0; j < options.length; j += 2) {
          if (j + 1 < options.length) {
            const opt1 = options[j];
            const opt2 = options[j + 1];
            
            // Her iki option'ın writing'lerini kontrol et
            const opt1Writing = opt1.writing || '';
            const opt2Writing = opt2.writing || '';
            
            if (!opt1Writing || !opt2Writing) {
              continue;
            }

            // Backend'de çift halinde gelen options'ları eşleştir
            pairs.push({
              id: `pair_${pairs.length}`,
              left: opt1Writing,
              right: opt2Writing,
            });
          }
        }

        if (pairs.length === 0) {
          // Pairs oluşturulamadıysa bu soruyu atla
          continue;
        }

        questions.push({
          id: `q_${q.questionId || i}`,
          type: 'matching',
          pairs: pairs,
        });
      }
    }

    return questions;
  };

  // Mock quiz data generator - Backend kullanılamadığında fallback
  const generateMockQuizData = (count) => {
    const questionTypes = ['multi_choice', 'fill_blank', 'matching'];
    const questions = [];

    for (let i = 0; i < count; i++) {
      const type = questionTypes[i % 3];
      
      if (type === 'multi_choice') {
        questions.push({
          id: `q_${i}`,
          type: 'multi_choice',
          question: 'Aşağıdakilerden hangisi "happy" kelimesinin anlamıdır?',
          options: [
            { id: 'a', text: 'Mutlu', isCorrect: true },
            { id: 'b', text: 'Üzgün', isCorrect: false },
            { id: 'c', text: 'Kızgın', isCorrect: false },
            { id: 'd', text: 'Yorgun', isCorrect: false },
          ],
          correctIds: ['a'],
          isMultiSelect: false,
        });
      } else if (type === 'fill_blank') {
        questions.push({
          id: `q_${i}`,
          type: 'fill_blank',
          sentence: 'I am very _____ today.',
          answer: 'HAPPY',
          scrambledLetters: ['H', 'P', 'A', 'Y', 'P', 'X', 'L', 'M'],
          hint: 'Mutlu',
        });
      } else {
        questions.push({
          id: `q_${i}`,
          type: 'matching',
          pairs: [
            { id: '1', left: 'Happy', right: 'Mutlu' },
            { id: '2', left: 'Sad', right: 'Üzgün' },
            { id: '3', left: 'Angry', right: 'Kızgın' },
            { id: '4', left: 'Tired', right: 'Yorgun' },
            { id: '5', left: 'Excited', right: 'Heyecanlı' },
          ],
        });
      }
    }

    return questions;
  };

  const handleBackPress = () => {
    if (step === 1) {
      navigation.goBack();
    } else if (step === 2) {
      setStep(1);
      setSelectedList(null);
    }
  };

  const renderListSelection = () => {
    if (isLoadingLists) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={styles.loadingText}>Listeler yükleniyor...</Text>
        </View>
      );
    }

    if (listsError) {
      return (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color="#EF4444"
          />
          <Text style={styles.errorTitle}>Bir hata oluştu</Text>
          <Text style={styles.errorText}>{listsError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchWordLists}
            activeOpacity={0.8}
          >
            <Feather name="refresh-cw" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (wordLists.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={64}
            color="#CBD5E1"
          />
          <Text style={styles.emptyTitle}>Henüz liste yok</Text>
          <Text style={styles.emptySubtitle}>
            Quiz oluşturmak için önce kelime listesi oluşturmalısın
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>Hangi kelime listesini çalışmak istersin?</Text>
        <Text style={styles.stepSubtitle}>Bir liste seç ve quiz'e başla</Text>

        <View style={styles.listContainer}>
          {wordLists.map((list) => (
            <TouchableOpacity
              key={list.id}
              style={[
                styles.listCard,
                list.wordCount === 0 && styles.listCardDisabled
              ]}
              onPress={() => handleListSelect(list)}
              activeOpacity={0.9}
            >
              <View style={[styles.listIconContainer, { backgroundColor: `${list.color}20` }]}>
                <MaterialCommunityIcons
                  name="format-list-bulleted"
                  size={28}
                  color={list.color}
                />
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{list.name}</Text>
                <Text style={[
                  styles.listWordCount,
                  list.wordCount === 0 && styles.listWordCountEmpty
                ]}>
                  {list.wordCount} kelime
                  {list.wordCount === 0 && ' (Boş)'}
                </Text>
              </View>
              <Feather name="chevron-right" size={24} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderQuestionCountInput = () => {
    const maxQuestions = Math.min(selectedList?.wordCount * 2 || 10, 50);
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.stepTitle}>Kaç soruluk quiz oluşturulsun?</Text>
        <Text style={styles.stepSubtitle}>
          "{selectedList?.name}" listesi için maksimum {maxQuestions} soru
        </Text>

        <View style={styles.selectedListCard}>
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={24}
            color={selectedList?.color}
          />
          <Text style={styles.selectedListName}>{selectedList?.name}</Text>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.numberInput}
            placeholder="Soru sayısı"
            placeholderTextColor="#94A3B8"
            value={questionCount}
            onChangeText={(text) => setQuestionCount(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            (!questionCount || parseInt(questionCount, 10) < 1) && styles.startButtonDisabled,
          ]}
          onPress={handleQuestionCountSubmit}
          disabled={!questionCount || parseInt(questionCount, 10) < 1}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>Quiz'i Başlat</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIconWrapper}>
        <ActivityIndicator size="large" color="#2ECC71" />
      </View>
      <Text style={styles.loadingTitle}>{loadingText}</Text>
      <Text style={styles.loadingSubtitle}>
        {selectedList?.name} • {questionCount} soru
      </Text>
      
      <View style={styles.loadingDotsContainer}>
        <View style={[styles.loadingDot, styles.loadingDotActive]} />
        <View style={[styles.loadingDot, styles.loadingDotActive]} />
        <View style={styles.loadingDot} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      {step !== 3 && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={22} color="#475569" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Soru Çöz</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      {/* Step Indicator */}
      {step !== 3 && (
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
        </View>
      )}

      {/* Content */}
      {step === 1 && renderListSelection()}
      {step === 2 && renderQuestionCountInput()}
      {step === 3 && renderLoading()}

      {/* Bottom Navigation */}
      {step !== 3 && (
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
      )}
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
    paddingTop: 16,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#94A3B8',
    textAlign: 'center',
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
  listCardDisabled: {
    opacity: 0.6,
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
  listWordCountEmpty: {
    color: '#EF4444',
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  selectedListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  selectedListName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  numberInput: {
    width: '100%',
    height: 64,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 24,
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    textAlign: 'center',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ECC71',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
    width: '100%',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  startButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    marginBottom: 32,
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

export default QuizSetupScreen;
