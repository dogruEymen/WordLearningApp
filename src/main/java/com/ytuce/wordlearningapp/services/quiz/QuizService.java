package com.ytuce.wordlearningapp.services.quiz;

import com.ytuce.wordlearningapp.models.*;
import com.ytuce.wordlearningapp.repositories.QuestionRepository;
import com.ytuce.wordlearningapp.repositories.QuizRepository;
import com.ytuce.wordlearningapp.repositories.UserRepository;
import com.ytuce.wordlearningapp.repositories.WordListRepository;
import com.ytuce.wordlearningapp.services.quiz.requests.GenerateQuizRequest;
import com.ytuce.wordlearningapp.services.quiz.responses.QuizDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {
    private final WordListRepository wordListRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;

    private final int QUESTION_COUNT = 20;


    public QuizDto generateQuiz(String email, GenerateQuizRequest req)
    {
        User user = userRepository.findByEmail(email).orElseThrow();
        WordList wordList = wordListRepository.findById(req.getWordListId()).orElseThrow();

        List<Question> questions = generateQuestions(user, wordList.getWordWithMeaningList());

        Quiz quiz = Quiz.builder()
                .wordList(wordList)
                .questions(questions)
                .build();

        quizRepository.save(quiz);

        return null;
    }

    private List<Question> generateQuestions(User user, List<WordWithMeaning> wordWithMeaningList)
    {

        var q = Question.builder()
                .questionSentence("Test sentence")
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .build();

        return new ArrayList<>();
        /*

        generateOptionsForQuestion();

        return List.of(
          Question.builder()
        );
        // I think it could be better to just sort the list based on scores, we do not need the scores directly

        sortByScore(user, wordWithMeaningList);

        List<Question> questions = new ArrayList<>(10);

        // WordsMeanings with more frequent mistakes are always included in the first 5 quiz question
        for(int i = 0; i < wordWithMeaningList.size()/2; i++)
        {
            WordWithMeaning wordWithMeaning = wordWithMeaningList.get(i);

            questions.add(new Question());
        }

        // Other questions are generated randomly

        for(int i = wordWithMeaningList.size()/2; i < wordWithMeaningList.size(); i++)
        {
            WordWithMeaning wordWithMeaning = wordWithMeaningList.get(i);

            Question question = generateQuestion(wordWithMeaningList, wordWithMeaning);

            questions.add(question);
        }

        return questions;
        */
    }

    private void generateOptionsForQuestion(Question q)
    {
        switch (q.getQuestionType())
        {

        }

        if(q.getQuestionType() == QuestionType.FILL_IN_THE_BLANK)
        {
            return;
        }

        throw new RuntimeException("Not implemented");
    }

    private Question generateQuestion(List<WordWithMeaning> wordWithMeaningList, WordWithMeaning wordWithMeaning)
    {
        throw new RuntimeException("Not implemented yet!");
    }

    private Question generateSynonymMatchingQuestion(WordWithMeaning questionWord)
    {
        throw new RuntimeException("Not implemented!");
    }

    private Question generateSynonymSelectionQuestion(WordWithMeaning words)
    {
        throw new RuntimeException("Not implemented!");
    }

    private Question generateFillInTheMiddleQuestion(WordWithMeaning questionWord)
    {
        throw new RuntimeException("Not implemented!");
    }

    private void sortByScore(User user, List<WordWithMeaning> wordWithMeaningList)
    {
        throw new RuntimeException("Not implemented yet!");
    }

    private List<Integer> calculateScores(User user, List<WordWithMeaning> wordWithMeaningList)
    {
        //TODO: This method will return positive integers for the words that user knows (does not make mistakes),
        //TODO: 0 for the words that haven't been asked, and negative integers for the words that user does not
        //TODO: know or knows wrong
        throw new RuntimeException("Not implemented yet!");
    }
}
