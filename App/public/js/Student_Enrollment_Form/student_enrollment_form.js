document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const formModeInput = document.getElementById('formMode');

    if (mode === 'update') {
        formModeInput.value = 'update';
    } else if (mode === 'enroll') {
        formModeInput.value = 'insert';
    } else {
        // Optionally handle other modes or set a default
        formModeInput.value = 'insert'; // Or whatever default mode you want
    }

    // For debugging purposes, log the form mode to the console
    if (formModeInput) {
        console.log("Form mode:", formModeInput.value);
    }
});


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
    // const nextButton = section.querySelector('.next-button');

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

    // // Show the next section
    // if (nextButton) {
    //     nextButton.addEventListener('click', () => {
    //         if (index < sections.length - 1) {
    //             // sections[index].style.display = 'none'; // Hide current section
    //             // sections[index + 1].style.display = 'block'; // Show next section

    //             // Update active navigation item
    //             document.querySelectorAll('.form-navigation li').forEach(nav => {
    //                 nav.classList.remove('active'); // Remove active class from all items
    //             });
    //             document
    //                 .querySelectorAll('.form-navigation li')
    //             [index + 1].classList.add('active'); // Set active class to the next item
    //         }
    //     });
    // }
});


// Function to calculate and update the progress bar
function updateProgressBar() {
    const inputs = document.querySelectorAll('.form-control, textarea'); // Select all input and textarea fields
    const totalInputs = inputs.length; // Total number of inputs
    let filledInputs = 0;

    // Count the number of filled inputs
    // inputs.forEach(input => {
    //     if (input.value.trim() !== "") {
    //         filledInputs++;
    //     }
    // });

    inputs.forEach(input => {
        if (input && input.value !== undefined && input.value.trim() !== "") {
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


// Function to check if all fields in a section are filled
function checkSectionCompletion(sectionId) {
    const section = document.getElementById(sectionId);
    const inputs = section.querySelectorAll('.form-control, textarea'); // Select all input and textarea fields
    return Array.from(inputs).every(input => input.value.trim() !== ""); // Check if all inputs are filled
}

// Function to update the done icon for navigation items
function updateDoneIcons() {
    document.querySelectorAll('.form-navigation li').forEach(item => {
        const sectionId = item.id.replace('-info', '-information'); // Map navigation ID to section ID
        const isComplete = checkSectionCompletion(sectionId); // Check if the section is complete
        const doneIcon = item.querySelector('.done-icon'); // Get the done icon for the current item

        if (isComplete) {
            doneIcon.style.display = 'inline'; // Show the done icon if the section is complete
        } else {
            doneIcon.style.display = 'none'; // Hide the done icon if the section is incomplete
        }
    });
}

// Add event listeners to all inputs to update the icons dynamically
document.querySelectorAll('.form-control, textarea').forEach(input => {
    input.addEventListener('input', updateDoneIcons);
});

// Initialize done icons on page load
updateDoneIcons();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
addValidationListeners('saralId', 'saralIdError', 19);
addValidationListeners('aaparId', 'aaparIdError', 12);
addValidationListeners('penId', 'penIdError', 11);
addValidationListeners('aadhaar', 'aadhaarError', 12);
addValidationListeners('studentContact', 'studentContactError', 10);
addValidationListeners('pinCode', 'pinCodeError', 6);

addValidationListeners('fatherContactNumber', 'fatherContactNumberError', 10);
addValidationListeners('motherContactNumber', 'motherContactNumberError', 10);
addValidationListeners('guardianContact', 'guardianContactError', 10);
addValidationListeners('guardianpinCode', 'guardianpinCodeError', 6);

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
addNameValidationListeners('fatherMiddleName', 'fatherMiddleNameError');
addNameValidationListeners('motherFirstName', 'motherFirstNameError'); // Add this line


/////////////////////////////////// STUDENT INFORMATION SECTION ////////////////////////

//////////////////////// AUTOMATIC FULL NAME ////////////////////////

// Function to concatenate full name from firstName, middleName, lastName fields
function updateFullName() {
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();

    // Concatenate the names with a space in between, handling cases where middleName might be empty
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');

    document.getElementById('fullName').value = fullName;
}

// Function to add event listeners for name inputs and update full name
function addFullNameUpdateListeners() {
    const nameFields = ['firstName', 'middleName', 'lastName'];

    nameFields.forEach(field => {
        document.getElementById(field).addEventListener('input', function () {
            updateFullName();
        });
    });
}

// Add event listeners to update full name when any name fields are modified
addFullNameUpdateListeners();



////////////////////////////////// AUTOMATIC AGE  ///////////////////////////////////////////

// Function to validate date
function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

// Function to check if the date is not in the future
function isPastDate(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    return birthDate <= today;
}

// Function to calculate age based on date of birth
function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust age if birth date hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Function to update age based on the date of birth
function updateAge() {
    const dob = document.getElementById('dob').value;
    const birthDate = new Date(dob);
    if (isValidDate(birthDate) && isPastDate(dob)) {
        const age = calculateAge(dob);
        document.getElementById('age').value = age; // Update age field
    } else {
        document.getElementById('age').value = "Invalid Age"; // Display invalid age if DOB is invalid or in the future
    }
}
// Add an event listener to the date of birth field
document.getElementById('dob').addEventListener('input', updateAge);



////////////////////////////// PLACE OF BIRTH SUGGESTIONS ////////////////////

// Suggestions added with contact and address details inputs //

///////////////////////////// GENDER SUGGESTIONS ///////////////////////////////
// Gender field suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const genderInput = document.getElementById('gender');
    const genderSuggestionsContainer = document.getElementById('genderSuggestions');
    let genderSuggestionsLoaded = false;

    // Default gender values
    const genderValues = ['Male', 'Female', 'Other'];

    // Function to display suggestions
    function displayGenderSuggestions() {
        if (!genderSuggestionsLoaded) {
            showLoading(genderSuggestionsContainer);
            genderSuggestionsLoaded = true;
        }

        const query = genderInput.value.toLowerCase();

        setTimeout(() => {
            genderSuggestionsContainer.innerHTML = '';
            const filteredGenderValues = genderValues.filter(gender =>
                gender.toLowerCase().includes(query)
            );

            if (filteredGenderValues.length > 0) {
                filteredGenderValues.forEach(gender => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = gender;
                    suggestionItem.dataset.gender = gender;
                    genderSuggestionsContainer.appendChild(suggestionItem);
                });
            } else {
                // If no results are found
                const noResultsItem = document.createElement('div');
                noResultsItem.classList.add('suggestion-item', 'no-results');
                noResultsItem.textContent = 'No results found';
                genderSuggestionsContainer.appendChild(noResultsItem);
            }
            genderSuggestionsContainer.style.display = "block";
        }, 500); // Simulate loading delay
    }

    // Add event listeners for input, focus, and click events
    genderInput.addEventListener('input', displayGenderSuggestions);
    genderInput.addEventListener('focus', displayGenderSuggestions);
    genderInput.addEventListener('click', displayGenderSuggestions);

    genderSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedGender = event.target.dataset.gender;
            genderInput.value = selectedGender;
            genderSuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!genderSuggestionsContainer.contains(event.target) && !genderInput.contains(event.target)) {
            genderSuggestionsContainer.innerHTML = '';
        }
    });
});


//////////////////////////////// BLOOD GROUP SUGGESTIONS //////////////////////////

// Blood group suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const bloodGroupInput = document.getElementById('bloodGroup');
    const bloodGroupSuggestionsContainer = document.getElementById('bloodGroupSuggestions');
    let bloodGroupSuggestionsLoaded = false;

    // Default blood group values
    const bloodGroupValues = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Function to display suggestions
    function displayBloodGroupSuggestions() {
        if (!bloodGroupSuggestionsLoaded) {
            showLoading(bloodGroupSuggestionsContainer);
            bloodGroupSuggestionsLoaded = true;
        }

        const query = bloodGroupInput.value.toUpperCase();

        setTimeout(() => {
            bloodGroupSuggestionsContainer.innerHTML = '';
            const filteredBloodGroupValues = bloodGroupValues.filter(bloodGroup =>
                bloodGroup.includes(query)
            );

            if (filteredBloodGroupValues.length > 0) {
                filteredBloodGroupValues.forEach(bloodGroup => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = bloodGroup;
                    suggestionItem.dataset.bloodGroup = bloodGroup;
                    bloodGroupSuggestionsContainer.appendChild(suggestionItem);
                });
            } else {
                // If no results are found
                const noResultsItem = document.createElement('div');
                noResultsItem.classList.add('suggestion-item', 'no-results');
                noResultsItem.textContent = 'No results found';
                bloodGroupSuggestionsContainer.appendChild(noResultsItem);
            }
            bloodGroupSuggestionsContainer.style.display = "block";
        }, 500); // Simulate loading delay
    }

    // Add event listeners for input, focus, and click events
    bloodGroupInput.addEventListener('input', displayBloodGroupSuggestions);
    bloodGroupInput.addEventListener('focus', displayBloodGroupSuggestions);
    bloodGroupInput.addEventListener('click', displayBloodGroupSuggestions);

    bloodGroupSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedBloodGroup = event.target.dataset.bloodGroup;
            bloodGroupInput.value = selectedBloodGroup;
            bloodGroupSuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!bloodGroupSuggestionsContainer.contains(event.target) && !bloodGroupInput.contains(event.target)) {
            bloodGroupSuggestionsContainer.innerHTML = '';
        }
    });
});


