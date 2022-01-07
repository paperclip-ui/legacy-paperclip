/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 44959:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* MIT license */
var cssKeywords = __webpack_require__(41351);

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in cssKeywords) {
	if (cssKeywords.hasOwnProperty(key)) {
		reverseKeywords[cssKeywords[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var rdif;
	var gdif;
	var bdif;
	var h;
	var s;

	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var v = Math.max(r, g, b);
	var diff = v - Math.min(r, g, b);
	var diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in cssKeywords) {
		if (cssKeywords.hasOwnProperty(keyword)) {
			var value = cssKeywords[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};


/***/ }),

/***/ 50841:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var conversions = __webpack_require__(44959);
var route = __webpack_require__(19325);

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


/***/ }),

/***/ 41351:
/***/ ((module) => {

"use strict";


module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};


/***/ }),

/***/ 19325:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var conversions = __webpack_require__(44959);

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	var graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	var models = Object.keys(conversions);

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};



/***/ }),

/***/ 11103:
/***/ ((module) => {

"use strict";


module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};


/***/ }),

/***/ 67804:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* MIT license */
var colorNames = __webpack_require__(11103);
var swizzle = __webpack_require__(26047);
var hasOwnProperty = Object.hasOwnProperty;

var reverseNames = {};

// create a list of reverse color names
for (var name in colorNames) {
	if (hasOwnProperty.call(colorNames, name)) {
		reverseNames[colorNames[name]] = name;
	}
}

var cs = module.exports = {
	to: {},
	get: {}
};

cs.get = function (string) {
	var prefix = string.substring(0, 3).toLowerCase();
	var val;
	var model;
	switch (prefix) {
		case 'hsl':
			val = cs.get.hsl(string);
			model = 'hsl';
			break;
		case 'hwb':
			val = cs.get.hwb(string);
			model = 'hwb';
			break;
		default:
			val = cs.get.rgb(string);
			model = 'rgb';
			break;
	}

	if (!val) {
		return null;
	}

	return {model: model, value: val};
};

cs.get.rgb = function (string) {
	if (!string) {
		return null;
	}

	var abbr = /^#([a-f0-9]{3,4})$/i;
	var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
	var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
	var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
	var keyword = /^(\w+)$/;

	var rgb = [0, 0, 0, 1];
	var match;
	var i;
	var hexAlpha;

	if (match = string.match(hex)) {
		hexAlpha = match[2];
		match = match[1];

		for (i = 0; i < 3; i++) {
			// https://jsperf.com/slice-vs-substr-vs-substring-methods-long-string/19
			var i2 = i * 2;
			rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
		}

		if (hexAlpha) {
			rgb[3] = parseInt(hexAlpha, 16) / 255;
		}
	} else if (match = string.match(abbr)) {
		match = match[1];
		hexAlpha = match[3];

		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i] + match[i], 16);
		}

		if (hexAlpha) {
			rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
		}
	} else if (match = string.match(rgba)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = parseInt(match[i + 1], 0);
		}

		if (match[4]) {
			if (match[5]) {
				rgb[3] = parseFloat(match[4]) * 0.01;
			} else {
				rgb[3] = parseFloat(match[4]);
			}
		}
	} else if (match = string.match(per)) {
		for (i = 0; i < 3; i++) {
			rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
		}

		if (match[4]) {
			if (match[5]) {
				rgb[3] = parseFloat(match[4]) * 0.01;
			} else {
				rgb[3] = parseFloat(match[4]);
			}
		}
	} else if (match = string.match(keyword)) {
		if (match[1] === 'transparent') {
			return [0, 0, 0, 0];
		}

		if (!hasOwnProperty.call(colorNames, match[1])) {
			return null;
		}

		rgb = colorNames[match[1]];
		rgb[3] = 1;

		return rgb;
	} else {
		return null;
	}

	for (i = 0; i < 3; i++) {
		rgb[i] = clamp(rgb[i], 0, 255);
	}
	rgb[3] = clamp(rgb[3], 0, 1);

	return rgb;
};

cs.get.hsl = function (string) {
	if (!string) {
		return null;
	}

	var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
	var match = string.match(hsl);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var s = clamp(parseFloat(match[2]), 0, 100);
		var l = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);

		return [h, s, l, a];
	}

	return null;
};

cs.get.hwb = function (string) {
	if (!string) {
		return null;
	}

	var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
	var match = string.match(hwb);

	if (match) {
		var alpha = parseFloat(match[4]);
		var h = ((parseFloat(match[1]) % 360) + 360) % 360;
		var w = clamp(parseFloat(match[2]), 0, 100);
		var b = clamp(parseFloat(match[3]), 0, 100);
		var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
		return [h, w, b, a];
	}

	return null;
};

cs.to.hex = function () {
	var rgba = swizzle(arguments);

	return (
		'#' +
		hexDouble(rgba[0]) +
		hexDouble(rgba[1]) +
		hexDouble(rgba[2]) +
		(rgba[3] < 1
			? (hexDouble(Math.round(rgba[3] * 255)))
			: '')
	);
};

cs.to.rgb = function () {
	var rgba = swizzle(arguments);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ')'
		: 'rgba(' + Math.round(rgba[0]) + ', ' + Math.round(rgba[1]) + ', ' + Math.round(rgba[2]) + ', ' + rgba[3] + ')';
};

cs.to.rgb.percent = function () {
	var rgba = swizzle(arguments);

	var r = Math.round(rgba[0] / 255 * 100);
	var g = Math.round(rgba[1] / 255 * 100);
	var b = Math.round(rgba[2] / 255 * 100);

	return rgba.length < 4 || rgba[3] === 1
		? 'rgb(' + r + '%, ' + g + '%, ' + b + '%)'
		: 'rgba(' + r + '%, ' + g + '%, ' + b + '%, ' + rgba[3] + ')';
};

cs.to.hsl = function () {
	var hsla = swizzle(arguments);
	return hsla.length < 4 || hsla[3] === 1
		? 'hsl(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%)'
		: 'hsla(' + hsla[0] + ', ' + hsla[1] + '%, ' + hsla[2] + '%, ' + hsla[3] + ')';
};

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
cs.to.hwb = function () {
	var hwba = swizzle(arguments);

	var a = '';
	if (hwba.length >= 4 && hwba[3] !== 1) {
		a = ', ' + hwba[3];
	}

	return 'hwb(' + hwba[0] + ', ' + hwba[1] + '%, ' + hwba[2] + '%' + a + ')';
};

cs.to.keyword = function (rgb) {
	return reverseNames[rgb.slice(0, 3)];
};

// helpers
function clamp(num, min, max) {
	return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
	var str = Math.round(num).toString(16).toUpperCase();
	return (str.length < 2) ? '0' + str : str;
}


/***/ }),

/***/ 71346:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var colorString = __webpack_require__(67804);
var convert = __webpack_require__(50841);

var _slice = [].slice;

var skippedModels = [
	// to be honest, I don't really feel like keyword belongs in color convert, but eh.
	'keyword',

	// gray conflicts with some method names, and has its own method defined.
	'gray',

	// shouldn't really be in color-convert either...
	'hex'
];

var hashedModelKeys = {};
Object.keys(convert).forEach(function (model) {
	hashedModelKeys[_slice.call(convert[model].labels).sort().join('')] = model;
});

var limiters = {};

function Color(obj, model) {
	if (!(this instanceof Color)) {
		return new Color(obj, model);
	}

	if (model && model in skippedModels) {
		model = null;
	}

	if (model && !(model in convert)) {
		throw new Error('Unknown model: ' + model);
	}

	var i;
	var channels;

	if (obj == null) { // eslint-disable-line no-eq-null,eqeqeq
		this.model = 'rgb';
		this.color = [0, 0, 0];
		this.valpha = 1;
	} else if (obj instanceof Color) {
		this.model = obj.model;
		this.color = obj.color.slice();
		this.valpha = obj.valpha;
	} else if (typeof obj === 'string') {
		var result = colorString.get(obj);
		if (result === null) {
			throw new Error('Unable to parse color from string: ' + obj);
		}

		this.model = result.model;
		channels = convert[this.model].channels;
		this.color = result.value.slice(0, channels);
		this.valpha = typeof result.value[channels] === 'number' ? result.value[channels] : 1;
	} else if (obj.length) {
		this.model = model || 'rgb';
		channels = convert[this.model].channels;
		var newArr = _slice.call(obj, 0, channels);
		this.color = zeroArray(newArr, channels);
		this.valpha = typeof obj[channels] === 'number' ? obj[channels] : 1;
	} else if (typeof obj === 'number') {
		// this is always RGB - can be converted later on.
		obj &= 0xFFFFFF;
		this.model = 'rgb';
		this.color = [
			(obj >> 16) & 0xFF,
			(obj >> 8) & 0xFF,
			obj & 0xFF
		];
		this.valpha = 1;
	} else {
		this.valpha = 1;

		var keys = Object.keys(obj);
		if ('alpha' in obj) {
			keys.splice(keys.indexOf('alpha'), 1);
			this.valpha = typeof obj.alpha === 'number' ? obj.alpha : 0;
		}

		var hashedKeys = keys.sort().join('');
		if (!(hashedKeys in hashedModelKeys)) {
			throw new Error('Unable to parse color from object: ' + JSON.stringify(obj));
		}

		this.model = hashedModelKeys[hashedKeys];

		var labels = convert[this.model].labels;
		var color = [];
		for (i = 0; i < labels.length; i++) {
			color.push(obj[labels[i]]);
		}

		this.color = zeroArray(color);
	}

	// perform limitations (clamping, etc.)
	if (limiters[this.model]) {
		channels = convert[this.model].channels;
		for (i = 0; i < channels; i++) {
			var limit = limiters[this.model][i];
			if (limit) {
				this.color[i] = limit(this.color[i]);
			}
		}
	}

	this.valpha = Math.max(0, Math.min(1, this.valpha));

	if (Object.freeze) {
		Object.freeze(this);
	}
}

Color.prototype = {
	toString: function () {
		return this.string();
	},

	toJSON: function () {
		return this[this.model]();
	},

	string: function (places) {
		var self = this.model in colorString.to ? this : this.rgb();
		self = self.round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to[self.model](args);
	},

	percentString: function (places) {
		var self = this.rgb().round(typeof places === 'number' ? places : 1);
		var args = self.valpha === 1 ? self.color : self.color.concat(this.valpha);
		return colorString.to.rgb.percent(args);
	},

	array: function () {
		return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
	},

	object: function () {
		var result = {};
		var channels = convert[this.model].channels;
		var labels = convert[this.model].labels;

		for (var i = 0; i < channels; i++) {
			result[labels[i]] = this.color[i];
		}

		if (this.valpha !== 1) {
			result.alpha = this.valpha;
		}

		return result;
	},

	unitArray: function () {
		var rgb = this.rgb().color;
		rgb[0] /= 255;
		rgb[1] /= 255;
		rgb[2] /= 255;

		if (this.valpha !== 1) {
			rgb.push(this.valpha);
		}

		return rgb;
	},

	unitObject: function () {
		var rgb = this.rgb().object();
		rgb.r /= 255;
		rgb.g /= 255;
		rgb.b /= 255;

		if (this.valpha !== 1) {
			rgb.alpha = this.valpha;
		}

		return rgb;
	},

	round: function (places) {
		places = Math.max(places || 0, 0);
		return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
	},

	alpha: function (val) {
		if (arguments.length) {
			return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
		}

		return this.valpha;
	},

	// rgb
	red: getset('rgb', 0, maxfn(255)),
	green: getset('rgb', 1, maxfn(255)),
	blue: getset('rgb', 2, maxfn(255)),

	hue: getset(['hsl', 'hsv', 'hsl', 'hwb', 'hcg'], 0, function (val) { return ((val % 360) + 360) % 360; }), // eslint-disable-line brace-style

	saturationl: getset('hsl', 1, maxfn(100)),
	lightness: getset('hsl', 2, maxfn(100)),

	saturationv: getset('hsv', 1, maxfn(100)),
	value: getset('hsv', 2, maxfn(100)),

	chroma: getset('hcg', 1, maxfn(100)),
	gray: getset('hcg', 2, maxfn(100)),

	white: getset('hwb', 1, maxfn(100)),
	wblack: getset('hwb', 2, maxfn(100)),

	cyan: getset('cmyk', 0, maxfn(100)),
	magenta: getset('cmyk', 1, maxfn(100)),
	yellow: getset('cmyk', 2, maxfn(100)),
	black: getset('cmyk', 3, maxfn(100)),

	x: getset('xyz', 0, maxfn(100)),
	y: getset('xyz', 1, maxfn(100)),
	z: getset('xyz', 2, maxfn(100)),

	l: getset('lab', 0, maxfn(100)),
	a: getset('lab', 1),
	b: getset('lab', 2),

	keyword: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return convert[this.model].keyword(this.color);
	},

	hex: function (val) {
		if (arguments.length) {
			return new Color(val);
		}

		return colorString.to.hex(this.rgb().round().color);
	},

	rgbNumber: function () {
		var rgb = this.rgb().color;
		return ((rgb[0] & 0xFF) << 16) | ((rgb[1] & 0xFF) << 8) | (rgb[2] & 0xFF);
	},

	luminosity: function () {
		// http://www.w3.org/TR/WCAG20/#relativeluminancedef
		var rgb = this.rgb().color;

		var lum = [];
		for (var i = 0; i < rgb.length; i++) {
			var chan = rgb[i] / 255;
			lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
		}

		return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
	},

	contrast: function (color2) {
		// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
		var lum1 = this.luminosity();
		var lum2 = color2.luminosity();

		if (lum1 > lum2) {
			return (lum1 + 0.05) / (lum2 + 0.05);
		}

		return (lum2 + 0.05) / (lum1 + 0.05);
	},

	level: function (color2) {
		var contrastRatio = this.contrast(color2);
		if (contrastRatio >= 7.1) {
			return 'AAA';
		}

		return (contrastRatio >= 4.5) ? 'AA' : '';
	},

	isDark: function () {
		// YIQ equation from http://24ways.org/2010/calculating-color-contrast
		var rgb = this.rgb().color;
		var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return yiq < 128;
	},

	isLight: function () {
		return !this.isDark();
	},

	negate: function () {
		var rgb = this.rgb();
		for (var i = 0; i < 3; i++) {
			rgb.color[i] = 255 - rgb.color[i];
		}
		return rgb;
	},

	lighten: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] += hsl.color[2] * ratio;
		return hsl;
	},

	darken: function (ratio) {
		var hsl = this.hsl();
		hsl.color[2] -= hsl.color[2] * ratio;
		return hsl;
	},

	saturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] += hsl.color[1] * ratio;
		return hsl;
	},

	desaturate: function (ratio) {
		var hsl = this.hsl();
		hsl.color[1] -= hsl.color[1] * ratio;
		return hsl;
	},

	whiten: function (ratio) {
		var hwb = this.hwb();
		hwb.color[1] += hwb.color[1] * ratio;
		return hwb;
	},

	blacken: function (ratio) {
		var hwb = this.hwb();
		hwb.color[2] += hwb.color[2] * ratio;
		return hwb;
	},

	grayscale: function () {
		// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
		var rgb = this.rgb().color;
		var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
		return Color.rgb(val, val, val);
	},

	fade: function (ratio) {
		return this.alpha(this.valpha - (this.valpha * ratio));
	},

	opaquer: function (ratio) {
		return this.alpha(this.valpha + (this.valpha * ratio));
	},

	rotate: function (degrees) {
		var hsl = this.hsl();
		var hue = hsl.color[0];
		hue = (hue + degrees) % 360;
		hue = hue < 0 ? 360 + hue : hue;
		hsl.color[0] = hue;
		return hsl;
	},

	mix: function (mixinColor, weight) {
		// ported from sass implementation in C
		// https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
		if (!mixinColor || !mixinColor.rgb) {
			throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
		}
		var color1 = mixinColor.rgb();
		var color2 = this.rgb();
		var p = weight === undefined ? 0.5 : weight;

		var w = 2 * p - 1;
		var a = color1.alpha() - color2.alpha();

		var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
		var w2 = 1 - w1;

		return Color.rgb(
				w1 * color1.red() + w2 * color2.red(),
				w1 * color1.green() + w2 * color2.green(),
				w1 * color1.blue() + w2 * color2.blue(),
				color1.alpha() * p + color2.alpha() * (1 - p));
	}
};

// model conversion methods and static constructors
Object.keys(convert).forEach(function (model) {
	if (skippedModels.indexOf(model) !== -1) {
		return;
	}

	var channels = convert[model].channels;

	// conversion methods
	Color.prototype[model] = function () {
		if (this.model === model) {
			return new Color(this);
		}

		if (arguments.length) {
			return new Color(arguments, model);
		}

		var newAlpha = typeof arguments[channels] === 'number' ? channels : this.valpha;
		return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
	};

	// 'static' construction methods
	Color[model] = function (color) {
		if (typeof color === 'number') {
			color = zeroArray(_slice.call(arguments), channels);
		}
		return new Color(color, model);
	};
});

function roundTo(num, places) {
	return Number(num.toFixed(places));
}

function roundToPlace(places) {
	return function (num) {
		return roundTo(num, places);
	};
}

function getset(model, channel, modifier) {
	model = Array.isArray(model) ? model : [model];

	model.forEach(function (m) {
		(limiters[m] || (limiters[m] = []))[channel] = modifier;
	});

	model = model[0];

	return function (val) {
		var result;

		if (arguments.length) {
			if (modifier) {
				val = modifier(val);
			}

			result = this[model]();
			result.color[channel] = val;
			return result;
		}

		result = this[model]().color[channel];
		if (modifier) {
			result = modifier(result);
		}

		return result;
	};
}

function maxfn(max) {
	return function (v) {
		return Math.max(0, Math.min(max, v));
	};
}

function assertArray(val) {
	return Array.isArray(val) ? val : [val];
}

function zeroArray(arr, length) {
	for (var i = 0; i < length; i++) {
		if (typeof arr[i] !== 'number') {
			arr[i] = 0;
		}
	}

	return arr;
}

module.exports = Color;


/***/ }),

/***/ 74334:
/***/ ((module) => {

(function () {
	'use strict';

	var table = [],
		poly = 0xEDB88320; // reverse polynomial

	// build the table
	function makeTable() {
		var c, n, k;

		for (n = 0; n < 256; n += 1) {
			c = n;
			for (k = 0; k < 8; k += 1) {
				if (c & 1) {
					c = poly ^ (c >>> 1);
				} else {
					c = c >>> 1;
				}
			}
			table[n] = c >>> 0;
		}
	}

	function strToArr(str) {
		// sweet hack to turn string into a 'byte' array
		return Array.prototype.map.call(str, function (c) {
			return c.charCodeAt(0);
		});
	}

	/*
	 * Compute CRC of array directly.
	 *
	 * This is slower for repeated calls, so append mode is not supported.
	 */
	function crcDirect(arr) {
		var crc = -1, // initial contents of LFBSR
			i, j, l, temp;

		for (i = 0, l = arr.length; i < l; i += 1) {
			temp = (crc ^ arr[i]) & 0xff;

			// read 8 bits one at a time
			for (j = 0; j < 8; j += 1) {
				if ((temp & 1) === 1) {
					temp = (temp >>> 1) ^ poly;
				} else {
					temp = (temp >>> 1);
				}
			}
			crc = (crc >>> 8) ^ temp;
		}

		// flip bits
		return crc ^ -1;
	}

	/*
	 * Compute CRC with the help of a pre-calculated table.
	 *
	 * This supports append mode, if the second parameter is set.
	 */
	function crcTable(arr, append) {
		var crc, i, l;

		// if we're in append mode, don't reset crc
		// if arr is null or undefined, reset table and return
		if (typeof crcTable.crc === 'undefined' || !append || !arr) {
			crcTable.crc = 0 ^ -1;

			if (!arr) {
				return;
			}
		}

		// store in temp variable for minor speed gain
		crc = crcTable.crc;

		for (i = 0, l = arr.length; i < l; i += 1) {
			crc = (crc >>> 8) ^ table[(crc ^ arr[i]) & 0xff];
		}

		crcTable.crc = crc;

		return crc ^ -1;
	}

	// build the table
	// this isn't that costly, and most uses will be for table assisted mode
	makeTable();

	module.exports = function (val, direct) {
		var val = (typeof val === 'string') ? strToArr(val) : val,
			ret = direct ? crcDirect(val) : crcTable(val);

		// convert to 2's complement hex
		return (ret >>> 0).toString(16);
	};
	module.exports.direct = crcDirect;
	module.exports.table = crcTable;
}());


/***/ }),

/***/ 83000:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var surrogate_pairs_1 = __webpack_require__(4265);
var HTML_ALPHA = ['apos', 'nbsp', 'iexcl', 'cent', 'pound', 'curren', 'yen', 'brvbar', 'sect', 'uml', 'copy', 'ordf', 'laquo', 'not', 'shy', 'reg', 'macr', 'deg', 'plusmn', 'sup2', 'sup3', 'acute', 'micro', 'para', 'middot', 'cedil', 'sup1', 'ordm', 'raquo', 'frac14', 'frac12', 'frac34', 'iquest', 'Agrave', 'Aacute', 'Acirc', 'Atilde', 'Auml', 'Aring', 'AElig', 'Ccedil', 'Egrave', 'Eacute', 'Ecirc', 'Euml', 'Igrave', 'Iacute', 'Icirc', 'Iuml', 'ETH', 'Ntilde', 'Ograve', 'Oacute', 'Ocirc', 'Otilde', 'Ouml', 'times', 'Oslash', 'Ugrave', 'Uacute', 'Ucirc', 'Uuml', 'Yacute', 'THORN', 'szlig', 'agrave', 'aacute', 'acirc', 'atilde', 'auml', 'aring', 'aelig', 'ccedil', 'egrave', 'eacute', 'ecirc', 'euml', 'igrave', 'iacute', 'icirc', 'iuml', 'eth', 'ntilde', 'ograve', 'oacute', 'ocirc', 'otilde', 'ouml', 'divide', 'oslash', 'ugrave', 'uacute', 'ucirc', 'uuml', 'yacute', 'thorn', 'yuml', 'quot', 'amp', 'lt', 'gt', 'OElig', 'oelig', 'Scaron', 'scaron', 'Yuml', 'circ', 'tilde', 'ensp', 'emsp', 'thinsp', 'zwnj', 'zwj', 'lrm', 'rlm', 'ndash', 'mdash', 'lsquo', 'rsquo', 'sbquo', 'ldquo', 'rdquo', 'bdquo', 'dagger', 'Dagger', 'permil', 'lsaquo', 'rsaquo', 'euro', 'fnof', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega', 'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigmaf', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega', 'thetasym', 'upsih', 'piv', 'bull', 'hellip', 'prime', 'Prime', 'oline', 'frasl', 'weierp', 'image', 'real', 'trade', 'alefsym', 'larr', 'uarr', 'rarr', 'darr', 'harr', 'crarr', 'lArr', 'uArr', 'rArr', 'dArr', 'hArr', 'forall', 'part', 'exist', 'empty', 'nabla', 'isin', 'notin', 'ni', 'prod', 'sum', 'minus', 'lowast', 'radic', 'prop', 'infin', 'ang', 'and', 'or', 'cap', 'cup', 'int', 'there4', 'sim', 'cong', 'asymp', 'ne', 'equiv', 'le', 'ge', 'sub', 'sup', 'nsub', 'sube', 'supe', 'oplus', 'otimes', 'perp', 'sdot', 'lceil', 'rceil', 'lfloor', 'rfloor', 'lang', 'rang', 'loz', 'spades', 'clubs', 'hearts', 'diams'];
var HTML_CODES = [39, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 34, 38, 60, 62, 338, 339, 352, 353, 376, 710, 732, 8194, 8195, 8201, 8204, 8205, 8206, 8207, 8211, 8212, 8216, 8217, 8218, 8220, 8221, 8222, 8224, 8225, 8240, 8249, 8250, 8364, 402, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 931, 932, 933, 934, 935, 936, 937, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 977, 978, 982, 8226, 8230, 8242, 8243, 8254, 8260, 8472, 8465, 8476, 8482, 8501, 8592, 8593, 8594, 8595, 8596, 8629, 8656, 8657, 8658, 8659, 8660, 8704, 8706, 8707, 8709, 8711, 8712, 8713, 8715, 8719, 8721, 8722, 8727, 8730, 8733, 8734, 8736, 8743, 8744, 8745, 8746, 8747, 8756, 8764, 8773, 8776, 8800, 8801, 8804, 8805, 8834, 8835, 8836, 8838, 8839, 8853, 8855, 8869, 8901, 8968, 8969, 8970, 8971, 9001, 9002, 9674, 9824, 9827, 9829, 9830];
var alphaIndex = {};
var numIndex = {};
(function () {
    var i = 0;
    var length = HTML_ALPHA.length;
    while (i < length) {
        var a = HTML_ALPHA[i];
        var c = HTML_CODES[i];
        alphaIndex[a] = String.fromCharCode(c);
        numIndex[c] = a;
        i++;
    }
})();
var Html4Entities = /** @class */ (function () {
    function Html4Entities() {
    }
    Html4Entities.prototype.decode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        return str.replace(/&(#?[\w\d]+);?/g, function (s, entity) {
            var chr;
            if (entity.charAt(0) === "#") {
                var code = entity.charAt(1).toLowerCase() === 'x' ?
                    parseInt(entity.substr(2), 16) :
                    parseInt(entity.substr(1));
                if (!isNaN(code) || code >= -32768) {
                    if (code <= 65535) {
                        chr = String.fromCharCode(code);
                    }
                    else {
                        chr = surrogate_pairs_1.fromCodePoint(code);
                    }
                }
            }
            else {
                chr = alphaIndex[entity];
            }
            return chr || s;
        });
    };
    Html4Entities.decode = function (str) {
        return new Html4Entities().decode(str);
    };
    Html4Entities.prototype.encode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var alpha = numIndex[str.charCodeAt(i)];
            result += alpha ? "&" + alpha + ";" : str.charAt(i);
            i++;
        }
        return result;
    };
    Html4Entities.encode = function (str) {
        return new Html4Entities().encode(str);
    };
    Html4Entities.prototype.encodeNonUTF = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var cc = str.charCodeAt(i);
            var alpha = numIndex[cc];
            if (alpha) {
                result += "&" + alpha + ";";
            }
            else if (cc < 32 || cc > 126) {
                if (cc >= surrogate_pairs_1.highSurrogateFrom && cc <= surrogate_pairs_1.highSurrogateTo) {
                    result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                    i++;
                }
                else {
                    result += '&#' + cc + ';';
                }
            }
            else {
                result += str.charAt(i);
            }
            i++;
        }
        return result;
    };
    Html4Entities.encodeNonUTF = function (str) {
        return new Html4Entities().encodeNonUTF(str);
    };
    Html4Entities.prototype.encodeNonASCII = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            if (c <= 255) {
                result += str[i++];
                continue;
            }
            if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                i++;
            }
            else {
                result += '&#' + c + ';';
            }
            i++;
        }
        return result;
    };
    Html4Entities.encodeNonASCII = function (str) {
        return new Html4Entities().encodeNonASCII(str);
    };
    return Html4Entities;
}());
exports.Html4Entities = Html4Entities;


/***/ }),

