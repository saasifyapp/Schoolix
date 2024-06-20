class BootstrapContainer extends HTMLElement {
    constructor() {
        super();

        // Attach a shadow root to the element
        const shadowRoot = this.attachShadow({ mode: 'open' });

        // Include Bootstrap CSS
        const bootstrapLink = document.createElement('link');
        bootstrapLink.setAttribute('rel', 'stylesheet');
        bootstrapLink.setAttribute('href', 'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css');
        
        // Create a style element to define custom styles if needed
        const style = document.createElement('style');
        style.textContent = `
            /* Add any custom styles here */
            
        `;

        // Attach the bootstrap link and style to the shadow DOM
        shadowRoot.appendChild(bootstrapLink);
        shadowRoot.appendChild(style);

        // Add a slot for the container content
        const slot = document.createElement('slot');
        shadowRoot.appendChild(slot);
    }
}

// Define the new element
customElements.define('bootstrap-container', BootstrapContainer);
