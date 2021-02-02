const  getBrowser = () => {
    const ua = navigator.userAgent;
    let browser = {};

	const getFirstMatch = (regex) => {
		const match = ua.match(regex);
		return (match && match.length > 1 && match[1]) || '';
	}

	const getSecondMatch = (regex) => {
		const match = ua.match(regex);
		return (match && match.length > 1 && match[2]) || '';
	}

	// start detecting
	if (/opera|opr/i.test(ua)) {
		browser = {
			name: 'Opera',
			type: 'opera',
			version: getFirstMatch(/version\/(\d+(\.\d+)?)/i) || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
		}
	}  else if (/msie|trident/i.test(ua)) {
		browser = {
			name: 'Internet Explorer',
			type: 'msie',
			version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
		}
	} else if (/chrome.+? edge/i.test(ua)) {
		browser = {
			name: 'Microsft Edge',
			type: 'msedge',
			version: getFirstMatch(/edge\/(\d+(\.\d+)?)/i)
		}
	} else if (/chrome|crios|crmo/i.test(ua)) {
		browser = {
			name: 'Chrome',
			type: 'chrome',
			version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
		}
	} else if (/firefox/i.test(ua)) {
		browser = {
			name: 'Firefox',
			type: 'firefox',
			version: getFirstMatch(/(?:firefox)[ \/](\d+(\.\d+)?)/i)
		}
	} else if (!(/like android/i.test(ua)) && /android/i.test(ua)) {
		browser = {
			name: 'Android',
			type: 'android',
			version: getFirstMatch(/version\/(\d+(\.\d+)?)/i)
		}
	} else if (/safari/i.test(ua)) {
		browser = {
			name: 'Safari',
			type: 'safari',
			version: getFirstMatch(/version\/(\d+(\.\d+)?)/i)
		}
	} else {
		browser = {
			name: getFirstMatch(/^(.*)\/(.*) /),
			version: getSecondMatch(/^(.*)\/(.*) /)
		}
		browser.type = browser.name.toLowerCase().replace(/\s/g, '');
	}
	return browser;
}

export {
    getBrowser
};