///////////////////////////////////////////////////////////////////////////////////////


///////////////////////// CONTACT AND ADDRESS DETAILS ////////////////////////



//////////////////////////// ADDRESS /////////////////////////

// Utility function to convert strings to title case
function toTitleCase(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Debounce function: To limit the rate at which suggestions are called
function debounce(func, delay) {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

// Function to fetch and display state suggestions from API
async function fetchStateSuggestions() {
    const headers = new Headers();
    headers.append("X-CSCAPI-KEY", "V2c2TU5yS2g4WlNXVDdLZ3d6Smh5cnZpTHpMODg0Y2ZZSnZjTmZ3WA=="); // Replace 'API_KEY' with your actual API key

    const requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    try {
        const response = await fetch(`https://api.countrystatecity.in/v1/countries/IN/states`, requestOptions);
        return await response.json();
    } catch (error) {
        console.error('Error fetching state suggestions:', error);
        return [];
    }
}

async function prefetchStateSuggestions() {
    window.stateSuggestions = (await fetchStateSuggestions()) || [];
}
prefetchStateSuggestions();

// Function to display state suggestions from pre-fetched data
function displayStateSuggestions(query, suggestionsContainer) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggesting.

    const filteredStates = window.stateSuggestions.filter(state => state.name.toLowerCase().startsWith(query));

    if (filteredStates.length > 0) {
        filteredStates.forEach(state => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = state.name;
            suggestionItem.dataset.place = state.name;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        // If no results are found
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.style.fontStyle = 'italic';
        noResultsItem.textContent = 'No results found';
        suggestionsContainer.appendChild(noResultsItem);
    }

    suggestionsContainer.style.display = "block";
}

// Function to fetch city suggestions from external API
async function fetchCitySuggestions() {
    const headers = new Headers();
    headers.append("X-CSCAPI-KEY", "V2c2TU5yS2g4WlNXVDdLZ3d6Smh5cnZpTHpMODg0Y2ZZSnZjTmZ3WA=="); // Replace with your actual API key

    const requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    try {
        const response = await fetch(`https://api.countrystatecity.in/v1/countries/IN/cities`, requestOptions);
        return await response.json();
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
        return [];
    }
}

async function prefetchCitySuggestions() {
    window.citySuggestions = (await fetchCitySuggestions()) || [];
}
prefetchCitySuggestions();

// Function to display city suggestions from pre-fetched data
function displayPlaceSuggestions(query, suggestionsContainer) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    const filteredCities = window.citySuggestions.filter(city => city.name.toLowerCase().startsWith(query));

    if (filteredCities.length > 0) {
        filteredCities.forEach(city => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = city.name;
            suggestionItem.dataset.place = city.name;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        // If no results are found
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.style.fontStyle = 'italic';
        noResultsItem.textContent = 'No results found';
        suggestionsContainer.appendChild(noResultsItem);
    }

    suggestionsContainer.style.display = "block";
}

// Fetch distinct addresses from your API
async function fetchCustomCitySuggestions() {
    try {
        const response = await fetch('/getCityAddress');
        return await response.json();
    } catch (error) {
        console.error('Error fetching custom city suggestions:', error);
        return [];
    }
}

// Prefetch city suggestions and custom city suggestions, then store them in a global variable
async function prefetchCombinedCitySuggestions() {
    const [citySuggestions, customCitySuggestions] = await Promise.all([
        fetchCitySuggestions(),
        fetchCustomCitySuggestions()
    ]);

    const combined = [
        ...citySuggestions.map(item => toTitleCase(item.name)),
        ...customCitySuggestions.map(item => toTitleCase(item.Address))
    ];

    window.combinedCitySuggestions = [...new Set(combined.map(item => item.toLowerCase()))].map(item => toTitleCase(item));
}

// Function to display loading suggestions
function displayLoadingSuggestions(suggestionsContainer) {
    // Clear previous suggestions
    suggestionsContainer.innerHTML = '';
    // Create and append the loading item
    const loadingItem = document.createElement('div');
    loadingItem.classList.add('suggestion-item', 'no-results');
    loadingItem.style.fontStyle = 'italic';
    loadingItem.textContent = 'Loading...';
    suggestionsContainer.appendChild(loadingItem);
    suggestionsContainer.style.display = "block";
}

// Function to display combined city suggestions
function displayCombinedCitySuggestions(query, suggestionsContainer) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (!window.combinedCitySuggestions) {
        displayLoadingSuggestions(suggestionsContainer);
        return;
    }

    const filteredSuggestions = window.combinedCitySuggestions.filter(item => item.toLowerCase().startsWith(query.toLowerCase()));

    if (filteredSuggestions.length > 0) {
        filteredSuggestions.forEach(item => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = item;
            suggestionItem.dataset.place = item;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.style.fontStyle = 'italic';
        noResultsItem.textContent = 'No results found';
        suggestionsContainer.appendChild(noResultsItem);
    }

    suggestionsContainer.style.display = "block";
}

// Combined initialization of suggestion boxes
document.addEventListener("DOMContentLoaded", function () {
    const config = [
        {
            inputId: 'placeOfBirth',
            suggestionsId: 'placeOfBirthSuggestions',
            suggestionFunction: displayCombinedCitySuggestions // Use combined suggestions function
        },
        {
            inputId: 'city_village',
            suggestionsId: 'cityVillageSuggestions',
            suggestionFunction: displayCombinedCitySuggestions // Use combined suggestions function
        },
        {
            inputId: 'taluka',
            suggestionsId: 'talukaSuggestions',
            suggestionFunction: displayPlaceSuggestions
        },
        {
            inputId: 'district',
            suggestionsId: 'districtSuggestions',
            suggestionFunction: displayPlaceSuggestions
        },
        {
            inputId: 'state',
            suggestionsId: 'stateSuggestions',
            suggestionFunction: displayStateSuggestions
        },
        {
            inputId: 'domicile',
            suggestionsId: 'domicileSuggestions',
            suggestionFunction: displayStateSuggestions
        }
    ];

    config.forEach(({ inputId, suggestionsId, suggestionFunction }) => {
        const inputField = document.getElementById(inputId);
        const suggestionsContainer = document.getElementById(suggestionsId);

        // Wrap the suggestionFunction with debounce
        const debouncedDisplaySuggestions = debounce(query => suggestionFunction(query, suggestionsContainer), 300);

        // Add event listeners for input events
        inputField.addEventListener('input', () => debouncedDisplaySuggestions(inputField.value.toLowerCase().trim()));
        inputField.addEventListener('focus', () => {
            if (!window.combinedCitySuggestions && (inputId === 'placeOfBirth' || inputId === 'city_village')) {
                displayLoadingSuggestions(suggestionsContainer);
                prefetchCombinedCitySuggestions().then(() => {
                    debouncedDisplaySuggestions(inputField.value.toLowerCase().trim());
                });
            } else {
                suggestionFunction(inputField.value.toLowerCase().trim(), suggestionsContainer);
            }
        });
        inputField.addEventListener('click', () => {
            if (!window.combinedCitySuggestions && (inputId === 'placeOfBirth' || inputId === 'city_village')) {
                displayLoadingSuggestions(suggestionsContainer);
                prefetchCombinedCitySuggestions().then(() => {
                    debouncedDisplaySuggestions(inputField.value.toLowerCase().trim());
                });
            } else {
                suggestionFunction(inputField.value.toLowerCase().trim(), suggestionsContainer);
            }
        });

        suggestionsContainer.addEventListener('click', function (event) {
            if (event.target.classList.contains('suggestion-item')) {
                const selectedPlace = event.target.dataset.place;
                inputField.value = selectedPlace;
                suggestionsContainer.innerHTML = '';
            }
        });

        document.addEventListener('click', function (event) {
            if (!suggestionsContainer.contains(event.target) && !inputField.contains(event.target)) {
                suggestionsContainer.innerHTML = '';
            }
        });
    });
});

//////////////////////////////////////////////////////////////////////////////////


////////////////////////////// IDENTITY DETAILS /////////////////////////

///////////// NATIONALITY SUGGESTIONS //////////////


// Global caches for data
let nationalityCache = [];
let religionCache = [];
let categoryCache = [];
let casteCache = [];
let motherTongueCache = [];
let documentCache = [];

let nationalityDataFetched = false;
let religionDataFetched = false;
let categoryDataFetched = false;
let casteDataFetched = false;
let motherTongueDataFetched = false;
let documentDataFetched = false;

// Function to display nationality suggestions
function displayNationalitySuggestions() {
    const nationalityInput = document.getElementById('nationality');
    const nationalitySuggestionsContainer = document.getElementById('nationalitySuggestions');

    nationalitySuggestionsContainer.style.display = "block";
    const query = nationalityInput.value.toLowerCase().trim();

    // Check if the data has already been fetched
    if (!nationalityDataFetched) {
        showLoading(nationalitySuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            nationalityCache = [
                "Indian", "Anglo-Indian", "Tibetan", "Nepali", "Bhutanese",
                "Bangladeshi", "Pakistani", "Sri Lankan", "Maldivian",
                "Burmese", "Thai", "Malaysian", "Other"
            ];

            nationalityDataFetched = true;
            filterAndDisplayNationalitySuggestions(query, nationalitySuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayNationalitySuggestions(query, nationalitySuggestionsContainer);
    }
}

function filterAndDisplayNationalitySuggestions(query, suggestionsContainer) {
    const filteredNationalities = nationalityCache.filter(nationality => nationality.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredNationalities.length > 0) {
        filteredNationalities.forEach(nationality => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = nationality;
            suggestionItem.dataset.value = nationality;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

// Initialization of nationality suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const nationalityInput = document.getElementById('nationality');
    const nationalitySuggestionsContainer = document.getElementById('nationalitySuggestions');

    // Add event listeners for input, focus, and click events
    nationalityInput.addEventListener('input', displayNationalitySuggestions);
    nationalityInput.addEventListener('focus', displayNationalitySuggestions);
    nationalityInput.addEventListener('click', displayNationalitySuggestions);

    nationalitySuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedNationality = event.target.dataset.value;
            nationalityInput.value = selectedNationality;
            nationalitySuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!nationalitySuggestionsContainer.contains(event.target) && !nationalityInput.contains(event.target)) {
            nationalitySuggestionsContainer.innerHTML = '';
        }
    });
});

/////////////////// RELIGION SUGGESTIONS ///////////////////

// Function to display religion suggestions
function displayReligionSuggestions() {
    const religionInput = document.getElementById('religion');
    const religionSuggestionsContainer = document.getElementById('religionSuggestions');

    religionSuggestionsContainer.style.display = "block";
    const query = religionInput.value.toLowerCase().trim();

    // Check if the data has already been fetched
    if (!religionDataFetched) {
        showLoading(religionSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            religionCache = [
                "Hindu", "Muslim", "Buddhist", "Jain", "Christian",
                "Sikh", "Parsi", "Jewish", "Baha'i", "Tribal/Animist",
                "Atheist", "Agnostic", "Other"
            ];

            religionDataFetched = true;
            filterAndDisplayReligionSuggestions(query, religionSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayReligionSuggestions(query, religionSuggestionsContainer);
    }
}

function filterAndDisplayReligionSuggestions(query, suggestionsContainer) {
    const filteredReligions = religionCache.filter(religion => religion.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredReligions.length > 0) {
        filteredReligions.forEach(religion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = religion;
            suggestionItem.dataset.value = religion;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

// Initialization of religion suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const religionInput = document.getElementById('religion');
    const religionSuggestionsContainer = document.getElementById('religionSuggestions');

    // Add event listeners for input, focus, and click events
    religionInput.addEventListener('input', displayReligionSuggestions);
    religionInput.addEventListener('focus', displayReligionSuggestions);
    religionInput.addEventListener('click', displayReligionSuggestions);

    religionSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedReligion = event.target.dataset.value;
            religionInput.value = selectedReligion;
            religionSuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!religionSuggestionsContainer.contains(event.target) && !religionInput.contains(event.target)) {
            religionSuggestionsContainer.innerHTML = '';
        }
    });
});

/////////////////////////////// CATEGORY SUGGESTIONS //////////////////////

// Function to display category suggestions
function displayCategorySuggestions() {
    const categoryInput = document.getElementById('category');
    const categorySuggestionsContainer = document.getElementById('categorySuggestions');

    categorySuggestionsContainer.style.display = "block";
    const query = categoryInput.value.toLowerCase().trim();

    // Check if the data has already been fetched
    if (!categoryDataFetched) {
        showLoading(categorySuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            categoryCache = [
                "SC", "ST", "OBC", "NT", "OPEN",
                "NTC", "NTB", "NTD", "SEBC", "EWS",
                "VJ", "SBC", "GEN"
            ];

            categoryDataFetched = true;
            filterAndDisplayCategorySuggestions(query, categorySuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayCategorySuggestions(query, categorySuggestionsContainer);
    }
}

function filterAndDisplayCategorySuggestions(query, suggestionsContainer) {
    const filteredCategories = categoryCache.filter(category => category.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredCategories.length > 0) {
        filteredCategories.forEach(category => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = category;
            suggestionItem.dataset.value = category;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

// Initialization of category suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const categoryInput = document.getElementById('category');
    const categorySuggestionsContainer = document.getElementById('categorySuggestions');

    // Add event listeners for input, focus, and click events
    categoryInput.addEventListener('input', displayCategorySuggestions);
    categoryInput.addEventListener('focus', displayCategorySuggestions);
    categoryInput.addEventListener('click', displayCategorySuggestions);

    categorySuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedCategory = event.target.dataset.value;
            categoryInput.value = selectedCategory;
            categorySuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!categorySuggestionsContainer.contains(event.target) && !categoryInput.contains(event.target)) {
            categorySuggestionsContainer.innerHTML = '';
        }
    });
});

////////////////////////// CASTE SUGGESTIONS /////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
    const casteInput = document.getElementById('caste');
    const casteSuggestionsContainer = document.getElementById('casteSuggestions');

    async function fetchCastes() {
        try {
            const response = await fetch('/getUniqueCastes');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const castes = await response.json();
            casteCache = castes.map(caste => caste.Caste);

            casteDataFetched = true;
        } catch (error) {
            console.error('Error fetching castes:', error);
        }
    }

    async function displayCasteSuggestions() {
        const query = casteInput.value.toLowerCase().trim();
        casteSuggestionsContainer.innerHTML = '';
        casteSuggestionsContainer.style.display = "block";

        // Check if the data has already been fetched
        if (!casteDataFetched) {
            showLoading(casteSuggestionsContainer);

            await fetchCastes();
        }

        filterAndDisplayCasteSuggestions(query, casteSuggestionsContainer);
    }

    function filterAndDisplayCasteSuggestions(query, suggestionsContainer) {
        const filteredCastes = casteCache.filter(caste => caste.toLowerCase().startsWith(query));
        suggestionsContainer.innerHTML = '';

        if (filteredCastes.length > 0) {
            filteredCastes.forEach(caste => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = caste;
                suggestionItem.dataset.value = caste;
                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            showNoResults(suggestionsContainer);
        }
    }

    casteInput.addEventListener('input', displayCasteSuggestions);
    casteInput.addEventListener('focus', displayCasteSuggestions);
    casteInput.addEventListener('click', displayCasteSuggestions);

    casteSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedCaste = event.target.dataset.value;
            casteInput.value = selectedCaste;
            casteSuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!casteSuggestionsContainer.contains(event.target) && !casteInput.contains(event.target)) {
            casteSuggestionsContainer.innerHTML = '';
        }
    });
});