/***/ 96781:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var surrogate_pairs_1 = __webpack_require__(4265);
var ENTITIES = [['Aacute', [193]], ['aacute', [225]], ['Abreve', [258]], ['abreve', [259]], ['ac', [8766]], ['acd', [8767]], ['acE', [8766, 819]], ['Acirc', [194]], ['acirc', [226]], ['acute', [180]], ['Acy', [1040]], ['acy', [1072]], ['AElig', [198]], ['aelig', [230]], ['af', [8289]], ['Afr', [120068]], ['afr', [120094]], ['Agrave', [192]], ['agrave', [224]], ['alefsym', [8501]], ['aleph', [8501]], ['Alpha', [913]], ['alpha', [945]], ['Amacr', [256]], ['amacr', [257]], ['amalg', [10815]], ['amp', [38]], ['AMP', [38]], ['andand', [10837]], ['And', [10835]], ['and', [8743]], ['andd', [10844]], ['andslope', [10840]], ['andv', [10842]], ['ang', [8736]], ['ange', [10660]], ['angle', [8736]], ['angmsdaa', [10664]], ['angmsdab', [10665]], ['angmsdac', [10666]], ['angmsdad', [10667]], ['angmsdae', [10668]], ['angmsdaf', [10669]], ['angmsdag', [10670]], ['angmsdah', [10671]], ['angmsd', [8737]], ['angrt', [8735]], ['angrtvb', [8894]], ['angrtvbd', [10653]], ['angsph', [8738]], ['angst', [197]], ['angzarr', [9084]], ['Aogon', [260]], ['aogon', [261]], ['Aopf', [120120]], ['aopf', [120146]], ['apacir', [10863]], ['ap', [8776]], ['apE', [10864]], ['ape', [8778]], ['apid', [8779]], ['apos', [39]], ['ApplyFunction', [8289]], ['approx', [8776]], ['approxeq', [8778]], ['Aring', [197]], ['aring', [229]], ['Ascr', [119964]], ['ascr', [119990]], ['Assign', [8788]], ['ast', [42]], ['asymp', [8776]], ['asympeq', [8781]], ['Atilde', [195]], ['atilde', [227]], ['Auml', [196]], ['auml', [228]], ['awconint', [8755]], ['awint', [10769]], ['backcong', [8780]], ['backepsilon', [1014]], ['backprime', [8245]], ['backsim', [8765]], ['backsimeq', [8909]], ['Backslash', [8726]], ['Barv', [10983]], ['barvee', [8893]], ['barwed', [8965]], ['Barwed', [8966]], ['barwedge', [8965]], ['bbrk', [9141]], ['bbrktbrk', [9142]], ['bcong', [8780]], ['Bcy', [1041]], ['bcy', [1073]], ['bdquo', [8222]], ['becaus', [8757]], ['because', [8757]], ['Because', [8757]], ['bemptyv', [10672]], ['bepsi', [1014]], ['bernou', [8492]], ['Bernoullis', [8492]], ['Beta', [914]], ['beta', [946]], ['beth', [8502]], ['between', [8812]], ['Bfr', [120069]], ['bfr', [120095]], ['bigcap', [8898]], ['bigcirc', [9711]], ['bigcup', [8899]], ['bigodot', [10752]], ['bigoplus', [10753]], ['bigotimes', [10754]], ['bigsqcup', [10758]], ['bigstar', [9733]], ['bigtriangledown', [9661]], ['bigtriangleup', [9651]], ['biguplus', [10756]], ['bigvee', [8897]], ['bigwedge', [8896]], ['bkarow', [10509]], ['blacklozenge', [10731]], ['blacksquare', [9642]], ['blacktriangle', [9652]], ['blacktriangledown', [9662]], ['blacktriangleleft', [9666]], ['blacktriangleright', [9656]], ['blank', [9251]], ['blk12', [9618]], ['blk14', [9617]], ['blk34', [9619]], ['block', [9608]], ['bne', [61, 8421]], ['bnequiv', [8801, 8421]], ['bNot', [10989]], ['bnot', [8976]], ['Bopf', [120121]], ['bopf', [120147]], ['bot', [8869]], ['bottom', [8869]], ['bowtie', [8904]], ['boxbox', [10697]], ['boxdl', [9488]], ['boxdL', [9557]], ['boxDl', [9558]], ['boxDL', [9559]], ['boxdr', [9484]], ['boxdR', [9554]], ['boxDr', [9555]], ['boxDR', [9556]], ['boxh', [9472]], ['boxH', [9552]], ['boxhd', [9516]], ['boxHd', [9572]], ['boxhD', [9573]], ['boxHD', [9574]], ['boxhu', [9524]], ['boxHu', [9575]], ['boxhU', [9576]], ['boxHU', [9577]], ['boxminus', [8863]], ['boxplus', [8862]], ['boxtimes', [8864]], ['boxul', [9496]], ['boxuL', [9563]], ['boxUl', [9564]], ['boxUL', [9565]], ['boxur', [9492]], ['boxuR', [9560]], ['boxUr', [9561]], ['boxUR', [9562]], ['boxv', [9474]], ['boxV', [9553]], ['boxvh', [9532]], ['boxvH', [9578]], ['boxVh', [9579]], ['boxVH', [9580]], ['boxvl', [9508]], ['boxvL', [9569]], ['boxVl', [9570]], ['boxVL', [9571]], ['boxvr', [9500]], ['boxvR', [9566]], ['boxVr', [9567]], ['boxVR', [9568]], ['bprime', [8245]], ['breve', [728]], ['Breve', [728]], ['brvbar', [166]], ['bscr', [119991]], ['Bscr', [8492]], ['bsemi', [8271]], ['bsim', [8765]], ['bsime', [8909]], ['bsolb', [10693]], ['bsol', [92]], ['bsolhsub', [10184]], ['bull', [8226]], ['bullet', [8226]], ['bump', [8782]], ['bumpE', [10926]], ['bumpe', [8783]], ['Bumpeq', [8782]], ['bumpeq', [8783]], ['Cacute', [262]], ['cacute', [263]], ['capand', [10820]], ['capbrcup', [10825]], ['capcap', [10827]], ['cap', [8745]], ['Cap', [8914]], ['capcup', [10823]], ['capdot', [10816]], ['CapitalDifferentialD', [8517]], ['caps', [8745, 65024]], ['caret', [8257]], ['caron', [711]], ['Cayleys', [8493]], ['ccaps', [10829]], ['Ccaron', [268]], ['ccaron', [269]], ['Ccedil', [199]], ['ccedil', [231]], ['Ccirc', [264]], ['ccirc', [265]], ['Cconint', [8752]], ['ccups', [10828]], ['ccupssm', [10832]], ['Cdot', [266]], ['cdot', [267]], ['cedil', [184]], ['Cedilla', [184]], ['cemptyv', [10674]], ['cent', [162]], ['centerdot', [183]], ['CenterDot', [183]], ['cfr', [120096]], ['Cfr', [8493]], ['CHcy', [1063]], ['chcy', [1095]], ['check', [10003]], ['checkmark', [10003]], ['Chi', [935]], ['chi', [967]], ['circ', [710]], ['circeq', [8791]], ['circlearrowleft', [8634]], ['circlearrowright', [8635]], ['circledast', [8859]], ['circledcirc', [8858]], ['circleddash', [8861]], ['CircleDot', [8857]], ['circledR', [174]], ['circledS', [9416]], ['CircleMinus', [8854]], ['CirclePlus', [8853]], ['CircleTimes', [8855]], ['cir', [9675]], ['cirE', [10691]], ['cire', [8791]], ['cirfnint', [10768]], ['cirmid', [10991]], ['cirscir', [10690]], ['ClockwiseContourIntegral', [8754]], ['clubs', [9827]], ['clubsuit', [9827]], ['colon', [58]], ['Colon', [8759]], ['Colone', [10868]], ['colone', [8788]], ['coloneq', [8788]], ['comma', [44]], ['commat', [64]], ['comp', [8705]], ['compfn', [8728]], ['complement', [8705]], ['complexes', [8450]], ['cong', [8773]], ['congdot', [10861]], ['Congruent', [8801]], ['conint', [8750]], ['Conint', [8751]], ['ContourIntegral', [8750]], ['copf', [120148]], ['Copf', [8450]], ['coprod', [8720]], ['Coproduct', [8720]], ['copy', [169]], ['COPY', [169]], ['copysr', [8471]], ['CounterClockwiseContourIntegral', [8755]], ['crarr', [8629]], ['cross', [10007]], ['Cross', [10799]], ['Cscr', [119966]], ['cscr', [119992]], ['csub', [10959]], ['csube', [10961]], ['csup', [10960]], ['csupe', [10962]], ['ctdot', [8943]], ['cudarrl', [10552]], ['cudarrr', [10549]], ['cuepr', [8926]], ['cuesc', [8927]], ['cularr', [8630]], ['cularrp', [10557]], ['cupbrcap', [10824]], ['cupcap', [10822]], ['CupCap', [8781]], ['cup', [8746]], ['Cup', [8915]], ['cupcup', [10826]], ['cupdot', [8845]], ['cupor', [10821]], ['cups', [8746, 65024]], ['curarr', [8631]], ['curarrm', [10556]], ['curlyeqprec', [8926]], ['curlyeqsucc', [8927]], ['curlyvee', [8910]], ['curlywedge', [8911]], ['curren', [164]], ['curvearrowleft', [8630]], ['curvearrowright', [8631]], ['cuvee', [8910]], ['cuwed', [8911]], ['cwconint', [8754]], ['cwint', [8753]], ['cylcty', [9005]], ['dagger', [8224]], ['Dagger', [8225]], ['daleth', [8504]], ['darr', [8595]], ['Darr', [8609]], ['dArr', [8659]], ['dash', [8208]], ['Dashv', [10980]], ['dashv', [8867]], ['dbkarow', [10511]], ['dblac', [733]], ['Dcaron', [270]], ['dcaron', [271]], ['Dcy', [1044]], ['dcy', [1076]], ['ddagger', [8225]], ['ddarr', [8650]], ['DD', [8517]], ['dd', [8518]], ['DDotrahd', [10513]], ['ddotseq', [10871]], ['deg', [176]], ['Del', [8711]], ['Delta', [916]], ['delta', [948]], ['demptyv', [10673]], ['dfisht', [10623]], ['Dfr', [120071]], ['dfr', [120097]], ['dHar', [10597]], ['dharl', [8643]], ['dharr', [8642]], ['DiacriticalAcute', [180]], ['DiacriticalDot', [729]], ['DiacriticalDoubleAcute', [733]], ['DiacriticalGrave', [96]], ['DiacriticalTilde', [732]], ['diam', [8900]], ['diamond', [8900]], ['Diamond', [8900]], ['diamondsuit', [9830]], ['diams', [9830]], ['die', [168]], ['DifferentialD', [8518]], ['digamma', [989]], ['disin', [8946]], ['div', [247]], ['divide', [247]], ['divideontimes', [8903]], ['divonx', [8903]], ['DJcy', [1026]], ['djcy', [1106]], ['dlcorn', [8990]], ['dlcrop', [8973]], ['dollar', [36]], ['Dopf', [120123]], ['dopf', [120149]], ['Dot', [168]], ['dot', [729]], ['DotDot', [8412]], ['doteq', [8784]], ['doteqdot', [8785]], ['DotEqual', [8784]], ['dotminus', [8760]], ['dotplus', [8724]], ['dotsquare', [8865]], ['doublebarwedge', [8966]], ['DoubleContourIntegral', [8751]], ['DoubleDot', [168]], ['DoubleDownArrow', [8659]], ['DoubleLeftArrow', [8656]], ['DoubleLeftRightArrow', [8660]], ['DoubleLeftTee', [10980]], ['DoubleLongLeftArrow', [10232]], ['DoubleLongLeftRightArrow', [10234]], ['DoubleLongRightArrow', [10233]], ['DoubleRightArrow', [8658]], ['DoubleRightTee', [8872]], ['DoubleUpArrow', [8657]], ['DoubleUpDownArrow', [8661]], ['DoubleVerticalBar', [8741]], ['DownArrowBar', [10515]], ['downarrow', [8595]], ['DownArrow', [8595]], ['Downarrow', [8659]], ['DownArrowUpArrow', [8693]], ['DownBreve', [785]], ['downdownarrows', [8650]], ['downharpoonleft', [8643]], ['downharpoonright', [8642]], ['DownLeftRightVector', [10576]], ['DownLeftTeeVector', [10590]], ['DownLeftVectorBar', [10582]], ['DownLeftVector', [8637]], ['DownRightTeeVector', [10591]], ['DownRightVectorBar', [10583]], ['DownRightVector', [8641]], ['DownTeeArrow', [8615]], ['DownTee', [8868]], ['drbkarow', [10512]], ['drcorn', [8991]], ['drcrop', [8972]], ['Dscr', [119967]], ['dscr', [119993]], ['DScy', [1029]], ['dscy', [1109]], ['dsol', [10742]], ['Dstrok', [272]], ['dstrok', [273]], ['dtdot', [8945]], ['dtri', [9663]], ['dtrif', [9662]], ['duarr', [8693]], ['duhar', [10607]], ['dwangle', [10662]], ['DZcy', [1039]], ['dzcy', [1119]], ['dzigrarr', [10239]], ['Eacute', [201]], ['eacute', [233]], ['easter', [10862]], ['Ecaron', [282]], ['ecaron', [283]], ['Ecirc', [202]], ['ecirc', [234]], ['ecir', [8790]], ['ecolon', [8789]], ['Ecy', [1069]], ['ecy', [1101]], ['eDDot', [10871]], ['Edot', [278]], ['edot', [279]], ['eDot', [8785]], ['ee', [8519]], ['efDot', [8786]], ['Efr', [120072]], ['efr', [120098]], ['eg', [10906]], ['Egrave', [200]], ['egrave', [232]], ['egs', [10902]], ['egsdot', [10904]], ['el', [10905]], ['Element', [8712]], ['elinters', [9191]], ['ell', [8467]], ['els', [10901]], ['elsdot', [10903]], ['Emacr', [274]], ['emacr', [275]], ['empty', [8709]], ['emptyset', [8709]], ['EmptySmallSquare', [9723]], ['emptyv', [8709]], ['EmptyVerySmallSquare', [9643]], ['emsp13', [8196]], ['emsp14', [8197]], ['emsp', [8195]], ['ENG', [330]], ['eng', [331]], ['ensp', [8194]], ['Eogon', [280]], ['eogon', [281]], ['Eopf', [120124]], ['eopf', [120150]], ['epar', [8917]], ['eparsl', [10723]], ['eplus', [10865]], ['epsi', [949]], ['Epsilon', [917]], ['epsilon', [949]], ['epsiv', [1013]], ['eqcirc', [8790]], ['eqcolon', [8789]], ['eqsim', [8770]], ['eqslantgtr', [10902]], ['eqslantless', [10901]], ['Equal', [10869]], ['equals', [61]], ['EqualTilde', [8770]], ['equest', [8799]], ['Equilibrium', [8652]], ['equiv', [8801]], ['equivDD', [10872]], ['eqvparsl', [10725]], ['erarr', [10609]], ['erDot', [8787]], ['escr', [8495]], ['Escr', [8496]], ['esdot', [8784]], ['Esim', [10867]], ['esim', [8770]], ['Eta', [919]], ['eta', [951]], ['ETH', [208]], ['eth', [240]], ['Euml', [203]], ['euml', [235]], ['euro', [8364]], ['excl', [33]], ['exist', [8707]], ['Exists', [8707]], ['expectation', [8496]], ['exponentiale', [8519]], ['ExponentialE', [8519]], ['fallingdotseq', [8786]], ['Fcy', [1060]], ['fcy', [1092]], ['female', [9792]], ['ffilig', [64259]], ['fflig', [64256]], ['ffllig', [64260]], ['Ffr', [120073]], ['ffr', [120099]], ['filig', [64257]], ['FilledSmallSquare', [9724]], ['FilledVerySmallSquare', [9642]], ['fjlig', [102, 106]], ['flat', [9837]], ['fllig', [64258]], ['fltns', [9649]], ['fnof', [402]], ['Fopf', [120125]], ['fopf', [120151]], ['forall', [8704]], ['ForAll', [8704]], ['fork', [8916]], ['forkv', [10969]], ['Fouriertrf', [8497]], ['fpartint', [10765]], ['frac12', [189]], ['frac13', [8531]], ['frac14', [188]], ['frac15', [8533]], ['frac16', [8537]], ['frac18', [8539]], ['frac23', [8532]], ['frac25', [8534]], ['frac34', [190]], ['frac35', [8535]], ['frac38', [8540]], ['frac45', [8536]], ['frac56', [8538]], ['frac58', [8541]], ['frac78', [8542]], ['frasl', [8260]], ['frown', [8994]], ['fscr', [119995]], ['Fscr', [8497]], ['gacute', [501]], ['Gamma', [915]], ['gamma', [947]], ['Gammad', [988]], ['gammad', [989]], ['gap', [10886]], ['Gbreve', [286]], ['gbreve', [287]], ['Gcedil', [290]], ['Gcirc', [284]], ['gcirc', [285]], ['Gcy', [1043]], ['gcy', [1075]], ['Gdot', [288]], ['gdot', [289]], ['ge', [8805]], ['gE', [8807]], ['gEl', [10892]], ['gel', [8923]], ['geq', [8805]], ['geqq', [8807]], ['geqslant', [10878]], ['gescc', [10921]], ['ges', [10878]], ['gesdot', [10880]], ['gesdoto', [10882]], ['gesdotol', [10884]], ['gesl', [8923, 65024]], ['gesles', [10900]], ['Gfr', [120074]], ['gfr', [120100]], ['gg', [8811]], ['Gg', [8921]], ['ggg', [8921]], ['gimel', [8503]], ['GJcy', [1027]], ['gjcy', [1107]], ['gla', [10917]], ['gl', [8823]], ['glE', [10898]], ['glj', [10916]], ['gnap', [10890]], ['gnapprox', [10890]], ['gne', [10888]], ['gnE', [8809]], ['gneq', [10888]], ['gneqq', [8809]], ['gnsim', [8935]], ['Gopf', [120126]], ['gopf', [120152]], ['grave', [96]], ['GreaterEqual', [8805]], ['GreaterEqualLess', [8923]], ['GreaterFullEqual', [8807]], ['GreaterGreater', [10914]], ['GreaterLess', [8823]], ['GreaterSlantEqual', [10878]], ['GreaterTilde', [8819]], ['Gscr', [119970]], ['gscr', [8458]], ['gsim', [8819]], ['gsime', [10894]], ['gsiml', [10896]], ['gtcc', [10919]], ['gtcir', [10874]], ['gt', [62]], ['GT', [62]], ['Gt', [8811]], ['gtdot', [8919]], ['gtlPar', [10645]], ['gtquest', [10876]], ['gtrapprox', [10886]], ['gtrarr', [10616]], ['gtrdot', [8919]], ['gtreqless', [8923]], ['gtreqqless', [10892]], ['gtrless', [8823]], ['gtrsim', [8819]], ['gvertneqq', [8809, 65024]], ['gvnE', [8809, 65024]], ['Hacek', [711]], ['hairsp', [8202]], ['half', [189]], ['hamilt', [8459]], ['HARDcy', [1066]], ['hardcy', [1098]], ['harrcir', [10568]], ['harr', [8596]], ['hArr', [8660]], ['harrw', [8621]], ['Hat', [94]], ['hbar', [8463]], ['Hcirc', [292]], ['hcirc', [293]], ['hearts', [9829]], ['heartsuit', [9829]], ['hellip', [8230]], ['hercon', [8889]], ['hfr', [120101]], ['Hfr', [8460]], ['HilbertSpace', [8459]], ['hksearow', [10533]], ['hkswarow', [10534]], ['hoarr', [8703]], ['homtht', [8763]], ['hookleftarrow', [8617]], ['hookrightarrow', [8618]], ['hopf', [120153]], ['Hopf', [8461]], ['horbar', [8213]], ['HorizontalLine', [9472]], ['hscr', [119997]], ['Hscr', [8459]], ['hslash', [8463]], ['Hstrok', [294]], ['hstrok', [295]], ['HumpDownHump', [8782]], ['HumpEqual', [8783]], ['hybull', [8259]], ['hyphen', [8208]], ['Iacute', [205]], ['iacute', [237]], ['ic', [8291]], ['Icirc', [206]], ['icirc', [238]], ['Icy', [1048]], ['icy', [1080]], ['Idot', [304]], ['IEcy', [1045]], ['iecy', [1077]], ['iexcl', [161]], ['iff', [8660]], ['ifr', [120102]], ['Ifr', [8465]], ['Igrave', [204]], ['igrave', [236]], ['ii', [8520]], ['iiiint', [10764]], ['iiint', [8749]], ['iinfin', [10716]], ['iiota', [8489]], ['IJlig', [306]], ['ijlig', [307]], ['Imacr', [298]], ['imacr', [299]], ['image', [8465]], ['ImaginaryI', [8520]], ['imagline', [8464]], ['imagpart', [8465]], ['imath', [305]], ['Im', [8465]], ['imof', [8887]], ['imped', [437]], ['Implies', [8658]], ['incare', [8453]], ['in', [8712]], ['infin', [8734]], ['infintie', [10717]], ['inodot', [305]], ['intcal', [8890]], ['int', [8747]], ['Int', [8748]], ['integers', [8484]], ['Integral', [8747]], ['intercal', [8890]], ['Intersection', [8898]], ['intlarhk', [10775]], ['intprod', [10812]], ['InvisibleComma', [8291]], ['InvisibleTimes', [8290]], ['IOcy', [1025]], ['iocy', [1105]], ['Iogon', [302]], ['iogon', [303]], ['Iopf', [120128]], ['iopf', [120154]], ['Iota', [921]], ['iota', [953]], ['iprod', [10812]], ['iquest', [191]], ['iscr', [119998]], ['Iscr', [8464]], ['isin', [8712]], ['isindot', [8949]], ['isinE', [8953]], ['isins', [8948]], ['isinsv', [8947]], ['isinv', [8712]], ['it', [8290]], ['Itilde', [296]], ['itilde', [297]], ['Iukcy', [1030]], ['iukcy', [1110]], ['Iuml', [207]], ['iuml', [239]], ['Jcirc', [308]], ['jcirc', [309]], ['Jcy', [1049]], ['jcy', [1081]], ['Jfr', [120077]], ['jfr', [120103]], ['jmath', [567]], ['Jopf', [120129]], ['jopf', [120155]], ['Jscr', [119973]], ['jscr', [119999]], ['Jsercy', [1032]], ['jsercy', [1112]], ['Jukcy', [1028]], ['jukcy', [1108]], ['Kappa', [922]], ['kappa', [954]], ['kappav', [1008]], ['Kcedil', [310]], ['kcedil', [311]], ['Kcy', [1050]], ['kcy', [1082]], ['Kfr', [120078]], ['kfr', [120104]], ['kgreen', [312]], ['KHcy', [1061]], ['khcy', [1093]], ['KJcy', [1036]], ['kjcy', [1116]], ['Kopf', [120130]], ['kopf', [120156]], ['Kscr', [119974]], ['kscr', [120000]], ['lAarr', [8666]], ['Lacute', [313]], ['lacute', [314]], ['laemptyv', [10676]], ['lagran', [8466]], ['Lambda', [923]], ['lambda', [955]], ['lang', [10216]], ['Lang', [10218]], ['langd', [10641]], ['langle', [10216]], ['lap', [10885]], ['Laplacetrf', [8466]], ['laquo', [171]], ['larrb', [8676]], ['larrbfs', [10527]], ['larr', [8592]], ['Larr', [8606]], ['lArr', [8656]], ['larrfs', [10525]], ['larrhk', [8617]], ['larrlp', [8619]], ['larrpl', [10553]], ['larrsim', [10611]], ['larrtl', [8610]], ['latail', [10521]], ['lAtail', [10523]], ['lat', [10923]], ['late', [10925]], ['lates', [10925, 65024]], ['lbarr', [10508]], ['lBarr', [10510]], ['lbbrk', [10098]], ['lbrace', [123]], ['lbrack', [91]], ['lbrke', [10635]], ['lbrksld', [10639]], ['lbrkslu', [10637]], ['Lcaron', [317]], ['lcaron', [318]], ['Lcedil', [315]], ['lcedil', [316]], ['lceil', [8968]], ['lcub', [123]], ['Lcy', [1051]], ['lcy', [1083]], ['ldca', [10550]], ['ldquo', [8220]], ['ldquor', [8222]], ['ldrdhar', [10599]], ['ldrushar', [10571]], ['ldsh', [8626]], ['le', [8804]], ['lE', [8806]], ['LeftAngleBracket', [10216]], ['LeftArrowBar', [8676]], ['leftarrow', [8592]], ['LeftArrow', [8592]], ['Leftarrow', [8656]], ['LeftArrowRightArrow', [8646]], ['leftarrowtail', [8610]], ['LeftCeiling', [8968]], ['LeftDoubleBracket', [10214]], ['LeftDownTeeVector', [10593]], ['LeftDownVectorBar', [10585]], ['LeftDownVector', [8643]], ['LeftFloor', [8970]], ['leftharpoondown', [8637]], ['leftharpoonup', [8636]], ['leftleftarrows', [8647]], ['leftrightarrow', [8596]], ['LeftRightArrow', [8596]], ['Leftrightarrow', [8660]], ['leftrightarrows', [8646]], ['leftrightharpoons', [8651]], ['leftrightsquigarrow', [8621]], ['LeftRightVector', [10574]], ['LeftTeeArrow', [8612]], ['LeftTee', [8867]], ['LeftTeeVector', [10586]], ['leftthreetimes', [8907]], ['LeftTriangleBar', [10703]], ['LeftTriangle', [8882]], ['LeftTriangleEqual', [8884]], ['LeftUpDownVector', [10577]], ['LeftUpTeeVector', [10592]], ['LeftUpVectorBar', [10584]], ['LeftUpVector', [8639]], ['LeftVectorBar', [10578]], ['LeftVector', [8636]], ['lEg', [10891]], ['leg', [8922]], ['leq', [8804]], ['leqq', [8806]], ['leqslant', [10877]], ['lescc', [10920]], ['les', [10877]], ['lesdot', [10879]], ['lesdoto', [10881]], ['lesdotor', [10883]], ['lesg', [8922, 65024]], ['lesges', [10899]], ['lessapprox', [10885]], ['lessdot', [8918]], ['lesseqgtr', [8922]], ['lesseqqgtr', [10891]], ['LessEqualGreater', [8922]], ['LessFullEqual', [8806]], ['LessGreater', [8822]], ['lessgtr', [8822]], ['LessLess', [10913]], ['lesssim', [8818]], ['LessSlantEqual', [10877]], ['LessTilde', [8818]], ['lfisht', [10620]], ['lfloor', [8970]], ['Lfr', [120079]], ['lfr', [120105]], ['lg', [8822]], ['lgE', [10897]], ['lHar', [10594]], ['lhard', [8637]], ['lharu', [8636]], ['lharul', [10602]], ['lhblk', [9604]], ['LJcy', [1033]], ['ljcy', [1113]], ['llarr', [8647]], ['ll', [8810]], ['Ll', [8920]], ['llcorner', [8990]], ['Lleftarrow', [8666]], ['llhard', [10603]], ['lltri', [9722]], ['Lmidot', [319]], ['lmidot', [320]], ['lmoustache', [9136]], ['lmoust', [9136]], ['lnap', [10889]], ['lnapprox', [10889]], ['lne', [10887]], ['lnE', [8808]], ['lneq', [10887]], ['lneqq', [8808]], ['lnsim', [8934]], ['loang', [10220]], ['loarr', [8701]], ['lobrk', [10214]], ['longleftarrow', [10229]], ['LongLeftArrow', [10229]], ['Longleftarrow', [10232]], ['longleftrightarrow', [10231]], ['LongLeftRightArrow', [10231]], ['Longleftrightarrow', [10234]], ['longmapsto', [10236]], ['longrightarrow', [10230]], ['LongRightArrow', [10230]], ['Longrightarrow', [10233]], ['looparrowleft', [8619]], ['looparrowright', [8620]], ['lopar', [10629]], ['Lopf', [120131]], ['lopf', [120157]], ['loplus', [10797]], ['lotimes', [10804]], ['lowast', [8727]], ['lowbar', [95]], ['LowerLeftArrow', [8601]], ['LowerRightArrow', [8600]], ['loz', [9674]], ['lozenge', [9674]], ['lozf', [10731]], ['lpar', [40]], ['lparlt', [10643]], ['lrarr', [8646]], ['lrcorner', [8991]], ['lrhar', [8651]], ['lrhard', [10605]], ['lrm', [8206]], ['lrtri', [8895]], ['lsaquo', [8249]], ['lscr', [120001]], ['Lscr', [8466]], ['lsh', [8624]], ['Lsh', [8624]], ['lsim', [8818]], ['lsime', [10893]], ['lsimg', [10895]], ['lsqb', [91]], ['lsquo', [8216]], ['lsquor', [8218]], ['Lstrok', [321]], ['lstrok', [322]], ['ltcc', [10918]], ['ltcir', [10873]], ['lt', [60]], ['LT', [60]], ['Lt', [8810]], ['ltdot', [8918]], ['lthree', [8907]], ['ltimes', [8905]], ['ltlarr', [10614]], ['ltquest', [10875]], ['ltri', [9667]], ['ltrie', [8884]], ['ltrif', [9666]], ['ltrPar', [10646]], ['lurdshar', [10570]], ['luruhar', [10598]], ['lvertneqq', [8808, 65024]], ['lvnE', [8808, 65024]], ['macr', [175]], ['male', [9794]], ['malt', [10016]], ['maltese', [10016]], ['Map', [10501]], ['map', [8614]], ['mapsto', [8614]], ['mapstodown', [8615]], ['mapstoleft', [8612]], ['mapstoup', [8613]], ['marker', [9646]], ['mcomma', [10793]], ['Mcy', [1052]], ['mcy', [1084]], ['mdash', [8212]], ['mDDot', [8762]], ['measuredangle', [8737]], ['MediumSpace', [8287]], ['Mellintrf', [8499]], ['Mfr', [120080]], ['mfr', [120106]], ['mho', [8487]], ['micro', [181]], ['midast', [42]], ['midcir', [10992]], ['mid', [8739]], ['middot', [183]], ['minusb', [8863]], ['minus', [8722]], ['minusd', [8760]], ['minusdu', [10794]], ['MinusPlus', [8723]], ['mlcp', [10971]], ['mldr', [8230]], ['mnplus', [8723]], ['models', [8871]], ['Mopf', [120132]], ['mopf', [120158]], ['mp', [8723]], ['mscr', [120002]], ['Mscr', [8499]], ['mstpos', [8766]], ['Mu', [924]], ['mu', [956]], ['multimap', [8888]], ['mumap', [8888]], ['nabla', [8711]], ['Nacute', [323]], ['nacute', [324]], ['nang', [8736, 8402]], ['nap', [8777]], ['napE', [10864, 824]], ['napid', [8779, 824]], ['napos', [329]], ['napprox', [8777]], ['natural', [9838]], ['naturals', [8469]], ['natur', [9838]], ['nbsp', [160]], ['nbump', [8782, 824]], ['nbumpe', [8783, 824]], ['ncap', [10819]], ['Ncaron', [327]], ['ncaron', [328]], ['Ncedil', [325]], ['ncedil', [326]], ['ncong', [8775]], ['ncongdot', [10861, 824]], ['ncup', [10818]], ['Ncy', [1053]], ['ncy', [1085]], ['ndash', [8211]], ['nearhk', [10532]], ['nearr', [8599]], ['neArr', [8663]], ['nearrow', [8599]], ['ne', [8800]], ['nedot', [8784, 824]], ['NegativeMediumSpace', [8203]], ['NegativeThickSpace', [8203]], ['NegativeThinSpace', [8203]], ['NegativeVeryThinSpace', [8203]], ['nequiv', [8802]], ['nesear', [10536]], ['nesim', [8770, 824]], ['NestedGreaterGreater', [8811]], ['NestedLessLess', [8810]], ['nexist', [8708]], ['nexists', [8708]], ['Nfr', [120081]], ['nfr', [120107]], ['ngE', [8807, 824]], ['nge', [8817]], ['ngeq', [8817]], ['ngeqq', [8807, 824]], ['ngeqslant', [10878, 824]], ['nges', [10878, 824]], ['nGg', [8921, 824]], ['ngsim', [8821]], ['nGt', [8811, 8402]], ['ngt', [8815]], ['ngtr', [8815]], ['nGtv', [8811, 824]], ['nharr', [8622]], ['nhArr', [8654]], ['nhpar', [10994]], ['ni', [8715]], ['nis', [8956]], ['nisd', [8954]], ['niv', [8715]], ['NJcy', [1034]], ['njcy', [1114]], ['nlarr', [8602]], ['nlArr', [8653]], ['nldr', [8229]], ['nlE', [8806, 824]], ['nle', [8816]], ['nleftarrow', [8602]], ['nLeftarrow', [8653]], ['nleftrightarrow', [8622]], ['nLeftrightarrow', [8654]], ['nleq', [8816]], ['nleqq', [8806, 824]], ['nleqslant', [10877, 824]], ['nles', [10877, 824]], ['nless', [8814]], ['nLl', [8920, 824]], ['nlsim', [8820]], ['nLt', [8810, 8402]], ['nlt', [8814]], ['nltri', [8938]], ['nltrie', [8940]], ['nLtv', [8810, 824]], ['nmid', [8740]], ['NoBreak', [8288]], ['NonBreakingSpace', [160]], ['nopf', [120159]], ['Nopf', [8469]], ['Not', [10988]], ['not', [172]], ['NotCongruent', [8802]], ['NotCupCap', [8813]], ['NotDoubleVerticalBar', [8742]], ['NotElement', [8713]], ['NotEqual', [8800]], ['NotEqualTilde', [8770, 824]], ['NotExists', [8708]], ['NotGreater', [8815]], ['NotGreaterEqual', [8817]], ['NotGreaterFullEqual', [8807, 824]], ['NotGreaterGreater', [8811, 824]], ['NotGreaterLess', [8825]], ['NotGreaterSlantEqual', [10878, 824]], ['NotGreaterTilde', [8821]], ['NotHumpDownHump', [8782, 824]], ['NotHumpEqual', [8783, 824]], ['notin', [8713]], ['notindot', [8949, 824]], ['notinE', [8953, 824]], ['notinva', [8713]], ['notinvb', [8951]], ['notinvc', [8950]], ['NotLeftTriangleBar', [10703, 824]], ['NotLeftTriangle', [8938]], ['NotLeftTriangleEqual', [8940]], ['NotLess', [8814]], ['NotLessEqual', [8816]], ['NotLessGreater', [8824]], ['NotLessLess', [8810, 824]], ['NotLessSlantEqual', [10877, 824]], ['NotLessTilde', [8820]], ['NotNestedGreaterGreater', [10914, 824]], ['NotNestedLessLess', [10913, 824]], ['notni', [8716]], ['notniva', [8716]], ['notnivb', [8958]], ['notnivc', [8957]], ['NotPrecedes', [8832]], ['NotPrecedesEqual', [10927, 824]], ['NotPrecedesSlantEqual', [8928]], ['NotReverseElement', [8716]], ['NotRightTriangleBar', [10704, 824]], ['NotRightTriangle', [8939]], ['NotRightTriangleEqual', [8941]], ['NotSquareSubset', [8847, 824]], ['NotSquareSubsetEqual', [8930]], ['NotSquareSuperset', [8848, 824]], ['NotSquareSupersetEqual', [8931]], ['NotSubset', [8834, 8402]], ['NotSubsetEqual', [8840]], ['NotSucceeds', [8833]], ['NotSucceedsEqual', [10928, 824]], ['NotSucceedsSlantEqual', [8929]], ['NotSucceedsTilde', [8831, 824]], ['NotSuperset', [8835, 8402]], ['NotSupersetEqual', [8841]], ['NotTilde', [8769]], ['NotTildeEqual', [8772]], ['NotTildeFullEqual', [8775]], ['NotTildeTilde', [8777]], ['NotVerticalBar', [8740]], ['nparallel', [8742]], ['npar', [8742]], ['nparsl', [11005, 8421]], ['npart', [8706, 824]], ['npolint', [10772]], ['npr', [8832]], ['nprcue', [8928]], ['nprec', [8832]], ['npreceq', [10927, 824]], ['npre', [10927, 824]], ['nrarrc', [10547, 824]], ['nrarr', [8603]], ['nrArr', [8655]], ['nrarrw', [8605, 824]], ['nrightarrow', [8603]], ['nRightarrow', [8655]], ['nrtri', [8939]], ['nrtrie', [8941]], ['nsc', [8833]], ['nsccue', [8929]], ['nsce', [10928, 824]], ['Nscr', [119977]], ['nscr', [120003]], ['nshortmid', [8740]], ['nshortparallel', [8742]], ['nsim', [8769]], ['nsime', [8772]], ['nsimeq', [8772]], ['nsmid', [8740]], ['nspar', [8742]], ['nsqsube', [8930]], ['nsqsupe', [8931]], ['nsub', [8836]], ['nsubE', [10949, 824]], ['nsube', [8840]], ['nsubset', [8834, 8402]], ['nsubseteq', [8840]], ['nsubseteqq', [10949, 824]], ['nsucc', [8833]], ['nsucceq', [10928, 824]], ['nsup', [8837]], ['nsupE', [10950, 824]], ['nsupe', [8841]], ['nsupset', [8835, 8402]], ['nsupseteq', [8841]], ['nsupseteqq', [10950, 824]], ['ntgl', [8825]], ['Ntilde', [209]], ['ntilde', [241]], ['ntlg', [8824]], ['ntriangleleft', [8938]], ['ntrianglelefteq', [8940]], ['ntriangleright', [8939]], ['ntrianglerighteq', [8941]], ['Nu', [925]], ['nu', [957]], ['num', [35]], ['numero', [8470]], ['numsp', [8199]], ['nvap', [8781, 8402]], ['nvdash', [8876]], ['nvDash', [8877]], ['nVdash', [8878]], ['nVDash', [8879]], ['nvge', [8805, 8402]], ['nvgt', [62, 8402]], ['nvHarr', [10500]], ['nvinfin', [10718]], ['nvlArr', [10498]], ['nvle', [8804, 8402]], ['nvlt', [60, 8402]], ['nvltrie', [8884, 8402]], ['nvrArr', [10499]], ['nvrtrie', [8885, 8402]], ['nvsim', [8764, 8402]], ['nwarhk', [10531]], ['nwarr', [8598]], ['nwArr', [8662]], ['nwarrow', [8598]], ['nwnear', [10535]], ['Oacute', [211]], ['oacute', [243]], ['oast', [8859]], ['Ocirc', [212]], ['ocirc', [244]], ['ocir', [8858]], ['Ocy', [1054]], ['ocy', [1086]], ['odash', [8861]], ['Odblac', [336]], ['odblac', [337]], ['odiv', [10808]], ['odot', [8857]], ['odsold', [10684]], ['OElig', [338]], ['oelig', [339]], ['ofcir', [10687]], ['Ofr', [120082]], ['ofr', [120108]], ['ogon', [731]], ['Ograve', [210]], ['ograve', [242]], ['ogt', [10689]], ['ohbar', [10677]], ['ohm', [937]], ['oint', [8750]], ['olarr', [8634]], ['olcir', [10686]], ['olcross', [10683]], ['oline', [8254]], ['olt', [10688]], ['Omacr', [332]], ['omacr', [333]], ['Omega', [937]], ['omega', [969]], ['Omicron', [927]], ['omicron', [959]], ['omid', [10678]], ['ominus', [8854]], ['Oopf', [120134]], ['oopf', [120160]], ['opar', [10679]], ['OpenCurlyDoubleQuote', [8220]], ['OpenCurlyQuote', [8216]], ['operp', [10681]], ['oplus', [8853]], ['orarr', [8635]], ['Or', [10836]], ['or', [8744]], ['ord', [10845]], ['order', [8500]], ['orderof', [8500]], ['ordf', [170]], ['ordm', [186]], ['origof', [8886]], ['oror', [10838]], ['orslope', [10839]], ['orv', [10843]], ['oS', [9416]], ['Oscr', [119978]], ['oscr', [8500]], ['Oslash', [216]], ['oslash', [248]], ['osol', [8856]], ['Otilde', [213]], ['otilde', [245]], ['otimesas', [10806]], ['Otimes', [10807]], ['otimes', [8855]], ['Ouml', [214]], ['ouml', [246]], ['ovbar', [9021]], ['OverBar', [8254]], ['OverBrace', [9182]], ['OverBracket', [9140]], ['OverParenthesis', [9180]], ['para', [182]], ['parallel', [8741]], ['par', [8741]], ['parsim', [10995]], ['parsl', [11005]], ['part', [8706]], ['PartialD', [8706]], ['Pcy', [1055]], ['pcy', [1087]], ['percnt', [37]], ['period', [46]], ['permil', [8240]], ['perp', [8869]], ['pertenk', [8241]], ['Pfr', [120083]], ['pfr', [120109]], ['Phi', [934]], ['phi', [966]], ['phiv', [981]], ['phmmat', [8499]], ['phone', [9742]], ['Pi', [928]], ['pi', [960]], ['pitchfork', [8916]], ['piv', [982]], ['planck', [8463]], ['planckh', [8462]], ['plankv', [8463]], ['plusacir', [10787]], ['plusb', [8862]], ['pluscir', [10786]], ['plus', [43]], ['plusdo', [8724]], ['plusdu', [10789]], ['pluse', [10866]], ['PlusMinus', [177]], ['plusmn', [177]], ['plussim', [10790]], ['plustwo', [10791]], ['pm', [177]], ['Poincareplane', [8460]], ['pointint', [10773]], ['popf', [120161]], ['Popf', [8473]], ['pound', [163]], ['prap', [10935]], ['Pr', [10939]], ['pr', [8826]], ['prcue', [8828]], ['precapprox', [10935]], ['prec', [8826]], ['preccurlyeq', [8828]], ['Precedes', [8826]], ['PrecedesEqual', [10927]], ['PrecedesSlantEqual', [8828]], ['PrecedesTilde', [8830]], ['preceq', [10927]], ['precnapprox', [10937]], ['precneqq', [10933]], ['precnsim', [8936]], ['pre', [10927]], ['prE', [10931]], ['precsim', [8830]], ['prime', [8242]], ['Prime', [8243]], ['primes', [8473]], ['prnap', [10937]], ['prnE', [10933]], ['prnsim', [8936]], ['prod', [8719]], ['Product', [8719]], ['profalar', [9006]], ['profline', [8978]], ['profsurf', [8979]], ['prop', [8733]], ['Proportional', [8733]], ['Proportion', [8759]], ['propto', [8733]], ['prsim', [8830]], ['prurel', [8880]], ['Pscr', [119979]], ['pscr', [120005]], ['Psi', [936]], ['psi', [968]], ['puncsp', [8200]], ['Qfr', [120084]], ['qfr', [120110]], ['qint', [10764]], ['qopf', [120162]], ['Qopf', [8474]], ['qprime', [8279]], ['Qscr', [119980]], ['qscr', [120006]], ['quaternions', [8461]], ['quatint', [10774]], ['quest', [63]], ['questeq', [8799]], ['quot', [34]], ['QUOT', [34]], ['rAarr', [8667]], ['race', [8765, 817]], ['Racute', [340]], ['racute', [341]], ['radic', [8730]], ['raemptyv', [10675]], ['rang', [10217]], ['Rang', [10219]], ['rangd', [10642]], ['range', [10661]], ['rangle', [10217]], ['raquo', [187]], ['rarrap', [10613]], ['rarrb', [8677]], ['rarrbfs', [10528]], ['rarrc', [10547]], ['rarr', [8594]], ['Rarr', [8608]], ['rArr', [8658]], ['rarrfs', [10526]], ['rarrhk', [8618]], ['rarrlp', [8620]], ['rarrpl', [10565]], ['rarrsim', [10612]], ['Rarrtl', [10518]], ['rarrtl', [8611]], ['rarrw', [8605]], ['ratail', [10522]], ['rAtail', [10524]], ['ratio', [8758]], ['rationals', [8474]], ['rbarr', [10509]], ['rBarr', [10511]], ['RBarr', [10512]], ['rbbrk', [10099]], ['rbrace', [125]], ['rbrack', [93]], ['rbrke', [10636]], ['rbrksld', [10638]], ['rbrkslu', [10640]], ['Rcaron', [344]], ['rcaron', [345]], ['Rcedil', [342]], ['rcedil', [343]], ['rceil', [8969]], ['rcub', [125]], ['Rcy', [1056]], ['rcy', [1088]], ['rdca', [10551]], ['rdldhar', [10601]], ['rdquo', [8221]], ['rdquor', [8221]], ['CloseCurlyDoubleQuote', [8221]], ['rdsh', [8627]], ['real', [8476]], ['realine', [8475]], ['realpart', [8476]], ['reals', [8477]], ['Re', [8476]], ['rect', [9645]], ['reg', [174]], ['REG', [174]], ['ReverseElement', [8715]], ['ReverseEquilibrium', [8651]], ['ReverseUpEquilibrium', [10607]], ['rfisht', [10621]], ['rfloor', [8971]], ['rfr', [120111]], ['Rfr', [8476]], ['rHar', [10596]], ['rhard', [8641]], ['rharu', [8640]], ['rharul', [10604]], ['Rho', [929]], ['rho', [961]], ['rhov', [1009]], ['RightAngleBracket', [10217]], ['RightArrowBar', [8677]], ['rightarrow', [8594]], ['RightArrow', [8594]], ['Rightarrow', [8658]], ['RightArrowLeftArrow', [8644]], ['rightarrowtail', [8611]], ['RightCeiling', [8969]], ['RightDoubleBracket', [10215]], ['RightDownTeeVector', [10589]], ['RightDownVectorBar', [10581]], ['RightDownVector', [8642]], ['RightFloor', [8971]], ['rightharpoondown', [8641]], ['rightharpoonup', [8640]], ['rightleftarrows', [8644]], ['rightleftharpoons', [8652]], ['rightrightarrows', [8649]], ['rightsquigarrow', [8605]], ['RightTeeArrow', [8614]], ['RightTee', [8866]], ['RightTeeVector', [10587]], ['rightthreetimes', [8908]], ['RightTriangleBar', [10704]], ['RightTriangle', [8883]], ['RightTriangleEqual', [8885]], ['RightUpDownVector', [10575]], ['RightUpTeeVector', [10588]], ['RightUpVectorBar', [10580]], ['RightUpVector', [8638]], ['RightVectorBar', [10579]], ['RightVector', [8640]], ['ring', [730]], ['risingdotseq', [8787]], ['rlarr', [8644]], ['rlhar', [8652]], ['rlm', [8207]], ['rmoustache', [9137]], ['rmoust', [9137]], ['rnmid', [10990]], ['roang', [10221]], ['roarr', [8702]], ['robrk', [10215]], ['ropar', [10630]], ['ropf', [120163]], ['Ropf', [8477]], ['roplus', [10798]], ['rotimes', [10805]], ['RoundImplies', [10608]], ['rpar', [41]], ['rpargt', [10644]], ['rppolint', [10770]], ['rrarr', [8649]], ['Rrightarrow', [8667]], ['rsaquo', [8250]], ['rscr', [120007]], ['Rscr', [8475]], ['rsh', [8625]], ['Rsh', [8625]], ['rsqb', [93]], ['rsquo', [8217]], ['rsquor', [8217]], ['CloseCurlyQuote', [8217]], ['rthree', [8908]], ['rtimes', [8906]], ['rtri', [9657]], ['rtrie', [8885]], ['rtrif', [9656]], ['rtriltri', [10702]], ['RuleDelayed', [10740]], ['ruluhar', [10600]], ['rx', [8478]], ['Sacute', [346]], ['sacute', [347]], ['sbquo', [8218]], ['scap', [10936]], ['Scaron', [352]], ['scaron', [353]], ['Sc', [10940]], ['sc', [8827]], ['sccue', [8829]], ['sce', [10928]], ['scE', [10932]], ['Scedil', [350]], ['scedil', [351]], ['Scirc', [348]], ['scirc', [349]], ['scnap', [10938]], ['scnE', [10934]], ['scnsim', [8937]], ['scpolint', [10771]], ['scsim', [8831]], ['Scy', [1057]], ['scy', [1089]], ['sdotb', [8865]], ['sdot', [8901]], ['sdote', [10854]], ['searhk', [10533]], ['searr', [8600]], ['seArr', [8664]], ['searrow', [8600]], ['sect', [167]], ['semi', [59]], ['seswar', [10537]], ['setminus', [8726]], ['setmn', [8726]], ['sext', [10038]], ['Sfr', [120086]], ['sfr', [120112]], ['sfrown', [8994]], ['sharp', [9839]], ['SHCHcy', [1065]], ['shchcy', [1097]], ['SHcy', [1064]], ['shcy', [1096]], ['ShortDownArrow', [8595]], ['ShortLeftArrow', [8592]], ['shortmid', [8739]], ['shortparallel', [8741]], ['ShortRightArrow', [8594]], ['ShortUpArrow', [8593]], ['shy', [173]], ['Sigma', [931]], ['sigma', [963]], ['sigmaf', [962]], ['sigmav', [962]], ['sim', [8764]], ['simdot', [10858]], ['sime', [8771]], ['simeq', [8771]], ['simg', [10910]], ['simgE', [10912]], ['siml', [10909]], ['simlE', [10911]], ['simne', [8774]], ['simplus', [10788]], ['simrarr', [10610]], ['slarr', [8592]], ['SmallCircle', [8728]], ['smallsetminus', [8726]], ['smashp', [10803]], ['smeparsl', [10724]], ['smid', [8739]], ['smile', [8995]], ['smt', [10922]], ['smte', [10924]], ['smtes', [10924, 65024]], ['SOFTcy', [1068]], ['softcy', [1100]], ['solbar', [9023]], ['solb', [10692]], ['sol', [47]], ['Sopf', [120138]], ['sopf', [120164]], ['spades', [9824]], ['spadesuit', [9824]], ['spar', [8741]], ['sqcap', [8851]], ['sqcaps', [8851, 65024]], ['sqcup', [8852]], ['sqcups', [8852, 65024]], ['Sqrt', [8730]], ['sqsub', [8847]], ['sqsube', [8849]], ['sqsubset', [8847]], ['sqsubseteq', [8849]], ['sqsup', [8848]], ['sqsupe', [8850]], ['sqsupset', [8848]], ['sqsupseteq', [8850]], ['square', [9633]], ['Square', [9633]], ['SquareIntersection', [8851]], ['SquareSubset', [8847]], ['SquareSubsetEqual', [8849]], ['SquareSuperset', [8848]], ['SquareSupersetEqual', [8850]], ['SquareUnion', [8852]], ['squarf', [9642]], ['squ', [9633]], ['squf', [9642]], ['srarr', [8594]], ['Sscr', [119982]], ['sscr', [120008]], ['ssetmn', [8726]], ['ssmile', [8995]], ['sstarf', [8902]], ['Star', [8902]], ['star', [9734]], ['starf', [9733]], ['straightepsilon', [1013]], ['straightphi', [981]], ['strns', [175]], ['sub', [8834]], ['Sub', [8912]], ['subdot', [10941]], ['subE', [10949]], ['sube', [8838]], ['subedot', [10947]], ['submult', [10945]], ['subnE', [10955]], ['subne', [8842]], ['subplus', [10943]], ['subrarr', [10617]], ['subset', [8834]], ['Subset', [8912]], ['subseteq', [8838]], ['subseteqq', [10949]], ['SubsetEqual', [8838]], ['subsetneq', [8842]], ['subsetneqq', [10955]], ['subsim', [10951]], ['subsub', [10965]], ['subsup', [10963]], ['succapprox', [10936]], ['succ', [8827]], ['succcurlyeq', [8829]], ['Succeeds', [8827]], ['SucceedsEqual', [10928]], ['SucceedsSlantEqual', [8829]], ['SucceedsTilde', [8831]], ['succeq', [10928]], ['succnapprox', [10938]], ['succneqq', [10934]], ['succnsim', [8937]], ['succsim', [8831]], ['SuchThat', [8715]], ['sum', [8721]], ['Sum', [8721]], ['sung', [9834]], ['sup1', [185]], ['sup2', [178]], ['sup3', [179]], ['sup', [8835]], ['Sup', [8913]], ['supdot', [10942]], ['supdsub', [10968]], ['supE', [10950]], ['supe', [8839]], ['supedot', [10948]], ['Superset', [8835]], ['SupersetEqual', [8839]], ['suphsol', [10185]], ['suphsub', [10967]], ['suplarr', [10619]], ['supmult', [10946]], ['supnE', [10956]], ['supne', [8843]], ['supplus', [10944]], ['supset', [8835]], ['Supset', [8913]], ['supseteq', [8839]], ['supseteqq', [10950]], ['supsetneq', [8843]], ['supsetneqq', [10956]], ['supsim', [10952]], ['supsub', [10964]], ['supsup', [10966]], ['swarhk', [10534]], ['swarr', [8601]], ['swArr', [8665]], ['swarrow', [8601]], ['swnwar', [10538]], ['szlig', [223]], ['Tab', [9]], ['target', [8982]], ['Tau', [932]], ['tau', [964]], ['tbrk', [9140]], ['Tcaron', [356]], ['tcaron', [357]], ['Tcedil', [354]], ['tcedil', [355]], ['Tcy', [1058]], ['tcy', [1090]], ['tdot', [8411]], ['telrec', [8981]], ['Tfr', [120087]], ['tfr', [120113]], ['there4', [8756]], ['therefore', [8756]], ['Therefore', [8756]], ['Theta', [920]], ['theta', [952]], ['thetasym', [977]], ['thetav', [977]], ['thickapprox', [8776]], ['thicksim', [8764]], ['ThickSpace', [8287, 8202]], ['ThinSpace', [8201]], ['thinsp', [8201]], ['thkap', [8776]], ['thksim', [8764]], ['THORN', [222]], ['thorn', [254]], ['tilde', [732]], ['Tilde', [8764]], ['TildeEqual', [8771]], ['TildeFullEqual', [8773]], ['TildeTilde', [8776]], ['timesbar', [10801]], ['timesb', [8864]], ['times', [215]], ['timesd', [10800]], ['tint', [8749]], ['toea', [10536]], ['topbot', [9014]], ['topcir', [10993]], ['top', [8868]], ['Topf', [120139]], ['topf', [120165]], ['topfork', [10970]], ['tosa', [10537]], ['tprime', [8244]], ['trade', [8482]], ['TRADE', [8482]], ['triangle', [9653]], ['triangledown', [9663]], ['triangleleft', [9667]], ['trianglelefteq', [8884]], ['triangleq', [8796]], ['triangleright', [9657]], ['trianglerighteq', [8885]], ['tridot', [9708]], ['trie', [8796]], ['triminus', [10810]], ['TripleDot', [8411]], ['triplus', [10809]], ['trisb', [10701]], ['tritime', [10811]], ['trpezium', [9186]], ['Tscr', [119983]], ['tscr', [120009]], ['TScy', [1062]], ['tscy', [1094]], ['TSHcy', [1035]], ['tshcy', [1115]], ['Tstrok', [358]], ['tstrok', [359]], ['twixt', [8812]], ['twoheadleftarrow', [8606]], ['twoheadrightarrow', [8608]], ['Uacute', [218]], ['uacute', [250]], ['uarr', [8593]], ['Uarr', [8607]], ['uArr', [8657]], ['Uarrocir', [10569]], ['Ubrcy', [1038]], ['ubrcy', [1118]], ['Ubreve', [364]], ['ubreve', [365]], ['Ucirc', [219]], ['ucirc', [251]], ['Ucy', [1059]], ['ucy', [1091]], ['udarr', [8645]], ['Udblac', [368]], ['udblac', [369]], ['udhar', [10606]], ['ufisht', [10622]], ['Ufr', [120088]], ['ufr', [120114]], ['Ugrave', [217]], ['ugrave', [249]], ['uHar', [10595]], ['uharl', [8639]], ['uharr', [8638]], ['uhblk', [9600]], ['ulcorn', [8988]], ['ulcorner', [8988]], ['ulcrop', [8975]], ['ultri', [9720]], ['Umacr', [362]], ['umacr', [363]], ['uml', [168]], ['UnderBar', [95]], ['UnderBrace', [9183]], ['UnderBracket', [9141]], ['UnderParenthesis', [9181]], ['Union', [8899]], ['UnionPlus', [8846]], ['Uogon', [370]], ['uogon', [371]], ['Uopf', [120140]], ['uopf', [120166]], ['UpArrowBar', [10514]], ['uparrow', [8593]], ['UpArrow', [8593]], ['Uparrow', [8657]], ['UpArrowDownArrow', [8645]], ['updownarrow', [8597]], ['UpDownArrow', [8597]], ['Updownarrow', [8661]], ['UpEquilibrium', [10606]], ['upharpoonleft', [8639]], ['upharpoonright', [8638]], ['uplus', [8846]], ['UpperLeftArrow', [8598]], ['UpperRightArrow', [8599]], ['upsi', [965]], ['Upsi', [978]], ['upsih', [978]], ['Upsilon', [933]], ['upsilon', [965]], ['UpTeeArrow', [8613]], ['UpTee', [8869]], ['upuparrows', [8648]], ['urcorn', [8989]], ['urcorner', [8989]], ['urcrop', [8974]], ['Uring', [366]], ['uring', [367]], ['urtri', [9721]], ['Uscr', [119984]], ['uscr', [120010]], ['utdot', [8944]], ['Utilde', [360]], ['utilde', [361]], ['utri', [9653]], ['utrif', [9652]], ['uuarr', [8648]], ['Uuml', [220]], ['uuml', [252]], ['uwangle', [10663]], ['vangrt', [10652]], ['varepsilon', [1013]], ['varkappa', [1008]], ['varnothing', [8709]], ['varphi', [981]], ['varpi', [982]], ['varpropto', [8733]], ['varr', [8597]], ['vArr', [8661]], ['varrho', [1009]], ['varsigma', [962]], ['varsubsetneq', [8842, 65024]], ['varsubsetneqq', [10955, 65024]], ['varsupsetneq', [8843, 65024]], ['varsupsetneqq', [10956, 65024]], ['vartheta', [977]], ['vartriangleleft', [8882]], ['vartriangleright', [8883]], ['vBar', [10984]], ['Vbar', [10987]], ['vBarv', [10985]], ['Vcy', [1042]], ['vcy', [1074]], ['vdash', [8866]], ['vDash', [8872]], ['Vdash', [8873]], ['VDash', [8875]], ['Vdashl', [10982]], ['veebar', [8891]], ['vee', [8744]], ['Vee', [8897]], ['veeeq', [8794]], ['vellip', [8942]], ['verbar', [124]], ['Verbar', [8214]], ['vert', [124]], ['Vert', [8214]], ['VerticalBar', [8739]], ['VerticalLine', [124]], ['VerticalSeparator', [10072]], ['VerticalTilde', [8768]], ['VeryThinSpace', [8202]], ['Vfr', [120089]], ['vfr', [120115]], ['vltri', [8882]], ['vnsub', [8834, 8402]], ['vnsup', [8835, 8402]], ['Vopf', [120141]], ['vopf', [120167]], ['vprop', [8733]], ['vrtri', [8883]], ['Vscr', [119985]], ['vscr', [120011]], ['vsubnE', [10955, 65024]], ['vsubne', [8842, 65024]], ['vsupnE', [10956, 65024]], ['vsupne', [8843, 65024]], ['Vvdash', [8874]], ['vzigzag', [10650]], ['Wcirc', [372]], ['wcirc', [373]], ['wedbar', [10847]], ['wedge', [8743]], ['Wedge', [8896]], ['wedgeq', [8793]], ['weierp', [8472]], ['Wfr', [120090]], ['wfr', [120116]], ['Wopf', [120142]], ['wopf', [120168]], ['wp', [8472]], ['wr', [8768]], ['wreath', [8768]], ['Wscr', [119986]], ['wscr', [120012]], ['xcap', [8898]], ['xcirc', [9711]], ['xcup', [8899]], ['xdtri', [9661]], ['Xfr', [120091]], ['xfr', [120117]], ['xharr', [10231]], ['xhArr', [10234]], ['Xi', [926]], ['xi', [958]], ['xlarr', [10229]], ['xlArr', [10232]], ['xmap', [10236]], ['xnis', [8955]], ['xodot', [10752]], ['Xopf', [120143]], ['xopf', [120169]], ['xoplus', [10753]], ['xotime', [10754]], ['xrarr', [10230]], ['xrArr', [10233]], ['Xscr', [119987]], ['xscr', [120013]], ['xsqcup', [10758]], ['xuplus', [10756]], ['xutri', [9651]], ['xvee', [8897]], ['xwedge', [8896]], ['Yacute', [221]], ['yacute', [253]], ['YAcy', [1071]], ['yacy', [1103]], ['Ycirc', [374]], ['ycirc', [375]], ['Ycy', [1067]], ['ycy', [1099]], ['yen', [165]], ['Yfr', [120092]], ['yfr', [120118]], ['YIcy', [1031]], ['yicy', [1111]], ['Yopf', [120144]], ['yopf', [120170]], ['Yscr', [119988]], ['yscr', [120014]], ['YUcy', [1070]], ['yucy', [1102]], ['yuml', [255]], ['Yuml', [376]], ['Zacute', [377]], ['zacute', [378]], ['Zcaron', [381]], ['zcaron', [382]], ['Zcy', [1047]], ['zcy', [1079]], ['Zdot', [379]], ['zdot', [380]], ['zeetrf', [8488]], ['ZeroWidthSpace', [8203]], ['Zeta', [918]], ['zeta', [950]], ['zfr', [120119]], ['Zfr', [8488]], ['ZHcy', [1046]], ['zhcy', [1078]], ['zigrarr', [8669]], ['zopf', [120171]], ['Zopf', [8484]], ['Zscr', [119989]], ['zscr', [120015]], ['zwj', [8205]], ['zwnj', [8204]]];
var DECODE_ONLY_ENTITIES = [['NewLine', [10]]];
var alphaIndex = {};
var charIndex = {};
createIndexes(alphaIndex, charIndex);
var Html5Entities = /** @class */ (function () {
    function Html5Entities() {
    }
    Html5Entities.prototype.decode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        return str.replace(/&(#?[\w\d]+);?/g, function (s, entity) {
            var chr;
            if (entity.charAt(0) === "#") {
                var code = entity.charAt(1) === 'x' ?
                    parseInt(entity.substr(2).toLowerCase(), 16) :
                    parseInt(entity.substr(1));
                if (!isNaN(code) || code >= -32768) {
                    if (code <= 65535) {
                        chr = String.fromCharCode(code);
                    }
                    else {
                        chr = surrogate_pairs_1.fromCodePoint(code);
                    }
                }
            }
            else {
                chr = alphaIndex[entity];
            }
            return chr || s;
        });
    };
    Html5Entities.decode = function (str) {
        return new Html5Entities().decode(str);
    };
    Html5Entities.prototype.encode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var charInfo = charIndex[str.charCodeAt(i)];
            if (charInfo) {
                var alpha = charInfo[str.charCodeAt(i + 1)];
                if (alpha) {
                    i++;
                }
                else {
                    alpha = charInfo[''];
                }
                if (alpha) {
                    result += "&" + alpha + ";";
                    i++;
                    continue;
                }
            }
            result += str.charAt(i);
            i++;
        }
        return result;
    };
    Html5Entities.encode = function (str) {
        return new Html5Entities().encode(str);
    };
    Html5Entities.prototype.encodeNonUTF = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            var charInfo = charIndex[c];
            if (charInfo) {
                var alpha = charInfo[str.charCodeAt(i + 1)];
                if (alpha) {
                    i++;
                }
                else {
                    alpha = charInfo[''];
                }
                if (alpha) {
                    result += "&" + alpha + ";";
                    i++;
                    continue;
                }
            }
            if (c < 32 || c > 126) {
                if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                    result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                    i++;
                }
                else {
                    result += '&#' + c + ';';
                }
            }
            else {
                result += str.charAt(i);
            }
            i++;
        }
        return result;
    };
    Html5Entities.encodeNonUTF = function (str) {
        return new Html5Entities().encodeNonUTF(str);
    };
    Html5Entities.prototype.encodeNonASCII = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            if (c <= 255) {
                result += str[i++];
                continue;
            }
            if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                i += 2;
            }
            else {
                result += '&#' + c + ';';
                i++;
            }
        }
        return result;
    };
    Html5Entities.encodeNonASCII = function (str) {
        return new Html5Entities().encodeNonASCII(str);
    };
    return Html5Entities;
}());
exports.Html5Entities = Html5Entities;
function createIndexes(alphaIndex, charIndex) {
    var i = ENTITIES.length;
    while (i--) {
        var _a = ENTITIES[i], alpha = _a[0], _b = _a[1], chr = _b[0], chr2 = _b[1];
        var addChar = (chr < 32 || chr > 126) || chr === 62 || chr === 60 || chr === 38 || chr === 34 || chr === 39;
        var charInfo = void 0;
        if (addChar) {
            charInfo = charIndex[chr] = charIndex[chr] || {};
        }
        if (chr2) {
            alphaIndex[alpha] = String.fromCharCode(chr) + String.fromCharCode(chr2);
            addChar && (charInfo[chr2] = alpha);
        }
        else {
            alphaIndex[alpha] = String.fromCharCode(chr);
            addChar && (charInfo[''] = alpha);
        }
    }
    i = DECODE_ONLY_ENTITIES.length;
    while (i--) {
        var _c = DECODE_ONLY_ENTITIES[i], alpha = _c[0], _d = _c[1], chr = _d[0], chr2 = _d[1];
        alphaIndex[alpha] = String.fromCharCode(chr) + (chr2 ? String.fromCharCode(chr2) : '');
    }
}


