import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, ArrowRight, School } from 'lucide-react';

interface RegisterPageProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
}

type RegisterStep = 1 | 2 | 3;

export function RegisterPage({ onRegister, onNavigateToLogin }: RegisterPageProps) {
  const [step, setStep] = useState<RegisterStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1 fields
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 2 fields
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Password strength
  const getPasswordStrength = (pwd: string): { strength: number; label: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 25;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength += 25;
    
    let label = 'Weak';
    if (strength >= 50) label = 'Medium';
    if (strength >= 75) label = 'Strong';
    if (strength === 100) label = 'Very Strong';
    
    return { strength, label };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateStep1 = () => {
    const newErrors: Record<string, string | undefined> = {};
    
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!school.trim()) newErrors.school = 'School name is required';
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
      
      // Start resend timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (step === 2) {
      const code = verificationCode.join('');
      if (code.length !== 6) {
        setErrors({ verificationCode: 'Please enter the complete code' });
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as RegisterStep);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onRegister();
  };

  // Developer skip - instant registration for demo
  const handleDeveloperSkip = () => {
    onRegister();
  };

  const handleResendCode = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const updateVerificationCode = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
    
    if (errors.verificationCode) {
      setErrors({ ...errors, verificationCode: undefined });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm">Full Name</Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors({ ...errors, fullName: undefined });
          }}
          className={`border-neutral-300 focus:border-black focus:ring-black ${errors.fullName ? 'border-red-500' : ''}`}
        />
        {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="school" className="text-sm">School Name</Label>
        <div className="relative">
          <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            id="school"
            placeholder="Search for your school..."
            value={school}
            onChange={(e) => {
              setSchool(e.target.value);
              if (errors.school) setErrors({ ...errors, school: undefined });
            }}
            className={`pl-10 border-neutral-300 focus:border-black focus:ring-black ${errors.school ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.school && <p className="text-sm text-red-500">{errors.school}</p>}
      </div>

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
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            className={`pr-10 border-neutral-300 focus:border-black focus:ring-black ${errors.password ? 'border-red-500' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && (
          <div className="space-y-1">
            <Progress value={passwordStrength.strength} className="h-1" />
            <p className={`text-xs ${
              passwordStrength.strength < 50 ? 'text-red-500' :
              passwordStrength.strength < 75 ? 'text-neutral-500' : 'text-black'
            }`}>
              {passwordStrength.label}
            </p>
          </div>
        )}
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          className={`border-neutral-300 focus:border-black focus:ring-black ${errors.confirmPassword ? 'border-red-500' : ''}`}
        />
        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <School className="w-8 h-8 text-black" />
        </div>
        <h3 className="text-lg font-medium mb-2">Verify your email</h3>
        <p className="text-sm text-neutral-500">
          We've sent a 6-digit code to <span className="font-medium text-black">{email}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {verificationCode.map((digit, index) => (
          <Input
            key={index}
            id={`code-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => updateVerificationCode(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digit && index > 0) {
                const prevInput = document.getElementById(`code-${index - 1}`);
                prevInput?.focus();
              }
            }}
            className="w-12 h-12 text-center text-xl font-medium border-neutral-300 focus:border-black focus:ring-black"
          />
        ))}
      </div>
      {errors.verificationCode && (
        <p className="text-sm text-red-500 text-center">{errors.verificationCode}</p>
      )}

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-neutral-500">Resend code in {resendTimer}s</p>
        ) : (
          <button
            onClick={handleResendCode}
            className="text-sm text-black hover:underline font-medium"
          >
            Resend code
          </button>
        )}
        <button
          onClick={() => setStep(3)}
          className="block mx-auto mt-2 text-sm text-neutral-400 hover:text-neutral-600"
        >
          I'll verify later
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      
      <div>
        <h3 className="text-xl font-medium mb-2">You're all set</h3>
        <p className="text-neutral-500">
          Welcome to StudBlud, <span className="font-medium text-black">{fullName || 'Student'}</span>
          <br />
          Let's get you started with your first workspace.
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full bg-black text-white hover:bg-neutral-800"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Setting up...
          </>
        ) : (
          'Get Started'
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-semibold text-black tracking-tight">StudBlud</h1>
          <p className="text-neutral-500 mt-2 text-sm">Study smarter together</p>
        </div>

        <div className="border border-neutral-200 rounded-lg p-8">
          <div className="flex items-center gap-2 mb-4">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-500" />
              </button>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500">Step {step} of 3</span>
                <span className="text-xs text-neutral-500">
                  {step === 1 ? 'Basic Info' : step === 2 ? 'Verification' : 'Complete'}
                </span>
              </div>
              <Progress value={(step / 3) * 100} className="h-1" />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-medium text-black">
              {step === 1 ? 'Create your account' : step === 2 ? 'Verify email' : 'Success'}
            </h2>
            <p className="text-neutral-500 text-sm mt-1">
              {step === 1 
                ? 'Enter your details to get started' 
                : step === 2 
                  ? 'Enter the verification code sent to your email'
                  : 'Your account is ready'
              }
            </p>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {step < 3 && (
            <Button
              onClick={handleContinue}
              className="w-full mt-6 bg-black text-white hover:bg-neutral-800"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600">
                Already have an account?{' '}
                <button
                  onClick={onNavigateToLogin}
                  className="text-black hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Developer Skip */}
        <div className="mt-8 text-center">
          <button
            onClick={handleDeveloperSkip}
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Developer: Skip Registration (Demo Mode)
          </button>
        </div>
      </div>
    </div>
  );
}
