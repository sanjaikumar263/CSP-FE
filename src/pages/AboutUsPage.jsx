import { Link } from 'react-router-dom';
import shopImg from '../assets/Shop Image.png';
import logoSvg from '../assets/hero_logo.svg';
import Header from '../components/Header';
import './AboutUsPage.css';

export default function AboutUsPage() {
  return (
    <div className="about-page-container">
      {/* Common Header */}
      <Header />

      {/* Hero Banner Section */}
      <section className="about-hero-section">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <div className="ornament-eyebrow">ABOUT CHENNAI SILK PALACE</div>
          <h1 className="about-hero-title">A Legacy of Trust, Tradition & Excellence</h1>
          <p className="about-hero-subtitle">
            Crafting elegance and preserving timeless Indian textile traditions for over four decades in Malaysia.
          </p>
        </div>
      </section>

      {/* Director & Visionary Section */}
      <section className="about-director-section">
        <div className="about-container">
          <div className="director-card">
            <div className="director-info-side">
              <div className="director-badge">LEADERSHIP</div>
              <h2 className="director-name">Mr. Thanasekaran Vellaikkoothan</h2>
              <p className="director-role">Director, Chennai Silk Palace Sdn. Bhd.</p>
              
              <div className="director-divider"></div>

              <p className="director-quote-text">
                "Behind every great brand is a visionary whose passion transforms dreams into reality. For over four decades, Mr. Thanasekaran Vellaikkoothan has been a respected pioneer in Malaysia’s textile industry, building Chennai Silk Palace into one of the country’s most trusted and admired destinations for authentic Indian textiles and traditional attire."
              </p>
              
              <p className="director-body-text">
                Driven by a commitment to quality, integrity, authenticity, and exceptional customer service, he has earned the confidence of generations of customers. Today, Chennai Silk Palace is more than a textile retailer — it is a household name synonymous with elegance, heritage, and timeless craftsmanship.
              </p>
            </div>

            <div className="director-image-side">
              <img src={shopImg} alt="Chennai Silk Palace Storefront & Director Legacy" className="director-img" />
              <div className="director-experience-badge">
                <span className="years-num">40+</span>
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
            {/* Timeline Item 1 */}
            <div className="timeline-item">
              <div className="timeline-year">1985</div>
              <div className="timeline-content">
                <h3>The Early Vision</h3>
                <p>
                  Mr. Thanasekaran’s entrepreneurial journey began in 1985 with a clear vision to bring the finest Indian textiles to customers in Malaysia. Travelling extensively between India and Malaysia, he personally sourced premium fabrics from renowned textile manufacturers and established long-lasting relationships built on trust and quality.
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="timeline-item">
              <div className="timeline-year">1992</div>
              <div className="timeline-content">
                <h3>Wholesale Operations Established</h3>
                <p>
                  In 1992, he officially established his wholesale textile company in Malaysia under his late father’s name. By importing textile products directly from India in large container shipments, he created an efficient and reliable supply network that served retailers nationwide while strengthening Malaysia’s textile industry.
                </p>
              </div>
            </div>

            {/* Timeline Item 3 */}
            <div className="timeline-item">
              <div className="timeline-year">2004 - 2006</div>
              <div className="timeline-content">
                <h3>Creating an Iconic Landmark</h3>
                <p>
                  A defining milestone came in 2004, when Mr. Thanasekaran acquired the historic Standard Chartered Bank building in Klang. Recognising its heritage value, he carefully restored the landmark while preserving its architectural charm. In 2006, it reopened as the flagship showroom of Chennai Silk Palace.
                </p>
              </div>
            </div>

            {/* Timeline Item 4 */}
            <div className="timeline-item">
              <div className="timeline-year">2012</div>
              <div className="timeline-content">
                <h3>Ipoh Branch Expansion</h3>
                <p>
                  The opening of the Ipoh showroom brought Chennai Silk Palace’s signature quality and exceptional service closer to customers in Perak and the northern region.
                </p>
              </div>
            </div>

            {/* Timeline Item 5 */}
            <div className="timeline-item">
              <div className="timeline-year">2013</div>
              <div className="timeline-content">
                <h3>Penang Branch Expansion</h3>
                <p>
                  The Penang showroom further strengthened the brand’s nationwide presence, making premium Indian textiles more accessible while continuing the company’s tradition of excellence.
                </p>
              </div>
            </div>
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
                <span>A trusted family owned business with over 40 years of experience</span>
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
                To preserve the timeless beauty of Indian textiles while continuously delivering quality, authenticity, innovation, and exceptional customer experiences for generations to come.
              </p>
            </div>

            <div className="vm-card mission-card">
              <div className="vm-icon">🎯</div>
              <h2>Our Mission</h2>
              <p>
                To be Malaysia’s most trusted destination for premium Indian textiles by offering authentic products, outstanding value, personalised service, and an unforgettable shopping experience, while preserving cultural heritage and making a meaningful contribution to the community.
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
      <footer className="main-footer" id="footer">
        <div className="container-inner">
          <div className="footer-grid">
            <div className="footer-col brand-col">
              <img src={logoSvg} alt="Chennai Silk Palace Logo" className="footer-logo-img" />
              <p className="footer-brand-desc">
                Chennai Silk Palace brings you the finest handpicked silk sarees and ethnic wear straight from master artisans since 1965.
              </p>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">QUICK LINKS</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">All Collections</Link></li>
                <li><Link to="/gender/women">Women's Sarees</Link></li>
                <li><Link to="/gender/men">Men's Wear</Link></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">CUSTOMER SERVICE</h4>
              <ul className="footer-links">
                <li><a href="#shipping">Shipping Info</a></li>
                <li><a href="#returns">Returns & Exchange</a></li>
                <li><a href="#care">Silk Care Guide</a></li>
                <li><a href="#faq">Frequently Asked Questions</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">CONTACT US</h4>
              <ul className="footer-contact-list">
                <li>📍 Klang, Selangor, Malaysia</li>
                <li>📞 +60 3 3372 7272</li>
                <li>✉️ support@chennaisilkpalace.com</li>
                <li>⏰ Daily: 10:00 AM - 9:30 PM</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p>© {new Date().getFullYear()} Chennai Silk Palace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
