import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';

// Pages that use full-height layouts (no padding)
const FULL_HEIGHT_PAGES = ['/grimoire', '/snippets'];

export function Layout() {
    const location = useLocation();
    const isFullHeight = FULL_HEIGHT_PAGES.includes(location.pathname);

    return (
        <div className="app-layout">
            <Sidebar />
            <main className={`main-content ${isFullHeight ? 'full-height' : ''}`}>
                <Outlet />
            </main>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                        padding: '14px 18px',
                        fontSize: '0.9rem',
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--color-success)',
                            secondary: 'white',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: 'var(--color-error)',
                            secondary: 'white',
                        },
                    },
                }}
            />

            <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          margin-left: var(--spacing-sidebar);
          padding: 32px 40px;
          height: 100vh;
          width: calc(100% - var(--spacing-sidebar));
          overflow-y: auto;
          overflow-x: hidden;
        }

        .main-content.full-height {
          padding: 0;
          overflow: hidden;
        }

        @media (max-width: 1200px) {
          .main-content {
            padding: 28px 32px;
          }
          .main-content.full-height {
            padding: 0;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            padding: 80px 20px 32px;
            width: 100%;
          }
          .main-content.full-height {
            padding: 60px 0 0 0;
          }
        }
      `}</style>
        </div>
    );
}
