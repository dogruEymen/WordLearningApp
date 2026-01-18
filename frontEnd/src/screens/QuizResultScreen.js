import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const QuizResultScreen = ({ navigation, route }) => {
  const { listName, score, totalQuestions } = route.params;

  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getResultData = () => {
    if (percentage >= 90) {
      return {
        emoji: '🏆',
        title: 'Mükemmel!',
        subtitle: 'Harika bir performans gösterdin!',
        color: '#10B981',
        bgColor: '#ECFDF5',
      };
    } else if (percentage >= 70) {
      return {
        emoji: '🎉',
        title: 'Çok İyi!',
        subtitle: 'Başarılı bir quiz geçirdin!',
        color: '#2ECC71',
        bgColor: '#ECFDF5',
      };
    } else if (percentage >= 50) {
      return {
        emoji: '👍',
        title: 'İyi!',
        subtitle: 'Biraz daha çalışarak gelişebilirsin.',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
      };
    } else {
      return {
        emoji: '💪',
        title: 'Devam Et!',
        subtitle: 'Pratik yaparak ilerleyeceksin.',
        color: '#EF4444',
        bgColor: '#FEF2F2',
      };
    }
  };

  const result = getResultData();

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleRetry = () => {
    navigation.navigate('QuizSetup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        {/* Result Card */}
        <View style={[styles.resultCard, { backgroundColor: result.bgColor }]}>
          <Text style={styles.emoji}>{result.emoji}</Text>
          <Text style={[styles.resultTitle, { color: result.color }]}>
            {result.title}
          </Text>
          <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
        </View>

        {/* Score Display */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scorePercentage}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>Başarı</Text>
          </View>

          <View style={styles.scoreDetails}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Feather name="check-circle" size={20} color="#10B981" />
                <Text style={styles.scoreItemText}>{score} Doğru</Text>
              </View>
              <View style={styles.scoreItem}>
                <Feather name="x-circle" size={20} color="#EF4444" />
                <Text style={styles.scoreItemText}>
                  {totalQuestions - score} Yanlış
                </Text>
              </View>
            </View>
            <View style={styles.listInfo}>
              <MaterialCommunityIcons
                name="format-list-bulleted"
                size={18}
                color="#64748B"
              />
              <Text style={styles.listInfoText}>{listName}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.85}
          >
            <Feather name="refresh-cw" size={20} color="#2ECC71" />
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleGoHome}
            activeOpacity={0.85}
          >
            <Feather name="home" size={20} color="#FFFFFF" />
            <Text style={styles.homeButtonText}>Ana Sayfa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  resultCard: {
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  scoreCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 4,
    borderColor: '#2ECC71',
  },
  scorePercentage: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  scoreDetails: {
    width: '100%',
    gap: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreItemText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
  },
  listInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  listInfoText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 12,
    borderWidth: 2,
    borderColor: '#2ECC71',
  },
  retryButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#2ECC71',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ECC71',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  homeButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
});

export default QuizResultScreen;
