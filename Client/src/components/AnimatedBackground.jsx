import React, { useEffect, useState } from 'react';
import GridMotion from './GridMotion';

const AnimatedBackground = ({ backgroundImageUrl, backgroundColor }) => {
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    setMounted(true);
    // Pobierz obrazki z portfolio do siatki
    fetch(`${apiUrl}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filtrujemy tylko te z poprawnym obrazkiem i wyciagamy adres URL
          const imageUrls = data
            .filter(p => (p.type === 'image' || p.Type === 'image') && (p.imageUrl || p.ImageUrl))
            .map(p => p.imageUrl || p.ImageUrl);
          
          if (imageUrls.length > 0) {
            // Możemy powielić tablicę, aby zapchać 35 kafelków w siatce (jesli portfolio jest małe)
            let repeatedImages = [];
            while(repeatedImages.length < 35) {
                repeatedImages = [...repeatedImages, ...imageUrls];
            }
            setImages(repeatedImages.slice(0, 35));
          }
        }
      })
      .catch(err => console.error("Błąd ładowania obrazów do tła:", err));
  }, [apiUrl]);

  if (!mounted) return null;

  const gridColor = "color-mix(in srgb, var(--sunfire-accent), #5227FF 40%)";

  return (
    <div className="fixed inset-0 w-full h-full z-[-10] overflow-hidden pointer-events-none bg-[#050505]">
      
      {/* 1. Efekt GridMotion z obrazkami portfolio */}
      <GridMotion items={images} gradientColor={gridColor} />

      {/* 2. CMS Background Layer */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-[1000ms] mix-blend-overlay opacity-50"
        style={{ 
          backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
          backgroundColor: !backgroundImageUrl && backgroundColor ? backgroundColor : 'transparent'
        }}
      />
      
      {/* Delikatna winieta */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_30%,#050505_100%)]" />
    </div>
  );
};

export default AnimatedBackground;