/***/ }),

/***/ 59392:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var xml_entities_1 = __webpack_require__(11777);
exports.XmlEntities = xml_entities_1.XmlEntities;
var html4_entities_1 = __webpack_require__(83000);
exports.Html4Entities = html4_entities_1.Html4Entities;
var html5_entities_1 = __webpack_require__(96781);
exports.Html5Entities = html5_entities_1.Html5Entities;
exports.AllHtmlEntities = html5_entities_1.Html5Entities;


/***/ }),

/***/ 4265:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fromCodePoint = String.fromCodePoint || function (astralCodePoint) {
    return String.fromCharCode(Math.floor((astralCodePoint - 0x10000) / 0x400) + 0xD800, (astralCodePoint - 0x10000) % 0x400 + 0xDC00);
};
exports.getCodePoint = String.prototype.codePointAt ?
    function (input, position) {
        return input.codePointAt(position);
    } :
    function (input, position) {
        return (input.charCodeAt(position) - 0xD800) * 0x400
            + input.charCodeAt(position + 1) - 0xDC00 + 0x10000;
    };
exports.highSurrogateFrom = 0xD800;
exports.highSurrogateTo = 0xDBFF;


/***/ }),

/***/ 11777:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var surrogate_pairs_1 = __webpack_require__(4265);
var ALPHA_INDEX = {
    '&lt': '<',
    '&gt': '>',
    '&quot': '"',
    '&apos': '\'',
    '&amp': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': '\'',
    '&amp;': '&'
};
var CHAR_INDEX = {
    60: 'lt',
    62: 'gt',
    34: 'quot',
    39: 'apos',
    38: 'amp'
};
var CHAR_S_INDEX = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&apos;',
    '&': '&amp;'
};
var XmlEntities = /** @class */ (function () {
    function XmlEntities() {
    }
    XmlEntities.prototype.encode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        return str.replace(/[<>"'&]/g, function (s) {
            return CHAR_S_INDEX[s];
        });
    };
    XmlEntities.encode = function (str) {
        return new XmlEntities().encode(str);
    };
    XmlEntities.prototype.decode = function (str) {
        if (!str || !str.length) {
            return '';
        }
        return str.replace(/&#?[0-9a-zA-Z]+;?/g, function (s) {
            if (s.charAt(1) === '#') {
                var code = s.charAt(2).toLowerCase() === 'x' ?
                    parseInt(s.substr(3), 16) :
                    parseInt(s.substr(2));
                if (!isNaN(code) || code >= -32768) {
                    if (code <= 65535) {
                        return String.fromCharCode(code);
                    }
                    else {
                        return surrogate_pairs_1.fromCodePoint(code);
                    }
                }
                return '';
            }
            return ALPHA_INDEX[s] || s;
        });
    };
    XmlEntities.decode = function (str) {
        return new XmlEntities().decode(str);
    };
    XmlEntities.prototype.encodeNonUTF = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            var alpha = CHAR_INDEX[c];
            if (alpha) {
                result += "&" + alpha + ";";
                i++;
                continue;
            }
            if (c < 32 || c > 126) {
                if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                    result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                    i++;
                }
                else {
                    result += '&#' + c + ';';
                }
            }
            else {
                result += str.charAt(i);
            }
            i++;
        }
        return result;
    };
    XmlEntities.encodeNonUTF = function (str) {
        return new XmlEntities().encodeNonUTF(str);
    };
    XmlEntities.prototype.encodeNonASCII = function (str) {
        if (!str || !str.length) {
            return '';
        }
        var strLength = str.length;
        var result = '';
        var i = 0;
        while (i < strLength) {
            var c = str.charCodeAt(i);
            if (c <= 255) {
                result += str[i++];
                continue;
            }
            if (c >= surrogate_pairs_1.highSurrogateFrom && c <= surrogate_pairs_1.highSurrogateTo) {
                result += '&#' + surrogate_pairs_1.getCodePoint(str, i) + ';';
                i++;
            }
            else {
                result += '&#' + c + ';';
            }
            i++;
        }
        return result;
    };
    XmlEntities.encodeNonASCII = function (str) {
        return new XmlEntities().encodeNonASCII(str);
    };
    return XmlEntities;
}());
exports.XmlEntities = XmlEntities;


