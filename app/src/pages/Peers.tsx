import { useState } from 'react';
import { useStore } from '@/store';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, MessageCircle, MoreVertical, Check, X, Clock, User } from 'lucide-react';
import { formatRelativeTime } from '@/data/mock';

interface PeersPageProps {
  onNavigate: (page: 'home' | 'calendar' | 'peers' | 'account') => void;
  onLogout: () => void;
}

export function PeersPage({ onNavigate, onLogout }: PeersPageProps) {
  const { state, dispatch } = useStore();
  const { peers, pendingPeers } = state;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-peers');

  const filteredPeers = peers.filter(peer =>
    peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    peer.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptPeer = (peerId: string) => {
    dispatch({ type: 'ACCEPT_PEER', payload: peerId });
  };

  const handleRejectPeer = (peerId: string) => {
    dispatch({ type: 'REJECT_PEER', payload: peerId });
  };

  const getStatusColor = (status: typeof peers[0]['status']) => {
    switch (status) {
      case 'online':
        return 'bg-black';
      case 'away':
        return 'bg-neutral-400';
      case 'offline':
        return 'bg-neutral-300';
      default:
        return 'bg-neutral-300';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage="peers" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-black">Your Peers</h1>
            <p className="text-neutral-500 mt-1">Connect and study with classmates</p>
          </div>
          
          <Button className="bg-black text-white hover:bg-neutral-800">
            <UserPlus className="w-4 h-4 mr-2" />
            Find Peers
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <Input
            placeholder="Search peers by name or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-6 text-lg border-neutral-200"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-neutral-100">
            <TabsTrigger value="my-peers" className="data-[state=active]:bg-black data-[state=active]:text-white">
              My Peers
              <span className="ml-2 text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                {peers.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Pending
              {pendingPeers.length > 0 && (
                <span className="ml-2 text-xs bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                  {pendingPeers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="find" className="data-[state=active]:bg-black data-[state=active]:text-white">
              Find New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-peers" className="mt-0">
            <div className="space-y-3">
              {filteredPeers.length === 0 ? (
                <Card className="p-12 text-center border border-neutral-200">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {searchQuery ? 'No peers found' : 'No peers yet'}
                  </h3>
                  <p className="text-neutral-500 mb-4">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Connect with classmates to study together'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setActiveTab('find')}
                      className="bg-black text-white hover:bg-neutral-800"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find Peers
                    </Button>
                  )}
                </Card>
              ) : (
                filteredPeers.map((peer) => (
                  <Card
                    key={peer.id}
                    className="p-4 border border-neutral-200 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={peer.avatar} alt={peer.name} />
                          <AvatarFallback className="bg-black text-white">{peer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(peer.status)}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-black">{peer.name}</h3>
                          {peer.status === 'online' && (
                            <span className="text-xs text-black bg-neutral-100 px-2 py-0.5 rounded-full">
                              Online
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">{peer.school}</p>
                        {peer.status !== 'online' && peer.lastSeen && (
                          <p className="text-xs text-neutral-400">
                            Last seen {formatRelativeTime(peer.lastSeen)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hidden sm:flex border-neutral-300"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-neutral-400 hover:text-black"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            <div className="space-y-3">
              {pendingPeers.length === 0 ? (
                <Card className="p-12 text-center border border-neutral-200">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">No pending requests</h3>
                  <p className="text-neutral-500">Peer requests will appear here</p>
                </Card>
              ) : (
                pendingPeers.map((peer) => (
                  <Card
                    key={peer.id}
                    className="p-4 border border-neutral-200 bg-neutral-50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={peer.avatar} alt={peer.name} />
                        <AvatarFallback className="bg-black text-white">{peer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-black">{peer.name}</h3>
                        <p className="text-sm text-neutral-500">{peer.school}</p>
                        <p className="text-xs text-black mt-0.5">Wants to connect</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptPeer(peer.id)}
                          className="bg-black text-white hover:bg-neutral-800"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectPeer(peer.id)}
                          className="border-neutral-300"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="find" className="mt-0">
            <Card className="p-12 text-center border border-neutral-200">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Find new peers</h3>
              <p className="text-neutral-500 mb-4">
                Search for classmates by name, email, or school to connect
              </p>
              <div className="max-w-md mx-auto flex gap-2">
                <Input placeholder="Enter name or email..." className="border-neutral-200" />
                <Button className="bg-black text-white hover:bg-neutral-800">
                  Search
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
