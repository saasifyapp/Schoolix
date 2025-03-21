function printContent() {
    window.print();
}

document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector(".content-table");
    if (table) { // Check if table exists
        const rowCount = table.querySelectorAll("tbody tr").length;
        table.style.setProperty("--row-count", rowCount);
    }
});

function adjustTableFontSize() {
    const table = document.querySelector('.content-table');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rowCount = parseInt(getComputedStyle(table).getPropertyValue('--row-count')) || 0;
    if (rowCount === 0) return;

    // Get the height of tc-content (60% of viewport height)
    const tcContent = document.querySelector('.tc-content');
    const tcContentHeight = tcContent.getBoundingClientRect().height;

    // Fixed header height (40px as per your CSS)
    const headerHeight = 40;

    // Calculate ideal row height
    const availableHeight = tcContentHeight - headerHeight;
    const idealRowHeight = availableHeight / rowCount;

    // Define minimum acceptable row height (adjustable)
    const minRowHeight = 20; // Minimum height for readability (adjust as needed)

    // Default font size from your CSS
    let fontSize = 14; // Starting font size for screen (from .content-table)

    // If row height is below minimum, adjust font size
    if (idealRowHeight < minRowHeight) {
        // Calculate how much to scale down font size
        const scaleFactor = idealRowHeight / minRowHeight;
        fontSize = Math.max(8, fontSize * scaleFactor); // Minimum font size of 8px

        // Apply font size to all th and td elements
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
            cell.style.fontSize = `${fontSize}px`;
        });
    } else {
        // Reset to default font size if row height is sufficient
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
            cell.style.fontSize = `${fontSize}px`; // Default 14px for screen
        });
    }

    // For print, override with smaller font size if needed
    if (window.matchMedia('print').matches) {
        const printFontSize = Math.min(fontSize, 12); // Cap at 12px for print (from your CSS)
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
            cell.style.fontSize = `${printFontSize}px`;
        });
    }
}

// Adjust school name font size (single line)
function adjustSchoolNameFontSize() {
    const container = document.querySelector('.school-name-container');
    if (!container) return; // Exit if container not found
    const heading = container.querySelector('h1');
    if (!heading) return; // Exit if heading not found
    const containerWidth = container.getBoundingClientRect().width;
    let fontSize = 24;
    heading.style.fontSize = `${fontSize}px`;
    heading.style.overflow = 'visible';

    while (heading.scrollWidth > containerWidth && fontSize > 10) {
        fontSize -= 0.5;
        heading.style.fontSize = `${fontSize}px`;
    }

    if (heading.scrollWidth > containerWidth) {
        heading.style.fontSize = `${fontSize - 1}px`;
    }
}

// Adjust address font size (two lines with <br>)
function adjustAddressFontSize() {
    const container = document.querySelector('.address-container');
    if (!container) return; // Exit if container not found
    const address = container.querySelector('p');
    if (!address) return; // Exit if address not found
    const containerWidth = container.getBoundingClientRect().width;
    let fontSize = 16;
    address.style.fontSize = `${fontSize}px`;
    address.style.overflow = 'hidden';

    const lineHeight = parseFloat(getComputedStyle(address).lineHeight) || 1.2 * fontSize;
    const maxHeight = lineHeight * 2;

    while ((address.scrollWidth > containerWidth || address.scrollHeight > maxHeight) && fontSize > 8) {
        fontSize -= 0.5;
        address.style.fontSize = `${fontSize}px`;
    }

    if (address.scrollWidth > containerWidth || address.scrollHeight > maxHeight) {
        address.style.fontSize = `${fontSize - 1}px`;
    }
}

// Adjust additional details font size (one line per <p>)
function adjustAdditionalDetailsFontSize() {
    const containers = [
        document.querySelectorAll('.left-container p'),
        document.querySelectorAll('.right-container p')
    ].flat();

    if (containers.length === 0) return; // Exit if no <p> elements found

    containers.forEach(text => {
        if (!text || !text.parentElement) return; // Skip if text or parent is undefined
        const containerWidth = text.parentElement.getBoundingClientRect().width;
        let fontSize = 14;
        text.style.fontSize = `${fontSize}px`;
        text.style.overflow = 'hidden';

        while (text.scrollWidth > containerWidth && fontSize > 8) {
            fontSize -= 0.5;
            text.style.fontSize = `${fontSize}px`;
        }

        if (text.scrollWidth > containerWidth) {
            text.style.fontSize = `${fontSize - 1}px`;
        }
    });
}

function adjustAuthenticityFontSize() {
    const container = document.querySelector('.authenticity-container');
    if (!container) return;
    const text = container.querySelector('p');
    if (!text) return;
    const containerWidth = container.getBoundingClientRect().width;
    let fontSize = 16;
    text.style.fontSize = `${fontSize}px`;
    text.style.overflow = 'hidden';

    while (text.scrollWidth > containerWidth && fontSize > 8) {
        fontSize -= 0.5;
        text.style.fontSize = `${fontSize}px`;
    }

    if (text.scrollWidth > containerWidth) {
        text.style.fontSize = `${fontSize - 1}px`;
    }
}

// Adjust date-signature font size (one line per <p>)
function adjustDateSignatureFontSize() {
    const containers = [
        document.querySelectorAll('.date-container p'),
        document.querySelectorAll('.signature-container p')
    ].flat();

    if (containers.length === 0) return;

    containers.forEach(text => {
        if (!text || !text.parentElement) return;
        const containerWidth = text.parentElement.getBoundingClientRect().width;
        let fontSize = 14;
        text.style.fontSize = `${fontSize}px`;
        text.style.overflow = 'hidden';

        while (text.scrollWidth > containerWidth && fontSize > 8) {
            fontSize -= 0.5;
            text.style.fontSize = `${fontSize}px`;
        }

        if (text.scrollWidth > containerWidth) {
            text.style.fontSize = `${fontSize - 1}px`;
        }
    });
}

// Adjust warning text font size (two lines with <br>)
function adjustWarningFontSize() {
    const container = document.querySelector('.warning-container');
    if (!container) return;
    const text = container.querySelector('p');
    if (!text) return;
    const containerWidth = container.getBoundingClientRect().width;
    let fontSize = 14;
    text.style.fontSize = `${fontSize}px`;
    text.style.overflow = 'hidden';

    const lineHeight = parseFloat(getComputedStyle(text).lineHeight) || 1.2 * fontSize;
    const maxHeight = lineHeight * 2;

    while ((text.scrollWidth > containerWidth || text.scrollHeight > maxHeight) && fontSize > 8) {
        fontSize -= 0.5;
        text.style.fontSize = `${fontSize}px`;
    }

    if (text.scrollWidth > containerWidth || text.scrollHeight > maxHeight) {
        text.style.fontSize = `${fontSize - 1}px`;
    }
}

// Run all adjustments
function adjustAll() {
    adjustSchoolNameFontSize();
    adjustAddressFontSize();
    adjustAdditionalDetailsFontSize();
    adjustAuthenticityFontSize();
    adjustDateSignatureFontSize();
    adjustWarningFontSize();
    adjustTableFontSize(); // Add this line
}

window.addEventListener('load', adjustAll);
window.addEventListener('resize', adjustAll);
window.addEventListener('beforeprint', adjustAll);
window.addEventListener('afterprint', adjustAll);

const printMedia = window.matchMedia('print');
printMedia.addEventListener('change', (e) => {
    if (e.matches) {
        adjustAll();
    } else {
        adjustAll();
    }
});