/***/ }),

/***/ 15729:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "Immer": () => (/* binding */ un),
/* harmony export */   "applyPatches": () => (/* binding */ pn),
/* harmony export */   "castDraft": () => (/* binding */ K),
/* harmony export */   "castImmutable": () => (/* binding */ $),
/* harmony export */   "createDraft": () => (/* binding */ ln),
/* harmony export */   "current": () => (/* binding */ D),
/* harmony export */   "enableAllPlugins": () => (/* binding */ J),
/* harmony export */   "enableES5": () => (/* binding */ N),
/* harmony export */   "enableMapSet": () => (/* binding */ C),
/* harmony export */   "enablePatches": () => (/* binding */ T),
/* harmony export */   "finishDraft": () => (/* binding */ dn),
/* harmony export */   "freeze": () => (/* binding */ d),
/* harmony export */   "immerable": () => (/* binding */ L),
/* harmony export */   "isDraft": () => (/* binding */ t),
/* harmony export */   "isDraftable": () => (/* binding */ r),
/* harmony export */   "nothing": () => (/* binding */ H),
/* harmony export */   "original": () => (/* binding */ e),
/* harmony export */   "produce": () => (/* binding */ fn),
/* harmony export */   "produceWithPatches": () => (/* binding */ cn),
/* harmony export */   "setAutoFreeze": () => (/* binding */ sn),
/* harmony export */   "setUseProxies": () => (/* binding */ vn)
/* harmony export */ });
function n(n){for(var t=arguments.length,r=Array(t>1?t-1:0),e=1;e<t;e++)r[e-1]=arguments[e];if(false){ var i, o; }throw Error("[Immer] minified error nr: "+n+(r.length?" "+r.map((function(n){return"'"+n+"'"})).join(","):"")+". Find the full error at: https://bit.ly/3cXEKWf")}function t(n){return!!n&&!!n[Q]}function r(n){return!!n&&(function(n){if(!n||"object"!=typeof n)return!1;var t=Object.getPrototypeOf(n);if(null===t)return!0;var r=Object.hasOwnProperty.call(t,"constructor")&&t.constructor;return r===Object||"function"==typeof r&&Function.toString.call(r)===Z}(n)||Array.isArray(n)||!!n[L]||!!n.constructor[L]||s(n)||v(n))}function e(r){return t(r)||n(23,r),r[Q].t}function i(n,t,r){void 0===r&&(r=!1),0===o(n)?(r?Object.keys:nn)(n).forEach((function(e){r&&"symbol"==typeof e||t(e,n[e],n)})):n.forEach((function(r,e){return t(e,r,n)}))}function o(n){var t=n[Q];return t?t.i>3?t.i-4:t.i:Array.isArray(n)?1:s(n)?2:v(n)?3:0}function u(n,t){return 2===o(n)?n.has(t):Object.prototype.hasOwnProperty.call(n,t)}function a(n,t){return 2===o(n)?n.get(t):n[t]}function f(n,t,r){var e=o(n);2===e?n.set(t,r):3===e?(n.delete(t),n.add(r)):n[t]=r}function c(n,t){return n===t?0!==n||1/n==1/t:n!=n&&t!=t}function s(n){return X&&n instanceof Map}function v(n){return q&&n instanceof Set}function p(n){return n.o||n.t}function l(n){if(Array.isArray(n))return Array.prototype.slice.call(n);var t=tn(n);delete t[Q];for(var r=nn(t),e=0;e<r.length;e++){var i=r[e],o=t[i];!1===o.writable&&(o.writable=!0,o.configurable=!0),(o.get||o.set)&&(t[i]={configurable:!0,writable:!0,enumerable:o.enumerable,value:n[i]})}return Object.create(Object.getPrototypeOf(n),t)}function d(n,e){return void 0===e&&(e=!1),y(n)||t(n)||!r(n)?n:(o(n)>1&&(n.set=n.add=n.clear=n.delete=h),Object.freeze(n),e&&i(n,(function(n,t){return d(t,!0)}),!0),n)}function h(){n(2)}function y(n){return null==n||"object"!=typeof n||Object.isFrozen(n)}function b(t){var r=rn[t];return r||n(18,t),r}function m(n,t){rn[n]||(rn[n]=t)}function _(){return true||0,U}function j(n,t){t&&(b("Patches"),n.u=[],n.s=[],n.v=t)}function O(n){g(n),n.p.forEach(S),n.p=null}function g(n){n===U&&(U=n.l)}function w(n){return U={p:[],l:U,h:n,m:!0,_:0}}function S(n){var t=n[Q];0===t.i||1===t.i?t.j():t.O=!0}function P(t,e){e._=e.p.length;var i=e.p[0],o=void 0!==t&&t!==i;return e.h.g||b("ES5").S(e,t,o),o?(i[Q].P&&(O(e),n(4)),r(t)&&(t=M(e,t),e.l||x(e,t)),e.u&&b("Patches").M(i[Q],t,e.u,e.s)):t=M(e,i,[]),O(e),e.u&&e.v(e.u,e.s),t!==H?t:void 0}function M(n,t,r){if(y(t))return t;var e=t[Q];if(!e)return i(t,(function(i,o){return A(n,e,t,i,o,r)}),!0),t;if(e.A!==n)return t;if(!e.P)return x(n,e.t,!0),e.t;if(!e.I){e.I=!0,e.A._--;var o=4===e.i||5===e.i?e.o=l(e.k):e.o;i(3===e.i?new Set(o):o,(function(t,i){return A(n,e,o,t,i,r)})),x(n,o,!1),r&&n.u&&b("Patches").R(e,r,n.u,n.s)}return e.o}function A(e,i,o,a,c,s){if( false&&0,t(c)){var v=M(e,c,s&&i&&3!==i.i&&!u(i.D,a)?s.concat(a):void 0);if(f(o,a,v),!t(v))return;e.m=!1}if(r(c)&&!y(c)){if(!e.h.F&&e._<1)return;M(e,c),i&&i.A.l||x(e,c)}}function x(n,t,r){void 0===r&&(r=!1),n.h.F&&n.m&&d(t,r)}function z(n,t){var r=n[Q];return(r?p(r):n)[t]}function I(n,t){if(t in n)for(var r=Object.getPrototypeOf(n);r;){var e=Object.getOwnPropertyDescriptor(r,t);if(e)return e;r=Object.getPrototypeOf(r)}}function k(n){n.P||(n.P=!0,n.l&&k(n.l))}function E(n){n.o||(n.o=l(n.t))}function R(n,t,r){var e=s(t)?b("MapSet").N(t,r):v(t)?b("MapSet").T(t,r):n.g?function(n,t){var r=Array.isArray(n),e={i:r?1:0,A:t?t.A:_(),P:!1,I:!1,D:{},l:t,t:n,k:null,o:null,j:null,C:!1},i=e,o=en;r&&(i=[e],o=on);var u=Proxy.revocable(i,o),a=u.revoke,f=u.proxy;return e.k=f,e.j=a,f}(t,r):b("ES5").J(t,r);return(r?r.A:_()).p.push(e),e}function D(e){return t(e)||n(22,e),function n(t){if(!r(t))return t;var e,u=t[Q],c=o(t);if(u){if(!u.P&&(u.i<4||!b("ES5").K(u)))return u.t;u.I=!0,e=F(t,c),u.I=!1}else e=F(t,c);return i(e,(function(t,r){u&&a(u.t,t)===r||f(e,t,n(r))})),3===c?new Set(e):e}(e)}function F(n,t){switch(t){case 2:return new Map(n);case 3:return Array.from(n)}return l(n)}function N(){function r(n,t){var r=s[n];return r?r.enumerable=t:s[n]=r={configurable:!0,enumerable:t,get:function(){var t=this[Q];return false&&0,en.get(t,n)},set:function(t){var r=this[Q]; false&&0,en.set(r,n,t)}},r}function e(n){for(var t=n.length-1;t>=0;t--){var r=n[t][Q];if(!r.P)switch(r.i){case 5:a(r)&&k(r);break;case 4:o(r)&&k(r)}}}function o(n){for(var t=n.t,r=n.k,e=nn(r),i=e.length-1;i>=0;i--){var o=e[i];if(o!==Q){var a=t[o];if(void 0===a&&!u(t,o))return!0;var f=r[o],s=f&&f[Q];if(s?s.t!==a:!c(f,a))return!0}}var v=!!t[Q];return e.length!==nn(t).length+(v?0:1)}function a(n){var t=n.k;if(t.length!==n.t.length)return!0;var r=Object.getOwnPropertyDescriptor(t,t.length-1);return!(!r||r.get)}function f(t){t.O&&n(3,JSON.stringify(p(t)))}var s={};m("ES5",{J:function(n,t){var e=Array.isArray(n),i=function(n,t){if(n){for(var e=Array(t.length),i=0;i<t.length;i++)Object.defineProperty(e,""+i,r(i,!0));return e}var o=tn(t);delete o[Q];for(var u=nn(o),a=0;a<u.length;a++){var f=u[a];o[f]=r(f,n||!!o[f].enumerable)}return Object.create(Object.getPrototypeOf(t),o)}(e,n),o={i:e?5:4,A:t?t.A:_(),P:!1,I:!1,D:{},l:t,t:n,k:i,o:null,O:!1,C:!1};return Object.defineProperty(i,Q,{value:o,writable:!0}),i},S:function(n,r,o){o?t(r)&&r[Q].A===n&&e(n.p):(n.u&&function n(t){if(t&&"object"==typeof t){var r=t[Q];if(r){var e=r.t,o=r.k,f=r.D,c=r.i;if(4===c)i(o,(function(t){t!==Q&&(void 0!==e[t]||u(e,t)?f[t]||n(o[t]):(f[t]=!0,k(r)))})),i(e,(function(n){void 0!==o[n]||u(o,n)||(f[n]=!1,k(r))}));else if(5===c){if(a(r)&&(k(r),f.length=!0),o.length<e.length)for(var s=o.length;s<e.length;s++)f[s]=!1;else for(var v=e.length;v<o.length;v++)f[v]=!0;for(var p=Math.min(o.length,e.length),l=0;l<p;l++)void 0===f[l]&&n(o[l])}}}}(n.p[0]),e(n.p))},K:function(n){return 4===n.i?o(n):a(n)}})}function T(){function e(n){if(!r(n))return n;if(Array.isArray(n))return n.map(e);if(s(n))return new Map(Array.from(n.entries()).map((function(n){return[n[0],e(n[1])]})));if(v(n))return new Set(Array.from(n).map(e));var t=Object.create(Object.getPrototypeOf(n));for(var i in n)t[i]=e(n[i]);return u(n,L)&&(t[L]=n[L]),t}function f(n){return t(n)?e(n):n}var c="add";m("Patches",{$:function(t,r){return r.forEach((function(r){for(var i=r.path,u=r.op,f=t,s=0;s<i.length-1;s++){var v=o(f),p=""+i[s];0!==v&&1!==v||"__proto__"!==p&&"constructor"!==p||n(24),"function"==typeof f&&"prototype"===p&&n(24),"object"!=typeof(f=a(f,p))&&n(15,i.join("/"))}var l=o(f),d=e(r.value),h=i[i.length-1];switch(u){case"replace":switch(l){case 2:return f.set(h,d);case 3:n(16);default:return f[h]=d}case c:switch(l){case 1:return"-"===h?f.push(d):f.splice(h,0,d);case 2:return f.set(h,d);case 3:return f.add(d);default:return f[h]=d}case"remove":switch(l){case 1:return f.splice(h,1);case 2:return f.delete(h);case 3:return f.delete(r.value);default:return delete f[h]}default:n(17,u)}})),t},R:function(n,t,r,e){switch(n.i){case 0:case 4:case 2:return function(n,t,r,e){var o=n.t,s=n.o;i(n.D,(function(n,i){var v=a(o,n),p=a(s,n),l=i?u(o,n)?"replace":c:"remove";if(v!==p||"replace"!==l){var d=t.concat(n);r.push("remove"===l?{op:l,path:d}:{op:l,path:d,value:p}),e.push(l===c?{op:"remove",path:d}:"remove"===l?{op:c,path:d,value:f(v)}:{op:"replace",path:d,value:f(v)})}}))}(n,t,r,e);case 5:case 1:return function(n,t,r,e){var i=n.t,o=n.D,u=n.o;if(u.length<i.length){var a=[u,i];i=a[0],u=a[1];var s=[e,r];r=s[0],e=s[1]}for(var v=0;v<i.length;v++)if(o[v]&&u[v]!==i[v]){var p=t.concat([v]);r.push({op:"replace",path:p,value:f(u[v])}),e.push({op:"replace",path:p,value:f(i[v])})}for(var l=i.length;l<u.length;l++){var d=t.concat([l]);r.push({op:c,path:d,value:f(u[l])})}i.length<u.length&&e.push({op:"replace",path:t.concat(["length"]),value:i.length})}(n,t,r,e);case 3:return function(n,t,r,e){var i=n.t,o=n.o,u=0;i.forEach((function(n){if(!o.has(n)){var i=t.concat([u]);r.push({op:"remove",path:i,value:n}),e.unshift({op:c,path:i,value:n})}u++})),u=0,o.forEach((function(n){if(!i.has(n)){var o=t.concat([u]);r.push({op:c,path:o,value:n}),e.unshift({op:"remove",path:o,value:n})}u++}))}(n,t,r,e)}},M:function(n,t,r,e){r.push({op:"replace",path:[],value:t===H?void 0:t}),e.push({op:"replace",path:[],value:n.t})}})}function C(){function t(n,t){function r(){this.constructor=n}a(n,t),n.prototype=(r.prototype=t.prototype,new r)}function e(n){n.o||(n.D=new Map,n.o=new Map(n.t))}function o(n){n.o||(n.o=new Set,n.t.forEach((function(t){if(r(t)){var e=R(n.A.h,t,n);n.p.set(t,e),n.o.add(e)}else n.o.add(t)})))}function u(t){t.O&&n(3,JSON.stringify(p(t)))}var a=function(n,t){return(a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,t){n.__proto__=t}||function(n,t){for(var r in t)t.hasOwnProperty(r)&&(n[r]=t[r])})(n,t)},f=function(){function n(n,t){return this[Q]={i:2,l:t,A:t?t.A:_(),P:!1,I:!1,o:void 0,D:void 0,t:n,k:this,C:!1,O:!1},this}t(n,Map);var o=n.prototype;return Object.defineProperty(o,"size",{get:function(){return p(this[Q]).size}}),o.has=function(n){return p(this[Q]).has(n)},o.set=function(n,t){var r=this[Q];return u(r),p(r).has(n)&&p(r).get(n)===t||(e(r),k(r),r.D.set(n,!0),r.o.set(n,t),r.D.set(n,!0)),this},o.delete=function(n){if(!this.has(n))return!1;var t=this[Q];return u(t),e(t),k(t),t.D.set(n,!1),t.o.delete(n),!0},o.clear=function(){var n=this[Q];u(n),p(n).size&&(e(n),k(n),n.D=new Map,i(n.t,(function(t){n.D.set(t,!1)})),n.o.clear())},o.forEach=function(n,t){var r=this;p(this[Q]).forEach((function(e,i){n.call(t,r.get(i),i,r)}))},o.get=function(n){var t=this[Q];u(t);var i=p(t).get(n);if(t.I||!r(i))return i;if(i!==t.t.get(n))return i;var o=R(t.A.h,i,t);return e(t),t.o.set(n,o),o},o.keys=function(){return p(this[Q]).keys()},o.values=function(){var n,t=this,r=this.keys();return(n={})[V]=function(){return t.values()},n.next=function(){var n=r.next();return n.done?n:{done:!1,value:t.get(n.value)}},n},o.entries=function(){var n,t=this,r=this.keys();return(n={})[V]=function(){return t.entries()},n.next=function(){var n=r.next();if(n.done)return n;var e=t.get(n.value);return{done:!1,value:[n.value,e]}},n},o[V]=function(){return this.entries()},n}(),c=function(){function n(n,t){return this[Q]={i:3,l:t,A:t?t.A:_(),P:!1,I:!1,o:void 0,t:n,k:this,p:new Map,O:!1,C:!1},this}t(n,Set);var r=n.prototype;return Object.defineProperty(r,"size",{get:function(){return p(this[Q]).size}}),r.has=function(n){var t=this[Q];return u(t),t.o?!!t.o.has(n)||!(!t.p.has(n)||!t.o.has(t.p.get(n))):t.t.has(n)},r.add=function(n){var t=this[Q];return u(t),this.has(n)||(o(t),k(t),t.o.add(n)),this},r.delete=function(n){if(!this.has(n))return!1;var t=this[Q];return u(t),o(t),k(t),t.o.delete(n)||!!t.p.has(n)&&t.o.delete(t.p.get(n))},r.clear=function(){var n=this[Q];u(n),p(n).size&&(o(n),k(n),n.o.clear())},r.values=function(){var n=this[Q];return u(n),o(n),n.o.values()},r.entries=function(){var n=this[Q];return u(n),o(n),n.o.entries()},r.keys=function(){return this.values()},r[V]=function(){return this.values()},r.forEach=function(n,t){for(var r=this.values(),e=r.next();!e.done;)n.call(t,e.value,e.value,this),e=r.next()},n}();m("MapSet",{N:function(n,t){return new f(n,t)},T:function(n,t){return new c(n,t)}})}function J(){N(),C(),T()}function K(n){return n}function $(n){return n}var G,U,W="undefined"!=typeof Symbol&&"symbol"==typeof Symbol("x"),X="undefined"!=typeof Map,q="undefined"!=typeof Set,B="undefined"!=typeof Proxy&&void 0!==Proxy.revocable&&"undefined"!=typeof Reflect,H=W?Symbol.for("immer-nothing"):((G={})["immer-nothing"]=!0,G),L=W?Symbol.for("immer-draftable"):"__$immer_draftable",Q=W?Symbol.for("immer-state"):"__$immer_state",V="undefined"!=typeof Symbol&&Symbol.iterator||"@@iterator",Y={0:"Illegal state",1:"Immer drafts cannot have computed properties",2:"This object has been frozen and should not be mutated",3:function(n){return"Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? "+n},4:"An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",5:"Immer forbids circular references",6:"The first or second argument to `produce` must be a function",7:"The third argument to `produce` must be a function or undefined",8:"First argument to `createDraft` must be a plain object, an array, or an immerable object",9:"First argument to `finishDraft` must be a draft returned by `createDraft`",10:"The given draft is already finalized",11:"Object.defineProperty() cannot be used on an Immer draft",12:"Object.setPrototypeOf() cannot be used on an Immer draft",13:"Immer only supports deleting array indices",14:"Immer only supports setting array indices and the 'length' property",15:function(n){return"Cannot apply patch, path doesn't resolve: "+n},16:'Sets cannot have "replace" patches.',17:function(n){return"Unsupported patch operation: "+n},18:function(n){return"The plugin for '"+n+"' has not been loaded into Immer. To enable the plugin, import and call `enable"+n+"()` when initializing your application."},20:"Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available",21:function(n){return"produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '"+n+"'"},22:function(n){return"'current' expects a draft, got: "+n},23:function(n){return"'original' expects a draft, got: "+n},24:"Patching reserved attributes like __proto__, prototype and constructor is not allowed"},Z=""+Object.prototype.constructor,nn="undefined"!=typeof Reflect&&Reflect.ownKeys?Reflect.ownKeys:void 0!==Object.getOwnPropertySymbols?function(n){return Object.getOwnPropertyNames(n).concat(Object.getOwnPropertySymbols(n))}:Object.getOwnPropertyNames,tn=Object.getOwnPropertyDescriptors||function(n){var t={};return nn(n).forEach((function(r){t[r]=Object.getOwnPropertyDescriptor(n,r)})),t},rn={},en={get:function(n,t){if(t===Q)return n;var e=p(n);if(!u(e,t))return function(n,t,r){var e,i=I(t,r);return i?"value"in i?i.value:null===(e=i.get)||void 0===e?void 0:e.call(n.k):void 0}(n,e,t);var i=e[t];return n.I||!r(i)?i:i===z(n.t,t)?(E(n),n.o[t]=R(n.A.h,i,n)):i},has:function(n,t){return t in p(n)},ownKeys:function(n){return Reflect.ownKeys(p(n))},set:function(n,t,r){var e=I(p(n),t);if(null==e?void 0:e.set)return e.set.call(n.k,r),!0;if(!n.P){var i=z(p(n),t),o=null==i?void 0:i[Q];if(o&&o.t===r)return n.o[t]=r,n.D[t]=!1,!0;if(c(r,i)&&(void 0!==r||u(n.t,t)))return!0;E(n),k(n)}return n.o[t]===r&&"number"!=typeof r&&(void 0!==r||t in n.o)||(n.o[t]=r,n.D[t]=!0,!0)},deleteProperty:function(n,t){return void 0!==z(n.t,t)||t in n.t?(n.D[t]=!1,E(n),k(n)):delete n.D[t],n.o&&delete n.o[t],!0},getOwnPropertyDescriptor:function(n,t){var r=p(n),e=Reflect.getOwnPropertyDescriptor(r,t);return e?{writable:!0,configurable:1!==n.i||"length"!==t,enumerable:e.enumerable,value:r[t]}:e},defineProperty:function(){n(11)},getPrototypeOf:function(n){return Object.getPrototypeOf(n.t)},setPrototypeOf:function(){n(12)}},on={};i(en,(function(n,t){on[n]=function(){return arguments[0]=arguments[0][0],t.apply(this,arguments)}})),on.deleteProperty=function(t,r){return false&&0,en.deleteProperty.call(this,t[0],r)},on.set=function(t,r,e){return false&&0,en.set.call(this,t[0],r,e,t[0])};var un=function(){function e(t){var e=this;this.g=B,this.F=!0,this.produce=function(t,i,o){if("function"==typeof t&&"function"!=typeof i){var u=i;i=t;var a=e;return function(n){var t=this;void 0===n&&(n=u);for(var r=arguments.length,e=Array(r>1?r-1:0),o=1;o<r;o++)e[o-1]=arguments[o];return a.produce(n,(function(n){var r;return(r=i).call.apply(r,[t,n].concat(e))}))}}var f;if("function"!=typeof i&&n(6),void 0!==o&&"function"!=typeof o&&n(7),r(t)){var c=w(e),s=R(e,t,void 0),v=!0;try{f=i(s),v=!1}finally{v?O(c):g(c)}return"undefined"!=typeof Promise&&f instanceof Promise?f.then((function(n){return j(c,o),P(n,c)}),(function(n){throw O(c),n})):(j(c,o),P(f,c))}if(!t||"object"!=typeof t){if((f=i(t))===H)return;return void 0===f&&(f=t),e.F&&d(f,!0),f}n(21,t)},this.produceWithPatches=function(n,t){return"function"==typeof n?function(t){for(var r=arguments.length,i=Array(r>1?r-1:0),o=1;o<r;o++)i[o-1]=arguments[o];return e.produceWithPatches(t,(function(t){return n.apply(void 0,[t].concat(i))}))}:[e.produce(n,t,(function(n,t){r=n,i=t})),r,i];var r,i},"boolean"==typeof(null==t?void 0:t.useProxies)&&this.setUseProxies(t.useProxies),"boolean"==typeof(null==t?void 0:t.autoFreeze)&&this.setAutoFreeze(t.autoFreeze)}var i=e.prototype;return i.createDraft=function(e){r(e)||n(8),t(e)&&(e=D(e));var i=w(this),o=R(this,e,void 0);return o[Q].C=!0,g(i),o},i.finishDraft=function(t,r){var e=t&&t[Q]; false&&(0);var i=e.A;return j(i,r),P(void 0,i)},i.setAutoFreeze=function(n){this.F=n},i.setUseProxies=function(t){t&&!B&&n(20),this.g=t},i.applyPatches=function(n,r){var e;for(e=r.length-1;e>=0;e--){var i=r[e];if(0===i.path.length&&"replace"===i.op){n=i.value;break}}e>-1&&(r=r.slice(e+1));var o=b("Patches").$;return t(n)?o(n,r):this.produce(n,(function(n){return o(n,r)}))},e}(),an=new un,fn=an.produce,cn=an.produceWithPatches.bind(an),sn=an.setAutoFreeze.bind(an),vn=an.setUseProxies.bind(an),pn=an.applyPatches.bind(an),ln=an.createDraft.bind(an),dn=an.finishDraft.bind(an);/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (fn);
//# sourceMappingURL=immer.esm.js.map


