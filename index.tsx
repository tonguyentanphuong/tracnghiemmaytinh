import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import quizData from './quizData.json';

// Định nghĩa kiểu dữ liệu cho câu hỏi (song ngữ)
interface Question {
    id: string;
    section: number;
    question_vi: string;
    question_zh: string;
    options_vi: string[];
    options_zh: string[];
    answer_indices: number[];
    explanation_vi: string;
    explanation_zh: string;
}

type Language = 'vi' | 'zh';

const translations = {
    'app_title': { vi: 'Ôn Trắc Nghiệm', zh: '測驗練習' },
    'app_subtitle': { vi: 'Luyện thi trắc nghiệm song ngữ Việt-Trung', zh: '中越雙語測驗練習' },
    'section_label_home': { vi: 'Chọn Đề Thi', zh: '選擇題庫' },
    'num_questions_label_home': { vi: 'Chọn Số Câu', zh: '選擇題數' },
    'start_quiz': { vi: 'Bắt đầu làm bài', zh: '開始測驗' },
    'quiz_topic_section': { vi: 'Đề', zh: '題庫' },
    'quiz_topic_all_sections': { vi: 'Tất cả các đề', zh: '所有題庫' },
    'question': { vi: 'Câu', zh: '問題' },
    'of': { vi: 'trên', zh: '之' },
    'submit_answer': { vi: 'Kiểm tra', zh: '提交答案' },
    'checking': { vi: 'Đang kiểm tra...', zh: '检查中...' },
    'next_question': { vi: 'Câu tiếp theo', zh: '下一題' },
    'finish_quiz': { vi: 'Hoàn thành', zh: '完成測驗' },
    'finish_early': { vi: 'Nộp bài sớm', zh: '提早交卷' },
    'explanation': { vi: 'Giải thích', zh: '解釋' },
    'correct_answers': { vi: 'Các đáp án đúng:', zh: '正確答案:' },
    'back_to_home': { vi: 'Về trang chủ', zh: '返回首頁' },
    'retry_quiz': { vi: 'Làm lại', zh: '再試一次' },
    'your_score': { vi: 'Điểm của bạn', zh: '你的分數' },
    'results_title': { vi: 'Hoàn thành!', zh: '測驗結束！'},
    'results_great': { vi: 'Xuất sắc!', zh: '做得好！'},
    'results_good': { vi: 'Tốt lắm!', zh: '不錯！'},
    'results_retry': { vi: 'Cố gắng hơn nhé!', zh: '再接再厲！'},
    'all_questions': { vi: 'Tất cả', zh: '全部' },
    'questions_label': { vi: 'câu', zh: '題' },
    'shuffle_options': { vi: 'Xáo trộn đáp án', zh: '隨機排列選項' },
    'review_incorrect': { vi: 'Xem lại các câu sai', zh: '查看錯誤題目' },
};


