import { useState } from 'react';
import { useStore } from '@/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: 'home' | 'calendar' | 'peers' | 'account';
  onNavigate: (page: 'home' | 'calendar' | 'peers' | 'account') => void;
  onLogout: () => void;
}

export function Navbar({ currentPage, onNavigate, onLogout }: NavbarProps) {
  const { state } = useStore();
  const { currentUser } = state;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'calendar', label: 'CALENDAR' },
    { id: 'peers', label: 'PEERS' },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Text only */}
          <div className="flex items-center">
            <span className="font-semibold text-xl tracking-tight">StudBlud</span>
          </div>

          {/* Desktop Navigation - Centered pill */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center bg-neutral-100 rounded-full px-2 py-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as 'home' | 'calendar' | 'peers' | 'account')}
                    className={`px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-neutral-600 hover:text-black'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback className="bg-black text-white text-xs">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="font-medium text-sm">{currentUser?.name}</p>
                  <p className="text-xs text-neutral-500">{currentUser?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('account')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100"
            >
              <div className="w-5 h-0.5 bg-black mb-1" />
              <div className="w-5 h-0.5 bg-black mb-1" />
              <div className="w-5 h-0.5 bg-black" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id as 'home' | 'calendar' | 'peers' | 'account');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
