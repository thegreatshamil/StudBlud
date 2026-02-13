import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
}

export function LoginPage({ onLogin, onNavigateToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    onLogin();
  };

  // Developer skip - instant login for demo
  const handleDeveloperSkip = () => {
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Logo - Text only */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-semibold text-black tracking-tight">StudBlud</h1>
          <p className="text-neutral-500 mt-2 text-sm">Study smarter together</p>
        </div>

        <div className="border border-neutral-200 rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-black">Welcome back</h2>
            <p className="text-neutral-500 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`border-neutral-300 focus:border-black focus:ring-black ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`border-neutral-300 focus:border-black focus:ring-black pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
                <input type="checkbox" className="rounded border-neutral-300" />
                Remember me
              </label>
              <button type="button" className="text-black hover:underline">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-neutral-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <button
                onClick={onNavigateToRegister}
                className="text-black hover:underline font-medium"
              >
                Register
              </button>
            </p>
          </div>

          {/* Developer Skip */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <button
              onClick={handleDeveloperSkip}
              className="w-full py-2 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Developer: Skip Login (Demo Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
