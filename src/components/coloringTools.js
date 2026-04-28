'use client';

const isValidColor = (value) => {
    if (!value) return false;
    const s = new Option().style;
    s.color = value;
    return s.color !== '';
};

const hueToHex = (hue) => {
    const saturation = 100;
    const lightness = 50;

    const lightRatio = lightness / 100;
    const a = (saturation * Math.min(lightRatio, 1 - lightRatio)) / 100;

    const f = (n) => {
        const k = (n + hue /  30) % 12;
        const color = lightRatio - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
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
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let hue = 0;

    if (delta === 0) {
        hue = 0;
    } else if (max === r) {
        hue = ((g - b) / delta) % 6;
    } else if (max === g) {
        hue = (b - r) / delta + 2;
    } else {
        hue = (r - g) / delta + 4;
    }

    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;

    return hue;
};

export const parseColorToHue = (colorString) => {
    const { r, g, b } = getRgbFromAnyColor(colorString);
    return rgbToHue(r, g, b);
};

export default function coloringTool() {

};