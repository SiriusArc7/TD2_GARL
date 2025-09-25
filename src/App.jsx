import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [gearData, setGearData] = useState([]);
  const [brands, setBrands] = useState({});
  const [gears, setGears] = useState({});
  const [selectedAttrs, setSelectedAttrs] = useState([]);
  const [showOnlyMatching, setShowOnlyMatching] = useState(false);
  const [gearSearchTerm, setGearSearchTerm] = useState('');
  const [equipmentBackgrounds, setEquipmentBackgrounds] = useState({});

  // Language detection and translations
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Detect user's language
    const userLang = navigator.language || navigator.userLanguage;
    const urlParams = new URLSearchParams(window.location.search);
    const selectedLang = urlParams.get('lang') ||
                        localStorage.getItem('language') ||
                        (userLang.startsWith('ja') ? 'ja' : 'en');

    setCurrentLanguage(selectedLang);
    localStorage.setItem('language', selectedLang);
  }, []);

  const translations = {
    en: {
      title: "GARL",
      subtitle: "Gear Attributes Reverse-Lookup",
      searchPlaceholder: "Search attributes...",
      hideMatching: "Hide non-matching items",
      clearSearch: "Clear search"
    },
    ja: {
      title: "GARL",
      subtitle: "装備特性逆引きツール",
      searchPlaceholder: "装備特性を検索...",
      hideMatching: "一致しない装備を非表示",
      clearSearch: "検索をクリア"
    }
  };

  const t = translations[currentLanguage] || translations.en;

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const langSuffix = currentLanguage === 'ja' ? '_ja' : '';

    Promise.all([
      fetch(`${baseUrl}red_attr${langSuffix}.json`).then(res => res.json()),
      fetch(`${baseUrl}blu_attr${langSuffix}.json`).then(res => res.json()),
      fetch(`${baseUrl}yel_attr${langSuffix}.json`).then(res => res.json()),
      fetch(`${baseUrl}brands${langSuffix}.json`).then(res => res.json()),
      fetch(`${baseUrl}gears${langSuffix}.json`).then(res => res.json()),
      fetch(`${baseUrl}equipment-backgrounds.json`).then(res => res.json())
    ]).then(([redData, bluData, yelData, brandsData, gearsData, backgroundsData]) => {
      const allData = [
        ...redData.map(item => ({...item, core: 'red'})),
        ...bluData.map(item => ({...item, core: 'blue'})),
        ...yelData.map(item => ({...item, core: 'yellow'}))
      ].map((item, index) => ({...item, originalIndex: index}));
      setGearData(allData);
      setBrands(brandsData);
      setGears(gearsData);
      setEquipmentBackgrounds(backgroundsData);
    }).catch(error => console.error('Error loading data:', error));
  }, [currentLanguage]);

  return (
    <>
    <div class="title">
      <h1>{t.title} - The Division 2 Gear Lookup</h1><h3>{t.subtitle}</h3>
    </div>
    <div class="main">
      <div class="gear-bonus">
        <div style={{marginBottom: '10px', display: 'flex', gap: '8px', alignItems: 'center'}}>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={gearSearchTerm}
            onChange={(e) => setGearSearchTerm(e.target.value)}
            style={{flex: 1, padding: '8px', fontSize: '14px'}}
          />
          {gearSearchTerm && (
            <button
              onClick={() => setGearSearchTerm('')}
              style={{
                padding: '8px 12px',
                backgroundColor: '#d43e3eff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title={t.clearSearch}
            >
              ×
            </button>
          )}
          <div style={{display: 'flex', gap: '4px', marginLeft: '8px'}}>
            <button
              onClick={() => {
                setCurrentLanguage('en');
                localStorage.setItem('language', 'en');
              }}
              style={{
                padding: '4px 8px',
                backgroundColor: currentLanguage === 'en' ? '#007bff' : '#f0f0f0',
                color: currentLanguage === 'en' ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              EN
            </button>
            <button
              onClick={() => {
                setCurrentLanguage('ja');
                localStorage.setItem('language', 'ja');
              }}
              style={{
                padding: '4px 8px',
                backgroundColor: currentLanguage === 'ja' ? '#007bff' : '#f0f0f0',
                color: currentLanguage === 'ja' ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              日本語
            </button>
          </div>
        </div>
        {gearData.filter(item =>
          gearSearchTerm === '' || item.attr.toLowerCase().includes(gearSearchTerm.toLowerCase())
        ).sort((a, b) => {
          const aSelected = selectedAttrs.includes(a.attr);
          const bSelected = selectedAttrs.includes(b.attr);
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return a.originalIndex - b.originalIndex;
        }).map((item, index) => (
          <button
            key={index}
            className={item.core}
            onClick={() => setSelectedAttrs(prev => prev.includes(item.attr) ? prev.filter(a => a !== item.attr) : [...prev, item.attr])}
            style={{
              color: item.core === 'red' ? '#dc3545' :
                     item.core === 'blue' ? '#007bff' :
                     item.core === 'yellow' ? '#ffc107' : 'inherit'
            }}
          >{selectedAttrs.includes(item.attr) ? '✅' : ''}{item.attr}</button>
        ))}
      </div>
      <div class="selector">
        <div style={{marginBottom: '10px'}}>
          <label>
            <input type="checkbox" checked={showOnlyMatching} onChange={e => setShowOnlyMatching(e.target.checked)} />
            {t.hideMatching}
          </label>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          {[
            ...Object.entries(brands).map(([name, attrs]) => ({type: 'brand', name, attrs})),
            ...Object.entries(gears).map(([name, attrs]) => ({type: 'gear', name, attrs}))
          ].filter(({attrs}) => !showOnlyMatching || Object.keys(attrs).some(attr => selectedAttrs.includes(attr))).sort((a, b) => {
            const aHas = Object.keys(a.attrs).some(attr => selectedAttrs.includes(attr));
            const bHas = Object.keys(b.attrs).some(attr => selectedAttrs.includes(attr));
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            return 0;
          }).map(({type, name, attrs}) => {
            const hasSelected = Object.keys(attrs).some(attr => selectedAttrs.includes(attr));
            const backgroundImage = equipmentBackgrounds[name];
            return (
              <div key={`${type}-${name}`} className={type} style={{width: '220px', height: '150px', border: `1px solid ${hasSelected ? 'yellow' : 'black'}`, padding: '10px', margin: '5px'}}>
                <div className="equipment-name" style={{
                  backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  padding: '8px',
                  borderRadius: '4px',
                  textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.8)' : 'none',
                  minHeight: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}>{name}</div>
              {Object.entries(attrs).map(([attr, val]) => (
                <div key={attr} style={{cursor: 'pointer', textDecoration: selectedAttrs.includes(attr) ? 'underline' : 'none'}} onClick={() => setSelectedAttrs(prev => prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr])}>{attr}: {val}</div>
              ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  )
}

export default App
