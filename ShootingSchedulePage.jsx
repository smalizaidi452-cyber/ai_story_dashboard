// src/pages/ShootingSchedulePage.jsx (FINAL CHECKBOX MOVE LOGIC - ERROR FIXED - v4)

import React, { useState, useEffect, useCallback, useMemo } from 'react';

import axios from 'axios';
import { Clock, Film, List, CalendarPlus, X, Loader, ChevronDown, ArrowRight } from 'lucide-react'; 
import SceneCard from '../components/SceneCard';
import SceneRow from '../components/SceneRow';
// Base URL for API calls
const API_BASE_URL = 'http://localhost:5000'; 
const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

// ====================================================
// GLOBAL CONSTANTS (TABLE HEADERS & CUSTOM CLASSES)
// ====================================================
const TABLE_HEADERS = [
    { label: 'Sel', width: '30px' }, // Checkbox/Select column
    { label: 'Day', width: '35px' }, 
    { label: 'EP', width: '35px' }, 
    { label: 'SC', width: '35px' }, 
    { label: 'Time', width: '50px' }, 
    { label: 'Location', width: '80px' }, 
    { label: 'Sub Loc', width: '80px' }, 
    { label: 'Characters', width: '100px' }, 
    { label: 'Props', width: '80px' }, 
    { label: 'Synopsis', width: '150px' }, 
    { label: 'Phone', width: '35px' }, 
    { label: 'Sch. Date', width: '70px' }, 
    { label: 'Rec. Date', width: '70px' }, 
];

// ====================================================
// SUB-COMPONENT: DetailItem (No Change)
// ====================================================
const DetailItem = ({ label, value, isBold, isItalic, className }) => (
    <p className={`flex items-start text-[10px] leading-snug whitespace-normal break-words ${className}`}>
        <span className="font-medium text-rm-accent mr-1">{label}:</span> 
        <span
            className={`text-rm-text-light ${isBold ? "font-semibold" : "font-normal"} ${
                isItalic ? "italic" : ""
            }`}
        >
            {value}
        </span>
    </p>
);