////////////////////// DOMICILE SUGGESTIONS /////////////////
//  Added in Contact and Address Suggestion API of STATES //

///////////////////// MOTHER-TONGUE SUGGESTIONS //////////////////////

// Function to display mother tongue suggestions
function displayMotherTongueSuggestions() {
    const motherTongueInput = document.getElementById('motherTongue');
    const motherTongueSuggestionsContainer = document.getElementById('motherTongueSuggestions');

    motherTongueSuggestionsContainer.style.display = "block";
    const query = motherTongueInput.value.toLowerCase().trim();

    // Check if the data has already been fetched
    if (!motherTongueDataFetched) {
        showLoading(motherTongueSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            motherTongueCache = [
                "Hindi", "Marathi", "Urdu", "Gujarati", "Punjabi", "Konkani",
                "Odia", "Assamese", "Rajasthani", "Sindhi", "Maithili", "Dogri", "Kashmiri",
                "Nepali", "Chhattisgarhi", "Haryanvi", "Telugu", "Tamil", "Kannada",
                "Malayalam", "Tulu", "Kodava", "Meitei", "Bodo", "Garo", "Mizo",
                "Lepcha", "Bhutia", "Santali", "Mundari", "Ho", "Khasi", "Korku",
                "English", "Sanskrit", "Bengali", "Marwadi"
            ];

            motherTongueDataFetched = true;
            filterAndDisplayMotherTongueSuggestions(query, motherTongueSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayMotherTongueSuggestions(query, motherTongueSuggestionsContainer);
    }
}

function filterAndDisplayMotherTongueSuggestions(query, suggestionsContainer) {
    const filteredMotherTongues = motherTongueCache.filter(motherTongue => motherTongue.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredMotherTongues.length > 0) {
        filteredMotherTongues.forEach(motherTongue => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = motherTongue;
            suggestionItem.dataset.value = motherTongue;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

// Initialization of mother tongue suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const motherTongueInput = document.getElementById('motherTongue');
    const motherTongueSuggestionsContainer = document.getElementById('motherTongueSuggestions');

    // Add event listeners for input, focus, and click events
    motherTongueInput.addEventListener('input', displayMotherTongueSuggestions);
    motherTongueInput.addEventListener('focus', displayMotherTongueSuggestions);
    motherTongueInput.addEventListener('click', displayMotherTongueSuggestions);

    motherTongueSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedMotherTongue = event.target.dataset.value;
            motherTongueInput.value = selectedMotherTongue;
            motherTongueSuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!motherTongueSuggestionsContainer.contains(event.target) && !motherTongueInput.contains(event.target)) {
            motherTongueSuggestionsContainer.innerHTML = '';
        }
    });
});



