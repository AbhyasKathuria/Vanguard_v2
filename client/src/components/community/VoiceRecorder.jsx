import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

export default function VoiceRecorder({ onRecordComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        
        // Pass blob and temporary url to parent handler
        if (onRecordComplete) {
          onRecordComplete({ blob: audioBlob, url });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied: ", err);
      alert("Please allow microphone permissions to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      {isRecording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center animate-pulse shadow-md cursor-pointer"
          title="Stop Recording"
        >
          <Square className="w-5 h-5 fill-white" />
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="w-12 h-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-text dark:text-white rounded-xl flex items-center justify-center cursor-pointer transition"
          title="Record Voice Note"
        >
          <Mic className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
