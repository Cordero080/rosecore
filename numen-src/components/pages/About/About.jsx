import { useState, useRef } from 'react';
import './About.scss';
import { 
  ThoughtBubbleIcon, 
  ImageIcon, 
  MilestoneIcon, 
  GuitarIcon, 
  TargetReticleIcon 
} from '@assets/icons';

// 🟣 CRYSTAL - Friends System Lead
// About.jsx - About page

function About() {
  
  // Track which letters have been hovered (for "hover all" replay)
  const hoveredRef = useRef(new Set());
  const isAnimatingRef = useRef(false);
  const [replayGlitch, setReplayGlitch] = useState(false);
  
  // Random-ish hover delays for each letter (50-150ms range)
  const hoverDelays = [0.08, 0.12, 0.05, 0.14, 0.09, 0.11, 0.07, 0.13];
  
  // Unique color variant for each letter (8 letters in NUMENEON)
  const colorVariants = ['magenta', 'cyan', 'aqua', 'purple', 'blue', 'orange', 'pink', 'green'];
  
  // Track letter hovers - when all 5 are hovered, trigger replay
  const handleLetterHover = (index) => {
    if (isAnimatingRef.current) return;
    
    hoveredRef.current.add(index);
    
    if (hoveredRef.current.size === 8) {
      isAnimatingRef.current = true;
      hoveredRef.current = new Set();
      
      setReplayGlitch('reset');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setReplayGlitch('replay');
          
          setTimeout(() => {
            setReplayGlitch(false);
            isAnimatingRef.current = false;
          }, 4000);
        });
      });
    }
  };

  return (
    <div className="about-page">
      <div className="about-hero">
        <span className="hero-label">About</span>
        <h1 className={`hero-title hero-title--interactive ${replayGlitch === 'reset' ? 'hero-title--reset' : ''} ${replayGlitch === 'replay' ? 'hero-title--replay' : ''}`}>
          {'NUMENEON'.split('').map((letter, index) => {
            const isFlipped = index === 0 || index === 7; // First N and last N
            return (
              <span 
                key={index} 
                className={`title-letter ${isFlipped ? 'title-letter--flip' : ''} title-letter--${colorVariants[index]}`}
                style={{ '--hover-delay': `${hoverDelays[index]}s` }}
                data-letter={letter}
                onMouseEnter={() => handleLetterHover(index)}
              >
                {letter}
              </span>
            );
          })}
        </h1>
        <p className="hero-sub">Not another social network.<br/>A digital neighborhood.</p>
      </div>

      <div className="about-grid">
        <div className="grid-item manifesto">
          <span className="item-number">•</span>
          <h2>We're tired of the same shit.</h2>
          <p>
            Algorithmic feeds. Dopamine-harvesting scroll holes. Platforms that treat your 
            attention like a commodity to be auctioned. Your friends don't even see what you post anymore.
          </p>
        </div>

        <div className="grid-item design">
          <span className="item-number">••</span>
          <h2>The aesthetic is the message.</h2>
          <p>
            If we had to name it—neo-punk. Technology that serves humans, not the other way around. The glows and gradients aren't a manifesto. They're just what felt right. That it doesn't look like every other app is a bonus.
          </p>
        </div>

        <div className="grid-item pull-quote">
          <blockquote>
            We'd rather make something people actually love than something nobody hates.
          </blockquote>
        </div>

        <div className="grid-item river-timeline feature-highlight">
          <span className="item-number">◊</span>
          <h2>The River Timeline</h2>
          <p className="feature-intro">
            Three parallel streams flowing through your feed. Not an algorithm—a river.
          </p>
          <div className="river-columns">
            <div className="river-col thoughts">
              <span className="col-icon">
                <ThoughtBubbleIcon size={24} className="smart-deck-icon-svg" />
              </span>
              <span className="col-label">Thoughts</span>
              <span className="col-desc">Quick takes, reflections</span>
            </div>
            <div className="river-col media">
              <span className="col-icon">
                <ImageIcon size={24} className="smart-deck-icon-svg" />
              </span>
              <span className="col-label">Media</span>
              <span className="col-desc">Photos, videos, visuals</span>
            </div>
            <div className="river-col milestones">
              <span className="col-icon">
                <MilestoneIcon size={24} className="smart-deck-icon-svg" />
              </span>
              <span className="col-label">Milestones</span>
              <span className="col-desc">Achievements, life events</span>
            </div>
          </div>
          <p>
            Each friend gets a row. Their posts flow into columns by type—up to 12 per category 
            before a new row is created. Scroll horizontally through their content, vertically 
            through your friends. Everything in chronological order. No engagement-bait reshuffling.
          </p>
          <p className="river-difference">
            <strong>Why it's different:</strong> Traditional feeds bury your friend's third post 
            under a stranger's viral video. Here, you see the full picture—grouped, organized, 
            and actually browsable. Your feed becomes a gallery, not a slot machine.
          </p>
        </div>

        <div className="grid-item timing">
          <span className="item-number">•••</span>
          <h2>The internet used to work.</h2>
          <p>
            Your feed showed what your friends posted. In order. No algorithm deciding what 
            you "need" to see. Revolutionary, right? We're just bringing it back.
          </p>
        </div>

        <div className="grid-item learning feature-highlight">
          <span className="item-number">∞</span>
          <h2>Learning in Public</h2>
          <p>
            Numeneon was built as a learning project—and we're not hiding that. This isn't 
            a VC-backed startup with 50 engineers. It's a small crew teaching ourselves 
            React, Django, WebSockets, and real-time systems by actually building something.
          </p>
          <p>
            Every feature is documented. Every decision is explained. The codebase is open, 
            the process is transparent. We're students of the craft, and this is our workshop.
          </p>
          <p className="learning-philosophy">
            The best way to learn isn't tutorials—it's building something you actually care about 
            and figuring it out as you go. That's what Numeneon is.
          </p>
        </div>

        <div className="grid-item mystudio-basement feature-highlight">
          <span className="item-number">
            <GuitarIcon size={18} className="guitar-icon" />
          </span>
          <h2>The Basement</h2>
          <p className="basement-intro">
            Below the neon-lit top floor of Numeneon lies something different. A hidden door. 
            A staircase down. The basement studio.
          </p>
          <p>
            Think of Numeneon as a building. The main app is the penthouse—clean lines, 
            cyber aesthetics, the River Timeline flowing through glass walls. But every 
            building has a basement.
          </p>
          <p>
            MyStudio is that basement. A private studio where your Top 8 
            friends hang out. Custom themes. Embedded music players. Sparkle cursors and 
            marquee text. All the chaotic self-expression that made early social media 
            actually personal.
          </p>
          <div className="basement-feature">
            <span className="basement-icon">
              <TargetReticleIcon size={24} className="search-icon" />
            </span>
            <p>
              <strong>The Elevator:</strong> A dedicated search engine in the basement that 
              pulls friends down from the Numeneon top floor. Find your people, drag them 
              to your space, rank them in your Top 8. It's invitation-only—your basement, 
              your rules.
            </p>
          </div>
          <p className="basement-philosophy">
            Not everyone needs to see it. Not everyone will get it. That's the point. 
            Some spaces should be earned, not discovered by algorithm.
          </p>
        </div>

        <div className="grid-item honest">
          <span className="item-number">••••</span>
          <h2>Look</h2>
          <p>
            This won't replace Instagram. But not everything needs a billion users 
            to be substantive.  But the best communities aren't the biggest — they're the ones where people actually show up.
          </p>
          <p>
            The design is loud. The cyber aesthetic isn't for everyone. Good. Neither are we.
          </p>
        </div>

        <div className="grid-item team">
          <span className="item-number">―</span>
          <h2>Who we are.</h2>
          <p>
            A small crew who got tired of complaining and decided to build. No VC money 
            looking for 100x returns. Just people who think the internet could be better.
          </p>
        </div>

        <div className="grid-item cta">
          <span className="cta-text">Your feed should be yours.</span>
        </div>
      </div>
      
      {/* Copyright Footer */}
      <footer className="copyright-footer">
        <span>© 2026 Pablo Cordero & NUMENEON Contributors</span>
      </footer>
    </div>
  );
}

export default About;
