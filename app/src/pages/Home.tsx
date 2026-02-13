import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Plus, Users, Clock, MoreVertical } from 'lucide-react';
import { formatRelativeTime, getRandomQuote } from '@/data/mock';
import type { Workspace } from '@/types';
import { useState, useEffect } from 'react';

interface HomePageProps {
  onNavigate: (page: 'home' | 'calendar' | 'peers' | 'account') => void;
  onWorkspaceSelect: (workspaceId: string) => void;
  onLogout: () => void;
}

export function HomePage({ onNavigate, onWorkspaceSelect, onLogout }: HomePageProps) {
  const { state, dispatch } = useStore();
  const { currentUser, workspaces } = state;
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  const workspaceCount = workspaces.length;
  const workspaceLimit = currentUser?.workspaceLimit || 5;
  const isAtLimit = workspaceCount >= workspaceLimit;

  const handleCreateWorkspace = () => {
    if (isAtLimit && !currentUser?.isPremium) {
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'premiumUpsell', open: true } });
    } else {
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'createWorkspace', open: true } });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage="home" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-16">
          <h1 className="welcome-title text-black mb-4">
            {getGreeting()}, {currentUser?.name.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-xl text-neutral-500 font-light italic">
            "{quote}"
          </p>
        </div>

        {/* Three Main Sections */}
        <div className="space-y-16">
          {/* Section 1: Load Study Spaces */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Load Study Spaces</h2>
              {!currentUser?.isPremium && workspaceCount >= workspaceLimit - 1 && (
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'premiumUpsell', open: true } })}
                  className="text-sm ai-text-rose font-medium hover:underline"
                >
                  Upgrade for unlimited
                </button>
              )}
            </div>

            {workspaces.length === 0 ? (
              <div className="border border-neutral-200 rounded-xl p-12 text-center">
                <p className="text-neutral-500 mb-4">No study spaces yet</p>
                <Button
                  onClick={handleCreateWorkspace}
                  className="bg-black text-white hover:bg-neutral-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Space
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {workspaces.map((workspace) => (
                  <WorkspaceCard
                    key={workspace.id}
                    workspace={workspace}
                    onClick={() => onWorkspaceSelect(workspace.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Create Workspaces */}
          <section>
            <h2 className="text-2xl font-semibold text-black mb-6">Create Workspaces</h2>
            <button
              onClick={handleCreateWorkspace}
              disabled={isAtLimit && !currentUser?.isPremium}
              className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
                isAtLimit && !currentUser?.isPremium
                  ? 'border-neutral-200 cursor-not-allowed opacity-60'
                  : 'border-neutral-300 hover:border-black hover:bg-neutral-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                isAtLimit && !currentUser?.isPremium
                  ? 'bg-neutral-100'
                  : 'bg-black'
              }`}>
                <Plus className={`w-6 h-6 ${
                  isAtLimit && !currentUser?.isPremium ? 'text-neutral-400' : 'text-white'
                }`} />
              </div>
              <span className={`font-medium ${
                isAtLimit && !currentUser?.isPremium ? 'text-neutral-400' : 'text-black'
              }`}>
                Create New Workspace
              </span>
              {!currentUser?.isPremium && (
                <span className="text-sm text-neutral-400 mt-2">
                  {workspaceCount}/{workspaceLimit} spaces used
                </span>
              )}
            </button>
          </section>

          {/* Section 3: Presets */}
          <section>
            <h2 className="text-2xl font-semibold text-black mb-6">Presets</h2>
            <div className="border border-neutral-200 rounded-xl p-12 text-center">
              <p className="text-neutral-500 mb-4">Create custom presets for quick workspace setup</p>
              <Button
                variant="outline"
                onClick={handleCreateWorkspace}
                disabled={isAtLimit && !currentUser?.isPremium}
                className="border-black text-black hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Preset
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Workspace Card Component
interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
}

function WorkspaceCard({ workspace, onClick }: WorkspaceCardProps) {
  const getColorClass = (color: Workspace['color']) => {
    const colors: Record<string, string> = {
      rose: 'bg-[#DE3163]',
      mint: 'bg-[#AFE1AF]',
      sage: 'bg-[#9FE2BF]',
      gray: 'bg-gray-500',
      black: 'bg-black',
    };
    return colors[color] || 'bg-black';
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-neutral-200 hover:border-black transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="relative h-32 overflow-hidden">
        {workspace.thumbnail ? (
          <img
            src={workspace.thumbnail}
            alt={workspace.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full ${getColorClass(workspace.color)}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-4 py-2 bg-white rounded-full text-sm font-medium text-black">
            Open
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-black truncate">{workspace.name}</h3>
            <p className="text-sm text-neutral-500">{workspace.subject}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1 hover:bg-neutral-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {workspace.members.length}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatRelativeTime(workspace.lastActive)}
            </span>
          </div>
          <div className={`w-3 h-3 rounded-full ${getColorClass(workspace.color)}`} />
        </div>
      </div>
    </div>
  );
}
