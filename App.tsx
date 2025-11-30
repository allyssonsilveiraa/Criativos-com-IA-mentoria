
import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { 
  SceneData, 
  AD_FORMATS, 
  FONTS, 
} from './types';
import { generateCreativeImage, generateAdCopy } from './services/geminiService';
import CreativePreview from './components/CreativePreview';

// UI Icons
const Icons = {
  Magic: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Layout: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
  Type: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Image: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Upload: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0L8 8m-4 4v12" /></svg>
};

const INITIAL_SCENE: SceneData = {
  name: 'Campanha Black Friday',
  
  imageSourceType: 'generated',
  imagePrompt: 'A sleek, matte black sneaker floating in a void, neon purple lighting, cyber aesthetic, 8k resolution, product photography',
  generatedImage: null,
  uploadedImage: null,
  
  imageScale: 1,
  imageX: 0,
  imageY: 0,

  logoUrl: null,
  title: { content: 'BLACK FRIDAY', size: 50, visible: true, color: '#ffffff' },
  subtitle: { content: 'UP TO 70% OFF', size: 30, visible: true, color: '#e5e7eb' },
  body: { content: 'The sale you have been waiting for is finally here. Limited stock available.', size: 24, visible: true, color: '#d1d5db' },
  cta: { content: 'SHOP NOW', size: 24, visible: true, color: '#ffffff' },
  fontPresetId: 'ui-inter',
  layout: {
    textAlign: 'center',
    verticalAlign: 'center',
    verticalOffset: 0,
    storyOffset: -20, // Start higher for stories
    textOccupancy: 8,
    textGap: 2,
    
    showOverlay: true,
    overlayOpacity: 40,
    overlayColor: '#000000',
    backgroundBlur: 0,
    
    showLogo: true,
    logoSize: 5,
    logoPosition: 'top-right'
  }
};

