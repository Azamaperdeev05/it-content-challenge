'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useAnimation } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  Rewind,
  FastForward,
  Minus,
  Plus,
  RotateCcw,
  ExternalLink,
  Camera,
  CameraOff,
} from 'lucide-react';
import { useStreams } from 'contexts/streams';
import { useMediaDevices } from 'contexts/mediaDevices';
import { useRecording } from 'contexts/recording';
import useVideoSource from 'hooks/useVideoSource';
import styles from './Teleprompter.module.css';

const DEFAULT_SPEED = 0.35;

const PRESET_GPT6 = `Жасанды интеллект енді жай ғана сұраққа жауап беретін чат емес!

OpenAI AGI дәуірін ресми түрде бастады.

Бүгін олар жаңа GPT-6 Astra моделін жарыққа шығарды!

Ол экраныңызды тікелей көріп, компьютеріңізді сіздің орныңызға өзі басқара алады.

Ең таңғаларлығы не білесіз бе?

Ол Unity-де ойынды нөлден жасап, өзі қосып ойнайды! Қатесін экраннан байқаса, кодқа қайта кіріп, өзі түзеп шығады.

Minecraft сияқты ойындарды, күрделі сайттар мен презентацияларды бар болғаны бір ғана промптпен жасап жатыр!

Болашақтың осындай керемет технологияларынан қалып қоймау үшін — дәл қазір @a.perdeev парақшасына жазылып қойыңыз!`;

const PRESET_GAMMA = `Слайд жасау үшін әлі күнге дейін сағаттап отырсыз ба?

Мына құпия сайтты әлі білмейсіз бе?

PowerPoint-тың енді мүлдем керегі жоқ!

Браузерден Gamma App сайтына кіресіз де, тақырыпты қазақша жазасыз.

Мысалы: «Қазақстандағы IT және AI трендтері».

Бар болғаны бір ғана батырманы бассаңыз болды...

Қараңыз: небәрі 30 секундта дайын дизайн, сапалы суреттерімен мінсіз қазақша 10 беттік слайд дайын болды!

Сайттың аты — Gamma App.

Жоғалтып алмас үшін видеоны сақтап қойыңыз және слайд жасап жүрген досыңызға жіберіңіз!

Күнделікті өмірді жеңілдететін AI құралдар үшін @a.perdeev-ке жазылыңыз!`;

interface TeleprompterProps {
  onClose: () => void;
}