///////////////////////// DOCUMENTS SUBMITTED SUGGESTIONS ///////////////////

const documentValues = [
    "Birth Certificate",
    "Passport",
    "School ID",
    "Aadhaar Card",
    "Previous School's Transfer Certificate (TC)",
    "Previous School's Report Card",
    "Residential Proof",
    "Parent's Identification Proof",
    "Passport Photos",
    "Caste Certificate",
    "Medical Certificate",
    "Income Certificate",
    "Migration Certificate"
];

const selectedDocumentsContainer = document.getElementById("selectedDocuments");
const documentInput = document.getElementById("documentInput");
const documentSuggestionsContainer = document.getElementById("documentSuggestions");
let selectedDocuments = [];

// Function to display document suggestions
function displayDocumentSuggestions() {
    documentSuggestionsContainer.style.display = "block";
    const query = documentInput.value.toLowerCase();
    showLoading(documentSuggestionsContainer);

    setTimeout(() => {
        const filteredDocumentValues = documentValues.filter(doc =>
            doc.toLowerCase().includes(query) && !selectedDocuments.includes(doc)
        );

        documentSuggestionsContainer.innerHTML = '';
        if (filteredDocumentValues.length > 0) {
            filteredDocumentValues.forEach(doc => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = doc;
                suggestionItem.dataset.doc = doc;
                documentSuggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            const noResultsItem = document.createElement('div');
            noResultsItem.classList.add('suggestion-item', 'no-results');
            noResultsItem.textContent = 'No results found';
            documentSuggestionsContainer.appendChild(noResultsItem);
        }
    }, 500);
}

function addDocument(doc) { // Renamed parameter
    if (!selectedDocuments.includes(doc)) {
        selectedDocuments.push(doc);

        const docTag = document.createElement('span');
        docTag.textContent = doc;

        const removeIcon = document.createElement('span');
        removeIcon.textContent = '×';
        removeIcon.classList.add('remove-icon');
        removeIcon.onclick = () => removeDocument(doc, docTag);

        docTag.appendChild(removeIcon);
        selectedDocumentsContainer.appendChild(docTag);
    }
    documentInput.value = '';
    displayDocumentSuggestions();
}

// Function to remove a selected document
function removeDocument(document, docTag) {
    selectedDocuments = selectedDocuments.filter(doc => doc !== document);
    selectedDocumentsContainer.removeChild(docTag);
    displayDocumentSuggestions();
}

// Event listeners
documentInput.addEventListener("input", displayDocumentSuggestions);
documentInput.addEventListener("focus", displayDocumentSuggestions);
documentInput.addEventListener("click", displayDocumentSuggestions);

documentSuggestionsContainer.addEventListener("click", (e) => {
    const selectedItem = e.target;
    if (selectedItem.classList.contains("suggestion-item") && !selectedItem.classList.contains("no-results")) {
        const doc = selectedItem.dataset.doc; // Retrieve the document value
        addDocument(doc); // Pass the value to the addDocument function
    }
});

// Hide suggestions on clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".form-group")) {
        documentSuggestionsContainer.style.display = "none";
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////// GUARDIAN INFORMATION SECTION /////////////////////////////////

///////////////////// FATHERS DETAILS //////////////////////


///////////// AUTOFILL FULL NAME //////////////

// Function to update the father's full name
function updateFatherFullName() {
    const fatherFirstName = document.getElementById('fatherFirstName').value.trim();
    const fatherMiddleName = document.getElementById('fatherMiddleName').value.trim();
    const fatherLastName = document.getElementById('fatherLastName').value.trim();
    document.getElementById('fatherFullName').value = `${fatherFirstName} ${fatherMiddleName} ${fatherLastName}`.trim(); // Update father's full name field
}

// Add event listeners to the father's first name, middle name, and last name input fields
document.getElementById('fatherFirstName').addEventListener('input', updateFatherFullName);
document.getElementById('fatherMiddleName').addEventListener('input', updateFatherFullName);
document.getElementById('fatherLastName').addEventListener('input', updateFatherFullName);





///////////////// MOTHERS DETAILS ////////////////////


// Function to update the mother's full name
function updateMotherFullName() {
    const motherFirstName = document.getElementById('motherFirstName').value.trim();
    const motherLastName = document.getElementById('motherLastName').value.trim();
    document.getElementById('motherFullName').value = `${motherFirstName} ${motherLastName}`.trim(); // Update mother's full name field
}

// Add event listeners to the mother's first name, middle name, and last name input fields
document.getElementById('motherFirstName').addEventListener('input', updateMotherFullName);
document.getElementById('motherLastName').addEventListener('input', updateMotherFullName);



///////////////////////////////// LOCAL GUARDIAN DETAILS ////////////////////

// Function to toggle visibility and disable local guardian details
function toggleLocalGuardianDetails(isVisible) {
    const localGuardianDetails = document.getElementById('localGuardianDetails');
    const inputs = localGuardianDetails.getElementsByTagName('input');

    if (isVisible) {
        localGuardianDetails.style.display = 'block';
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = false;
        }
    } else {
        localGuardianDetails.style.display = 'none';
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
    }
}

// Execute toggleLocalGuardianDetails with false to ensure initial state is applied correctly
document.addEventListener('DOMContentLoaded', () => {
    toggleLocalGuardianDetails(false);
});



///////////////////////////// RELATION WITH GUARDIAN SUGGESTION ///////////

// Cache for relationship data
let relationshipCache = [];
let relationshipDataFetched = false;

// Function to display relationship suggestions
function displayRelationshipSuggestions() {
    const relationshipInput = document.getElementById('guardianRelation');
    const relationshipSuggestionsContainer = document.getElementById('relationshipSuggestions');

    relationshipSuggestionsContainer.style.display = "block";
    const query = relationshipInput.value.toLowerCase().trim();

    // Check if the data has already been fetched
    if (!relationshipDataFetched) {
        showLoading(relationshipSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            relationshipCache = [
                "Parent", "Grandparent", "Uncle", "Aunt", "Brother",
                "Sister", "Cousin", "Legal Guardian", "Godparent", "Family Friend", "Landlord"
            ];

            relationshipDataFetched = true;
            filterAndDisplayRelationshipSuggestions(query, relationshipSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayRelationshipSuggestions(query, relationshipSuggestionsContainer);
    }
}

function filterAndDisplayRelationshipSuggestions(query, suggestionsContainer) {
    const filteredRelationships = relationshipCache.filter(relationship => relationship.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredRelationships.length > 0) {
        filteredRelationships.forEach(relationship => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = relationship;
            suggestionItem.dataset.value = relationship;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

// Initialization of relationship suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const relationshipInput = document.getElementById('guardianRelation');
    const relationshipSuggestionsContainer = document.getElementById('relationshipSuggestions');

    // Add event listeners for input, focus, and click events
    relationshipInput.addEventListener('input', displayRelationshipSuggestions);
    relationshipInput.addEventListener('focus', displayRelationshipSuggestions);
    relationshipInput.addEventListener('click', displayRelationshipSuggestions);

    relationshipSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedRelationship = event.target.dataset.value;
            relationshipInput.value = selectedRelationship;
            relationshipSuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!relationshipSuggestionsContainer.contains(event.target) && !relationshipInput.contains(event.target)) {
            relationshipSuggestionsContainer.innerHTML = '';
        }
    });
});




