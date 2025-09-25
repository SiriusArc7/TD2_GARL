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

  useEffect(() => {
    Promise.all([
      fetch('/red_attr.json').then(res => res.json()),
      fetch('/blu_attr.json').then(res => res.json()),
      fetch('/yel_attr.json').then(res => res.json()),
      fetch('/brands.json').then(res => res.json()),
      fetch('/gears.json').then(res => res.json()),
      fetch('/equipment-backgrounds.json').then(res => res.json())
    ]).then(([redData, bluData, yelData, brandsData, gearsData, backgroundsData]) => {
      const allData = [
        ...Object.values(redData),
        ...Object.values(bluData),
        ...Object.values(yelData)
      ].map((item, index) => ({...item, originalIndex: index}));
      setGearData(allData);
      setBrands(brandsData);
      setGears(gearsData);
      setEquipmentBackgrounds(backgroundsData);
    }).catch(error => console.error('Error loading data:', error));
  }, []);

  return (
    <>
    <div class="title">
      <h1>GARL</h1><h3>Tom Clancy's The Division 2 - Gear Attributes Reverse-Lookup</h3>
    </div>
    <div class="main">
      <div class="gear-bonus">
        <div style={{marginBottom: '10px', display: 'flex', gap: '8px'}}>
          <input
            type="text"
            placeholder="Search attributes..."
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
              title="Clear search"
            >
              ×
            </button>
          )}
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
          <button key={index} className={item.core} onClick={() => setSelectedAttrs(prev => prev.includes(item.attr) ? prev.filter(a => a !== item.attr) : [...prev, item.attr])}>{selectedAttrs.includes(item.attr) ? '✅' : ''}{item.attr}</button>
        ))}
      </div>
      <div class="selector">
        <div style={{marginBottom: '10px'}}>
          <label>
            <input type="checkbox" checked={showOnlyMatching} onChange={e => setShowOnlyMatching(e.target.checked)} />
            Hide non-matching items
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
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
