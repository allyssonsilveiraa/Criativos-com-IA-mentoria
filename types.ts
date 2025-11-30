
export interface FontPreset {
  id: string;
  name: string;
  category: 'Modern UI' | 'Serif Classic' | 'Bold Impact';
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
}

export interface LayoutConfig {
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'start' | 'center' | 'end';
  
  verticalOffset: number; // Manual Y shift for standard formats
  storyOffset: number; // Specific Y shift for Stories (defaults to -20)
  
  textOccupancy: number; // 1-10 slider (width %)
  textGap: number; // Spacing between text elements (0-10)
  
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
  uploadedImage: string | null;
  
  // Image Manipulation
  imageScale: number; // 1 to 3
  imageX: number; // -100 to 100
  imageY: number; // -100 to 100

  logoUrl: string | null;
  
  title: TextConfig;
  subtitle: TextConfig;
  body: TextConfig;
  cta: TextConfig;
  
  fontPresetId: string;
  layout: LayoutConfig;
}

export const FONTS: FontPreset[] = [
  // Modern UI / UX Presets
  {
    id: 'ui-inter',
    name: 'Inter UI',
    category: 'Modern UI',
    titleFont: 'Inter',
    subFont: 'Inter',
    bodyFont: 'Inter',
  },
  {
    id: 'ui-roboto',
    name: 'Roboto Tech',
    category: 'Modern UI',
    titleFont: 'Roboto',
    subFont: 'Roboto',
    bodyFont: 'Roboto',
  },
  {
    id: 'ui-poppins',
    name: 'Poppins Soft',
    category: 'Modern UI',
    titleFont: 'Poppins',
    subFont: 'Poppins',
    bodyFont: 'Poppins',
  },
  // Serif Classic Presets
  {
    id: 'classic-roman',
    name: 'Trajan Style',
    category: 'Serif Classic',
    titleFont: 'Cinzel',
    subFont: 'Merriweather',
    bodyFont: 'Lato',
  },
  {
    id: 'classic-luxury',
    name: 'Luxury Editorial',
    category: 'Serif Classic',
    titleFont: 'Playfair Display',
    subFont: 'Lato',
    bodyFont: 'Merriweather',
  },
  // Bold
  {
    id: 'bold-montserrat',
    name: 'Montserrat Bold',
    category: 'Bold Impact',
    titleFont: 'Montserrat',
    subFont: 'Montserrat',
    bodyFont: 'Open Sans',
  },
];

export const AD_FORMATS: AdFormat[] = [
  { id: 'feed', label: 'Feed Quadrado', width: 1080, height: 1080, type: 'feed', filenameSuffix: 'feed' },
  { id: 'story', label: 'Stories / Reels', width: 1080, height: 1920, type: 'story', filenameSuffix: 'storie' },
  { id: 'portrait', label: 'Feed Retrato', width: 1080, height: 1350, type: 'portrait', filenameSuffix: 'feed_portrait' },
  { id: 'landscape', label: 'Link / Web', width: 1200, height: 628, type: 'landscape', filenameSuffix: 'link' },
];