///////////////////////////////////////////////////////////////////////////////


/////////////////////// ADMISSION DETAILS SECTION ////////////////////////////////


/////////////////// SECTION INPUT SUGGESTIONS ////////////

// Array to store sections fetched from the backend
let sections = [];
let sectionsFetched = false; // Flag to track if sections have been fetched

// Function to fetch sections from the backend
function fetchSections() {
    return fetch('/getSections')
        .then(response => response.json())
        .then(data => {
            sections = data.sections;
            sectionsFetched = true;
        })
        .catch(error => console.error('Error fetching sections:', error));
}

// Function to display section suggestions
function displaySectionSuggestions() {
    const sectionInput = document.getElementById('section');
    const sectionSuggestionsContainer = document.getElementById('sectionSuggestions');

    sectionSuggestionsContainer.style.display = "block";
    const query = sectionInput.value.toLowerCase().trim();

    if (!sectionsFetched) {
        showLoading(sectionSuggestionsContainer);

        fetchSections().then(() => {
            filterAndDisplaySectionSuggestions(query, sectionSuggestionsContainer, sectionInput);
        });
    } else {
        filterAndDisplaySectionSuggestions(query, sectionSuggestionsContainer, sectionInput);
    }
}

// Function to filter and display section suggestions
function filterAndDisplaySectionSuggestions(query, suggestionsContainer, sectionInput) {
    const filteredSections = sections.filter(section => section.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredSections.length > 0) {
        filteredSections.forEach(section => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = section;
            suggestionItem.dataset.value = section;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            sectionInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";

            // Fetch the next GR Number when a section is selected
            if (sectionInput.value) {
                fetchNextGrno(sectionInput.value);
                clearStandardAndDivision(); // Clear standard and division when section changes
            }
        });
    });
}

// Clear GR Number, Standard, Division if Section input is cleared
function handleSectionInputChange() {
    const sectionInput = document.getElementById('section');
    const grNoInput = document.getElementById('grNo');
    const standardInput = document.getElementById('standard');
    const divisionInput = document.getElementById('division');
    const divisionSuggestionsContainer = document.getElementById('divisionSuggestions');

    if (!sectionInput.value) {
        grNoInput.value = '';
        standardInput.value = '';
        divisionInput.value = '';
        divisionSuggestionsContainer.innerHTML = '';
        divisionSuggestionsContainer.style.display = 'none';
    }

    standardsFetched = false;
    standardsCache = [];
    divisionsFetched = false;
    divisionsCache = [];
}

// Function to clear standard and division fields
function clearStandardAndDivision() {
    const standardInput = document.getElementById('standard');
    const divisionInput = document.getElementById('division');
    const divisionSuggestionsContainer = document.getElementById('divisionSuggestions');

    standardInput.value = '';
    divisionInput.value = '';
    divisionSuggestionsContainer.innerHTML = '';
    divisionSuggestionsContainer.style.display = 'none';

    standardsFetched = false;
    standardsCache = [];
    divisionsFetched = false;
    divisionsCache = [];
}

// Initialization of section suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const sectionInput = document.getElementById('section');
    const sectionSuggestionsContainer = document.getElementById('sectionSuggestions');

    // Add event listeners for input, focus, and click events
    sectionInput.addEventListener('input', displaySectionSuggestions);
    sectionInput.addEventListener('focus', displaySectionSuggestions);
    sectionInput.addEventListener('click', displaySectionSuggestions);

    // Add event listener to clear GR Number, Standard, Division fields when Section input is cleared
    sectionInput.addEventListener('input', handleSectionInputChange);

    document.addEventListener('click', function (event) {
        if (!sectionSuggestionsContainer.contains(event.target) && !sectionInput.contains(event.target)) {
            sectionSuggestionsContainer.style.display = "none";
        }
    });

    // Check and fetch GR Number when section input has value on page load
    if (sectionInput.value) {
        fetchNextGrno(sectionInput.value);
    }
});

///////////////////// GET GRNO ////////////////////////////

// Function to fetch and set the next GR Number
function fetchNextGrno(sectionValue) {
    // Normalize section value to match backend expectations
    const normalizedSection = sectionValue.toLowerCase().replace("-", " ");
    fetch(`/getNextGrno?section=${normalizedSection}`)
        .then(response => response.json())
        .then(data => {
            const grNoInput = document.getElementById('grNo');
            grNoInput.value = data.nextGrno;
            //console.log(`Section from server: ${data.section}`); // For testing
        })
        .catch(error => console.error('Error fetching next GR Number:', error));
}

/////////////////////// SET ADMISSION DATE ///////////

// Function to set today's date as the default value for the admission date input
function setAdmissionDate() {
    const dateInput = document.getElementById('admissionDate');
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = today.getFullYear();
    const todayDate = `${year}-${month}-${day}`;
    dateInput.value = todayDate;
}

// Set the default date when the document is ready
document.addEventListener('DOMContentLoaded', setAdmissionDate);

/////////////////////// GET STANDARD SUGGESTIONS /////////

// Variables to cache the data
let standardsFetched = false;
let standardsCache = [];

// Function to display standard suggestions
function displayStandardSuggestions() {
    const standardInput = document.getElementById('standard');
    const standardSuggestionsContainer = document.getElementById('standardSuggestions');
    const sectionInput = document.getElementById('section').value.trim();

    // Show suggestion box
    standardSuggestionsContainer.style.display = "block";
    const query = standardInput.value.toLowerCase().trim();
    standardSuggestionsContainer.innerHTML = '';

    if (!sectionInput) {
        standardSuggestionsContainer.innerHTML = '<div class="suggestion-item no-results">Please select a section first</div>';
        return;
    }

    if (!standardsFetched) {
        showLoading(standardSuggestionsContainer);

        fetch(`/getStandards?section=${sectionInput}`)
            .then(response => response.json())
            .then(data => {
                standardsCache = data.standards;
                standardsFetched = true;
                filterAndDisplayStandards(query, standardSuggestionsContainer);
            })
            .catch(error => console.error('Error fetching standards:', error));
    } else {
        filterAndDisplayStandards(query, standardSuggestionsContainer);
    }
}

// Get references to the standard input field and fee table body
const standardInput = document.getElementById('standard');
// const feeCategoryAmountTableBody = document.getElementById('feeCategoryAmountTable');
// Add an event listener to the standard input field
standardInput.addEventListener('input', function () {
    // Clear the fee table whenever the standard value is changed
    // clearFeeTable();
    clearFeeCategoryAmountTable()
});

// Function to filter and display standards
function filterAndDisplayStandards(query, suggestionsContainer) {
    const uniqueStandards = new Set();
    const filteredStandards = standardsCache.filter(standard => {
        const normalizedStandard = standard.toLowerCase();
        if (normalizedStandard.startsWith(query) && !uniqueStandards.has(normalizedStandard)) {
            uniqueStandards.add(normalizedStandard);
            return true;
        }
        return false;
    });

    suggestionsContainer.innerHTML = '';

    if (filteredStandards.length > 0) {
        filteredStandards.forEach(standard => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = standard;
            suggestionItem.dataset.value = standard;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const standardInput = document.getElementById('standard');
            standardInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";

            // Clear division field when standard changes
            clearDivision();
        });
    });
}

function clearDivision() {
    const divisionInput = document.getElementById('division');
    const divisionSuggestionsContainer = document.getElementById('divisionSuggestions');

    divisionInput.value = '';
    divisionSuggestionsContainer.innerHTML = '';
    divisionSuggestionsContainer.style.display = 'none';

    divisionsFetched = false;
    divisionsCache = [];
}

// Initialization of standard suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const standardInput = document.getElementById('standard');
    const standardSuggestionsContainer = document.getElementById('standardSuggestions');

    standardInput.addEventListener('input', displayStandardSuggestions);
    standardInput.addEventListener('focus', displayStandardSuggestions);
    standardInput.addEventListener('click', displayStandardSuggestions);

    document.addEventListener('click', function (event) {
        if (!standardSuggestionsContainer.contains(event.target) && !standardInput.contains(event.target)) {
            standardSuggestionsContainer.style.display = "none";
        }
    });

    standardInput.addEventListener('input', handleStandardInputChange);
});

function handleStandardInputChange() {
    const standardInput = document.getElementById('standard');
    const divisionInput = document.getElementById('division');
    const divisionSuggestionsContainer = document.getElementById('divisionSuggestions');

    if (!standardInput.value) {
        divisionInput.value = '';
        divisionSuggestionsContainer.innerHTML = '';
        divisionSuggestionsContainer.style.display = 'none';
    }

    divisionsFetched = false;
    divisionsCache = [];
}