// ====================================================
// NEW SUB-COMPONENT: MoveScenesDropdown (For inter-day transfer)
// ====================================================
const MoveScenesDropdown = ({ currentDayId, shootingDays, handleMove, selectedCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Unscheduled list aur baqi days ko target banaya ja sakta hai
    const targets = shootingDays.map(day => ({ id: day.id, name: `Day ${day.number}` }));
    targets.unshift({ id: 'unscheduled', name: 'Unscheduled' }); // Unscheduled ko shamil karna

    const availableTargets = targets.filter(day => day.id !== currentDayId);
    
    const isDisabled = selectedCount === 0;

    const handleSelectDay = (targetDayId) => {
        handleMove(targetDayId);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left mb-3 z-30">
            <button
                type="button"
                className={`inline-flex justify-center w-full rounded-md border shadow-sm px-4 py-2 text-sm font-medium ${
                    isDisabled 
                        ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed border-gray-600'
                        : 'bg-rm-cyan text-rm-dark-bg hover:bg-rm-cyan/90 border-rm-cyan shadow-neon-cyan/50'
                }`}
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
                disabled={isDisabled}
            >
                {selectedCount > 0 ? `Move ${selectedCount} Scene(s)` : 'Select to Move'}
                <ChevronDown className="-mr-1 ml-2 h-5 w-5" />
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-rm-bg-surface ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <span className="block px-4 py-2 text-xs text-gray-400 border-b border-rm-dark-bg/50">
                            Move selected to...
                        </span>
                        {availableTargets.map(day => (
                            <button
                                key={day.id}
                                onClick={() => handleSelectDay(day.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-rm-text-light hover:bg-rm-bg-surface/70"
                            >
                                <ArrowRight className="h-4 w-4 mr-2 text-rm-cyan" /> {day.name} {day.number ? `(Day ${day.number})` : ''} 
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ====================================================
// SUB-COMPONENT: DayContainer (DND/Droppable removed)
// ====================================================
const DayContainer = ({ id, children, name, itemsCount, date, onDateChange, viewMode, selectedCountInDay, handleMoveSelectedScenes, shootingDays }) => { 
    
    const isScheduledDay = id !== 'unscheduled';

    return (
        <div 
            className={`p-3 rounded-lg border transition-colors bg-rm-bg-surface/50 backdrop-blur-sm border-rm-accent/40`}
        >
            {/* Title sirf CARD view mein dikhega. */}
            {viewMode === 'card' && ( 
                <div className="flex justify-between items-center mb-2">
                    <h5 className="text-xl font-bold text-rm-text-light">{name}</h5>
                    
                    {/* Date Input Field - Only for Scheduled Days */}
                    {isScheduledDay && (
                        <input
                            type="date"
                            value={date || ''}
                            onChange={(e) => onDateChange(id, e.target.value)}
                            className="p-1 text-sm bg-rm-dark-bg text-rm-cyan border border-rm-accent/50 rounded focus:ring-rm-cyan focus:border-rm-cyan"
                            title="Shooting Date Select Karen"
                        />
                    )}
                </div>
            )}
            
            {/* Table View mein Day Container ka title upar dikhayenge */}
            {viewMode === 'table' && (
                <div className="flex justify-between items-center bg-rm-bg-surface p-2 rounded-t-md text-sm font-semibold mb-1 border-b border-rm-accent/40">
                    <p className="text-rm-text-light">{name}</p>
                    {isScheduledDay && (
                        <input
                            type="date"
                            value={date || ''}
                            onChange={(e) => onDateChange(id, e.target.value)}
                            className="p-1 text-xs bg-rm-dark-bg text-rm-cyan border border-rm-accent/50 rounded focus:ring-rm-cyan focus:border-rm-cyan"
                            title="Shooting Date Select Karen"
                        />
                    )}
                </div>
            )}
            
            {/* NEW: Move Dropdown (Scheduled aur Unscheduled dono ke liye) */}
            {(isScheduledDay || id === 'unscheduled') && (
                <MoveScenesDropdown 
                    currentDayId={id} 
                    shootingDays={shootingDays}
                    handleMove={handleMoveSelectedScenes}
                    selectedCount={selectedCountInDay} 
                />
            )}

            {children}
            
            {itemsCount === 0 && (
                <div className="p-4 border-dashed border-2 border-rm-accent/30 text-rm-text-light/40 text-center rounded">
                    {id === 'unscheduled' ? 'All scenes have been scheduled.' : 'No scenes scheduled for this day.'}
                </div>
            )}
        </div>
    );
};


  // ---------------- Fetch Scenes ----------------
  async function fetchScenes() {
    setLoadingScenes(true);
    setScenesError("");
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}/scenes`);
      if (!res.ok) throw new Error("Scenes fetch failed");
      const data = await res.json();
      // Normalize scene id field to 'id'
      const normalized = Array.isArray(data)
        ? data.map((s) => ({ ...s, id: s.id || s._id || s._id?.toString?.() || String(Math.random()) }))
        : [];
      setScenes(normalized);
    } catch (err) {
      console.error("Scenes fetch error:", err);
      setScenesError("Could not load scenes from server.");
      setScenes([]); // keep empty so user knows backend didn't return data
    } finally {
      setLoadingScenes(false);
    }
  }

  // ---------------- Fetch single day (from backend) ----------------
  // If a day is already present locally (days array), we don't overwrite scenes unless backend returns something different.
  async function fetchDay(dayNumber) {
    try {
      const res = await fetch(`${API_BASE}/api/schedule/load/day/${projectId}/${dayNumber}`);
      if (!res.ok) {
        console.warn("No day data found on server for day", dayNumber);
        return null;
      }
      const data = await res.json();
      // data expected: { dayName, date, scenes, id, ... } or similar
      // Normalize to our day shape:
      const dayObj = {
        id: data.id || data.dayId || `day-${dayNumber}`,
        name: data.name || data.dayName || `Day ${dayNumber}`,
        dayNumber: Number(dayNumber),
        date: data.date ? (typeof data.date === "string" ? data.date : new Date(data.date).toISOString().slice(0, 10)) : "",
        scenes: Array.isArray(data.scenes)
          ? data.scenes.map((s) => ({ ...s, id: s.id || s._id || String(Math.random()) }))
          : [],
      };

      // Merge into local days array (replace or push)
      setDays((prev) => {
        const idx = prev.findIndex((d) => Number(d.dayNumber) === Number(dayNumber));
        if (idx === -1) return [...prev, dayObj].sort((a, b) => a.dayNumber - b.dayNumber);
        // replace existing
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...dayObj };
        return copy;
      });

      return dayObj;
    } catch (err) {
      console.error("Error loading day:", err);
      return null;
    }
  }

  // ---------------- Add new day (local) ----------------
  function addNewDay() {
    if (!newDate) {
      alert("براہِ کرم تاریخ منتخب کریں (Select a date).");
      return;
    }
    const dayNumber = days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) + 1 : 1;
    const newDay = {
      id: `day-${Date.now()}`,
      name: `Day ${dayNumber}`,
      dayNumber,
      date: newDate,
      scenes: [],
    };
    setDays((prev) => [...prev, newDay].sort((a, b) => a.dayNumber - b.dayNumber));
    setNewDate("");
    // open it immediately
    setExpandedDay(dayNumber);
  }

  // ---------------- Toggle accordion expand ----------------
  async function toggleExpand(dayNumber) {
    if (expandedDay === dayNumber) {
      setExpandedDay(null);
      return;
    }
    setExpandedDay(dayNumber);
    // if day not present locally, try to fetch from backend
    const exists = days.find((d) => Number(d.dayNumber) === Number(dayNumber));
    if (!exists) {
      await fetchDay(dayNumber);
    }
  }

// ====================================================
// MAIN COMPONENT: ShootingSchedulePage (FINAL WORKING VERSION)
// ====================================================
function ShootingSchedulePage({ projectId = 'mock-project-id', projectName = 'Default ReelMind Project', initialBreakdown }) {
    
    // States
    const [containers, setContainers] = useState({ 'unscheduled': [] });
    const [shootingDays, setShootingDays] = useState([]); 
    const [dayCounter, setDayCounter] = useState(0);
    const [viewMode, setViewMode] = useState('card');
    const [selectedSceneIds, setSelectedSceneIds] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    

    const [filters, setFilters] = useState({
        location: '',
        subLocation: '',
        character: '',
        epNo: '',
    });
    // Fetch Initial Data Function (with MERGE and NORMALIZATION)
    const fetchInitialData = useCallback(async () => {
        // isLoading ko yahan true set na karein, woh useEffect mein handle hoga
        
        const API_BASE_URL = 'http://localhost:5000'; 
        const scheduleUrl = `${API_BASE_URL}/api/schedule/load/${projectId}`; 
        const generateUniqueId = () => Math.random().toString(36).substring(2, 9); 

        try {
            console.log("Calling URL:", scheduleUrl);
            const response = await axios.get(scheduleUrl); 
            
            // ... (Your successful try block logic, including MERGE and NORMALIZATION, goes here)
            // ... (Use the latest MERGE logic with checkField utility)

            const scheduleData = response.data.schedule || {};

            const { 
                allScenes = [], 
                scheduledDays = [], 
                containerData = {}, 
                lastDayCounter = 0 
            } = scheduleData; 
        
            // 1. Scene Key Mapping: BASE SOURCE from initialBreakdown
            const allScenesMap = new Map();
            (initialBreakdown || []).forEach(s => {
                const tempId = `${s['EP No']}_${s['Sc No']}`;
                allScenesMap.set(tempId, { ...s, id: tempId }); 
            });
            
            // 2. API's allScenes data (Merge and Normalize)
            const sourceScenes = [];
            
            // Utility function to check value (retains empty string "")
            // ⚠️ CRITICAL CHANGE: Use only for undefined/null, but let empty string "" pass
            const checkField = (value, fallback) => {
                // If value is explicitly undefined or null, use fallback. Otherwise, use the value (even if it's "")
                if (value === undefined || value === null) {
                    return fallback;
                }
                return value; 
            };

            (allScenes || []).forEach(s => {
                const serverId = s.id || generateUniqueId(); 
                const tempKey = `${s['EP No'] || ''}_${s['Sc No'] || ''}`; 
                const localScene = allScenesMap.get(tempKey) || {};

                // MERGE: Local data hamesha jeetega
                const mergedScene = { 
                    ...s, 
                    ...localScene, 
                    id: serverId 
                };
                
                // FINAL NORMALIZATION: Robust key handling
                const normalizedScene = {
    ...mergedScene,
    
    // Direct access to original keys (if present in local data)
    'EP No': checkField(mergedScene['EP No'], 'N/A'), 
    'Sc No': checkField(mergedScene['Sc No'], 'N/A'), 
    Time: checkField(mergedScene.Time, 'N/A'),
    Location: checkField(mergedScene.Location, 'N/A'),
    Sub_Location: checkField(mergedScene.Sub_Location, 'N/A'),
    Characters: checkField(mergedScene.Characters, 'N/A'),
    Props: checkField(mergedScene.Props, 'N/A'),
    
    // ✅ SYNOPSIS FIX: Use original Scene_Synopsis if Synopsis is missing 
    Synopsis: mergedScene.Scene_Synopsis || mergedScene.Synopsis || 'No Synopsis Found', 
    
    // ✅ PHONE TALK FIX: Phone_Talk key ko 'Phon Talk' mein copy karo
    'Phon Talk': mergedScene.Phone_Talk || mergedScene['Phon Talk'] || 'No',
    
    'Sch. Date': checkField(mergedScene['Sch. Date'], 'N/A'), 
    'Rec. Date': checkField(mergedScene['Rec. Date'], 'N/A'),
};
                
                sourceScenes.push(normalizedScene);
                allScenesMap.set(serverId, normalizedScene); 
            });
// ... rest of the fetchInitialData function

            // Set Containers (Success path)
            let unscheduledIds = containerData['unscheduled'] || sourceScenes.map(s => s.id);
            const finalScenesMap = new Map(sourceScenes.map(s => [s.id, s]));
            
            const unscheduledScenes = unscheduledIds.map(sceneId => finalScenesMap.get(sceneId)).filter(Boolean);
            const newContainers = { 'unscheduled': unscheduledScenes };

            scheduledDays.forEach(day => {
                newContainers[day.id] = containerData[day.id]?.map(sceneId => finalScenesMap.get(sceneId)).filter(Boolean) || [];
            });

            setContainers(newContainers);
            setShootingDays(scheduledDays);
            setDayCounter(lastDayCounter);


        // ShootingSchedulePage.jsx: catch block ke andar yeh code replace karein

        } catch (error) {
            // 🚨 CRITICAL API ISSUE: Log the 404 error but proceed to use local data.
            console.error("Error loading schedule data (API FAILED - Server 404?):", error);
            
            // --- GUARANTEED FALLBACK (Using initialBreakdown data only) ---
            if (Array.isArray(initialBreakdown) && initialBreakdown.length > 0) {
                
                console.log("✅ GUARANTEE: FALLBACK DATA IS LOADING. COUNT:", initialBreakdown.length);
                
                const scenesForContainer = initialBreakdown.map((scene, index) => {
                    
                    // Prioritize user's original keys (e.g., 'EP No', 'Sc No')
                    const epNo = scene['EP No'] || scene.EP_No || 'N/A';
                    const scNo = scene['Sc No'] || scene.Sc_No || 'N/A';
                    
                    // ID FIX: Ensure a stable ID is created using EP/SC No, or index as a last resort
                    const sceneId = scene.id || scene._id || (epNo !== 'N/A' && scNo !== 'N/A' ? `${epNo}_${scNo}` : `FALLBACK_${index + 1}`);
                    
                    return {
                        ...scene,
                        id: sceneId,
                        // Ensure all rendering keys are present, prioritizing original data
                        'EP No': epNo,
                        'Sc No': scNo,
                        Synopsis: scene.Synopsis || scene.synopsis || 'No Synopsis Found',
                        'Phon Talk': scene['Phon Talk'] || 'No',
                        Location: scene.Location || scene.location || 'N/A',
                        Sub_Location: scene.Sub_Location || scene.subLocation || 'N/A',
                        Characters: scene.Characters || 'N/A',
                        Time: scene.Time || 'N/A',
                        // ... Add any other keys used for display here
                    };
                });

                setContainers({ 'unscheduled': scenesForContainer });
                // Fallback mein scheduled days hamesha khali set honge
                setShootingDays([]);
                setDayCounter(0);
                
                console.log("SUCCESS: Unscheduled Scenes Set with Count:", scenesForContainer.length);

            } else {
                 console.log("❌ Fallback failed: Initial Breakdown data is empty.");
            }
        } finally {
            setIsLoading(false); 
        }
    }, [projectId, initialBreakdown]);

    // Initial Data Fetching Effect
    useEffect(() => {
        // 🚨 CRITICAL FIX: Only set loading true if breakdown data is available
        if (projectId && initialBreakdown && initialBreakdown.length > 0) {
             setIsLoading(true);
             fetchInitialData();
        }
    }, [projectId, initialBreakdown, fetchInitialData]);
 
    // 1. Scene Containers Definition (FIXED: Uncommented and correctly defined)
    const unscheduledScenes = containers['unscheduled'] || [];
    const allScheduledScenes = useMemo(() => Object.values(containers).filter(key => key !== 'unscheduled').flat(), [containers]);
    
    // 2. Filter Options useMemo (This remains correct)
    const { uniqueLocations, uniquesubLocations, uniqueCharacters, uniqueEpisodes } = useMemo(() => {
        // Find unique properties across ALL scenes (scheduled or unscheduled) for comprehensive filters
        const allScenes = Object.values(containers).flat();
        const uniqueLocations = [...new Set(allScenes.map(s => s.Location).filter(Boolean))].sort();
        const uniquesubLocations = [...new Set(allScenes.map(s => s.Sub_Location).filter(Boolean))].sort();
        const uniqueEpisodes = [...new Set(allScenes.map(s => s['EP No']).filter(Boolean))].sort((a, b) => a - b);
        
        // Character extraction for filter
        const allCharacters = allScenes.map(s => s.Characters?.split(',').map(c => c.trim())).flat().filter(Boolean);
        const uniqueCharacters = [...new Set(allCharacters)].sort();

        return { uniqueLocations, uniquesubLocations, uniqueCharacters, uniqueEpisodes };
    }, [containers]); 
    //(Filtering Logic - Replace the existing useMemo block)
    const filteredUnscheduledScenes = useMemo(() => {
    let filtered = unscheduledScenes;

    // filters object se values nikalen
    const { location, subLocation, character, epNo } = filters; 

    // 1. Location Filter
    if (location) {
        filtered = filtered.filter(scene => scene.Location === location);
    }
    
    // 2. Sub-Location Filter
    if (subLocation) {
        filtered = filtered.filter(scene => scene.Sub_Location === subLocation);
    }
    
    // 3. Episode Filter
    if (epNo) {
        filtered = filtered.filter(scene => String(scene['EP No']) === String(epNo));
    }

    // 4. Character Filter (Text Input)
    if (character) {
        const lowerCharacter = character.toLowerCase();
        filtered = filtered.filter(scene => 
            scene.Characters && scene.Characters.toLowerCase().includes(lowerCharacter)
        );
    }
    
    return filtered;

}, [unscheduledScenes, filters]);
// Ab dependency sirf filters object aur unscheduledScenes hai.

const totalScenesUnfiltered = unscheduledScenes.length;
    
    // Checkbox Toggle Logic (Now works for ALL scenes, not just Unscheduled)
    const toggleSceneSelection = useCallback((sceneId) => {
        setSelectedSceneIds(prev => {
            if (prev.includes(sceneId)) {
                return prev.filter(id => id !== sceneId);
            } else {
                return [...prev, sceneId];
            }
        });
    }, []);

    // ----------------------------------------------------
    // ... rest of the code for Drag and Drop, Add Day, etc.
    // ----------------------------------------------------
    // ----------------------------------------------------
    // NEW: Handle Move Selected Scenes (Core Logic)
    // ----------------------------------------------------
    const handleMoveSelectedScenes = (targetDayId) => {
        if (selectedSceneIds.length === 0) {
            alert('Barah-e-mehrbani, pehle scenes select karen jinhe move karna hai.');
            return;
        }

        setContainers(prevContainers => {
            let scenesToMove = [];
            let newContainers = { ...prevContainers };

            // 1. Selected scenes ko Dhoondna aur unke purane container se Hata Dena
            Object.keys(newContainers).forEach(containerId => {
                // Ensure containerId exists and is an array before filtering
                if (Array.isArray(newContainers[containerId])) {
                     newContainers[containerId] = newContainers[containerId].filter(scene => {
                        const isSelected = selectedSceneIds.includes(scene.id);
                        if (isSelected) {
                            scenesToMove.push(scene);
                        }
                        // Current container mein sirf un scenes ko rehne do jo selected nahi thay
                        return !isSelected;
                    });
                }
            });

            // 2. Target container mein move kiye hue scenes Shamil karna
            if (!newContainers[targetDayId]) {
                newContainers[targetDayId] = [];
            }
            
            const existingScenesInTarget = newContainers[targetDayId] || [];

            // Add newly moved scenes to the end of the target list
            newContainers[targetDayId] = [
                ...existingScenesInTarget, 
                ...scenesToMove            
            ];
            
            return newContainers;
        });
        
        // Reset selection after moving
        setSelectedSceneIds([]);
    };
    
    // Shooting Day ki Date Change Karna 
    const handleDateChange = useCallback((dayId, newDate) => {
        setShootingDays(prevDays => 
            prevDays.map(day => 
                day.id === dayId ? { ...day, date: newDate } : day
            )
        );
    }, []); 
    
    // Shooting Day Add Karna 
    const addShootingDay = useCallback(() => {
        const nextDayNumber = dayCounter + 1;
        const newDayId = `day-${nextDayNumber}`;
        const newDayName = `Shooting Day ${nextDayNumber}`;
        
        setContainers(prev => ({
            ...prev,
            [newDayId]: []
        }));

        setShootingDays(prev => [
            ...prev,
            { 
                id: newDayId, 
                number: nextDayNumber, 
                name: newDayName, 
                date: new Date().toISOString().substring(0, 10) // Format: YYYY-MM-DD
            }
        ]);

        setDayCounter(prev => prev + 1);
    }, [dayCounter]);
    
    // Handle Save Schedule (UNCHANGED but still necessary)
    const handleSaveSchedule = async () => {
        // Prepare container data (only scene IDs are needed for structure)
        const containerData = Object.keys(containers).reduce((acc, key) => {
            // Ensure the container list is an array of scene objects before mapping to IDs
            acc[key] = Array.isArray(containers[key]) ? containers[key].map(scene => scene.id) : [];
            return acc;
        }, {});
        
        // Collect all scene objects
        const allScenes = Object.values(containers).flat().filter(Boolean);
        
        // Create payload for API
        const payload = {
            projectId: projectId,
            scheduledDays: shootingDays, 
            containerData: containerData, 
            allScenes: allScenes, 
            dayCounter: dayCounter,
        };
        
        // 2. API Call karna
        try {
            const response = await axios.post(`${API_BASE_URL}/api/schedule/save`, payload);
            
            if (response.status === 200 || response.status === 201) {
                alert('Schedule successfully saved to the server! 🎉');
            } else {
                alert(`Error saving schedule: Server responded with status ${response.status}.`);
            }
            
        } catch (error) {
            console.error("Failed to save schedule:", error);
            alert(`Failed to save schedule. Please check the network connection or server status. Error: ${error.message}`);
        }
    };
    
    // ... [Existing Loading Screen remains UNCHANGED] ...
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-rm-dark-bg text-rm-text-light text-xl">
                <Loader className="w-8 h-8 mr-3 animate-spin text-rm-accent shadow-neon-blue" />
                Loading ReelMind Schedule...
            </div>
        );
    }
    
    // ----------------------------------------------------
    // Component Render (DND Context Removed)
    // ----------------------------------------------------
    return (
        <div className="p-4 bg-rm-dark-bg min-h-screen text-rm-text-light">
            {/* Glassmorphism Main Panel */}
            <div className="p-4 bg-rm-bg-surface/70 backdrop-blur-md rounded-lg shadow-xl border border-rm-accent/30">
                <div className="flex justify-between items-center mb-6 border-b border-rm-cyan pb-3">
                    {/* Header Title with Neon Blue/Pink Accent */}
                    <h3 className="text-2xl font-bold text-rm-accent flex items-center shadow-neon-blue/40">
                        <Clock className="w-6 h-6 mr-2 text-rm-cyan shadow-neon-cyan" />
                        Shooting Schedule Builder
                    </h3>
                    
                    <div className="flex space-x-4">
                        {/* View Toggle Button */}
                        <button
                            onClick={() => setViewMode(prev => prev === 'card' ? 'table' : 'card')}
                            className="px-4 py-2 bg-rm-accent hover:bg-rm-accent/80 rounded font-bold text-rm-dark-bg transition shadow-neon-blue/50"
                        >
                            {viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
                        </button>
                        
                        {/* Save Button */}
                        <button
                            onClick={handleSaveSchedule}
                            className="px-6 py-2 bg-rm-cyan hover:bg-rm-cyan/80 rounded font-bold text-rm-dark-bg transition shadow-neon-cyan/50"
                        >
                            Save Schedule
                        </button>
                    </div>
                </div>

                {/* Project Summary */}
                <div className="flex space-x-6 text-rm-text-light/80 mb-6">
                    <p className="flex items-center text-sm">
                        <Film className="w-4 h-4 mr-2 text-rm-accent shadow-neon-blue/50" /> 
                        Project: <span className="font-semibold ml-1 text-rm-text-light">{projectName}</span>
                    </p>
                    <p className="flex items-center text-sm">
                        <List className="w-4 h-4 mr-2 text-rm-accent shadow-neon-blue/50" /> 
                        Total Scenes (Unscheduled): <span className="font-semibold ml-1 text-rm-text-light">{totalScenesUnfiltered}</span>
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* 1. Unscheduled Scenes List (Sidebar - STICKY) */}
                    <div className="lg:col-span-1 p-4 bg-rm-bg-surface/60 rounded-lg h-full lg:max-h-[85vh] overflow-y-auto lg:sticky lg:top-4 border border-rm-accent/30"> 
                        <h4 className="text-lg font-semibold text-rm-cyan mb-3 flex items-center shadow-neon-cyan/50">
                            <List className="w-5 h-5 mr-2" /> Unscheduled Scenes
                        </h4>
                        
                        {/* Filters */}
                        <div className="mb-4 space-y-2">
                            <h5 className="text-sm font-semibold text-rm-text-light/80 border-b border-rm-accent/40 pb-1 flex justify-between items-center">
                                Filters: 
                                <button onClick={() => setFilters({location: '', subLocation: '', character: '', epNo: ''})} className="text-xs text-rm-cyan hover:text-rm-cyan/80 flex items-center">
                                    <X className="w-3 h-3 mr-1" /> Clear
                                </button>
                            </h5>
                            
                            {/* ... [Existing Filter Dropdowns] ... */}
                            <select
                                value={filters.location}
                                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value, subLocation: '' }))}
                                className="w-full p-2 text-sm bg-rm-dark-bg border border-rm-accent/50 rounded focus:ring-rm-accent focus:border-rm-accent text-rm-accent" 
                            >
                                <option className="text-rm-text-light/80" value="">All Locations</option>
                                {uniqueLocations.map(loc => (
                                    <option className="text-rm-text-light" key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            
                            <select
                                value={filters.subLocation}
                                onChange={(e) => setFilters(prev => ({ ...prev, subLocation: e.target.value }))}
                                className="w-full p-2 text-sm bg-rm-dark-bg border border-rm-accent/50 rounded focus:ring-rm-accent focus:border-rm-accent text-rm-accent" 
                                disabled={!filters.location}
                            >
                                <option className="text-rm-text-light/80" value="">All Sub-Locations</option>
                                {uniquesubLocations
                                    // Use allScenes for comprehensive filter to avoid empty dropdowns
                                    .filter(subLoc => !filters.location || Object.values(containers).flat().find(s => s.Sub_Location === subLoc)?.Location === filters.location)
                                    .map(subLoc => (
                                        <option className="text-rm-text-light" key={subLoc} value={subLoc}>{subLoc}</option>
                                    ))}
                            </select>
                            
                            <select
                                value={filters.epNo}
                                onChange={(e) => setFilters(prev => ({ ...prev, epNo: e.target.value }))}
                                className="w-full p-2 text-sm bg-rm-dark-bg border border-rm-accent/50 rounded focus:ring-rm-accent focus:border-rm-accent text-rm-accent" 
                            >
                                <option className="text-rm-text-light/80" value="">All Episodes</option>
                                {uniqueEpisodes.map(ep => (
                                    <option className="text-rm-text-light" key={ep} value={ep}>Episode {ep}</option>
                                ))}
                            </select>
                            
                            <input
                                type="text"
                                placeholder="Filter by Character (Name)..."
                                value={filters.character}
                                onChange={(e) => setFilters(prev => ({ ...prev, character: e.target.value }))}
                                className="w-full p-2 text-sm bg-rm-dark-bg text-rm-cyan border border-rm-accent/50 rounded focus:ring-rm-accent focus:border-rm-accent placeholder-rm-text-light/50"
                            />
                            
                            <p className="text-xs text-rm-text-light/60 mt-2">
                                Scenes: <span className="font-bold text-rm-accent">{filteredUnscheduledScenes.length}</span> / {totalScenesUnfiltered}.
                            </p>
                        </div>
                        
                        {/* Unscheduled Scenes List Container */}
                        <div className={viewMode === 'table' ? 'w-full' : 'w-full space-y-2'}> 
                            <DayContainer
                                id="unscheduled"
                                name="Unscheduled"
                                itemsCount={filteredUnscheduledScenes.length}
                                viewMode={viewMode}
                                onDateChange={handleDateChange} 
                                shootingDays={shootingDays} // Pass full shootingDays for dropdown target options
                                handleMoveSelectedScenes={handleMoveSelectedScenes}
                                // Calculate selected count for only the scenes currently VISIBLE (filtered)
                                selectedCountInDay={selectedSceneIds.filter(id => filteredUnscheduledScenes.some(scene => scene.id === id)).length}
                            >
                                {viewMode === 'card' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2"> 
                                        {filteredUnscheduledScenes.map(scene => {
                                    // ✅ CONSOLE LOG ADDED
                                    console.log("Rendering Scene:", scene.id, scene['Sc No']);
                                return (
                                        <SceneCard
                                            key={scene.id}
                                            id={scene.id}
                                            scene={scene}
                                            isSelected={selectedSceneIds.includes(scene.id)}
                                            onToggleSelect={toggleSceneSelection}
                                            />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left text-rm-text-light/80 border-collapse">
                                            <thead>
                                                <tr className="bg-rm-bg-surface/50 border-b border-rm-accent/40 text-xs font-bold uppercase text-rm-cyan">
                                                    {TABLE_HEADERS.map((header, i) => (
                                                        <th key={i} className="px-1 py-1 border border-rm-accent/20" style={{ width: header.width }}>{header.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUnscheduledScenes.map(scene => {
                                                // ✅ CONSOLE LOG ADDED
                                                console.log("Rendering Scene:", scene.id, scene['Sc No']);
                                                return ( 
                                                    <SceneRow
                                                        key={scene.id}
                                                        id={scene.id}
                                                        scene={scene}
                                                        isSelected={selectedSceneIds.includes(scene.id)}
                                                        onToggleSelect={toggleSceneSelection}
                                                        dayNumber={null}
                                                        date={null}
                                                    />
                                                   );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </DayContainer>
                        </div>
                    </div>
                    
                    {/* 2. Scheduled Days List (Print Friendly Links) */}
                    <div className="lg:col-span-3 space-y-6">
                        
                        {/* Add New Shooting Day Button */}
                        <button
                            onClick={addShootingDay}
                            className="w-full px-6 py-3 bg-rm-accent hover:bg-rm-accent/80 rounded font-bold text-rm-dark-bg transition shadow-neon-blue/50 flex items-center justify-center text-lg"
                        >
                            <CalendarPlus className="w-5 h-5 mr-2" /> Add New Shooting Day
                        </button>
                        
                        <h4 className="text-lg font-semibold text-rm-cyan mb-3 flex items-center shadow-neon-cyan/50 border-b border-rm-accent/40 pb-2">
                             Scheduled Shooting Days
                        </h4>
                        
                        <div className="space-y-3">
                            {/* Check if any shooting days exist */}
                            {shootingDays.length === 0 ? (
                                <p className="text-rm-text-light/70 italic p-4 border border-rm-bg-surface/50 rounded-lg text-center">
                                    No shooting days scheduled yet. Please add a new day above.
                                </p>
                            ) : (
                                shootingDays.map(day => {
        const dayScenes = containers[day.id] || []; 
        const totalSceneCount = dayScenes.length;
        
        // Calculate selected count for this day's scenes
        const selectedCountInDay = selectedSceneIds.filter(id => dayScenes.some(scene => scene.id === id)).length;
        
        // **NEW: Create a Print URL Placeholder**
        const printUrl = `/schedule/print/${projectId}/${day.id}`; 
        
        return (
            <div key={day.id} className="p-0 border-none">
                
                {/* ---------------------------------------------------- */}
                {/* **MODIFIED BUTTON/LINK (Now uses <a> tag)** */}
                {/* ---------------------------------------------------- */}
                <a 
                    href={printUrl} // Use the dynamic URL
                    target="_blank" // Open in a new tab for printing
                    rel="noopener noreferrer"
                    className="w-full text-left p-4 bg-rm-bg-surface/70 hover:bg-rm-bg-surface/90 rounded-lg shadow-xl border border-rm-cyan/50 flex justify-between items-center transition cursor-pointer mb-3"
                    title={`View and Print Schedule for Day ${day.number}`}
                >
                    <div>
                        <p className="text-xl font-bold text-rm-cyan">
                            Day {day.number}: {day.name}
                        </p>
                        <p className="text-sm text-rm-text-light/80">
                            Date: <span className="font-semibold">{day.date || 'TBD'}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-rm-accent">{totalSceneCount}</p>
                        <p className="text-xs text-rm-text-light/60">Scenes</p>
                    </div>
                    <div className="text-right ml-4 hidden sm:block">
                        <p className="text-base font-semibold text-rm-text-light/80">
                            🔗 View/Print (Opens New Tab)
                        </p>
                    </div>
                </a>            
                                            {/* Actual Scenes Container */}
                                            <DayContainer
                                                id={day.id}
                                                name={`Day ${day.number}`}
                                                itemsCount={totalSceneCount}
                                                date={day.date}
                                                onDateChange={handleDateChange} 
                                                viewMode={viewMode}
                                                shootingDays={shootingDays}
                                                handleMoveSelectedScenes={handleMoveSelectedScenes}
                                                selectedCountInDay={selectedCountInDay} 
                                            >
                                                {viewMode === 'card' ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2"> 
                                                        {dayScenes.map(scene => (
                                                            <SceneCard
                                                                key={scene.id}
                                                                id={scene.id}
                                                                scene={scene}
                                                                isSelected={selectedSceneIds.includes(scene.id)}
                                                                onToggleSelect={toggleSceneSelection}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full text-left text-rm-text-light/80 border-collapse">
                                                            <thead>
                                                                <tr className="bg-rm-bg-surface/50 border-b border-rm-accent/40 text-xs font-bold uppercase text-rm-cyan">
                                                                    {TABLE_HEADERS.map((header, i) => (
                                                                        <th key={i} className="px-1 py-1 border border-rm-accent/20" style={{ width: header.width }}>{header.label}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {dayScenes.map(scene => (
                                                                    <SceneRow
                                                                        key={scene.id}
                                                                        id={scene.id}
                                                                        scene={scene}
                                                                        isSelected={selectedSceneIds.includes(scene.id)}
                                                                        onToggleSelect={toggleSceneSelection}
                                                                        dayNumber={day.number}
                                                                        date={day.date}
                                                                    />
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </DayContainer>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                    {/* ------------------ End of Scheduled Days List ------------------ */}
                </div>
            </div>
        </div>
    );
}

export default ShootingSchedulePage;
