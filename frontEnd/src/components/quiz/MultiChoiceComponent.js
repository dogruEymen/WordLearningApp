import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const MultiChoiceComponent = ({ question, onAnswer }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const { options, correctIds, isMultiSelect } = question;

  const handleOptionPress = (optionId) => {
    if (isSubmitted) return;

    if (isMultiSelect) {
      // Çoklu seçim modu
      if (selectedIds.includes(optionId)) {
        setSelectedIds(selectedIds.filter((id) => id !== optionId));
      } else {
        setSelectedIds([...selectedIds, optionId]);
      }
    } else {
      // Tekli seçim modu
      setSelectedIds([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;

    setIsSubmitted(true);
    setShowResult(true);

    // Cevabı kontrol et
    const isCorrect =
      selectedIds.length === correctIds.length &&
      selectedIds.every((id) => correctIds.includes(id));

    // Parent'a bildir
    setTimeout(() => {
      onAnswer(isCorrect, { selectedIds });
    }, 800);
  };

  const getOptionStyle = (optionId) => {
    if (!showResult) {
      return selectedIds.includes(optionId)
        ? styles.optionSelected
        : styles.option;
    }

    const isCorrectOption = correctIds.includes(optionId);
    const isSelectedOption = selectedIds.includes(optionId);

    if (isCorrectOption) {
      return styles.optionCorrect;
    }
    if (isSelectedOption && !isCorrectOption) {
      return styles.optionWrong;
    }
    return styles.option;
  };

  const getOptionTextStyle = (optionId) => {
    if (!showResult) {
      return selectedIds.includes(optionId)
        ? styles.optionTextSelected
        : styles.optionText;
    }

    const isCorrectOption = correctIds.includes(optionId);
    const isSelectedOption = selectedIds.includes(optionId);

    if (isCorrectOption || isSelectedOption) {
      return styles.optionTextResult;
    }
    return styles.optionText;
  };

  const renderOptionIcon = (optionId) => {
    if (!showResult) {
      if (selectedIds.includes(optionId)) {
        return (
          <View style={styles.checkCircleSelected}>
            <Feather name="check" size={16} color="#FFFFFF" />
          </View>
        );
      }
      return <View style={styles.checkCircle} />;
    }

    const isCorrectOption = correctIds.includes(optionId);
    const isSelectedOption = selectedIds.includes(optionId);

    if (isCorrectOption) {
      return (
        <View style={styles.checkCircleCorrect}>
          <Feather name="check" size={16} color="#FFFFFF" />
        </View>
      );
    }
    if (isSelectedOption && !isCorrectOption) {
      return (
        <View style={styles.checkCircleWrong}>
          <Feather name="x" size={16} color="#FFFFFF" />
        </View>
      );
    }
    return <View style={styles.checkCircle} />;
  };

  return (
    <View style={styles.container}>
      {/* Question Text */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        {isMultiSelect && (
          <Text style={styles.multiSelectHint}>Birden fazla seçenek seçebilirsin</Text>
        )}
      </View>

      {/* Options */}
      <ScrollView
        style={styles.optionsScroll}
        contentContainerStyle={styles.optionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={getOptionStyle(option.id)}
            onPress={() => handleOptionPress(option.id)}
            activeOpacity={0.8}
            disabled={isSubmitted}
          >
            {renderOptionIcon(option.id)}
            <Text style={getOptionTextStyle(option.id)}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Submit Button */}
      {!isSubmitted && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedIds.length === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={selectedIds.length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.submitButtonText}>Onayla</Text>
        </TouchableOpacity>
      )}

      {/* Result Feedback */}
      {showResult && (
        <View
          style={[
            styles.resultContainer,
            selectedIds.every((id) => correctIds.includes(id)) &&
            selectedIds.length === correctIds.length
              ? styles.resultCorrect
              : styles.resultWrong,
          ]}
        >
          <Feather
            name={
              selectedIds.every((id) => correctIds.includes(id)) &&
              selectedIds.length === correctIds.length
                ? 'check-circle'
                : 'x-circle'
            }
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.resultText}>
            {selectedIds.every((id) => correctIds.includes(id)) &&
            selectedIds.length === correctIds.length
              ? 'Doğru!'
              : 'Yanlış!'}
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
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
    lineHeight: 28,
    textAlign: 'center',
  },
  multiSelectHint: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  optionsScroll: {
    flex: 1,
  },
  optionsContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    gap: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  optionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 18,
    gap: 16,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  optionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 18,
    gap: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  optionWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 18,
    gap: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  checkCircleSelected: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleCorrect: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleWrong: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#475569',
  },
  optionTextSelected: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#4338CA',
  },
  optionTextResult: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#1E293B',
  },
  submitButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    gap: 12,
  },
  resultCorrect: {
    backgroundColor: '#10B981',
  },
  resultWrong: {
    backgroundColor: '#EF4444',
  },
  resultText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
});

export default MultiChoiceComponent;
