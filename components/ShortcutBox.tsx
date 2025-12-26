
import React from 'react';
import { Shortcut } from '../types';

interface Props {
  shortcut: Shortcut;
}

const ShortcutBox: React.FC<Props> = ({ shortcut }) => {
  return (
    <a
      href={shortcut.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative overflow-hidden group border-2 border-black p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 hover:bg-black hover:text-white cursor-pointer shimmer-hover h-32 w-full"
    >
      <img src={shortcut.icon} alt={shortcut.label} className="w-8 h-8 group-hover:invert transition-all" />
      <span className="font-bold text-sm tracking-wide">{shortcut.label}</span>
    </a>
  );
};

export default ShortcutBox;
