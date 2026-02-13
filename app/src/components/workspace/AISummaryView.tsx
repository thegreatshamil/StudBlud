import { useState, useRef } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Type, 
  Sparkles, 
  Loader2, 
  Copy, 
  Save, 
  BookOpen,
  HelpCircle,
  Send,
  Lightbulb,
  Upload,
  X
} from 'lucide-react';
import { generateId } from '@/data/mock';
import { generateSummary, answerDoubt } from '@/services/gemini';

interface SummaryResult {
  summary: string;
  keyPoints: string[];
}

interface DoubtQa {
  id: string;
  question: string;
  answer: string;
}

export function AISummaryView() {
  const { state } = useStore();
  const { currentWorkspace } = state;
  
  const [activeTab, setActiveTab] = useState('topic');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtHistory, setDoubtHistory] = useState<DoubtQa[]>([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateSummary = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    
    // Call Gemini API
    const summaryResult = await generateSummary(topic);
    
    setResult(summaryResult);
    setIsGenerating(false);
  };

  const handleAskDoubt = async () => {
    if (!doubtQuestion.trim()) return;
    
    setIsAnswering(true);
    
    // Call Gemini API
    const answer = await answerDoubt(topic || 'this topic', doubtQuestion);
    
    const newQa: DoubtQa = {
      id: generateId('qa'),
      question: doubtQuestion,
      answer: answer,
    };
    
    setDoubtHistory([...doubtHistory, newQa]);
    setDoubtQuestion('');
    setIsAnswering(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const saveToFlashcards = () => {
    // TODO: Implement save to flashcards
    alert('Saved to flashcards!');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) return;
    
    setIsGenerating(true);
    
    // Read file content and generate summary based on filename
    // In a real app, you'd extract text from the PDF
    const fileTopic = uploadedFile.name.replace(/\.pdf$/i, '');
    const summaryResult = await generateSummary(fileTopic);
    
    setResult(summaryResult);
    setIsGenerating(false);
    setUploadedFile(null);
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#DE3163]/10 via-[#AFE1AF]/10 to-[#9FE2BF]/10 border-b border-neutral-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#DE3163] to-[#9FE2BF] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">AI Summary Generator</h2>
              <p className="text-sm text-neutral-500">
                Powered by {currentWorkspace?.aiConfig.name || 'StudBlud'}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/50">
              <TabsTrigger value="topic" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Type className="w-4 h-4 mr-2" />
                Type Topic
              </TabsTrigger>
              <TabsTrigger value="pdf" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Upload PDF
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Section */}
          {!result && (
            <Card className="p-6 border border-neutral-200">
              {activeTab === 'topic' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Enter a topic to summarize
                    </label>
                    <Input
                      placeholder="e.g., Photosynthesis, Newton's Laws, World War II..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="text-lg border-neutral-200"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={!topic.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-[#DE3163] to-[#9FE2BF] text-white hover:opacity-90 py-6"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating summary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!uploadedFile ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`text-center py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        isDragging 
                          ? 'border-black bg-neutral-50' 
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2">Upload PDF</h3>
                      <p className="text-neutral-500 mb-4">Drag and drop your PDF here, or click to browse</p>
                      <Button variant="outline" className="border-neutral-300" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        Choose File
                      </Button>
                      <p className="text-xs text-neutral-400 mt-4">Maximum file size: 10MB</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-black truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-neutral-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          onClick={clearUploadedFile}
                          className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5 text-neutral-500" />
                        </button>
                      </div>
                      <Button
                        onClick={handleFileUpload}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-[#DE3163] to-[#9FE2BF] text-white hover:opacity-90 py-6"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing PDF...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Summary from PDF
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Results Section */}
          {result && (
            <>
              <Card className="p-6 border border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#DE3163]" />
                    <h3 className="font-semibold">Summary</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.summary)}
                      className="border-neutral-300"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveToFlashcards}
                      className="border-neutral-300"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save to Flashcards
                    </Button>
                  </div>
                </div>
                
                <div className="prose prose-neutral max-w-none">
                  <div className="whitespace-pre-wrap text-neutral-700">
                    {result.summary}
                  </div>
                </div>

                {result.keyPoints.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#DE3163]" />
                      Key Points to Remember
                    </h4>
                    <ul className="space-y-2">
                      {result.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-600">
                          <span className="w-5 h-5 rounded-full bg-[#DE3163] text-white flex items-center justify-center text-xs font-medium shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

              {/* Doubt Solving Section */}
              <Card className="p-6 border border-neutral-200">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-[#DE3163]" />
                  <h3 className="font-semibold">Doubt Solving</h3>
                </div>
                <p className="text-sm text-neutral-500 mb-4">
                  Ask questions about this topic and get AI-powered answers
                </p>

                {/* Q&A History */}
                {doubtHistory.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {doubtHistory.map((qa) => (
                      <div key={qa.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-100">
                        <p className="font-medium text-black mb-2">Q: {qa.question}</p>
                        <p className="text-sm text-neutral-600 whitespace-pre-wrap">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Question Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about this topic..."
                    value={doubtQuestion}
                    onChange={(e) => setDoubtQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskDoubt()}
                    className="border-neutral-200"
                  />
                  <Button
                    onClick={handleAskDoubt}
                    disabled={!doubtQuestion.trim() || isAnswering}
                    className="bg-black text-white hover:bg-neutral-800"
                  >
                    {isAnswering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>

              {/* Generate Another */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setTopic('');
                    setDoubtHistory([]);
                  }}
                  className="border-neutral-300"
                >
                  Generate Another Summary
                </Button>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
