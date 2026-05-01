import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';

const GridMotion = ({ items = [], gradientColor = '#5227FF' }) => {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

  // Znacznie spowalniamy reakcję "sprężyny", by ruch był "leniwy" i spokojniejszy
  const springConfig = { damping: 10, stiffness: 40 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Baza (delikatna paralaksa całości)
  const translateX = useTransform(smoothX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [15, -15]);
  const translateY = useTransform(smoothY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [15, -15]);

  // Przemieszczenie kolumn w pionie (zmniejszamy zakres ruchu, żeby sprawiało wrażenie wolniejszego)
  const colUp = useTransform(smoothY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [250, -250]);
  const colDown = useTransform(smoothY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-250, 250]);

  // Zmniejszamy także wsparcie ruchu horyzontalnego
  const colUpX = useTransform(smoothX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [100, -100]);
  const colDownX = useTransform(smoothX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-100, 100]);

  // FIX BŁĘDU: Hooki useTransform wywołane ZAWSZE na najwyższym poziomie komponentu
  const combinedEvenY = useTransform([colUp, colUpX], ([y1, y2]) => y1 + y2 * 0.5);
  const combinedOddY = useTransform([colDown, colDownX], ([y1, y2]) => y1 + y2 * 0.5);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const [safeItems, setSafeItems] = useState([]);

  useEffect(() => {
    let arr = items.length > 0 ? [...items] : Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);
    while (arr.length < 20) {
      arr = [...arr, ...arr];
    }
    setSafeItems(arr);
  }, [items]);

  // 10 Kolumn
  const columns = [
    [...safeItems].reverse(),
    [...safeItems],
    [...safeItems].sort(() => 0.5 - Math.random()),
    [...safeItems].reverse(),
    [...safeItems],
    [...safeItems].sort(() => 0.5 - Math.random()),
    [...safeItems].reverse(),
    [...safeItems],
    [...safeItems].sort(() => 0.5 - Math.random()),
    [...safeItems].reverse(),
  ];

  const ItemCard = ({ item, index }) => (
    <div className="w-[280px] md:w-[350px] h-[200px] md:h-[250px] flex-shrink-0 bg-[#111111] rounded-[16px] overflow-hidden flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition duration-500 hover:bg-[#1a1a1a]">
      {typeof item === 'string' ? (
        item.startsWith('http') || item.startsWith('/') ? (
          <img src={item} alt={`Grid item ${index}`} className="w-full h-full object-cover opacity-30 transition duration-500 hover:opacity-100" />
        ) : (
          <span className="text-white/40 font-bold tracking-[1px]">{item}</span>
        )
      ) : (
        <div className="w-full h-full">{item}</div>
      )}
    </div>
  );

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050505]">
      <div
        className="absolute inset-0 w-full h-full transition-colors duration-1000"
        style={{ backgroundColor: gradientColor }}
      />

      {/* Kontener trzymający kolumny - flex-row */}
      <motion.div
        className="absolute w-[250vw] h-[250vh] left-[-75vw] top-[-75vh] flex flex-row gap-[6px] p-[20px] justify-center"
        style={{
          x: translateX,
          y: translateY,
          rotateZ: -12,
          transformOrigin: "center center"
        }}
      >
        {safeItems.length > 0 && columns.map((colItems, colIndex) => {
          // Przypisanie już obliczonej transformacji w zależności od kolumny
          const transformCombinedY = colIndex % 2 === 0 ? combinedEvenY : combinedOddY;

          return (
            <div key={colIndex} className="flex flex-col gap-[6px] w-[280px] md:w-[350px] overflow-hidden relative justify-center">
              <motion.div
                className="flex flex-col gap-[6px] absolute"
                style={{
                  y: transformCombinedY,
                  height: 'max-content'
                }}
              >
                {colItems.map((item, index) => (
                  <ItemCard key={index} item={item} index={index} />
                ))}
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_10%,#050505_90%)]" />
    </div>
  );
};

export default GridMotion;
