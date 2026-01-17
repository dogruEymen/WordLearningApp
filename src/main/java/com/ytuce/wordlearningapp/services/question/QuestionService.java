package com.ytuce.wordlearningapp.services.question;

import com.ytuce.wordlearningapp.models.*;
import com.ytuce.wordlearningapp.repositories.QuestionRepository;
import com.ytuce.wordlearningapp.repositories.UserAnswerRepository;
import com.ytuce.wordlearningapp.repositories.UserRepository;
import com.ytuce.wordlearningapp.repositories.WordRepository;
import com.ytuce.wordlearningapp.services.question.requests.AnswerQuestionRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final WordRepository wordRepository;

    @Transactional
    public boolean answerQuestion(String email, AnswerQuestionRequest req) {
        // 1. Validate User and Question exist
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Question question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // 2. Determine Correctness
        // We compare the set of strings provided by the user vs the set of strings in the correct answers.
        boolean isCorrect = checkCorrectness(question, req.getWriting());

        // 3. Fetch Word entities for the user's answer to save history
        // We only link words that actually exist in our DB.
        List<Word> userSelectedWords = wordRepository.findAllByWritingIn(req.getWriting());

        // 4. Create and Save UserAnswer
        UserAnswer userAnswer = UserAnswer.builder()
                .question(question)
                .isCorrect(isCorrect)
                .answerWords(userSelectedWords)
                .build();

        userAnswerRepository.save(userAnswer);

        return isCorrect;
    }

    private boolean checkCorrectness(Question question, List<String> userWriting) {
        if (userWriting == null || userWriting.isEmpty()) {
            return false;
        }

        // Normalize User Input (Trim & Lowercase)
        Set<String> userWords = userWriting.stream()
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        // Retrieve Correct Answers from DB
        List<Answer> correctAnswers = question.getCorrectAnswers();

        // Normalize Correct Answers
        // We flatten all words from all correct Answer entities into a single Set
        Set<String> correctWords = correctAnswers.stream()
                .flatMap(a -> a.getAnswerWords().stream())
                .map(w -> w.getWriting().trim().toLowerCase())
                .collect(Collectors.toSet());

        // Logic per Question Type
        return switch (question.getQuestionType()) {
            // For FIB, usually 1 word. Exact match.
            case FILL_IN_THE_BLANK -> userWords.equals(correctWords);

            // For MC, the user must select ALL correct options (based on QuizService generation).
            // If the user selects [A, B] and correct is [A, B], it matches.
            // If user selects [A] but correct is [A, B], it returns false (Strict mode).
            case MULTIPLE_CHOICE -> userWords.equals(correctWords);

            // For Synonym Matching, we compare the set of words involved.
            // Note: Since UserAnswer stores a flat list, we validate that the user
            // has found all the correct words involved in the pairs.
            case SYNONYM_MATCHING -> userWords.equals(correctWords);

            default -> false;
        };
    }
}
