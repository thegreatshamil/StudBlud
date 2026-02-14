import { useState, useRef } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Settings,
  Users,
  Bot,
  Trash2,
  LogOut,
  MoreVertical,
  Save,
  AlertTriangle,
  Image,
  Palette,
  Copy,
  Check
} from 'lucide-react';
import type { AIConfig, WorkspaceColor } from '@/types';

const workspaceColors: { color: WorkspaceColor; label: string; class: string }[] = [
  { color: 'rose', label: 'Rose', class: 'bg-[#DE3163]' },
  { color: 'mint', label: 'Mint', class: 'bg-[#AFE1AF]' },
  { color: 'sage', label: 'Sage', class: 'bg-[#9FE2BF]' },
  { color: 'gray', label: 'Gray', class: 'bg-gray-500' },
  { color: 'black', label: 'Black', class: 'bg-gray-900' },
];

const aiPersonalities = [
  { id: 'friendly', label: 'Friendly', description: 'Warm and encouraging' },
  { id: 'strict', label: 'Strict', description: 'Direct and challenging' },
  { id: 'funny', label: 'Funny', description: 'Light-hearted and witty' },
  { id: 'socratic', label: 'Socratic', description: 'Asks guiding questions' },
] as const;

export function WorkspaceSettingsView() {
  const { state, dispatch } = useStore();
  const { currentWorkspace, currentUser } = state;

  const [name, setName] = useState(currentWorkspace?.name || '');
  const [description, setDescription] = useState(currentWorkspace?.description || '');
  const [selectedColor, setSelectedColor] = useState<WorkspaceColor>(currentWorkspace?.color || 'gray');
  const [aiConfig, setAiConfig] = useState<AIConfig>(currentWorkspace?.aiConfig || { name: 'StudBlud', enabled: true });
  const [isSaving, setIsSaving] = useState(false);
  const [thumbnail, setThumbnail] = useState(currentWorkspace?.thumbnail || '');
  const [thumbnailType, setThumbnailType] = useState<'color' | 'whiteboard' | 'custom'>('color');
  const [linkCopied, setLinkCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwner = currentWorkspace?.ownerId === currentUser?.id;

  const handleSaveGeneral = async () => {
    if (!currentWorkspace) return;

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    dispatch({
      type: 'UPDATE_WORKSPACE',
      payload: {
        ...currentWorkspace,
        name,
        description,
        color: selectedColor,
        thumbnail: thumbnailType === 'color' ? undefined : thumbnail,
      },
    });

    setIsSaving(false);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnail(event.target?.result as string);
        setThumbnailType('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const setWhiteboardThumbnail = () => {
    setThumbnail('/whiteboard-thumbnail.svg');
    setThumbnailType('whiteboard');
  };

  const copyShareableLink = () => {
    if (currentWorkspace?.shareableLink) {
      navigator.clipboard.writeText(currentWorkspace.shareableLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleSaveAI = async () => {
    if (!currentWorkspace) return;

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    dispatch({
      type: 'UPDATE_AI_CONFIG',
      payload: {
        workspaceId: currentWorkspace.id,
        config: aiConfig,
      },
    });

    // ✅ Persist AI name for global access (chatbot & summarizer)
    localStorage.setItem('studblud_ai_name', aiConfig.name);

    setIsSaving(false);
  };

  const handleLeaveWorkspace = () => {
    if (confirm('Are you sure you want to leave this workspace?')) {
      // TODO: Implement leave workspace
    }
  };

  const handleDeleteWorkspace = () => {
    if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      if (currentWorkspace) {
        dispatch({ type: 'DELETE_WORKSPACE', payload: currentWorkspace.id });
      }
    }
  };

  if (!currentWorkspace) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Workspace Settings</h2>
            <p className="text-sm text-gray-500">Manage your workspace preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="general">
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="ai">AI Settings</TabsTrigger>
              {isOwner && <TabsTrigger value="danger">Danger Zone</TabsTrigger>}
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <Card className="p-6 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">General Information</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isOwner}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      disabled={!isOwner}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Workspace Color</Label>
                    <div className="flex gap-3">
                      {workspaceColors.map((color) => (
                        <button
                          key={color.color}
                          onClick={() => isOwner && setSelectedColor(color.color)}
                          disabled={!isOwner}
                          className={`w-10 h-10 rounded-full ${color.class} transition-transform ${selectedColor === color.color
                              ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                              : 'hover:scale-105'
                            } ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Thumbnail Section */}
                  <div className="space-y-3">
                    <Label>Workspace Thumbnail</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Color Option */}
                      <button
                        onClick={() => setThumbnailType('color')}
                        disabled={!isOwner}
                        className={`p-4 rounded-lg border-2 transition-all ${thumbnailType === 'color'
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                          } ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Palette className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                        <p className="text-xs text-center">Solid Color</p>
                      </button>

                      {/* Whiteboard Option */}
                      <button
                        onClick={setWhiteboardThumbnail}
                        disabled={!isOwner}
                        className={`p-4 rounded-lg border-2 transition-all ${thumbnailType === 'whiteboard'
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                          } ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="w-6 h-6 mx-auto mb-2 border-2 border-dashed border-gray-400 rounded" />
                        <p className="text-xs text-center">Whiteboard</p>
                      </button>

                      {/* Custom Upload Option */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!isOwner}
                        className={`p-4 rounded-lg border-2 transition-all ${thumbnailType === 'custom'
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                          } ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Image className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                        <p className="text-xs text-center">Custom Image</p>
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                    {thumbnail && thumbnailType !== 'color' && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-200">
                          {thumbnailType === 'whiteboard' ? (
                            <div className="w-full h-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <span className="text-xs text-gray-400">Whiteboard Preview</span>
                            </div>
                          ) : (
                            <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shareable Link Section */}
                  {currentWorkspace?.shareableLink && (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <Label>Shareable Link</Label>
                      <div className="flex gap-2">
                        <Input
                          value={currentWorkspace.shareableLink}
                          readOnly
                          className="flex-1 bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          onClick={copyShareableLink}
                          className="shrink-0"
                        >
                          {linkCopied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">Share this link to invite others to your workspace</p>
                    </div>
                  )}

                  {isOwner && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveGeneral}
                        disabled={isSaving}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Members */}
            <TabsContent value="members">
              <Card className="p-6 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Workspace Members</h3>
                  <span className="text-sm text-gray-500">
                    {currentWorkspace.members.length} members
                  </span>
                </div>

                <div className="space-y-3">
                  {currentWorkspace.members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.name}
                            {member.userId === currentUser?.id && (
                              <span className="ml-2 text-xs text-gray-400">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                        </div>
                      </div>

                      {isOwner && member.userId !== currentUser?.id && (
                        <button className="p-2 hover:bg-gray-200 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isOwner && (
                  <Button className="w-full mt-4" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Invite Members
                  </Button>
                )}
              </Card>
            </TabsContent>

            {/* AI Settings */}
            <TabsContent value="ai" className="space-y-6">
              <Card className="p-6 border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full ai-gradient-rose flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Study Assistant</h3>
                    <p className="text-sm text-gray-500">Configure your workspace AI</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-name">AI Name</Label>
                    <Input
                      id="ai-name"
                      value={aiConfig.name}
                      onChange={(e) => setAiConfig({ ...aiConfig, name: e.target.value })}
                      placeholder="StudBlud"
                      disabled={!isOwner}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ai-enabled"
                      checked={aiConfig.enabled}
                      onChange={(e) => setAiConfig({ ...aiConfig, enabled: e.target.checked })}
                      disabled={!isOwner}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="ai-enabled" className="text-sm">
                      Enable AI in chat (type @ to mention)
                    </Label>
                  </div>

                  {aiConfig.enabled && (
                    <div className="space-y-2">
                      <Label>AI Personality</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {aiPersonalities.map((personality) => (
                          <button
                            key={personality.id}
                            onClick={() => isOwner && setAiConfig({ ...aiConfig, personality: personality.id })}
                            disabled={!isOwner}
                            className={`p-3 rounded-lg border text-left transition-colors ${aiConfig.personality === personality.id
                                ? 'border-[#DE3163] bg-rose-50'
                                : 'border-gray-200 hover:border-[#DE3163]/50'
                              } ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <p className="font-medium text-sm">{personality.label}</p>
                            <p className="text-xs text-gray-500">{personality.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isOwner && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveAI}
                        disabled={isSaving}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Danger Zone */}
            {isOwner && (
              <TabsContent value="danger">
                <Card className="p-6 border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#DE3163]" />
                    Danger Zone
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Delete Workspace</h4>
                        <p className="text-sm text-gray-500">
                          This action cannot be undone. All data will be permanently deleted.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleDeleteWorkspace}
                        className="text-[#DE3163] hover:bg-rose-50 border-gray-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* Leave Workspace (for non-owners) */}
          {!isOwner && (
            <Card className="p-6 mt-6 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Leave Workspace</h4>
                  <p className="text-sm text-gray-500">
                    You will no longer have access to this workspace.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLeaveWorkspace}
                  className="text-gray-700 hover:bg-gray-50 border-gray-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