const App: React.FC = () => {
  const [scene, setScene] = useState<SceneData>(INITIAL_SCENE);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'image'>('design');

  const previewRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleInputChange = (section: keyof SceneData, key: string, value: any) => {
    setScene(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section] as any, [key]: value }
        : value
    }));
  };

  const handleLayoutChange = (key: keyof SceneData['layout'], value: any) => {
    setScene(prev => ({
      ...prev,
      layout: { ...prev.layout, [key]: value }
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScene(prev => ({
          ...prev,
          imageSourceType: 'upload',
          uploadedImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async () => {
    if (!scene.imagePrompt) return;
    setIsGeneratingImg(true);
    try {
      const base64Image = await generateCreativeImage(scene.imagePrompt);
      setScene(prev => ({ 
        ...prev, 
        imageSourceType: 'generated',
        generatedImage: base64Image,
        imageScale: 1, // Reset adjustments on new gen
        imageX: 0,
        imageY: 0
      }));
    } catch (err) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const generateCopy = async () => {
    setIsGeneratingText(true);
    try {
      const copy = await generateAdCopy(scene.imagePrompt || scene.name);
      setScene(prev => ({
        ...prev,
        title: { ...prev.title, content: copy.title },
        subtitle: { ...prev.subtitle, content: copy.subtitle },
        body: { ...prev.body, content: copy.body },
        cta: { ...prev.cta, content: copy.cta },
      }));
    } catch (err) {
      alert("Failed to generate text.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const zip = new JSZip();
    const safeName = (scene.name || 'campaign').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    try {
      const promises = AD_FORMATS.map(async (format) => {
        const el = previewRefs.current[format.id];
        if (el) {
          const dataUrl = await toPng(el, { pixelRatio: 2 });
          const base64Data = dataUrl.split(',')[1];
          const fileName = `${safeName}_${format.width}x${format.height}_${format.filenameSuffix}.png`;
          zip.file(fileName, base64Data, { base64: true });
        }
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      const saveFile = (FileSaver as any).saveAs || FileSaver;
      saveFile(content, `${safeName}_assets.zip`);
      
    } catch (error) {
      console.error("Export failed", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* SIDEBAR - CONTROLS */}
      <div className="w-[440px] flex flex-col border-r border-gray-800 bg-gray-900 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-2xl">✨</span> Meta Creative AI
          </h1>
          <div className="mt-4">
             <input 
                type="text" 
                value={scene.name}
                onChange={(e) => setScene({...scene, name: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Campaign Name"
             />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-2 pt-2 bg-gray-900 border-b border-gray-800">
          {[
            { id: 'design', label: 'Design & FX', icon: Icons.Layout },
            { id: 'content', label: 'Content', icon: Icons.Edit },
            { id: 'image', label: 'Image', icon: Icons.Image },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 pb-3 pt-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'border-blue-500 text-blue-400 bg-gray-800/50 rounded-t' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Panel Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* === DESIGN TAB === */}
          {activeTab === 'design' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              
              {/* Layout Controls */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Icons.Layout /> Layout & Spacing
                </h3>
                
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-5">
                  
                  {/* Text Occupancy */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-300">Content Width</span>
                      <span className="text-blue-400">{scene.layout.textOccupancy}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" step="1"
                      value={scene.layout.textOccupancy}
                      onChange={(e) => handleLayoutChange('textOccupancy', Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Text Gap */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-300">Gap Between Texts</span>
                      <span className="text-blue-400">{scene.layout.textGap}</span>
                    </div>
                    <input 
                      type="range" min="0" max="8" step="0.2"
                      value={scene.layout.textGap}
                      onChange={(e) => handleLayoutChange('textGap', Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Global Vertical Shift */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-300">Global Vertical Shift</span>
                      <span className="text-blue-400">{scene.layout.verticalOffset}</span>
                    </div>
                    <input 
                      type="range" min="-100" max="100" step="1"
                      value={scene.layout.verticalOffset}
                      onChange={(e) => handleLayoutChange('verticalOffset', Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Story Specific Offset */}
                  <div className="bg-blue-900/20 p-3 rounded border border-blue-500/20">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-blue-200 font-bold">Story Specific Shift</span>
                      <span className="text-blue-400">{scene.layout.storyOffset}</span>
                    </div>
                    <input 
                      type="range" min="-100" max="100" step="1"
                      value={scene.layout.storyOffset}
                      onChange={(e) => handleLayoutChange('storyOffset', Number(e.target.value))}
                      className="w-full h-1.5 bg-blue-900 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                    <div className="text-[9px] text-blue-300/60 mt-2">
                      *Adjusts height only for the 1080x1920 format
                    </div>
                  </div>

                  {/* Alignment Matrix */}
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase block mb-2">Base Alignment</label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Vertical */}
                      <div className="flex bg-gray-700 rounded p-1">
                        {['start', 'center', 'end'].map((align) => (
                          <button
                            key={align}
                            onClick={() => handleLayoutChange('verticalAlign', align)}
                            className={`flex-1 py-1 rounded text-[10px] uppercase font-bold transition-colors ${
                              scene.layout.verticalAlign === align ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                             {align === 'start' ? 'Top' : align === 'end' ? 'Btm' : 'Mid'}
                          </button>
                        ))}
                      </div>
                      {/* Horizontal */}
                      <div className="flex bg-gray-700 rounded p-1">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            onClick={() => handleLayoutChange('textAlign', align)}
                            className={`flex-1 py-1 rounded text-[10px] uppercase font-bold transition-colors ${
                              scene.layout.textAlign === align ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            {align.charAt(0)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Background FX */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Icons.Magic /> Background FX
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-5">
                   {/* Blur */}
                   <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-300">Background Blur</span>
                      <span className="text-blue-400">{scene.layout.backgroundBlur}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="20" step="1"
                      value={scene.layout.backgroundBlur}
                      onChange={(e) => handleLayoutChange('backgroundBlur', Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                  
                  {/* Overlay Controls */}
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-300">Solid Overlay</span>
                      <input 
                        type="checkbox"
                        checked={scene.layout.showOverlay}
                        onChange={(e) => handleLayoutChange('showOverlay', e.target.checked)}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600"
                      />
                    </div>
                    
                    {scene.layout.showOverlay && (
                      <div className="flex gap-2 items-center animate-in fade-in">
                         <input 
                           type="color" 
                           value={scene.layout.overlayColor}
                           onChange={(e) => handleLayoutChange('overlayColor', e.target.value)}
                           className="h-8 w-12 rounded bg-transparent cursor-pointer border-none"
                         />
                         <input 
                          type="range" min="0" max="100" step="1"
                          value={scene.layout.overlayOpacity}
                          onChange={(e) => handleLayoutChange('overlayOpacity', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-[10px] w-6 text-right">{scene.layout.overlayOpacity}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Presets */}
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Icons.Type /> Typography Presets
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map(font => (
                    <button
                      key={font.id}
                      onClick={() => setScene({ ...scene, fontPresetId: font.id })}
                      className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden group ${
                        scene.fontPresetId === font.id 
                          ? 'bg-blue-900/20 border-blue-500' 
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-sm font-bold truncate z-10 relative" style={{ fontFamily: font.titleFont }}>{font.name}</div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider z-10 relative">{font.category}</div>
                    </button>
                  ))}
                </div>
              </section>

               {/* Logo Controls */}
               <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand Logo</h3>
                  <div className="relative inline-block w-8 h-4 rounded-full cursor-pointer">
                    <input 
                      id="logo-switch" 
                      type="checkbox" 
                      className="peer appearance-none w-8 h-4 bg-gray-700 rounded-full checked:bg-blue-600 cursor-pointer transition-colors duration-300"
                      checked={scene.layout.showLogo}
                      onChange={(e) => handleLayoutChange('showLogo', e.target.checked)}
                    />
                    <label htmlFor="logo-switch" className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4 cursor-pointer"></label>
                  </div>
                </div>

                {scene.layout.showLogo && (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
                     <div>
                       <label className="block text-[10px] text-gray-400 uppercase mb-2">Logo Size</label>
                        <input 
                          type="range" min="1" max="10" 
                          value={scene.layout.logoSize}
                          onChange={(e) => handleLayoutChange('logoSize', Number(e.target.value))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                     </div>
                  </div>
                )}
               </section>
            </div>
          )}

          {/* === CONTENT TAB === */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <button 
                 onClick={generateCopy}
                 disabled={isGeneratingText}
                 className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 rounded-lg text-sm font-bold shadow-lg transition-all group"
              >
                <Icons.Magic />
                {isGeneratingText ? 'Generating...' : 'AI Generate Copy'}
              </button>

              <div className="space-y-4">
                {[
                  { label: 'Main Headline', key: 'title', max: 100 },
                  { label: 'Subtitle', key: 'subtitle', max: 80 },
                  { label: 'Body Text', key: 'body', max: 60 },
                  { label: 'CTA Button', key: 'cta', max: 60 }
                ].map((field) => (
                  <div key={field.key} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">{field.label}</span>
                      <div className="flex items-center gap-3">
                        <input 
                          type="color"
                          title="Text Color"
                          value={(scene[field.key as keyof SceneData] as any).color}
                          onChange={(e) => handleInputChange(field.key as keyof SceneData, 'color', e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                        />
                        <input 
                           type="checkbox"
                           checked={(scene[field.key as keyof SceneData] as any).visible}
                           onChange={(e) => handleInputChange(field.key as keyof SceneData, 'visible', e.target.checked)}
                           className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-offset-gray-800"
                         />
                      </div>
                    </div>
                    
                    <textarea 
                      rows={field.key === 'body' ? 3 : 2}
                      value={(scene[field.key as keyof SceneData] as any).content}
                      onChange={(e) => handleInputChange(field.key as keyof SceneData, 'content', e.target.value)}
                      className={`w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm focus:border-blue-500 focus:outline-none mb-4 transition-opacity ${
                        !(scene[field.key as keyof SceneData] as any).visible ? 'opacity-50' : ''
                      }`}
                    />
                    
                    <div className={!(scene[field.key as keyof SceneData] as any).visible ? 'opacity-50 pointer-events-none' : ''}>
                      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>SIZE</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" max={field.max}
                        value={(scene[field.key as keyof SceneData] as any).size}
                        onChange={(e) => handleInputChange(field.key as keyof SceneData, 'size', Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === IMAGE TAB === */}
          {activeTab === 'image' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              
              {/* Source Selector */}
              <div className="bg-gray-800 p-1 rounded-lg flex gap-1">
                 <button 
                  onClick={() => setScene({...scene, imageSourceType: 'generated'})}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all ${
                    scene.imageSourceType === 'generated' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                 >
                   Gemini AI
                 </button>
                 <button 
                  onClick={() => setScene({...scene, imageSourceType: 'upload'})}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-all ${
                    scene.imageSourceType === 'upload' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                 >
                   Upload
                 </button>
              </div>

              {/* AI Controls */}
              {scene.imageSourceType === 'generated' && (
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-3 flex justify-between">
                    <span>Image Prompt</span>
                    <span className="text-emerald-500 text-[10px]">NanoBanana</span>
                  </label>
                  <textarea 
                    rows={6}
                    value={scene.imagePrompt}
                    onChange={(e) => setScene({...scene, imagePrompt: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none mb-4 leading-relaxed text-gray-200"
                    placeholder="Describe your scene in detail..."
                  />
                  <button 
                    onClick={generateImage}
                    disabled={isGeneratingImg || !scene.imagePrompt}
                    className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isGeneratingImg 
                        ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white hover:shadow-emerald-500/20'
                    }`}
                  >
                    {isGeneratingImg ? 'Generating...' : <><Icons.Image /> Generate with AI</>}
                  </button>
                </div>
              )}

              {/* Upload Controls */}
              {scene.imageSourceType === 'upload' && (
                 <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-4">
                    <label className="block w-full cursor-pointer bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
                       <Icons.Upload />
                       <span className="block mt-2 text-xs text-gray-400">Click to upload image</span>
                       <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                    {scene.uploadedImage && (
                       <div className="text-center text-xs text-green-400">Image Loaded!</div>
                    )}
                 </div>
              )}

              {/* Adjustments (Visible for both types if image exists) */}
              {(scene.generatedImage || scene.uploadedImage) && (
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Position & Scale</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>ZOOM</span>
                        <span>{scene.imageScale.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" min="1" max="3" step="0.1"
                        value={scene.imageScale}
                        onChange={(e) => setScene({...scene, imageScale: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>PAN X</span>
                        <span>{scene.imageX}px</span>
                      </div>
                      <input 
                        type="range" min="-400" max="400" step="10"
                        value={scene.imageX}
                        onChange={(e) => setScene({...scene, imageX: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>PAN Y</span>
                        <span>{scene.imageY}px</span>
                      </div>
                      <input 
                        type="range" min="-400" max="400" step="10"
                        value={scene.imageY}
                        onChange={(e) => setScene({...scene, imageY: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-white text-gray-900 hover:bg-gray-200 py-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isExporting ? (
              <span className="animate-pulse">Packaging...</span>
            ) : (
              <><Icons.Download /> Download All Formats</>
            )}
          </button>
        </div>
      </div>

      {/* MAIN PREVIEW AREA */}
      <div className="flex-1 bg-gray-950 overflow-y-auto overflow-x-hidden relative">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed"></div>
         
         <div className="p-12 min-h-full flex flex-col items-center">
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-light text-gray-400 tracking-[0.2em] uppercase">Live Preview</h2>
              <div className="h-1 w-12 bg-blue-500 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 w-full max-w-[1400px]">
              
              {AD_FORMATS.map((format) => (
                <div key={format.id} className="flex flex-col items-center group">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-500/20 tracking-wider">
                      {format.width} x {format.height}
                    </span>
                    <span className="text-sm font-medium text-gray-300">{format.label}</span>
                  </div>
                  
                  {/* Container for Preview with Scale Transform */}
                  <div 
                    className="relative bg-gray-900 border border-gray-800 shadow-2xl rounded-sm overflow-hidden transition-all duration-500 group-hover:border-gray-600 group-hover:shadow-blue-900/10"
                    style={{
                      width: format.type === 'story' ? 270 : format.type === 'landscape' ? 400 : 320,
                      height: format.type === 'story' ? 480 : format.type === 'landscape' ? 209 : 320,
                    }}
                  >
                    <div className="absolute top-0 left-0 origin-top-left">
                       <CreativePreview 
                          ref={(el) => (previewRefs.current[format.id] = el)}
                          format={format}
                          data={scene}
                          scale={
                             format.type === 'story' ? 270 / 1080 :
                             format.type === 'landscape' ? 400 / 1200 :
                             320 / 1080
                          }
                       />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-20"></div>
         </div>
      </div>
    </div>
  );
};

export default App;
