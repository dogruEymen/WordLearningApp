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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Question question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        boolean isCorrect = checkCorrectness(question, req.getWriting());

        List<Word> userSelectedWords = wordRepository.findAllByWritingIn(req.getWriting());

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

        Set<String> userWords = userWriting.stream()
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<Answer> correctAnswers = question.getCorrectAnswers();

        return correctAnswers.stream().anyMatch(answer -> userWords.containsAll(answer.getAnswerWords().stream().map(Word::getWriting).toList()));
    }
}
