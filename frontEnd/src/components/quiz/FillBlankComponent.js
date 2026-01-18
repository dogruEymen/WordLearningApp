import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const FillBlankComponent = ({ question, onAnswer }) => {
  const { sentence, answer, scrambledLetters, hint } = question;
  
  const [enteredLetters, setEnteredLetters] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([...scrambledLetters]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));
  const [wrongIndex, setWrongIndex] = useState(-1);

  const answerLength = answer.length;

  useEffect(() => {
    // Cevap tamamlandığında kontrol et
    if (enteredLetters.length === answerLength) {
      const userAnswer = enteredLetters.join('');
      const correct = userAnswer === answer;
      
      setIsCorrect(correct);
      setIsCompleted(true);

      setTimeout(() => {
        onAnswer(correct, { userAnswer });
      }, 1000);
    }
  }, [enteredLetters]);

  const handleLetterPress = (letter, index) => {
    if (isCompleted) return;
    if (enteredLetters.length >= answerLength) return;

    const expectedLetter = answer[enteredLetters.length];
    
    if (letter === expectedLetter) {
      // Doğru harf
      setEnteredLetters([...enteredLetters, letter]);
      
      // Harfi kullanılmış olarak işaretle
      const newAvailable = [...availableLetters];
      newAvailable[index] = null;
      setAvailableLetters(newAvailable);
    } else {
      // Yanlış harf - shake animation
      setWrongIndex(index);
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setWrongIndex(-1);
      });
    }
  };

  const handleBackspace = () => {
    if (isCompleted) return;
    if (enteredLetters.length === 0) return;

    const lastLetter = enteredLetters[enteredLetters.length - 1];
    const lastIndex = scrambledLetters.findIndex(
      (l, i) => l === lastLetter && availableLetters[i] === null
    );

    if (lastIndex !== -1) {
      const newAvailable = [...availableLetters];
      newAvailable[lastIndex] = lastLetter;
      setAvailableLetters(newAvailable);
    }

    setEnteredLetters(enteredLetters.slice(0, -1));
  };

  const renderSentence = () => {
    const parts = sentence.split('_____');
    
    return (
      <View style={styles.sentenceContainer}>
        <Text style={styles.sentenceText}>
          {parts[0]}
          <View style={styles.blankInline}>
            {Array.from({ length: answerLength }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.letterSlot,
                  enteredLetters[index] && styles.letterSlotFilled,
                  isCompleted && isCorrect && styles.letterSlotCorrect,
                  isCompleted && !isCorrect && styles.letterSlotWrong,
                ]}
              >
                <Text
                  style={[
                    styles.letterSlotText,
                    isCompleted && styles.letterSlotTextResult,
                  ]}
                >
                  {enteredLetters[index] || ''}
                </Text>
              </View>
            ))}
          </View>
          {parts[1]}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Hint */}
      <View style={styles.hintContainer}>
        <Feather name="info" size={16} color="#64748B" />
        <Text style={styles.hintText}>İpucu: {hint}</Text>
      </View>

      {/* Sentence with Blank */}
      <View style={styles.questionArea}>
        {renderSentence()}

        {/* Letter Slots */}
        <View style={styles.slotsContainer}>
          {Array.from({ length: answerLength }).map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.slot,
                enteredLetters[index] && styles.slotFilled,
                isCompleted && isCorrect && styles.slotCorrect,
                isCompleted && !isCorrect && styles.slotWrong,
              ]}
            >
              <Text style={styles.slotText}>
                {enteredLetters[index] || ''}
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Scrambled Letters */}
      <View style={styles.lettersArea}>
        <View style={styles.lettersGrid}>
          {availableLetters.map((letter, index) => (
            <Animated.View
              key={index}
              style={[
                wrongIndex === index && {
                  transform: [{ translateX: shakeAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.letterButton,
                  letter === null && styles.letterButtonUsed,
                  wrongIndex === index && styles.letterButtonWrong,
                ]}
                onPress={() => handleLetterPress(letter, index)}
                disabled={letter === null || isCompleted}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.letterButtonText,
                    letter === null && styles.letterButtonTextUsed,
                  ]}
                >
                  {letter || ''}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Backspace Button */}
        {!isCompleted && enteredLetters.length > 0 && (
          <TouchableOpacity
            style={styles.backspaceButton}
            onPress={handleBackspace}
            activeOpacity={0.8}
          >
            <Feather name="delete" size={24} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Result Feedback */}
      {isCompleted && (
        <View
          style={[
            styles.resultContainer,
            isCorrect ? styles.resultCorrect : styles.resultWrong,
          ]}
        >
          <Feather
            name={isCorrect ? 'check-circle' : 'x-circle'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.resultText}>
            {isCorrect ? 'Doğru!' : `Yanlış! Doğru cevap: ${answer}`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 24,
  },
  hintText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
  },
  questionArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sentenceContainer: {
    marginBottom: 24,
  },
  sentenceText: {
    fontSize: 20,
    fontFamily: 'Poppins_500Medium',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 32,
  },
  blankInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  slot: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotFilled: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
    borderStyle: 'solid',
  },
  slotCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderStyle: 'solid',
  },
  slotWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderStyle: 'solid',
  },
  slotText: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#4338CA',
  },
  letterSlot: {
    width: 28,
    height: 32,
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  letterSlotFilled: {
    borderBottomColor: '#6366F1',
  },
  letterSlotCorrect: {
    borderBottomColor: '#10B981',
  },
  letterSlotWrong: {
    borderBottomColor: '#EF4444',
  },
  letterSlotText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#4338CA',
  },
  letterSlotTextResult: {
    color: '#1E293B',
  },
  lettersArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 320,
  },
  letterButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  letterButtonUsed: {
    backgroundColor: '#F1F5F9',
    shadowOpacity: 0,
    elevation: 0,
    borderColor: '#E2E8F0',
  },
  letterButtonWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  letterButtonText: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#1E293B',
  },
  letterButtonTextUsed: {
    color: '#CBD5E1',
  },
  backspaceButton: {
    marginTop: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    marginTop: 16,
  },
  resultCorrect: {
    backgroundColor: '#10B981',
  },
  resultWrong: {
    backgroundColor: '#EF4444',
  },
  resultText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
});

export default FillBlankComponent;
