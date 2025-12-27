import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Circle, RotateCw } from 'lucide-react';

interface MobileControlsProps {
    onUp?: () => void;
    onDown?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
    onAction?: () => void;
    onActionLabel?: string;
    type: 'dpad' | 'horizontal' | 'vertical' | 'jump';
}

const MobileControls: React.FC<MobileControlsProps> = ({
    onUp, onDown, onLeft, onRight, onAction, onActionLabel = 'Action', type
}) => {
    // Prevent default touch behavior (scrolling/zooming) when interacting with controls
    const preventDefault = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Button style helper
    const btnClass = "w-14 h-14 bg-slate-200/50 dark:bg-slate-700/50 backdrop-blur-sm rounded-full flex items-center justify-center active:bg-slate-400 dark:active:bg-slate-500 transition-colors shadow-lg select-none touch-none";
    const iconClass = "w-8 h-8 text-slate-800 dark:text-white";

    return (
        <div className="fixed bottom-4 left-0 right-0 px-4 pb-safe flex justify-between items-end pointer-events-none z-50">
            {/* Left Control Area */}
            <div className="pointer-events-auto">
                {type === 'dpad' && (
                    <div className="grid grid-cols-3 gap-1">
                        <div />
                        <button
                            className={btnClass}
                            onTouchStart={(e) => { preventDefault(e); onUp?.(); }}
                            onMouseDown={(e) => { preventDefault(e); onUp?.(); }}
                        >
                            <ArrowUp className={iconClass} />
                        </button>
                        <div />

                        <button
                            className={btnClass}
                            onTouchStart={(e) => { preventDefault(e); onLeft?.(); }}
                            onMouseDown={(e) => { preventDefault(e); onLeft?.(); }}
                        >
                            <ArrowLeft className={iconClass} />
                        </button>
                        <div className="w-14 h-14" />
                        <button
                            className={btnClass}
                            onTouchStart={(e) => { preventDefault(e); onRight?.(); }}
                            onMouseDown={(e) => { preventDefault(e); onRight?.(); }}
                        >
                            <ArrowRight className={iconClass} />
                        </button>

                        <div />
                        <button
                            className={btnClass}
                            onTouchStart={(e) => { preventDefault(e); onDown?.(); }}
                            onMouseDown={(e) => { preventDefault(e); onDown?.(); }}
                        >
                            <ArrowDown className={iconClass} />
                        </button>
                        <div />
                    </div>
                )}

                {type === 'horizontal' && (
                    <div className="flex gap-4">
                        <button
                            className={btnClass}
                            onTouchStart={(e) => { preventDefault(e); onLeft?.(); }}
                            onMouseDown={(e) => { preventDefault(e); onLeft?.(); }}
                        >
                            <ArrowLeft className={iconClass} />
                        </button>
                        <button
                            className={btnClass}
                            onTouchStart={(e) => { preventDefault(e); onRight?.(); }}
                            onMouseDown={(e) => { preventDefault(e); onRight?.(); }}
                        >
                            <ArrowRight className={iconClass} />
                        </button>
                    </div>
                )}

                {type === 'vertical' && (
                    <div className="flex flex-col gap-4">
                        <button
                            className={btnClass}
                            onTouchStart={(e) => { preventDefault(e); onUp?.(); }}
                            onMouseDown={(e) => { preventDefault(e); onUp?.(); }}
                        >
                            <ArrowUp className={iconClass} />
                        </button>
                        <button
                            className={btnClass}
                            onTouchStart={(e) => { preventDefault(e); onDown?.(); }}
                            onMouseDown={(e) => { preventDefault(e); onDown?.(); }}
                        >
                            <ArrowDown className={iconClass} />
                        </button>
                    </div>
                )}
            </div>

            {/* Right Control Area (Action Button) */}
            <div className="pointer-events-auto">
                {onAction && (
                    <button
                        className="w-20 h-20 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center active:bg-red-600 transition-colors shadow-lg select-none touch-none"
                        onTouchStart={(e) => { preventDefault(e); onAction(); }}
                        onMouseDown={(e) => { preventDefault(e); onAction(); }}
                    >
                        <span className="text-white font-bold text-lg">{onActionLabel}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default MobileControls;