/***/ }),

/***/ 77105:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


// A linked list to keep track of recently-used-ness
const Yallist = __webpack_require__(8006)

const MAX = Symbol('max')
const LENGTH = Symbol('length')
const LENGTH_CALCULATOR = Symbol('lengthCalculator')
const ALLOW_STALE = Symbol('allowStale')
const MAX_AGE = Symbol('maxAge')
const DISPOSE = Symbol('dispose')
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet')
const LRU_LIST = Symbol('lruList')
const CACHE = Symbol('cache')
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet')

const naiveLength = () => 1

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache {
  constructor (options) {
    if (typeof options === 'number')
      options = { max: options }

    if (!options)
      options = {}

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number')
    // Kind of weird to have a default max of Infinity, but oh well.
    const max = this[MAX] = options.max || Infinity

    const lc = options.length || naiveLength
    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc
    this[ALLOW_STALE] = options.stale || false
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number')
    this[MAX_AGE] = options.maxAge || 0
    this[DISPOSE] = options.dispose
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false
    this.reset()
  }

  // resize the cache when the max changes.
  set max (mL) {
    if (typeof mL !== 'number' || mL < 0)
      throw new TypeError('max must be a non-negative number')

    this[MAX] = mL || Infinity
    trim(this)
  }
  get max () {
    return this[MAX]
  }

  set allowStale (allowStale) {
    this[ALLOW_STALE] = !!allowStale
  }
  get allowStale () {
    return this[ALLOW_STALE]
  }

  set maxAge (mA) {
    if (typeof mA !== 'number')
      throw new TypeError('maxAge must be a non-negative number')

    this[MAX_AGE] = mA
    trim(this)
  }
  get maxAge () {
    return this[MAX_AGE]
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator (lC) {
    if (typeof lC !== 'function')
      lC = naiveLength

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC
      this[LENGTH] = 0
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key)
        this[LENGTH] += hit.length
      })
    }
    trim(this)
  }
  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

  get length () { return this[LENGTH] }
  get itemCount () { return this[LRU_LIST].length }

  rforEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].tail; walker !== null;) {
      const prev = walker.prev
      forEachStep(this, fn, walker, thisp)
      walker = prev
    }
  }

  forEach (fn, thisp) {
    thisp = thisp || this
    for (let walker = this[LRU_LIST].head; walker !== null;) {
      const next = walker.next
      forEachStep(this, fn, walker, thisp)
      walker = next
    }
  }

  keys () {
    return this[LRU_LIST].toArray().map(k => k.key)
  }

  values () {
    return this[LRU_LIST].toArray().map(k => k.value)
  }

  reset () {
    if (this[DISPOSE] &&
        this[LRU_LIST] &&
        this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value))
    }

    this[CACHE] = new Map() // hash of items by key
    this[LRU_LIST] = new Yallist() // list of items in order of use recency
    this[LENGTH] = 0 // length of items in the list
  }

  dump () {
    return this[LRU_LIST].map(hit =>
      isStale(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h)
  }

  dumpLru () {
    return this[LRU_LIST]
  }

  set (key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE]

    if (maxAge && typeof maxAge !== 'number')
      throw new TypeError('maxAge must be a number')

    const now = maxAge ? Date.now() : 0
    const len = this[LENGTH_CALCULATOR](value, key)

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key))
        return false
      }

      const node = this[CACHE].get(key)
      const item = node.value

      // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking
      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET])
          this[DISPOSE](key, item.value)
      }

      item.now = now
      item.maxAge = maxAge
      item.value = value
      this[LENGTH] += len - item.length
      item.length = len
      this.get(key)
      trim(this)
      return true
    }

    const hit = new Entry(key, value, len, now, maxAge)

    // oversized objects fall out of cache automatically.
    if (hit.length > this[MAX]) {
      if (this[DISPOSE])
        this[DISPOSE](key, value)

      return false
    }

    this[LENGTH] += hit.length
    this[LRU_LIST].unshift(hit)
    this[CACHE].set(key, this[LRU_LIST].head)
    trim(this)
    return true
  }

  has (key) {
    if (!this[CACHE].has(key)) return false
    const hit = this[CACHE].get(key).value
    return !isStale(this, hit)
  }

  get (key) {
    return get(this, key, true)
  }

  peek (key) {
    return get(this, key, false)
  }

  pop () {
    const node = this[LRU_LIST].tail
    if (!node)
      return null

    del(this, node)
    return node.value
  }

  del (key) {
    del(this, this[CACHE].get(key))
  }

  load (arr) {
    // reset the cache
    this.reset()

    const now = Date.now()
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l]
      const expiresAt = hit.e || 0
      if (expiresAt === 0)
        // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v)
      else {
        const maxAge = expiresAt - now
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge)
        }
      }
    }
  }

  prune () {
    this[CACHE].forEach((value, key) => get(this, key, false))
  }
}

const get = (self, key, doUse) => {
  const node = self[CACHE].get(key)
  if (node) {
    const hit = node.value
    if (isStale(self, hit)) {
      del(self, node)
      if (!self[ALLOW_STALE])
        return undefined
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET])
          node.value.now = Date.now()
        self[LRU_LIST].unshiftNode(node)
      }
    }
    return hit.value
  }
}

const isStale = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
    return false

  const diff = Date.now() - hit.now
  return hit.maxAge ? diff > hit.maxAge
    : self[MAX_AGE] && (diff > self[MAX_AGE])
}

const trim = self => {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LRU_LIST].tail;
      self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev
      del(self, walker)
      walker = prev
    }
  }
}

const del = (self, node) => {
  if (node) {
    const hit = node.value
    if (self[DISPOSE])
      self[DISPOSE](hit.key, hit.value)

    self[LENGTH] -= hit.length
    self[CACHE].delete(hit.key)
    self[LRU_LIST].removeNode(node)
  }
}

class Entry {
  constructor (key, value, length, now, maxAge) {
    this.key = key
    this.value = value
    this.length = length
    this.now = now
    this.maxAge = maxAge || 0
  }
}

const forEachStep = (self, fn, node, thisp) => {
  let hit = node.value
  if (isStale(self, hit)) {
    del(self, node)
    if (!self[ALLOW_STALE])
      hit = undefined
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self)
}

module.exports = LRUCache


/***/ }),

/***/ 26047:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isArrayish = __webpack_require__(30905);

var concat = Array.prototype.concat;
var slice = Array.prototype.slice;

var swizzle = module.exports = function swizzle(args) {
	var results = [];

	for (var i = 0, len = args.length; i < len; i++) {
		var arg = args[i];

		if (isArrayish(arg)) {
			// http://jsperf.com/javascript-array-concat-vs-push/98
			results = concat.call(results, slice.call(arg));
		} else {
			results.push(arg);
		}
	}

	return results;
};

swizzle.wrap = function (fn) {
	return function () {
		return fn(swizzle(arguments));
	};
};


/***/ }),

/***/ 30905:
/***/ ((module) => {

module.exports = function isArrayish(obj) {
	if (!obj || typeof obj === 'string') {
		return false;
	}

	return obj instanceof Array || Array.isArray(obj) ||
		(obj.length >= 0 && (obj.splice instanceof Function ||
			(Object.getOwnPropertyDescriptor(obj, (obj.length - 1)) && obj.constructor.name !== 'String')));
};


/***/ }),

/***/ 38268:
/***/ ((module) => {

"use strict";

module.exports = function (Yallist) {
  Yallist.prototype[Symbol.iterator] = function* () {
    for (let walker = this.head; walker; walker = walker.next) {
      yield walker.value
    }
  }
}


/***/ }),

/***/ 8006:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = Yallist

Yallist.Node = Node
Yallist.create = Yallist

function Yallist (list) {
  var self = this
  if (!(self instanceof Yallist)) {
    self = new Yallist()
  }

  self.tail = null
  self.head = null
  self.length = 0

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item)
    })
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i])
    }
  }

  return self
}

Yallist.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next
  var prev = node.prev

  if (next) {
    next.prev = prev
  }

  if (prev) {
    prev.next = next
  }

  if (node === this.head) {
    this.head = next
  }
  if (node === this.tail) {
    this.tail = prev
  }

  node.list.length--
  node.next = null
  node.prev = null
  node.list = null

  return next
}

Yallist.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var head = this.head
  node.list = this
  node.next = head
  if (head) {
    head.prev = node
  }

  this.head = node
  if (!this.tail) {
    this.tail = node
  }
  this.length++
}

Yallist.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node)
  }

  var tail = this.tail
  node.list = this
  node.prev = tail
  if (tail) {
    tail.next = node
  }

  this.tail = node
  if (!this.head) {
    this.head = node
  }
  this.length++
}

Yallist.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i])
  }
  return this.length
}

Yallist.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value
  this.tail = this.tail.prev
  if (this.tail) {
    this.tail.next = null
  } else {
    this.head = null
  }
  this.length--
  return res
}

Yallist.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value
  this.head = this.head.next
  if (this.head) {
    this.head.prev = null
  } else {
    this.tail = null
  }
  this.length--
  return res
}

Yallist.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.next
  }
}

Yallist.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this)
    walker = walker.prev
  }
}

Yallist.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev
  }
  if (i === n && walker !== null) {
    return walker.value
  }
}

Yallist.prototype.map = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.next
  }
  return res
}

Yallist.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this
  var res = new Yallist()
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this))
    walker = walker.prev
  }
  return res
}

Yallist.prototype.reduce = function (fn, initial) {
  var acc
  var walker = this.head
  if (arguments.length > 1) {
    acc = initial
  } else if (this.head) {
    walker = this.head.next
    acc = this.head.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i)
    walker = walker.next
  }

  return acc
}

Yallist.prototype.reduceReverse = function (fn, initial) {
  var acc
  var walker = this.tail
  if (arguments.length > 1) {
    acc = initial
  } else if (this.tail) {
    walker = this.tail.prev
    acc = this.tail.value
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i)
    walker = walker.prev
  }

  return acc
}

Yallist.prototype.toArray = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.next
  }
  return arr
}

Yallist.prototype.toArrayReverse = function () {
  var arr = new Array(this.length)
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value
    walker = walker.prev
  }
  return arr
}

Yallist.prototype.slice = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.sliceReverse = function (from, to) {
  to = to || this.length
  if (to < 0) {
    to += this.length
  }
  from = from || 0
  if (from < 0) {
    from += this.length
  }
  var ret = new Yallist()
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0
  }
  if (to > this.length) {
    to = this.length
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value)
  }
  return ret
}

Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
  if (start > this.length) {
    start = this.length - 1
  }
  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next
  }

  var ret = []
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value)
    walker = this.removeNode(walker)
  }
  if (walker === null) {
    walker = this.tail
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev
  }

  for (var i = 0; i < nodes.length; i++) {
    walker = insert(this, walker, nodes[i])
  }
  return ret;
}

Yallist.prototype.reverse = function () {
  var head = this.head
  var tail = this.tail
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev
    walker.prev = walker.next
    walker.next = p
  }
  this.head = tail
  this.tail = head
  return this
}

function insert (self, node, value) {
  var inserted = node === self.head ?
    new Node(value, null, node, self) :
    new Node(value, node, node.next, self)

  if (inserted.next === null) {
    self.tail = inserted
  }
  if (inserted.prev === null) {
    self.head = inserted
  }

  self.length++

  return inserted
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self)
  if (!self.head) {
    self.head = self.tail
  }
  self.length++
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self)
  if (!self.tail) {
    self.tail = self.head
  }
  self.length++
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list
  this.value = value

  if (prev) {
    prev.next = this
    this.prev = prev
  } else {
    this.prev = null
  }

  if (next) {
    next.prev = this
    this.next = next
  } else {
    this.next = null
  }
}

try {
  // add if support for Symbol.iterator is present
  __webpack_require__(38268)(Yallist)
} catch (er) {}


/***/ }),

/***/ 86574:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(47104);

/***/ }),

/***/ 47104:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __createBinding=this&&this.__createBinding||(Object.create?function(o,m,k,k2){if(k2===undefined)k2=k;Object.defineProperty(o,k2,{enumerable:true,get:function(){return m[k];}});}:function(o,m,k,k2){if(k2===undefined)k2=k;o[k2]=m[k];});var __exportStar=this&&this.__exportStar||function(m,exports){for(var p in m)if(p!=="default"&&!Object.prototype.hasOwnProperty.call(exports,p))__createBinding(exports,m,p);};Object.defineProperty(exports, "__esModule", ({value:true}));__exportStar(__webpack_require__(93772),exports);

/***/ }),

/***/ 97967:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.StringScanner=void 0;var StringScanner=/** @class */function(){function StringScanner(source){this.source=source;this.pos=0;}StringScanner.prototype.isEOF=function(){return this.pos>=this.source.length;};StringScanner.prototype.curr=function(){return this.source[this.pos];};StringScanner.prototype.scan=function(regexp){var match=regexp.exec(this.source.substr(this.pos));if(!match){return null;}var value=match[0];this.pos+=value.length;return value;};StringScanner.prototype.forward=function(steps){this.pos+=steps;};return StringScanner;}();exports.StringScanner=StringScanner;

/***/ }),

/***/ 93772:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.getSuggestionContext=exports.SuggestContextKind=void 0;var tokenizer_1=__webpack_require__(1877);var SuggestContextKind;(function(SuggestContextKind){// HTML
SuggestContextKind["HTML_TAG_NAME"]="HTML_TAG_NAME";SuggestContextKind["HTML_CLOSE_TAG_NAME"]="HTML_CLOSE_TAG_NAME";SuggestContextKind["HTML_ATTRIBUTE_NAME"]="HTML_ATTRIBUTE_NAME";SuggestContextKind["HTML_STRING_ATTRIBUTE_VALUE"]="HTML_STRING_ATTRIBUTE_VALUE";SuggestContextKind["HTML_CSS_REFERENCE"]="HTML_CSS_REFERENCE";// CSS
SuggestContextKind["CSS_INCLUDE"]="CSS_INCLUDE";SuggestContextKind["CSS_FUNCTION"]="CSS_FUNCTION";SuggestContextKind["CSS_SELECTOR_NAME"]="CSS_SELECTOR_NAME";SuggestContextKind["CSS_DECLARATION_NAME"]="CSS_DECLARATION_NAME";SuggestContextKind["CSS_DECLARATION_VALUE"]="CSS_DECLARATION_VALUE";SuggestContextKind["CSS_CLASS_REFERENCE"]="CSS_CLASS_REFERENCE";SuggestContextKind["CSS_DECLARATION_AT_RULE"]="CSS_DECLARATION_AT_RULE";SuggestContextKind["CSS_AT_RULE_PARAMS"]="CSS_AT_RULE_PARAMS";SuggestContextKind["CSS_AT_RULE_NAME"]="CSS_AT_RULE_NAME";})(SuggestContextKind=exports.SuggestContextKind||(exports.SuggestContextKind={}));var getSuggestionContext=function(source){var context=null;var scanner=(0,tokenizer_1.tokenize)(source);// scan until there's something useful
while(scanner.current){if(scanner.current.value==="<"){scanner.next();// eat <
context=suggestElement(scanner);}else{scanner.next();}}return context;};exports.getSuggestionContext=getSuggestionContext;var suggestElement=function(scanner){var _a,_b,_c,_d;var _e=suggestTagName(scanner),tagSuggestion=_e[0],tagPath=_e[1];if(tagSuggestion){return tagSuggestion;}var attrSuggestion=suggestAttribute(tagPath,scanner);if(attrSuggestion){return attrSuggestion;}if(((_a=scanner.current)===null||_a===void 0?void 0:_a.value)===">"&&!/^(import|img)$/.test(tagPath[0])){scanner.next();// eat
if(!scanner.current){return{kind:SuggestContextKind.HTML_CLOSE_TAG_NAME,openTagPath:tagPath};}if(tagPath.length===1&&tagPath[0]==="style"){var cssSuggestion=suggestCSS(scanner);if(cssSuggestion){return cssSuggestion;}}var closed_1=false;while(scanner.current){if(String(scanner.current.value)==="<"){scanner.next();// eat <
if(String((_b=scanner.current)===null||_b===void 0?void 0:_b.value)==="/"){scanner.next();// eat /
if(((_c=scanner.current)===null||_c===void 0?void 0:_c.kind)===tokenizer_1.TokenKind.Word){scanner.next();// eat tag
if(((_d=scanner.current)===null||_d===void 0?void 0:_d.value)===">"){scanner.next();// >
closed_1=true;break;}}}else if(tagPath[0]!=="style"){var child=suggestElement(scanner);if(child){return child;}}}else{scanner.next();}}if(!closed_1&&tagPath[0]!=="style"){return{kind:SuggestContextKind.HTML_CLOSE_TAG_NAME,openTagPath:tagPath};}}return null;};var suggestTagName=function(scanner){// Source possibility: `<div></div><`
if(!scanner.current){return[{kind:SuggestContextKind.HTML_TAG_NAME,path:[]},null];}var path=[];var cpart="";// capture tag name
while(scanner.current){// stop at whitespace, or /?>
if(/[>/\s]/.test(scanner.current.value)){if(cpart.length){path.push(cpart);}break;}else if(scanner.current.value==="."){path.push(cpart);cpart="";}else{cpart+=scanner.current.value;}scanner.next();if(!scanner.current){path.push(cpart);}}// Source possibility: `<importedRef.`, `<importedRef.my-comp`
if(!scanner.current){return[{kind:SuggestContextKind.HTML_TAG_NAME,path:path},null];}return[null,path];};var suggestAttribute=function(tagPath,scanner){// scan for attributes
while(scanner.current){scanner.skipSuperfluous();// possibility: `<a b `, `<a `
if(!scanner.current){return{kind:SuggestContextKind.HTML_ATTRIBUTE_NAME,prefix:"",tagPath:tagPath};}// stop at /?>
if(/[>/]/.test(scanner.current.value)){break;}var attrName=getAttributeName(scanner);if(!scanner.current){return{kind:SuggestContextKind.HTML_ATTRIBUTE_NAME,prefix:attrName,tagPath:tagPath};}if(scanner.current.value==="="){scanner.next();var context_1=suggestAttributeValue(tagPath,attrName,scanner);if(context_1){return context_1;}}}return null;};var suggestAttributeValue=function(tagPath,attributeName,scanner){var _a,_b,_c,_d,_e;if(scanner.current.value==="\""||scanner.current.value==="'"){var boundary=scanner.current.value;scanner.next();var prefix="";while(1){if(!scanner.current){return{kind:SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE,tagPath:tagPath,attributeName:attributeName,attributeValuePrefix:prefix};}else if(scanner.current.value===boundary){break;}else if(String((_a=scanner.current)===null||_a===void 0?void 0:_a.value)==="$"||String((_b=scanner.current)===null||_b===void 0?void 0:_b.value)===">"&&((_c=scanner.peek())===null||_c===void 0?void 0:_c.value)===">"&&((_d=scanner.peek(1))===null||_d===void 0?void 0:_d.value)===">"){scanner.next();// eat > or $
if(String((_e=scanner.current)===null||_e===void 0?void 0:_e.value)===">"){scanner.next();// eat >
scanner.next();// eat >
}if(!scanner.current){return{kind:SuggestContextKind.CSS_CLASS_REFERENCE,prefix:""};}var prefix_1=scanner.current.value;scanner.next();if(!scanner.current){return{kind:SuggestContextKind.CSS_CLASS_REFERENCE,prefix:prefix_1};}}prefix+=scanner.current.value;scanner.next();}scanner.next();// eat "
}else if(scanner.current.value==="{"){// TODO - move to slot
while(scanner.current&&String(scanner.current.value)!=="}"){if(String(scanner.current.value)==="<"){scanner.next();var sugg=suggestElement(scanner);if(sugg){return sugg;}}scanner.next();}}return null;};var suggestCSS=function(scanner){while(scanner.current){scanner.skipSuperfluous();// close tag </
if(startOfCloseTag(scanner)){break;}// Assume selector
var suggestion=suggestRule(scanner);if(suggestion){return suggestion;}scanner.next();}return null;};var suggestRule=function(scanner,inStyleRule){var _a;if(inStyleRule===void 0){inStyleRule=false;}if(((_a=scanner.current)===null||_a===void 0?void 0:_a.value)==="@"){scanner.skipSuperfluous();var declSuggestion=suggestCSSAtRule(scanner,SuggestContextKind.CSS_AT_RULE_NAME);if(declSuggestion){return declSuggestion;}}else{return suggestCSSDeclaration(scanner);// if (inStyleRule) {
//   return suggestCSSDeclaration(scanner);
// } else {
//   scanner.skipSuperfluous();
//   return suggestStyleRule(scanner);
// }
}};var suggestStyleRule=function(scanner){var _a;var selectorText="";while(scanner.current){if(scanner.current.value==="{"){break;}selectorText+=scanner.current.value;scanner.next();}if(!scanner.current){return null;}scanner.next();// eat {
while(scanner.current){var declSuggestion=suggestCSSDeclaration(scanner);if(declSuggestion){return declSuggestion;}if(((_a=scanner.current)===null||_a===void 0?void 0:_a.value)==="}"){scanner.next();// eat }
break;}}};var suggestCSSDeclaration=function(scanner){var _a,_b;// only suggest declaration if on new line -- UX is wierd otherwise
var ws=(_a=scanner.current)===null||_a===void 0?void 0:_a.value;scanner.skipSuperfluous();if(!scanner.current){if(ws&&/[\n\r]/.test(ws)){return{kind:SuggestContextKind.CSS_DECLARATION_NAME,prefix:""};}}if(!scanner.current||((_b=scanner.current)===null||_b===void 0?void 0:_b.value)==="}"){return null;}if(scanner.current.value==="&"){scanner.next();// eat &
return suggestStyleRule(scanner);}else if(scanner.current.value==="@"){return suggestCSSAtRule(scanner,SuggestContextKind.CSS_DECLARATION_AT_RULE);}else{var pos=scanner.pos;var current=scanner.current;var isDeclaration=true;while(scanner.current){if(scanner.current.value==="{"){isDeclaration=false;break;}else if(scanner.current.value===";"){break;}scanner.next();}scanner.pos=pos;scanner.current=current;if(isDeclaration){return suggestCSSProperty(scanner);}else{return suggestStyleRule(scanner);}}};var suggestCSSProperty=function(scanner){var name="";while(scanner.current.value!==":"){name+=scanner.current.value;scanner.next();scanner.skipSuperfluous();if(!scanner.current){return{kind:SuggestContextKind.CSS_DECLARATION_NAME,prefix:name};}}if(scanner.current.value===":"){scanner.next();// eat :
var valueSuggestion=suggestCSSDeclarationValue(name,scanner);if(valueSuggestion){return valueSuggestion;}}return null;};var suggestCSSAtRule=function(scanner,atRuleKind){var _a,_b,_c;scanner.next();// eat @
if(!scanner.current){return{kind:atRuleKind,prefix:""};}var name=scanner.current.value;scanner.next();while(scanner.current){if(scanner.current.kind===tokenizer_1.TokenKind.Whitespace||scanner.current.value==="{"){break;}name+=scanner.current.value;scanner.next();}if(!scanner.current){return{kind:atRuleKind,prefix:name};}var params="";while(scanner.current&&((_a=scanner.current)===null||_a===void 0?void 0:_a.value)!==";"&&((_b=scanner.current)===null||_b===void 0?void 0:_b.value)!=="{"){params+=scanner.current.value;scanner.next();if(!scanner.current){return{kind:SuggestContextKind.CSS_AT_RULE_PARAMS,atRuleName:name,params:params.trim()};}}if(((_c=scanner.current)===null||_c===void 0?void 0:_c.value)==="{"){if(name==="media"||name=="keyframes"||name==="export"){return suggestContainerAtRule(scanner);}else{return suggestStyleAtRule(scanner);}}else{scanner.next();// eat ;
}return null;};var suggestStyleAtRule=function(scanner){var _a,_b;if(((_a=scanner.current)===null||_a===void 0?void 0:_a.value)==="{"){scanner.next();while(scanner.current){if(String((_b=scanner.current)===null||_b===void 0?void 0:_b.value)==="}"){break;}var suggestion=suggestCSSDeclaration(scanner);if(suggestion){return suggestion;}}}return null;};var suggestContainerAtRule=function(scanner,inStyleRule){var _a,_b;if(inStyleRule===void 0){inStyleRule=false;}if(((_a=scanner.current)===null||_a===void 0?void 0:_a.value)==="{"){scanner.next();// eat {
while(scanner.current){if(String((_b=scanner.current)===null||_b===void 0?void 0:_b.value)==="}"){scanner.next();break;}var suggestion=suggestRule(scanner,inStyleRule);if(suggestion){return suggestion;}}}else{scanner.next();// eat ;
}return null;};var suggestCSSDeclarationValue=function(declarationName,scanner){var _a,_b,_c,_d;var currentChunk="";while(1){// scanner.skipSuperfluous();
if(!scanner.current){return{kind:SuggestContextKind.CSS_DECLARATION_VALUE,declarationName:declarationName,declarationValuePrefix:currentChunk};}if(scanner.current.value===";"){scanner.next();// eat ;
break;}currentChunk+=scanner.current.value;if(((_a=scanner.peek())===null||_a===void 0?void 0:_a.value)==="("){// take other declaration parts into consideration
var name_1=currentChunk.split(" ").pop();currentChunk+=name_1;scanner.next();// eat name
currentChunk+=((_b=scanner.current)===null||_b===void 0?void 0:_b.value)||"";scanner.next();// eat (
if(!scanner.current){return{kind:SuggestContextKind.CSS_FUNCTION,name:name_1,paramsPrefix:""};}var buffer=getBuffer(scanner,function(scanner){return scanner.current.value!==")";});currentChunk+=buffer;currentChunk+=((_c=scanner.current)===null||_c===void 0?void 0:_c.value)||"";scanner.next();// eat )
currentChunk+=((_d=scanner.current)===null||_d===void 0?void 0:_d.value)||"";if(!scanner.current){return{kind:SuggestContextKind.CSS_FUNCTION,name:name_1,paramsPrefix:buffer};}}else{scanner.next();}}return null;};var startOfCloseTag=function(scanner){var _a,_b;return((_a=scanner.current)===null||_a===void 0?void 0:_a.value)==="<"&&((_b=scanner.peek())===null||_b===void 0?void 0:_b.value)==="/";};var getAttributeName=function(scanner){return getBuffer(scanner,function(scanner){return scanner.current.value!=="="&&scanner.current.value!==">"&&scanner.current.kind!==tokenizer_1.TokenKind.Whitespace;});};var skipUntil=function(scanner,test){getBuffer(scanner,test);};var getBuffer=function(scanner,test){var buffer="";while(scanner.current&&test(scanner)){buffer+=scanner.current.value;scanner.next();}return buffer;};

/***/ }),

/***/ 1877:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.tokenize=exports.TokenScanner=exports.TokenKind=void 0;var string_scanner_1=__webpack_require__(97967);var TokenKind;(function(TokenKind){TokenKind[TokenKind["Word"]=0]="Word";TokenKind[TokenKind["Whitespace"]=1]="Whitespace";TokenKind[TokenKind["Number"]=2]="Number";TokenKind[TokenKind["Char"]=3]="Char";})(TokenKind=exports.TokenKind||(exports.TokenKind={}));var RULES=[{regexp:/^\w+/,kind:TokenKind.Word},{regexp:/^\d+/,kind:TokenKind.Number},{regexp:/^[\s\r\n\t]+/,kind:TokenKind.Whitespace},{regexp:/^./,kind:TokenKind.Char}];var TokenScanner=/** @class */function(){function TokenScanner(source){this.source=source;this.pos=0;this.current=this.next();}TokenScanner.prototype.skipWhitespace=function(){var _a;if(((_a=this.current)===null||_a===void 0?void 0:_a.kind)===TokenKind.Whitespace){this.next();}};TokenScanner.prototype.skipSuperfluous=function(){var _a,_b,_c,_d;this.skipWhitespace();// comment
if(((_a=this.current)===null||_a===void 0?void 0:_a.value)==="/"){if(((_b=this.peek())===null||_b===void 0?void 0:_b.value)==="/"){this.next();while(this.current){if(/[\n\r]/.test(this.current.value)){this.skipSuperfluous();break;}this.next();}}if(((_c=this.peek())===null||_c===void 0?void 0:_c.value)==="*"){this.next();while(this.current){if(String(this.current.value)==="*"&&((_d=this.peek())===null||_d===void 0?void 0:_d.value)==="/"){this.next();// eat *
this.next();// eat /
this.skipSuperfluous();break;}this.next();}}}};TokenScanner.prototype.next=function(){if(this.pos>=this.source.length){this.current=null;return null;}return this.current=this.source[this.pos++];};TokenScanner.prototype.peek=function(count){if(count===void 0){count=0;}return this.source[this.pos+count];};return TokenScanner;}();exports.TokenScanner=TokenScanner;var tokenize=function(source){var scanner=new string_scanner_1.StringScanner(source);var tokens=[];while(!scanner.isEOF()){for(var _i=0,RULES_1=RULES;_i<RULES_1.length;_i++){var _a=RULES_1[_i],regexp=_a.regexp,kind=_a.kind;var pos=scanner.pos;var value=scanner.scan(regexp);if(value){tokens.push({value:value,kind:kind,pos:pos});break;}}}return new TokenScanner(tokens);};exports.tokenize=tokenize;

