// Select all navigation items and add event listeners
document.querySelectorAll('.form-navigation li').forEach(item => {
    item.addEventListener('click', () => {
        // Step 1: Highlight the clicked navigation item
        document.querySelectorAll('.form-navigation li').forEach(nav => {
            nav.classList.remove('active'); // Remove active class from all items
        });
        item.classList.add('active'); // Add active class to the clicked item

        // Step 2: Determine the corresponding section to display
        const sectionId = item.id.replace('-info', '-information'); // Map navigation ID to section ID

        // Step 3: Hide all sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.style.display = 'none'; // Hide all form sections
        });

        // Step 4: Display the corresponding section
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.style.display = 'block'; // Show the matched section
        }
    });
});

// Add event listeners for navigation buttons
document.querySelectorAll('.form-section').forEach((section, index, sections) => {
    const prevButton = section.querySelector('.prev-button');
    const nextButton = section.querySelector('.next-button');

    // Show the previous section
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (index > 0) {
                sections[index].style.display = 'none'; // Hide current section
                sections[index - 1].style.display = 'block'; // Show previous section

                // Update active navigation item
                document.querySelectorAll('.form-navigation li').forEach(nav => {
                    nav.classList.remove('active'); // Remove active class from all items
                });
                document
                    .querySelectorAll('.form-navigation li')
                    [index - 1].classList.add('active'); // Set active class to the previous item
            }
        });
    }

    // Show the next section
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (index < sections.length - 1) {
                sections[index].style.display = 'none'; // Hide current section
                sections[index + 1].style.display = 'block'; // Show next section

                // Update active navigation item
                document.querySelectorAll('.form-navigation li').forEach(nav => {
                    nav.classList.remove('active'); // Remove active class from all items
                });
                document
                    .querySelectorAll('.form-navigation li')
                    [index + 1].classList.add('active'); // Set active class to the next item
            }
        });
    }
});


// Function to calculate and update the progress bar
function updateProgressBar() {
    const inputs = document.querySelectorAll('.form-control, textarea'); // Select all input and textarea fields
    const totalInputs = inputs.length; // Total number of inputs
    let filledInputs = 0;

    // Count the number of filled inputs
    inputs.forEach(input => {
        if (input.value.trim() !== "") {
            filledInputs++;
        }
    });

    // Calculate progress percentage
    const progressPercentage = Math.round((filledInputs / totalInputs) * 100);

    // Update progress bar fill and text
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressBarText = document.getElementById('progress-bar-text');
    progressBarFill.style.width = `${progressPercentage}%`;
    progressBarText.textContent = `${progressPercentage}%`;
}

// Add event listeners to all inputs to detect changes
document.querySelectorAll('.form-control, textarea').forEach(input => {
    input.addEventListener('input', updateProgressBar);
});

// Initialize the progress bar on page load
updateProgressBar();
