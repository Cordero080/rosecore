// Learn.jsx - Full daily learning page with detailed explanations
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTodayLearning, CATEGORIES, getTranslatedItem, getUILabel, getCategoryName } from '@data/dailyLearning';
import { ChevronLeftIcon, ScrollIcon, LanguageSwitchIcon } from '@assets/icons';
import SyntaxHighlight from '@utils/syntaxHighlight';
import './Learn.scss';

function Learn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = getTodayLearning();
  
  // Get tab from URL or default to techJargon
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['techJargon', 'bigO', 'loop', 'method', 'vocabulary', 'mythology'];
  const initialTab = validTabs.includes(tabFromUrl) ? tabFromUrl : 'techJargon';
  
  const [activeTab, setActiveTab] = useState(initialTab);

  // Language state - persisted to localStorage
  const getStoredLanguage = () => {
    try {
      return localStorage.getItem('learnLanguage') || 'en';
    } catch {
      return 'en';
    }
  };
  
  const [language, setLanguage] = useState(getStoredLanguage);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    localStorage.setItem('learnLanguage', newLang);
  };
  
  // Update tab if URL changes
  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  
  // Get known items from localStorage
  const getKnownItems = () => {
    try {
      return JSON.parse(localStorage.getItem('knownLearning') || '{}');
    } catch {
      return {};
    }
  };

  const [knownItems, setKnownItems] = useState(getKnownItems);

  const markAsKnown = (category, id) => {
    const key = `${category}_${id}`;
    const updated = { ...knownItems, [key]: true };
    setKnownItems(updated);
    localStorage.setItem('knownLearning', JSON.stringify(updated));
  };

  const unmarkAsKnown = (category, id) => {
    const key = `${category}_${id}`;
    const updated = { ...knownItems };
    delete updated[key];
    setKnownItems(updated);
    localStorage.setItem('knownLearning', JSON.stringify(updated));
  };

  const isKnown = (category, id) => knownItems[`${category}_${id}`];

  // Get current item based on active tab
  const getCurrentItem = () => {
    let item;
    switch (activeTab) {
      case 'techJargon': item = today.techJargon; break;
      case 'bigO': item = today.bigO; break;
      case 'loop': item = today.loop; break;
      case 'method': item = today.method; break;
      case 'vocabulary': item = today.vocabulary; break;
      case 'mythology': item = today.mythology; break;
      default: item = today.techJargon;
    }
    // Apply translations
    return getTranslatedItem(item, activeTab, language);
  };

  const currentItem = getCurrentItem();
  const currentCategory = CATEGORIES.find(c => c.id === activeTab);

  // Get localized date
  const getLocalizedDate = () => {
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    return new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="learn-page">
      <header className="learn-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeftIcon size={20} />
        </button>
        <h1>{getUILabel('dailyLearning', language)}</h1>
        <div className="header-controls">
          <span className="learn-date">{getLocalizedDate()}</span>
          <button 
            className="language-toggle" 
            onClick={toggleLanguage}
            title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
          >
            <LanguageSwitchIcon size={18} />
            <span className="lang-label">{language === 'en' ? 'EN' : 'ES'}</span>
          </button>
        </div>
      </header>

      {/* Category Tabs */}
      <nav className="learn-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`learn-tab ${activeTab === cat.id ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.id)}
          >
            <span>{getCategoryName(cat.id, language)}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="learn-content">
        <div className={`learn-card ${isKnown(activeTab, currentItem.id) ? 'known' : ''}`}>
          {/* Card Header */}
          <div className="card-header">
            <span className="card-category">
              {getCategoryName(activeTab, language)}
            </span>
            <button
              className={`know-btn ${isKnown(activeTab, currentItem.id) ? 'known' : ''}`}
              onClick={() => 
                isKnown(activeTab, currentItem.id) 
                  ? unmarkAsKnown(activeTab, currentItem.id)
                  : markAsKnown(activeTab, currentItem.id)
              }
            >
              {isKnown(activeTab, currentItem.id) ? getUILabel('known', language) : getUILabel('markAsKnown', language)}
            </button>
          </div>

          {/* Term */}
          <h2 className="card-term">{currentItem.term}</h2>
          
          {/* Pronunciation (for vocabulary) */}
          {currentItem.pronunciation && (
            <div className="card-pronunciation">{currentItem.pronunciation}</div>
          )}

          {/* Definition */}
          <p className="card-definition">{currentItem.definition}</p>

          {/* Etymology (vocabulary) */}
          {currentItem.etymology && (
            <div className="card-section card-etymology">
              <h3><ScrollIcon size={14} className="etymology-icon" /> {getUILabel('etymology', language)}</h3>
              <p>{currentItem.etymology}</p>
            </div>
          )}

          {/* Culture (mythology) */}
          {currentItem.culture && (
            <div className="card-section">
              <h3>{getUILabel('culture', language)}</h3>
              <p>{currentItem.culture}</p>
            </div>
          )}

          {/* Symbol (mythology) */}
          {currentItem.symbol && (
            <div className="card-section">
              <h3>{getUILabel('symbol', language)}</h3>
              <p>{currentItem.symbol}</p>
            </div>
          )}

          {/* Myth (mythology) */}
          {currentItem.myth && (
            <div className="card-section">
              <h3>{getUILabel('myth', language)}</h3>
              <p>{currentItem.myth}</p>
            </div>
          )}

          {/* Example/Sentence */}
          {currentItem.example && (
            <div className="card-section">
              <h3>{getUILabel('example', language)}</h3>
              <p>{currentItem.example}</p>
            </div>
          )}

          {currentItem.sentence && (
            <div className="card-section">
              <h3>{getUILabel('inASentence', language)}</h3>
              <p className="card-sentence">"{currentItem.sentence}"</p>
            </div>
          )}

          {/* Code Example */}
          {currentItem.code && (
            <div className="card-section">
              <h3>{getUILabel('codeExample', language)}</h3>
              <SyntaxHighlight code={currentItem.code} className="card-code" />
            </div>
          )}

          {/* Best For (loops) */}
          {currentItem.bestFor && (
            <div className="card-section">
              <h3>{getUILabel('bestFor', language)}</h3>
              <p>{currentItem.bestFor}</p>
            </div>
          )}

          {/* Gotcha */}
          {currentItem.gotcha && (
            <div className="card-section card-gotcha">
              <h3>⚠️ {getUILabel('gotcha', language)}</h3>
              <p>{currentItem.gotcha}</p>
            </div>
          )}

          {/* Real World (Big O) */}
          {currentItem.realWorld && (
            <div className="card-section">
              <h3>{getUILabel('realWorld', language)}</h3>
              <p>{currentItem.realWorld}</p>
            </div>
          )}

          {/* Synonyms (vocabulary) */}
          {currentItem.synonyms && (
            <div className="card-section">
              <h3>{getUILabel('synonyms', language)}</h3>
              <div className="card-synonyms">
                {currentItem.synonyms.map((syn, i) => (
                  <span key={i} className="synonym-tag">{syn}</span>
                ))}
              </div>
            </div>
          )}

          {/* Category badge (methods) */}
          {currentItem.category && (
            <div className="card-type-badge">{currentItem.category}</div>
          )}
        </div>

        {/* Stats */}
        <div className="learn-stats">
          <div className="stat">
            <span className="stat-value">{Object.keys(knownItems).length}</span>
            <span className="stat-label">{language === 'es' ? 'Palabras Aprendidas' : 'Words Learned'}</span>
          </div>
          <div className="stat">
            <span className="stat-value">{CATEGORIES.reduce((acc, c) => acc + c.data.length, 0)}</span>
            <span className="stat-label">{language === 'es' ? 'Términos Totales' : 'Total Terms'}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Learn;
