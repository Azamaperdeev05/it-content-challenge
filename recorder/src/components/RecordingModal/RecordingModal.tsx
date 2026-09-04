import { useState } from 'react';
import styles from './RecordingModal.module.css';

type RecordingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recordingBlob: Blob | null;
};

export const RecordingModal = ({
  isOpen,
  onClose,
  recordingBlob,
}: RecordingModalProps) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'converting'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen || !recordingBlob) return null;

  const downloadWebm = () => {
    const url = URL.createObjectURL(recordingBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recording_${Date.now()}.webm`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const convertToMp4 = async () => {
    setStatus('converting');
    setStatusMessage('MacBook аппараттық кодегімен MP4 жасалуда (0.5 сек)...');

    try {
      const response = await fetch('/api/convert-mp4', {
        method: 'POST',
        body: recordingBlob,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setStatusMessage('MP4 дайын, жүктелуде...');
      const mp4Blob = await response.blob();
      const url = URL.createObjectURL(mp4Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recording_${Date.now()}.mp4`;
      link.click();
      URL.revokeObjectURL(url);

      setStatus('idle');
      setStatusMessage('');
      onClose();
    } catch (error) {
      console.error('Server conversion failed, saving as WebM instead:', error);
      alert('MP4 сервері жауап бермеді, бейне тікелей WebM форматында жүктеледі.');
      downloadWebm();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '2rem',
          borderRadius: '16px',
          maxWidth: '460px',
          width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>
            🎉 Жазба аяқталды!
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {status !== 'idle' ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }}>
              ⚡
            </div>
            <p style={{ margin: '0.5rem 0', color: '#cbd5e1', fontSize: '14px', fontWeight: '600' }}>
              {statusMessage}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Видео сәтті жазылды. Қажетті форматыңызды таңдап жүктеп алыңыз:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Ultra-fast MP4 button */}
              <button
                type="button"
                onClick={convertToMp4}
                style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>🎬 MP4 ретінде сақтау</span>
                <span style={{ fontSize: '11px', opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.25)', padding: '3px 8px', borderRadius: '6px' }}>
                  Apple Silicon • 0.5 сек ⚡
                </span>
              </button>

              {/* Instant WebM button */}
              <button
                type="button"
                onClick={downloadWebm}
                style={{
                  padding: '12px 18px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>⚡ Түпнұсқа WebM жүктеу</span>
                <span style={{ fontSize: '11px', opacity: 0.9, backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '3px 8px', borderRadius: '6px' }}>
                  0 секунд • Лезде
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingModal;
