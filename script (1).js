// DOM Elements
const temperatureInput = document.getElementById('temperature');
const convertBtn = document.getElementById('convertBtn');
const resultSection = document.getElementById('resultSection');
const resultValue = document.getElementById('resultValue');
const resultUnit = document.getElementById('resultUnit');
const errorMessage = document.getElementById('error-message');

// Temperature conversion functions
const temperatureConverter = {
    // Convert Celsius to Fahrenheit
    celsiusToFahrenheit: (celsius) => {
        return (celsius * 9/5) + 32;
    },
    
    // Convert Fahrenheit to Celsius
    fahrenheitToCelsius: (fahrenheit) => {
        return (fahrenheit - 32) * 5/9;
    },
    
    // Convert Celsius to Kelvin
    celsiusToKelvin: (celsius) => {
        return celsius + 273.15;
    },
    
    // Convert Kelvin to Celsius
    kelvinToCelsius: (kelvin) => {
        return kelvin - 273.15;
    },
    
    // Convert Fahrenheit to Kelvin
    fahrenheitToKelvin: (fahrenheit) => {
        const celsius = temperatureConverter.fahrenheitToCelsius(fahrenheit);
        return temperatureConverter.celsiusToKelvin(celsius);
    },
    
    // Convert Kelvin to Fahrenheit
    kelvinToFahrenheit: (kelvin) => {
        const celsius = temperatureConverter.kelvinToCelsius(kelvin);
        return temperatureConverter.celsiusToFahrenheit(celsius);
    }
};

// Get selected units
function getSelectedUnits() {
    const fromUnit = document.querySelector('input[name="fromUnit"]:checked').value;
    const toUnit = document.querySelector('input[name="toUnit"]:checked').value;
    return { fromUnit, toUnit };
}

// Validate input
function validateInput(value) {
    if (value === '' || value === null || value === undefined) {
        return { isValid: false, message: 'Please enter a temperature value.' };
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return { isValid: false, message: 'Please enter a valid number.' };
    }
    
    // Check for reasonable temperature ranges
    const { fromUnit } = getSelectedUnits();
    if (fromUnit === 'kelvin' && numValue < 0) {
        return { isValid: false, message: 'Kelvin cannot be negative (absolute zero is 0K).' };
    }
    
    if (fromUnit === 'celsius' && numValue < -273.15) {
        return { isValid: false, message: 'Temperature cannot be below absolute zero (-273.15°C).' };
    }
    
    if (fromUnit === 'fahrenheit' && numValue < -459.67) {
        return { isValid: false, message: 'Temperature cannot be below absolute zero (-459.67°F).' };
    }
    
    return { isValid: true, value: numValue };
}

// Convert temperature
function convertTemperature(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) {
        return value;
    }
    
    // First convert to Celsius as intermediate step
    let celsius;
    switch (fromUnit) {
        case 'celsius':
            celsius = value;
            break;
        case 'fahrenheit':
            celsius = temperatureConverter.fahrenheitToCelsius(value);
            break;
        case 'kelvin':
            celsius = temperatureConverter.kelvinToCelsius(value);
            break;
        default:
            throw new Error('Invalid from unit');
    }
    
    // Then convert from Celsius to target unit
    switch (toUnit) {
        case 'celsius':
            return celsius;
        case 'fahrenheit':
            return temperatureConverter.celsiusToFahrenheit(celsius);
        case 'kelvin':
            return temperatureConverter.celsiusToKelvin(celsius);
        default:
            throw new Error('Invalid to unit');
    }
}

// Format result
function formatResult(value, unit) {
    const roundedValue = Math.round(value * 100) / 100; // Round to 2 decimal places
    
    let unitSymbol;
    switch (unit) {
        case 'celsius':
            unitSymbol = '°C';
            break;
        case 'fahrenheit':
            unitSymbol = '°F';
            break;
        case 'kelvin':
            unitSymbol = 'K';
            break;
        default:
            unitSymbol = '';
    }
    
    return {
        value: roundedValue,
        unit: unitSymbol
    };
}

