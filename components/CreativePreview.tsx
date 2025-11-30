
import React, { forwardRef } from 'react';
import { SceneData, AdFormat, FONTS } from '../types';

interface CreativePreviewProps {
  format: AdFormat;
  data: SceneData;
  scale?: number;
}

const CreativePreview = forwardRef<HTMLDivElement, CreativePreviewProps>(({ format, data, scale = 1 }, ref) => {
  const preset = FONTS.find(f => f.id === data.fontPresetId) || FONTS[0];

  // Logic to calculate responsive spacing based on format height/width
  const baseScale = format.width / 1080;

  // Occupancy mapping
  const widthPercentage = 30 + (data.layout.textOccupancy - 1) * (60 / 9); 
  const maxTextWidth = `${widthPercentage}%`;

  // Determine active image source
  const activeImage = data.imageSourceType === 'generated' ? data.generatedImage : data.uploadedImage;

  // Alignment logic
  const justifyClass = 
    data.layout.verticalAlign === 'start' ? 'justify-start pt-[120px]' :
    data.layout.verticalAlign === 'end' ? 'justify-end pb-[120px]' :
    'justify-center';

  const itemsAlignClass = 
    data.layout.textAlign === 'left' ? 'items-start text-left' :
    data.layout.textAlign === 'right' ? 'items-end text-right' :
    'items-center text-center';

  // Vertical Shift Logic
  // If format is Story, we use the specific storyOffset. 
  // If format is anything else, we use the global verticalOffset.
  const isStory = format.type === 'story';
  const yOffsetValue = isStory ? data.layout.storyOffset : data.layout.verticalOffset;

  // Logo Positioning
  const logoPosClass = {
    'top-left': 'top-12 left-12',
    'top-right': 'top-12 right-12',
    'bottom-left': 'bottom-12 left-12',
    'bottom-right': 'bottom-12 right-12',
  }[data.layout.logoPosition];

  return (
    <div 
      ref={ref}
      style={{
        width: format.width,
        height: format.height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        overflow: 'hidden',
        backgroundColor: '#111827'
      }}
      className="relative flex flex-col shrink-0 select-none"
    >
      {/* Background Image Layer with Zoom/Pan/Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {activeImage ? (
          <img 
            src={activeImage} 
            alt="Ad Background" 
            className="w-full h-full object-cover origin-center transition-all duration-300 ease-out"
            style={{
              transform: `scale(${data.imageScale}) translate(${data.imageX}px, ${data.imageY}px)`,
              filter: `blur(${data.layout.backgroundBlur}px)`
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gray-800">
             <div className="text-6xl mb-4">🎨</div>
          </div>
        )}
        
        {/* Solid Color Overlay */}
        {data.layout.showOverlay && (
          <div 
            className="absolute inset-0 transition-colors duration-300" 
            style={{ 
              backgroundColor: data.layout.overlayColor,
              opacity: data.layout.overlayOpacity / 100 
            }}
          />
        )}
        
        {/* Subtle Gradient (Always on for legibility unless fully covered, helps with depth) */}
        {!data.layout.showOverlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
        )}
      </div>

      {/* Logo Layer */}
      {data.layout.showLogo && (
        <div className={`absolute z-20 ${logoPosClass}`}>
           {data.logoUrl ? (
             <img 
              src={data.logoUrl} 
              alt="Logo" 
              style={{ height: `${data.layout.logoSize * 12 * baseScale}px` }} 
              className="object-contain drop-shadow-lg"
             />
           ) : (
             <div 
              style={{ 
                height: `${data.layout.logoSize * 10 * baseScale}px`,
                width: `${data.layout.logoSize * 10 * baseScale}px`
              }}
              className="bg-white rounded-full flex items-center justify-center text-black font-bold text-[10px] shadow-lg"
             >
               LOGO
             </div>
           )}
        </div>
      )}

      {/* Content Layer */}
      <div className={`absolute inset-0 z-10 flex flex-col px-12 ${justifyClass} ${itemsAlignClass}`}>
        
        <div 
            className="flex flex-col transition-all duration-300 ease-out"
            style={{ 
              width: maxTextWidth,
              fontSize: `${baseScale * 10}px`,
              gap: `${data.layout.textGap}em`,
              transform: `translateY(${yOffsetValue}%)`
            }}
        >
          {/* Subtitle */}
          {data.subtitle.visible && (
            <h3 
              style={{ 
                fontFamily: preset.subFont,
                fontSize: `${data.subtitle.size * 0.25}em`,
                lineHeight: 1.2,
                color: data.subtitle.color
              }}
              className="tracking-[0.15em] uppercase font-medium drop-shadow-md"
            >
              {data.subtitle.content}
            </h3>
          )}

          {/* Title */}
          {data.title.visible && (
            <h1 
              style={{ 
                fontFamily: preset.titleFont,
                fontSize: `${data.title.size * 0.6}em`,
                lineHeight: 1.05,
                color: data.title.color
              }}
              className="font-bold drop-shadow-xl"
            >
              {data.title.content}
            </h1>
          )}

          {/* Body */}
          {data.body.visible && (
            <p 
              style={{ 
                fontFamily: preset.bodyFont,
                fontSize: `${data.body.size * 0.18}em`,
                color: data.body.color
              }}
              className="leading-relaxed font-light drop-shadow-md"
            >
              {data.body.content}
            </p>
          )}

          {/* CTA */}
          {data.cta.visible && (
            <div className={`mt-2 ${data.layout.textAlign === 'center' ? 'mx-auto' : ''}`}>
              <button 
                style={{ 
                  fontFamily: preset.bodyFont,
                  fontSize: `${data.cta.size * 0.18}em`,
                  padding: '0.8em 2em',
                  backgroundColor: data.cta.color,
                  // Simple text contrast logic (not perfect but functional for MVP)
                  color: '#000000' 
                }}
                className="rounded-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-xl"
              >
                {data.cta.content}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
});

export default CreativePreview;
