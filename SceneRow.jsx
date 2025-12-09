// src/components/SceneRow.jsx (FINAL FIX for data display)
import React from 'react';

const SceneRow = ({ id, scene, dayNumber = null, date = null, isSelected = false, onToggleSelect = null }) => {
    
    // Null check for scene object
    if (!scene) {
        return (
            <tr className="bg-red-900/50 text-red-200">
                <td colSpan={TABLE_HEADERS.length} className="p-1">Error: Scene data missing. (ID: {id})</td>
            </tr>
        );
    }
    
    // Scene data fields (excluding Sel column, Day number handled separately)
    const columns = [
        // ... (EP No, Sc No, Time, Location, Sub_Location, Characters, Props)
        scene['EP No'] || '—',
        scene['Sc No'] || '—',
        scene.Time || '—',
        scene.Location || '—',
        scene.Sub_Location || '—',
        scene.Characters || '—',
        scene.Props || '—',
        (scene.Synopsis && scene.Synopsis !== 'No Synopsis Found' ? scene.Synopsis : scene.Scene_Synopsis) || '—', 
        
        (scene['Phon Talk'] === 'Yes' || scene.Phone_Talk === 'Yes' ? '📞' : '—'),
        
        date || '—', 
        '—'           
    ];
    
    const isUnscheduled = dayNumber === null;

    return (
        <tr
            className={`
                bg-rm-bg-surface/30 border-t border-rm-accent/20 align-top transition-all 
                hover:bg-rm-bg-surface/60
                cursor-default 
                align-top 
                ${isSelected ? 'bg-rm-cyan/20' : ''} 
            `} 
        >
            {/* Checkbox Column */}
            <td className="px-1 py-[2px] border border-rm-accent/20 text-center w-[30px] align-top">
                {onToggleSelect && ( 
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(id)}
                        className="w-4 h-4 text-rm-cyan bg-rm-dark-bg border-rm-cyan/50 rounded focus:ring-rm-cyan cursor-pointer"
                    />
                )}
            </td>
            
            {/* Day Number cell */}
            <td className={`px-1 py-[2px] border border-rm-accent/20 text-center font-bold align-top w-[35px] ${isUnscheduled ? 'text-rm-text-light/40' : 'text-rm-accent'}`}>
                {dayNumber !== null ? `D${dayNumber}` : '—'}
            </td>
            
            {/* Actual Data Cells */}
            {columns.map((value, i) => (
                <td 
                    key={i} 
                    className={`px-1 py-[2px] border border-rm-accent/20 text-xs whitespace-normal break-words align-top ${
                        i === 5 ? 'font-semibold text-rm-accent' : 
                        i === 6 ? 'italic text-rm-text-light/80' : 
                        'text-rm-text-light'
                    }`}
                    style={{ 
                        textAlign: (i < 3 || i === 9 || i === 10) ? 'center' : 'left'
                    }}
                >
                    {value}
                </td>
            ))}
        </tr>
    );
};
export default SceneRow;
