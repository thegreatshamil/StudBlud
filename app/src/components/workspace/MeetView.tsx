import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Video, Link2, ExternalLink, Clock, Users, Copy, Check } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  attendees: number;
  link?: string;
}

export function MeetView() {
  const [meetingLink, setMeetingLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [recentMeetings] = useState<Meeting[]>([]);

  const handleJoinMeeting = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const createMeeting = (service: 'zoom' | 'google' | 'jitsi') => {
    const links: Record<string, string> = {
      zoom: 'https://zoom.us/start/videomeeting',
      google: 'https://meet.google.com/new',
      jitsi: 'https://meet.jit.si/',
    };
    window.open(links[service], '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Video className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Meeting Room</h2>
              <p className="text-sm text-gray-500">Join or create video meetings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Card */}
          <Card className="p-6 border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-gray-600">No active meeting</span>
            </div>

            {/* Join via Link */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Join with a meeting link
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Paste meeting link (Zoom, Google Meet, etc.)"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>
                <Button
                  onClick={handleJoinMeeting}
                  disabled={!meetingLink}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Create Meeting */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Create a new meeting
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => createMeeting('zoom')}
                  className="justify-center border-gray-300 hover:bg-gray-50"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Zoom
                </Button>
                <Button
                  variant="outline"
                  onClick={() => createMeeting('google')}
                  className="justify-center border-gray-300 hover:bg-gray-50"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Google Meet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => createMeeting('jitsi')}
                  className="justify-center border-gray-300 hover:bg-gray-50"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Jitsi
                </Button>
              </div>
            </div>
          </Card>

          {/* Meeting History */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Meeting History</h3>
            <div className="space-y-3">
              {recentMeetings.map((meeting) => (
                <Card key={meeting.id} className="p-4 border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          {meeting.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.attendees} attendees
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {meeting.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(meeting.link!)}
                          className="border-gray-300"
                        >
                          {linkCopied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => meeting.link && window.open(meeting.link, '_blank')}
                        className="border-gray-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {recentMeetings.length === 0 && (
                <Card className="p-8 text-center border-gray-200 border-dashed">
                  <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No meeting history yet</p>
                  <p className="text-sm text-gray-400 mt-1">Your past meetings will appear here</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
