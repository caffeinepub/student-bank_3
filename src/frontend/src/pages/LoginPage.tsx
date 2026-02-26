import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login } = useAuth();
  const [loginType, setLoginType] = useState<'admin' | 'user'>('admin');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (loginType === 'admin') {
        // For admin, II popup will open — await it fully
        await login('', '', 'admin');
        toast.success('Admin म्हणून यशस्वीरित्या login झालात!');
      } else {
        if (!accountNumber.trim()) {
          setError('खाते क्रमांक टाका');
          return;
        }
        const success = await login(accountNumber.trim(), password, 'user');
        if (!success) {
          setError('खाते क्रमांक सापडला नाही. कृपया तपासा.');
        } else {
          toast.success('यशस्वीरित्या login झालात!');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // User cancelled II popup — show friendly message
      if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('closed') || msg.toLowerCase().includes('abort')) {
        setError('Login रद्द केले. पुन्हा प्रयत्न करा.');
      } else {
        setError(`Login अयशस्वी: ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <img
            src="/assets/generated/bank-logo.dim_256x256.png"
            alt="Bank Logo"
            className="w-20 h-20 mx-auto mb-4 rounded-full object-cover shadow-md"
          />
          <h1 className="text-3xl font-bold text-primary">विद्यार्थी बँक</h1>
          <p className="text-muted-foreground mt-1">Student Bank Management System</p>
        </div>

        {/* Login Banner */}
        <div className="mb-6 rounded-xl overflow-hidden shadow">
          <img
            src="/assets/generated/login-banner.dim_800x400.png"
            alt="Login Banner"
            className="w-full h-32 object-cover"
          />
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          {/* Tab Toggle */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              type="button"
              onClick={() => { setLoginType('admin'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                loginType === 'admin'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('user'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                loginType === 'user'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              विद्यार्थी / पालक
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === 'user' && (
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-foreground mb-1">
                  खाते क्रमांक
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="खाते क्रमांक टाका"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {loginType === 'admin' && (
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
                <p>Internet Identity द्वारे Admin login करा.</p>
                <p className="mt-1 text-xs">Login बटण दाबल्यावर II popup उघडेल.</p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg aria-hidden="true" className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {isLoading ? 'Login होत आहे...' : 'Login करा'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} विद्यार्थी बँक · Built with{' '}
          <span className="text-destructive">♥</span> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
