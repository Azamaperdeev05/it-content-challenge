import { createContext, useContext, useRef, useState } from 'react';

import { RecordingModal } from 'components/RecordingModal';
import { composeStreams } from 'services/composer';

import { useLayout } from './layout';
import { useStreams } from './streams';

type RecordingContextType = {
  isRecording: boolean;
  isPaused: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  isModalOpen: boolean;
  closeModal: () => void;
};

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined,
);

type RecordingProviderProps = {
  children: React.ReactNode;
};

export const RecordingProvider = ({ children }: RecordingProviderProps) => {
  const { layout } = useLayout();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const {
    cameraStream,
    microphoneStream,
    screenshareStream,
    setCameraStream,
    setMicrophoneStream,
  } = useStreams();

  const mediaRecorder = useRef<MediaRecorder>();

  const startRecording = async () => {
    let activeMic = microphoneStream;
    let activeCam = cameraStream;

    // Automatically ensure active microphone stream exists
    if (
      !activeMic ||
      activeMic.getAudioTracks().length === 0 ||
      !activeMic.getAudioTracks()[0].enabled
    ) {
      try {
        activeMic = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        setMicrophoneStream(activeMic);
      } catch (err) {
        console.warn('Direct microphone capture warning:', err);
      }
    }

    // Automatically ensure active camera stream exists if not screenOnly
    if (!activeCam && layout !== 'screenOnly') {
      try {
        activeCam = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        setCameraStream(activeCam);
      } catch (err) {
        console.warn('Direct camera capture warning:', err);
      }
    }

    const composedStream = composeStreams(
      layout === 'screenOnly' ? null : activeCam,
      activeMic,
      layout === 'cameraOnly' ? null : screenshareStream,
    );

    if (composedStream.getTracks().length === 0) {
      alert('Камера немесе микрофон табылмады. Браузер рұқсаттарын тексеріңіз.');
      return;
    }

    setIsRecording(true);
    setIsPaused(false);

    const preferredMime = [
      'video/webm; codecs=vp9,opus',
      'video/webm; codecs=vp8,opus',
      'video/webm',
    ].find((type) => MediaRecorder.isTypeSupported(type)) || '';

    const options: MediaRecorderOptions = {
      videoBitsPerSecond: 8e6,
    };
    if (preferredMime) {
      options.mimeType = preferredMime;
    }

    try {
      mediaRecorder.current = new MediaRecorder(composedStream, options);
    } catch {
      mediaRecorder.current = new MediaRecorder(composedStream);
    }

    const chunks: Blob[] = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };

    mediaRecorder.current.onstop = () => {
      composedStream
        .getTracks()
        .forEach((track) => track.stop());

      const blob = new Blob(chunks, { type: chunks[0]?.type || 'video/webm' });

      setRecordingBlob(blob);
      setIsModalOpen(true);
      setIsRecording(false);
      setIsPaused(false);
    };

    mediaRecorder.current.start(1000);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    mediaRecorder.current?.pause();
    setIsPaused(true);
  };

  const resumeRecording = () => {
    setIsPaused(false);
    mediaRecorder.current?.resume();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRecordingBlob(null);
  };

  return (
    <RecordingContext.Provider
      value={{
        isRecording,
        isPaused,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        isModalOpen,
        closeModal,
      }}
    >
      {children}
      <RecordingModal
        isOpen={isModalOpen}
        onClose={closeModal}
        recordingBlob={recordingBlob}
      />
    </RecordingContext.Provider>
  );
};

export const useRecording = (): RecordingContextType => {
  const context = useContext(RecordingContext);

  if (context === undefined) {
    throw new Error('useRecording must be used within a RecordingProvider');
  }

  return context;
};
