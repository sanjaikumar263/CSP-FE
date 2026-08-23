import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import shopImg from '../assets/Shop Image.png';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AboutUsPage.css';

export default function AboutUsPage() {
  const [storeInfo, setStoreInfo] = useState({
    heroSubtitleTag: 'ABOUT CHENNAI SILK PALACE',
    heroTitle: 'A Legacy of Trust, Tradition & Excellence',
    heroSubtitle: 'Crafting elegance and preserving timeless Indian textile traditions for over four decades in Malaysia.',
    directorName: 'Mr. Thanasekaran Vellaikkoothan',
    directorRole: 'Director, Chennai Silk Palace Sdn. Bhd.',
    directorQuote: '"Behind every great brand is a visionary whose passion transforms dreams into reality. For over four decades, Mr. Thanasekaran Vellaikkoothan has been a respected pioneer in Malaysia’s textile industry, building Chennai Silk Palace into one of the country’s most trusted and admired destinations for authentic Indian textiles and traditional attire."',
    directorBody: 'Driven by a commitment to quality, integrity, authenticity, and exceptional customer service, he has earned the confidence of generations of customers. Today, Chennai Silk Palace is more than a textile retailer — it is a household name synonymous with elegance, heritage, and timeless craftsmanship.',
    directorYears: '40+',
    directorImage: '',
    visionText: 'To preserve the timeless beauty of Indian textiles while continuously delivering quality, authenticity, innovation, and exceptional customer experiences for generations to come.',
    missionText: 'To be Malaysia’s most trusted destination for premium Indian textiles by offering authentic products, outstanding value, personalised service, and an unforgettable shopping experience, while preserving cultural heritage and making a meaningful contribution to the community.'
  });

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/store-info');
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          setStoreInfo(prev => ({
            ...prev,
            ...data.data
          }));
        }
      } catch (err) {
        console.warn('Using fallback store info in AboutUsPage:', err);
      }
    };
    fetchStoreInfo();
  }, []);

  return (
    <div className="about-page-container">
      {/* Common Header */}
      <Header />

      {/* Hero Banner Section */}
      <section className="about-hero-section">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <div className="about-hero-subtitle">{storeInfo.heroSubtitleTag}</div>
          <h1 className="about-hero-title">{storeInfo.heroTitle}</h1>
          <p className="about-hero-subtitle">
            {storeInfo.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Director & Visionary Section */}
      <section className="about-director-section">
        <div className="about-container">
          <div className="director-card">
            <div className="director-info-side">
              <div className="director-badge">LEADERSHIP</div>
              <h2 className="director-name">{storeInfo.directorName}</h2>
              <p className="director-role">{storeInfo.directorRole}</p>
              
              <div className="director-divider"></div>

              <p className="director-quote-text">
                {storeInfo.directorQuote}
              </p>
              
              <p className="director-body-text">
                {storeInfo.directorBody}
              </p>
            </div>

            <div className="director-image-side">
              <img src={storeInfo.directorImage || shopImg} alt="Chennai Silk Palace Storefront & Director Legacy" className="director-img" />
              <div className="director-experience-badge">
                <span className="years-num">{storeInfo.directorYears}</span>
                <span className="years-lbl">Years of Visionary Leadership</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entrepreneurial Journey Timeline */}
      <section className="about-journey-section">
        <div className="about-container">
          <div className="section-header-centered">
            <div className="ornament-eyebrow">OUR EVOLUTION</div>
            <h2 className="section-main-title">The Journey of a Visionary Entrepreneur</h2>
          </div>

          <div className="journey-timeline">
            {storeInfo.timeline && storeInfo.timeline.length > 0 ? (
              storeInfo.timeline.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-year">{item.year}</div>
                  <div className="timeline-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>No timeline milestones available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Showroom Collections Grid */}
      <section className="about-collections-section">
        <div className="about-container">
          <div className="section-header-centered">
            <div className="ornament-eyebrow">FLAGSHIP SHOWROOM</div>
            <h2 className="section-main-title">An Extensive World of Indian Fashion</h2>
            <p className="section-sub-title">Every collection is thoughtfully curated to celebrate culture, elegance, and exceptional craftsmanship.</p>
          </div>

          <div className="collections-bullet-grid">
            <div className="collection-bullet-card">
              <span className="bullet-icon">✨</span>
              <span>Authentic Kanchipuram Silk Sarees</span>
            </div>
            <div className="collection-bullet-card">
              <span className="bullet-icon">👑</span>
              <span>Exclusive Bridal Collections</span>
            </div>
            <div className="collection-bullet-card">
              <span className="bullet-icon">👗</span>
              <span>Traditional Indian Wear</span>
            </div>
            <div className="collection-bullet-card">
              <span className="bullet-icon">🧵</span>
              <span>Designer Fabrics</span>
            </div>
            <div className="collection-bullet-card">
              <span className="bullet-icon">👔</span>
              <span>Men’s Ethnic Wear</span>
            </div>
            <div className="collection-bullet-card">
              <span className="bullet-icon">🎈</span>
              <span>Children’s Festive Collections</span>
            </div>
            <div className="collection-bullet-card">
              <span className="bullet-icon">💎</span>
              <span>Premium Fashion Accessories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Preservation & Royal Recognition */}
      <section className="about-heritage-cultural">
        <div className="about-container">
          <div className="cultural-grid">
            {/* 2015 Cultural Exhibition */}
            <div className="cultural-card">
              <div className="cultural-year-badge">2015 Cultural Landmark</div>
              <h3>Preserving Heritage Through Culture</h3>
              <p>
                For Mr. Thanasekaran, textiles represent far more than fashion — they are symbols of culture, heritage, tradition, and generations of artistic excellence.
              </p>
              <p>
                To commemorate Chennai Silk Palace’s 10th Anniversary in 2015, he organised a landmark cultural initiative by bringing highly skilled Kanchipuram handloom weavers together with traditional wooden looms from India to Malaysia.
              </p>
              <p className="officiated-tag">
                Official Officiator: <strong>Datuk Seri Dr. S. Subramaniam</strong>, then Malaysia’s Minister of Health.
              </p>
            </div>

            {/* 2016 Royal Recognition */}
            <div className="cultural-card royal-card">
              <div className="cultural-year-badge royal-badge">2016 Royal Milestone</div>
              <h3>Royal Recognition</h3>
              <p>
                In 2016, Chennai Silk Palace received one of its highest honours with a special visit from <strong>His Royal Highness the Raja Muda of Selangor</strong>.
              </p>
              <p>
                The royal visit recognised the company’s contributions to Malaysia’s textile industry, dedication to quality, preservation of cultural heritage, and commitment to community service.
              </p>
              <p className="royal-highlight-text">
                This remains one of the proudest milestones in the company’s history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="about-awards-section">
        <div className="about-container">
          <div className="section-header-centered">
            <div className="ornament-eyebrow">HONOURS & ACCOLADES</div>
            <h2 className="section-main-title">Awards & Recognition</h2>
          </div>

          <div className="awards-grid">
            <div className="award-card">
              <div className="award-trophy">🏆</div>
              <div className="award-year">2019</div>
              <h4>Outstanding Entrepreneur Award</h4>
              <p>Presented in recognition of outstanding leadership, entrepreneurial success, sustainable business growth, and operational excellence.</p>
            </div>

            <div className="award-card">
              <div className="award-trophy">⭐</div>
              <div className="award-year">2023</div>
              <h4>Nambikkai Business Icon Award for Excellence in Textiles</h4>
              <p>Awarded in recognition of visionary leadership, commitment to quality, and significant contribution to Malaysia’s retail and textile industry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Customers Choose Us */}
      <section className="about-why-us-section">
        <div className="about-container">
          <div className="why-us-box">
            <h2 className="why-us-title">Why Customers Choose Chennai Silk Palace</h2>
            <p className="why-us-intro">For generations, customers have placed their trust in Chennai Silk Palace because of our unwavering commitment to excellence.</p>

            <div className="checkmarks-grid">
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Authentic textiles sourced directly from India’s renowned weaving centres</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Premium Kanchipuram Silk Sarees with guaranteed quality</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Exclusive bridal collections for life’s most memorable occasions</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Carefully curated traditional and contemporary fashion</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Competitive pricing with exceptional value</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>Friendly, knowledgeable, and personalised customer service</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>A trusted family owned business with over {storeInfo.directorYears} of experience</span>
              </div>
              <div className="check-item">
                <span className="check-icon">✓</span>
                <span>A shopping experience where tradition meets elegance</span>
              </div>
            </div>

            <div className="family-quote">
              "Every customer who walks through our doors becomes part of the Chennai Silk Palace family."
            </div>
          </div>
        </div>
      </section>

      {/* CSR / Community Commitment */}
      <section className="about-csr-section">
        <div className="about-container">
          <div className="csr-card">
            <div className="csr-badge">GIVING BACK</div>
            <h2>A Commitment Beyond Business</h2>
            <p>
              For Mr. Thanasekaran, true success is measured not only by business achievements but also by the positive impact made on society. Giving back has always been an integral part of Chennai Silk Palace’s values.
            </p>
            <p className="csr-highlight">
              Every year during the Deepavali festive season, the company welcomes children from orphanages and charitable homes, providing each child with brand new festive clothing.
            </p>
            <p>
              This cherished annual initiative ensures every child can celebrate the Festival of Lights with happiness, dignity, and a sense of belonging.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="about-vision-mission-section">
        <div className="about-container">
          <div className="vm-grid">
            <div className="vm-card vision-card">
              <div className="vm-icon">👁️</div>
              <h2>Our Vision</h2>
              <p>
                {storeInfo.visionText}
              </p>
            </div>

            <div className="vm-card mission-card">
              <div className="vm-icon">🎯</div>
              <h2>Our Mission</h2>
              <p>
                {storeInfo.missionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legacy Concluding Banner */}
      <section className="about-legacy-banner">
        <div className="about-container">
          <div className="legacy-inner">
            <div className="ornament-eyebrow light">HERITAGE CONTINUES</div>
            <h2 className="legacy-title">A Legacy That Continues</h2>
            <p className="legacy-desc">
              From humble beginnings as a wholesale textile trader to leading one of Malaysia’s most recognised and respected textile retailers, Mr. Thanasekaran Vellaikkoothan has built far more than a successful business — he has built a legacy.
            </p>
            
            <div className="legacy-pillars-row">
              <div className="legacy-pillar">A legacy founded on <strong>trust</strong></div>
              <div className="legacy-pillar">A legacy strengthened by <strong>quality</strong></div>
              <div className="legacy-pillar">A legacy inspired by <strong>heritage</strong></div>
              <div className="legacy-pillar">A legacy shared with the <strong>community</strong></div>
            </div>

            <div className="brand-tagline-box">
              <h3>Chennai Silk Palace</h3>
              <p>Where Tradition Meets Elegance.</p>
              <p>Where Quality Inspires Trust.</p>
              <p>Where Every Celebration Begins.</p>
            </div>

            <div className="legacy-cta-wrap">
              <Link to="/products" className="legacy-explore-btn">
                EXPLORE OUR COLLECTIONS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
}