/***/ }),

/***/ 28180:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(81741);

/***/ }),

/***/ 51001:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.disposableGroup=void 0;var disposableGroup=function(disposables){return{dispose:function(){for(var _i=0,disposables_1=disposables;_i<disposables_1.length;_i++){var disposable=disposables_1[_i];disposable.dispose();}}};};exports.disposableGroup=disposableGroup;

/***/ }),

/***/ 4938:
/***/ (function(__unused_webpack_module, exports) {

"use strict";
var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){function adopt(value){return value instanceof P?value:new P(function(resolve){resolve(value);});}return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator["throw"](value));}catch(e){reject(e);}}function step(result){result.done?resolve(result.value):adopt(result.value).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());});};var __generator=this&&this.__generator||function(thisArg,body){var _={label:0,sent:function(){if(t[0]&1)throw t[1];return t[1];},trys:[],ops:[]},f,y,t,g;return g={next:verb(0),"throw":verb(1),"return":verb(2)},typeof Symbol==="function"&&(g[Symbol.iterator]=function(){return this;}),g;function verb(n){return function(v){return step([n,v]);};}function step(op){if(f)throw new TypeError("Generator is already executing.");while(_)try{if(f=1,y&&(t=op[0]&2?y["return"]:op[0]?y["throw"]||((t=y["return"])&&t.call(y),0):y.next)&&!(t=t.call(y,op[1])).done)return t;if(y=0,t)op=[op[0]&2,t.value];switch(op[0]){case 0:case 1:t=op;break;case 4:_.label++;return{value:op[1],done:false};case 5:_.label++;y=op[1];op=[0];continue;case 7:op=_.ops.pop();_.trys.pop();continue;default:if(!(t=_.trys,t=t.length>0&&t[t.length-1])&&(op[0]===6||op[0]===2)){_=0;continue;}if(op[0]===3&&(!t||op[1]>t[0]&&op[1]<t[3])){_.label=op[1];break;}if(op[0]===6&&_.label<t[1]){_.label=t[1];t=op;break;}if(t&&_.label<t[2]){_.label=t[2];_.ops.push(op);break;}if(t[2])_.ops.pop();_.trys.pop();continue;}op=body.call(thisArg,_);}catch(e){op=[6,e];y=0;}finally{f=t=0;}if(op[0]&5)throw op[1];return{value:op[0]?op[1]:void 0,done:true};}};Object.defineProperty(exports, "__esModule", ({value:true}));exports.eventProcesses=exports.eventHandlers=exports.eventHandler=exports.Observable=void 0;var ObservablePipe=/** @class */function(){function ObservablePipe(_dest){this._dest=_dest;}ObservablePipe.prototype.handleEvent=function(event){this._dest.dispatch(event);};return ObservablePipe;}();var Observable=/** @class */function(){function Observable(){this._observers=[];}Observable.prototype.dispatch=function(event){for(var i=this._observers.length;i--;){this._observers[i].handleEvent(event);}};Observable.prototype.pipe=function(observable){return this.observe(new ObservablePipe(observable));};Observable.prototype.source=function(observable){return observable.pipe(this);};Observable.prototype.observe=function(observer){if(!observer.handleEvent){throw new Error("handleEvent not defined");}this._observers.push(observer);return{dispose:function(){this.unobserve(observer);}};};Observable.prototype.unobserve=function(observer){var index=this._observers.indexOf(observer);if(index!==-1){this._observers.splice(index,1);}};return Observable;}();exports.Observable=Observable;var eventHandler=function(type,handler){return function(event){if(event.type===type){handler(event);}};};exports.eventHandler=eventHandler;var eventHandlers=function(handlers){return function(event){if(handlers[event.type]){handlers[event.type](event);}};};exports.eventHandlers=eventHandlers;var eventProcesses=function(handlers){var processes={};return function(event){return __awaiter(void 0,void 0,void 0,function(){var handleEvent;return __generator(this,function(_a){switch(_a.label){case 0:handleEvent=handlers[event.type];if(!handleEvent)return[3/*break*/,3];if(!processes[event.type])return[3/*break*/,2];return[4/*yield*/,processes[event.type]];case 1:_a.sent().dispose();_a.label=2;case 2:processes[event.type]=handleEvent(event);_a.label=3;case 3:return[2/*return*/];}});});};};exports.eventProcesses=eventProcesses;

/***/ }),

/***/ 51438:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __assign=this&&this.__assign||function(){__assign=Object.assign||function(t){for(var s,i=1,n=arguments.length;i<n;i++){s=arguments[i];for(var p in s)if(Object.prototype.hasOwnProperty.call(s,p))t[p]=s[p];}return t;};return __assign.apply(this,arguments);};Object.defineProperty(exports, "__esModule", ({value:true}));exports.ImmutableStore=void 0;var events_1=__webpack_require__(82361);var immer_1=__webpack_require__(15729);var ImmutableStore=/** @class */function(){function ImmutableStore(initialState,bind){this._state=__assign({},initialState);this._em=new events_1.EventEmitter();if(bind){this.bind(bind);}}ImmutableStore.prototype.getState=function(){return this._state;};ImmutableStore.prototype.bind=function(listener){listener(this.getState());return this.onChange(listener);};ImmutableStore.prototype.onChange=function(listener){var _this=this;this._em.on("change",listener);return function(){return _this._em.off("change",listener);};};ImmutableStore.prototype.update=function(updater){var newState=(0,immer_1.produce)(this._state,updater);if(this._state!==newState){var oldState=this._state;this._state=newState;this._em.emit("change",newState,oldState);}};return ImmutableStore;}();exports.ImmutableStore=ImmutableStore;

/***/ }),

/***/ 81741:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __createBinding=this&&this.__createBinding||(Object.create?function(o,m,k,k2){if(k2===undefined)k2=k;Object.defineProperty(o,k2,{enumerable:true,get:function(){return m[k];}});}:function(o,m,k,k2){if(k2===undefined)k2=k;o[k2]=m[k];});var __exportStar=this&&this.__exportStar||function(m,exports){for(var p in m)if(p!=="default"&&!Object.prototype.hasOwnProperty.call(exports,p))__createBinding(exports,m,p);};Object.defineProperty(exports, "__esModule", ({value:true}));__exportStar(__webpack_require__(51438),exports);__exportStar(__webpack_require__(42886),exports);__exportStar(__webpack_require__(51001),exports);__exportStar(__webpack_require__(4938),exports);__exportStar(__webpack_require__(4938),exports);__exportStar(__webpack_require__(13636),exports);__exportStar(__webpack_require__(90106),exports);

/***/ }),

/***/ 90106:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.ServerKernel=void 0;var events_1=__webpack_require__(4938);var ServerKernel=/** @class */function(){function ServerKernel(){this.events=new events_1.Observable();}return ServerKernel;}();exports.ServerKernel=ServerKernel;

/***/ }),

/***/ 42886:
/***/ (function(__unused_webpack_module, exports) {

"use strict";
var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){function adopt(value){return value instanceof P?value:new P(function(resolve){resolve(value);});}return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator["throw"](value));}catch(e){reject(e);}}function step(result){result.done?resolve(result.value):adopt(result.value).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());});};var __generator=this&&this.__generator||function(thisArg,body){var _={label:0,sent:function(){if(t[0]&1)throw t[1];return t[1];},trys:[],ops:[]},f,y,t,g;return g={next:verb(0),"throw":verb(1),"return":verb(2)},typeof Symbol==="function"&&(g[Symbol.iterator]=function(){return this;}),g;function verb(n){return function(v){return step([n,v]);};}function step(op){if(f)throw new TypeError("Generator is already executing.");while(_)try{if(f=1,y&&(t=op[0]&2?y["return"]:op[0]?y["throw"]||((t=y["return"])&&t.call(y),0):y.next)&&!(t=t.call(y,op[1])).done)return t;if(y=0,t)op=[op[0]&2,t.value];switch(op[0]){case 0:case 1:t=op;break;case 4:_.label++;return{value:op[1],done:false};case 5:_.label++;y=op[1];op=[0];continue;case 7:op=_.ops.pop();_.trys.pop();continue;default:if(!(t=_.trys,t=t.length>0&&t[t.length-1])&&(op[0]===6||op[0]===2)){_=0;continue;}if(op[0]===3&&(!t||op[1]>t[0]&&op[1]<t[3])){_.label=op[1];break;}if(op[0]===6&&_.label<t[1]){_.label=t[1];t=op;break;}if(t&&_.label<t[2]){_.label=t[2];_.ops.push(op);break;}if(t[2])_.ops.pop();_.trys.pop();continue;}op=body.call(thisArg,_);}catch(e){op=[6,e];y=0;}finally{f=t=0;}if(op[0]&5)throw op[1];return{value:op[0]?op[1]:void 0,done:true};}};Object.defineProperty(exports, "__esModule", ({value:true}));exports.remoteChannel=exports.sockAdapter=exports.workerAdapter=void 0;var spy=function(obj,prop,handler){var oldProp=obj[prop];var spyFn;// spy exists? Use that
if(oldProp===null||oldProp===void 0?void 0:oldProp.callbacks){spyFn=oldProp;}else{var callbacks_1=[];spyFn=function(){var args=[];for(var _i=0;_i<arguments.length;_i++){args[_i]=arguments[_i];}for(var _a=0,callbacks_2=callbacks_1;_a<callbacks_2.length;_a++){var cb=callbacks_2[_a];cb&&cb.apply(void 0,args);}};spyFn.callbacks=callbacks_1;}spyFn.callbacks.push(handler);obj[prop]=spyFn;return function(){if(spyFn.callbacks.length===1){obj[prop]=spyFn[spyFn.callbacks[0]];}else{var i=spyFn.callbacks.indexOf(handler);if(i!==-1){spyFn.callbacks.splice(i,1);}}};};var workerAdapter=function(worker){return{onMessage:function(listener){return spy(worker,"onmessage",function(event){return listener(event.data);});},send:function(message){worker.postMessage(message);}};};exports.workerAdapter=workerAdapter;// sockjs adapter
var sockAdapter=function(worker){return{onMessage:function(listener){// is on the server
var onMessage=function(message){listener(JSON.parse(message));};// is on the client
if(!worker.on){return spy(worker,"onmessage",function(event){onMessage(event.data);});}worker.on("data",onMessage);return function(){return worker.off("data",onMessage);};},send:function(message){(worker.send||worker.write).call(worker,JSON.stringify(message));}};};exports.sockAdapter=sockAdapter;var remoteChannel=function(name){var requestName="".concat(name,":request");var responseName="".concat(name,":response");return function(chan){var call=function(payload){return new Promise(function(resolve){var onMessage=function(message){if(message.name===responseName){disposeListener();resolve(message.payload);}};var disposeListener=chan.onMessage(onMessage);chan.send({name:requestName,payload:payload});});};var listen=function(call){var dispose=chan.onMessage(function(message){return __awaiter(void 0,void 0,void 0,function(){var _a,_b;var _c;return __generator(this,function(_d){switch(_d.label){case 0:if(!(message.name===requestName))return[3/*break*/,2];_b=(_a=chan).send;_c={name:responseName};return[4/*yield*/,call(message.payload)];case 1:_b.apply(_a,[(_c.payload=_d.sent(),_c)]);_d.label=2;case 2:return[2/*return*/];}});});});return{dispose:dispose};};return{call:call,listen:listen};};};exports.remoteChannel=remoteChannel;

/***/ }),

/***/ 13636:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.ServiceManager=exports.serviceCreator=exports.ServiceInitialized=void 0;var ServiceInitialized=/** @class */function(){function ServiceInitialized(){this.type=ServiceInitialized.TYPE;}ServiceInitialized.TYPE="ServiceEvent/INITIALIZED";return ServiceInitialized;}();exports.ServiceInitialized=ServiceInitialized;var serviceCreator=function(load,createState){return function(kernel){var state;if(createState){state=createState();if(state.handleEvent){kernel.events.observe(state);}}load(kernel,state);};};exports.serviceCreator=serviceCreator;var ServiceManager=/** @class */function(){function ServiceManager(_kernal){this._kernal=_kernal;}ServiceManager.prototype.add=function(){var _this=this;var serviceCreators=[];for(var _i=0;_i<arguments.length;_i++){serviceCreators[_i]=arguments[_i];}serviceCreators.forEach(function(createService){createService(_this._kernal);});return this;};ServiceManager.prototype.initialize=function(){this._kernal.events.dispatch(new ServiceInitialized());};return ServiceManager;}();exports.ServiceManager=ServiceManager;

/***/ }),

/***/ 85402:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(14202);

/***/ }),

/***/ 14171:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));

/***/ }),

/***/ 76657:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));

/***/ }),

/***/ 32873:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.engineDelegateChanged=exports.previewContent=exports.loadedDataEmitted=exports.loadedDataRequested=exports.astRequested=exports.astEmitted=exports.actionCreator=exports.BasicPaperclipActionType=void 0;var BasicPaperclipActionType;(function(BasicPaperclipActionType){BasicPaperclipActionType["AST_REQUESTED"]="AST_REQUESTED";BasicPaperclipActionType["LOADED_DATA_REQUESTED"]="LOADED_DATA_REQUESTED";BasicPaperclipActionType["LOADED_DATA_EMITTED"]="LOADED_DATA_EMITTED";BasicPaperclipActionType["AST_EMITTED"]="AST_EMITTED";BasicPaperclipActionType["ENGINE_DELEGATE_CHANGED"]="ENGINE_DELEGATE_CHANGED";BasicPaperclipActionType["PREVIEW_CONTENT"]="PREVIEW_CONTENT";})(BasicPaperclipActionType=exports.BasicPaperclipActionType||(exports.BasicPaperclipActionType={}));var actionCreator=function(type){return function(payload){return{type:type,payload:payload};};};exports.actionCreator=actionCreator;exports.astEmitted=(0,exports.actionCreator)(BasicPaperclipActionType.AST_EMITTED);exports.astRequested=(0,exports.actionCreator)(BasicPaperclipActionType.AST_REQUESTED);exports.loadedDataRequested=(0,exports.actionCreator)(BasicPaperclipActionType.LOADED_DATA_REQUESTED);exports.loadedDataEmitted=(0,exports.actionCreator)(BasicPaperclipActionType.LOADED_DATA_EMITTED);exports.previewContent=(0,exports.actionCreator)(BasicPaperclipActionType.PREVIEW_CONTENT);exports.engineDelegateChanged=(0,exports.actionCreator)(BasicPaperclipActionType.ENGINE_DELEGATE_CHANGED);

/***/ }),

/***/ 66522:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __assign=this&&this.__assign||function(){__assign=Object.assign||function(t){for(var s,i=1,n=arguments.length;i<n;i++){s=arguments[i];for(var p in s)if(Object.prototype.hasOwnProperty.call(s,p))t[p]=s[p];}return t;};return __assign.apply(this,arguments);};Object.defineProperty(exports, "__esModule", ({value:true}));exports.getOutputFile=exports.buildCompilerOptions=exports.getPaperclipConfigIncludes=void 0;var path=__webpack_require__(71017);var utils_1=__webpack_require__(95323);var getPaperclipConfigIncludes=function(config,cwd){if(config.srcDir){return[(0,utils_1.paperclipSourceGlobPattern)(path.join(cwd,config.srcDir))];}// if (config.include) {
//   return config.include.map(inc => path.join(cwd, inc));
// }
return[path.join((0,utils_1.paperclipSourceGlobPattern)(cwd))];};exports.getPaperclipConfigIncludes=getPaperclipConfigIncludes;/**
 */var buildCompilerOptions=function(config){return buildCompilerOptionsFromTemplates(config,config.compilerOptions);};exports.buildCompilerOptions=buildCompilerOptions;/**
 */var buildCompilerOptionsFromTemplates=function(config,templates){if(!templates){return[{outDir:config.srcDir}];}if(!Array.isArray(templates)){templates=Array.isArray(templates)?templates:[templates];}// const base = templates.find(template => !Array.isArray(template) && template.base) as CompilerOptionsTemplate;
return templates.reduce(function(allCompilerOptions,template){var compilerOptions=template;allCompilerOptions.push(__assign({outDir:config.srcDir},compilerOptions));return allCompilerOptions;},[]);};/**
 */var getOutputFile=function(filePath,config,compilerOptions,cwd){return(compilerOptions===null||compilerOptions===void 0?void 0:compilerOptions.outDir)?filePath.replace(path.join(cwd,config.srcDir),path.join(cwd,compilerOptions.outDir)):filePath;};exports.getOutputFile=getOutputFile;

/***/ }),

/***/ 54203:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.LOGIC_TAG_NAME=exports.INJECT_STYLES_TAG_NAME=exports.AS_ATTR_NAME=exports.FRAGMENT_TAG_NAME=exports.PREVIEW_ATTR_NAME=exports.COMPONENT_ATTR_NAME=exports.EXPORT_TAG_NAME=exports.DEFAULT_PART_ID=exports.PC_CONFIG_FILE_NAME=void 0;exports.PC_CONFIG_FILE_NAME="paperclip.config.json";exports.DEFAULT_PART_ID="default";exports.EXPORT_TAG_NAME="export";exports.COMPONENT_ATTR_NAME="component";exports.PREVIEW_ATTR_NAME="preview";exports.FRAGMENT_TAG_NAME="fragment";exports.AS_ATTR_NAME="as";exports.INJECT_STYLES_TAG_NAME="inject-styles";// deprecated
exports.LOGIC_TAG_NAME="logic";

/***/ }),

/***/ 26642:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.DiagnosticKind=exports.LintWarningKind=void 0;var LintWarningKind;(function(LintWarningKind){})(LintWarningKind=exports.LintWarningKind||(exports.LintWarningKind={}));var DiagnosticKind;(function(DiagnosticKind){DiagnosticKind["EngineError"]="EngineError";DiagnosticKind["LintWarning"]="LintWarning";})(DiagnosticKind=exports.DiagnosticKind||(exports.DiagnosticKind={}));

/***/ }),

/***/ 74491:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.EngineErrorKind=exports.GraphErrorInfoKind=exports.ParseErrorKind=void 0;var ParseErrorKind;(function(ParseErrorKind){ParseErrorKind["EndOfFile"]="EndOfFile";ParseErrorKind["Unknown"]="Unknown";ParseErrorKind["Unexpected"]="Unexpected";ParseErrorKind["Unterminated"]="Unterminated";})(ParseErrorKind=exports.ParseErrorKind||(exports.ParseErrorKind={}));var GraphErrorInfoKind;(function(GraphErrorInfoKind){GraphErrorInfoKind["IncludeNotFound"]="IncludeNotFound";GraphErrorInfoKind["Syntax"]="Syntax";})(GraphErrorInfoKind=exports.GraphErrorInfoKind||(exports.GraphErrorInfoKind={}));var EngineErrorKind;(function(EngineErrorKind){EngineErrorKind["Graph"]="Graph";EngineErrorKind["Runtime"]="Runtime";})(EngineErrorKind=exports.EngineErrorKind||(exports.EngineErrorKind={}));

/***/ }),

/***/ 47313:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
// TODO  - move all non-specific event stuff to payload, or data prop so that
// event can remain ephemeral.
Object.defineProperty(exports, "__esModule", ({value:true}));exports.EngineDelegateEventKind=void 0;var EngineDelegateEventKind;(function(EngineDelegateEventKind){EngineDelegateEventKind["Loading"]="Loading";EngineDelegateEventKind["Deleted"]="Deleted";EngineDelegateEventKind["Loaded"]="Loaded";EngineDelegateEventKind["Updating"]="Updating";EngineDelegateEventKind["Evaluated"]="Evaluated";EngineDelegateEventKind["Error"]="Error";EngineDelegateEventKind["NodeParsed"]="NodeParsed";EngineDelegateEventKind["Diffed"]="Diffed";EngineDelegateEventKind["ChangedSheets"]="ChangedSheets";})(EngineDelegateEventKind=exports.EngineDelegateEventKind||(exports.EngineDelegateEventKind={}));

/***/ }),

/***/ 5940:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.DependencyContentKind=void 0;var DependencyContentKind;(function(DependencyContentKind){DependencyContentKind["Node"]="Node";DependencyContentKind["Stylsheet"]="Stylesheet";})(DependencyContentKind=exports.DependencyContentKind||(exports.DependencyContentKind={}));

/***/ }),

/***/ 94841:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.underchange=exports.reuser=exports.shallowEquals=exports.memoize=void 0;var LRU=__webpack_require__(77105);var DEFAULT_LRU_MAX=10000;// need this for default arguments
var getArgumentCount=function(fn){var str=fn.toString();var params=str.match(/\(.*?\)|\w+\s*=>/)[0];var args=params.replace(/[=>()]/g,"").split(/\s*,\s*/).filter(function(arg){return arg.substr(0,3)!=="...";});return args.length;};var memoize=function(fn,lruMax,argumentCount){if(lruMax===void 0){lruMax=DEFAULT_LRU_MAX;}if(argumentCount===void 0){argumentCount=getArgumentCount(fn);}if(argumentCount==Infinity||isNaN(argumentCount)){throw new Error("Argument count cannot be Infinity, 0, or NaN.");}if(!argumentCount){console.error("Argument count should not be 0. Defaulting to 1.");argumentCount=1;}return compilFastMemoFn(argumentCount,lruMax>0)(fn,new LRU({max:lruMax}));};exports.memoize=memoize;var shallowEquals=function(a,b){var toa=typeof a;var tob=typeof b;if(toa!==tob){return false;}if(toa!=="object"||!a||!b){return a===b;}if(Object.keys(a).length!==Object.keys(b).length){return false;}for(var key in a){if(a[key]!==b[key]){return false;}}return true;};exports.shallowEquals=shallowEquals;var reuser=function(lruMax,getKey,equals){if(lruMax===void 0){lruMax=DEFAULT_LRU_MAX;}if(equals===void 0){equals=exports.shallowEquals;}var cache=new LRU({max:lruMax});return function(value){var key=getKey(value);if(!cache.has(key)||!equals(cache.get(key),value)){cache.set(key,value);}return cache.get(key);};};exports.reuser=reuser;var _memoFns={};var compilFastMemoFn=function(argumentCount,acceptPrimitives){var hash=""+argumentCount+acceptPrimitives;if(_memoFns[hash]){return _memoFns[hash];}var args=Array.from({length:argumentCount}).map(function(v,i){return"arg".concat(i);});var buffer="\n  return function(fn, keyMemo) {\n    var memo = new WeakMap();\n    return function(".concat(args.join(", "),") {\n      var currMemo = memo, prevMemo, key;\n  ");for(var i=0,n=args.length-1;i<n;i++){var arg=args[i];buffer+="\n      prevMemo = currMemo;\n      key      = ".concat(arg,";\n      ").concat(acceptPrimitives?"if ((typeof key !== \"object\" || !key) && !(key = keyMemo.get(".concat(arg,"))) {\n        keyMemo.set(").concat(arg,", key = {});\n      }"):"","\n      if (!(currMemo = currMemo.get(key))) {\n        prevMemo.set(key, currMemo = new WeakMap());\n      }\n    ");}var lastArg=args[args.length-1];buffer+="\n      key = ".concat(lastArg,";\n      ").concat(acceptPrimitives?"\n      if ((typeof key !== \"object\" || !key) && !(key = keyMemo.get(".concat(lastArg,"))) {\n        keyMemo.set(").concat(lastArg,", key = {});\n      }"):"","\n\n      if (!currMemo.has(key)) {\n        try {\n          currMemo.set(key, fn(").concat(args.join(", "),"));\n        } catch(e) {\n          throw e;\n        }\n      }\n\n      return currMemo.get(key);\n    };\n  };\n  ");return _memoFns[hash]=new Function(buffer)();};/**
 * Calls target function once & proxies passed functions
 * @param fn
 */var underchange=function(fn){var currentArgs=[];var ret;var started;var start=function(){if(started){return ret;}started=true;return ret=fn.apply(void 0,currentArgs.map(function(a,i){return function(){var args=[];for(var _i=0;_i<arguments.length;_i++){args[_i]=arguments[_i];}return currentArgs[i].apply(currentArgs,args);};}));};return function(){var args=[];for(var _i=0;_i<arguments.length;_i++){args[_i]=arguments[_i];}currentArgs=args;return start();};};exports.underchange=underchange;

/***/ }),

/***/ 34411:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.ModuleKind=void 0;var ModuleKind;(function(ModuleKind){ModuleKind["CSS"]="CSS";ModuleKind["PC"]="PC";})(ModuleKind=exports.ModuleKind||(exports.ModuleKind={}));

/***/ }),

/***/ 68539:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));

/***/ }),

/***/ 52457:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.findPCConfigUrl=exports.resolvePCConfig=exports.resolveImportFile=exports.resolveImportUri=void 0;var path=__webpack_require__(71017);var url=__webpack_require__(57310);var utils_1=__webpack_require__(95323);var constants_1=__webpack_require__(54203);var resolveImportUri=function(fs){return function(fromPath,toPath){var filePath=(0,exports.resolveImportFile)(fs)(fromPath,toPath);return filePath;};};exports.resolveImportUri=resolveImportUri;var resolveImportFile=function(fs){return function(fromPath,toPath){try{if(/\w+:\/\//.test(toPath)){return toPath;}if(toPath.charAt(0)!=="."){var uri_1=resolveModule(fs)(fromPath,toPath);if(!uri_1){throw new Error("module ".concat(toPath," not found"));}return uri_1;}var uri=url.resolve(fromPath,toPath);// always want realpath here since file name is used as ID for PC files - need
// to make sure that we're not doubling up on the same files.
try{return url.pathToFileURL(fs.realpathSync(url.fileURLToPath(uri))).href;}catch(e){return uri;}}catch(e){return null;}};};exports.resolveImportFile=resolveImportFile;var readJSONSync=function(fs){return function(uri){return JSON.parse(fs.readFileSync(uri,"utf8"));};};var resolvePCConfig=function(fs){return function(fromPath){var configUrl=(0,exports.findPCConfigUrl)(fs)(fromPath);if(!configUrl)return null;var uri=new URL(configUrl);// need to parse each time in case config changed.
return[readJSONSync(fs)(uri),configUrl];};};exports.resolvePCConfig=resolvePCConfig;var resolveModule=function(fs){return function(fromPath,moduleRelativePath){// need to parse each time in case config changed.
var _a=(0,exports.resolvePCConfig)(fs)(fromPath)||[],config=_a[0],configUrl=_a[1];if(!config){return null;}var configPathDir=path.dirname((0,utils_1.stripFileProtocol)(configUrl));var moduleFileUrl=url.pathToFileURL(path.normalize(path.join(configPathDir,config.srcDir,moduleRelativePath)));// FIRST look for modules in the sourceDirectory
if(fs.existsSync(moduleFileUrl)){// Need to follow symlinks
return url.pathToFileURL(fs.realpathSync(moduleFileUrl)).href;}// No bueno? Move onto the module directories then
if(config.moduleDirs){var firstSlashIndex=moduleRelativePath.indexOf("/");var moduleName=moduleRelativePath.substr(0,firstSlashIndex);var srcPath=moduleRelativePath.substr(firstSlashIndex);for(var i=0,length_1=config.moduleDirs.length;i<length_1;i++){var moduleDir=config.moduleDirs[i];var moduleDirectory=path.join(resolveModuleDirectory(fs)(configPathDir,moduleDir),moduleName);var modulePath=path.join(moduleDirectory,srcPath);if(fs.existsSync(modulePath)){var actualPath=fs.realpathSync(modulePath);return url.pathToFileURL(actualPath).href;}}}return null;};};var resolveModuleDirectory=function(fs){return function(cwd,moduleDir){var c0=moduleDir.charAt(0);if(c0==="/"||c0==="."){return path.join(cwd,moduleDir);}var cdir=cwd;do{var maybeDir=path.join(cdir,moduleDir);if(fs.existsSync(maybeDir)){return maybeDir;}cdir=path.dirname(cdir);}while(isntRoot(cdir));};};var findPCConfigUrl=function(fs){return function(fromUri){var cdir=(0,utils_1.stripFileProtocol)(fromUri);// can't cache in case PC config was moved.
do{var configUrl=url.pathToFileURL(path.join(cdir,constants_1.PC_CONFIG_FILE_NAME));if(fs.existsSync(configUrl)){return configUrl.href;}cdir=path.dirname(cdir);}while(isntRoot(cdir));return null;};};exports.findPCConfigUrl=findPCConfigUrl;var isntRoot=function(cdir){return cdir!=="/"&&cdir!=="."&&!/^\w+:\\$/.test(cdir);};

/***/ }),

