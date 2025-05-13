document.querySelectorAll('.form-navigation li').forEach(item => {
    item.addEventListener('click', () => {
        // Step 1: Highlight the clicked navigation item
        document.querySelectorAll('.form-navigation li').forEach(nav => {
            nav.classList.remove('active');
        });
        item.classList.add('active');

        // Step 2: Determine the corresponding section to display
        const sectionId = item.id.replace('-info', '-information');

        // Step 3: Hide all sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.style.display = 'none';
        });

        // Step 4: Display the corresponding section
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.style.display = 'block';
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
                sections[index].style.display = 'none';
                sections[index - 1].style.display = 'block';

                // Update active navigation item
                document.querySelectorAll('.form-navigation li').forEach(nav => {
                    nav.classList.remove('active');
                });
                document.querySelectorAll('.form-navigation li')[index - 1].classList.add('active');
            }
        });
    }

    // Show the next section
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (index < sections.length - 1) {
                sections[index].style.display = 'none';
                sections[index + 1].style.display = 'block';

                // Update active navigation item
                document.querySelectorAll('.form-navigation li').forEach(nav => {
                    nav.classList.remove('active');
                });
                document.querySelectorAll('.form-navigation li')[index + 1].classList.add('active');
            }
        });
    }
});

// Function to calculate and update the progress bar
function updateProgressBar() {
    const inputs = document.querySelectorAll('.form-control');
    const totalInputs = inputs.length;
    let filledInputs = 0;

    inputs.forEach(input => {
        if (input && input.value !== undefined && input.value.trim() !== "") {
            filledInputs++;
        }
    });

    const progressPercentage = Math.round((filledInputs / totalInputs) * 100);

    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressBarText = document.getElementById('progress-bar-text');
    progressBarFill.style.width = `${progressPercentage}%`;
    progressBarText.textContent = `${progressPercentage}%`;
}

// Add event listeners to all inputs to detect changes
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', updateProgressBar);
});

// Initialize the progress bar on page load
updateProgressBar();

// Function to check if all fields in a section are filled
function checkSectionCompletion(sectionId) {
    const section = document.getElementById(sectionId);
    const inputs = section.querySelectorAll('.form-control');
    return Array.from(inputs).every(input => input.value.trim() !== "");
}

// Function to update the done icon for a specific section
function updateDoneIconForSection(sectionId) {
    const navItem = document.querySelector(`.form-navigation li[id="${sectionId.replace('-information', '-info')}"]`);
    if (navItem) {
        const doneIcon = navItem.querySelector('.done-icon');
        if (checkSectionCompletion(sectionId)) {
            doneIcon.style.display = 'inline';
        } else {
            doneIcon.style.display = 'none';
        }
    }
}

// Add event listeners to all inputs to dynamically update the specific section's icon
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', function() {
        const section = input.closest('.form-section');
        if (section) {
            updateDoneIconForSection(section.id);
        }
    });
});

// Initialize done icons for all sections on page load
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.form-section').forEach(section => {
        updateDoneIconForSection(section.id);
    });
}); 