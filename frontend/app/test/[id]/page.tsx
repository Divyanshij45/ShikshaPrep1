"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/utils/api";
import { toast } from "sonner";

// TypeScript interfaces
interface Question {
  id: number;
  question: string;
  type: "mcq" | "true-false" | "short-answer";
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface TestData {
  id: string;
  name: string;
  duration: string;
  questions: Question[];
}

interface TestResults {
  total: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  percentage: string;
}

interface Answers {
  [questionIndex: number]: string;
}

type QuestionStatus = "answered" | "flagged" | "not-visited";

export default function MockTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params?.id as string;

  // Test state
  const [testData, setTestData] = useState<TestData>({} as TestData);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [timeLeft, setTimeLeft] = useState<number>(60); // in seconds
  const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
  const [isReview, setIsReview] = useState<boolean>(false);
  const [isTestCompleted, setIsTestCompleted] = useState<boolean>(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [showConfirmStart, setShowConfirmStart] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getMockTests = async () => {
      try {
        const response = await makeAuthenticatedRequest(`/tests/${testId}`, {
          method: "GET",
        });
        if (response?.ok) {
          const testData: TestData = await response.json();
          setTestData(testData);
          setIsLoading(false);
        }
      } catch (err) {}
    };
    if (testId) {
      getMockTests();
    }
  }, [testId]);

  const convertToSeconds = (timeLeft: string): number => {
    if (timeLeft.endsWith("h")) {
      const minutes = parseInt(timeLeft.slice(0, -1), 10);
      return minutes * 60 * 60;
    } else if (timeLeft.endsWith("m")) {
      const minutes = parseInt(timeLeft.slice(0, -1), 10);
      return minutes * 60;
    } else if (timeLeft.endsWith("s")) {
      return parseInt(timeLeft.slice(0, -1), 10);
    } else {
      throw new Error(
        "Invalid duration format. Use 'Xm' for minutes or 'Xs' for seconds."
      );
    }
  };

  const formatDuration = (duration: string): string => {
    const value = parseInt(duration.slice(0, -1), 10);
    const unit = duration.slice(-1);

    switch (unit) {
      case "m":
        return `${value} ${value === 1 ? "minute" : "minutes"}`;
      case "h":
        return `${value} ${value === 1 ? "hour" : "hours"}`;
      case "s":
        return `${value} ${value === 1 ? "second" : "seconds"}`;
      default:
        throw new Error("Invalid duration format. Use 'Xm', 'Xh', or 'Xs'.");
    }
  };

  useEffect(() => {
    if (testData?.duration) {
      const seconds = convertToSeconds(testData.duration);
      setTimeLeft(seconds);
    }
  }, [testData?.duration]);

  // Timer effect
  useEffect(() => {
    if (!isTestStarted || isTestCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, isTestCompleted, timeLeft]);

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string): void => {
    setAnswers((prev: Answers) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  // Handle question navigation
  const goToQuestion = (index: number): void => {
    if (index >= 0 && index < testData.questions.length) {
      setCurrentQuestion(index);
    }
  };

  // Toggle flag
  const toggleFlag = (questionIndex: number = currentQuestion): void => {
    setFlaggedQuestions((prev: Set<number>) => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionIndex)) {
        newFlagged.delete(questionIndex);
      } else {
        newFlagged.add(questionIndex);
      }
      return newFlagged;
    });
  };

  // Start test
  const startTest = (): void => {
    setIsTestStarted(true);
    setShowConfirmStart(false);
  };

  // Show start confirmation
  const showStartConfirmation = (): void => {
    setShowConfirmStart(true);
  };

  // Submit test
  const handleSubmitTest = useCallback(async (): Promise<void> => {
    setIsTestCompleted(true);
    setShowConfirmSubmit(false);

    // Calculate results
    const results = calculateResults();

    try {
      const response = await makeAuthenticatedRequest(
        `/tests/${testId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, results }),
        }
      );
      if (response?.ok) {
        toast.success("Test submitted successfully!");
      }
    } catch (err) {}
  }, [answers, testId]);

  // Calculate results
  const calculateResults = (): TestResults => {
    let correct = 0;
    const attempted = answers ? Object.keys(answers).length : 0;

    testData?.questions?.forEach((question: Question, index: number) => {
      const userAnswer = answers[index];
      if (
        userAnswer &&
        userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()
      ) {
        correct++;
      }
    });

    return {
      total: testData?.questions?.length,
      attempted,
      correct,
      incorrect: attempted - correct,
      unattempted: testData?.questions?.length - attempted,
      percentage: ((correct / testData?.questions?.length) * 100).toFixed(1),
    };
  };

  // Get question status
  const getQuestionStatus = (index: number): QuestionStatus => {
    if (answers[index]) return "answered";
    if (flaggedQuestions.has(index)) return "flagged";
    return "not-visited";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  // Test completion screen
  if (isTestCompleted) {
    const results = calculateResults();
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Completed!
            </h1>
            <p className="text-gray-600">
              Thank you for taking the test. Here are your results:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {results.total}
              </div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {results.correct}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {results.incorrect}
              </div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {results.unattempted}
              </div>
              <div className="text-sm text-gray-600">Unattempted</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {results.percentage}%
            </div>
            <div className="text-gray-600">Overall Score</div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setIsTestCompleted(false);
                setIsReview(true);
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              See Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-test screen
  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {testData.name}
            </h1>
            <div className="flex items-center justify-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{formatDuration(testData?.duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{testData?.questions?.length} questions</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8 text-gray-700">
            <h2 className="text-xl font-semibold">Instructions:</h2>
            <ul className="space-y-2 pl-4">
              <li>
                • You have {formatDuration(testData?.duration)} to complete this
                test
              </li>
              <li>• The test will auto-submit when time expires</li>
              <li>
                • You can navigate between questions using the question palette
              </li>
              <li>• Flag questions for review using the flag button</li>
              <li>• Make sure to submit your test before leaving the page</li>
              <li>• Once submitted, you cannot modify your answers</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={showStartConfirmation}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Test
            </button>
          </div>
        </div>

        {/* Confirm Start Modal */}
        {showConfirmStart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold">Ready to Start Test?</h3>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-gray-600">
                  Please confirm that you're ready to begin the test. Once
                  started:
                </p>

                <ul className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
                    <span>
                      Timer will start immediately (
                      {formatDuration(testData?.duration)})
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                    <span>Test will auto-submit when time expires</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    <span>You cannot pause or restart the test</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Make sure you have a stable internet connection</span>
                  </li>
                </ul>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm font-medium">
                    💡 Tip: Close other applications and ensure you won't be
                    disturbed during the test.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmStart(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={startTest}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Yes, Start Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentQ: Question = testData?.questions?.[currentQuestion];
  const currentA: string =
    testData?.questions?.[currentQuestion]?.correctAnswer;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {testData.name}
          </h1>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
                timeLeft < 300
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        {/* Question Panel */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              Question {currentQuestion + 1} of {testData.questions?.length}
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 capitalize">
                {currentQ?.type?.replace("-", " ")}
              </span>
              <button
                onClick={() => toggleFlag()}
                className={`p-2 rounded-lg transition-colors ${
                  flaggedQuestions.has(currentQuestion)
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question */}
          <div className="mb-4">
            <p className="text-lg text-gray-900 leading-relaxed">
              {currentQ?.question}
            </p>
            {isReview && (
              <p className="text-sm text-green-600 leading-relaxed">
                {`Answer: ${currentA}`}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQ?.type === "short-answer" ? (
              <textarea
                value={answers[currentQuestion] || ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleAnswerSelect(e.target.value)
                }
                placeholder="Enter your answer here..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            ) : (
              currentQ?.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion] === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={option}
                    checked={answers[currentQuestion] === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="mr-3 text-blue-600"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <button
              onClick={() => goToQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-sm text-gray-500">
              {currentQuestion + 1} of {testData?.questions?.length}
            </span>

            <button
              onClick={() => goToQuestion(currentQuestion + 1)}
              disabled={currentQuestion === testData?.questions?.length - 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Palette */}
        <div className="w-80 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Question Palette</h3>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Flagged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Not Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Current</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {testData?.questions?.map((_: Question, index: number) => {
              const status = getQuestionStatus(index);
              const isCurrent = index === currentQuestion;

              return (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded text-sm font-medium transition-colors ${
                    isCurrent
                      ? "bg-blue-500 text-white"
                      : status === "answered"
                      ? "bg-green-500 text-white"
                      : status === "flagged"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Answered:</span>
              <span className="font-semibold">
                {Object.keys(answers).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Flagged:</span>
              <span className="font-semibold">{flaggedQuestions.size}</span>
            </div>
            <div className="flex justify-between">
              <span>Not Answered:</span>
              <span className="font-semibold">
                {testData?.questions?.length - Object.keys(answers).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold">Confirm Submission</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your test? You have answered{" "}
              <strong>{Object.keys(answers).length}</strong> out of{" "}
              <strong>{testData.questions.length}</strong> questions.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitTest}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