/***/ 95323:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.getScopedCSSFilePath=exports.isCSSFile=exports.isPaperclipResourceFile=exports.isPaperclipFile=exports.isGeneratedPaperclipFile=exports.paperclipResourceGlobPattern=exports.paperclipSourceGlobPattern=exports.stripFileProtocol=void 0;var url=__webpack_require__(57310);var stripFileProtocol=function(filePath){return filePath.includes("file://")?url.fileURLToPath(filePath):filePath;};exports.stripFileProtocol=stripFileProtocol;var paperclipSourceGlobPattern=function(dir){return dir==="."?"**/*.pc":dir+"/**/*.pc";};exports.paperclipSourceGlobPattern=paperclipSourceGlobPattern;// TODO: we want to watch for CSS files here, but need to be
// cognizant of generated CSS files which may clobber the PC engine. THe fix here
// I think is to load GLOB data, _as well as_ resources loaded into the PC file.
var paperclipResourceGlobPattern=function(dir){return dir==="."?"**/*.{pc}":dir+"/**/*.{pc}";};exports.paperclipResourceGlobPattern=paperclipResourceGlobPattern;var isGeneratedPaperclipFile=function(filePath){return /\.(pc(.\w+)+|scoped.css)$/.test(filePath);};exports.isGeneratedPaperclipFile=isGeneratedPaperclipFile;var isPaperclipFile=function(filePath){return /\.pc$/.test(filePath);};exports.isPaperclipFile=isPaperclipFile;var isPaperclipResourceFile=function(filePath){return((0,exports.isCSSFile)(filePath)||(0,exports.isPaperclipFile)(filePath))&&!(0,exports.isGeneratedPaperclipFile)(filePath);};exports.isPaperclipResourceFile=isPaperclipResourceFile;var isCSSFile=function(filePath){return /\.css$/.test(filePath);};exports.isCSSFile=isCSSFile;var getScopedCSSFilePath=function(filePath){return filePath.replace(/\.css$/,".scoped.css");};exports.getScopedCSSFilePath=getScopedCSSFilePath;

/***/ }),

/***/ 59889:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.getSelectorClassNames=exports.traverseStyleExpression=exports.isIncludePart=exports.isSelector=exports.isStyleSelector=exports.isStyleObject=exports.isMaybeStyleSheet=exports.isStyleDeclaration=exports.isRule=exports.traverseSheet=exports.getRuleClassNames=exports.getSheetClassNames=exports.StyleDeclarationKind=exports.SelectorKind=exports.RuleKind=void 0;var RuleKind;(function(RuleKind){RuleKind["Style"]="Style";RuleKind["Charset"]="Charset";RuleKind["Namespace"]="Namespace";RuleKind["Include"]="Include";RuleKind["Comment"]="Comment";RuleKind["FontFace"]="FontFace";RuleKind["Media"]="Media";RuleKind["Mixin"]="Mixin";RuleKind["Export"]="Export";RuleKind["Supports"]="Supports";RuleKind["Page"]="Page";RuleKind["Document"]="Document";RuleKind["Keyframes"]="Keyframes";RuleKind["Keyframe"]="Keyframe";})(RuleKind=exports.RuleKind||(exports.RuleKind={}));var SelectorKind;(function(SelectorKind){SelectorKind["Group"]="Group";SelectorKind["Combo"]="Combo";SelectorKind["Descendent"]="Descendent";SelectorKind["This"]="This";SelectorKind["Within"]="Within";SelectorKind["Global"]="Global";SelectorKind["Prefixed"]="Prefixed";SelectorKind["PseudoElement"]="PseudoElement";SelectorKind["PseudoParamElement"]="PseudoParamElement";SelectorKind["Not"]="Not";SelectorKind["Child"]="Child";SelectorKind["Adjacent"]="Adjacent";SelectorKind["Sibling"]="Sibling";SelectorKind["Id"]="Id";SelectorKind["Element"]="Element";SelectorKind["Attribute"]="Attribute";SelectorKind["Class"]="Class";SelectorKind["AllSelector"]="AllSelector";})(SelectorKind=exports.SelectorKind||(exports.SelectorKind={}));var StyleDeclarationKind;(function(StyleDeclarationKind){StyleDeclarationKind["KeyValue"]="KeyValue";StyleDeclarationKind["Include"]="Include";StyleDeclarationKind["Media"]="Media";StyleDeclarationKind["Content"]="Content";})(StyleDeclarationKind=exports.StyleDeclarationKind||(exports.StyleDeclarationKind={}));var getSheetClassNames=function(sheet,allClassNames){if(allClassNames===void 0){allClassNames=[];}return getRulesClassNames(sheet.rules,allClassNames);};exports.getSheetClassNames=getSheetClassNames;var getRulesClassNames=function(rules,allClassNames){if(allClassNames===void 0){allClassNames=[];}for(var _i=0,rules_1=rules;_i<rules_1.length;_i++){var rule=rules_1[_i];(0,exports.getRuleClassNames)(rule,allClassNames);}return allClassNames;};var getRuleClassNames=function(rule,allClassNames){if(allClassNames===void 0){allClassNames=[];}switch(rule.ruleKind){case RuleKind.Media:{getRulesClassNames(rule.rules,allClassNames);break;}case RuleKind.Style:{(0,exports.getSelectorClassNames)(rule.selector,allClassNames);break;}}return allClassNames;};exports.getRuleClassNames=getRuleClassNames;var traverseSheet=function(sheet,each){return traverseStyleExpressions(sheet.declarations,each)&&traverseStyleExpressions(sheet.rules,each);};exports.traverseSheet=traverseSheet;var traverseChildren=function(traverse){return function(rules,each){for(var _i=0,rules_2=rules;_i<rules_2.length;_i++){var rule=rules_2[_i];if(!traverse(rule,each)){return false;}}return true;};};var isRule=function(expression){return RuleKind[expression.ruleKind]!=null;};exports.isRule=isRule;var isStyleDeclaration=function(expression){return StyleDeclarationKind[expression.declarationKind]!=null;};exports.isStyleDeclaration=isStyleDeclaration;var isMaybeStyleSheet=function(expression){return expression.rules!=null&&expression.rules!=null&&expression.raws!=null;};exports.isMaybeStyleSheet=isMaybeStyleSheet;var isStyleObject=function(expression){return expression.rules!=null||(0,exports.isStyleDeclaration)(expression)||(0,exports.isRule)(expression)||(0,exports.isStyleSelector)(expression);};exports.isStyleObject=isStyleObject;var isStyleSelector=function(expression){return SelectorKind[expression.selectorKind]!=null;};exports.isStyleSelector=isStyleSelector;var isSelector=function(expression){return SelectorKind[expression.kind]!=null;};exports.isSelector=isSelector;var isIncludePart=function(expression){return expression.name!=null;};exports.isIncludePart=isIncludePart;var traverseStyleExpression=function(rule,each){if(each(rule)===false){return false;}if((0,exports.isRule)(rule)){switch(rule.ruleKind){case RuleKind.Media:{return traverseChildren(traverseStyleRule)(rule.rules,each);}case RuleKind.Export:{return traverseStyleExpressions(rule.rules,each);}case RuleKind.Style:{return traverseStyleRule(rule,each);}case RuleKind.Mixin:{return traverseStyleExpressions(rule.declarations,each);}case RuleKind.Keyframes:{return traverseChildren(function(child){return traverseStyleExpressions(child.declarations,each);})(rule.rules,each);}}}else if((0,exports.isStyleDeclaration)(rule)){switch(rule.declarationKind){case StyleDeclarationKind.Include:{for(var _i=0,_a=rule.mixinName.parts;_i<_a.length;_i++){var part=_a[_i];if(!(0,exports.traverseStyleExpression)(part,each)){return false;}}return true;}}}return true;};exports.traverseStyleExpression=traverseStyleExpression;var traverseStyleExpressions=traverseChildren(exports.traverseStyleExpression);var traverseStyleRule=function(rule,each){return traverseStyleExpressions(rule.declarations,each)&&traverseChildren(traverseStyleRule)(rule.children,each);};var getSelectorClassNames=function(selector,allClassNames){if(allClassNames===void 0){allClassNames=[];}switch(selector.selectorKind){case SelectorKind.Combo:case SelectorKind.Group:{for(var _i=0,_a=selector.selectors;_i<_a.length;_i++){var child=_a[_i];(0,exports.getSelectorClassNames)(child,allClassNames);}break;}case SelectorKind.Descendent:{(0,exports.getSelectorClassNames)(selector.ancestor,allClassNames);(0,exports.getSelectorClassNames)(selector.descendent,allClassNames);break;}case SelectorKind.PseudoElement:{(0,exports.getSelectorClassNames)(selector.target,allClassNames);break;}case SelectorKind.PseudoParamElement:{(0,exports.getSelectorClassNames)(selector.target,allClassNames);break;}case SelectorKind.Not:{(0,exports.getSelectorClassNames)(selector.selector,allClassNames);break;}case SelectorKind.Child:{(0,exports.getSelectorClassNames)(selector.parent,allClassNames);(0,exports.getSelectorClassNames)(selector.child,allClassNames);break;}case SelectorKind.Adjacent:{(0,exports.getSelectorClassNames)(selector.selector,allClassNames);(0,exports.getSelectorClassNames)(selector.nextSiblingSelector,allClassNames);break;}case SelectorKind.Sibling:{(0,exports.getSelectorClassNames)(selector.selector,allClassNames);(0,exports.getSelectorClassNames)(selector.siblingSelector,allClassNames);break;}case SelectorKind.Class:{allClassNames.push(selector.className);break;}}return allClassNames;};exports.getSelectorClassNames=getSelectorClassNames;

/***/ }),

/***/ 62178:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.isCSSExports=void 0;var isCSSExports=function(exports){return exports.mixins!=null;};exports.isCSSExports=isCSSExports;

/***/ }),

/***/ 23204:
/***/ (function(__unused_webpack_module, exports) {

"use strict";
var __assign=this&&this.__assign||function(){__assign=Object.assign||function(t){for(var s,i=1,n=arguments.length;i<n;i++){s=arguments[i];for(var p in s)if(Object.prototype.hasOwnProperty.call(s,p))t[p]=s[p];}return t;};return __assign.apply(this,arguments);};var __spreadArray=this&&this.__spreadArray||function(to,from,pack){if(pack||arguments.length===2)for(var i=0,l=from.length,ar;i<l;i++){if(ar||!(i in from)){if(!ar)ar=Array.prototype.slice.call(from,0,i);ar[i]=from[i];}}return to.concat(ar||Array.prototype.slice.call(from));};Object.defineProperty(exports, "__esModule", ({value:true}));exports.patchCSSSheet=void 0;var patchCSSSheet=function(sheet,mutations){var newSheet=sheet;for(var _i=0,mutations_1=mutations;_i<mutations_1.length;_i++){var mutation=mutations_1[_i];switch(mutation.action.kind){case"DeleteRule":{var rules=__spreadArray(__spreadArray([],newSheet.rules.slice(0,mutation.action.index),true),newSheet.rules.slice(mutation.action.index+1),true);newSheet=__assign(__assign({},newSheet),{rules:rules});break;}case"InsertRule":{var rules=__spreadArray(__spreadArray(__spreadArray([],newSheet.rules.slice(0,mutation.action.index),true),[mutation.action.rule],false),newSheet.rules.slice(mutation.action.index),true);newSheet=__assign(__assign({},newSheet),{rules:rules});break;}case"ReplaceRule":{var rules=__spreadArray(__spreadArray(__spreadArray([],newSheet.rules.slice(0,mutation.action.index),true),[mutation.action.rule],false),newSheet.rules.slice(mutation.action.index+1),true);newSheet=__assign(__assign({},newSheet),{rules:rules});break;}}}return newSheet;};exports.patchCSSSheet=patchCSSSheet;

/***/ }),

/***/ 93108:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __rest=this&&this.__rest||function(s,e){var t={};for(var p in s)if(Object.prototype.hasOwnProperty.call(s,p)&&e.indexOf(p)<0)t[p]=s[p];if(s!=null&&typeof Object.getOwnPropertySymbols==="function")for(var i=0,p=Object.getOwnPropertySymbols(s);i<p.length;i++){if(e.indexOf(p[i])<0&&Object.prototype.propertyIsEnumerable.call(s,p[i]))t[p[i]]=s[p[i]];}return t;};Object.defineProperty(exports, "__esModule", ({value:true}));exports.stringifyCSSRule=exports.stringifyCSSSheet=void 0;var path=__webpack_require__(71017);var url=__webpack_require__(57310);var stringifyCSSSheet=function(sheet,options){if(options===void 0){options={};}return sheet.rules.map(function(rule){return(0,exports.stringifyCSSRule)(rule,options);}).join("\n\n");};exports.stringifyCSSSheet=stringifyCSSSheet;var stringifyCSSRule=function(rule,options){if(options===void 0){options={};}switch(rule.kind){case"Charset":return"@charset \"".concat(rule.value,"\"; ");case"Style":return stringifyStyleRule(rule,options);case"Page":case"Supports":case"Media":return stringifyConditionRule(rule,options);case"FontFace":return stringifyFontFaceRule(rule,options);case"Keyframes":return stringifyKeyframesRule(rule,options);}};exports.stringifyCSSRule=stringifyCSSRule;var stringifyConditionRule=function(_a,options){var name=_a.name,conditionText=_a.conditionText,rules=_a.rules;return"@".concat(name," ").concat(conditionText," {\n").concat(rules.map(function(style){return(0,exports.stringifyCSSRule)(style,options);}).join("\n"),"\n}");};var stringifyKeyframesRule=function(_a,options){var name=_a.name,rules=_a.rules;return"@keyframes ".concat(name," {\n").concat(rules.map(function(style){return stringifyKeyframeRule(style,options);}).join("\n"),"\n}");};var stringifyKeyframeRule=function(_a,options){var key=_a.key,style=_a.style;return"".concat(key," {\n").concat(style.map(function(style){return stringifyStyle(style,options);}).join("\n"),"\n}");};var stringifyFontFaceRule=function(_a,options){var style=_a.style;return"@font-face {\n".concat(style.map(function(style){return stringifyStyle(style,options);}).join("\n"),"\n}");};var stringifyStyleRule=function(_a,options){var selectorText=_a.selectorText,style=_a.style,rest=__rest(_a,["selectorText","style"]);return"".concat(selectorText," {\n").concat(style.map(function(style){return stringifyStyle(style,options);}).join("\n"),"\n}");};var stringifyStyle=function(_a,_b){var name=_a.name,value=_a.value;var uri=_b.uri,resolveUrl=_b.resolveUrl;if(value){// required for bundling, otherwise file protocol is maintained
if(uri){var urls=value.match(/(file:\/\/.*?)(?=['")])/g)||[];var selfPathname=url.fileURLToPath(uri);for(var _i=0,urls_1=urls;_i<urls_1.length;_i++){var foundUrl=urls_1[_i];var pathname=url.fileURLToPath(foundUrl);var relativePath=path.relative(path.dirname(selfPathname),pathname);if(relativePath.charAt(0)!=="."){relativePath="./"+relativePath;}value=value.replace(foundUrl,relativePath);}}if(value&&resolveUrl){if(value.includes("file:")){var url_1=value.match(/(file:\/\/[^)]+)/)[1];value=value.replace(url_1,resolveUrl(url_1));}else if(value.includes("url(")){var parts=value.match(/url\(['"]?(.*?)['"]?\)/);var url_2=parts&&parts[1];if(url_2&&!url_2.includes("http")){value=value.replace(url_2,resolveUrl(url_2));}}}}return"  ".concat(name.trim(),":").concat(value,";");};

/***/ }),

/***/ 77143:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
// 1:1 with Rust
Object.defineProperty(exports, "__esModule", ({value:true}));exports.SelectorInfoKind=exports.SelectorScopeKind=void 0;var SelectorScopeKind;(function(SelectorScopeKind){SelectorScopeKind["Element"]="Element";SelectorScopeKind["Document"]="Document";})(SelectorScopeKind=exports.SelectorScopeKind||(exports.SelectorScopeKind={}));var SelectorInfoKind;(function(SelectorInfoKind){SelectorInfoKind["List"]="list";SelectorInfoKind["All"]="All";SelectorInfoKind["Element"]="Element";SelectorInfoKind["PseudoElement"]="PseudoElement";SelectorInfoKind["PsuedoParamElement"]="PseudoParamElement";SelectorInfoKind["Attribute"]="Attribute";SelectorInfoKind["Not"]="Not";SelectorInfoKind["Id"]="Id";SelectorInfoKind["Class"]="Class";SelectorInfoKind["Combo"]="Combo";SelectorInfoKind["Child"]="Child";SelectorInfoKind["Descendent"]="Descendent";SelectorInfoKind["Adjacent"]="Adjacent";SelectorInfoKind["Sibling"]="Sibling";})(SelectorInfoKind=exports.SelectorInfoKind||(exports.SelectorInfoKind={}));

/***/ }),

/***/ 35293:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.VirtRuleKind=void 0;var VirtRuleKind;(function(VirtRuleKind){VirtRuleKind["Style"]="Style";VirtRuleKind["Media"]="Media";VirtRuleKind["FontFace"]="FontFace";})(VirtRuleKind=exports.VirtRuleKind||(exports.VirtRuleKind={}));

/***/ }),

/***/ 72070:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.getNestedReferences=exports.traverseExpression=exports.isDynamicStringAttributeValuePart=exports.isScriptExpression=exports.isAttributeValue=exports.isAttribute=exports.isNode=exports.getMixins=exports.isComponentInstance=exports.getNodeById=exports.getPCNodeAnnotations=exports.getParentNode=exports.hasAttribute=exports.getLogicElement=exports.getDefaultPart=exports.getPartIds=exports.getParts=exports.isImport=exports.isComponent=exports.getVisibleChildNodes=exports.isVisibleNode=exports.isVisibleElement=exports.getStyleElements=exports.getAttributeStringValue=exports.getAttributeValue=exports.getAttribute=exports.getMetaValue=exports.findByNamespace=exports.getChildrenByTagName=exports.getStyleScopeId=exports.getChildren=exports.getImportBySrc=exports.getImportById=exports.getImportIds=exports.getRelativeFilePath=exports.getImports=exports.DynamicStringAttributeValuePartKind=exports.AttributeValueKind=exports.AttributeKind=exports.AnnotationPropertyKind=exports.NodeKind=void 0;var ast_1=__webpack_require__(5010);var ast_2=__webpack_require__(59889);var tree_1=__webpack_require__(35245);var crc32=__webpack_require__(74334);var resolve_1=__webpack_require__(52457);var path=__webpack_require__(71017);var constants_1=__webpack_require__(54203);var memo_1=__webpack_require__(94841);var NodeKind;(function(NodeKind){NodeKind["Fragment"]="Fragment";NodeKind["Text"]="Text";NodeKind["Annotation"]="Annotation";NodeKind["Comment"]="Comment";NodeKind["Element"]="Element";NodeKind["StyleElement"]="StyleElement";NodeKind["Slot"]="Slot";})(NodeKind=exports.NodeKind||(exports.NodeKind={}));var AnnotationPropertyKind;(function(AnnotationPropertyKind){AnnotationPropertyKind["Text"]="Text";AnnotationPropertyKind["Declaration"]="Declaration";})(AnnotationPropertyKind=exports.AnnotationPropertyKind||(exports.AnnotationPropertyKind={}));var AttributeKind;(function(AttributeKind){AttributeKind["ShorthandAttribute"]="ShorthandAttribute";AttributeKind["KeyValueAttribute"]="KeyValueAttribute";AttributeKind["SpreadAttribute"]="SpreadAttribute";AttributeKind["PropertyBoundAttribute"]="PropertyBoundAttribute";})(AttributeKind=exports.AttributeKind||(exports.AttributeKind={}));var AttributeValueKind;(function(AttributeValueKind){AttributeValueKind["DyanmicString"]="DyanmicString";AttributeValueKind["String"]="String";AttributeValueKind["Slot"]="Slot";})(AttributeValueKind=exports.AttributeValueKind||(exports.AttributeValueKind={}));var DynamicStringAttributeValuePartKind;(function(DynamicStringAttributeValuePartKind){DynamicStringAttributeValuePartKind["Literal"]="Literal";DynamicStringAttributeValuePartKind["ClassNamePierce"]="ClassNamePierce";DynamicStringAttributeValuePartKind["Slot"]="Slot";})(DynamicStringAttributeValuePartKind=exports.DynamicStringAttributeValuePartKind||(exports.DynamicStringAttributeValuePartKind={}));var a=null;var getImports=function(ast){return(0,exports.getChildrenByTagName)("import",ast).filter(function(child){return(0,exports.hasAttribute)("src",child);});};exports.getImports=getImports;var getRelativeFilePath=function(fs){return function(fromFilePath,importFilePath){var logicPath=(0,resolve_1.resolveImportFile)(fs)(fromFilePath,importFilePath);var relativePath=path.relative(path.dirname(fromFilePath),logicPath);if(relativePath.charAt(0)!=="."){relativePath="./".concat(relativePath);}return relativePath;};};exports.getRelativeFilePath=getRelativeFilePath;var getImportIds=function(ast){return(0,exports.getImports)(ast).map(function(node){return(0,exports.getAttributeStringValue)(constants_1.AS_ATTR_NAME,node);}).filter(Boolean);};exports.getImportIds=getImportIds;var getImportById=function(id,ast){return(0,exports.getImports)(ast).find(function(imp){return(0,exports.getAttributeStringValue)(constants_1.AS_ATTR_NAME,imp)===id;});};exports.getImportById=getImportById;var getImportBySrc=function(src,ast){return(0,exports.getImports)(ast).find(function(imp){return(0,exports.getAttributeStringValue)("src",imp)===src;});};exports.getImportBySrc=getImportBySrc;var getChildren=function(ast){if(ast.nodeKind===NodeKind.Element||ast.nodeKind===NodeKind.Fragment){return ast.children;}return[];};exports.getChildren=getChildren;var getStyleScopeId=function(filePath){if(filePath.indexOf("file://")!==0){filePath="file://"+filePath;}return crc32(filePath);};exports.getStyleScopeId=getStyleScopeId;var getChildrenByTagName=function(tagName,parent){return(0,exports.getChildren)(parent).filter(function(child){return child.nodeKind===NodeKind.Element&&child.tagName===tagName;});};exports.getChildrenByTagName=getChildrenByTagName;var findByNamespace=function(namespace,current,allChildrenByNamespace){if(allChildrenByNamespace===void 0){allChildrenByNamespace=[];}if((0,exports.isNode)(current)){if(current.nodeKind===NodeKind.Element){if(current.tagName.split(".")[0]===namespace){allChildrenByNamespace.push(current);}}for(var _i=0,_a=(0,exports.getChildren)(current);_i<_a.length;_i++){var child=_a[_i];(0,exports.findByNamespace)(namespace,child,allChildrenByNamespace);}if(current.nodeKind===NodeKind.Element){for(var _b=0,_c=current.attributes;_b<_c.length;_b++){var attribute=_c[_b];if(attribute.attrKind===AttributeKind.KeyValueAttribute&&attribute.value){if(attribute.value.attrValueKind===AttributeValueKind.Slot&&attribute.value.script.scriptKind===ast_1.ScriptExpressionKind.Node){(0,exports.findByNamespace)(namespace,attribute.value.script,allChildrenByNamespace);}}}}if(current.nodeKind===NodeKind.Slot){(0,exports.findByNamespace)(namespace,current.script,allChildrenByNamespace);}}else if((0,exports.isScriptExpression)(current)){if(current.scriptKind===ast_1.ScriptExpressionKind.Conjunction){(0,exports.findByNamespace)(namespace,current.left,allChildrenByNamespace);(0,exports.findByNamespace)(namespace,current.right,allChildrenByNamespace);}}return allChildrenByNamespace;};exports.findByNamespace=findByNamespace;var getMetaValue=function(name,root){var metaElement=(0,exports.getChildrenByTagName)("meta",root).find(function(meta){return(0,exports.hasAttribute)("src",meta)&&(0,exports.getAttributeStringValue)("name",meta)===name;});return metaElement&&(0,exports.getAttributeStringValue)("content",metaElement);};exports.getMetaValue=getMetaValue;var getAttribute=function(name,element){return element.attributes.find(function(attr){return attr.attrKind===AttributeKind.KeyValueAttribute&&attr.name===name;});};exports.getAttribute=getAttribute;var getAttributeValue=function(name,element){var attr=(0,exports.getAttribute)(name,element);return attr&&attr.value;};exports.getAttributeValue=getAttributeValue;var getAttributeStringValue=function(name,element){var value=(0,exports.getAttributeValue)(name,element);return value&&value.attrValueKind===AttributeValueKind.String&&value.value;};exports.getAttributeStringValue=getAttributeStringValue;var getStyleElements=function(ast){var styleElements=[];(0,exports.traverseExpression)(ast,function(node){if(node.nodeKind===NodeKind.StyleElement){styleElements.push(node);}});return styleElements;};exports.getStyleElements=getStyleElements;var isVisibleElement=function(ast){return!/^(import|logic|meta|style|part|preview)$/.test(ast.tagName);};exports.isVisibleElement=isVisibleElement;var isVisibleNode=function(node){return node.nodeKind===NodeKind.Text||node.nodeKind===NodeKind.Fragment||node.nodeKind===NodeKind.Slot||node.nodeKind===NodeKind.Element&&(0,exports.isVisibleElement)(node);};exports.isVisibleNode=isVisibleNode;var getVisibleChildNodes=function(ast){return(0,exports.getChildren)(ast).filter(exports.isVisibleNode);};exports.getVisibleChildNodes=getVisibleChildNodes;var isComponent=function(node){return node.nodeKind===NodeKind.Element&&(0,exports.hasAttribute)("component",node)&&(0,exports.hasAttribute)(constants_1.AS_ATTR_NAME,node);};exports.isComponent=isComponent;var isImport=function(node){return node.nodeKind===NodeKind.Element&&node.tagName==="import"&&(0,exports.hasAttribute)("src",node);};exports.isImport=isImport;var getParts=function(ast){return(0,exports.getChildren)(ast).filter(exports.isComponent);};exports.getParts=getParts;var getPartIds=function(ast){return(0,exports.getParts)(ast).map(function(node){return(0,exports.getAttributeStringValue)(constants_1.AS_ATTR_NAME,node);}).filter(Boolean);};exports.getPartIds=getPartIds;var getDefaultPart=function(ast){return(0,exports.getParts)(ast).find(function(part){return(0,exports.getAttributeStringValue)(constants_1.AS_ATTR_NAME,part)===constants_1.DEFAULT_PART_ID;});};exports.getDefaultPart=getDefaultPart;var getLogicElement=function(ast){return(0,exports.getChildren)(ast).find(function(child){return child.nodeKind===NodeKind.Element&&child.tagName===constants_1.LOGIC_TAG_NAME;});};exports.getLogicElement=getLogicElement;var hasAttribute=function(name,element){return(0,exports.getAttribute)(name,element)!=null;};exports.hasAttribute=hasAttribute;// https://github.com/crcn/tandem/blob/10.0.0/packages/common/src/state/tree.ts#L137
// TODO
var getParentNode=function(node,root){var nodePath=(0,tree_1.getNodePath)(node,root).split(".");nodePath.pop();var map=(0,tree_1.getTreeNodeMap)(root);return map[nodePath.join(".")];};exports.getParentNode=getParentNode;var getPCNodeAnnotations=function(node,root){var parent=(0,exports.getParentNode)(node,root);var prevChild=parent.children[parent.children.indexOf(node)-1];if((prevChild===null||prevChild===void 0?void 0:prevChild.nodeKind)===NodeKind.Comment){return prevChild;}return null;};exports.getPCNodeAnnotations=getPCNodeAnnotations;exports.getNodeById=(0,memo_1.memoize)(function(nodeId,root){return(0,tree_1.flattenTreeNode)(root).find(function(desc){return desc.id===nodeId;});});var isComponentInstance=function(node,importIds){return node.nodeKind===NodeKind.Element&&importIds.indexOf(node.tagName.split(".").shift())!==-1;};exports.isComponentInstance=isComponentInstance;var maybeAddReference=function(stmt,_statements){if(_statements===void 0){_statements=[];}if(stmt.scriptKind===ast_1.ScriptExpressionKind.Reference){_statements.push([stmt,null]);}};var getMixins=function(ast){var styles=(0,exports.getStyleElements)(ast);var mixins={};for(var _i=0,styles_1=styles;_i<styles_1.length;_i++){var style=styles_1[_i];(0,ast_2.traverseSheet)(style.sheet,function(rule){if(rule&&(0,ast_2.isRule)(rule)&&rule.ruleKind===ast_2.RuleKind.Mixin){mixins[rule.name.value]=rule;}});}return mixins;};exports.getMixins=getMixins;var isNode=function(ast){return NodeKind[ast.nodeKind]!=null;};exports.isNode=isNode;var isAttribute=function(ast){return AttributeKind[ast.attrKind]!=null;};exports.isAttribute=isAttribute;var isAttributeValue=function(ast){return AttributeValueKind[ast.attrValueKind]!=null;};exports.isAttributeValue=isAttributeValue;var isScriptExpression=function(ast){return ast_1.ScriptExpressionKind[ast.scriptKind]!=null;};exports.isScriptExpression=isScriptExpression;var isDynamicStringAttributeValuePart=function(ast){return DynamicStringAttributeValuePartKind[ast.partKind]!=null;};exports.isDynamicStringAttributeValuePart=isDynamicStringAttributeValuePart;var traverseExpression=function(ast,each){if(each(ast)===false){return false;}if((0,exports.isNode)(ast)){switch(ast.nodeKind){case NodeKind.Element:{return traverseExpressions(ast.attributes,each)&&traverseExpressions(ast.children,each);}case NodeKind.Fragment:{return traverseExpressions(ast.children,each);}case NodeKind.Slot:{return(0,ast_1.traverseJSExpression)(ast.script,each);}case NodeKind.StyleElement:{return(0,ast_2.traverseSheet)(ast.sheet,each);}}}else if((0,exports.isAttribute)(ast)){if(ast.attrKind===AttributeKind.KeyValueAttribute&&ast.value){return(0,exports.traverseExpression)(ast.value,each);}}else if((0,exports.isAttributeValue)(ast)){if(ast.attrValueKind===AttributeValueKind.Slot){return(0,ast_1.traverseJSExpression)(ast.script,each);}}return true;};exports.traverseExpression=traverseExpression;var traverseExpressions=function(expressions,each){for(var _i=0,expressions_1=expressions;_i<expressions_1.length;_i++){var child=expressions_1[_i];if(!(0,exports.traverseExpression)(child,each)){return false;}}return true;};var getNestedReferences=function(node,_statements){if(_statements===void 0){_statements=[];}if(node.nodeKind===NodeKind.Slot){maybeAddReference(node.script,_statements);}else{if(node.nodeKind===NodeKind.Element){for(var _i=0,_a=node.attributes;_i<_a.length;_i++){var attr=_a[_i];if(attr.attrKind==AttributeKind.KeyValueAttribute&&attr.value&&attr.value.attrValueKind===AttributeValueKind.Slot){if(attr.value.script.scriptKind===ast_1.ScriptExpressionKind.Node){(0,exports.getNestedReferences)(attr.value.script,_statements);}else if(attr.value.script.scriptKind===ast_1.ScriptExpressionKind.Reference){_statements.push([attr.value.script,attr.name]);}}else if(attr.attrKind===AttributeKind.ShorthandAttribute&&attr.reference.scriptKind===ast_1.ScriptExpressionKind.Reference){_statements.push([attr.reference,attr.reference[0]]);}else if(attr.attrKind===AttributeKind.SpreadAttribute&&attr.script.scriptKind===ast_1.ScriptExpressionKind.Reference){_statements.push([attr.script,attr.script[0]]);}}}for(var _b=0,_c=(0,exports.getChildren)(node);_b<_c.length;_b++){var child=_c[_b];if(child.nodeKind===NodeKind.Element&&(0,exports.hasAttribute)(constants_1.PREVIEW_ATTR_NAME,child)){continue;}(0,exports.getNestedReferences)(child,_statements);}}return _statements;};exports.getNestedReferences=getNestedReferences;