//////////////////// DIVISION SUGGESTION //////////

// Variables to cache the data
let divisionsFetched = false;
let divisionsCache = [];

// Function to display division suggestions
function displayDivisionSuggestions() {
    const divisionInput = document.getElementById('division');
    const divisionSuggestionsContainer = document.getElementById('divisionSuggestions');
    const sectionInput = document.getElementById('section').value.trim();
    const standardInput = document.getElementById('standard').value.trim();

    divisionSuggestionsContainer.innerHTML = '';

    divisionSuggestionsContainer.style.display = "block";
    const query = divisionInput.value.toLowerCase().trim();

    if (!sectionInput || !standardInput) {
        divisionSuggestionsContainer.innerHTML = '<div class="suggestion-item no-results">Please select a section and standard first</div>';
        return;
    }

    if (!divisionsFetched) {
        showLoading(divisionSuggestionsContainer);

        fetch(`/getDivisions?section=${sectionInput}&standard=${standardInput}`)
            .then(response => response.json())
            .then(data => {
                divisionsCache = data.divisions;
                divisionsFetched = true;
                filterAndDisplayDivisions(query, divisionSuggestionsContainer);
            })
            .catch(error => console.error('Error fetching divisions:', error));
    } else {
        filterAndDisplayDivisions(query, divisionSuggestionsContainer);
    }
}

// Function to filter and display divisions
function filterAndDisplayDivisions(query, suggestionsContainer) {
    const uniqueDivisions = new Set();
    const filteredDivisions = divisionsCache.filter(division => {
        const normalizedDivision = division.toLowerCase();
        if (normalizedDivision.startsWith(query) && !uniqueDivisions.has(normalizedDivision)) {
            uniqueDivisions.add(normalizedDivision);
            return true;
        }
        return false;
    });

    suggestionsContainer.innerHTML = '';

    if (filteredDivisions.length > 0) {
        filteredDivisions.forEach(division => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = division;
            suggestionItem.dataset.value = division;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const divisionInput = document.getElementById('division');
            divisionInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
        });
    });
}

// Initialization of division suggestion box
document.addEventListener('DOMContentLoaded', function () {
    const divisionInput = document.getElementById('division');
    const divisionSuggestionsContainer = document.getElementById('divisionSuggestions');

    divisionInput.addEventListener('input', displayDivisionSuggestions);
    divisionInput.addEventListener('focus', displayDivisionSuggestions);
    divisionInput.addEventListener('click', displayDivisionSuggestions);

    document.addEventListener('click', function (event) {
        if (!divisionSuggestionsContainer.contains(event.target) && !divisionInput.contains(event.target)) {
            divisionSuggestionsContainer.style.display = "none";
        }
    });
});

////////////////////////////// CLASS COMPLETED SUGGESTION //////////////////

// Cache for classes
let classes = [
    'Nursery',
    'LKG',
    'UKG',
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
    '9th',
    '10th'
];
let classesFetched = false;

// Function to display class completed suggestions
function displayClassCompletedSuggestions() {
    const classCompletedInput = document.getElementById('classCompleted');
    const classCompletedSuggestionsContainer = document.getElementById('classCompletedSuggestions');

    // Show suggestion box
    classCompletedSuggestionsContainer.style.display = "block";
    const query = classCompletedInput.value.toLowerCase().trim();

    if (!classesFetched) {
        showLoading(classCompletedSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            classesFetched = true;
            filterAndDisplayClassCompletedSuggestions(query, classCompletedSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayClassCompletedSuggestions(query, classCompletedSuggestionsContainer);
    }
}

// Function to filter and display class completed suggestions
function filterAndDisplayClassCompletedSuggestions(query, suggestionsContainer) {
    const filteredClasses = classes.filter(className => className.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredClasses.length > 0) {
        filteredClasses.forEach(className => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = className;
            suggestionItem.dataset.value = className;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const classCompletedInput = document.getElementById('classCompleted');
            classCompletedInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
        });
    });
}

// Initialization of class completed suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const classCompletedInput = document.getElementById('classCompleted');
    const classCompletedSuggestionsContainer = document.getElementById('classCompletedSuggestions');

    // Add event listeners for input, focus, and click events
    classCompletedInput.addEventListener('input', displayClassCompletedSuggestions);
    classCompletedInput.addEventListener('focus', displayClassCompletedSuggestions);
    classCompletedInput.addEventListener('click', displayClassCompletedSuggestions);

    document.addEventListener('click', function (event) {
        if (!classCompletedSuggestionsContainer.contains(event.target) && !classCompletedInput.contains(event.target)) {
            classCompletedSuggestionsContainer.style.display = "none";
        }
    });
});


//////////////////////// PERCENTAGE VALIDATION ////////////////////////

// Function to validate Percentage
function validatePercentage(percentage) {
    const percentageInput = document.getElementById('percentage');
    const percentageError = document.getElementById('percentageError');

    percentageError.innerHTML = ''; // Clear previous error message
    percentageInput.classList.remove('error'); // Remove existing error styles

    // If the input is empty, do not show any error
    if (percentage === '') {
        return true;
    }

    // Regular expression to ensure percentage is between 0 and 100 with up to two decimal places
    const percentageRegex = /^(100(\.0{1,2})?|(\d{1,2})(\.\d{0,2})?)$/;

    // Validate the percentage
    if (!percentageRegex.test(percentage)) {
        percentageError.innerHTML = 'Percentage must be a number between 0 and 100, and can have up to two decimal places.';
        percentageInput.classList.add('error'); // Apply error styles
        return false;
    }

    percentageInput.classList.remove('error'); // Remove error styles on success
    return true;
}

// Individual validation handler for Percentage
function handlePercentageInput(event) {
    validatePercentage(event.target.value);
}

// Event listener for Percentage input
document.getElementById('percentage').addEventListener('input', handlePercentageInput);

////////////////////////////////////////////////////////////////////////////////////


//////////////////// FEES AND PACKAGES ///////////////////


