import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, AtSign, Bot, Copy, MessageSquare, Image, X } from 'lucide-react';
import type { Message } from '@/types';
import { generateId, formatTime } from '@/data/mock';
import { generateAIResponse } from '@/services/gemini';

export function ChatView() {
  const { state, dispatch } = useStore();
  const { currentWorkspace, messages } = state;
  const workspaceMessages = currentWorkspace ? messages[currentWorkspace.id] || [] : [];
  
  const [inputValue, setInputValue] = useState('');
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [workspaceMessages]);

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !attachedImage) || !currentWorkspace) return;

    const newMessage: Message = {
      id: generateId('msg'),
      workspaceId: currentWorkspace.id,
      senderId: state.currentUser?.id || '',
      senderName: state.currentUser?.name || '',
      senderAvatar: state.currentUser?.avatar,
      content: inputValue.trim() || (attachedImage ? 'Sent an image' : ''),
      imageUrl: attachedImage || undefined,
      timestamp: new Date(),
      type: 'user',
    };

    dispatch({ type: 'ADD_MESSAGE', payload: { workspaceId: currentWorkspace.id, message: newMessage } });
    setInputValue('');
    setAttachedImage(null);

    // Check if message mentions AI
    const aiName = currentWorkspace.aiConfig.name || 'StudBlud';
    const mentionPattern = new RegExp(`@${aiName}\\b`, 'i');
    
    if (mentionPattern.test(inputValue) && currentWorkspace.aiConfig.enabled) {
      setIsTyping(true);
      
      // Call Gemini API
      const aiResponseText = await generateAIResponse(
        inputValue.replace(mentionPattern, '').trim(),
        currentWorkspace.aiConfig.personality
      );
      
      const aiResponse: Message = {
        id: generateId('msg'),
        workspaceId: currentWorkspace.id,
        senderId: 'ai',
        senderName: aiName,
        content: aiResponseText,
        timestamp: new Date(),
        type: 'ai',
        isAI: true,
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: { workspaceId: currentWorkspace.id, message: aiResponse } });
      setIsTyping(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAttachedImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const insertMention = (name: string) => {
    const newValue = inputValue + (inputValue.endsWith('@') ? name : '@' + name);
    setInputValue(newValue + ' ');
    setShowMentionPopover(false);
    inputRef.current?.focus();
  };

  const getMessageStyle = (message: Message) => {
    if (message.isAI) {
      return 'bg-gradient-to-r from-[#AFE1AF]/20 to-[#9FE2BF]/20 border-l-4 border-[#DE3163]';
    }
    if (message.senderId === state.currentUser?.id) {
      return 'bg-black text-white ml-auto';
    }
    return 'bg-neutral-100 border border-neutral-200';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {workspaceMessages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">No messages yet</h3>
              <p className="text-neutral-500">
                Start the conversation. Type @{currentWorkspace?.aiConfig.name || 'StudBlud'} to ask the AI.
              </p>
            </div>
          ) : (
            workspaceMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.senderId === state.currentUser?.id ? 'flex-row-reverse' : ''}`}
              >
                {!message.isAI && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                    <AvatarFallback className="bg-black text-white text-xs">{message.senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                
                {message.isAI && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#DE3163] to-[#9FE2BF] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${getMessageStyle(message)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${message.senderId === state.currentUser?.id ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {message.isAI ? (
                        <span className="flex items-center gap-1">
                          <span className="text-[#DE3163]">AI</span>
                          {message.senderName}
                        </span>
                      ) : (
                        message.senderName
                      )}
                    </span>
                    <span className={`text-xs ${message.senderId === state.currentUser?.id ? 'text-neutral-400' : 'text-neutral-400'}`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <p className={`text-sm whitespace-pre-wrap ${message.senderId === state.currentUser?.id ? 'text-white' : 'text-neutral-700'}`}>
                    {message.content}
                  </p>
                  
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Shared image"
                      className="mt-2 max-w-full max-h-48 rounded-lg object-cover"
                    />
                  )}
                  
                  {message.isAI && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#DE3163]/20">
                      <button 
                        onClick={() => navigator.clipboard.writeText(message.content)}
                        className="text-xs text-[#DE3163] hover:text-[#DE3163]/80 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#DE3163] to-[#9FE2BF] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-neutral-100 border border-neutral-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t border-neutral-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="mb-3 p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500">Attached image:</span>
                <button
                  onClick={clearAttachedImage}
                  className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
              <img
                src={attachedImage}
                alt="Attached"
                className="max-h-32 rounded-lg object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
            >
              <Image className="w-5 h-5 text-neutral-500" />
            </button>
            
            <Popover open={showMentionPopover} onOpenChange={setShowMentionPopover}>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
                  <AtSign className="w-5 h-5 text-neutral-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                  {currentWorkspace?.aiConfig.enabled && (
                    <button
                      onClick={() => insertMention(currentWorkspace.aiConfig.name || 'StudBlud')}
                      className="w-full flex items-center gap-2 p-2 hover:bg-[#DE3163]/10 rounded-lg text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#DE3163] to-[#9FE2BF] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{currentWorkspace.aiConfig.name || 'StudBlud'}</p>
                        <p className="text-xs text-neutral-500">AI Assistant</p>
                      </div>
                    </button>
                  )}
                  
                  {currentWorkspace?.members.map((member) => (
                    member.userId !== state.currentUser?.id && (
                      <button
                        key={member.userId}
                        onClick={() => insertMention(member.name)}
                        className="w-full flex items-center gap-2 p-2 hover:bg-neutral-50 rounded-lg text-left"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-black text-white text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-sm">{member.name}</p>
                      </button>
                    )
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <input
              ref={inputRef}
              type="text"
              placeholder={`Type @ to mention ${currentWorkspace?.aiConfig.name || 'StudBlud'} or peers...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() && !attachedImage}
              size="sm"
              className="rounded-full bg-black text-white hover:bg-neutral-800 px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-neutral-400 mt-2 text-center">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
