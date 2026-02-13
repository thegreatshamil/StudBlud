import { useState, useRef } from 'react';
import { useStore } from '@/store';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Shield, 
  CreditCard, 
  Camera, 
  Trash2,
  Mail,
  School,
  Lock,
  Upload
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (page: 'home' | 'calendar' | 'peers' | 'account') => void;
  onLogout: () => void;
}

export function AccountPage({ onNavigate, onLogout }: AccountPageProps) {
  const { state } = useStore();
  const { currentUser, workspaces } = state;
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    inApp: true,
    mentions: true,
    events: true,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const workspaceCount = workspaces.length;
  const workspaceLimit = currentUser?.workspaceLimit || 5;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage="account" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black">Account Settings</h1>
          <p className="text-neutral-500 mt-1">Manage your profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-neutral-100">
            <TabsTrigger value="profile" className="data-[state=active]:bg-black data-[state=active]:text-white">Profile</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-black data-[state=active]:text-white">Notifications</TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-black data-[state=active]:text-white">Subscription</TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-black data-[state=active]:text-white">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6 border border-neutral-200">
              <h2 className="text-lg font-semibold text-black mb-6">Profile Information</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview || undefined} alt={currentUser?.name} />
                    <AvatarFallback className="bg-black text-white text-2xl">{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-medium text-black">Profile Photo</h3>
                  <p className="text-sm text-neutral-500 mb-3">This will be displayed on your profile</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-neutral-300"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleRemovePhoto}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="name"
                      defaultValue={currentUser?.name}
                      className="pl-10 border-neutral-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="email"
                      type="email"
                      defaultValue={currentUser?.email}
                      className="pl-10 border-neutral-200"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-neutral-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="school"
                      defaultValue={currentUser?.school}
                      className="pl-10 border-neutral-200"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button className="bg-black text-white hover:bg-neutral-800">
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6 border border-neutral-200">
              <h2 className="text-lg font-semibold text-black mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-black">Email Notifications</h3>
                    <p className="text-sm text-neutral-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-black">Push Notifications</h3>
                    <p className="text-sm text-neutral-500">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-black">In-App Notifications</h3>
                    <p className="text-sm text-neutral-500">Show notifications in the app</p>
                  </div>
                  <Switch
                    checked={notifications.inApp}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, inApp: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-black">Mentions</h3>
                    <p className="text-sm text-neutral-500">Notify when someone mentions you</p>
                  </div>
                  <Switch
                    checked={notifications.mentions}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, mentions: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-black">Event Reminders</h3>
                    <p className="text-sm text-neutral-500">Get reminded about upcoming events</p>
                  </div>
                  <Switch
                    checked={notifications.events}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, events: checked })
                    }
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="p-6 border border-neutral-200">
              <h2 className="text-lg font-semibold text-black mb-6">Your Plan</h2>
              
              <div className={`p-6 rounded-xl border ${currentUser?.isPremium ? 'border-black bg-neutral-50' : 'border-neutral-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-black">
                        {currentUser?.isPremium ? 'Premium' : 'Free'}
                      </h3>
                      {currentUser?.isPremium && (
                        <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full">Active</span>
                      )}
                    </div>
                    <p className="text-neutral-500">
                      {currentUser?.isPremium
                        ? 'You have unlimited access to all features'
                        : 'Upgrade to unlock unlimited workspaces and premium features'}
                    </p>
                  </div>
                  {!currentUser?.isPremium && (
                    <Button className="bg-black text-white hover:bg-neutral-800">
                      Upgrade
                    </Button>
                  )}
                </div>

                {!currentUser?.isPremium && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-neutral-600">Workspaces used</span>
                      <span className="font-medium">{workspaceCount} / {workspaceLimit}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full transition-all"
                        style={{ width: `${(workspaceCount / workspaceLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="font-medium text-black">Premium Features</h3>
                {[
                  'Unlimited workspaces',
                  'AI-powered flashcard generation',
                  'Advanced whiteboard features',
                  'Priority support',
                  'Custom AI personalities',
                  'Export to PDF',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-neutral-600">
                    <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center">
                      <span className="text-xs">+</span>
                    </div>
                    {feature}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6 border border-neutral-200">
              <h2 className="text-lg font-semibold text-black mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black">Password</h3>
                      <p className="text-sm text-neutral-500">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-neutral-300">Change Password</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black">Two-Factor Authentication</h3>
                      <p className="text-sm text-neutral-500">Not enabled</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-neutral-300">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black">Active Sessions</h3>
                      <p className="text-sm text-neutral-500">1 active session</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-neutral-300">Manage Sessions</Button>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border border-red-200">
              <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-black">Delete Account</h3>
                    <p className="text-sm text-neutral-500">This action cannot be undone</p>
                  </div>
                  <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
