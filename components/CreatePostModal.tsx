
import React, { useState, useRef } from 'react';
import { Icon } from './Icon';
import { generateCaptionFromImage, analyzePostVibe, generatePostImage } from '../services/geminiService';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: (postData: { imageUrl: string; caption: string; vibe: string }) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPostCreated }) => {
  const [step, setStep] = useState<'upload' | 'refine'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [vibe, setVibe] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setStep('refine');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsProcessing(true);
    const generatedUrl = await generatePostImage(aiPrompt);
    if (generatedUrl) {
      setSelectedImage(generatedUrl);
      setStep('refine');
    } else {
      alert("Failed to generate image. Please try a different prompt.");
    }
    setIsProcessing(false);
  };

  const handleAiRefine = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    const [newCaption, newVibe] = await Promise.all([
      generateCaptionFromImage(selectedImage),
      analyzePostVibe(selectedImage)
    ]);
    setCaption(newCaption);
    setVibe(newVibe);
    setIsProcessing(false);
  };

  const handleSubmit = () => {
    if (selectedImage && caption) {
      onPostCreated({ imageUrl: selectedImage, caption, vibe });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="glass w-full max-w-2xl rounded-3xl overflow-hidden relative shadow-2xl border border-slate-700">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold">New Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full">
            <Icon name="plus" className="rotate-45" size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 'upload' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manual Upload */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon name="camera" className="text-violet-500" size={32} />
                </div>
                <div className="text-center">
                  <p className="font-bold">Upload from device</p>
                  <p className="text-xs text-slate-500 mt-1">Select a photo or video</p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>

              {/* AI Generation */}
              <div className="border-2 border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-slate-900/30">
                <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Icon name="sparkles" className="text-violet-400" size={32} />
                </div>
                <div className="w-full">
                  <p className="font-bold text-center">AI Vision Synthesis</p>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you see in your mind..."
                    className="w-full bg-slate-900 mt-4 p-3 rounded-xl border border-slate-700 text-sm focus:border-violet-500 outline-none resize-none h-24"
                  />
                  <button
                    onClick={handleAiGenerate}
                    disabled={isProcessing || !aiPrompt.trim()}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-xl mt-3 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Synthesizing...' : 'Generate Vision'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <img src={selectedImage!} alt="Selected" className="w-full aspect-square object-cover rounded-2xl border border-slate-800" />
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Caption</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full bg-slate-900 p-3 rounded-xl border border-slate-700 text-sm focus:border-violet-500 outline-none resize-none h-32 mt-1"
                  />
                  <button 
                    onClick={handleAiRefine}
                    disabled={isProcessing}
                    className="flex items-center gap-2 text-violet-400 text-xs font-bold mt-2 hover:text-violet-300 transition-colors"
                  >
                    <Icon name="sparkles" size={14} />
                    {isProcessing ? 'Analyzing...' : 'Let AI write caption & vibe'}
                  </button>
                </div>

                {vibe && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vision Vibe</label>
                    <div className="mt-1 glass px-3 py-2 rounded-xl border border-violet-500/20 text-violet-300 text-sm inline-block">
                      {vibe}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 flex gap-3">
                  <button 
                    onClick={() => setStep('upload')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="flex-[2] bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-bold transition-colors"
                  >
                    Share Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
