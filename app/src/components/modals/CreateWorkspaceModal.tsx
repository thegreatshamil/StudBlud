import { useState } from 'react';
import { useStore } from '@/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowRight,
  ArrowLeft,
  Bot,
  Copy,
  Check
} from 'lucide-react';
import type { Workspace, AIConfig, WorkspaceColor } from '@/types';
import { generateId } from '@/data/mock';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (workspace: Workspace) => void;
}

const subjects = [
  'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Computer Science',
  'History', 'Geography', 'Literature', 'Economics', 'Psychology',
  'Philosophy', 'Art', 'Music', 'Languages', 'Engineering',
  'Medicine', 'Law', 'Business', 'Other'
];

const workspaceColors: { color: WorkspaceColor; label: string; class: string }[] = [
  { color: 'rose', label: 'Rose', class: 'bg-[#DE3163]' },
  { color: 'mint', label: 'Mint', class: 'bg-[#AFE1AF]' },
  { color: 'sage', label: 'Sage', class: 'bg-[#9FE2BF]' },
  { color: 'black', label: 'Black', class: 'bg-black' },
];

const aiPersonalities = [
  { id: 'friendly', label: 'Friendly', description: 'Warm and encouraging' },
  { id: 'strict', label: 'Strict', description: 'Direct and challenging' },
  { id: 'funny', label: 'Funny', description: 'Light-hearted and witty' },
  { id: 'socratic', label: 'Socratic', description: 'Asks guiding questions' },
] as const;

