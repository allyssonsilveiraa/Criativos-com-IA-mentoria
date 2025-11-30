
export interface FontPreset {
  id: string;
  name: string;
  category: 'Modern UI' | 'Serif Classic' | 'Bold Impact' | 'Minimal' | 'Tech' | 'Editorial';
  titleFont: string;
  subFont: string;
  bodyFont: string;
}

export interface AdFormat {
  id: string;
  label: string;
  width: number;
  height: number;
  type: 'feed' | 'story' | 'portrait' | 'landscape';
  filenameSuffix: string;
}

export interface TextConfig {
  content: string;
  size: number; // 1-100 scale relative to base
  visible: boolean;
  color: string; // Hex color
  letterSpacing: number; // -0.5 to 2 em
  lineHeight: number; // 0.8 to 2.0
  verticalShift: number; // -50 to 50 individual adjustment
  weight: number; // 300, 400, 600, 800
  backgroundColor?: string; // Optional background color (mainly for CTA)
}

export interface LayoutConfig {
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'start' | 'center' | 'end';
  
  verticalOffset: number; // Manual Y shift for standard formats
  storyOffset: number; // Specific Y shift for Stories (defaults to -20)
  
  textOccupancy: number; // 1-10 slider (width %)
  textGap: number; // Spacing between text elements (0-10)
  contentPadding: number; // Horizontal padding 0-200
  
  showOverlay: boolean; // Toggle overlay
  overlayOpacity: number; // 0-100
  overlayColor: string; // Hex color
  backgroundBlur: number; // 0-20px
  
