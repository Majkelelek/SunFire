import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-bg-noise"></div> {/* Subtelny efekt ziarna/szumu */}
      <div className="home-glow-main"></div>

      <section className="hero">
        <div className="hero-content">
          <p className="hero-tagline">WIZYTÓWKI - BANNERY - POCZTÓWKI</p>
          <h1 className="hero-title">SUN<span>FIRE</span></h1>
          <p className="hero-motto">
            Przekształcam idee w niezapomniane wrażenia wizualne. 
            Design, który płonie pasją i precyzją.
          </p>
          
          <div className="hero-btns">
            <Link to="/portfolio" className="btn-primary">ZOBACZ PRACE</Link>
            <Link to="/contact" className="btn-secondary">POROZMAWIAJMY</Link>
          </div>
        </div>
      </section>

      <section className="design-focus">
        <div className="focus-item">
          <span className="focus-num">01</span>
          <h3>BRANDING</h3>
          <p>Tworzenie tożsamości, które zapadają w pamięć.</p>
        </div>
        <div className="focus-item">
          <span className="focus-num">02</span>
          <h3>DIGITAL ART</h3>
          <p>Ilustracje i koncepty.</p>
        </div>
        <div className="focus-item">
          <span className="focus-num">03</span>
          <h3>UI DESIGN</h3>
          <p>Estetyka połączona z perfekcyjną użytecznością.</p>
        </div>
      </section>
    </div>
  );
}