/***/ }),

/***/ 4511:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));

/***/ }),

/***/ 9088:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __assign=this&&this.__assign||function(){__assign=Object.assign||function(t){for(var s,i=1,n=arguments.length;i<n;i++){s=arguments[i];for(var p in s)if(Object.prototype.hasOwnProperty.call(s,p))t[p]=s[p];}return t;};return __assign.apply(this,arguments);};var __spreadArray=this&&this.__spreadArray||function(to,from,pack){if(pack||arguments.length===2)for(var i=0,l=from.length,ar;i<l;i++){if(ar||!(i in from)){if(!ar)ar=Array.prototype.slice.call(from,0,i);ar[i]=from[i];}}return to.concat(ar||Array.prototype.slice.call(from));};Object.defineProperty(exports, "__esModule", ({value:true}));exports.updateAllLoadedData=exports.getVirtTarget=exports.patchVirtNode=void 0;var virt_mtuation_1=__webpack_require__(27574);var virt_1=__webpack_require__(70985);var events_1=__webpack_require__(47313);var patcher_1=__webpack_require__(23204);var patchVirtNode=function(root,mutations){for(var _i=0,mutations_1=mutations;_i<mutations_1.length;_i++){var mutation=mutations_1[_i];var target=(0,exports.getVirtTarget)(root,mutation.nodePath);var action=mutation.action;switch(action.kind){case virt_mtuation_1.ActionKind.DeleteChild:{var element=target;var children=element.children.concat();children.splice(action.index,1);target=__assign(__assign({},target),{children:children});break;}case virt_mtuation_1.ActionKind.InsertChild:{var element=target;var children=element.children.concat();children.splice(action.index,0,action.child);target=__assign(__assign({},target),{children:children});break;}case virt_mtuation_1.ActionKind.ReplaceNode:{target=action.replacement;break;}case virt_mtuation_1.ActionKind.RemoveAttribute:{var element=target;var attributes=__assign({},element.attributes);delete attributes[action.name];target=__assign(__assign({},target),{attributes:attributes});break;}case virt_mtuation_1.ActionKind.SetAttribute:{var element=target;var attributes=__assign({},element.attributes);if(!action.value){attributes[action.name]=action.value;}else{attributes[action.name]=action.value;}target=__assign(__assign({},target),{attributes:attributes});break;}case virt_mtuation_1.ActionKind.SetElementSourceInfo:{target=__assign(__assign({},target),{sourceInfo:action.value});break;}case virt_mtuation_1.ActionKind.SetAnnotations:{target=__assign(__assign({},target),{annotations:action.value});break;}case virt_mtuation_1.ActionKind.SetText:{target=__assign(__assign({},target),{value:action.value});break;}}root=updateNode(root,mutation.nodePath,target);}return root;};exports.patchVirtNode=patchVirtNode;var getVirtTarget=function(mount,nodePath){return nodePath.reduce(function(current,i){var c=current.children[i];return c;},mount);};exports.getVirtTarget=getVirtTarget;var updateNode=function(ancestor,nodePath,newNode,depth){if(depth===void 0){depth=0;}if(depth===nodePath.length){return newNode;}if(ancestor.kind===virt_1.VirtualNodeKind.Text||ancestor.kind===virt_1.VirtualNodeKind.StyleElement){return newNode;}return __assign(__assign({},ancestor),{children:__spreadArray(__spreadArray(__spreadArray([],ancestor.children.slice(0,nodePath[depth]),true),[updateNode(ancestor.children[nodePath[depth]],nodePath,newNode,depth+1)],false),ancestor.children.slice(nodePath[depth]+1),true)});};var updateAllLoadedData=function(allData,event){var _a;allData=updatePrimary(allData,event);// update dependents
for(var name_1 in allData){var info=allData[name_1];if(info.kind===virt_1.EvaluatedDataKind.PC){if(info.allImportedSheetUris.includes(event.uri)){allData=__assign(__assign({},allData),(_a={},_a[name_1]=__assign(__assign({},allData[name_1]),{importedSheets:getImportedSheets(allData,info.allImportedSheetUris)}),_a));}}}return allData;};exports.updateAllLoadedData=updateAllLoadedData;var updatePrimary=function(allData,event){var _a,_b,_c,_d;if(event.kind===events_1.EngineDelegateEventKind.Evaluated){if(event.data.kind===virt_1.EvaluatedDataKind.PC){return __assign(__assign({},allData),(_a={},_a[event.uri]=__assign(__assign({},event.data),{importedSheets:getImportedSheets(allData,event.data.allImportedSheetUris)}),_a));}else{return __assign(__assign({},allData),(_b={},_b[event.uri]=__assign({},event.data),_b));}}else if(event.kind===events_1.EngineDelegateEventKind.Diffed){var existingData=allData[event.uri];// this will happen if client renderer loads data, but imported
// resource has changed
if(!existingData){return allData;}if(event.data.kind===virt_1.DiffedDataKind.PC){var existingPCData=existingData;return __assign(__assign({},allData),(_c={},_c[event.uri]=__assign(__assign({},existingPCData),{exports:event.data.exports,importedSheets:getImportedSheets(allData,event.data.allImportedSheetUris),allImportedSheetUris:event.data.allImportedSheetUris,dependencies:event.data.dependencies,sheet:(0,patcher_1.patchCSSSheet)(existingPCData.sheet,event.data.sheetMutations),preview:(0,exports.patchVirtNode)(existingPCData.preview,event.data.mutations)}),_c));}else{var existingCSSData=existingData;return __assign(__assign({},allData),(_d={},_d[event.uri]=__assign(__assign({},existingCSSData),{exports:event.data.exports,sheet:(0,patcher_1.patchCSSSheet)(existingCSSData.sheet,event.data.mutations)}),_d));}}return allData;};var getImportedSheets=function(allData,allImportedSheetUris){// ick, wworks for now.
var deps=[];for(var i=0,length_1=allImportedSheetUris.length;i<length_1;i++){var depUri=allImportedSheetUris[i];var data=allData[depUri];if(data){deps.push({uri:depUri,index:i,sheet:data.sheet});// scenario won't happen for renderer since renderers are only
// concerned about the file that's currently opened -- ignore for now. Might
}else{// console.error(`data not loaded, this shouldn't happen 😬.`);
}}return deps;};

/***/ }),

/***/ 51535:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.stringifyVirtualNode=void 0;var stringify_sheet_1=__webpack_require__(93108);var html_entities_1=__webpack_require__(59392);var entities=new html_entities_1.Html5Entities();var stringifyVirtualNode=function(node){switch(node.kind){case"Fragment":return stringifyChildren(node);case"Element":{var buffer="<".concat(node.tagName);for(var key in node.attributes){var value=node.attributes[key];if(value){buffer+=" ".concat(key,"=\"").concat(value,"\"");}else{buffer+=" ".concat(key);}}buffer+=">".concat(stringifyChildren(node),"</").concat(node.tagName,">");return buffer;}case"StyleElement":{return"<style>".concat((0,stringify_sheet_1.stringifyCSSSheet)(node.sheet),"</style>");}case"Text":{return entities.decode(node.value);}default:{throw new Error("can't handle ".concat(node.kind));}}};exports.stringifyVirtualNode=stringifyVirtualNode;var stringifyChildren=function(node){return node.children.map(exports.stringifyVirtualNode).join("");};

/***/ }),

/***/ 35245:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __spreadArray=this&&this.__spreadArray||function(to,from,pack){if(pack||arguments.length===2)for(var i=0,l=from.length,ar;i<l;i++){if(ar||!(i in from)){if(!ar)ar=Array.prototype.slice.call(from,0,i);ar[i]=from[i];}}return to.concat(ar||Array.prototype.slice.call(from));};Object.defineProperty(exports, "__esModule", ({value:true}));exports.getTreeNodeMap=exports.containsNode=exports.getNodeAncestors=exports.getNodeByPath=exports.getNodePath=exports.flattenTreeNode=exports.isNodeParent=void 0;var memo_1=__webpack_require__(94841);var virt_1=__webpack_require__(70985);var isNodeParent=function(node){return node.children!=null;};exports.isNodeParent=isNodeParent;exports.flattenTreeNode=(0,memo_1.memoize)(function(current){var treeNodeMap=(0,exports.getTreeNodeMap)(current);return Object.values(treeNodeMap);});exports.getNodePath=(0,memo_1.memoize)(function(node,root){var map=(0,exports.getTreeNodeMap)(root);for(var path in map){var c=map[path];if(c===node)return path;}});exports.getNodeByPath=(0,memo_1.memoize)(function(nodePath,root){return(0,exports.getTreeNodeMap)(root)[nodePath];});exports.getNodeAncestors=(0,memo_1.memoize)(function(nodePath,root){var pathAry=(0,virt_1.nodePathToAry)(nodePath);var map=(0,exports.getTreeNodeMap)(root);var ancestors=[];for(var i=pathAry.length;i--;){ancestors.push((0,exports.getNodeByPath)(pathAry.slice(0,i).join("."),root));}return ancestors;});var containsNode=function(node,root){return(0,exports.getNodePath)(node,root)!=null;};exports.containsNode=containsNode;exports.getTreeNodeMap=(0,memo_1.memoize)(function(current,path){var _a;if(path===void 0){path="";}var map=(_a={},_a[path]=current,_a);if((0,exports.isNodeParent)(current)){Object.assign.apply(Object,__spreadArray([map],current.children.map(function(child,i){return(0,exports.getTreeNodeMap)(child,path?path+"."+i:String(i));}),false));}return map;});

/***/ }),

/***/ 27574:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.ActionKind=void 0;var ActionKind;(function(ActionKind){ActionKind["ReplaceNode"]="ReplaceNode";ActionKind["InsertChild"]="InsertChild";ActionKind["DeleteChild"]="DeleteChild";ActionKind["SetAttribute"]="SetAttribute";ActionKind["SetElementSourceInfo"]="SetElementSourceInfo";ActionKind["SetAnnotations"]="SetAnnotations";ActionKind["SourceUriChanged"]="SourceUriChanged";ActionKind["SetText"]="SetText";ActionKind["RemoveAttribute"]="RemoveAttribute";})(ActionKind=exports.ActionKind||(exports.ActionKind={}));

/***/ }),

/***/ 70985:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.getInstanceAncestor=exports.isInstance=exports.getElementLabel=exports.nodePathToAry=exports.getStyleExports=exports.DiffedDataKind=exports.EvaluatedDataKind=exports.VirtualNodeKind=void 0;var memo_1=__webpack_require__(94841);var tree_1=__webpack_require__(35245);var VirtualNodeKind;(function(VirtualNodeKind){VirtualNodeKind["Element"]="Element";VirtualNodeKind["Text"]="Text";VirtualNodeKind["Fragment"]="Fragment";VirtualNodeKind["StyleElement"]="StyleElement";})(VirtualNodeKind=exports.VirtualNodeKind||(exports.VirtualNodeKind={}));var EvaluatedDataKind;(function(EvaluatedDataKind){EvaluatedDataKind["PC"]="PC";EvaluatedDataKind["CSS"]="CSS";})(EvaluatedDataKind=exports.EvaluatedDataKind||(exports.EvaluatedDataKind={}));var DiffedDataKind;(function(DiffedDataKind){DiffedDataKind["CSS"]="CSS";DiffedDataKind["PC"]="PC";})(DiffedDataKind=exports.DiffedDataKind||(exports.DiffedDataKind={}));var getStyleExports=function(data){return data.kind===EvaluatedDataKind.PC?data.exports.style:data.exports;};exports.getStyleExports=getStyleExports;exports.nodePathToAry=(0,memo_1.memoize)(function(path){return path.split(".").map(Number);});var getElementLabel=function(node){var _a,_b;return node.attributes["data-pc-label"]||((_b=(_a=node.sourceInfo)===null||_a===void 0?void 0:_a.instanceOf)===null||_b===void 0?void 0:_b.componentName);};exports.getElementLabel=getElementLabel;var isInstance=function(node){var _a;return node.kind===VirtualNodeKind.Element&&Boolean((_a=node.sourceInfo)===null||_a===void 0?void 0:_a.instanceOf);};exports.isInstance=isInstance;var getInstanceAncestor=function(node,root){return(0,tree_1.getNodeAncestors)((0,tree_1.getNodePath)(node,root),root).find(exports.isInstance);};exports.getInstanceAncestor=getInstanceAncestor;// export const createVirtNodeSource = (path: number[], uri: string): VirtNodeSource => ({
//   uri,
//   path
// });
// export const createVirtNodeSourceFromInstance = (instance: VirtualNode, rendered: Record<string, LoadedData>) => {
//   for (const uri in rendered) {
//     const data = rendered[uri];
//     if (data.kind === EvaluatedDataKind.PC && containsNode(instance, data.preview)) {
//       return createVirtNodeSource(getNodePath(instance, data.preview).split(".").map(Number), uri);
//     }
//   }
// };

/***/ }),

/***/ 14202:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";
var __createBinding=this&&this.__createBinding||(Object.create?function(o,m,k,k2){if(k2===undefined)k2=k;Object.defineProperty(o,k2,{enumerable:true,get:function(){return m[k];}});}:function(o,m,k,k2){if(k2===undefined)k2=k;o[k2]=m[k];});var __exportStar=this&&this.__exportStar||function(m,exports){for(var p in m)if(p!=="default"&&!Object.prototype.hasOwnProperty.call(exports,p))__createBinding(exports,m,p);};Object.defineProperty(exports, "__esModule", ({value:true}));__exportStar(__webpack_require__(47313),exports);__exportStar(__webpack_require__(70985),exports);__exportStar(__webpack_require__(72070),exports);__exportStar(__webpack_require__(5010),exports);__exportStar(__webpack_require__(32873),exports);__exportStar(__webpack_require__(58420),exports);__exportStar(__webpack_require__(93108),exports);__exportStar(__webpack_require__(59889),exports);__exportStar(__webpack_require__(14171),exports);__exportStar(__webpack_require__(66522),exports);__exportStar(__webpack_require__(54203),exports);// export * from "./errors";
__exportStar(__webpack_require__(5940),exports);__exportStar(__webpack_require__(27574),exports);__exportStar(__webpack_require__(52457),exports);__exportStar(__webpack_require__(51535),exports);__exportStar(__webpack_require__(35293),exports);__exportStar(__webpack_require__(9088),exports);__exportStar(__webpack_require__(95323),exports);__exportStar(__webpack_require__(23204),exports);__exportStar(__webpack_require__(94841),exports);__exportStar(__webpack_require__(76657),exports);__exportStar(__webpack_require__(74491),exports);__exportStar(__webpack_require__(26642),exports);__exportStar(__webpack_require__(35245),exports);__exportStar(__webpack_require__(77143),exports);__exportStar(__webpack_require__(34411),exports);__exportStar(__webpack_require__(62178),exports);__exportStar(__webpack_require__(4511),exports);__exportStar(__webpack_require__(68539),exports);

/***/ }),

/***/ 5010:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.traverseJSExpression=exports.ScriptConjunctionOperatorKind=exports.ScriptExpressionKind=void 0;var ast_1=__webpack_require__(72070);var ScriptExpressionKind;(function(ScriptExpressionKind){ScriptExpressionKind["Node"]="Node";ScriptExpressionKind["Reference"]="Reference";ScriptExpressionKind["Array"]="Array";ScriptExpressionKind["Object"]="Object";ScriptExpressionKind["String"]="String";ScriptExpressionKind["Number"]="Number";ScriptExpressionKind["Boolean"]="Boolean";ScriptExpressionKind["Conjunction"]="Conjunction";ScriptExpressionKind["Not"]="Not";ScriptExpressionKind["Group"]="Group";})(ScriptExpressionKind=exports.ScriptExpressionKind||(exports.ScriptExpressionKind={}));var ScriptConjunctionOperatorKind;(function(ScriptConjunctionOperatorKind){ScriptConjunctionOperatorKind["And"]="And";ScriptConjunctionOperatorKind["Or"]="Or";})(ScriptConjunctionOperatorKind=exports.ScriptConjunctionOperatorKind||(exports.ScriptConjunctionOperatorKind={}));var traverseJSExpression=function(expr,each){if(expr.scriptKind===ScriptExpressionKind.Conjunction){return(0,exports.traverseJSExpression)(expr.left,each)&&(0,exports.traverseJSExpression)(expr.right,each);}else if(expr.scriptKind===ScriptExpressionKind.Array){for(var _i=0,_a=expr.values;_i<_a.length;_i++){var value=_a[_i];if((0,exports.traverseJSExpression)(value,each)===false){return false;}}}else if(expr.scriptKind===ScriptExpressionKind.Node){return(0,ast_1.traverseExpression)(expr,each);}return true;};exports.traverseJSExpression=traverseJSExpression;

/***/ }),

/***/ 58420:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
Object.defineProperty(exports, "__esModule", ({value:true}));exports.computeVirtScriptValue=exports.toVirtScriptValue=exports.computeVirtScriptObject=exports.VirtScriptObjectKind=void 0;var memo_1=__webpack_require__(94841);var VirtScriptObjectKind;(function(VirtScriptObjectKind){VirtScriptObjectKind["Object"]="Object";VirtScriptObjectKind["Array"]="Array";VirtScriptObjectKind["Boolean"]="Boolean";VirtScriptObjectKind["Number"]="Number";VirtScriptObjectKind["Str"]="Str";})(VirtScriptObjectKind=exports.VirtScriptObjectKind||(exports.VirtScriptObjectKind={}));exports.computeVirtScriptObject=(0,memo_1.memoize)(function(obj){var values={};for(var key in obj.values){values[key]=(0,exports.computeVirtScriptValue)(obj.values[key]);}return values;});exports.toVirtScriptValue=(0,memo_1.memoize)(function(value){if(Array.isArray(value)){return{kind:VirtScriptObjectKind.Array,values:value.map(exports.toVirtScriptValue)};}else if(value&&typeof value==="object"){var values={};for(var k in value){values[k]=(0,exports.toVirtScriptValue)(value[k]);}return{kind:VirtScriptObjectKind.Object,values:values};}else if(typeof value==="number"){return{kind:VirtScriptObjectKind.Number,value:value};}else if(typeof value==="string"){return{kind:VirtScriptObjectKind.Str,value:value};}else if(typeof value==="boolean"){return{kind:VirtScriptObjectKind.Boolean,value:value};}});exports.computeVirtScriptValue=(0,memo_1.memoize)(function(obj){switch(obj.kind){case VirtScriptObjectKind.Object:{return(0,exports.computeVirtScriptObject)(obj);}case VirtScriptObjectKind.Array:{return obj.values.map(exports.computeVirtScriptValue);}case VirtScriptObjectKind.Str:case VirtScriptObjectKind.Boolean:case VirtScriptObjectKind.Number:{return obj.value;}}});

/***/ }),

/***/ 82361:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 71017:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 57310:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// EXTERNAL MODULE: ../paperclip-utils/index.js
var paperclip_utils = __webpack_require__(85402);
// EXTERNAL MODULE: ../../node_modules/color/index.js
var color = __webpack_require__(71346);
;// CONCATENATED MODULE: ../paperclip-monaco/lib/languages/service/css-color-names.js
/* harmony default export */ const css_color_names = ({aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",goldenrod:"#daa520",gold:"#ffd700",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavenderblush:"#fff0f5",lavender:"#e6e6fa",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"});
;// CONCATENATED MODULE: ../paperclip-monaco/lib/languages/service/ast-info.js
var CSS_COLOR_NAME_LIST=Object.keys(css_color_names);var CSS_COLOR_NAME_REGEXP=new RegExp("\\b(?<![-_])(".concat(CSS_COLOR_NAME_LIST.join("|"),")(?![-_])\\b"),"g");var collectASTInfo=(0,paperclip_utils.memoize)(function(content){var info={colors:[]};if(!content){return info;}if(content.contentKind===paperclip_utils.DependencyContentKind.Node){handleStyles(content,info);}return info;});var handleStyles=function(content,info){var styles=(0,paperclip_utils.getStyleElements)(content);for(var _i=0,styles_1=styles;_i<styles_1.length;_i++){var style=styles_1[_i];handleStyle(style,info);}};var handleStyle=function(style,info){handleDeclarations(style.sheet.declarations,info);handleRules(style.sheet.rules,info);};var handleRules=function(rules,info){for(var _i=0,rules_1=rules;_i<rules_1.length;_i++){var rule=rules_1[_i];if(rule.ruleKind===paperclip_utils.RuleKind.Style){handleStyleRule(rule,info);}else if(rule.ruleKind===paperclip_utils.RuleKind.Mixin){handleDeclarations(rule.declarations,info);}else if(rule.ruleKind===paperclip_utils.RuleKind.Media){handleRules(rule.rules,info);handleDeclarations(rule.declarations,info);}else if(rule.ruleKind===paperclip_utils.RuleKind.Keyframes){// keyframe doesn't have type so need to do this
rule.rules.forEach(function(rule){return handleDeclarations(rule.declarations,info);});}}};var handleStyleRule=function(rule,info){handleDeclarations(rule.declarations,info);rule.children.forEach(function(child){return handleStyleRule(child,info);});};var handleDeclarations=function(declarations,info){for(var _i=0,declarations_1=declarations;_i<declarations_1.length;_i++){var declaration=declarations_1[_i];if(declaration.declarationKind===paperclip_utils.StyleDeclarationKind.KeyValue){handleKeyValueDeclaration(declaration,info);}else if(declaration.declarationKind===paperclip_utils.StyleDeclarationKind.Include){handleDeclarations(declaration.declarations,info);}else if(declaration.declarationKind===paperclip_utils.StyleDeclarationKind.Media){handleDeclarations(declaration.declarations,info);handleRules(declaration.rules,info);}}};var handleKeyValueDeclaration=function(declaration,info){var colors=matchColor(declaration.value)||declaration.value.match(/#[^\s,;]+|(var)\(.*?\)/g)||[];var modelDecl=declaration.value;for(var _i=0,colors_1=colors;_i<colors_1.length;_i++){var color=colors_1[_i];var colorValue=void 0;if(/var\(.*?\)/.test(color)){// const name = color.match(/var\((.*?)\)/)[1];
// const value = getVariableValue(name, context.data);
// if (value) {
//   const match = matchColor(value);
//   if (match) {
//     colorValue = match[0];
//   }
// }
}else{colorValue=color;}if(!colorValue){continue;}var colorIndex=modelDecl.indexOf(color);// ensure that color isn't there in case there is another instance
// in the string -- want to go through each one.
modelDecl=modelDecl.replace(color,"_".repeat(color.length));// Color(color)
// const {color: [r, g, b], valpha: a } = Color(color);
var colorStart=declaration.valueRange.start.pos+colorIndex;var rgba=maybeParseColor(colorValue);if(rgba){info.colors.push({color:rgba,start:colorStart,end:colorStart+color.length});}}};var matchColor=function(value){return value.match(/#[a-zA-Z0-9]+|(rgba|rgb|hsl|hsla|var)\(.*?\)/g)||value.match(CSS_COLOR_NAME_REGEXP);};var maybeParseColor=function(value){try{var _a=color(value),_b=_a.color,red=_b[0],green=_b[1],blue=_b[2],alpha=_a.valpha;return{red:red/255,green:green/255,blue:blue/255,alpha:alpha};}catch(e){console.error(e.stack);}return null;};
// EXTERNAL MODULE: ../paperclip-common/index.js
var paperclip_common = __webpack_require__(28180);
;// CONCATENATED MODULE: ../paperclip-monaco/lib/languages/service/channel.js
var documentColors=(0,paperclip_common.remoteChannel)("documentColors");var updateDocument=(0,paperclip_common.remoteChannel)("updateDocument");var getSuggestions=(0,paperclip_common.remoteChannel)("getSuggestions");
// EXTERNAL MODULE: ../paperclip-autocomplete/index.js
var paperclip_autocomplete = __webpack_require__(86574);
;// CONCATENATED MODULE: ../paperclip-monaco/lib/languages/service/autocomplete.js
var autocomplete_getSuggestions=function(text,data,ast,imports){var content={data:data,ast:ast,imports:imports};var context=(0,paperclip_autocomplete.getSuggestionContext)(text);switch(context.kind){case paperclip_autocomplete.SuggestContextKind.HTML_STRING_ATTRIBUTE_VALUE:return getAttrValueSuggestions(content,context);}return[];};var getAttrValueSuggestions=function(content,context){if(/^(class|className)$/.test(context.attributeName)){return getClassNameSuggestions(content);}return[];};var getClassNameSuggestions=function(content){return[];};
;// CONCATENATED MODULE: ../paperclip-monaco/lib/languages/service/worker.js
var __awaiter=undefined&&undefined.__awaiter||function(thisArg,_arguments,P,generator){function adopt(value){return value instanceof P?value:new P(function(resolve){resolve(value);});}return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator["throw"](value));}catch(e){reject(e);}}function step(result){result.done?resolve(result.value):adopt(result.value).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());});};var __generator=undefined&&undefined.__generator||function(thisArg,body){var _={label:0,sent:function(){if(t[0]&1)throw t[1];return t[1];},trys:[],ops:[]},f,y,t,g;return g={next:verb(0),"throw":verb(1),"return":verb(2)},typeof Symbol==="function"&&(g[Symbol.iterator]=function(){return this;}),g;function verb(n){return function(v){return step([n,v]);};}function step(op){if(f)throw new TypeError("Generator is already executing.");while(_)try{if(f=1,y&&(t=op[0]&2?y["return"]:op[0]?y["throw"]||((t=y["return"])&&t.call(y),0):y.next)&&!(t=t.call(y,op[1])).done)return t;if(y=0,t)op=[op[0]&2,t.value];switch(op[0]){case 0:case 1:t=op;break;case 4:_.label++;return{value:op[1],done:false};case 5:_.label++;y=op[1];op=[0];continue;case 7:op=_.ops.pop();_.trys.pop();continue;default:if(!(t=_.trys,t=t.length>0&&t[t.length-1])&&(op[0]===6||op[0]===2)){_=0;continue;}if(op[0]===3&&(!t||op[1]>t[0]&&op[1]<t[3])){_.label=op[1];break;}if(op[0]===6&&_.label<t[1]){_.label=t[1];t=op;break;}if(t&&_.label<t[2]){_.label=t[2];_.ops.push(op);break;}if(t[2])_.ops.pop();_.trys.pop();continue;}op=body.call(thisArg,_);}catch(e){op=[6,e];y=0;}finally{f=t=0;}if(op[0]&5)throw op[1];return{value:op[0]?op[1]:void 0,done:true};}};var init=function(){var channel=new BroadcastChannel("@paperclipui/core");var asts={};var _resolveAst=function(){};var _resolveLoadedData=function(){};var adapter=(0,paperclip_common.workerAdapter)(self);documentColors(adapter).listen(function(_a){var uri=_a.uri;return __awaiter(void 0,void 0,void 0,function(){var _b;return __generator(this,function(_c){switch(_c.label){case 0:_b=collectASTInfo;return[4/*yield*/,waitForAST(uri)];case 1:return[2/*return*/,_b.apply(void 0,[_c.sent()]).colors];}});});});updateDocument(adapter).listen(function(_a){var uri=_a.uri,value=_a.value;return __awaiter(void 0,void 0,void 0,function(){return __generator(this,function(_b){channel.postMessage((0,paperclip_utils.previewContent)({uri:uri,value:value}));return[2/*return*/];});});});getSuggestions(adapter).listen(function(_a){var uri=_a.uri,text=_a.text;return __awaiter(void 0,void 0,void 0,function(){var _b,data,imports,ast;return __generator(this,function(_c){switch(_c.label){case 0:return[4/*yield*/,getLoadedData(uri)];case 1:_b=_c.sent().payload,data=_b.data,imports=_b.imports,ast=_b.ast;return[2/*return*/,autocomplete_getSuggestions(text,data,ast,imports)];}});});});var waitForAST=function(uri){if(asts[uri]){return Promise.resolve(asts[uri]);}else{return new Promise(function(resolve){channel.postMessage((0,paperclip_utils.astRequested)({uri:uri}));_resolveAst=resolve;});}};var getLoadedData=function(uri){return new Promise(function(resolve){channel.postMessage((0,paperclip_utils.loadedDataRequested)({uri:uri}));_resolveLoadedData=resolve;});};var handleEngineAction=function(action){if(action.type===paperclip_utils.BasicPaperclipActionType.AST_EMITTED){_resolveAst(asts[action.payload.uri]=action.payload.content);}else if(action.type===paperclip_utils.BasicPaperclipActionType.LOADED_DATA_EMITTED){_resolveLoadedData(action);}};channel.onmessage=function(event){handleEngineAction(event.data);};};init();
})();

module.exports = __webpack_exports__;
/******/ })()
;