  showLogo: boolean;
  logoSize: number; // 1-10 scale
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface SceneData {
  name: string;
  
  // Image Source Logic
  imageSourceType: 'generated' | 'upload';
  imagePrompt: string;
  generatedImage: string | null;
  uploadedImages: string[]; // Array of uploaded base64 strings
  activeImageIndex: number; // Index to select active image
  
  // Standard Image Manipulation (Feed/Portrait/Landscape)
  imageScale: number; // 1 to 3
  imageX: number; // -100 to 100
  imageY: number; // -100 to 100

  // Story Specific Overrides
  storyImageScale: number;
  storyImageX: number;
  storyImageY: number;

  logoUrl: string | null;
  
  title: TextConfig;
  subtitle: TextConfig;
  body: TextConfig;
  cta: TextConfig;
  
  ctaDecorationId: string | null; // ID of the arrow/element
  ctaDecorationColor: string;
  
  fontPresetId: string;
  layout: LayoutConfig;
}

export const CTA_DECORATIONS = [
  { id: 'none', label: 'None', svg: null },
  { id: 'arrow-simple', label: 'Simple Arrow', svg: 'M12 5v14m0 0l-7-7m7 7l7-7' }, // Down arrow
  { id: 'arrow-bold', label: 'Bold Arrow', svg: 'M19 14l-7 7m0 0l-7-7m7 7V3' }, 
  { id: 'arrow-curved-l', label: 'Curved L', svg: 'M16 3h5v5M4 20L21 3M4 20l6.5-6.5M4 20l6.5 6.5' }, // Actually diagonal
  { id: 'pointer-finger', label: 'Hand', svg: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11' },
  { id: 'chevron-triple', label: 'Chevrons', svg: 'M5 8l7 7 7-7M5 13l7 7 7-7M5 3l7 7 7-7' },
  { id: 'triangle-solid', label: 'Triangle', svg: 'M12 21l-10-18h20z', fill: true },
  { id: 'star-burst', label: 'Sparkle', svg: 'M12 2l3 6 6 3-6 3-3 6-3-6-6-3 6-3z', fill: true },
  { id: 'curly-arrow', label: 'Curly', svg: 'M3 3c0 9 5 15 12 15h6m-6-6l6 6-6 6' }, // Side curly
  { id: 'line-dots', label: 'Line Dots', svg: 'M2 12h20M2 12a2 2 0 010-4m20 4a2 2 0 000-4' },
  { id: 'double-down', label: 'Double', svg: 'M7 10l5 5 5-5M7 16l5 5 5-5' }
];

export const FONTS: FontPreset[] = [
  // --- Modern UI ---
  { id: 'ui-inter', name: 'Inter Clean', category: 'Modern UI', titleFont: 'Inter', subFont: 'Inter', bodyFont: 'Inter' },
  { id: 'ui-roboto', name: 'Roboto Tech', category: 'Modern UI', titleFont: 'Roboto', subFont: 'Roboto', bodyFont: 'Roboto' },
  { id: 'ui-poppins', name: 'Poppins Soft', category: 'Modern UI', titleFont: 'Poppins', subFont: 'Poppins', bodyFont: 'Poppins' },
  { id: 'ui-worksans', name: 'Work Utility', category: 'Modern UI', titleFont: 'Work Sans', subFont: 'Work Sans', bodyFont: 'Work Sans' },
  { id: 'ui-dmsans', name: 'DM Sans', category: 'Modern UI', titleFont: 'DM Sans', subFont: 'DM Sans', bodyFont: 'DM Sans' },
  
  // --- Serif Classic / Luxury ---
  { id: 'classic-roman', name: 'Cinzel Gold', category: 'Serif Classic', titleFont: 'Cinzel', subFont: 'Merriweather', bodyFont: 'Lato' },
  { id: 'classic-playfair', name: 'Playfair Luxe', category: 'Serif Classic', titleFont: 'Playfair Display', subFont: 'Lato', bodyFont: 'Merriweather' },
  { id: 'classic-lora', name: 'Lora Editorial', category: 'Serif Classic', titleFont: 'Lora', subFont: 'Open Sans', bodyFont: 'Lora' },
  { id: 'classic-merri', name: 'Merriweather', category: 'Serif Classic', titleFont: 'Merriweather', subFont: 'Open Sans', bodyFont: 'Merriweather' },
  
  // --- Bold Impact ---
  { id: 'bold-montserrat', name: 'Montserrat Bold', category: 'Bold Impact', titleFont: 'Montserrat', subFont: 'Montserrat', bodyFont: 'Open Sans' },
  { id: 'bold-bebas', name: 'Bebas Headline', category: 'Bold Impact', titleFont: 'Bebas Neue', subFont: 'Montserrat', bodyFont: 'Roboto' },
  { id: 'bold-oswald', name: 'Oswald Tall', category: 'Bold Impact', titleFont: 'Oswald', subFont: 'Open Sans', bodyFont: 'Open Sans' },
  { id: 'bold-archivo', name: 'Archivo Heavy', category: 'Bold Impact', titleFont: 'Archivo Black', subFont: 'Roboto', bodyFont: 'Roboto' },

  // --- Minimal ---
  { id: 'min-raleway', name: 'Raleway Thin', category: 'Minimal', titleFont: 'Raleway', subFont: 'Raleway', bodyFont: 'Raleway' },
  { id: 'min-quicksand', name: 'Quicksand Round', category: 'Minimal', titleFont: 'Quicksand', subFont: 'Quicksand', bodyFont: 'Quicksand' },
  { id: 'min-nunito', name: 'Nunito Friendly', category: 'Minimal', titleFont: 'Nunito', subFont: 'Nunito', bodyFont: 'Nunito' },

  // --- Tech / Future ---
  { id: 'tech-space', name: 'Space Grotesk', category: 'Tech', titleFont: 'Space Grotesk', subFont: 'Space Grotesk', bodyFont: 'Inter' },
  { id: 'tech-syne', name: 'Syne Art', category: 'Tech', titleFont: 'Syne', subFont: 'Inter', bodyFont: 'Inter' },
  { id: 'tech-ubuntu', name: 'Ubuntu Term', category: 'Tech', titleFont: 'Ubuntu', subFont: 'Ubuntu', bodyFont: 'Open Sans' },

  // --- Editorial ---
  { id: 'ed-ptsans', name: 'PT Standard', category: 'Editorial', titleFont: 'PT Sans', subFont: 'PT Sans', bodyFont: 'PT Sans' },
];

export const AD_FORMATS: AdFormat[] = [
  { id: 'feed', label: 'Feed Quadrado', width: 1080, height: 1080, type: 'feed', filenameSuffix: 'feed' },
  { id: 'story', label: 'Stories / Reels', width: 1080, height: 1920, type: 'story', filenameSuffix: 'storie' },
  { id: 'portrait', label: 'Feed Retrato', width: 1080, height: 1350, type: 'portrait', filenameSuffix: 'feed_portrait' },
  { id: 'landscape', label: 'Link / Web', width: 1200, height: 628, type: 'landscape', filenameSuffix: 'link' },
];