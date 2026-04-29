'use client';

import { useState, useRef, useEffect } from 'react';
import toast from "react-hot-toast";
import {Eraser} from "lucide-react";

export const isValidColor = (value) => {
    if (!value) return false;
    const s = new Option().style;
    s.color = value;
    return s.color !== '';
};

const hsvToHex = (h, s, v) => {
    s /= 100;
    v /= 100;
    const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(5))}${toHex(f(3))}${toHex(f(1))}`;
};

const getRgbFromAnyColor = (colorString) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = colorString;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return { r, g, b };
};

const rgbToHue = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    let hue = 0;
    if (delta === 0) hue = 0;
    else if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    return hue;
};

export const parseColorToHue = (colorString) => {
    const { r, g, b } = getRgbFromAnyColor(colorString);
    return rgbToHue(r, g, b);
};

export default function ColorPickerDropdown({
                                                activeColor,
                                                setActiveColor,
                                                onApplyColor,
                                            }) {
    const [sliderHue, setSliderHue] = useState(0);
    const [boxSat, setBoxSat] = useState(100);
    const [boxVal, setBoxVal] = useState(100);
    const [isDraggingBox, setIsDraggingBox] = useState(false);
    const [colourHistory, setColourHistory] = useState(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('pow_color_history');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const colorBoxRef = useRef(null);

    const handleBoxDrag = (e) => {
        if (!colorBoxRef.current) return;
        const { left, top, width, height } = colorBoxRef.current.getBoundingClientRect();
        let x = Math.max(0, Math.min((e.clientX - left) / width, 1));
        let y = Math.max(0, Math.min((e.clientY - top) / height, 1));

        const newSat = Math.round(x * 100);
        const newVal = Math.round((1 - y) * 100);

        setBoxSat(newSat);
        setBoxVal(newVal);
        setActiveColor(hsvToHex(sliderHue, newSat, newVal));
    };

    const addColourToHistory = (hexColour) => {
        setColourHistory((prev) => {
            const filtered = prev.filter((c) => c !== hexColour);
            const newHistory = [hexColour, ...filtered].slice(0, 5);

            localStorage.setItem('pow_color_history', JSON.stringify(newHistory));

            return newHistory;
        });
    };

    useEffect(() => {
        if (!isDraggingBox) return;
        const handleMouseMove = (e) => handleBoxDrag(e);
        const handleMouseUp = () => setIsDraggingBox(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingBox, sliderHue]);

    return (
        <div className="absolute top-full right-0 md:left-0 mt-1 bg-[var(--layer2)] border border-[var(--layer3)] rounded-sm z-[100] p-2 shadow-xl w-70 flex flex-col gap-3 cursor-default">

            {/* History */}
            {colourHistory.length > 0 && (
                <div className="flex items-center gap-2 mb-1">
                    {colourHistory.map((colour, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                setSliderHue(parseColorToHue(colour));
                                setActiveColor(colour);
                            }}
                            className="w-6 h-6 rounded-md border border-[var(--layer3)] shadow-sm cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: colour }}
                            title={colour}
                        />
                    ))}
                </div>
            )}

            {/* 2D Box */}
            <div
                ref={colorBoxRef}
                onMouseDown={(e) => {
                    handleBoxDrag(e);
                    setIsDraggingBox(true);
                }}
                className="w-full h-32 rounded-md relative overflow-hidden border border-[var(--layer3)] cursor-pointer"
                style={{ backgroundColor: `hsl(${sliderHue}, 100%, 50%)` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                <div
                    className="absolute w-[36px] h-[36px] rounded-full border-[5px] border-white shadow-[0_0_2px_rgba(0,0,0,0.5)] pointer-events-none"
                    style={{
                        left: `${boxSat}%`,
                        top: `${100 - boxVal}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'transparent'
                    }}
                />
            </div>

            {/* Slider */}
            <input
                type="range" min="0" max="360"
                value={sliderHue}
                onChange={(e) => {
                    const newHue = Number(e.target.value);
                    setSliderHue(newHue);
                    setActiveColor(hsvToHex(newHue, boxSat, boxVal));
                }}
                className="pow-hue-slider w-full"
            />

            {/* Text Input */}
            <input
                onChange={(e) => {
                    const newString = e.target.value;
                    setActiveColor(newString);
                    if (isValidColor(newString)) {
                        setSliderHue(parseColorToHue(newString));
                    }
                }}
                value={activeColor || ''}
                type="text"
                placeholder="Enter hex..."
                className="w-full text-xl p-1.5 border border-[var(--layer3)] rounded outline-none text-[var(--text)] bg-[var(--layer1)] font-main uppercase"
            />

            {/* Apply Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    if (!isValidColor(activeColor)) {
                        toast.error('Please select a valid color.');
                        return;
                    }
                    addColourToHistory(activeColor);
                    onApplyColor();
                }}
                className="w-full bg-[var(--nice-blue)] text-white border border-[var(--layer3)] rounded-sm px-2 py-1.5 shadow font-semibold cursor-pointer hover:scale-[0.98] transition-transform"
                type="button">
                Pick Colour
            </button>
        </div>
    );
}