package com.ytuce.wordlearningapp.services.quiz;

import com.ytuce.wordlearningapp.models.*;
import com.ytuce.wordlearningapp.repositories.*;
import com.ytuce.wordlearningapp.services.question.responses.OptionDto;
import com.ytuce.wordlearningapp.services.question.responses.QuestionDto;
import com.ytuce.wordlearningapp.services.quiz.requests.GenerateQuizRequest;
import com.ytuce.wordlearningapp.services.quiz.responses.QuizDto;
import com.ytuce.wordlearningapp.services.wordlist.responses.WordWithMeaningDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final WordListRepository wordListRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final WordWithMeaningRepository wordWithMeaningRepository;

    private final int QUESTION_COUNT = 20;

    @Transactional
    public QuizDto generateQuiz(String email, GenerateQuizRequest req) {
        User user = userRepository.findByEmail(email).orElseThrow();
        WordList wordList = wordListRepository.findById(req.getWordListId()).orElseThrow();

        if(wordList.getWordWithMeaningList().size() < 8)
        {
            return QuizDto.builder().build();
        }

        List<WordWithMeaning> words = new ArrayList<>(wordList.getWordWithMeaningList());
        sortByScore(user, words);

        List<WordWithMeaning> selectedWords = selectWordsForQuiz(words);

        Quiz quiz = Quiz.builder().wordList(wordList).build();
        quizRepository.save(quiz);

        List<Question> questions = new ArrayList<>();
        for (int i = 0; i < selectedWords.size(); i++) {
            Question q = createQuestionForWord(selectedWords.get(i), words);
            q.setQuiz(quiz);
            questions.add(q);
        }

        saveQuestionsAndAnswers(questions);

        return mapToDto(quiz, questions);
    }

    private List<WordWithMeaning> selectWordsForQuiz(List<WordWithMeaning> sortedList) {
        int limit = Math.min(QUESTION_COUNT, sortedList.size());
        return sortedList.subList(0, limit);
    }

    private Question createQuestionForWord(WordWithMeaning target, List<WordWithMeaning> pool) {
        double rand = Math.random();

        Question q = null;

        if (pool.size() >= 8 && rand < 0.2) {
            q = generateSynonymMatching(pool);
        } else if (rand < 0.5) {
            q = generateMultipleChoice(target, pool);
        }

        return q == null ? generateFillInBlank(target) : q;
    }

    private Question generateMultipleChoice(WordWithMeaning target, List<WordWithMeaning> pool) {
        List<WordWithMeaning> options = new ArrayList<>();
        List<Answer> correctAnswers = new ArrayList<>();

        List<WordWithMeaning> synonyms = new ArrayList<>(target.getMeaning().getWordMeanings().stream()
                .filter(wm -> !Objects.equals(wm.getWord().getWriting(), target.getWord().getWriting()))
                .toList());

        int correctAnswerCount = (int) (Math.random() * 2 + 1);

        Collections.shuffle(synonyms);
        List<WordWithMeaning> correctWords = synonyms.stream()
                .limit(correctAnswerCount)
                .toList();

        if(correctWords.isEmpty())
        {
            return null;
        }

        correctAnswerCount = correctWords.size();

        for (WordWithMeaning wm : correctWords) {
            options.add(wm);
            correctAnswers.add(Answer.builder()
                    .answerWords(List.of(wm.getWord()))
                    .build());
        }

        List<WordWithMeaning> distractors = wordWithMeaningRepository.findAll();
        distractors.removeIf(w ->
                w.getMeaning().getMeaningId().equals(target.getMeaning().getMeaningId())
                || w.getWord().getWriting().equals(target.getWord().getWriting())
        );
        Collections.shuffle(distractors);

        for (int i = correctAnswerCount; i < 4; i++) {
            var d = distractors.get(i);
            options.add(d);
            distractors.remove(d);
        }
        Collections.shuffle(options);

        return Question.builder()
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .questionSentence("Select the word(s) matching: " + target.getWord().getWriting())
                .options(options)
                .correctAnswers(correctAnswers)
                .build();
    }

    private Question generateFillInBlank(WordWithMeaning target) {
        String sentence = target.getExampleSentence().getSentenceEn();
        String hidden = sentence.replaceAll("(?i)\\b" + target.getWord().getWriting() + "\\b", "_____");

        Answer ans = Answer.builder().answerWords(List.of(target.getWord())).build();

        return Question.builder()
                .questionType(QuestionType.FILL_IN_THE_BLANK)
                .questionSentence(hidden)
                .options(List.of(target))
                .correctAnswers(List.of(ans))
                .build();
    }

    private Question generateSynonymMatching(List<WordWithMeaning> pool) {
        List<Answer> answers = new ArrayList<>();
        List<WordWithMeaning> options = new ArrayList<>();
        List<WordWithMeaning> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled);

        for(int i = 0; i < 8; i+=2)
        {
            WordWithMeaning w1 = shuffled.get(i);
            var foundSynonym = w1.getMeaning().getWordMeanings().stream().filter(wm -> !Objects.equals(wm.getWord().getWriting(), w1.getWord().getWriting())).findFirst();

            if(foundSynonym.isEmpty())
            {
                continue;
            }

            var w2 = foundSynonym.get();

            options.add(w1);
            options.add(w2);

            answers.add(Answer.builder().answerWords(List.of(w1.getWord(), w2.getWord())).build());

            pool.remove(w1);
        }

        return Question.builder()
                .questionType(QuestionType.SYNONYM_MATCHING)
                .questionSentence("Match the pairs.")
                .options(options)
                .correctAnswers(answers)
                .build();
    }

    private void saveQuestionsAndAnswers(List<Question> questions) {
        for (Question q : questions) {
            questionRepository.save(q);
            for (Answer a : q.getCorrectAnswers()) {
                a.setQuestion(q);
                answerRepository.save(a);
            }
        }
    }

    private void sortByScore(User user, List<WordWithMeaning> list) {
        Map<Long, Integer> scores = new HashMap<>();
        list.forEach(w -> scores.put(w.getWordWithMeaningId(), 0));

        List<UserAnswer> history = userAnswerRepository.findAll();

        for (UserAnswer ua : history) {
            if(ua.getQuestion().getQuiz().getWordList().getUser().getUserId().equals(user.getUserId())) {
                boolean correct = isCorrect(ua);
                // Simple Score: +1 correct, -2 wrong.
                ua.getQuestion().getOptions().forEach(opt ->
                        scores.computeIfPresent(opt.getWordWithMeaningId(), (k, v) -> v + (correct ? 1 : -2))
                );
            }
        }
        list.sort(Comparator.comparingInt(w -> scores.getOrDefault(w.getWordWithMeaningId(), 0)));
    }

    private boolean isCorrect(UserAnswer ua) {
        return ua.isCorrect();
    }

    private QuizDto mapToDto(Quiz quiz, List<Question> questions) {
        return QuizDto.builder().quizId(quiz.getQuizId()).questions(questions.stream()
                .map(q -> {
                    var dto = new QuestionDto();
                    dto.setQuestionId(q.getQuestionId());
                    dto.setQuestionType(q.getQuestionType());
                    dto.setQuestionSentence(q.getQuestionSentence());
                    dto.setOptions(q.getOptions().stream().map(o -> {
                        var option = OptionDto.builder()
                                .writing(o.getWord().getWriting())
                                .build();

                        return option;
                    }).toList());

                    return dto;

        }).toList()).build();
    }
}