export function Teleprompter({ onClose }: TeleprompterProps) {
  const [text, setText] = useState(PRESET_GAMMA);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [showInput, setShowInput] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  // Recording integration
  const { isRecording, startRecording, stopRecording } = useRecording();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const { cameraStream } = useStreams();
  const { setCameraEnabled } = useMediaDevices();
  const videoSourceRef = useVideoSource(cameraStream);

  const scrollControls = useAnimation();
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Automatically request camera if not enabled
  useEffect(() => {
    if (!cameraStream) {
      setCameraEnabled(true).catch(console.warn);
    }
  }, [cameraStream, setCameraEnabled]);

  // Track recording elapsed time
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const getScrollInfo = () => {
    if (!scrollContainerRef.current || !contentRef.current)
      return { totalScroll: 0, viewportHeight: 0 };
    const viewportHeight = scrollContainerRef.current.clientHeight;
    const totalScroll = contentRef.current.scrollHeight - viewportHeight;
    return { totalScroll, viewportHeight };
  };

  const togglePlay = () => {
    if (showInput) {
      setShowInput(false);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const changeSpeed = (delta: number) => {
    setSpeed((prevSpeed) => {
      const newSpeed = Math.max(0.1, Math.min(prevSpeed + delta, 3));
      return Number.parseFloat(newSpeed.toFixed(1));
    });
  };

  const resetTeleprompter = () => {
    setSpeed(DEFAULT_SPEED);
    setScrollProgress(0);
    scrollControls.set({ y: 0 });
    setIsPlaying(false);
  };

  const seek = (direction: 'forward' | 'backward') => {
    const { totalScroll } = getScrollInfo();
    const seekAmount = totalScroll * 0.1;
    const newProgress =
      direction === 'forward'
        ? Math.min(scrollProgress + seekAmount, totalScroll)
        : Math.max(scrollProgress - seekAmount, 0);

    setScrollProgress(newProgress);
    scrollControls.start({ y: -newProgress, transition: { duration: 0.3 } });
  };

  // Real Recording Trigger with 3-2-1 Countdown & Auto-Scroll
  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
      setIsPlaying(false);
    } else {
      if (!cameraStream) {
        setCameraEnabled(true);
      }
      setCountdown(3);
      let count = 3;
      const timer = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(timer);
          setCountdown(null);
          startRecording();
          setIsPlaying(true);
        } else {
          setCountdown(count);
        }
      }, 1000);
    }
  };

  // Open Document Picture-in-Picture (Always on top across Mac)
  const togglePip = async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    if ('documentPictureInPicture' in window) {
      try {
        const pip = await (window as any).documentPictureInPicture.requestWindow({
          width: 640,
          height: 560,
        });

        // Copy styles
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules]
              .map((rule) => rule.cssText)
              .join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pip.document.head.appendChild(style);
          } catch (e) {
            if (styleSheet.href) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.href = styleSheet.href;
              pip.document.head.appendChild(link);
            }
          }
        });

        pip.document.body.style.margin = '0';
        pip.document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        pip.document.body.style.overflow = 'hidden';

        pip.onpagehide = () => {
          setPipWindow(null);
        };

        setPipWindow(pip);
      } catch (err) {
        console.error('Failed to open Document PiP:', err);
      }
    } else {
      alert('Экран үстіне шығару мүмкіндігі Google Chrome браузерінде жұмыс істейді.');
    }
  };

  // Scroll animation
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (isPlaying && contentRef.current && scrollContainerRef.current) {
        const { totalScroll } = getScrollInfo();
        const newProgress = Math.min(scrollProgress + speed, totalScroll);
        setScrollProgress(newProgress);
        scrollControls.set({ y: -newProgress });

        if (newProgress >= totalScroll) {
          setIsPlaying(false);
        } else {
          animationFrameId = requestAnimationFrame(animate);
        }
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, speed, scrollProgress, scrollControls]);

  // Spacebar control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !showInput) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInput]);

  const renderContent = (isFloating: boolean = false) => (
    <div
      className={styles.content}
      style={isFloating ? { height: '100vh', display: 'flex', flexDirection: 'column' } : {}}
    >
      {/* Top Header & Presets Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => { setText(PRESET_GPT6); resetTeleprompter(); }}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              background: 'rgba(147, 51, 234, 0.35)',
              border: '1px solid rgba(147, 51, 234, 0.7)',
              color: '#f3e8ff',
              cursor: 'pointer',
            }}
          >
            🤖 GPT-6 Astra
          </button>
          <button
            type="button"
            onClick={() => { setText(PRESET_GAMMA); resetTeleprompter(); }}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              background: 'rgba(59, 130, 246, 0.35)',
              border: '1px solid rgba(59, 130, 246, 0.7)',
              color: '#dbeafe',
              cursor: 'pointer',
            }}
          >
            📊 Gamma Слайд
          </button>
          <button
            type="button"
            onClick={() => setShowCamera(!showCamera)}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              background: showCamera ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: showCamera ? '#4ade80' : '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {showCamera ? <Camera className="h-3.5 w-3.5" /> : <CameraOff className="h-3.5 w-3.5" />}
            <span>Камера</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInput(!showInput)}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {showInput ? 'Оқу режимі' : 'Өңдеу ✏️'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className={styles.controlButton}
            onClick={togglePip}
            title={isFloating ? "Браузерге қайтару" : "Экран үстіне шығару (Always-on-top)"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#38bdf8',
              padding: '5px 10px',
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{isFloating ? 'Браузерге қайтару' : 'Экранға шығару 🪟'}</span>
          </button>
          {!isFloating && (
            <button
              className={styles.closeButton}
              onClick={() => {
                setShowInput(true);
                setIsPlaying(false);
                onClose();
              }}
              style={{ position: 'static' }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Studio View: Camera AS BACKGROUND, Teleprompter text directly OVERLAID on top */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isFloating ? 'calc(100vh - 120px)' : '480px',
          backgroundColor: '#0a0a0c',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Background Live Camera View (MacBook FaceTime HD) */}
        {showCamera && cameraStream ? (
          <video
            ref={videoSourceRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              filter: 'brightness(0.92) contrast(1.05)',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              gap: '12px',
            }}
          >
            <CameraOff style={{ width: '36px', height: '36px', color: '#64748b' }} />
            <p style={{ margin: 0, fontSize: '13px' }}>Камера қосылмаған немесе рұқсат берілмеді</p>
            <button
              type="button"
              onClick={() => setCameraEnabled(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              📷 Камераны қосу (Рұқсат беру)
            </button>
          </div>
        )}

        {/* Live Recording Badge & Timer */}
        {isRecording && (
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              zIndex: 30,
              backgroundColor: 'rgba(220, 38, 38, 0.9)',
              backdropFilter: 'blur(6px)',
              padding: '6px 14px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '800',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
              }}
            />
            <span>REC {Math.floor(recordSeconds / 60).toString().padStart(2, '0')}:{(recordSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
        )}

        {/* 3-2-1 Countdown Overlay */}
        {countdown !== null && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '6rem',
                fontWeight: '900',
                color: '#f59e0b',
                textShadow: '0 4px 25px rgba(245, 158, 11, 0.9)',
              }}
            >
              {countdown}
            </div>
            <div style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: '700', marginTop: '10px' }}>
              Камераға қараңыз, түсіру басталуда... 🎥
            </div>
          </div>
        )}

        {/* Script Overlay: Scrolling Text over Camera */}
        {showInput ? (
          <div
            style={{
              position: 'relative',
              zIndex: 20,
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(10px)',
              flex: 1,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Мәтінді осында жазыңыз немесе қойыңыз..."
              style={{
                flex: 1,
                width: '100%',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '8px',
                padding: '12px',
                color: '#ffffff',
                fontSize: '15px',
                lineHeight: '1.6',
                resize: 'none',
                outline: 'none',
              }}
              spellCheck="false"
            />
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            style={{
              position: 'relative',
              zIndex: 10,
              flex: 1,
              overflow: 'hidden',
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 40%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.85) 100%)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Eye-level Focus Marker */}
            <div
              style={{
                position: 'absolute',
                top: '25%',
                left: '20px',
                right: '20px',
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                pointerEvents: 'none',
                zIndex: 12,
              }}
            />

            <motion.div
              ref={contentRef}
              animate={scrollControls}
              style={{
                fontSize: '1.45rem',
                fontWeight: '700',
                color: '#ffffff',
                textShadow: '0 2px 10px #000000, 0 1px 4px #000000',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                lineHeight: '1.75',
                whiteSpace: 'pre-wrap',
                userSelect: 'none',
              }}
            >
              {text}
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar with HERO Record Button */}
      <div
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          gap: '10px',
        }}
      >
        {/* Left: Speed Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className={styles.controlButton}
            onClick={() => changeSpeed(-0.1)}
            title="Жайлату"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '34px', textAlign: 'center', color: '#cbd5e1' }}>
            {speed.toFixed(1)}x
          </span>
          <button
            className={styles.controlButton}
            onClick={() => changeSpeed(0.1)}
            title="Жылдамдату"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            className={styles.controlButton}
            onClick={resetTeleprompter}
            title="Басына қайтару"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Center: HERO REAL RECORD BUTTON */}
        <button
          type="button"
          onClick={handleToggleRecord}
          style={{
            padding: '10px 22px',
            borderRadius: '30px',
            backgroundColor: isRecording ? '#dc2626' : '#ef4444',
            color: '#ffffff',
            border: isRecording ? '2px solid #ffffff' : 'none',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: isRecording ? '0 0 20px rgba(239, 68, 68, 0.7)' : '0 4px 14px rgba(239, 68, 68, 0.5)',
            transition: 'all 0.2s ease',
          }}
        >
          {isRecording ? (
            <>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#ffffff', borderRadius: '2px' }} />
              <span>⏹️ ТОҚТАТУ ({Math.floor(recordSeconds / 60).toString().padStart(2, '0')}:{(recordSeconds % 60).toString().padStart(2, '0')})</span>
            </>
          ) : (
            <>
              <span style={{ width: '10px', height: '10px', backgroundColor: '#ffffff', borderRadius: '50%' }} />
              <span>🔴 ТҮСІРУДІ БАСТАУ (Record)</span>
            </>
          )}
        </button>

        {/* Right: Prompter Scroll Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className={styles.controlButton}
            onClick={() => seek('backward')}
            title="Артқа шегіну"
          >
            <Rewind className="h-4 w-4" />
          </button>
          <button
            className={styles.controlButton}
            onClick={togglePlay}
            title={isPlaying ? 'Кідірту (Space)' : 'Жүргізу (Space)'}
            style={{ backgroundColor: isPlaying ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.1)' }}
          >
            {isPlaying ? <Pause className="h-4 w-4 text-blue-400" /> : <Play className="h-4 w-4 text-green-400" />}
          </button>
          <button
            className={styles.controlButton}
            onClick={() => seek('forward')}
            title="Алға жылжыту"
          >
            <FastForward className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {pipWindow ? (
        <>
          {createPortal(renderContent(true), pipWindow.document.body)}
          <motion.div
            drag
            dragMomentum={false}
            className={styles.container}
            style={{
              position: 'fixed',
              top: '50px',
              left: 'calc(50% - 320px)',
              zIndex: 1000,
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                padding: '24px',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <p style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>
                🪟 Суфлер бөлек терезеде ашық тұр
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                Ол экранның үстінде (Always on top) тұрады.
              </p>
              <button
                type="button"
                onClick={togglePip}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Браузерге қайтару
              </button>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          drag
          dragMomentum={false}
          className={styles.container}
          style={{
            position: 'fixed',
            top: '50px',
            left: 'calc(50% - 320px)',
            zIndex: 1000,
            touchAction: 'none',
            userSelect: 'none',
          }}
        >
          {renderContent(false)}
        </motion.div>
      )}
    </>
  );
}

export default Teleprompter;
