import { useState, useEffect } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        // Animation phases
        const timers = [
            setTimeout(() => setPhase(1), 100),
            setTimeout(() => setPhase(2), 600),
            setTimeout(() => setPhase(3), 1200),
            setTimeout(() => onComplete(), 2000),
        ];

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className={`splash-screen phase-${phase}`}>
            <div className="splash-content">
                <div className="splash-logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="45" stroke="url(#gradient)" strokeWidth="6" />
                            <path
                                d="M30 55 L45 70 L70 35"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="check-path"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#9b87f5" />
                                    <stop offset="100%" stopColor="#7c6ef6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 className="logo-text">
                        <span className="gradient-text">Up</span>Solve
                    </h1>
                </div>

                <p className="splash-tagline">Eleve seu nível em competições</p>

                <div className="splash-loader">
                    <div className="loader-bar" />
                </div>
            </div>

            <style>{`
        .splash-screen {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          opacity: 1;
          transition: opacity 0.5s ease;
        }

        .splash-screen.phase-3 {
          opacity: 0;
          pointer-events: none;
        }

        .splash-content {
          text-align: center;
        }

        .splash-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .logo-icon {
          width: 100px;
          height: 100px;
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .phase-1 .logo-icon,
        .phase-2 .logo-icon,
        .phase-3 .logo-icon {
          opacity: 1;
          transform: scale(1);
        }

        .logo-icon svg {
          width: 100%;
          height: 100%;
        }

        .check-path {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          transition: stroke-dashoffset 0.5s ease 0.3s;
        }

        .phase-1 .check-path,
        .phase-2 .check-path,
        .phase-3 .check-path {
          stroke-dashoffset: 0;
        }

        .logo-text {
          font-size: 3rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.4s ease;
        }

        .phase-2 .logo-text,
        .phase-3 .logo-text {
          opacity: 1;
          transform: translateY(0);
        }

        .gradient-text {
          background: linear-gradient(135deg, #9b87f5 0%, #7c6ef6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .splash-tagline {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.4s ease 0.2s;
        }

        .phase-2 .splash-tagline,
        .phase-3 .splash-tagline {
          opacity: 1;
          transform: translateY(0);
        }

        .splash-loader {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin: 0 auto;
          opacity: 0;
          transition: opacity 0.3s ease 0.5s;
        }

        .phase-2 .splash-loader,
        .phase-3 .splash-loader {
          opacity: 1;
        }

        .loader-bar {
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #9b87f5 0%, #7c6ef6 100%);
          border-radius: 4px;
          animation: loading 1s ease forwards 0.7s;
        }

        @keyframes loading {
          from { width: 0%; }
          to { width: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .splash-screen {
            animation: none;
          }
          .logo-icon, .logo-text, .splash-tagline, .splash-loader, .loader-bar {
            animation: none;
            transition: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
        </div>
    );
}