export function CreateWorkspaceModal({ isOpen, onClose, onSuccess }: CreateWorkspaceModalProps) {
  const { state } = useStore();
  const { peers } = state;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 fields
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<WorkspaceColor>('rose');

  // Step 2 fields
  const [aiName, setAiName] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiPersonality, setAiPersonality] = useState<AIConfig['personality']>('friendly');

  // Step 3 fields
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      if (step === 2 && !inviteLink) {
        setInviteLink(`https://studblud.io/j/${generateId('invite')}`);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as typeof step);
    }
  };

  const handleClose = () => {
    setStep(1);
    setName('');
    setSubject('');
    setDescription('');
    setSelectedColor('rose');
    setAiName('');
    setAiEnabled(true);
    setAiPersonality('friendly');
    setSelectedPeers([]);
    setInviteLink('');
    setLinkCopied(false);
    onClose();
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const workspaceId = generateId('ws');
    const shareableLink = `https://studblud.app/w/${workspaceId}`;

    const newWorkspace: Workspace = {
      id: workspaceId,
      name,
      subject,
      description,
      color: selectedColor,
      ownerId: state.currentUser?.id || '',
      members: [
        {
          userId: state.currentUser?.id || '',
          name: state.currentUser?.name || '',
          avatar: state.currentUser?.avatar,
          role: 'owner',
          joinedAt: new Date(),
        },
        ...selectedPeers.map(peerId => {
          const peer = peers.find(p => p.id === peerId);
          return {
            userId: peer?.userId || '',
            name: peer?.name || '',
            avatar: peer?.avatar,
            role: 'member' as const,
            joinedAt: new Date(),
          };
        }),
      ],
      aiConfig: {
        name: aiName || 'StudBlud',
        enabled: aiEnabled,
        personality: aiPersonality,
      },
      createdAt: new Date(),
      lastActive: new Date(),
      shareableLink,
    };

    setIsLoading(false);
    onSuccess(newWorkspace);
    handleClose();
  };

  const togglePeer = (peerId: string) => {
    setSelectedPeers(prev =>
      prev.includes(peerId)
        ? prev.filter(id => id !== peerId)
        : [...prev, peerId]
    );
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return Boolean(name.trim()) && Boolean(subject);

      case 2:
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg h-[90vh] flex flex-col p-0 border-none">

        {/* Artistic Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 speckle-pattern opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#DE3163]/10 via-[#AFE1AF]/10 to-[#9FE2BF]/10" />

          <DialogHeader className="relative p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleClose}
                className="text-neutral-400 hover:text-black"
              >
                <span className="text-lg">x</span>
              </button>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#DE3163] transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-neutral-500">{step}/{totalSteps}</span>
            </div>
            <DialogTitle className="text-2xl font-semibold">
              {step === 1 && 'Create Workspace'}
              {step === 2 && 'AI Study Assistant'}
              {step === 3 && 'Invite Peers'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh]">

          <div className="p-6 pt-2">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    placeholder="e.g., AP Physics Study Group"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-neutral-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subj) => (
                      <button
                        key={subj}
                        onClick={() => setSubject(subj)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${subject === subj
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-black'
                          }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What will you study in this workspace?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="border-neutral-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Workspace Color</Label>
                  <div className="flex gap-3">
                    {workspaceColors.map((color) => (
                      <button
                        key={color.color}
                        onClick={() => setSelectedColor(color.color)}
                        className={`w-12 h-12 rounded-full ${color.class} transition-transform ${selectedColor === color.color
                          ? 'ring-2 ring-offset-2 ring-black scale-110'
                          : 'hover:scale-105'
                          }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#DE3163] to-[#9FE2BF] flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Configure Your AI</h3>
                  <p className="text-sm text-neutral-500">Give your AI assistant a personality</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-name">AI Name</Label>
                  <Input
                    id="ai-name"
                    placeholder="e.g., Newton, Einstein, or any name you like"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    className="border-neutral-200"
                  />
                  <p className="text-xs text-neutral-500">
                    Leave empty to use default name "StudBlud"
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ai-enabled"
                    checked={aiEnabled}
                    onCheckedChange={(checked) => setAiEnabled(checked as boolean)}
                  />
                  <Label htmlFor="ai-enabled" className="text-sm">
                    Enable AI in chat (type @ to mention)
                  </Label>
                </div>

                {aiEnabled && (
                  <div className="space-y-2">
                    <Label>AI Personality (optional)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {aiPersonalities.map((personality) => (
                        <button
                          key={personality.id}
                          onClick={() => setAiPersonality(personality.id)}
                          className={`p-3 rounded-lg border text-left transition-colors ${aiPersonality === personality.id
                            ? 'border-[#DE3163] bg-[#DE3163]/5'
                            : 'border-neutral-200 hover:border-[#DE3163]/50'
                            }`}
                        >
                          <p className="font-medium text-sm">{personality.label}</p>
                          <p className="text-xs text-neutral-500">{personality.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">From your peer list</h3>
                  {peers.length === 0 ? (
                    <p className="text-sm text-neutral-500 text-center py-4">
                      No peers yet. You can invite them later.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {peers.map((peer) => (
                        <div
                          key={peer.id}
                          onClick={() => togglePeer(peer.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPeers.includes(peer.id)
                            ? 'border-[#DE3163] bg-[#DE3163]/5'
                            : 'border-neutral-200 hover:border-[#DE3163]/50'
                            }`}
                        >
                          <Checkbox checked={selectedPeers.includes(peer.id)} />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={peer.avatar} alt={peer.name} />
                            <AvatarFallback className="bg-black text-white text-xs">{peer.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{peer.name}</p>
                            <p className="text-xs text-neutral-500">{peer.school}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-neutral-500">OR</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Share invite link</h3>
                  <div className="flex gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="flex-1 border-neutral-200"
                    />
                    <Button
                      variant="outline"
                      onClick={copyInviteLink}
                      className="shrink-0 border-neutral-300"
                    >
                      {linkCopied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between p-6 pt-4 border-t border-neutral-100">
          <Button
            variant="outline"
            onClick={step === 1 ? handleClose : handleBack}
            className="border-neutral-300"
          >
            {step === 1 ? 'Cancel' : <><ArrowLeft className="w-4 h-4 mr-2" /> Back</>}
          </Button>
          <Button
            onClick={step === totalSteps ? handleSubmit : handleNext}
            disabled={!canProceed() || isLoading}
            className="bg-black text-white hover:bg-neutral-800"
          >
            {isLoading ? (
              'Creating...'
            ) : step === totalSteps ? (
              'Create Workspace'
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