// Display result
function displayResult(value, unit) {
    const formatted = formatResult(value, unit);
    resultValue.textContent = formatted.value;
    resultUnit.textContent = formatted.unit;
    resultSection.style.display = 'block';
    
    // Add animation class for smooth appearance
    resultSection.classList.add('show');
}

// Hide result
function hideResult() {
    resultSection.style.display = 'none';
    resultSection.classList.remove('show');
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    hideResult();
}

// Clear error
function clearError() {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

// Main conversion function
function performConversion() {
    const inputValue = temperatureInput.value.trim();
    
    // Validate input
    const validation = validateInput(inputValue);
    if (!validation.isValid) {
        showError(validation.message);
        return;
    }
    
    clearError();
    
    // Get selected units
    const { fromUnit, toUnit } = getSelectedUnits();
    
    // Perform conversion
    try {
        const convertedValue = convertTemperature(validation.value, fromUnit, toUnit);
        displayResult(convertedValue, toUnit);
    } catch (error) {
        showError('An error occurred during conversion. Please try again.');
        console.error('Conversion error:', error);
    }
}

// Event Listeners
convertBtn.addEventListener('click', performConversion);

// Allow Enter key to trigger conversion
temperatureInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performConversion();
    }
});

// Clear error when user starts typing
temperatureInput.addEventListener('input', () => {
    if (errorMessage.style.display === 'block') {
        clearError();
    }
});

// Real-time conversion preview (optional enhancement)
let conversionTimeout;
temperatureInput.addEventListener('input', () => {
    clearTimeout(conversionTimeout);
    
    // Debounce the conversion to avoid too many calculations
    conversionTimeout = setTimeout(() => {
        const inputValue = temperatureInput.value.trim();
        const validation = validateInput(inputValue);
        
        if (validation.isValid && inputValue !== '') {
            const { fromUnit, toUnit } = getSelectedUnits();
            try {
                const convertedValue = convertTemperature(validation.value, fromUnit, toUnit);
                displayResult(convertedValue, toUnit);
            } catch (error) {
                // Silently handle errors for real-time preview
            }
        } else if (inputValue === '') {
            hideResult();
        }
    }, 500); // 500ms delay
});

// Update conversion when units change
document.querySelectorAll('input[name="fromUnit"], input[name="toUnit"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const inputValue = temperatureInput.value.trim();
        if (inputValue !== '') {
            performConversion();
        }
    });
});

// Prevent same unit conversion
document.querySelectorAll('input[name="toUnit"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const { fromUnit, toUnit } = getSelectedUnits();
        if (fromUnit === toUnit) {
            // Find the next available option
            const availableOptions = ['celsius', 'fahrenheit', 'kelvin'].filter(unit => unit !== fromUnit);
            const nextOption = availableOptions[0];
            
            // Uncheck current and check next option
            radio.checked = false;
            document.querySelector(`input[name="toUnit"][value="${nextOption}"]`).checked = true;
        }
    });
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input field
    temperatureInput.focus();
    
    // Add some visual feedback for the convert button
    convertBtn.addEventListener('mouseenter', () => {
        convertBtn.style.transform = 'translateY(-2px)';
    });
    
    convertBtn.addEventListener('mouseleave', () => {
        convertBtn.style.transform = 'translateY(0)';
    });
});

// Add keyboard navigation for radio buttons
document.querySelectorAll('.radio-label').forEach(label => {
    label.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const radio = label.querySelector('input[type="radio"]');
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        }
    });
    
    // Make radio labels focusable
    label.setAttribute('tabindex', '0');
});

// Add accessibility improvements
temperatureInput.setAttribute('aria-label', 'Temperature value to convert');
convertBtn.setAttribute('aria-label', 'Convert temperature');

// Add loading state for convert button (optional enhancement)
function setButtonLoading(loading) {
    if (loading) {
        convertBtn.disabled = true;
        convertBtn.querySelector('.btn-text').textContent = 'Converting...';
        convertBtn.querySelector('.btn-icon').textContent = '⏳';
    } else {
        convertBtn.disabled = false;
        convertBtn.querySelector('.btn-text').textContent = 'Convert';
        convertBtn.querySelector('.btn-icon').textContent = '→';
    }
} 