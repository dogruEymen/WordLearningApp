package com.ytuce.wordlearningapp.services.quiz;

import com.ytuce.wordlearningapp.models.Question;
import com.ytuce.wordlearningapp.models.User;
import com.ytuce.wordlearningapp.models.WordList;
import com.ytuce.wordlearningapp.models.WordWithMeaning;
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

    public QuizDto generateQuiz(String email, GenerateQuizRequest req)
    {
        User user = userRepository.findByEmail(email).orElseThrow();
        WordList wordList = wordListRepository.findById(req.getWordListId()).orElseThrow();


        List<Question> questions = generateQuestions(user, wordList.getWordWithMeaningList());

        throw new RuntimeException("Not implemented yet!");
    }

    private List<Question> generateQuestions(User user, List<WordWithMeaning> wordWithMeaningList)
    {
        //TODO: This method will return positive integers for the words that user knows (does not make mistakes),
        //TODO: 0 for the words that haven't been asked, and negative integers for the words that user does not
        //TODO: know or knows wrong

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

            questions.add(new Question());
        }

        return questions;

    }

    private void sortByScore(User user, List<WordWithMeaning> wordWithMeaningList)
    {
        throw new RuntimeException("Not implemented yet!");
    }

    private List<Integer> calculateScores(User user, List<WordWithMeaning> wordWithMeaningList)
    {
        throw new RuntimeException("Not implemented yet!");
    }
}
