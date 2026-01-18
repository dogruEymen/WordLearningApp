import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Question Components
import MultiChoiceComponent from '../components/quiz/MultiChoiceComponent';
import FillBlankComponent from '../components/quiz/FillBlankComponent';
import MatchingComponent from '../components/quiz/MatchingComponent';

const QuizScreen = ({ navigation, route }) => {
  const { listName, questions, totalQuestions } = route.params;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [progressAnim] = useState(new Animated.Value(0));

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const handleAnswer = (isCorrect, answerData) => {
    // Cevabı kaydet
    setAnswers([...answers, { questionId: currentQuestion.id, ...answerData, isCorrect }]);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Sonraki soruya geç veya quiz'i bitir
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Quiz bitti - sonuç ekranına git
        navigation.replace('QuizResult', {
          listName,
          score: isCorrect ? score + 1 : score,
          totalQuestions,
          answers: [...answers, { questionId: currentQuestion.id, ...answerData, isCorrect }],
        });
      }
    }, 1000);
  };

  const handleExit = () => {
    Alert.alert(
      'Quiz\'den Çık',
      'Çıkmak istediğine emin misin? İlerleme kaydedilmeyecek.',
      [
        { text: 'Devam Et', style: 'cancel' },
        {
          text: 'Çık',
          style: 'destructive',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  const renderQuestionComponent = () => {
    switch (currentQuestion.type) {
      case 'multi_choice':
        return (
          <MultiChoiceComponent
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        );
      case 'fill_blank':
        return (
          <FillBlankComponent
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        );
      case 'matching':
        return (
          <MatchingComponent
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        );
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Bilinmeyen soru tipi</Text>
          </View>
        );
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={handleExit}
          activeOpacity={0.7}
        >
          <Feather name="x" size={22} color="#64748B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.listName} numberOfLines={1}>{listName}</Text>
          <Text style={styles.questionCounter}>
            {currentIndex + 1}/{totalQuestions}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Feather name="star" size={16} color="#F59E0B" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      {/* Question Type Indicator */}
      <View style={styles.questionTypeContainer}>
        <Text style={styles.questionTypeText}>
          {currentQuestion.type === 'multi_choice' && '📝 Çoktan Seçmeli'}
          {currentQuestion.type === 'fill_blank' && '✏️ Boşluk Doldur'}
          {currentQuestion.type === 'matching' && '🔗 Eşleştir'}
        </Text>
      </View>

      {/* Dynamic Question Body */}
      <View style={styles.questionBody}>
        {renderQuestionComponent()}
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
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
  },
  listName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
    marginBottom: 2,
  },
  questionCounter: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  scoreText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#D97706',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ECC71',
    borderRadius: 4,
  },
  questionTypeContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  questionTypeText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#64748B',
  },
  questionBody: {
    flex: 1,
    paddingHorizontal: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#EF4444',
  },
});

export default QuizScreen;