// Function to fetch and populate the Fee Category Amount Table
function fetchAndPopulateFeeCategoryAmountTable(standard) {
    fetch(`/getFeeCategoriesAndAmounts?standard=${standard}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('feeCategoryAmountTable');
            tableBody.innerHTML = ''; // Clear existing rows

            let totalAmount = 0;

            if (data.categoriesAndAmounts.length > 0) {
                data.categoriesAndAmounts.forEach(item => {
                    const row = document.createElement('tr');

                    const categoryCell = document.createElement('td');
                    categoryCell.textContent = item.category_name;
                    row.appendChild(categoryCell);

                    const amountCell = document.createElement('td');
                    amountCell.textContent = item.amount;
                    row.appendChild(amountCell);

                    tableBody.appendChild(row);

                    totalAmount += parseFloat(item.amount) || 0; // Sum the amounts
                });

                // Add the total row
                const totalRow = document.createElement('tr');

                const totalLabelCell = document.createElement('td');
                totalLabelCell.textContent = 'Total Package';
                totalLabelCell.style.fontWeight = 'bold';
                totalRow.appendChild(totalLabelCell);

                const totalAmountCell = document.createElement('td');
                totalAmountCell.textContent = totalAmount.toFixed(2); // Display total amount
                totalAmountCell.style.fontWeight = 'bold';
                totalRow.appendChild(totalAmountCell);

                tableBody.appendChild(totalRow);
            } else {
                const row = document.createElement('tr');
                const noDataCell = document.createElement('td');
                noDataCell.textContent = 'No fee categories found';
                noDataCell.colSpan = 2;
                row.appendChild(noDataCell);
                tableBody.appendChild(row);
            }
        })
        .catch(error => console.error('Error fetching fee categories and amounts:', error));
}

// Function to clear the Fee Category Amount Table
function clearFeeCategoryAmountTable() {
    const tableBody = document.getElementById('feeCategoryAmountTable');
    tableBody.innerHTML = ''; // Clear existing rows
}

// Function to observe changes in the read-only fields
function observeReadOnlyFields() {
    const feeSectionInput = document.getElementById('feeSection');
    const feeStandardInput = document.getElementById('feeStandard');
    const feeDivisionInput = document.getElementById('feeDivision');

    const observerConfig = { attributes: true, attributeFilter: ['value'] };

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                clearFeeCategoryAmountTable();
            }
        });
    });

    observer.observe(feeSectionInput, observerConfig);
    observer.observe(feeStandardInput, observerConfig);
    observer.observe(feeDivisionInput, observerConfig);
}

// Event listener for the "Generate Package" button
document.getElementById('generatePackageBtn').addEventListener('click', function () {
    const feeStandard = document.getElementById('feeStandard').value.trim();
    if (feeStandard) {
        // Assuming fetchAndPopulateFeeCategoryAmountTable is a function that fetches fee details
        fetchAndPopulateFeeCategoryAmountTable(feeStandard);

        // Ensure feeCategory and packageAllotted are added only in the Fee Details section
        setTimeout(() => {
            // Get the Fee Details section specifically
            const feeDetailsSection = document.querySelector('.input-container h3:contains("Fee Details")').parentElement;
            const feeCategoryInputExists = feeDetailsSection.querySelector('#feeCategory');
            const packageAllottedInputExists = feeDetailsSection.querySelector('#packageAllotted');

            // Only create the input fields if they don't already exist in the Fee Details section
            if (!feeCategoryInputExists) {
                const feeCategoryInput = document.createElement('input');
                feeCategoryInput.id = 'feeCategory';
                feeCategoryInput.className = 'form-control';
                feeCategoryInput.placeholder = "Fee Category";
                feeDetailsSection.appendChild(feeCategoryInput);
            }

            if (!packageAllottedInputExists) {
                const packageAllottedInput = document.createElement('input');
                packageAllottedInput.id = 'packageAllotted';
                packageAllottedInput.className = 'form-control';
                packageAllottedInput.placeholder = "Package Allotted";
                feeDetailsSection.appendChild(packageAllottedInput);
            }
        }, 500);  // Delay to ensure the table is populated before adding fields
    } else {
        console.error('feeStandard is empty, cannot call API');
    }
});



// Initialize MutationObserver on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    observeReadOnlyFields();
});

////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////// TRANSPORT SERVICE SECTION ////////////////////////

// Function to toggle visibility and disable transport details
function toggleTransportDetails(isVisible) {
    const transportDetails = document.getElementById('transportDetails');
    const inputs = transportDetails.getElementsByTagName('input');
    const textareas = transportDetails.getElementsByTagName('textarea');

    if (isVisible) {
        transportDetails.style.display = 'block';
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = false;
        }
        for (let i = 0; i < textareas.length; i++) {
            textareas[i].disabled = false;
        }
    } else {
        transportDetails.style.display = 'none';
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = true;
        }
        for (let i = 0; i < textareas.length; i++) {
            textareas[i].disabled = true;
        }
    }
}

// Execute toggleTransportDetails with false to ensure initial state is applied correctly
document.addEventListener('DOMContentLoaded', () => {
    toggleTransportDetails(false);
});


/////////////////////// PICK DROP SUGGESTION ///////////////////////

// Utility function to convert strings to title case
function toTitleCase(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Debounce function: To limit the rate at which suggestions are called
function debounce(func, delay) {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

// Fetch city suggestions from external API
async function fetchPickDropAddressSuggestions() {
    const headers = new Headers();
    headers.append("X-CSCAPI-KEY", "V2c2TU5yS2g4WlNXVDdLZ3d6Smh5cnZpTHpMODg0Y2ZZSnZjTmZ3WA=="); // Replace with your actual API key

    const requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };

    return fetch(`https://api.countrystatecity.in/v1/countries/IN/cities`, requestOptions)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching city suggestions:', error);
            return [];
        });
}

// Fetch distinct addresses from your API
async function fetchDistinctPickDropAddresses() {
    return fetch('/distinctAddresses')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching distinct addresses:', error);
            return [];
        });
}

// Global variable to track if data has been fetched
let pickDropAddressDataFetched = false;

// Prefetch and combine data, then store them in a global variable
async function prefetchCombinedPickDropAddressSuggestions() {
    const [citySuggestions, addressSuggestions] = await Promise.all([
        fetchPickDropAddressSuggestions(),
        fetchDistinctPickDropAddresses()
    ]);

    // Combine the results, convert to title case, and remove duplicates
    const combined = [...citySuggestions.map(item => toTitleCase(item.name)), ...addressSuggestions.map(item => toTitleCase(item.transport_pickup_drop))];
    window.pickDropAddressSuggestions = [...new Set(combined.map(item => item.toLowerCase()))].map(item => toTitleCase(item));
    pickDropAddressDataFetched = true;
}
prefetchCombinedPickDropAddressSuggestions();

// Utility function to display loading suggestions
function showLoading(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const loadingItem = document.createElement('div');
    loadingItem.classList.add('suggestion-item', 'no-results');
    loadingItem.textContent = 'Loading...';
    suggestionsContainer.appendChild(loadingItem);
    suggestionsContainer.style.display = "block";
}

// Function to display combined suggestions from pre-fetched data
function displayCombinedPickDropAddressSuggestions(query, suggestionsContainer) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    // Show loading if data is not yet fetched
    if (!pickDropAddressDataFetched) {
        showLoading(suggestionsContainer);
        return;
    }

    const filteredSuggestions = window.pickDropAddressSuggestions.filter(item => item.toLowerCase().startsWith(query.toLowerCase()));

    if (filteredSuggestions.length > 0) {
        filteredSuggestions.forEach(item => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = item;
            suggestionItem.dataset.place = item;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        // If no results are found
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        suggestionsContainer.appendChild(noResultsItem);
    }

    suggestionsContainer.style.display = "block";
}

// Initialize suggestion box for pickDropAddress
document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById('pickDropAddress');
    const suggestionsContainer = document.getElementById('pickDropAddressSuggestions');

    // Wrap the display function with debounce
    const debouncedDisplaySuggestions = debounce(query => displayCombinedPickDropAddressSuggestions(query, suggestionsContainer), 300);

    // Add event listeners for input events
    inputField.addEventListener('input', () => {
        resetVehicleRunningCache(); // Clear cache when input changes
        debouncedDisplaySuggestions(inputField.value.toLowerCase().trim());
    });
    inputField.addEventListener('focus', () => displayCombinedPickDropAddressSuggestions(inputField.value.toLowerCase().trim(), suggestionsContainer));
    inputField.addEventListener('click', () => displayCombinedPickDropAddressSuggestions(inputField.value.toLowerCase().trim(), suggestionsContainer));

    suggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedPlace = event.target.dataset.place;
            inputField.value = selectedPlace;
            suggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !inputField.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});


//////////////////////////////// VEHICLE RUNNING SUGGESTIONS /////////////////////

// Cache for vehicle running suggestions
let vehicleRunningFetched = false;
let vehicleRunningCache = [];

// Function to reset vehicle running cache
function resetVehicleRunningCache() {
    vehicleRunningFetched = false;
    vehicleRunningCache = [];
}

// Function to display vehicle running suggestions
function displayVehicleRunningSuggestions() {
    const vehicleRunningInput = document.getElementById('vehicleRunning');
    const vehicleRunningSuggestionsContainer = document.getElementById('vehicleRunningSuggestions');

    // Show suggestion box
    vehicleRunningSuggestionsContainer.style.display = "block";
    const query = vehicleRunningInput.value.toLowerCase().trim();

    // Check the value in pickDropAddress before calling the API
    const routeStops = document.getElementById('pickDropAddress').value.trim();

    if (!routeStops) {
        clearVehicleRunningInfo();
        showNoResults(vehicleRunningSuggestionsContainer);
        return;
    }

    if (!vehicleRunningFetched) {
        showLoading(vehicleRunningSuggestionsContainer);

        // Extract the values from the form inputs and combine them for classesAllotted
        const standard = document.getElementById('transportStandard').value.trim();
        const division = document.getElementById('transportDivision').value.trim();
        const classesAllotted = `${standard} ${division}`;

        if (!classesAllotted || !routeStops) {
            showNoResults(vehicleRunningSuggestionsContainer);
            return;
        }

        fetch('/getVehicleRunning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classesAllotted, routeStops })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    vehicleRunningCache = data.vehicles;
                    vehicleRunningFetched = true;
                    filterAndDisplayVehicleRunning(query, vehicleRunningSuggestionsContainer, vehicleRunningInput);
                } else {
                    showNoResults(vehicleRunningSuggestionsContainer);
                }
            })
            .catch(error => {
                console.error('Error fetching vehicle data:', error);
                vehicleRunningSuggestionsContainer.style.display = "none";
            });
    } else {
        filterAndDisplayVehicleRunning(query, vehicleRunningSuggestionsContainer, vehicleRunningInput);
    }
}

// Function to filter and display vehicle running suggestions
function filterAndDisplayVehicleRunning(query, suggestionsContainer, vehicleRunningInput) {
    const filteredVehicles = vehicleRunningCache.filter(vehicle =>
        vehicle.vehicle_no.toLowerCase().includes(query) ||
        vehicle.driver_name.toLowerCase().includes(query)
    );
    suggestionsContainer.innerHTML = '';

    if (filteredVehicles.length > 0) {
        filteredVehicles.forEach(vehicle => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = `${vehicle.vehicle_no} | ${vehicle.driver_name}`;
            suggestionItem.dataset.value = vehicle.vehicle_no;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            vehicleRunningInput.value = this.dataset.value;
            fetchVehicleInfo(this.dataset.value);
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
            document.getElementById('noVehicleFound').disabled = true;  // Disable the checkbox when an item is selected
            noVehicleCheckbox.checked = false;  // Uncheck the checkbox
        });
    });
}

