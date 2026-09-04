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
import useVideoSource from 'hooks/useVideoSource';
import styles from './Teleprompter.module.css';

const DEFAULT_SPEED = 0.35;

const PRESET_GPT6 = `Жаңа ғана бүкіл әлемді шулатқан үлкен жаңалық шықты!

Жасанды интеллект әлемінде тағы бір революция басталды.

Әзірлеушілер GPT-6 Astra атты жаңа буын моделін ресми түрде жарыққа шығарды!

Бұл жай ғана чат-бот емес. Енді AI камера арқылы нақты уақытта айналаны көріп, кідіріссіз адам сияқты лезде жауап береді.

Оның ең мықты тұсы — енді мәтін жазып күтудің қажеті жоқ. Кез келген құжатты, кодтағы қатені немесе телефонның экранын көрсетсеңіз — 1 секундта көріп, түсіндіріп береді!

Технология әлеміндегі ең маңызды жаңалықтарды бірінші болып білгіңіз келсе — @a.perdeev парақшасына жазылып қойыңыз!`;

const PRESET_GAMMA = `Слайд жасау үшін әлі күнге дейін түнде 3 сағат отырсыз ба? Қойсаңызшы... Мына сайтты әлі білмейсіз бе?

Ешқандай PowerPoint-тың керегі жоқ. Браузерден Gamma App сайтына кіресіз де, тақырыпты қазақша жазасыз.

Мысалы: «Қазақстандағы IT және AI трендтері». Бар болғаны 1 батырманы басасыз...

Қараңыз: небәрі 30 секундта дайын дизайн, әдемі суреттер, сауатты қазақша мәтіні бар толық 10 беттік слайд дайын болды!

Сайттың аты — Gamma App. Жоғалтып алмас үшін видеоны сақтап қойыңыз және слайд жасап шаршаған досыңызға жіберіңіз!`;

interface TeleprompterProps {
  onClose: () => void;
}

export function Teleprompter({ onClose }: TeleprompterProps) {
  const [text, setText] = useState(PRESET_GPT6);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [showInput, setShowInput] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

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

  // Open Document Picture-in-Picture (Always on top across the whole Mac)
  const togglePip = async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    if ('documentPictureInPicture' in window) {
      try {
        const pip = await (window as any).documentPictureInPicture.requestWindow({
          width: 580,
          height: 480,
        });

        // Copy styles
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((r) => r.cssText).join('');
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
    <div className={styles.content} style={isFloating ? { height: '100vh', display: 'flex', flexDirection: 'column' } : {}}>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => { setText(PRESET_GPT6); resetTeleprompter(); }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              background: 'rgba(147, 51, 234, 0.4)',
              border: '1px solid rgba(147, 51, 234, 0.7)',
              color: '#e9d5ff',
              cursor: 'pointer',
            }}
          >
            🤖 GPT-6 Astra
          </button>
          <button
            type="button"
            onClick={() => { setText(PRESET_GAMMA); resetTeleprompter(); }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              background: 'rgba(59, 130, 246, 0.4)',
              border: '1px solid rgba(59, 130, 246, 0.7)',
              color: '#bfdbfe',
              cursor: 'pointer',
            }}
          >
            📊 Gamma Слайд
          </button>
          <button
            type="button"
            onClick={() => setShowCamera(!showCamera)}
            style={{
              padding: '4px 10px',
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
            title="Камераны қосу / жасыру"
          >
            {showCamera ? <Camera className="h-3.5 w-3.5" /> : <CameraOff className="h-3.5 w-3.5" />}
            <span>{showCamera ? 'Камера қосулы' : 'Камерасыз'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInput(!showInput)}
            style={{
              padding: '4px 10px',
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#38bdf8', padding: '4px 10px' }}
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

      {/* Integrated Live Camera Preview inside Teleprompter */}
      {showCamera && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: isFloating ? '220px' : '260px',
            backgroundColor: '#0a0a0c',
            overflow: 'hidden',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cameraStream ? (
            <>
              <video
                ref={videoSourceRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirrored selfie
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '12px',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#4ade80',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                <span>MacBook FaceTime HD (Тікелей эфир)</span>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>
                Камераға рұқсат берілмеді немесе қосылмады
              </p>
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
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                }}
              >
                📷 Камераны қосу (Рұқсат беру)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Script Scrolling or Input Area */}
      {showInput ? (
        <div className={styles.inputContainer} style={{ flex: 1 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Мәтінді осында жазыңыз немесе қойыңыз..."
            className={styles.textarea}
            style={{ height: '140px' }}
            spellCheck="false"
          />
        </div>
      ) : (
        <div ref={scrollContainerRef} className={styles.scrollContainer} style={isFloating ? { flex: 1, height: 'auto', minHeight: '160px' } : { height: '180px' }}>
          <motion.div
            ref={contentRef}
            animate={scrollControls}
            className={styles.textContent}
            style={{ fontSize: '1.4rem', fontWeight: '600', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.9)', padding: '2rem 1.5rem' }}
          >
            {text}
          </motion.div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className={styles.controls} style={{ padding: '8px 14px' }}>
        <div className={styles.speedControls}>
          <button
            className={styles.controlButton}
            onClick={() => changeSpeed(-0.1)}
            title="Жайлату"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '35px', textAlign: 'center' }}>
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

        <div className={styles.playbackControls}>
          <button
            className={styles.controlButton}
            onClick={() => seek('backward')}
            title="Артқа шегіну"
          >
            <Rewind className="h-5 w-5" />
          </button>
          <button
            className={styles.controlButton}
            onClick={togglePlay}
            style={{ backgroundColor: isPlaying ? '#ef4444' : '#22c55e', color: '#ffffff', padding: '8px 20px', borderRadius: '8px' }}
            title="Пробел (Space) арқылы тоқтату/қосу"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            className={styles.controlButton}
            onClick={() => seek('forward')}
            title="Алға өткізу"
          >
            <FastForward className="h-5 w-5" />
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
            style={{ touchAction: 'none', userSelect: 'none' }}
          >
            <div className={styles.content} style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', color: '#38bdf8', fontWeight: '700', marginBottom: '12px' }}>
                🪟 Камера мен телесуфлер қазір Mac экраныңыздың үстінде қалқып тұр!
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                Терезені Макбук челкасының/камерасының дәл астына қойып, жатқа сөйлеп оқыңыз.
              </p>
              <button
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
          style={{ touchAction: 'none', userSelect: 'none' }}
        >
          {renderContent(false)}
        </motion.div>
      )}
    </>
  );
}
