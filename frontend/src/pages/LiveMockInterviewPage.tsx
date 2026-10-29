import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  RefreshCw,
  LogOut,
  Square,
  Brain,
  ChevronDown,
  Radio
} from 'lucide-react';
import { api } from '../api/client';
import { InterviewQuestion, AnswerFeedback } from '../types';

export const LiveMockInterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const openingState = (location.state || {}) as { interviewer_reply?: string; interviewer_thought?: string };

  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sttMode, setSttMode] = useState<'whisper_api' | 'browser_speech'>('whisper_api');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [latestFeedback, setLatestFeedback] = useState<AnswerFeedback | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [interviewerReply, setInterviewerReply] = useState<string>(openingState.interviewer_reply || '');
  const [interviewerThought, setInterviewerThought] = useState<string>(openingState.interviewer_thought || '');
  const [showThought, setShowThought] = useState(true);
  const [liveMode, setLiveMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const liveModeRef = useRef(true);
  const autoSubmitRef = useRef(false);
  const heardSpeechRef = useRef(false);
  const vadCleanupRef = useRef<() => void>(() => {});
  const speakTokenRef = useRef(0);
  const currentQuestionRef = useRef<InterviewQuestion | null>(null);
  const elapsedRef = useRef(0);
  const isCompletedRef = useRef(false);
  const submittingRef = useRef(false);
  liveModeRef.current = liveMode;
  currentQuestionRef.current = currentQuestion;
  elapsedRef.current = elapsedSeconds;
  isCompletedRef.current = isCompleted;

  // Load session
  useEffect(() => {
    if (!sessionId) return;
    api.getInterview(sessionId).then((data) => {
      setSession(data);
      if (data.questions && data.questions.length > 0) {
        // Pick the latest unanswered question
        const latestQ = data.questions[data.questions.length - 1];
        setCurrentQuestion(latestQ);
        setQuestionIndex(data.questions.length);
      }
    });
  }, [sessionId]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      autoSubmitRef.current = false;
      speakTokenRef.current++;
      vadCleanupRef.current();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const formatRecordingTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Text-to-Speech: speak aloud, then call onEnd (also called immediately if TTS is unavailable/muted)
  const speak = (text: string, onEnd?: () => void) => {
    const token = ++speakTokenRef.current;
    const done = () => {
      if (token !== speakTokenRef.current) return;
      setIsSpeaking(false);
      onEnd?.();
    };
    if (!('speechSynthesis' in window) || !ttsEnabled || !text) {
      done();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = done;
    utterance.onerror = done;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
    // Chrome sometimes never fires onend; don't let the live loop stall
    setTimeout(done, Math.max(8000, text.length * 90));
  };

  // Speak the interviewer's reaction + next question, then open the mic automatically in live mode
  useEffect(() => {
    if (!currentQuestion?.question_text) return;
    speak(`${interviewerReply} ${currentQuestion.question_text}`.trim(), () => {
      if (liveModeRef.current && !isCompletedRef.current) startWhisperRecording(true);
    });
  }, [currentQuestion]);

  // Groq Whisper STT API (MediaRecorder)
  const startWhisperRecording = async (auto = false) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      autoSubmitRef.current = auto;
      heardSpeechRef.current = false;

      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const recorder = selectedMime ? new MediaRecorder(stream, { mimeType: selectedMime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Voice-activity detection: end the turn after ~1.8s of silence once the candidate has spoken
      vadCleanupRef.current();
      if (auto) {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AC();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        const startedAt = Date.now();
        let lastVoice = 0;
        const iv = setInterval(() => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (const v of buf) {
            const d = (v - 128) / 128;
            sum += d * d;
          }
          const now = Date.now();
          if (Math.sqrt(sum / buf.length) > 0.03) {
            heardSpeechRef.current = true;
            lastVoice = now;
          }
          if (heardSpeechRef.current ? now - lastVoice > 1800 : now - startedAt > 20000) {
            stopWhisperRecording();
          }
        }, 100);
        vadCleanupRef.current = () => {
          clearInterval(iv);
          ctx.close().catch(() => {});
          vadCleanupRef.current = () => {};
        };
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        vadCleanupRef.current();
        const auto = autoSubmitRef.current;
        if (auto && !heardSpeechRef.current) {
          setIsRecording(false);
          setTranscriptionStatus("I didn't hear anything. Tap the mic to answer.");
          setTimeout(() => setTranscriptionStatus(null), 5000);
          return;
        }

        const chunks = audioChunksRef.current;
        if (chunks.length === 0) {
          setIsRecording(false);
          return;
        }

        const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (audioBlob.size < 500) {
          setIsRecording(false);
          return;
        }

        setIsTranscribing(true);
        setTranscriptionStatus('Transcribing speech via Groq Whisper API...');
        try {
          const extension = (recorder.mimeType || '').includes('mp4') ? 'm4a' : 'webm';
          const res = await api.transcribeAudio(audioBlob, `interview_speech.${extension}`);
          if (res.text) {
            setTranscriptionStatus(`Transcribed via Groq Whisper (${res.model})`);
            setTimeout(() => setTranscriptionStatus(null), 4000);
            if (auto && liveModeRef.current) {
              setAnswerText(res.text);
              setIsTranscribing(false);
              await submitText(res.text);
              return;
            }
            setAnswerText((prev) => (prev ? `${prev} ${res.text}` : res.text));
          }
        } catch (err: any) {
          console.error('STT API Error:', err);
          setTranscriptionStatus(err.message || 'STT transcription failed');
          setTimeout(() => setTranscriptionStatus(null), 5000);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic access error:', err);
      alert('Microphone access was denied or not available. Please allow microphone permissions or switch to Text mode.');
      setIsRecording(false);
    }
  };

  const stopWhisperRecording = () => {
    vadCleanupRef.current();
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Browser Web Speech API (fallback)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('In-browser speech recognition is not supported on this browser. Try switching to Whisper API mode.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const toggleVoiceInput = () => {
    if (sttMode === 'whisper_api') {
      if (isRecording) {
        stopWhisperRecording();
      } else {
        startWhisperRecording(liveModeRef.current);
      }
    } else {
      toggleSpeechRecognition();
    }
  };

  // Submit Answer
  const submitText = async (text: string) => {
    const question = currentQuestionRef.current;
    if (!text.trim() || !question || !sessionId || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const fb = await api.submitAnswer(sessionId, question.id, text, elapsedRef.current);
      setLatestFeedback(fb);
      setInterviewerReply(fb.interviewer_reply || '');
      setInterviewerThought(fb.interviewer_thought || '');

      if (fb.is_interview_complete) {
        setIsCompleted(true);
        isCompletedRef.current = true;
        speak('That wraps up our interview. Thank you, your evaluation report is ready.');
      } else if (fb.next_question) {
        // Advance to next question (the effect above speaks it, then re-opens the mic)
        setCurrentQuestion(fb.next_question);
        setQuestionIndex((prev) => prev + 1);
        setAnswerText('');
        setElapsedSeconds(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      autoSubmitRef.current = false;
      if (sttMode === 'whisper_api') {
        stopWhisperRecording();
      } else {
        recognitionRef.current?.stop();
        setIsRecording(false);
      }
    }
    await submitText(answerText);
  };

  const toggleLiveMode = () => {
    const next = !liveMode;
    setLiveMode(next);
    liveModeRef.current = next;
    if (next) {
      setSttMode('whisper_api');
      if (!isRecording && !isSpeaking && !isSubmitting && !isCompleted) startWhisperRecording(true);
    } else if (isRecording) {
      autoSubmitRef.current = false;
      stopWhisperRecording();
    }
  };

  const handleFinishAndEvaluate = () => {
    navigate(`/interviews/${sessionId}/evaluation`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 mt-3">Connecting to AI Interviewer...</p>
      </div>
    );
  }

  const totalQuestions = session?.total_questions || 5;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar: Progress & Controls */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-4 px-6 shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {session?.target_role || 'Mock Interview'}
            </span>
          </div>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-semibold text-slate-600">
            Question {questionIndex} of {totalQuestions}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
          <button
            onClick={toggleLiveMode}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center space-x-1.5 transition-colors ${
              liveMode ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
            title="Hands-free live conversation: the mic opens after the interviewer speaks and submits when you stop talking"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live {liveMode ? 'On' : 'Off'}</span>
          </button>
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`p-1.5 rounded-lg border transition-colors ${
              ttsEnabled ? 'bg-indigo-50 border-indigo-200 text-primary' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
            title={ttsEnabled ? 'Voice output enabled' : 'Voice output muted'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={handleFinishAndEvaluate}
            className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
            title="Conclude Interview Early"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interviewer Stage / Current Question */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              AI
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900">Senior Placement Interviewer</h2>
              <p className="text-[11px] text-slate-400">
                {currentQuestion.context_topic || `${currentQuestion.category.toUpperCase()} Round`}
              </p>
            </div>
          </div>
          {currentQuestion.is_follow_up && (
            <span className="px-2 py-0.5 bg-indigo-50 text-primary border border-indigo-200 text-[10px] font-bold rounded-full">
              Contextual Follow-up
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
          <span
            className={`w-2 h-2 rounded-full ${
              isSubmitting || isTranscribing
                ? 'bg-amber-500 animate-pulse'
                : isRecording
                ? 'bg-red-500 animate-pulse'
                : isSpeaking
                ? 'bg-indigo-500 animate-pulse'
                : 'bg-slate-300'
            }`}
          />
          <span>
            {isSubmitting
              ? 'Interviewer is thinking...'
              : isTranscribing
              ? 'Transcribing your answer...'
              : isRecording
              ? liveMode
                ? 'Listening... just stop talking when you are done'
                : 'Recording...'
              : isSpeaking
              ? 'Interviewer is speaking...'
              : liveMode
              ? 'Tap the mic to answer'
              : 'Your turn'}
          </span>
        </div>

        {interviewerReply && (
          <p className="text-sm text-slate-700 leading-relaxed italic">{interviewerReply}</p>
        )}

        <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <p className="text-sm font-semibold text-slate-900 leading-relaxed">
            "{currentQuestion.question_text}"
          </p>
        </div>

        {interviewerThought && (
          <div className="border border-violet-200 bg-violet-50/60 rounded-xl">
            <button
              type="button"
              onClick={() => setShowThought((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold text-violet-800"
            >
              <span className="flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 animate-pulse" />
                <span>Interviewer's Thought Process</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showThought ? 'rotate-180' : ''}`} />
            </button>
            {showThought && (
              <p className="px-4 pb-3 text-xs text-violet-900/90 leading-relaxed">{interviewerThought}</p>
            )}
          </div>
        )}
      </div>

      {/* Answer Feedback Toast / Card (if previously submitted) */}
      {latestFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-emerald-900">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Response Evaluated — Score: {latestFeedback.score}/100</span>
            </span>
            <span>Clarity: {latestFeedback.clarity_communication}% • Technical: {latestFeedback.technical_accuracy}%</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">{latestFeedback.feedback}</p>
        </div>
      )}

      {/* Response Workspace */}
      {!isCompleted ? (
        <div className="bg-surface border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="text-xs font-bold text-slate-700">Your Response:</label>
            <div className="flex items-center flex-wrap gap-2">
              {/* STT Mode Selector */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    if (isRecording) {
                      if (sttMode === 'whisper_api') stopWhisperRecording();
                      else { recognitionRef.current?.stop(); setIsRecording(false); }
                    }
                    setSttMode('whisper_api');
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 ${
                    sttMode === 'whisper_api'
                      ? 'bg-white text-primary shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Groq Whisper API (whisper-large-v3-turbo)"
                >
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span>Groq Whisper API</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isRecording) {
                      if (sttMode === 'whisper_api') stopWhisperRecording();
                      else { recognitionRef.current?.stop(); setIsRecording(false); }
                    }
                    setSttMode('browser_speech');
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    sttMode === 'browser_speech'
                      ? 'bg-white text-primary shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="In-Browser Web Speech API"
                >
                  Web Speech
                </button>
              </div>

              {/* Record / Stop Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isTranscribing}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-sm'
                    : isTranscribing
                    ? 'bg-indigo-100 text-primary cursor-wait'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-primary border border-indigo-200'
                }`}
              >
                {isTranscribing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transcribing with Whisper...</span>
                  </>
                ) : isRecording ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Recording ({formatRecordingTime(recordingSeconds)})</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>{sttMode === 'whisper_api' ? 'Record Voice (Whisper API)' : 'Speak via Mic'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {transcriptionStatus && (
            <div className="flex items-center space-x-2 text-[11px] text-indigo-700 bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 animate-pulse" />
              <span>{transcriptionStatus}</span>
            </div>
          )}

          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <textarea
              rows={6}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Structure your answer clearly. For behavioral questions, apply STAR (Situation, Task, Action, Result). For technical questions, mention trade-offs and tools..."
              className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Word count: {answerText.trim() ? answerText.trim().split(/\s+/).length : 0}
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !answerText.trim()}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Proceed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-surface border border-slate-200 rounded-2xl p-8 text-center shadow-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Mock Interview Complete!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All questions have been answered. The AI Placement Director has compiled your full performance evaluation report.
          </p>
          <div className="pt-2">
            <button
              onClick={handleFinishAndEvaluate}
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
            >
              <span>View Comprehensive Evaluation Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
