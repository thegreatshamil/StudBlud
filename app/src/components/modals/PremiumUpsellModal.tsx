import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Crown, Sparkles, Zap, Infinity, Palette, FileText, Headphones } from 'lucide-react';

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  { icon: Infinity, label: 'Unlimited workspaces', description: 'Create as many study spaces as you need' },
  { icon: Sparkles, label: 'AI flashcard generation', description: 'Automatically generate flashcards from any topic' },
  { icon: Palette, label: 'Advanced whiteboard', description: 'Shapes, images, and real-time collaboration' },
  { icon: Zap, label: 'Custom AI personalities', description: 'Tailor your AI tutor to your learning style' },
  { icon: FileText, label: 'Export to PDF', description: 'Save your notes and summaries as PDFs' },
  { icon: Headphones, label: 'Priority support', description: 'Get help when you need it most' },
];

export function PremiumUpsellModal({ isOpen, onClose }: PremiumUpsellModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">Upgrade to Premium</DialogTitle>
            <p className="text-gray-500 mt-2">Unlock the full potential of StudBlud</p>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Free Plan */}
          <Card className="p-6 border-gray-200">
            <h3 className="font-semibold text-lg mb-2">Free</h3>
            <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-gray-500">/month</span></p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                Up to 5 workspaces
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                Basic chat & whiteboard
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                AI summaries
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500" />
                Manual flashcards
              </li>
            </ul>
          </Card>

          {/* Premium Plan */}
          <Card className="p-6 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">Premium</h3>
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">Best Value</span>
            </div>
            <p className="text-3xl font-bold mb-4">$9<span className="text-sm font-normal text-gray-500">/month</span></p>
            <ul className="space-y-3">
              {features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-amber-500" />
                  {feature.label}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-center">All Premium Features</h4>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{feature.label}</p>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-6">
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Premium
          </Button>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
