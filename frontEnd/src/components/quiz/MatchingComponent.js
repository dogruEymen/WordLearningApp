import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const MatchingComponent = ({ question, onAnswer }) => {
  const { pairs } = question;

  // Shuffle right column for display
  const [shuffledRight, setShuffledRight] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Sağ sütunu karıştır
    const shuffled = [...pairs]
      .map((pair) => ({ id: pair.id, text: pair.right }))
      .sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
  }, []);

  useEffect(() => {
    // Her ikisi de seçiliyse kontrol et
    if (selectedLeft && selectedRight) {
      checkMatch();
    }
  }, [selectedLeft, selectedRight]);

  useEffect(() => {
    // Tüm eşleşmeler tamamlandıysa
    if (matchedPairs.length === pairs.length && pairs.length > 0) {
      setIsCompleted(true);
      setTimeout(() => {
        onAnswer(true, { matchedPairs });
      }, 1000);
    }
  }, [matchedPairs]);

  const checkMatch = () => {
    const leftPair = pairs.find((p) => p.id === selectedLeft);
    const isMatch = leftPair && leftPair.id === selectedRight;

    if (isMatch) {
      // Doğru eşleşme
      setMatchedPairs([...matchedPairs, selectedLeft]);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Yanlış eşleşme
      setWrongPair({ left: selectedLeft, right: selectedRight });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 800);
    }
  };

  const handleLeftPress = (id) => {
    if (isCompleted) return;
    if (matchedPairs.includes(id)) return;
    
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightPress = (id) => {
    if (isCompleted) return;
    if (matchedPairs.includes(id)) return;
    
    setSelectedRight(id === selectedRight ? null : id);
  };

  const getLeftItemStyle = (id) => {
    if (matchedPairs.includes(id)) {
      return styles.itemMatched;
    }
    if (wrongPair?.left === id) {
      return styles.itemWrong;
    }
    if (selectedLeft === id) {
      return styles.itemSelected;
    }
    return styles.item;
  };

  const getRightItemStyle = (id) => {
    if (matchedPairs.includes(id)) {
      return styles.itemMatched;
    }
    if (wrongPair?.right === id) {
      return styles.itemWrong;
    }
    if (selectedRight === id) {
      return styles.itemSelected;
    }
    return styles.item;
  };

  const getLeftTextStyle = (id) => {
    if (matchedPairs.includes(id)) {
      return styles.itemTextMatched;
    }
    if (wrongPair?.left === id) {
      return styles.itemTextWrong;
    }
    if (selectedLeft === id) {
      return styles.itemTextSelected;
    }
    return styles.itemText;
  };

  const getRightTextStyle = (id) => {
    if (matchedPairs.includes(id)) {
      return styles.itemTextMatched;
    }
    if (wrongPair?.right === id) {
      return styles.itemTextWrong;
    }
    if (selectedRight === id) {
      return styles.itemTextSelected;
    }
    return styles.itemText;
  };

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Kelimeleri anlamlarıyla eşleştir
        </Text>
        <Text style={styles.progressText}>
          {matchedPairs.length}/{pairs.length} eşleşme
        </Text>
      </View>

      {/* Matching Area */}
      <ScrollView
        style={styles.matchingScroll}
        contentContainerStyle={styles.matchingContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.columnsContainer}>
          {/* Left Column - English Words */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>İngilizce</Text>
            {pairs.map((pair) => (
              <TouchableOpacity
                key={`left-${pair.id}`}
                style={getLeftItemStyle(pair.id)}
                onPress={() => handleLeftPress(pair.id)}
                activeOpacity={0.8}
                disabled={matchedPairs.includes(pair.id) || isCompleted}
              >
                {matchedPairs.includes(pair.id) && (
                  <Feather name="check" size={18} color="#10B981" style={styles.checkIcon} />
                )}
                <Text style={getLeftTextStyle(pair.id)}>{pair.left}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
          </View>

          {/* Right Column - Turkish Meanings */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Türkçe</Text>
            {shuffledRight.map((item) => (
              <TouchableOpacity
                key={`right-${item.id}`}
                style={getRightItemStyle(item.id)}
                onPress={() => handleRightPress(item.id)}
                activeOpacity={0.8}
                disabled={matchedPairs.includes(item.id) || isCompleted}
              >
                {matchedPairs.includes(item.id) && (
                  <Feather name="check" size={18} color="#10B981" style={styles.checkIcon} />
                )}
                <Text style={getRightTextStyle(item.id)}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Result Feedback */}
      {isCompleted && (
        <View style={styles.resultContainer}>
          <Feather name="check-circle" size={24} color="#FFFFFF" />
          <Text style={styles.resultText}>Tüm eşleştirmeler doğru!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2ECC71',
  },
  matchingScroll: {
    flex: 1,
  },
  matchingContainer: {
    paddingBottom: 24,
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 10,
  },
  columnTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 36,
  },
  dividerLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 1,
  },
  item: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemSelected: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#6366F1',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  itemMatched: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#10B981',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  itemWrong: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#EF4444',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#475569',
    textAlign: 'center',
  },
  itemTextSelected: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#4338CA',
    textAlign: 'center',
  },
  itemTextMatched: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#059669',
    textAlign: 'center',
  },
  itemTextWrong: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#DC2626',
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginTop: 16,
  },
  resultText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
});

export default MatchingComponent;
