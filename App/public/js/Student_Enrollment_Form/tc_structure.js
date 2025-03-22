function printContent() {
    if (document.readyState === "complete") {
        console.log("Running adjustAll before print");
        adjustAll();
        setTimeout(() => {
            document.body.offsetHeight;
            adjustAll();
            window.print();
        }, 200);
    } else {
        window.addEventListener("load", () => {
            console.log("Running adjustAll before print (after DOM load)");
            adjustAll();
            setTimeout(() => {
                document.body.offsetHeight;
                adjustAll();
                window.print();
            }, 200);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const table = document.querySelector(".content-table");
    if (table) {
        const rowCount = table.querySelectorAll("tbody tr").length;
        table.style.setProperty("--row-count", rowCount);
    }
});

function adjustTableFontSize() {
    const table = document.querySelector(".content-table");
    if (!table) return;
    const cells = table.querySelectorAll("td, th");
    if (cells.length === 0) return;

    cells.forEach((cell) => {
        const containerWidth = cell.getBoundingClientRect().width;
        let fontSize = 14;
        cell.style.fontSize = `${fontSize}px`;

        while (cell.scrollWidth > containerWidth && fontSize > 8) {
            fontSize -= 0.5;
            cell.style.fontSize = `${fontSize}px`;
        }

        if (cell.scrollWidth > containerWidth) {
            fontSize -= 1;
        }

        const minFontSize = 12;
        const adjustedFontSize = Math.max(fontSize, minFontSize);
        cell.style.fontSize = `${adjustedFontSize}px`;

        if (window.matchMedia("print").matches) {
            const finalFontSize = Math.min(adjustedFontSize, 14);
            cell.style.fontSize = `${finalFontSize}px !important`;
            console.log("Print Font Size (Table Cell):", finalFontSize);
        }
    });
}

function adjustSchoolNameFontSize() {
    const container = document.querySelector(".school-name-container");
    if (!container) return;
    const heading = container.querySelector("h1");
    if (!heading) return;
    const containerWidth = container.getBoundingClientRect().width;
    let fontSize = 30;
    heading.style.fontSize = `${fontSize}px`;
    heading.style.overflow = "visible";

    while (heading.scrollWidth > containerWidth && fontSize > 10) {
        fontSize -= 0.5;
        heading.style.fontSize = `${fontSize}px`;
    }

    if (heading.scrollWidth > containerWidth) {
        fontSize -= 1;
    }

    const minFontSize = 24;
    const adjustedFontSize = Math.max(fontSize, minFontSize);
    heading.style.fontSize = `${adjustedFontSize}px`;

    if (window.matchMedia("print").matches) {
        const finalFontSize = Math.min(adjustedFontSize, 30);
        heading.style.fontSize = `${finalFontSize}px !important`;
        console.log("Print Font Size (School Name):", finalFontSize);
    }
}

function adjustAddressAndAdditionalDetailsFontSize() {
    const addressContainer = document.querySelector(".address-container");
    const address = addressContainer ? addressContainer.querySelector("p") : null;
    const additionalDetailsContainers = [
        document.querySelectorAll(".left-container p"),
        document.querySelectorAll(".right-container p"),
    ]
        .flat()
        .filter((text) => text !== null && text !== undefined);

    if (!address && additionalDetailsContainers.length === 0) return;

    let smallestFontSize = 16;

    if (address && addressContainer) {
        const containerWidth = addressContainer.getBoundingClientRect().width;
        let fontSize = 16;
        address.style.fontSize = `${fontSize}px`;
        address.style.overflow = "hidden";

        const computedStyle = getComputedStyle(address);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 1.4 * fontSize;
        const maxHeight = lineHeight * 2.2;

        console.log("Address - Font Size:", fontSize);
        console.log("Address - Line Height:", lineHeight);
        console.log("Address - Max Height:", maxHeight);
        console.log("Address - Scroll Height:", address.scrollHeight);
        console.log("Address - Scroll Width:", address.scrollWidth);
        console.log("Address - Container Width:", containerWidth);

        while (address.scrollWidth > containerWidth && fontSize > 8) {
            fontSize -= 0.5;
            address.style.fontSize = `${fontSize}px`;
        }

        if (address.scrollHeight > maxHeight * 1.2 && fontSize > 8) {
            while (address.scrollHeight > maxHeight && fontSize > 8) {
                fontSize -= 0.5;
                address.style.fontSize = `${fontSize}px`;
            }
        }

        if (address.scrollWidth > containerWidth || address.scrollHeight > maxHeight) {
            fontSize -= 1;
        }

        smallestFontSize = Math.min(smallestFontSize, fontSize);
    }

    additionalDetailsContainers.forEach((text) => {
        if (!text || !text.parentElement) return;
        const containerWidth = text.parentElement.getBoundingClientRect().width;
        let fontSize = 16;
        text.style.fontSize = `${fontSize}px`;
        text.style.overflow = "hidden";

        while (text.scrollWidth > containerWidth && fontSize > 8) {
            fontSize -= 0.5;
            text.style.fontSize = `${fontSize}px`;
        }

        if (text.scrollWidth > containerWidth) {
            fontSize -= 1;
        }

        smallestFontSize = Math.min(smallestFontSize, fontSize);
    });

    const minFontSize = 14;
    const adjustedFontSize = Math.max(smallestFontSize, minFontSize);

    if (address) {
        address.style.fontSize = `${adjustedFontSize}px`;
    }
    additionalDetailsContainers.forEach((text) => {
        if (text && text.style) {
            text.style.fontSize = `${adjustedFontSize}px`;
        }
    });

    if (window.matchMedia("print").matches) {
        const finalFontSize = Math.min(adjustedFontSize, 16);
        console.log("Print Font Size (Address & Additional Details):", finalFontSize);
        if (address) {
            address.style.fontSize = `${finalFontSize}px !important`;
        }
        additionalDetailsContainers.forEach((text) => {
            if (text && text.style) {
                text.style.fontSize = `${finalFontSize}px !important`;
            }
        });
    }
}

function adjustCertificateTitleFontSize() {
    const container = document.querySelector(".certificate-title-container");
    if (!container) return;
    const heading = container.querySelector("h2");
    if (!heading) return;
    const containerWidth = container.getBoundingClientRect().width;
    let fontSize = window.matchMedia("print").matches ? 24 : 24;
    heading.style.fontSize = `${fontSize}px`;
    heading.style.overflow = "visible";

    while (heading.scrollWidth > containerWidth && fontSize > 10) {
        fontSize -= 0.5;
        heading.style.fontSize = `${fontSize}px`;
    }

    if (heading.scrollWidth > containerWidth) {
        fontSize -= 1;
    }

    const minFontSize = 20;
    const adjustedFontSize = Math.max(fontSize, minFontSize);
    heading.style.fontSize = `${adjustedFontSize}px`;

    if (window.matchMedia("print").matches) {
        const finalFontSize = Math.min(adjustedFontSize, 24);
        heading.style.fontSize = `${finalFontSize}px !important`;
        console.log("Print Font Size (Certificate Title):", finalFontSize);
    }
}

function adjustAuthenticityFontSize() {
    const container = document.querySelector(".authenticity-container");
    if (!container) return;
    const text = container.querySelector("p");
    if (!text) return;
    const containerWidth = container.getBoundingClientRect().width;
    let fontSize = window.matchMedia("print").matches ? 16 : 16;
    text.style.fontSize = `${fontSize}px`;
    text.style.overflow = "hidden";

    while (text.scrollWidth > containerWidth && fontSize > 8) {
        fontSize -= 0.5;
        text.style.fontSize = `${fontSize}px`;
    }

    if (text.scrollWidth > containerWidth) {
        fontSize -= 1;
    }

    const minFontSize = 14;
    const adjustedFontSize = Math.max(fontSize, minFontSize);
    text.style.fontSize = `${adjustedFontSize}px`;

    if (window.matchMedia("print").matches) {
        const finalFontSize = Math.min(adjustedFontSize, 16);
        text.style.fontSize = `${finalFontSize}px !important`;
        console.log("Print Font Size (Authenticity):", finalFontSize);
    }
}

function adjustDateSignatureFontSize() {
    const containers = [
        document.querySelectorAll(".date-container p"),
        document.querySelectorAll(".signature-container p"),
    ].flat();

    if (containers.length === 0) return;

    containers.forEach((text) => {
        if (!text || !text.parentElement) return;
        const containerWidth = text.parentElement.getBoundingClientRect().width;
        let fontSize = window.matchMedia("print").matches ? 14 : 14;
        text.style.fontSize = `${fontSize}px`;
        text.style.overflow = "hidden";

        while (text.scrollWidth > containerWidth && fontSize > 8) {
            fontSize -= 0.5;
            text.style.fontSize = `${fontSize}px`;
        }

        if (text.scrollWidth > containerWidth) {
            fontSize -= 1;
        }

        const minFontSize = 12;
        const adjustedFontSize = Math.max(fontSize, minFontSize);
        text.style.fontSize = `${adjustedFontSize}px`;

        if (window.matchMedia("print").matches) {
            const finalFontSize = Math.min(adjustedFontSize, 14);
            text.style.fontSize = `${finalFontSize}px !important`;
            console.log("Print Font Size (Date/Signature):", finalFontSize);
        }
    });
}

function adjustWarningFontSize() {
    const container = document.querySelector(".warning-container");
    if (!container) return;
    const text = container.querySelector("p");
    if (!text) return;
    const containerWidth = container.getBoundingClientRect().width;
    let fontSize = window.matchMedia("print").matches ? 14 : 14;
    text.style.fontSize = `${fontSize}px`;
    text.style.overflow = "hidden";

    const computedStyle = getComputedStyle(text);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 1.2 * fontSize;
    const maxHeight = lineHeight * 2.2;

    console.log("Warning - Font Size:", fontSize);
    console.log("Warning - Line Height:", lineHeight);
    console.log("Warning - Max Height:", maxHeight);
    console.log("Warning - Scroll Height:", text.scrollHeight);

    while (text.scrollWidth > containerWidth && fontSize > 8) {
        fontSize -= 0.5;
        text.style.fontSize = `${fontSize}px`;
    }

    if (text.scrollHeight > maxHeight * 1.2 && fontSize > 8) {
        while (text.scrollHeight > maxHeight && fontSize > 8) {
            fontSize -= 0.5;
            text.style.fontSize = `${fontSize}px`;
        }
    }

    if (text.scrollWidth > containerWidth || text.scrollHeight > maxHeight) {
        fontSize -= 1;
    }

    const minFontSize = 12;
    const adjustedFontSize = Math.max(fontSize, minFontSize);
    text.style.fontSize = `${adjustedFontSize}px`;

    if (window.matchMedia("print").matches) {
        const finalFontSize = Math.min(adjustedFontSize, 14);
        text.style.fontSize = `${finalFontSize}px !important`;
        console.log("Print Font Size (Warning):", finalFontSize);
    }
}

function adjustAll() {
    document.body.offsetHeight;
    adjustSchoolNameFontSize();
    adjustAddressAndAdditionalDetailsFontSize();
    adjustCertificateTitleFontSize();
    adjustAuthenticityFontSize();
    adjustDateSignatureFontSize();
    adjustWarningFontSize();
    adjustTableFontSize();
}

window.addEventListener("load", adjustAll);
window.addEventListener("resize", adjustAll);
window.addEventListener("beforeprint", adjustAll);
window.addEventListener("afterprint", adjustAll);

const printMedia = window.matchMedia("print");
printMedia.addListener((e) => {
    if (e.matches) {
        adjustAll();
    } else {
        adjustAll();
    }
});