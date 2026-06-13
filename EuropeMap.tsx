import React from 'react';
import { KeyCountry } from '../types';
import { MapPin, Info, TrendingUp } from 'lucide-react';
import { translations } from '../translations';

interface EuropeMapProps {
  countryScores: Record<KeyCountry, number>;
  selectedCountry: KeyCountry | 'ALL';
  onSelectCountry: (country: KeyCountry | 'ALL') => void;
  countriesMetadata: Record<KeyCountry, any>;
  lang?: 'pl' | 'en';
}

export default function EuropeMap({
  countryScores,
  selectedCountry,
  onSelectCountry,
  countriesMetadata,
  lang = 'pl',
}: EuropeMapProps) {
  const t = translations[lang];

  // SVG coordinates for countries mapped manually to form a beautiful, stylized bento-grid schematic map of Central/Eastern Europe
  const mapNodes: Array<{ code: KeyCountry; name: string; x: number; y: number; flag: string; scale: number }> = [
    { code: 'DE', name: lang === 'pl' ? 'Niemcy' : 'Germany', x: 22, y: 35, flag: '🇩🇪', scale: 1.1 },
    { code: 'AT', name: lang === 'pl' ? 'Austria' : 'Austria', x: 24, y: 65, flag: '🇦🇹', scale: 0.95 },
    { code: 'PL', name: lang === 'pl' ? 'Polska' : 'Poland', x: 50, y: 30, flag: '🇵🇱', scale: 1.25 },
    { code: 'CZ', name: lang === 'pl' ? 'Czechy' : 'Czech Republic', x: 38, y: 50, flag: '🇨🇿', scale: 0.95 },
    { code: 'SK', name: lang === 'pl' ? 'Słowacja' : 'Slovakia', x: 52, y: 55, flag: '🇸🇰', scale: 0.9 },
    { code: 'HU', name: lang === 'pl' ? 'Węgry' : 'Hungary', x: 54, y: 72, flag: '🇭🇺', scale: 0.95 },
    { code: 'UA', name: lang === 'pl' ? 'Ukraina' : 'Ukraine', x: 80, y: 40, flag: '🇺🇦', scale: 1.35 },
    { code: 'LT', name: lang === 'pl' ? 'Litwa' : 'Lithuania', x: 68, y: 12, flag: '🇱🇹', scale: 0.8 },
    { code: 'LV', name: lang === 'pl' ? 'Łotwa' : 'Latvia', x: 74, y: -4, flag: '🇱🇻', scale: 0.8 },
    { code: 'RO', name: lang === 'pl' ? 'Rumunia' : 'Romania', x: 76, y: 76, flag: '🇷🇴', scale: 1.15 },
  ];

  const getHeatmapColor = (score: number) => {
    if (score >= 60) return { bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30', pill: 'bg-emerald-500', bar: 'bg-emerald-500' };
    if (score >= 40) return { bg: 'bg-amber-950/40 text-amber-400 border-amber-900/30', pill: 'bg-amber-400', bar: 'bg-amber-400' };
    return { bg: 'bg-rose-950/40 text-rose-400 border-rose-900/30', pill: 'bg-rose-400', bar: 'bg-rose-500' };
  };

  const getMapPositionClass = (code: KeyCountry) => {
    switch (code) {
      case 'LV': return 'top-[5%] left-[65%]';
      case 'LT': return 'top-[21%] left-[65%]';
      case 'PL': return 'top-[36%] left-[40%]';
      case 'DE': return 'top-[38%] left-[4%]';
      case 'CZ': return 'top-[52%] left-[22%]';
      case 'SK': return 'top-[54%] left-[44%]';
      case 'UA': return 'top-[41%] left-[82%]';
      case 'AT': return 'top-[68%] left-[12%]';
      case 'HU': return 'top-[74%] left-[48%]';
      case 'RO': return 'top-[72%] left-[78%]';
      default: return '';
    }
  };

  return (
    <div id="europe-geo-map-frame" className="bg-[#151921] rounded-2xl border border-slate-800 p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              {t.dashboard.mapTitle}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.dashboard.mapDesc}
            </p>
          </div>
          <button
            onClick={() => onSelectCountry('ALL')}
            className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition cursor-pointer ${
              selectedCountry === 'ALL'
                ? 'bg-cyan-500 text-[#0F1115]'
                : 'bg-[#0F1115] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {t.dashboard.clearFilter}
          </button>
        </div>

        {/* Dynamic Schematic Map Area */}
        <div className="relative w-full h-[260px] bg-[#0F1115] rounded-xl border border-slate-800/80 p-3 mt-1.5 overflow-hidden select-none">
          {/* Subtle geographical gridlines */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-[0.05] border-slate-700">
            <div className="border-r border-b border-slate-700"></div>
            <div className="border-r border-b border-slate-700"></div>
            <div className="border-r border-b border-slate-700"></div>
            <div className="border-r border-b border-slate-700"></div>
            <div className="border-r border-b border-slate-700"></div>
            <div className="border-r border-b border-slate-700"></div>
          </div>

          <span className="absolute bottom-2.5 left-3 text-[9px] font-mono text-slate-500 tracking-wider">
            {t.dashboard.gridScale}
          </span>

          {mapNodes.map((node) => {
            const score = countryScores[node.code] || 0;
            const styleProps = getHeatmapColor(score);
            const isSelected = selectedCountry === node.code;

            return (
              <button
                key={node.code}
                id={`map-node-${node.code}`}
                onClick={() => onSelectCountry(node.code)}
                className={`absolute ${getMapPositionClass(
                  node.code
                )} group flex flex-col items-center transition-all duration-300 z-10 cursor-pointer`}
                style={{ transform: isSelected ? 'scale(1.05)' : 'scale(1)' }}
              >
                {/* Node Pin */}
                <div
                  style={node.code === 'LV' ? { paddingTop: '0px', paddingLeft: '5px', paddingRight: '-4px' } : undefined}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-cyan-500 text-[#0F1115] border-cyan-400 shadow-md shadow-cyan-950/50 ring-2 ring-cyan-500/25'
                      : 'bg-[#151921] text-slate-300 border-slate-800 hover:border-cyan-500/60 hover:text-white hover:shadow'
                  }`}
                >
                  <span className="text-xs">{node.flag}</span>
                  <span className="text-xs font-semibold tracking-tight uppercase font-mono">
                    {node.code}
                  </span>
                  <span
                    className={`text-[10px] px-1 rounded-sm font-semibold ${
                      isSelected
                        ? 'bg-[#0F1115]/20 text-[#0F1115]'
                        : score >= 60
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                        : score >= 40
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                    }`}
                  >
                    {score}%
                  </span>
                </div>

                {/* Simulated Region Border Pulse on Hover */}
                <span
                  className={`absolute -inset-2 rounded-full pointer-events-none duration-700 animate-ping opacity-10 bg-cyan-500 scale-150 transition ${
                    isSelected ? 'block' : 'hidden group-hover:block'
                  }`}
                ></span>
              </button>
            );
          })}

          {/* Compass / Legend */}
          <div 
            style={{ paddingLeft: '8px', marginLeft: '80px' }}
            className="absolute top-2.5 right-2.5 bg-[#0F1115]/90 backdrop-blur-md p-2 rounded-lg border border-slate-800/80 text-[9px] space-y-1"
          >
            <div className="font-bold text-slate-400 tracking-wide uppercase">{lang === 'pl' ? 'Indeks Widoczności AI' : 'AI Visibility Index'}</div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-sm bg-emerald-500"></span>
              <span>{lang === 'pl' ? 'Wysoki (≥60%)' : 'High (≥60%)'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-sm bg-amber-400"></span>
              <span>{lang === 'pl' ? 'Średni (40-59%)' : 'Moderate (40-59%)'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-sm bg-rose-500"></span>
              <span>{lang === 'pl' ? 'Niski (<40%)' : 'Low (<40%)'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Country Diagnostic panel */}
      <div className="mt-3 bg-[#0F1115] rounded-xl p-3.5 border border-slate-800">
        {selectedCountry === 'ALL' ? (
          <div className="text-center py-2">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 leading-snug">
              <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <span>
                {lang === 'pl' 
                  ? 'Wybierz kraj na mapie, aby filtrować zapytania i badać lokalną konkurencję.' 
                  : 'Select a country on the map to filter queries and analyze localized competition.'}
              </span>
            </p>
          </div>
        ) : (
          <div>
            {(() => {
              const meta = countriesMetadata[selectedCountry] || {};
              const score = countryScores[selectedCountry] || 0;
              const nodeName = mapNodes.find((n) => n.code === selectedCountry)?.name || selectedCountry;
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold">
                        {mapNodes.find((n) => n.code === selectedCountry)?.flag}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block leading-tight">
                          {nodeName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                          Domain: {meta.localBrand} | Lang: {meta.language}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-cyan-400 block leading-tight">
                        {score}% {lang === 'pl' ? 'Widoczności' : 'Visibility'}
                      </span>
                      <span className="text-[10px] text-cyan-500 font-medium flex items-center justify-end gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {lang === 'pl' ? 'Aktywny' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Competitor list */}
                  <div className="border-t border-slate-800/80 pt-2">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                      {lang === 'pl' ? 'Lokalny Indeks Konkurencji' : 'Target Competitor Index'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {meta.competitors?.map((comp: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-[#151921] border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-medium"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