// Add event listener to the checkbox to enable/disable input
document.getElementById('noVehicleFound').addEventListener('change', function () {
    const vehicleRunningInput = document.getElementById('vehicleRunning');

    if (this.checked) {
        // Disable the input field and clear its value
        vehicleRunningInput.disabled = true;
        vehicleRunningInput.value = '';
    } else {
        // Enable the input field
        vehicleRunningInput.disabled = false;
    }
});


// Function to fetch vehicle info
function fetchVehicleInfo(selectedVehicleNo) {
    const vehicleInfoContainer = document.getElementById('vehicleInfo'); // Ensure this is defined

    // Extract additional parameters
    const route = document.getElementById('pickDropAddress').value.trim();
    const standard = document.getElementById('transportStandard').value.trim();
    const division = document.getElementById('transportDivision').value.trim();
    const classAllotted = `${standard} ${division}`;

    fetch(`/studentEnrollment_getVehicleInfo?vehicleNo=${encodeURIComponent(selectedVehicleNo)}&route=${encodeURIComponent(route)}&classAllotted=${encodeURIComponent(classAllotted)}`)
        .then((response) => response.json())
        .then((data) => {
            // Clear any previous data
            vehicleInfoContainer.innerHTML = '';

            if (data.length > 0) {
                const vehicleInfo = data[0];
                vehicleInfoContainer.innerHTML = `
                    <strong>Vehicle No:</strong> ${vehicleInfo.vehicle_no}<br>
                    <strong>Driver Name:</strong> ${vehicleInfo.driver_name}<br>
                    <strong>Total Capacity:</strong> ${vehicleInfo.vehicle_capacity}<br>
                    <strong>Available Seats:</strong> ${vehicleInfo.available_seats}<br>
                `;
                vehicleInfoContainer.style.display = 'block'; // Show the container with data
                vehicleInfoContainer.style.maxHeight = '100px';
                vehicleInfoContainer.style.width = '90%';
            } else {
                vehicleInfoContainer.innerHTML = 'No vehicle info found';
                vehicleInfoContainer.style.display = 'block'; // Show the container even if no data is found
                vehicleInfoContainer.style.maxHeight = '65px';
                vehicleInfoContainer.style.width = '90%';
            }
        })
        .catch((error) => console.error('Error:', error));
}

// Function to clear vehicle running suggestions and container
function clearVehicleRunningInfo() {
    const vehicleRunningInput = document.getElementById('vehicleRunning');
    const vehicleRunningSuggestionsContainer = document.getElementById('vehicleRunningSuggestions');
    const vehicleInfoContainer = document.getElementById('vehicleInfo');
    const noVehicleFoundCheckbox = document.getElementById('noVehicleFound');

    vehicleRunningInput.value = '';
    vehicleRunningSuggestionsContainer.innerHTML = '';
    vehicleRunningSuggestionsContainer.style.display = 'none';
    vehicleInfoContainer.innerHTML = '';
    vehicleInfoContainer.style.display = 'none';
    noVehicleFoundCheckbox.disabled = false; // Enable the checkbox
}

// Initialization of vehicle running suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const vehicleRunningInput = document.getElementById('vehicleRunning');
    const vehicleRunningSuggestionsContainer = document.getElementById('vehicleRunningSuggestions');
    const pickDropAddressInput = document.getElementById('pickDropAddress');
    const noVehicleFoundCheckbox = document.getElementById('noVehicleFound');

    // Enable the checkbox initially
    noVehicleFoundCheckbox.disabled = false;

    // Add event listeners for input, focus, and click events
    vehicleRunningInput.addEventListener('input', displayVehicleRunningSuggestions);
    vehicleRunningInput.addEventListener('focus', displayVehicleRunningSuggestions);
    vehicleRunningInput.addEventListener('click', displayVehicleRunningSuggestions);
    pickDropAddressInput.addEventListener('change', clearVehicleRunningInfo);

    document.addEventListener('click', function (event) {
        if (!vehicleRunningSuggestionsContainer.contains(event.target) && !vehicleRunningInput.contains(event.target)) {
            vehicleRunningSuggestionsContainer.style.display = "none";
        }
    });
});

// function to check all the consent at once
// Select All checkbox
const selectAllCheckbox = document.getElementById('select-all-checkbox');

// Individual consent checkboxes
const consentCheckboxes = document.querySelectorAll('.consent-checkbox');

// Toggle all checkboxes when "Select All" is clicked
selectAllCheckbox.addEventListener('change', () => {
    const isChecked = selectAllCheckbox.checked;
    consentCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
});

// Update "Select All" checkbox state when individual checkboxes are clicked
consentCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const allChecked = Array.from(consentCheckboxes).every(cb => cb.checked);
        const noneChecked = Array.from(consentCheckboxes).every(cb => !cb.checked);

        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = !allChecked && !noneChecked;
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const medicalStatus = document.getElementById("medicalStatus");
    const medicalDescription = document.getElementById("medicalDescription");

    medicalStatus.addEventListener("change", function () {
        if (medicalStatus.value === "Unfit") {
            medicalDescription.removeAttribute("readonly");
        } else {
            medicalDescription.setAttribute("readonly", true);
            medicalDescription.value = "";
        }
    });
});

// Function to validate ID inputs
function validateInput(inputId, errorId, length) {
    const inputField = document.getElementById(inputId);
    const errorField = document.getElementById(errorId);

    errorField.innerHTML = '';
    inputField.classList.remove('error');

    const value = inputField.value.trim();

    if (value.length === 0) {
        errorField.style.display = 'none';
        return true;
    } else if (/\s/.test(value)) {
        errorField.style.display = 'block';
        errorField.innerHTML = `${inputField.placeholder} must not contain spaces.`;
        inputField.classList.add('error');
        return false;
    } else if (value.length !== length) {
        errorField.style.display = 'block';
        errorField.innerHTML = `${inputField.placeholder} must be exactly ${length} digits long.`;
        inputField.classList.add('error');
        return false;
    } else if (!/^\d+$/.test(value)) {
        errorField.style.display = 'block';
        errorField.innerHTML = `${inputField.placeholder} must contain only numeric digits.`;
        inputField.classList.add('error');
        return false;
    }

    errorField.style.display = 'none';
    return true;
}


document.addEventListener("DOMContentLoaded", function () {
    const lastSchoolAttended = document.getElementById("lastSchoolAttended");
    const classCompleted = document.getElementById("classCompleted");
    const percentage = document.getElementById("percentage");
    const newAdmission = document.getElementById("newAdmission");

    function checkFields() {
        if (lastSchoolAttended.value.trim() || classCompleted.value.trim() || percentage.value.trim()) {
            newAdmission.disabled = true;
        } else {
            newAdmission.disabled = false;
        }
    }

    function resetFields() {
        if (newAdmission.checked) {
            lastSchoolAttended.value = "";
            classCompleted.value = "";
            percentage.value = "";

            lastSchoolAttended.disabled = true;
            classCompleted.disabled = true;
            percentage.disabled = true;
        } else {
            lastSchoolAttended.disabled = false;
            classCompleted.disabled = false;
            percentage.disabled = false;
        }
    }

    lastSchoolAttended.addEventListener("input", checkFields);
    classCompleted.addEventListener("input", checkFields);
    percentage.addEventListener("input", checkFields);
    newAdmission.addEventListener("change", resetFields);
});


document.addEventListener("DOMContentLoaded", function () {
    const transportStandard = document.getElementById("transportStandard");
    const transportDivision = document.getElementById("transportDivision");
    const pickDropAddress = document.getElementById("pickDropAddress");
    const vehicleRunning = document.getElementById("vehicleRunning");
    const noVehicleFound = document.getElementById("noVehicleFound");

    function checkFields() {
        if (pickDropAddress.value.trim() && vehicleRunning.value.trim()) {
            noVehicleFound.disabled = true;
        } else {
            noVehicleFound.disabled = false;
        }
    }

    function resetFields() {
        if (noVehicleFound.checked) {
            pickDropAddress.value = "";
            vehicleRunning.value = "";

            pickDropAddress.disabled = true;
            vehicleRunning.disabled = true;
        } else {
            pickDropAddress.disabled = false;
            vehicleRunning.disabled = false;
        }
    }

    pickDropAddress.addEventListener("input", checkFields);
    vehicleRunning.addEventListener("input", checkFields);
    noVehicleFound.addEventListener("change", resetFields);
});

