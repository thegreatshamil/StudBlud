import { useState } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Layers, 
  Plus, 
  BookOpen, 
  Play, 
  Edit2, 
  Trash2, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2
} from 'lucide-react';
import type { FlashcardDeck, Flashcard } from '@/types';
import { generateId } from '@/data/mock';
import { generateFlashcards } from '@/services/gemini';

export function FlashcardsView() {
  const { state, dispatch } = useStore();
  const { currentWorkspace, decks } = state;
  const workspaceDecks = currentWorkspace ? decks[currentWorkspace.id] || [] : [];
  
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [showAIGenerateDialog, setShowAIGenerateDialog] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiCardCount, setAiCardCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateDeck = () => {
    if (!newDeckName.trim() || !currentWorkspace) return;

    const newDeck: FlashcardDeck = {
      id: generateId('deck'),
      workspaceId: currentWorkspace.id,
      name: newDeckName,
      description: newDeckDescription,
      cards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_DECK', payload: { workspaceId: currentWorkspace.id, deck: newDeck } });
    setNewDeckName('');
    setNewDeckDescription('');
    setShowCreateDialog(false);
    setSelectedDeck(newDeck);
  };

  const handleAddCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim() || !selectedDeck || !currentWorkspace) return;

    const newCard: Flashcard = {
      id: generateId('card'),
      front: newCardFront,
      back: newCardBack,
    };

    const updatedDeck: FlashcardDeck = {
      ...selectedDeck,
      cards: [...selectedDeck.cards, newCard],
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_DECK', payload: { workspaceId: currentWorkspace.id, deck: updatedDeck } });
    setNewCardFront('');
    setNewCardBack('');
    setShowAddCardDialog(false);
    setSelectedDeck(updatedDeck);
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim() || !selectedDeck || !currentWorkspace) return;

    setIsGenerating(true);

    // Call Gemini API
    const generatedCards = await generateFlashcards(aiTopic, aiCardCount);

    const newCards: Flashcard[] = generatedCards.map(card => ({
      id: generateId('card'),
      front: card.front,
      back: card.back,
    }));

    const updatedDeck: FlashcardDeck = {
      ...selectedDeck,
      cards: [...selectedDeck.cards, ...newCards],
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_DECK', payload: { workspaceId: currentWorkspace.id, deck: updatedDeck } });
    setIsGenerating(false);
    setShowAIGenerateDialog(false);
    setAiTopic('');
    setSelectedDeck(updatedDeck);
  };

  const handleDeleteCard = (cardId: string) => {
    if (!selectedDeck || !currentWorkspace) return;

    const updatedDeck: FlashcardDeck = {
      ...selectedDeck,
      cards: selectedDeck.cards.filter(c => c.id !== cardId),
      updatedAt: new Date(),
    };

    dispatch({ type: 'UPDATE_DECK', payload: { workspaceId: currentWorkspace.id, deck: updatedDeck } });
    setSelectedDeck(updatedDeck);
  };

  const startStudyMode = (deck: FlashcardDeck) => {
    if (deck.cards.length === 0) return;
    setSelectedDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyMode(true);
  };

  const nextCard = () => {
    if (selectedDeck && currentCardIndex < selectedDeck.cards.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  if (studyMode && selectedDeck) {
    const currentCard = selectedDeck.cards[currentCardIndex];
    
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Study Mode Header */}
        <div className="bg-white border-b border-neutral-200 p-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Button variant="outline" onClick={() => setStudyMode(false)} className="border-neutral-300">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="text-center">
              <h3 className="font-semibold">{selectedDeck.name}</h3>
              <p className="text-sm text-neutral-500">
                Card {currentCardIndex + 1} of {selectedDeck.cards.length}
              </p>
            </div>
            <div className="w-20" />
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative h-80 cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              <div
                className="absolute inset-0 w-full h-full transition-all duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Card className="h-full flex flex-col items-center justify-center p-8 bg-white border border-neutral-200">
                    <p className="text-sm text-neutral-400 mb-4">Front</p>
                    <p className="text-2xl font-medium text-center text-black">{currentCard.front}</p>
                    <p className="text-sm text-neutral-400 mt-8">Click to flip</p>
                  </Card>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 w-full h-full"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <Card className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#AFE1AF]/20 to-[#9FE2BF]/20 border border-[#AFE1AF]">
                    <p className="text-sm text-[#DE3163] mb-4">Back</p>
                    <p className="text-xl text-center text-black">{currentCard.back}</p>
                  </Card>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="border-neutral-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-neutral-600 border-neutral-300 hover:bg-neutral-100"
                  onClick={nextCard}
                >
                  <X className="w-4 h-4 mr-2" />
                  Need Practice
                </Button>
                <Button
                  className="bg-black text-white hover:bg-neutral-800"
                  onClick={nextCard}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Got It
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={nextCard}
                disabled={currentCardIndex === selectedDeck.cards.length - 1}
                className="border-neutral-300"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#DE3163] to-[#9FE2BF] flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Flashcards</h2>
              <p className="text-sm text-neutral-500">Create and study flashcard decks</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {selectedDeck && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowAIGenerateDialog(true)}
                  className="border-[#DE3163] text-[#DE3163] hover:bg-[#DE3163]/10"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddCardDialog(true)}
                  className="border-neutral-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Card
                </Button>
              </>
            )}
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-black text-white hover:bg-neutral-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Deck
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {selectedDeck ? (
            // Show selected deck details
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedDeck.name}</h3>
                  {selectedDeck.description && (
                    <p className="text-neutral-500">{selectedDeck.description}</p>
                  )}
                  <p className="text-sm text-neutral-400 mt-1">
                    {selectedDeck.cards.length} cards
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDeck(null)}
                    className="border-neutral-300"
                  >
                    Back to Decks
                  </Button>
                  <Button
                    onClick={() => startStudyMode(selectedDeck)}
                    disabled={selectedDeck.cards.length === 0}
                    className="bg-black text-white hover:bg-neutral-800"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Study
                  </Button>
                </div>
              </div>

              {/* Cards List */}
              {selectedDeck.cards.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl">
                  <p className="text-neutral-500 mb-4">No cards in this deck yet</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddCardDialog(true)}
                      className="border-neutral-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Card
                    </Button>
                    <Button
                      onClick={() => setShowAIGenerateDialog(true)}
                      className="bg-gradient-to-r from-[#DE3163] to-[#9FE2BF] text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDeck.cards.map((card) => (
                    <Card key={card.id} className="p-4 border border-neutral-200">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-sm text-neutral-400">Front</p>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-black mb-4">{card.front}</p>
                      <p className="font-medium text-sm text-neutral-400 mb-2">Back</p>
                      <p className="text-neutral-600">{card.back}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Show decks list
            <>
              {workspaceDecks.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">No flashcard decks yet</h3>
                  <p className="text-neutral-500 mb-4">Create your first deck to start studying</p>
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-black text-white hover:bg-neutral-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Deck
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workspaceDecks.map((deck) => (
                    <Card 
                      key={deck.id} 
                      className="p-4 border border-neutral-200 hover:border-black transition-colors cursor-pointer"
                      onClick={() => setSelectedDeck(deck)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-black">{deck.name}</h3>
                          {deck.description && (
                            <p className="text-sm text-neutral-500 mt-1">{deck.description}</p>
                          )}
                          <p className="text-sm text-neutral-400 mt-2">
                            {deck.cards.length} cards
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDeck(deck);
                            }}
                            className="p-2 hover:bg-neutral-100 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4 text-neutral-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          className="flex-1 border-neutral-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            startStudyMode(deck);
                          }}
                          disabled={deck.cards.length === 0}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Study
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Create Deck Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="border border-neutral-200">
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Deck Name
              </label>
              <Input
                placeholder="e.g., Biology Terms"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="border-neutral-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Description (optional)
              </label>
              <Input
                placeholder="What will you study?"
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                className="border-neutral-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-neutral-300">
                Cancel
              </Button>
              <Button
                onClick={handleCreateDeck}
                disabled={!newDeckName.trim()}
                className="bg-black text-white hover:bg-neutral-800"
              >
                Create Deck
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Card Dialog */}
      <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
        <DialogContent className="border border-neutral-200">
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Front (Question/Term)
              </label>
              <Input
                placeholder="Enter the question or term"
                value={newCardFront}
                onChange={(e) => setNewCardFront(e.target.value)}
                className="border-neutral-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Back (Answer/Definition)
              </label>
              <Input
                placeholder="Enter the answer or definition"
                value={newCardBack}
                onChange={(e) => setNewCardBack(e.target.value)}
                className="border-neutral-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddCardDialog(false)} className="border-neutral-300">
                Cancel
              </Button>
              <Button
                onClick={handleAddCard}
                disabled={!newCardFront.trim() || !newCardBack.trim()}
                className="bg-black text-white hover:bg-neutral-800"
              >
                Add Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generate Dialog */}
      <Dialog open={showAIGenerateDialog} onOpenChange={setShowAIGenerateDialog}>
        <DialogContent className="border border-neutral-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#DE3163]" />
              AI Generate Flashcards
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Topic
              </label>
              <Input
                placeholder="e.g., Photosynthesis, World War II, Calculus..."
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="border-neutral-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Number of Cards
              </label>
              <Input
                type="number"
                min={1}
                max={20}
                value={aiCardCount}
                onChange={(e) => setAiCardCount(parseInt(e.target.value) || 10)}
                className="border-neutral-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAIGenerateDialog(false)} className="border-neutral-300">
                Cancel
              </Button>
              <Button
                onClick={handleAIGenerate}
                disabled={!aiTopic.trim() || isGenerating}
                className="bg-gradient-to-r from-[#DE3163] to-[#9FE2BF] text-white hover:opacity-90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
