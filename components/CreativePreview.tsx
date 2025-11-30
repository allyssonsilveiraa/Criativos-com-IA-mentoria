
import React, { forwardRef } from 'react';
import { SceneData, AdFormat, FONTS, CTA_DECORATIONS } from '../types';

interface CreativePreviewProps {
  format: AdFormat;
  data: SceneData;
}

const CreativePreview = forwardRef<HTMLDivElement, CreativePreviewProps>(({ format, data }, ref) => {
  const preset = FONTS.find(f => f.id === data.fontPresetId) || FONTS[0];
  const ctaDecoration = CTA_DECORATIONS.find(d => d.id === data.ctaDecorationId);

  // Logic to calculate responsive spacing based on format height/width
  // Base scale is 1 for 1080px width.
  const baseScale = format.width / 1080;

  // Occupancy mapping
  const widthPercentage = 30 + (data.layout.textOccupancy - 1) * (60 / 9); 
  const maxTextWidth = `${widthPercentage}%`;

  // Determine active image source
  let activeImage = null;
  if (data.imageSourceType === 'generated') {
    activeImage = data.generatedImage;
  } else {
    activeImage = data.uploadedImages && data.uploadedImages.length > 0 
      ? data.uploadedImages[data.activeImageIndex] 
      : null;
  }

  // Alignment logic
  const justifyClass = 
    data.layout.verticalAlign === 'start' ? 'justify-start pt-[120px]' :
    data.layout.verticalAlign === 'end' ? 'justify-end pb-[120px]' :
    'justify-center';

  const itemsAlignClass = 
    data.layout.textAlign === 'left' ? 'items-start text-left' :
    data.layout.textAlign === 'right' ? 'items-end text-right' :
    'items-center text-center';

  // Format Specific Logic (Story vs Rest)
  const isStory = format.type === 'story';
  
  // Vertical Shift for text (Global)
  const yOffsetValue = isStory ? data.layout.storyOffset : data.layout.verticalOffset;

  // Image Transform Logic (Story override vs Standard)
  const imgScale = isStory ? data.storyImageScale : data.imageScale;
  const imgX = isStory ? data.storyImageX : data.imageX;
  const imgY = isStory ? data.storyImageY : data.imageY;

  // Logo Positioning
  const logoPosClass = {
    'top-left': 'top-12 left-12',
    'top-right': 'top-12 right-12',
    'bottom-left': 'bottom-12 left-12',
    'bottom-right': 'bottom-12 right-12',
  }[data.layout.logoPosition];

  // Dynamic Padding based on slider
  const sidePadding = `${data.layout.contentPadding}px`;

  return (
    <div 
      ref={ref}
      style={{
        width: format.width,
        height: format.height,
        overflow: 'hidden',
        backgroundColor: '#111827',
        position: 'relative'
      }}
      className="flex flex-col shrink-0 select-none"
    >
      {/* Background Image Layer with Zoom/Pan/Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {activeImage ? (
          <img 
            src={activeImage} 
            alt="Ad Background" 
            className="w-full h-full object-cover origin-center transition-all duration-300 ease-out"
            style={{
              transform: `scale(${imgScale}) translate(${imgX}px, ${imgY}px)`,
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
        
        {/* Subtle Gradient (Always on for legibility unless fully covered) */}
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
      <div 
        className={`absolute inset-0 z-10 flex flex-col ${justifyClass} ${itemsAlignClass}`}
        style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
      >
        
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
                lineHeight: data.subtitle.lineHeight,
                color: data.subtitle.color,
                letterSpacing: `${data.subtitle.letterSpacing}em`,
                fontWeight: data.subtitle.weight,
                transform: `translateY(${data.subtitle.verticalShift}px)`
              }}
              className="uppercase drop-shadow-md"
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
                lineHeight: data.title.lineHeight,
                color: data.title.color,
                letterSpacing: `${data.title.letterSpacing}em`,
                fontWeight: data.title.weight,
                transform: `translateY(${data.title.verticalShift}px)`
              }}
              className="drop-shadow-xl"
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
                lineHeight: data.body.lineHeight,
                color: data.body.color,
                letterSpacing: `${data.body.letterSpacing}em`,
                fontWeight: data.body.weight,
                transform: `translateY(${data.body.verticalShift}px)`
              }}
              className="drop-shadow-md"
            >
              {data.body.content}
            </p>
          )}

          {/* CTA Group */}
          {data.cta.visible && (
            <div 
              className={`mt-2 flex flex-col ${data.layout.textAlign === 'center' ? 'items-center' : data.layout.textAlign === 'right' ? 'items-end' : 'items-start'}`}
              style={{
                 transform: `translateY(${data.cta.verticalShift}px)`
              }}
            >
              <button 
                style={{ 
                  fontFamily: preset.bodyFont,
                  fontSize: `${data.cta.size * 0.18}em`,
                  lineHeight: data.cta.lineHeight,
                  padding: '0.8em 2em',
                  backgroundColor: data.cta.backgroundColor || '#ffffff',
                  color: data.cta.color,
                  letterSpacing: `${data.cta.letterSpacing}em`,
                  fontWeight: data.cta.weight
                }}
                className="rounded-sm uppercase transition-opacity shadow-xl"
              >
                {data.cta.content}
              </button>
              
              {/* CTA Decoration */}
              {ctaDecoration && ctaDecoration.id !== 'none' && (
                <div style={{ marginTop: '0.8em', color: data.ctaDecorationColor }}>
                   <svg 
                    width={`${baseScale * 60}px`} 
                    height={`${baseScale * 60}px`} 
                    viewBox="0 0 24 24" 
                    fill={ctaDecoration.fill ? 'currentColor' : 'none'} 
                    stroke={!ctaDecoration.fill ? 'currentColor' : 'none'} 
                    strokeWidth="1.5"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{
                      transform: data.layout.textAlign === 'left' ? 'translateX(20px)' : data.layout.textAlign === 'right' ? 'translateX(-20px)' : 'none'
                    }}
                   >
                     <path d={ctaDecoration.svg || ''} />
                   </svg>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
});

export default CreativePreview;