// Assistant.tsx
// Ce composant est le cœur de l'application de chat mathématique pour enfants.
// Il gère l'interface utilisateur, la reconnaissance vocale, la synthèse vocale,
// et la communication avec l'API Mistral.

import React, { useState, useRef, useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Mic, MicOff, Send, Volume2, VolumeX, ChevronRight, ChevronLeft } from 'lucide-react';

// Clé API pour le service Mistral AI
const MISTRAL_API_KEY = 'brNz25J6etEr4sQszhk8quLT9SlvRqTt';

// Interface définissant la structure d'un message dans le chat
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  explanation?: string;
}

function Assistant() {
  // États pour gérer l'interface utilisateur
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // État initial du chat avec message de bienvenue
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      type: 'bot',
      content: "Bonjour ! Je suis MathBot, ton assistant en mathématiques. Comment puis-je t'aider aujourd'hui ?",
    },
  ]);
  
  // État pour l'explication sélectionnée
  const [selectedExplanation, setSelectedExplanation] = useState<string | null>(null);
  
  // Références pour la reconnaissance vocale et le conteneur de chat
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Effet pour faire défiler automatiquement vers le bas lors de nouveaux messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Gestion de la reconnaissance vocale
  const handleVoiceInput = () => {
    if (!isListening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'fr-FR';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setUserInput(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.start();
        setIsListening(true);
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    }
  };

  // Gestion de la synthèse vocale
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Gestion de l'envoi des messages et communication avec l'API Mistral
  const handleSubmit = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-tiny",
          messages: [
            {
              role: "system",
              content: "Tu es un assistant mathématique amical pour les enfants autistes de 8 ans. Explique les concepts mathématiques de manière très simple, visuelle et concrète. Utilise des exemples de la vie quotidienne. Décompose chaque problème en très petites étapes faciles à comprendre. Évite les métaphores complexes. Sois patient, encourageant et rassurant. Structure tes explications de manière claire et prévisible."
            },
            {
              role: "user",
              content: userInput
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec Mistral');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      const parts = aiResponse.split('\n\n');
      const directResponse = parts[0];
      const detailedExplanation = parts.slice(1).join('\n\n');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: directResponse,
        explanation: detailedExplanation,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: "Désolé, j'ai rencontré une erreur. Peux-tu réessayer ?",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'ouverture du panneau d'explication
  const handleExplanationClick = (explanation: string) => {
    setSelectedExplanation(explanation);
    setIsPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-purple-500 relative overflow-hidden">
      {/* Robot en arrière-plan */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=1200&fit=crop"
          alt="Robot background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Conteneur principal avec animation de transition */}
      <div 
        className={`relative transition-all duration-300 ease-in-out transform ${
          isPanelOpen ? 'translate-x-[-15%]' : 'translate-x-0'
        }`}
      >
        <div className="max-w-4xl mx-auto p-8">
          {/* Section de chat */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col h-[80vh]">
              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-4 p-6"
              >
                {messages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    <div 
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                          message.type === 'user' 
                            ? 'bg-purple-500 text-white ml-4' 
                            : 'bg-white border-2 border-purple-100 mr-4'
                        }`}
                      >
                        {message.type === 'bot' ? (
                          <TypeAnimation
                            sequence={[message.content]}
                            wrapper="p"
                            speed={50}
                            cursor={false}
                          />
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                    </div>
                    {message.type === 'bot' && message.explanation && (
                      <button
                        onClick={() => handleExplanationClick(message.explanation!)}
                        className="self-start mt-2 text-sm text-purple-600 hover:text-purple-800 underline ml-4"
                      >
                        Voir l'explication
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Section de saisie */}
              <div className="p-4 border-t border-purple-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Pose ta question ici..."
                    className="flex-1 p-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none shadow-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <button
                    onClick={handleVoiceInput}
                    className={`p-4 rounded-xl ${
                      isListening ? 'bg-red-500' : 'bg-purple-500'
                    } text-white hover:opacity-90 transition-opacity shadow-sm`}
                    disabled={isLoading}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className={`p-4 rounded-xl bg-yellow-400 text-gray-800 hover:bg-yellow-500 transition-colors shadow-sm ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading}
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau d'explication coulissant */}
      <div 
        className={`fixed top-0 right-0 h-full w-[30%] bg-white/95 backdrop-blur-sm shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsPanelOpen(false)}
          className="absolute left-0 top-1/2 -translate-x-full bg-white/95 p-2 rounded-l-lg shadow-lg"
        >
          <ChevronRight className="w-6 h-6 text-purple-600" />
        </button>
        
        {selectedExplanation && (
          <div className="h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-purple-800">Explications</h3>
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakText(selectedExplanation)}
                className={`p-3 rounded-lg ${
                  isSpeaking ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
                } hover:opacity-80 transition-opacity`}
              >
                {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </div>
            <div className="prose prose-purple max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 bg-white p-6 rounded-xl border border-purple-100 shadow-inner">
                {selectedExplanation}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Assistant;