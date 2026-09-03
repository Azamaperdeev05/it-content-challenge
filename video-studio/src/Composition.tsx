import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
} from "remotion";

export const MyComposition = () => {
  return (
    <Composition
      id="Reel01GammaSlides"
      component={Reel01GammaComponent}
      durationInFrames={990} // 33 seconds at 30 fps
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export const Reel01GammaComponent: React.FC<{ hasAudio?: boolean }> = ({ hasAudio = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Progress Bar
  const progress = (frame / durationInFrames) * 100;

  // SCENE 1: HOOK (0 - 6s = 0 - 180 frames)
  const hookSpring = spring({ frame, fps, config: { damping: 12 } });
  const hookOpacity = interpolate(frame, [0, 15, 165, 180], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // SCENE 2: BROWSER & PROMPT INPUT (6s - 18s = 180 - 540 frames)
  const promptFrame = frame - 180;
  const promptSpring = spring({ frame: promptFrame, fps, config: { damping: 14 } });
  const promptOpacity = interpolate(frame, [180, 195, 525, 540], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // SCENE 3: SLIDES RESULT SHOWCASE (18s - 26s = 540 - 780 frames)
  const resultFrame = frame - 540;
  const resultSpring = spring({ frame: resultFrame, fps, config: { damping: 13 } });
  const resultOpacity = interpolate(frame, [540, 555, 765, 780], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // SCENE 4: CTA & TOOL NAME (26s - 33s = 780 - 990 frames)
  const ctaFrame = frame - 780;
  const ctaSpring = spring({ frame: ctaFrame, fps, config: { damping: 12 } });
  const ctaOpacity = interpolate(frame, [780, 795], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07080d",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Optional Audio if provided */}
      {hasAudio && <Audio src={staticFile("voice.mp3")} />}

      {/* Dynamic Background Glows */}
      <div
        style={{
          position: "absolute",
          top: "-150px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          right: "-100px",
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* Top Gradient Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "12px",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #a855f7, #3b82f6, #06b6d4)",
          boxShadow: "0 0 20px rgba(168, 85, 247, 0.9)",
          zIndex: 60,
        }}
      />

      {/* Floating Category Badge */}
      <div
        style={{
          position: "absolute",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 32px",
          borderRadius: "9999px",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(16px)",
          zIndex: 50,
        }}
      >
        <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#a855f7" }} />
        <span style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "1.5px", color: "#f1f5f9" }}>
          AI ЛАЙФХАКТАР • СЛАЙД
        </span>
      </div>

      {/* ========================================================= */}
      {/* SCENE 1: THE HOOK (0 - 6s)                                */}
      {/* ========================================================= */}
      {frame < 190 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 60px",
            opacity: hookOpacity,
            transform: `scale(${interpolate(hookSpring, [0, 1], [0.85, 1])})`,
          }}
        >
          {/* Comparison Pills */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
            <div
              style={{
                padding: "14px 28px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "2px solid rgba(239, 68, 68, 0.4)",
                borderRadius: "16px",
                color: "#f87171",
                fontSize: "30px",
                fontWeight: "800",
              }}
            >
              PowerPoint: 3 сағат ❌
            </div>
            <div
              style={{
                padding: "14px 28px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "2px solid rgba(16, 185, 129, 0.4)",
                borderRadius: "16px",
                color: "#34d399",
                fontSize: "30px",
                fontWeight: "800",
              }}
            >
              AI: 1 минут ✅
            </div>
          </div>

          <h1
            style={{
              fontSize: "66px",
              fontWeight: "900",
              textAlign: "center",
              lineHeight: 1.25,
              marginBottom: "36px",
            }}
          >
            Слайд жасау үшін әлі де түнде <span style={{ color: "#ef4444" }}>3 сағат</span> отырсыз ба? 🤦‍♂️
          </h1>

          <div
            style={{
              fontSize: "44px",
              fontWeight: "700",
              color: "#c084fc",
              textAlign: "center",
              lineHeight: 1.35,
              background: "rgba(192, 132, 252, 0.12)",
              padding: "26px 40px",
              borderRadius: "24px",
              border: "1px solid rgba(192, 132, 252, 0.3)",
            }}
          >
            Қойсаңызшы... <br />
            Мына сайтты әлі білмейсіз бе? 👇
          </div>
        </AbsoluteFill>
      )}

      {/* ========================================================= */}
      {/* SCENE 2: BROWSER & PROMPT INPUT (6 - 18s)                 */}
      {/* ========================================================= */}
      {frame >= 175 && frame < 550 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 50px",
            opacity: promptOpacity,
            transform: `translateY(${interpolate(promptSpring, [0, 1], [60, 0])}px)`,
          }}
        >
          {/* Browser Window Mockup */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#131620",
              borderRadius: "32px",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              overflow: "hidden",
              boxShadow: "0 30px 70px -15px rgba(0, 0, 0, 0.9)",
            }}
          >
            {/* Browser Top Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "22px 28px",
                backgroundColor: "#0d1017",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                gap: "18px",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#ff5f56" }} />
                <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
                <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#27c93f" }} />
              </div>

              {/* URL Address Pill */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.07)",
                  borderRadius: "12px",
                  padding: "10px 20px",
                  fontSize: "24px",
                  color: "#94a3b8",
                  fontFamily: "monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>🔒</span>
                <span style={{ color: "#ffffff", fontWeight: "700" }}>gamma.app</span>
              </div>
            </div>

            {/* Prompt Generator Box */}
            <div style={{ padding: "44px" }}>
              <p style={{ fontSize: "28px", color: "#94a3b8", marginBottom: "16px", fontWeight: "600" }}>
                1-Қадам: Тақырыпты қазақша жазасыз ✍️
              </p>

              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid #8b5cf6",
                  borderRadius: "20px",
                  padding: "24px 30px",
                  fontSize: "32px",
                  color: "#ffffff",
                  fontWeight: "700",
                  marginBottom: "36px",
                  boxShadow: "0 0 25px rgba(139, 92, 246, 0.3)",
                }}
              >
                «Қазақстандағы IT және AI трендтері»
              </div>

              {/* Generate Button Animation */}
              <div
                style={{
                  width: "100%",
                  padding: "24px",
                  background: "linear-gradient(90deg, #9333ea, #3b82f6)",
                  borderRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  fontSize: "32px",
                  fontWeight: "900",
                  color: "#ffffff",
                  boxShadow: "0 10px 30px rgba(147, 51, 234, 0.5)",
                }}
              >
                <span>✨ 1 батырманы басасыз...</span>
              </div>

              <div
                style={{
                  marginTop: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px",
                  color: "#38bdf8",
                  fontSize: "26px",
                  fontWeight: "700",
                }}
              >
                <span>⚡ AI слайд құрылымын автоматты жасайды</span>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ========================================================= */}
      {/* SCENE 3: SLIDES RESULT SHOWCASE (18 - 26s)               */}
      {/* ========================================================= */}
      {frame >= 535 && frame < 790 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 50px",
            opacity: resultOpacity,
            transform: `scale(${interpolate(resultSpring, [0, 1], [0.88, 1])})`,
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "12px 28px",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              border: "2px solid #10b981",
              borderRadius: "16px",
              color: "#34d399",
              fontSize: "30px",
              fontWeight: "900",
              marginBottom: "36px",
            }}
          >
            НӘТИЖЕСІ: 30 СЕКУНДТА ДАЙЫН! 🎉
          </div>

          {/* Slide Deck Card Stack */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#181e2b",
              borderRadius: "32px",
              padding: "40px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <span style={{ fontSize: "24px", color: "#a855f7", fontWeight: "800" }}>СЛАЙД №1 / 10 БЕТ</span>
              <span
                style={{
                  fontSize: "20px",
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(56, 189, 248, 0.2)",
                  color: "#38bdf8",
                  fontWeight: "800",
                }}
              >
                100% ҚАЗАҚША 🇰🇿
              </span>
            </div>

            <h2 style={{ fontSize: "44px", fontWeight: "900", lineHeight: 1.25, marginBottom: "24px" }}>
              Қазақстандағы IT және AI дамуы
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "30px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "26px", color: "#cbd5e1" }}>
                <span>✅</span> <span>Дайын заманауи дизайн және қалыптар</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "26px", color: "#cbd5e1" }}>
                <span>✅</span> <span>Сауатты қазақ тіліндегі пункттер мен сандар</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "26px", color: "#cbd5e1" }}>
                <span>✅</span> <span>PowerPoint немесе PDF түрінде жүктеп алу</span>
              </div>
            </div>

            {/* Thumbnail Mockup */}
            <div
              style={{
                height: "160px",
                width: "100%",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3))",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "700",
                color: "#93c5fd",
              }}
            >
              📊 Толық 10 слайд генерацияланды
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ========================================================= */}
      {/* SCENE 4: CTA & TOOL NAME (26 - 33s)                       */}
      {/* ========================================================= */}
      {frame >= 775 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 60px",
            opacity: ctaOpacity,
            transform: `scale(${interpolate(ctaSpring, [0, 1], [0.85, 1])})`,
          }}
        >
          <div
            style={{
              padding: "16px 36px",
              backgroundColor: "rgba(168, 85, 247, 0.15)",
              border: "2px solid #a855f7",
              borderRadius: "24px",
              color: "#c084fc",
              fontSize: "30px",
              fontWeight: "900",
              marginBottom: "28px",
            }}
          >
            САЙТТЫҢ АТЫ:
          </div>

          <h2
            style={{
              fontSize: "76px",
              fontWeight: "900",
              textAlign: "center",
              marginBottom: "40px",
              background: "linear-gradient(135deg, #ffffff 30%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 25px rgba(168, 85, 247, 0.5))",
            }}
          >
            GAMMA.APP
          </h2>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                padding: "24px 32px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                fontSize: "30px",
                fontWeight: "700",
              }}
            >
              <span>📌</span>
              <span>Жоғалтып алмас үшін сақтап ал</span>
            </div>

            <div
              style={{
                padding: "24px 32px",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.35)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                fontSize: "30px",
                fontWeight: "700",
                color: "#60a5fa",
              }}
            >
              <span>✈️</span>
              <span>Слайд жасап шаршаған досыңа жібер</span>
            </div>
          </div>

          <div
            style={{
              padding: "24px 44px",
              backgroundColor: "#7c3aed",
              borderRadius: "9999px",
              fontSize: "32px",
              fontWeight: "900",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(124, 58, 237, 0.6)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span>Пайдалы AI лайфхактар үшін жазыл</span>
            <span>👉</span>
          </div>
        </AbsoluteFill>
      )}

      {/* Persistent Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "26px",
          fontWeight: "700",
          color: "rgba(255, 255, 255, 0.4)",
          letterSpacing: "1.5px",
        }}
      >
        @AI_QAZAQSHA
      </div>
    </AbsoluteFill>
  );
};
