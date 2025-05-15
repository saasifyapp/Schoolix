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




////////////////////////////////////// TEACHER FORM POPULATION //////////////////////////////

//////////////////////////////// COMMON FUNCTIONS //////////////////////////

// Function to display loading suggestions
function showLoading(suggestionsContainer) {
    suggestionsContainer.innerHTML = ''; 
    const loadingItem = document.createElement('div');
    loadingItem.classList.add('suggestion-item', 'no-results');
    loadingItem.textContent = 'Loading...';
    suggestionsContainer.appendChild(loadingItem);
    suggestionsContainer.style.display = "block";
}

// Utility function to display no results found message
function showNoResults(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const noResultsItem = document.createElement('div');
    noResultsItem.classList.add('suggestion-item', 'no-results');
    noResultsItem.textContent = 'No results found';
    suggestionsContainer.appendChild(noResultsItem);
}


/////////////////////////////////////////// ALL NUMERIC VALIDATIONS //////////////////////////

// General function to validate input
function validateInput(inputId, errorId, length) {
    const inputField = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    const value = inputField.value;

    errorElement.innerHTML = ''; // Clear previous error message
    inputField.classList.remove('error'); // Remove existing error styles

    // Check for any spaces
    if (/\s/.test(value)) {
        errorElement.style.display = 'block'; // Show error message container
        errorElement.innerHTML = 'Input must not contain any spaces.';
        inputField.classList.add('error'); // Apply error styles
        return false;
    }

    // Length Check
    if (value.length !== length && value.length !== 0) {
        errorElement.style.display = 'block'; // Show error message container
        errorElement.innerHTML = `Input must be exactly ${length} characters long.`;
        inputField.classList.add('error'); // Apply error styles
        return false;
    }

    // Numeric Check
    if (!/^\d*$/.test(value)) {
        errorElement.style.display = 'block'; // Show error message container
        errorElement.innerHTML = 'Input must contain only numeric digits.';
        inputField.classList.add('error'); // Apply error styles
        return false;
    }

    inputField.classList.remove('error'); // Remove error styles on success
    errorElement.style.display = 'none'; // Hide error message container on success
    return true;
}

// Function to add validation listeners and remove spaces in real-time
function addValidationListeners(inputId, errorId, length) {
    const inputField = document.getElementById(inputId);

    inputField.addEventListener('input', function () {
        inputField.value = inputField.value.replace(/\s/g, ''); // Remove any spaces
        validateInput(inputId, errorId, length);
    });

    inputField.addEventListener('blur', function () {
        if (validateInput(inputId, errorId, length)) {
            document.getElementById(errorId).style.display = 'none';
        }
    });
}

// Add event listeners for each field
addValidationListeners('mobileNo', 'mobileNoError', 10);
addValidationListeners('aadhaar', 'aadhaarError', 12);
addValidationListeners('pinCode', 'pinCodeError', 6);

addValidationListeners('guardianContact', 'guardianContactError', 10);

addValidationListeners('experience', 'experienceError', 2);

//addValidationListeners('salaryPerMonth', 'salaryError', 5);


////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////// ALL NAME VALIDATION //////////////////////

// General function to validate name fields
function validateNameInput(inputId, errorId) {
    const inputField = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    const value = inputField.value;

    errorElement.innerHTML = ''; // Clear previous error message
    inputField.classList.remove('error'); // Remove existing error styles

    // Check for any spaces (leading, trailing, or internal)
    if (/\s/.test(value)) {
        errorElement.style.display = 'block'; // Show error message container
        errorElement.innerHTML = 'Name must not contain any spaces.';
        inputField.classList.add('error'); // Apply error styles
        return false;
    }

    // Check for special characters or numbers
    if (/[^a-zA-Z]/.test(value)) {
        errorElement.style.display = 'block'; // Show error message container
        errorElement.innerHTML = 'Name must not contain special characters or numbers.';
        inputField.classList.add('error'); // Apply error styles
        return false;
    }

    inputField.classList.remove('error'); // Remove error styles on success
    errorElement.style.display = 'none'; // Hide error message container on success
    return true;
}

// Function to add event listeners for name inputs
function addNameValidationListeners(inputId, errorId) {
    const inputField = document.getElementById(inputId);

    inputField.addEventListener('input', function () {
        validateNameInput(inputId, errorId);
    });

    inputField.addEventListener('blur', function () {
        if (validateNameInput(inputId, errorId)) {
            document.getElementById(errorId).style.display = 'none';
        }
    });
}

// Add event listeners for name fields
addNameValidationListeners('firstName', 'firstNameError');
addNameValidationListeners('middleName', 'middleNameError');
addNameValidationListeners('lastName', 'lastNameError');


//addNameValidationListeners('guardianFullName', 'guardianFullNameError');

/////////////////////////////////////////////////////////////
