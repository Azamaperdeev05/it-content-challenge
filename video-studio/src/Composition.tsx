import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyComposition = () => {
  return (
    <Composition
      id="Reel01Math"
      component={Reel01MathComponent}
      durationInFrames={600} // 20 seconds at 30 fps
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export const Reel01MathComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Progress Bar (0% to 100%)
  const progress = (frame / durationInFrames) * 100;

  // Scene timing
  // Scene 1: Hook (0 - 150 frames = 0s - 5s)
  // Scene 2: The Truth / Code Editor (150 - 360 frames = 5s - 12s)
  // Scene 3: Mindset (360 - 480 frames = 12s - 16s)
  // Scene 4: CTA (480 - 600 frames = 16s - 20s)

  // Animations
  const hookSpring = spring({ frame, fps, config: { damping: 12 } });
  const hookOpacity = interpolate(frame, [0, 20, 130, 150], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const codeSpring = spring({ frame: frame - 150, fps, config: { damping: 14 } });
  const codeOpacity = interpolate(frame, [150, 170, 340, 360], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const comparisonSpring = spring({ frame: frame - 360, fps, config: { damping: 14 } });
  const comparisonOpacity = interpolate(frame, [360, 380, 460, 480], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaSpring = spring({ frame: frame - 480, fps, config: { damping: 12 } });
  const ctaOpacity = interpolate(frame, [480, 500], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Code typing simulation
  const codeLines = [
    "// Шын мәнінде бағдарламалауға не керек?",
    "const mathNeeded = '5-сынып арифметикасы (+, -, *, /)';",
    "const realPower  = 'Логикалық ойлау және алгоритм';",
    "",
    "function becomeProgrammer() {",
    "  if (hasCuriosity && takesAction) {",
    "    return 'Сенен мықты маман шығады! 🚀';",
    "  }",
    "}",
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0c10",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background Ambient Glows */}
      <div
        style={{
          position: "absolute",
          top: "-150px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          right: "-100px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Top Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "10px",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #3b82f6, #10b981)",
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.8)",
          zIndex: 50,
        }}
      />

      {/* Header Badge */}
      <div
        style={{
          position: "absolute",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 28px",
          borderRadius: "9999px",
          backgroundColor: "rgba(255, 255, 255, 0.07)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(12px)",
          zIndex: 40,
        }}
      >
        <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#10b981" }} />
        <span style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "1px", color: "#e2e8f0" }}>
          IT ҚАЗАҚША • REELS #1
        </span>
      </div>

      {/* SCENE 1: HOOK (0 - 5s) */}
      {frame < 160 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 60px",
            opacity: hookOpacity,
            transform: `scale(${interpolate(hookSpring, [0, 1], [0.85, 1])})`,
          }}
        >
          <div
            style={{
              padding: "16px 36px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "2px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "16px",
              color: "#f87171",
              fontSize: "36px",
              fontWeight: "800",
              marginBottom: "36px",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Үлкен миф ❌
          </div>

          <h1
            style={{
              fontSize: "64px",
              fontWeight: "900",
              textAlign: "center",
              lineHeight: 1.25,
              marginBottom: "30px",
            }}
          >
            Мектепте математикадан <span style={{ color: "#ef4444" }}>«3»</span> алдыңыз ба?
          </h1>

          <div
            style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#38bdf8",
              textAlign: "center",
              lineHeight: 1.3,
              background: "rgba(56, 189, 248, 0.1)",
              padding: "24px 36px",
              borderRadius: "24px",
              border: "1px solid rgba(56, 189, 248, 0.25)",
            }}
          >
            Құттықтаймын! 🎉 <br />
            Сізден мықты бағдарламашы шығуы әбден мүмкін!
          </div>
        </AbsoluteFill>
      )}

      {/* SCENE 2: CODE EDITOR (5s - 12s) */}
      {frame >= 140 && frame < 370 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 50px",
            opacity: codeOpacity,
            transform: `translateY(${interpolate(codeSpring, [0, 1], [50, 0])}px)`,
          }}
        >
          <div
            style={{
              width: "100%",
              backgroundColor: "#161b22",
              borderRadius: "28px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              overflow: "hidden",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Editor Window Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 28px",
                backgroundColor: "#0d1117",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#ff5f56" }} />
                <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
                <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#27c93f" }} />
              </div>
              <span style={{ fontSize: "22px", color: "#8b949e", fontFamily: "monospace" }}>truth.js</span>
              <span style={{ width: "40px" }} />
            </div>

            {/* Code Body */}
            <div style={{ padding: "36px", fontFamily: "monospace", fontSize: "25px", lineHeight: 1.6 }}>
              {codeLines.map((line, idx) => {
                const lineDelay = 160 + idx * 15;
                const isVisible = frame >= lineDelay;
                if (!isVisible) return null;

                const isComment = line.startsWith("//");
                const isKeyword = line.includes("const") || line.includes("function") || line.includes("return");

                return (
                  <div key={idx} style={{ color: isComment ? "#6b7280" : isKeyword ? "#ec4899" : "#38bdf8" }}>
                    <span style={{ color: "#4b5563", marginRight: "20px", userSelect: "none" }}>{idx + 1}</span>
                    <span style={{ color: isComment ? "#9ca3af" : "#f1f5f9" }}>{line}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p
            style={{
              marginTop: "40px",
              fontSize: "34px",
              color: "#94a3b8",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            Бағдарламашылардың 90%-ы күрделі формуланы емес, қарапайым логиканы қолданады 💡
          </p>
        </AbsoluteFill>
      )}

      {/* SCENE 3: COMPARISON (12s - 16s) */}
      {frame >= 350 && frame < 490 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 60px",
            opacity: comparisonOpacity,
            transform: `scale(${interpolate(comparisonSpring, [0, 1], [0.9, 1])})`,
          }}
        >
          <h2 style={{ fontSize: "56px", fontWeight: "900", marginBottom: "50px", textAlign: "center" }}>
            Шындық пен Ереже:
          </h2>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            <div
              style={{
                padding: "32px",
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                border: "2px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <span style={{ fontSize: "48px" }}>❌</span>
              <div>
                <h3 style={{ fontSize: "36px", fontWeight: "800", color: "#f87171" }}>Күрделі математика</h3>
                <p style={{ fontSize: "26px", color: "#cbd5e1" }}>Интеграл мен синус жаттау шарт емес</p>
              </div>
            </div>

            <div
              style={{
                padding: "32px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "2px solid rgba(16, 185, 129, 0.4)",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <span style={{ fontSize: "48px" }}>✅</span>
              <div>
                <h3 style={{ fontSize: "36px", fontWeight: "800", color: "#34d399" }}>Логика мен Тәртіп</h3>
                <p style={{ fontSize: "26px", color: "#cbd5e1" }}>Алгоритм құру және жүйелі түрде код жазу</p>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* SCENE 4: CTA (16s - 20s) */}
      {frame >= 470 && (
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
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "58px",
              marginBottom: "36px",
              boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)",
            }}
          >
            🚀
          </div>

          <h2
            style={{
              fontSize: "58px",
              fontWeight: "900",
              textAlign: "center",
              lineHeight: 1.25,
              marginBottom: "24px",
            }}
          >
            IT-ді қарапайым қазақ тілінде меңгер
          </h2>

          <p
            style={{
              fontSize: "32px",
              color: "#94a3b8",
              textAlign: "center",
              lineHeight: 1.4,
              marginBottom: "48px",
            }}
          >
            Бізбен бірге нөлден бастап алғашқы жобаларыңды жасап көр!
          </p>

          <div
            style={{
              padding: "24px 50px",
              backgroundColor: "#2563eb",
              borderRadius: "9999px",
              fontSize: "36px",
              fontWeight: "800",
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(37, 99, 235, 0.6)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span>Парақшаға жазыл</span>
            <span>👉</span>
          </div>
        </AbsoluteFill>
      )}

      {/* Bottom Footer Handle */}
      <div
        style={{
          position: "absolute",
          bottom: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "26px",
          fontWeight: "600",
          color: "rgba(255, 255, 255, 0.5)",
          letterSpacing: "1px",
        }}
      >
        @IT_QAZAQSHA
      </div>
    </AbsoluteFill>
  );
};
