import { useEffect, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import Button from '@mui/material/Button';
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
  const [status, setStatus] = useState<'idle' | 'loading' | 'converting'>(
    'idle',
  );
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const ffmpegRef = useRef<FFmpeg>();

  useEffect(() => {
    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg log:', message);
      if (message.includes('configuration')) {
        setStatusMessage('Кодекті іске қосу...');
      }
    });

    ffmpeg.on('progress', ({ progress }) => {
      setStatus('converting');
      const normalizedProgress = Math.abs(progress);
      const startValue = 2500000;
      const percentage = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (1 - (startValue - normalizedProgress) / startValue) * 100,
          ),
        ),
      );
      setProgress(percentage);
      setStatusMessage(`MP4-ке түрлендірілуде... ${percentage}%`);
    });

    // Background preload local FFmpeg so there is no network delay
    (async () => {
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
          wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
        });
        console.log('Local FFmpeg loaded in background!');
      } catch (e) {
        console.warn('Background FFmpeg preload warning:', e);
      }
    })();

    return () => {
      ffmpeg.off('log', () => {});
      ffmpeg.off('progress', () => {});
    };
  }, []);

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
    if (!ffmpegRef.current) return;

    setStatus('loading');
    setStatusMessage('Жергілікті FFmpeg кітапханасы іске қосылуда...');
    setProgress(0);

    const ffmpeg = ffmpegRef.current;

    try {
      if (!ffmpeg.loaded) {
        await ffmpeg.load({
          coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
          wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
        });
      }

      setStatusMessage('Видео өңделуге дайындалуда...');
      await ffmpeg.writeFile('input.webm', await fetchFile(recordingBlob));

      setStatusMessage('Жылдам түрлендірілуде (Ultrafast MP4)...');
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-c:a', 'aac',
        'output.mp4',
      ]);

      setStatusMessage('Файл дайын, жүктелуде...');
      const data = await ffmpeg.readFile('output.mp4');

      const url = URL.createObjectURL(
        new Blob([data instanceof Uint8Array ? data : new Uint8Array()], {
          type: 'video/mp4',
        }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `recording_${Date.now()}.mp4`;
      link.click();
      URL.revokeObjectURL(url);

      setStatus('idle');
      setStatusMessage('');
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Error converting video:', errorMessage);
      setStatusMessage(`Қате: ${errorMessage}`);
      setStatus('idle');
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
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }}>
              ⚙️
            </div>
            <p style={{ margin: '0.5rem 0', color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
              {statusMessage}
            </p>
            {status === 'converting' && (
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#334155',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginTop: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#3b82f6',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              Видео сәтті жазылды. Қажетті форматыңызды таңдаңыз:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Instant WebM button */}
              <button
                type="button"
                onClick={downloadWebm}
                style={{
                  padding: '12px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>⚡ Лезде жүктеу (WebM)</span>
                <span style={{ fontSize: '11px', opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.2)', padding: '3px 8px', borderRadius: '6px' }}>
                  0 секунд • Ұсынылады
                </span>
              </button>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '-4px', marginBottom: '6px', paddingLeft: '4px' }}>
                💡 WebM форматын Telegram, CapCut, Premiere, браузерлер бірден ашады, күтудің мүлдем қажеті жоқ!
              </div>

              {/* MP4 Fast Convert button */}
              <button
                type="button"
                onClick={convertToMp4}
                style={{
                  padding: '12px 18px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>🎬 MP4-ке айналдыру</span>
                <span style={{ fontSize: '11px', opacity: 0.9, backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                  Жергілікті FFmpeg
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
