import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Welcome to StudBlud',
      description: 'Your all-in-one collaborative study workspace. Learn smarter, together.',
    },
    {
      title: 'Everything you need',
      description: 'Powerful tools designed for student collaboration',
      features: ['Real-time Chat', 'Shared Whiteboard', 'AI Study Assistant', 'Study Calendar'],
    },
    {
      title: 'Ready to start',
      description: 'Create your first workspace and invite your study buddies',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-6">
        <button
          onClick={handleSkip}
          className="text-sm text-neutral-500 hover:text-black font-medium"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md text-center animate-fade-in">
          {/* Title & Description */}
          <h2 className="text-3xl font-bold text-black mb-3">{slide.title}</h2>
          <p className="text-neutral-500 mb-8">{slide.description}</p>

          {/* Features Grid */}
          {slide.features && slide.features.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {slide.features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-neutral-50 rounded-xl p-6 border border-neutral-100"
                >
                  <p className="font-medium text-black">{feature}</p>
                </div>
              ))}
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-black'
                    : 'bg-neutral-300 hover:bg-neutral-400'
                }`}
              />
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleNext}
            className="w-full bg-black text-white hover:bg-neutral-800 py-6 text-lg"
          >
            {currentSlide === slides.length - 1 ? (
              'Create First Workspace'
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
