import React from "react";
import {
  AbsoluteFill,
  Composition,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const PolyglotComposition = () => {
  return (
    <Composition
      id="ReelPolyglotPDF"
      component={PolyglotReelComponent}
      durationInFrames={900} // 30 seconds at 30 fps
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export const PolyglotReelComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Progress Bar (0% to 100%)
  const progress = (frame / durationInFrames) * 100;

  // SCENE 1: HOOK (0 - 6s / 0 - 180 frames)
  const hookSpring = spring({ frame, fps, config: { damping: 12 } });
  const hookOpacity = interpolate(frame, [0, 15, 165, 180], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // SCENE 2: ANTIGRAVITY SETUP (6s - 15s / 180 - 450 frames)
  const scene2Frame = frame - 180;
  const scene2Spring = spring({ frame: scene2Frame, fps, config: { damping: 14 } });
  const scene2Opacity = interpolate(frame, [180, 195, 435, 450], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // SCENE 3: RESULT 71 PAGES (15s - 23s / 450 - 690 frames)
  const scene3Frame = frame - 450;
  const scene3Spring = spring({ frame: scene3Frame, fps, config: { damping: 13 } });
  const scene3Opacity = interpolate(frame, [450, 465, 675, 690], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // SCENE 4: CTA (23s - 30s / 690 - 900 frames)
  const scene4Frame = frame - 690;
  const scene4Spring = spring({ frame: scene4Frame, fps, config: { damping: 12 } });
  const scene4Opacity = interpolate(frame, [690, 705], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#080a10",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Dynamic Background Glows */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          right: "-80px",
          width: "700px",
          height: "700px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* Top Progress Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "12px",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #10b981, #06b6d4, #3b82f6)",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.9)",
          zIndex: 80,
        }}
      />

      {/* Header Tag */}
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
          zIndex: 70,
        }}
      >
        <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#10b981" }} />
        <span style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "1.5px", color: "#f1f5f9" }}>
          A.PERDEEV • AI & IT
        </span>
      </div>

      {/* ========================================================= */}
      {/* SCENE 1: HOOK (0s - 6s)                                   */}
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
                borderRadius: "18px",
                color: "#f87171",
                fontSize: "28px",
                fontWeight: "800",
              }}
            >
              Google Translate: Бұзылады ❌
            </div>
            <div
              style={{
                padding: "14px 28px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "2px solid rgba(16, 185, 129, 0.4)",
                borderRadius: "18px",
                color: "#34d399",
                fontSize: "28px",
                fontWeight: "800",
              }}
            >
              AI: 100% Сақталады ✅
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
            Ағылшынша кітаптарды <br />
            <span style={{ color: "#34d399" }}>қазақша</span> оқығыңыз келе ме? 📖
          </h1>

          <div
            style={{
              fontSize: "40px",
              fontWeight: "700",
              color: "#94a3b8",
              textAlign: "center",
              lineHeight: 1.35,
              background: "rgba(255, 255, 255, 0.05)",
              padding: "26px 40px",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            Бірақ әлі күнге дейін қазақша нұсқасын таппай жүрсіз бе? <br />
            <span style={{ color: "#60a5fa" }}>Шешімі мінекей 👇</span>
          </div>
        </AbsoluteFill>
      )}

      {/* ========================================================= */}
      {/* SCENE 2: ANTIGRAVITY & DEEPSEEK SETUP (6s - 15s)          */}
      {/* ========================================================= */}
      {frame >= 175 && frame < 460 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 45px",
            opacity: scene2Opacity,
            transform: `translateY(${interpolate(scene2Spring, [0, 1], [60, 0])}px)`,
          }}
        >
          {/* Top Label */}
          <div
            style={{
              padding: "10px 24px",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10b981",
              borderRadius: "9999px",
              color: "#34d399",
              fontSize: "22px",
              fontWeight: "800",
              marginBottom: "24px",
            }}
          >
            ⚡ ANTIGRAVITY IDE + GITHUB OPEN SOURCE
          </div>

          <h2
            style={{
              fontSize: "50px",
              fontWeight: "900",
              textAlign: "center",
              lineHeight: 1.25,
              marginBottom: "30px",
            }}
          >
            Antigravity-ге бір ғана <br />
            пәрмен бердім:
          </h2>

          {/* Prompt Mockup Card */}
          <div
            style={{
              width: "100%",
              backgroundColor: "#111827",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "28px",
              marginBottom: "30px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            }}
          >
            <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#eab308" }} />
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
              <span style={{ fontSize: "16px", color: "#64748b", marginLeft: "10px", fontWeight: "600" }}>Antigravity Agent</span>
            </div>

            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                padding: "20px",
                borderRadius: "16px",
                borderLeft: "4px solid #34d399",
                fontSize: "24px",
                lineHeight: "1.5",
                color: "#f8fafc",
                fontFamily: "monospace",
              }}
            >
              💬 "orwellanimalfarm.pdf осы кітапты қазақшаға аударып бер, deepseek api қолдан"
            </div>

            {/* Steps auto completed */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#4ade80", fontSize: "20px", fontWeight: "700" }}>
                <span>✓</span> <span>Python 3.12 виртуалды ортасы бапталды</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#4ade80", fontSize: "20px", fontWeight: "700" }}>
                <span>✓</span> <span>DeepSeek API кілті қосылды</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#60a5fa", fontSize: "20px", fontWeight: "700" }}>
                <span>⚙️</span> <span>Барлық 71 бет фондық режимде аударылуда...</span>
              </div>
            </div>
          </div>

          {/* IDE Window Preview with Zoom Effect */}
          <div
            style={{
              width: "100%",
              height: "480px",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              position: "relative",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
            }}
          >
            <Img
              src={staticFile("screenshot_antigravity.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "right top", // focuses on the Antigravity agent & chat
                transform: `scale(${interpolate(scene2Frame, [0, 270], [1, 1.15], { extrapolateRight: "clamp" })})`,
              }}
            />
            {/* Gradient Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "100px",
                background: "linear-gradient(to top, #080a10 0%, transparent 100%)",
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* ========================================================= */}
      {/* SCENE 3: RESULT SHOWCASE - 71 PAGES (15s - 23s)           */}
      {/* ========================================================= */}
      {frame >= 445 && frame < 700 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 45px",
            opacity: scene3Opacity,
            transform: `scale(${interpolate(scene3Spring, [0, 1], [0.9, 1])})`,
          }}
        >
          {/* Badge */}
          <div
            style={{
              padding: "12px 28px",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              border: "2px solid #3b82f6",
              borderRadius: "9999px",
              color: "#60a5fa",
              fontSize: "26px",
              fontWeight: "900",
              marginBottom: "20px",
            }}
          >
            ✨ ДАЙЫН БОЛҒАН НӘТИЖЕ
          </div>

          <h2
            style={{
              fontSize: "52px",
              fontWeight: "900",
              textAlign: "center",
              lineHeight: 1.25,
              marginBottom: "28px",
            }}
          >
            «Хайуандар фермасы» <br />
            <span style={{ color: "#34d399" }}>71 бет толық аударылды!</span>
          </h2>

          {/* Zoomed PDF Preview Frame */}
          <div
            style={{
              width: "100%",
              height: "640px",
              borderRadius: "28px",
              overflow: "hidden",
              border: "2px solid rgba(52, 211, 153, 0.4)",
              position: "relative",
              boxShadow: "0 30px 60px rgba(0, 0, 0, 0.9)",
              marginBottom: "30px",
            }}
          >
            <Img
              src={staticFile("screenshot_antigravity.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "38% 32%", // Zoom right onto the translated Kazakh text and PDF viewer!
                transform: `scale(${interpolate(scene3Frame, [0, 240], [1.8, 2.1], { extrapolateRight: "clamp" })})`,
              }}
            />
            {/* Tag over preview */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: "8px 18px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                fontSize: "18px",
                fontWeight: "700",
                color: "#e2e8f0",
              }}
            >
              📄 orwellanimalfarm_kk.pdf (2 / 71 бет)
            </div>
          </div>

          {/* Feature Badges Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", width: "100%" }}>
            <div
              style={{
                padding: "18px 22px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "18px",
                fontSize: "22px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span>⚡</span> <span>1 бет = 1 секунд</span>
            </div>
            <div
              style={{
                padding: "18px 22px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "18px",
                fontSize: "22px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span>📐</span> <span>Дизайн бұзылмаған</span>
            </div>
            <div
              style={{
                padding: "18px 22px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "18px",
                fontSize: "22px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span>🇰🇿</span> <span>Таза көркем қазақша</span>
            </div>
            <div
              style={{
                padding: "18px 22px",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "18px",
                fontSize: "22px",
                fontWeight: "700",
                color: "#60a5fa",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span>📖</span> <span>Қос тілді (Bilingual)</span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ========================================================= */}
      {/* SCENE 4: CTA / ACTION (23s - 30s)                         */}
      {/* ========================================================= */}
      {frame >= 685 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 60px",
            opacity: scene4Opacity,
            transform: `scale(${interpolate(scene4Spring, [0, 1], [0.88, 1])})`,
          }}
        >
          <div
            style={{
              padding: "14px 32px",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              border: "2px solid #10b981",
              borderRadius: "9999px",
              color: "#34d399",
              fontSize: "26px",
              fontWeight: "900",
              marginBottom: "30px",
            }}
          >
            🔥 СІЛТЕМЕСІ ЖӘНЕ НҰСҚАУЛЫҚ:
          </div>

          <h2
            style={{
              fontSize: "64px",
              fontWeight: "900",
              textAlign: "center",
              lineHeight: 1.25,
              marginBottom: "40px",
            }}
          >
            Комментарийге <br />
            <span
              style={{
                color: "#34d399",
                background: "rgba(16, 185, 129, 0.15)",
                padding: "4px 24px",
                borderRadius: "16px",
                border: "2px dashed #10b981",
              }}
            >
              «КІТАП»
            </span> <br />
            деп жазыңыз! 💬
          </h2>

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginBottom: "45px",
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
                fontSize: "28px",
                fontWeight: "700",
              }}
            >
              <span>📩</span>
              <span>Толық нұсқаулық пен репо Direct-ке барады</span>
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
                fontSize: "28px",
                fontWeight: "700",
                color: "#60a5fa",
              }}
            >
              <span>📌</span>
              <span>Жоғалтып алмас үшін сақтап қойыңыз</span>
            </div>
          </div>

          <div
            style={{
              padding: "24px 50px",
              backgroundColor: "#10b981",
              borderRadius: "9999px",
              fontSize: "34px",
              fontWeight: "900",
              color: "#ffffff",
              boxShadow: "0 15px 35px rgba(16, 185, 129, 0.5)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span>@a.perdeev парақшасына жазылыңыз</span>
            <span>🚀</span>
          </div>
        </AbsoluteFill>
      )}

      {/* Persistent Bottom Handle */}
      <div
        style={{
          position: "absolute",
          bottom: "70px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "26px",
          fontWeight: "700",
          color: "rgba(255, 255, 255, 0.45)",
          letterSpacing: "1.5px",
        }}
      >
        @a.perdeev
      </div>
    </AbsoluteFill>
  );
};
