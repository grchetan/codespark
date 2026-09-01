import { Link } from 'react-router-dom';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { useAuth } from '@/context/AuthContext';

interface AccessDeniedProps {
  requiredRole?: 'moderator' | 'admin' | 'superadmin';
  customMessage?: string;
}

export default function AccessDenied({ requiredRole, customMessage }: AccessDeniedProps) {
  const { user, isAuthenticated, isSuperAdmin, isModerator, isAdmin } = useAuth();

  const userRole = user?.role || 'member';

  // Determine context-aware heading and description
  let badgeText = '403 ACCESS DENIED';
  let heading = 'Clearance Required';
  let description =
    customMessage ||
    "You don't have permission to access this area with your current account credentials.";

  if (!isAuthenticated) {
    badgeText = '401 UNAUTHORIZED';
    heading = 'Authentication Required';
    description =
      customMessage ||
      'You must sign in with an authorized administrator or moderator account to access the Control Center.';
  } else if (userRole === 'member') {
    badgeText = '403 RESTRICTED';
    heading = 'Staff Clearance Required';
    description =
      customMessage ||
      'Your account is currently registered as a standard Member. Administrative consoles and moderation pipelines are restricted to authorized team members.';
  } else if (userRole === 'moderator' && (requiredRole === 'admin' || requiredRole === 'superadmin')) {
    badgeText = '403 ELEVATED PRIVILEGE';
    heading = 'Administrator Clearance Required';
    description =
      customMessage ||
      'You have access to moderation tools, but this section requires full administrator privileges.';
  } else if (userRole === 'admin' && requiredRole === 'superadmin') {
    badgeText = '403 OWNER RESTRICTED';
    heading = 'Platform Owner Clearance Required';
    description =
      customMessage ||
      'This area contains critical platform configuration and security controls strictly reserved for the Super Admin / Platform Owner.';
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background-50 w-full max-w-full overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-24 sm:pt-28 pb-16 px-4 sm:px-6 w-full max-w-full">
        <div className="w-full max-w-lg rounded-3xl border border-background-300/80 bg-background-50 p-6 sm:p-10 text-center shadow-xl space-y-6 animate-fade-in">
          {/* Status Icon */}
          <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-500/10 text-primary-600 border border-primary-500/20 shadow-sm">
            <i className="ri-shield-keyhole-line text-3xl" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-500" />
            </span>
          </div>

          {/* Heading & Metadata */}
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-primary-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary-600 border border-primary-500/20">
              {badgeText}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground-950">
              {heading}
            </h1>
            <p className="text-xs sm:text-sm text-foreground-600 leading-relaxed max-w-md mx-auto">
              {description}
            </p>
          </div>

          {/* Current Session Pill (if authenticated) */}
          {isAuthenticated && user && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-background-100/80 px-3.5 py-1.5 border border-background-300/60 text-xs text-foreground-700">
              <span className="text-foreground-400">Signed in as:</span>
              <span className="font-bold text-foreground-950 truncate max-w-[160px]">{user.email}</span>
              <span className="rounded bg-background-200 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-foreground-800">
                {user.role}
              </span>
            </div>
          )}

          {/* Context Actions */}
          <div className="space-y-2.5 pt-2">
            {!isAuthenticated ? (
              <Link
                to="/login?redirect=/admin"
                className="btn btn-primary h-11 w-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <i className="ri-user-line text-base" /> Sign In with Authorized Account
              </Link>
            ) : isSuperAdmin || isAdmin ? (
              <Link
                to="/admin?tab=overview"
                className="btn btn-primary h-11 w-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <i className="ri-dashboard-3-line text-base" /> Go to Operations Console
              </Link>
            ) : isModerator ? (
              <Link
                to="/admin?tab=verifications"
                className="btn btn-primary h-11 w-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <i className="ri-shield-check-line text-base" /> Go to Moderation Hub
              </Link>
            ) : null}

            <Link
              to="/effects"
              className="btn btn-secondary h-11 w-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
            >
              <i className="ri-arrow-left-line text-base" /> Return to Public Library
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
