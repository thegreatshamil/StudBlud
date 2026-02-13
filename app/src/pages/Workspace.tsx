import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, 
  MessageSquare, 
  Palette, 
  Brain, 
  Layers, 
  Timer, 
  Video, 
  Settings,
  MoreVertical,
  Users,
  LogOut
} from 'lucide-react';
import { ChatView } from '@/components/workspace/ChatView';
import { WhiteboardView } from '@/components/workspace/WhiteboardView';
import { AISummaryView } from '@/components/workspace/AISummaryView';
import { FlashcardsView } from '@/components/workspace/FlashcardsView';
import { PomodoroView } from '@/components/workspace/PomodoroView';
import { MeetView } from '@/components/workspace/MeetView';
import { WorkspaceSettingsView } from '@/components/workspace/WorkspaceSettingsView';

interface WorkspacePageProps {
  onBack: () => void;
}

export function WorkspacePage({ onBack }: WorkspacePageProps) {
  const { state, dispatch } = useStore();
  const { currentWorkspace, currentWorkspaceView } = state;

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Workspace not found</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'whiteboard', label: 'Whiteboard', icon: Palette },
    { id: 'ai-summary', label: 'AI Summary', icon: Brain },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'meet', label: 'Meet', icon: Video },
    { id: 'settings', label: 'Manage', icon: Settings },
  ] as const;

  const getColorClass = (color: typeof currentWorkspace.color) => {
    const colors: Record<string, string> = {
      rose: 'bg-[#DE3163]',
      mint: 'bg-[#AFE1AF]',
      sage: 'bg-[#9FE2BF]',
      black: 'bg-black',
    };
    return colors[color] || 'bg-black';
  };

  const renderView = () => {
    switch (currentWorkspaceView) {
      case 'chat':
        return <ChatView />;
      case 'whiteboard':
        return <WhiteboardView />;
      case 'ai-summary':
        return <AISummaryView />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'pomodoro':
        return <PomodoroView />;
      case 'meet':
        return <MeetView />;
      case 'settings':
        return <WorkspaceSettingsView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getColorClass(currentWorkspace.color)}`} />
              <div>
                <h1 className="font-semibold text-black">{currentWorkspace.name}</h1>
                <p className="text-xs text-neutral-500">{currentWorkspace.subject}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-neutral-500">
              <Users className="w-4 h-4" />
              <span>{currentWorkspace.members.length}</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-neutral-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-neutral-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => dispatch({ type: 'SET_WORKSPACE_VIEW', payload: 'settings' })}>
                  <Settings className="w-4 h-4 mr-2" />
                  Workspace Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onBack} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex -space-x-2">
              {currentWorkspace.members.slice(0, 3).map((member) => (
                <Avatar key={member.userId} className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="bg-black text-white text-xs">{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              {currentWorkspace.members.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-xs text-neutral-600">
                  +{currentWorkspace.members.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-16 lg:w-56 bg-white border-r border-neutral-200 flex flex-col">
          <nav className="flex-1 py-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentWorkspaceView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => dispatch({ type: 'SET_WORKSPACE_VIEW', payload: item.id })}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-black border-r-2 border-black'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:block font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* View Content */}
        <main className="flex-1 overflow-hidden">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
