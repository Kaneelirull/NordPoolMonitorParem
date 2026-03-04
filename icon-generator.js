const { nativeImage } = require('electron');
const { createCanvas } = require('canvas');

// Create colored icon using Canvas (more reliable on Windows)
function createColoredIcon(color, size = 64) {
  try {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw circle background
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw lightning bolt (⚡)
    ctx.fillStyle = '#ffffff';
    ctx.font = `${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', size / 2, size / 2 + size * 0.05);
    
    const buffer = canvas.toBuffer('image/png');
    return nativeImage.createFromBuffer(buffer);
  } catch (error) {
    console.error('Canvas not available, falling back to SVG');
    return createColoredIconSVG(color);
  }
}

// Fallback SVG-based icon
function createColoredIconSVG(color) {
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="${color}"/>
      <text x="32" y="44" font-size="36" text-anchor="middle" fill="white" font-family="Arial">⚡</text>
    </svg>
  `;
  
  const iconBuffer = Buffer.from(iconSvg);
  return nativeImage.createFromBuffer(iconBuffer);
}

module.exports = { createColoredIcon };
