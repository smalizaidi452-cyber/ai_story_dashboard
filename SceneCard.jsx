// src/components/SceneCard.jsx (FINAL UI & ALL FIELDS FIX)

import { motion } from "framer-motion";
import React from 'react';
import { Clock, MapPin, Users, HardHat, FileText, Phone } from 'lucide-react'; 
import { Hash } from 'lucide-react'; // EP/SC No ke liye

export default function SceneCard({ scene }) {
  // Data extraction with fallback to support old keys from project.model.js
  const epNo = scene['EP No'] || '—';
  const scNo = scene['Sc No'] || '—';
  const location = scene.Location || 'N/A';
  // FIX: Sub_Location ki galti ko theek kiya
  const subLocation = scene.Sub_Location || 'N/A'; 
  const time = scene.Time || 'N/A';
  
  // FIX: Synopsis/Scene_Synopsis dono ko support karein
  const synopsis = scene.Synopsis || scene.Scene_Synopsis || 'No Synopsis'; 
  
  // FIX: 'Phon Talk'/Phone_Talk dono ko support karein
  const phoneTalkStatus = scene['Phon Talk'] || scene.Phone_Talk;
  const isPhoneTalk = (phoneTalkStatus === 'Yes' || phoneTalkStatus === '📞');

  const characters = scene.Characters || 'No Cast';
  const props = scene.Props || 'No Props';

  return (
    <motion.div
      // Tailwind classes for UI improvement
      className="bg-blue-900 border border-blue-700 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.01] transition duration-300 ease-in-out p-4 flex flex-col space-y-2 cursor-pointer" // ✅ Updated Classes
    >
      {/* Top Section: EP/SC No and Phone Talk */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-lg font-extrabold text-rm-text-light flex items-center">
          <Hash className="w-4 h-4 mr-1 text-rm-accent" />
          {epNo}_{scNo}
        </h2>
        
        {/* Phone Talk Display */}
        {isPhoneTalk && (
          <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-lg flex items-center">
            <Phone className="w-3 h-3 mr-1"/> Phone Talk
          </span>
        )}
      </div>

      {/* Main Details Section */}
      <div className="flex-grow space-y-1 text-xs">
        
        {/* Location / Sub Location (ALL FIELDS VISIBLE NOW) */}
        <p className="text-rm-text-light flex items-start">
          <MapPin className="w-3 h-3 mt-[2px] mr-1 text-rm-accent/80 flex-shrink-0" />
          <span className="font-semibold">{location}</span> / {subLocation}
        </p>

        {/* Synopsis */}
        <p className="text-rm-text-light/70 italic line-clamp-2">
          <span className="font-semibold not-italic flex items-center mb-0.5"><FileText className="w-3 h-3 mr-1"/>Synopsis:</span> {synopsis}
        </p>
        
        {/* Characters */}
        <p className="text-rm-text-light line-clamp-1 flex items-center">
          <Users className="w-3 h-3 mr-1 text-rm-accent/80 flex-shrink-0" />
          {characters}
        </p>

        {/* Props */}
        <p className="text-rm-text-light line-clamp-1 flex items-center">
          <HardHat className="w-3 h-3 mr-1 text-rm-accent/80 flex-shrink-0" />
          {props}
        </p>
      </div>

      {/* Footer: Time */}
      <div className="text-right pt-2 border-t border-rm-accent/10 mt-2">
        <span className="text-xs text-rm-accent/80 flex items-center justify-end">
          <Clock className="w-3 h-3 mr-1" />
          Time: {time}
        </span>
      </div>
    </motion.div>
  );
}