interface HomeScreenProps {
    onStartQuiz: (questions: Question[], isShuffleOptions: boolean) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
    questionsBySection: { [key: number]: Question[] };
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartQuiz, language, setLanguage, questionsBySection }) => {
    const sections = useMemo(() => Object.keys(questionsBySection).map(Number).sort((a, b) => a - b), [questionsBySection]);
    const [selectedSection, setSelectedSection] = useState<number | 'all'>(sections.length > 0 ? sections[0] : 'all');
    const [numQuestionsOption, setNumQuestionsOption] = useState<10 | 20 | 50 | 'all'>(10);
    const [isShuffleOptions, setIsShuffleOptions] = useState<boolean>(false);
    const t = (key: keyof typeof translations) => translations[key][language];

    useEffect(() => {
        // Đồng bộ selectedSection với các section có sẵn
        if (sections.length > 0 && selectedSection !== 'all') {
            setSelectedSection(currentSelection => {
                 if (typeof currentSelection === 'number' && sections.includes(currentSelection)) {
                    return currentSelection;
                 }
                 return sections[0];
            });
        }
    }, [sections]);

    const toggleLanguage = () => {
        setLanguage(language === 'vi' ? 'zh' : 'vi');
    };

    const maxQuestions = useMemo(() => {
        if (selectedSection === 'all') {
            return Object.values(questionsBySection).flat().length;
        }
        return (questionsBySection[selectedSection] || []).length;
    }, [selectedSection, questionsBySection]);
    
    const numOptions = useMemo(() => ([10, 20, 50, 'all'] as const).filter(opt => {
        if (opt === 'all') return true;
        return opt <= maxQuestions;
    }), [maxQuestions]);

    useEffect(() => {
        // Nếu tùy chọn số câu hiện tại không còn hợp lệ, đặt lại về tùy chọn hợp lệ đầu tiên
        if (!numOptions.includes(numQuestionsOption)) {
             setNumQuestionsOption(numOptions.length > 0 ? numOptions[0] : 10);
        }
    }, [numOptions, numQuestionsOption]);
    
    const shuffleArray = <T,>(array: T[]): T[] => {
        return array.map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    };

    const handleStartClick = () => {
        const questionPool = selectedSection === 'all'
            ? Object.values(questionsBySection).flat()
            : questionsBySection[selectedSection] || [];

        const finalNumQuestions = numQuestionsOption === 'all'
            ? maxQuestions
            : numQuestionsOption;
        
        const selectedQuestions = shuffleArray(questionPool).slice(0, finalNumQuestions);
        onStartQuiz(selectedQuestions, isShuffleOptions);
    }

    return (
        <div className="home-screen">
             <header className="app-header">
                <div/>
                <h1 className="app-title">{t('app_title')}</h1>
                <button onClick={toggleLanguage} className="lang-toggle">
                    {language === 'vi' ? '中文' : 'Tiếng Việt'}
                </button>
            </header>
            <p className="app-subtitle">{t('app_subtitle')}</p>
            
            <div className="settings-container">
                <div className="setting-group">
                    <h3 className="setting-label">{t('section_label_home')}</h3>
                    <div className="setting-options">
                        {sections.map(section => (
                            <button 
                                key={section}
                                className={`setting-btn ${selectedSection === section ? 'active' : ''}`}
                                onClick={() => setSelectedSection(section)}
                            >
                                {t('quiz_topic_section')} {section}
                            </button>
                        ))}
                        {sections.length > 1 && (
                             <button 
                                key="all"
                                className={`setting-btn ${selectedSection === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedSection('all')}
                            >
                                {t('quiz_topic_all_sections')}
                            </button>
                        )}
                    </div>
                </div>
                 <div className="setting-group">
                    <h3 className="setting-label">{t('num_questions_label_home')}</h3>
                    <div className="setting-options">
                        {numOptions.map(opt => (
                            <button
                                key={opt}
                                className={`setting-btn ${numQuestionsOption === opt ? 'active' : ''}`}
                                onClick={() => setNumQuestionsOption(opt)}
                            >
                                {opt === 'all' ? t('all_questions') : `${opt} ${t('questions_label')}`}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="setting-group">
                    <label className="setting-checkbox">
                        <input
                            type="checkbox"
                            checked={isShuffleOptions}
                            onChange={(e) => setIsShuffleOptions(e.target.checked)}
                        />
                        {t('shuffle_options')}
                    </label>
                </div>
            </div>

            <div className="start-quiz-container">
                <button
                    className="btn btn-primary"
                    onClick={handleStartClick}
                    disabled={sections.length === 0 || maxQuestions === 0}
                >
                    {t('start_quiz')}
                </button>
            </div>
        </div>
    );
};

interface QuizScreenProps {
    questions: Question[];
    onQuizComplete: (results: ('pending' | 'correct' | 'incorrect')[]) => void;
    language: Language;
    setLanguage: (lang: Language) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, onQuizComplete, language, setLanguage }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionStatus, setQuestionStatus] = useState<('pending' | 'correct' | 'incorrect')[]>(() => Array(questions.length).fill('pending'));
    const [isFadingOut, setIsFadingOut] = useState(false);

    const t = (key: keyof typeof translations) => translations[key][language];

    const toggleLanguage = () => {
        setLanguage(language === 'vi' ? 'zh' : 'vi');
    };

    useEffect(() => {
        // Reset state when questions change (e.g., retrying)
        setCurrentQuestionIndex(0);
        setSelectedOptions([]);
        setShowExplanation(false);
        setIsSubmitting(false);
        setQuestionStatus(Array(questions.length).fill('pending'));
    }, [questions]);

    const handleOptionClick = (optionIndex: number) => {
        if (showExplanation || isSubmitting) return;

        setSelectedOptions(prev => {
            const currentQuestion = questions[currentQuestionIndex];
            const isMultiAnswer = currentQuestion.answer_indices.length > 1;
            
            if (!isMultiAnswer) {
                return [optionIndex];
            }

            if (prev.includes(optionIndex)) {
                return prev.filter(item => item !== optionIndex);
            } else {
                return [...prev, optionIndex];
            }
        });
    };
    
    const handleSubmitAnswer = () => {
        if (selectedOptions.length === 0 || isSubmitting) return;
    
        setIsSubmitting(true);
    
        setTimeout(() => {
            const currentQuestion = questions[currentQuestionIndex];
            const correctAnswers = currentQuestion.answer_indices;
            const isCorrect = [...selectedOptions].sort().toString() === [...correctAnswers].sort().toString();
            
            setQuestionStatus(prev => {
                const newStatus = [...prev];
                newStatus[currentQuestionIndex] = isCorrect ? 'correct' : 'incorrect';
                return newStatus;
            });
            setShowExplanation(true);
            setIsSubmitting(false);
        }, 800); // Animation duration
    };

    const goToNext = () => {
        setIsFadingOut(true);
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setShowExplanation(false);
                setSelectedOptions([]);
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                onQuizComplete(questionStatus);
            }
             setIsFadingOut(false);
        }, 300) // Match fadeOut animation duration
    };
    
    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    const getTopicText = () => {
        const uniqueSections = [...new Set(questions.map(q => q.section))];
        if (uniqueSections.length > 1) {
            return t('quiz_topic_all_sections');
        }
        return `${t('quiz_topic_section')} ${currentQuestion.section}`;
    }

    return (
        <div className="quiz-screen">
            <header className="app-header">
                <div className="quiz-topic">{getTopicText()}</div>
                <div className="question-counter">{t('question')} {currentQuestionIndex + 1} {t('of')} {questions.length}</div>
                <div className="header-actions">
                    <button onClick={() => onQuizComplete(questionStatus)} className="btn-finish-early">{t('finish_early')}</button>
                    <button onClick={toggleLanguage} className="lang-toggle">
                        {language === 'vi' ? '中文' : 'Tiếng Việt'}
                    </button>
                </div>
            </header>
            
            <div className="progress-indicator">
                {questionStatus.map((status, index) => {
                    let finalClass = 'progress-segment';
                    if (index === currentQuestionIndex && status === 'pending') {
                        finalClass += ' current';
                    } else if (status !== 'pending') {
                        finalClass += ` ${status}`;
                    }
                     return <div key={index} className={finalClass}></div>
                })}
            </div>

            <div className={`question-card ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
                <h2 className="question-text">{language === 'vi' ? currentQuestion.question_vi : currentQuestion.question_zh}</h2>
                <div className="options-grid">
                    {(language === 'vi' ? currentQuestion.options_vi : currentQuestion.options_zh).map((option, index) => {
                        const isSelected = selectedOptions.includes(index);
                        const isCorrect = currentQuestion.answer_indices.includes(index);
                        
                        let optionClassName = 'option-btn';
                        if (showExplanation) {
                            if (isCorrect) {
                                optionClassName += ' correct';
                            } else if (isSelected) {
                                optionClassName += ' incorrect';
                            }
                        } else if (isSelected) {
                            optionClassName += ' selected';
                             if (isSubmitting) {
                                optionClassName += ' submitting';
                            }
                        }

                        return (
                            <button
                                key={index}
                                className={optionClassName}
                                onClick={() => handleOptionClick(index)}
                                disabled={showExplanation || isSubmitting}
                                aria-pressed={isSelected}
                            >
                                <span>{option}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showExplanation && (
                <div className="explanation fade-in">
                    <h3 className="explanation-title">{t('explanation')}</h3>
                    <p>{language === 'vi' ? currentQuestion.explanation_vi : currentQuestion.explanation_zh}</p>
                    <h4 className="explanation-title" style={{marginTop: '1rem'}}>{t('correct_answers')}</h4>
                     <ul className="correct-answers-list">
                       {currentQuestion.answer_indices.map(idx => (
                        <li key={idx}>{(language === 'vi' ? currentQuestion.options_vi : currentQuestion.options_zh)[idx]}</li>
                       ))}
                    </ul>
                </div>
            )}

            <div className="quiz-navigation">
                {showExplanation ? (
                     <button onClick={goToNext} className="btn btn-primary nav-btn">
                        {currentQuestionIndex === questions.length - 1 ? t('finish_quiz') : t('next_question')}
                    </button>
                ) : (
                    <button onClick={handleSubmitAnswer} className="btn btn-primary nav-btn" disabled={selectedOptions.length === 0 || isSubmitting}>
                         {isSubmitting ? t('checking') : t('submit_answer')}
                    </button>
                )}
            </div>
        </div>
    );
};


interface ResultsScreenProps {
    results: ('pending' | 'correct' | 'incorrect')[];
    questions: Question[];
    onRetry: () => void;
    onBackToHome: () => void;
    language: Language;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, questions, onRetry, onBackToHome, language }) => {
    const correctAnswers = results.filter(r => r === 'correct').length;
    const totalQuestions = results.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const t = (key: keyof typeof translations) => translations[key][language];

    const getResultMessage = () => {
        if (score >= 90) return t('results_great');
        if (score >= 60) return t('results_good');
        return t('results_retry');
    }

    const incorrectIndices = results
        .map((status, index) => status === 'incorrect' ? index : -1)
        .filter(index => index !== -1);

    return (
        <div className="results-screen">
            <h1 className="app-title">{t('results_title')}</h1>
            <p className="app-subtitle">{getResultMessage()}</p>
            <div className="score-circle">
                <div className="score-text">{score}<span>%</span></div>
                <div className="score-details">{correctAnswers} / {totalQuestions}</div>
            </div>
             <div className="progress-indicator" style={{margin: '2.5rem 0'}}>
                {results.map((status, index) => (
                    <div key={index} className={`progress-segment ${status === 'pending' ? '' : status}`}></div>
                ))}
            </div>
            <div className="results-actions">
                <button onClick={onRetry} className="btn btn-secondary">{t('retry_quiz')}</button>
                <button onClick={onBackToHome} className="btn btn-primary">{t('back_to_home')}</button>
            </div>

            {incorrectIndices.length > 0 && (
                <div className="incorrect-review-section">
                    <h3 className="review-title">{t('review_incorrect')}</h3>
                    <div className="incorrect-list">
                        {incorrectIndices.map(index => {
                            const q = questions[index];
                            return (
                                <div key={index} className="incorrect-item">
                                    <h4 className="incorrect-question">
                                        {index + 1}. {language === 'vi' ? q.question_vi : q.question_zh}
                                    </h4>
                                    <div className="incorrect-answer">
                                        <strong>{t('correct_answers')}</strong>
                                        <ul className="correct-answers-list" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                            {q.answer_indices.map(idx => (
                                                <li key={idx} style={{ padding: '0.5rem' }}>{(language === 'vi' ? q.options_vi : q.options_zh)[idx]}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="incorrect-explanation">
                                        <strong>{t('explanation')}:</strong> {language === 'vi' ? q.explanation_vi : q.explanation_zh}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const shuffleQuestionOptions = (question: Question): Question => {
    const numOptions = question.options_vi.length;
    const indices = Array.from({ length: numOptions }, (_, i) => i);
    const shuffledIndices = indices.map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    const newOptionsVi = shuffledIndices.map(i => question.options_vi[i]);
    const newOptionsZh = shuffledIndices.map(i => question.options_zh[i]);
    const newAnswerIndices = question.answer_indices.map(oldIdx => shuffledIndices.indexOf(oldIdx));

    return {
        ...question,
        options_vi: newOptionsVi,
        options_zh: newOptionsZh,
        answer_indices: newAnswerIndices
    };
};

// Main App Component
const App = () => {
    const [gameState, setGameState] = useState<'home' | 'quiz' | 'results'>('home');
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [quizResults, setQuizResults] = useState<('pending' | 'correct' | 'incorrect')[]>([]);
    const [language, setLanguage] = useState<Language>('zh');
    const [isShuffleOptionsGlobal, setIsShuffleOptionsGlobal] = useState<boolean>(false);
    
    const questionsBySection = useMemo(() => {
        const data: Question[] = quizData;
        return data.reduce((acc, question) => {
            const section = question.section;
            if (!acc[section]) {
                acc[section] = [];
            }
            acc[section].push(question);
            return acc;
        }, {} as { [key: number]: Question[] });
    }, []);

    const handleStartQuiz = (selectedQuestions: Question[], isShuffleOptions: boolean) => {
        setIsShuffleOptionsGlobal(isShuffleOptions);
        if (isShuffleOptions) {
            setQuizQuestions(selectedQuestions.map(q => shuffleQuestionOptions(q)));
        } else {
            setQuizQuestions(selectedQuestions);
        }
        setGameState('quiz');
    };

    const handleQuizComplete = (results: ('pending' | 'correct' | 'incorrect')[]) => {
        setQuizResults(results);
        setGameState('results');
    };
    
    const shuffleArray = <T,>(array: T[]): T[] => {
        return array.map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    };

    const handleRetry = () => {
        const newShuffled = shuffleArray(quizQuestions);
        if (isShuffleOptionsGlobal) {
            setQuizQuestions(newShuffled.map(q => shuffleQuestionOptions(q)));
        } else {
            setQuizQuestions([...newShuffled]);
        }
        setGameState('quiz');
    }

    const handleBackToHome = () => {
        setGameState('home');
    };

    const renderContent = () => {
        switch (gameState) {
            case 'quiz':
                return <QuizScreen questions={quizQuestions} onQuizComplete={handleQuizComplete} language={language} setLanguage={setLanguage} />;
            case 'results':
                return <ResultsScreen results={quizResults} questions={quizQuestions} onRetry={handleRetry} onBackToHome={handleBackToHome} language={language} />;
            case 'home':
            default:
                return <HomeScreen onStartQuiz={handleStartQuiz} language={language} setLanguage={setLanguage} questionsBySection={questionsBySection}/>;
        }
    };

    return <div className="app-container">{renderContent()}</div>;
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);