import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Volume2, Heart, AlertTriangle, Loader2, Send } from 'lucide-react';

const Voicebot = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [response, setResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [conversation, setConversation] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const timerRef = useRef(null);

  // Frequently asked health questions for quick access
  const frequentlyAskedQuestions = [
    'What are the symptoms of fever?',
    'How to reduce headache naturally?',
    'What causes stomach pain?',
    'When should I see a doctor for cough?',
    'How to improve sleep quality?',
    'What are signs of dehydration?',
 ];

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Please allow microphone access to use voice recording.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      clearInterval(timerRef.current);
    }
  };

  // Send audio to backend
  const sendAudioToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:5000/api/stt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const { transcription, answer, audioUrl } = data;
      
      setTranscription(transcription);
      setResponse(answer);
      setAudioUrl(audioUrl);
      console.log("Returned audio URL:", audioUrl);
      
      // Add to conversation history
      const newConversation = {
        id: Date.now(),
        question: transcription,
        answer: answer,
        audioUrl: audioUrl,
        timestamp: new Date().toLocaleString()
      };
      
      setConversation(prev => [newConversation, ...prev]);
      
    } catch (error) {
      console.error('Error sending audio:', error);
      alert('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Play audio response
  const playAudio = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Quick question selection
  const selectQuestion = (question) => {
    setTranscription(question);
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)',
      padding: '16px'
    },
    maxWidth: {
      maxWidth: '56rem',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    headerIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    },
    headerTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginLeft: '8px'
    },
    headerSubtitle: {
      color: '#4b5563',
      maxWidth: '32rem',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '32px',
      marginBottom: '24px'
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px'
    },
    sectionTitleText: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginLeft: '8px'
    },
    recordingButton: {
      width: '96px',
      height: '96px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: 'none',
      cursor: 'pointer',
      marginBottom: '24px'
    },
    recordingButtonActive: {
      backgroundColor: '#ef4444',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    },
    recordingButtonInactive: {
      backgroundColor: '#3b82f6'
    },
    recordingButtonHover: {
      backgroundColor: '#2563eb'
    },
    recordingButtonActiveHover: {
      backgroundColor: '#dc2626'
    },
    recordingButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      borderRadius: '9999px',
      marginBottom: '16px'
    },
    statusBadgeRecording: {
      backgroundColor: '#fef2f2',
      color: '#991b1b'
    },
    statusBadgeProcessing: {
      backgroundColor: '#dbeafe',
      color: '#1e40af'
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '8px'
    },
    statusDotRecording: {
      backgroundColor: '#ef4444',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    },
    instructionText: {
      color: '#4b5563',
      marginBottom: '16px'
    },
    questionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '12px',
      marginTop: '32px'
    },
    questionButton: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '0.875rem',
      transition: 'colors 0.2s',
      textAlign: 'left',
      border: '1px solid #bfdbfe',
      cursor: 'pointer'
    },
    questionButtonHover: {
      backgroundColor: '#bfdbfe',
      borderColor: '#93c5fd'
    },
    consultationCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '24px',
      marginBottom: '24px'
    },
    consultationTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px'
    },
    messageBox: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '16px'
    },
    questionBox: {
      backgroundColor: '#eff6ff',
      borderLeft: '4px solid #3b82f6'
    },
    answerBox: {
      backgroundColor: '#f0fdf4',
      borderLeft: '4px solid #10b981'
    },
    messageHeader: {
      display: 'flex',
      alignItems: 'flex-start'
    },
    messageIcon: {
      width: '20px',
      height: '20px',
      marginRight: '8px',
      marginTop: '2px'
    },
    messageContent: {
      flex: 1
    },
    messageLabel: {
      fontWeight: '500',
      marginBottom: '4px'
    },
    questionLabel: {
      color: '#1e40af'
    },
    answerLabel: {
      color: '#047857'
    },
    messageText: {
      whiteSpace: 'pre-wrap'
    },
    questionText: {
      color: '#1d4ed8'
    },
    answerText: {
      color: '#059669'
    },
    audioPlayer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '16px'
    },
    audioButton: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#10b981',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      transition: 'colors 0.2s',
      border: 'none',
      cursor: 'pointer'
    },
    audioButtonHover: {
      backgroundColor: '#059669'
    },
    hiddenAudio: {
      display: 'none'
    },
    historyCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '24px'
    },
    historyTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '16px'
    },
    historyList: {
      maxHeight: '384px',
      overflowY: 'auto'
    },
    historyItem: {
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '16px',
      marginBottom: '16px'
    },
    historyItemLast: {
      borderBottom: 'none'
    },
    historyTimestamp: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '8px'
    },
    historyQuestion: {
      backgroundColor: '#eff6ff',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '8px'
    },
    historyAnswer: {
      backgroundColor: '#f0fdf4',
      padding: '12px',
      borderRadius: '8px'
    },
    historyQuestionText: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#1e40af'
    },
    historyAnswerText: {
      fontSize: '0.875rem',
      color: '#059669',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical'
    },
    disclaimer: {
      backgroundColor: '#fefce8',
      border: '1px solid #fde047',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '24px'
    },
    disclaimerHeader: {
      display: 'flex',
      alignItems: 'flex-start'
    },
    disclaimerIcon: {
      width: '24px',
      height: '24px',
      color: '#ca8a04',
      marginRight: '12px',
      marginTop: '2px'
    },
    disclaimerTitle: {
      fontWeight: '600',
      color: '#92400e',
      marginBottom: '8px'
    },
    disclaimerText: {
      color: '#a16207',
      fontSize: '0.875rem'
    },
    orangeDot: {
      width: '8px',
      height: '8px',
      backgroundColor: '#f97316',
      borderRadius: '50%',
      marginRight: '8px'
    }
  };

  // Add keyframes for animations
  const keyframes = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.maxWidth}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerIcon}>
              <Heart style={{ width: '32px', height: '32px', color: '#ef4444', marginRight: '8px' }} />
              <h1 style={styles.headerTitle}>AI Health Assistant</h1>
            </div>
            <p style={styles.headerSubtitle}>
              Ask health-related questions in Hindi or English using your voice. Get AI-powered insights and audio responses.
            </p>
          </div>

          {/* Voice Recording Section */}
          <div style={styles.card}>
            <div style={{ textAlign: 'center' }}>
              <div style={styles.sectionTitle}>
                <div style={styles.orangeDot}></div>
                <h2 style={styles.sectionTitleText}>Ask Your Health Question</h2>
              </div>
              
              {/* Recording Button */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  style={{
                    ...styles.recordingButton,
                    ...(isRecording ? styles.recordingButtonActive : styles.recordingButtonInactive),
                    ...(isProcessing ? styles.recordingButtonDisabled : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) {
                      e.target.style.backgroundColor = isRecording ? '#dc2626' : '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessing) {
                      e.target.style.backgroundColor = isRecording ? '#ef4444' : '#3b82f6';
                    }
                  }}
                >
                  {isProcessing ? (
                    <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
                  ) : isRecording ? (
                    <MicOff style={{ width: '32px', height: '32px' }} />
                  ) : (
                    <Mic style={{ width: '32px', height: '32px' }} />
                  )}
                </button>
              </div>

              {/* Recording Status */}
              {isRecording && (
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ ...styles.statusBadge, ...styles.statusBadgeRecording }}>
                    <div style={{ ...styles.statusDot, ...styles.statusDotRecording }}></div>
                    Recording... {formatTime(recordingTime)}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ ...styles.statusBadge, ...styles.statusBadgeProcessing }}>
                    <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                    Processing your question...
                  </div>
                </div>
              )}

              <p style={styles.instructionText}>
                {isRecording ? 'Speak your health question now...' : 'Tap the microphone to start recording'}
              </p>
            </div>

            {/* Frequently Asked Questions */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
                Frequently Asked Questions (Quick Select)
              </h3>
              <div style={styles.questionGrid}>
                {frequentlyAskedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => selectQuestion(question)}
                    style={styles.questionButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#bfdbfe';
                      e.target.style.borderColor = '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#dbeafe';
                      e.target.style.borderColor = '#bfdbfe';
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Response */}
          {(transcription || response) && (
            <div style={styles.consultationCard}>
              <h3 style={styles.consultationTitle}>Current Consultation</h3>
              
              {transcription && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ ...styles.messageBox, ...styles.questionBox }}>
                    <div style={styles.messageHeader}>
                      <Send style={{ ...styles.messageIcon, color: '#3b82f6' }} />
                      <div style={styles.messageContent}>
                        <p style={{ ...styles.messageLabel, ...styles.questionLabel }}>Your Question:</p>
                        <p style={{ ...styles.messageText, ...styles.questionText }}>{transcription}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {response && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ ...styles.messageBox, ...styles.answerBox }}>
                    <div style={styles.messageHeader}>
                      <Heart style={{ ...styles.messageIcon, color: '#10b981' }} />
                      <div style={styles.messageContent}>
                        <p style={{ ...styles.messageLabel, ...styles.answerLabel }}>AI Health Assistant:</p>
                        <p style={{ ...styles.messageText, ...styles.answerText }}>{response}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Player */}
              {audioUrl && (
                <div style={styles.audioPlayer}>
                  <button
                    onClick={playAudio}
                    style={styles.audioButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#10b981';
                    }}
                  >
                    {isPlaying ? (
                      <Pause style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    ) : (
                      <Play style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    )}
                    {isPlaying ? 'Pause' : 'Play'} Audio Response
                    <Volume2 style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                  </button>
                  <audio
                    ref={audioPlayerRef}
                    src={audioUrl}
                    onEnded={handleAudioEnded}
                    style={styles.hiddenAudio}
                  />
                </div>
              )}
            </div>
          )}

          {/* Conversation History */}
          {conversation.length > 0 && (
            <div style={styles.historyCard}>
              <h3 style={styles.historyTitle}>Previous Consultations</h3>
              <div style={styles.historyList}>
                {conversation.map((item, index) => (
                  <div key={item.id} style={{
                    ...styles.historyItem,
                    ...(index === conversation.length - 1 ? styles.historyItemLast : {})
                  }}>
                    <div style={styles.historyTimestamp}>{item.timestamp}</div>
                    <div style={styles.historyQuestion}>
                      <p style={styles.historyQuestionText}>Q: {item.question}</p>
                    </div>
                    <div style={styles.historyAnswer}>
                      <p style={styles.historyAnswerText}>{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Disclaimer */}
          <div style={styles.disclaimer}>
            <div style={styles.disclaimerHeader}>
              <AlertTriangle style={styles.disclaimerIcon} />
              <div>
                <h4 style={styles.disclaimerTitle}>Important Disclaimer</h4>
                <p style={styles.disclaimerText}>
                  This AI tool provides preliminary health insights for educational purposes only. 
                  Always consult qualified healthcare professionals for proper diagnosis and treatment. 
                  In case of emergency, contact your local emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Voicebot;