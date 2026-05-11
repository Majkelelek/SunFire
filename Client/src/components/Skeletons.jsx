import React from 'react';
import './Skeletons.css';


export const SkeletonBase = ({ className = '', style = {} }) => (
  <div className={`skeleton-wrapper ${className}`} style={style}></div>
);


export const HomeSkeleton = () => {
  return (
    <div className="home-container" style={{ paddingTop: '100px' }}>
      <div className="skeleton-hero">
        <SkeletonBase className="skeleton-text" style={{ width: '30%', height: '16px' }} />
        <SkeletonBase className="skeleton-title" />
        <SkeletonBase className="skeleton-text" style={{ width: '50%' }} />
        <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
          <SkeletonBase style={{ width: '150px', height: '50px', borderRadius: '30px' }} />
          <SkeletonBase style={{ width: '150px', height: '50px', borderRadius: '30px' }} />
        </div>
      </div>
      
      <div className="skeleton-home-grid">
        <SkeletonBase className="skeleton-card" />
        <SkeletonBase className="skeleton-card" />
        <SkeletonBase className="skeleton-card" />
      </div>
    </div>
  );
};


export const PortfolioSkeleton = () => {
  return (
    <div className="portfolio-container">
      <header className="portfolio-header">
         <SkeletonBase className="skeleton-title" style={{ width: '40%', margin: '0 auto' }} />
      </header>
      <div className="slots-grid">
        
        {[...Array(8)].map((_, i) => (
          <SkeletonBase key={i} className="skeleton-portfolio-slot" />
        ))}
      </div>
    </div>
  );
};


export const AboutSkeleton = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <section className="about-hero" style={{ padding: '60px 0' }}>
            <SkeletonBase className="skeleton-text" style={{ width: '20%', height: '16px', margin: '0 auto 20px' }} />
            <SkeletonBase className="skeleton-title" style={{ width: '60%', margin: '0 auto 40px', height: '60px' }} />
            <SkeletonBase className="skeleton-text" style={{ width: '80%', margin: '0 auto 10px' }} />
            <SkeletonBase className="skeleton-text" style={{ width: '70%', margin: '0 auto 10px' }} />
        </section>
        
        <div className="skeleton-about-grid">
            <SkeletonBase className="skeleton-card" style={{ height: '250px' }} />
            <SkeletonBase className="skeleton-card" style={{ height: '250px' }} />
            <SkeletonBase className="skeleton-card" style={{ height: '250px', gridColumn: '1 / -1' }} />
        </div>
      </div>
    </div>
  );
};

