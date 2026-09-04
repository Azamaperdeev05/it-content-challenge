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
  const { cameraStream, microphoneStream, screenshareStream } = useStreams();

  const mediaRecorder = useRef<MediaRecorder>();

  const startRecording = () => {
    const composedStream = composeStreams(
      layout === 'screenOnly' ? null : cameraStream,
      microphoneStream,
      layout === 'cameraOnly' ? null : screenshareStream,
    );

    if (composedStream.getTracks().length === 0) {
      alert('Камера немесе микрофон табылмады. Алдымен камера мен микрофонды қосыңыз!');
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
