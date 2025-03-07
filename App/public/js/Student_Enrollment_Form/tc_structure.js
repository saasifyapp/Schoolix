document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[name="documentType"]');
    const dynamicContainer = document.getElementById('tc-layout');

    // Function to set the size of the dynamic container based on the selected size
    const setSize = (size) => {
        dynamicContainer.setAttribute('data-size', size);
    };

    // Add change event listeners to each radio button
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            setSize(this.value);
        });
    });

    // Set initial size based on the default selected radio button
    setSize(document.querySelector('input[name="documentType"]:checked').value);
});


document.addEventListener("DOMContentLoaded", function() {
    function adjustFontSize(element) {
        const parentWidth = element.parentElement.clientWidth;
        let fontSize = 2;  // Initial font size in em
        element.style.fontSize = fontSize + 'em';

        // Reduce font size until text fits within container
        while (element.scrollWidth > parentWidth && fontSize > 0.5) {
            fontSize -= 0.1;
            element.style.fontSize = fontSize + 'em';
        }
    }

    function adjustAllTextSizes() {
        const elements = document.querySelectorAll('.school-detail-text, .footer-section.details div, .footer-section.notice');
        elements.forEach(adjustFontSize);
    }

    window.addEventListener("resize", adjustAllTextSizes);
    adjustAllTextSizes();
});


