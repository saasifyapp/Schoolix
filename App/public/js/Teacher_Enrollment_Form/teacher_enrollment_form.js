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
    input.addEventListener('input', function () {
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

// Function to show a loading indicator
function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Function to show "No Results" message
function showNoResults(container) {
    container.innerHTML = '<div class="no-results">No results found</div>';
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
        document.getElementById(field).addEventListener('input', updateFullName);
    });
}

// Function to manually trigger the 'input' event
function triggerInputEvent(elementId) {
    const event = new Event('input', {
        bubbles: true,
        cancelable: true,
    });
    document.getElementById(elementId).dispatchEvent(event);
}

// Add event listeners to update full name when any name fields are modified
addFullNameUpdateListeners();


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
            displayLoadingSuggestions(genderSuggestionsContainer);
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


//////////////////////////////////////////////////////////////////////////////////

////////////////////////////// IDENTITY DETAILS SUGGESTIONS /////////////////////////

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
        displayLoadingSuggestions(nationalitySuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            nationalityCache = [
                "Indian", "Anglo-Indian", "Tibetan", "Nepali", "Bhutanese",
                "Bangladeshi", "Pakistani", "Sri Lankan", "Maldivian", "Burmese",
                "Thai", "Malaysian", "Afghan", "Chinese", "Iranian", "Iraqi",
                "Sudanese", "Other"
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
        displayLoadingSuggestions(religionSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            religionCache = [
                "Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain",
                "Parsi", "Jewish", "Baha'i", "Tribal/Animist", "Atheist",
                "Agnostic", "Lingayat", "Sarna", "Sanamahi", "Donyi-Polo",
                "Ravidassia", "Other"
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
        displayLoadingSuggestions(categorySuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            categoryCache = [
                "SC", "ST", "OBC", "EWS", "GEN", "NT", "VJ", "SBC", "SEBC", "MBC",
                "BC", "EBC", "DT", "OPEN", "UR", "NTC", "NTB", "NTD", "OBC-NCL",
                "OBC-CL", "BC-M", "BC-O"
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
            displayLoadingSuggestions(casteSuggestionsContainer);

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


//////////////////////////// ADDRESS DETAILS SUGGESTIONS /////////////////////////

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
            inputId: 'pickDropAddress', // New input field ID
            suggestionsId: 'pickDropAddressSuggestions', // New suggestions container ID
            suggestionFunction: displayCombinedCitySuggestions // Use combined suggestions function
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
            if (!window.combinedCitySuggestions && (inputId === 'placeOfBirth' || inputId === 'city_village' || inputId === 'pickDropAddress')) {
                displayLoadingSuggestions(suggestionsContainer);
                prefetchCombinedCitySuggestions().then(() => {
                    debouncedDisplaySuggestions(inputField.value.toLowerCase().trim());
                });
            } else {
                suggestionFunction(inputField.value.toLowerCase().trim(), suggestionsContainer);
            }
        });
        inputField.addEventListener('click', () => {
            if (!window.combinedCitySuggestions && (inputId === 'placeOfBirth' || inputId === 'city_village' || inputId === 'pickDropAddress')) {
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

/////////////////////////////////////////////////////////////////////////////////

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
        displayLoadingSuggestions(relationshipSuggestionsContainer);

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




////////////////////////// TEACHER QUALIFICATION SUGGESTIONS ////////


let qualificationCache = [];
let qualificationDataFetched = false;

async function displayQualificationSuggestions() {
    const qualificationInput = document.getElementById('qualification');
    const qualificationSuggestionsContainer = document.getElementById('qualificationSuggestions');
    const query = qualificationInput.value.toLowerCase().trim();

    qualificationSuggestionsContainer.style.display = "block";

    if (!qualificationDataFetched) {
        displayLoadingSuggestions(qualificationSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            qualificationCache = [
                "D.El.Ed", "B.Ed", "M.Ed", "B.A. B.Ed", "B.Sc.", "B.Sc. B.Ed",
                "B.T.C", "TGT", "PGT", "M.A.", "M.Sc.", "M.Com",
                "Ph.D.", "NET", "SLET", "CTET", "TET", "Montessori Training"
            ];

            qualificationDataFetched = true;
            filterAndDisplayQualificationSuggestions(query, qualificationSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayQualificationSuggestions(query, qualificationSuggestionsContainer);
    }
}

function filterAndDisplayQualificationSuggestions(query, suggestionsContainer) {
    const filteredQualifications = qualificationCache.filter(qualification =>
        qualification.toLowerCase().startsWith(query)
    );
    suggestionsContainer.innerHTML = '';

    if (filteredQualifications.length > 0) {
        filteredQualifications.forEach(qualification => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = qualification;
            suggestionItem.dataset.value = qualification;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const qualificationInput = document.getElementById('qualification');
    const qualificationSuggestionsContainer = document.getElementById('qualificationSuggestions');
    let timeout;

    // Debounced input handler
    qualificationInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(displayQualificationSuggestions, 300);
    });
    qualificationInput.addEventListener('focus', displayQualificationSuggestions);
    qualificationInput.addEventListener('click', displayQualificationSuggestions);

    qualificationSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedQualification = event.target.dataset.value;
            qualificationInput.value = selectedQualification;
            qualificationSuggestionsContainer.innerHTML = '';
            qualificationSuggestionsContainer.style.display = "none";
        }
    });

    document.addEventListener('click', function (event) {
        if (!qualificationSuggestionsContainer.contains(event.target) && !qualificationInput.contains(event.target)) {
            qualificationSuggestionsContainer.innerHTML = '';
            qualificationSuggestionsContainer.style.display = "none";
        }
    });
});



///////////////////// DATE of JOINING ///////////

document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; // Format: YYYY-MM-DD

    document.getElementById('dateOfJoining').value = formattedDate;
});


///////////////// DEPARTMENT SUGGESTIONS //////////

let departmentCache = [];
let departmentDataFetched = false;



function displayDepartmentSuggestions() {
    const departmentInput = document.getElementById('department');
    const departmentSuggestionsContainer = document.getElementById('departmentSuggestions');
    const query = departmentInput.value.toLowerCase().trim();

    departmentSuggestionsContainer.style.display = "block";

    if (!departmentDataFetched) {
        displayLoadingSuggestions(departmentSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            departmentCache = [
                "Teaching Staff", "Non-Teaching Staff", "Office Admin",
                "Lab Incharge", "Library Incharge", "Sports Incharge", "Special Education",
                "Arts and Culture", "Accounts", "HR", "IT Incharge",
                "Counseling", "Transport Incharge", "Hostel Warden",
                "Security Incharge", "Examination Incharge", "Event Coordinator",
                "Discipline Incharge"
            ];
            departmentDataFetched = true;
            filterAndDisplayDepartmentSuggestions(query, departmentSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayDepartmentSuggestions(query, departmentSuggestionsContainer);
    }
}

function filterAndDisplayDepartmentSuggestions(query, suggestionsContainer) {
    const filteredDepartments = departmentCache.filter(department =>
        department.toLowerCase().startsWith(query)
    );

    suggestionsContainer.innerHTML = '';

    if (filteredDepartments.length > 0) {
        filteredDepartments.forEach(department => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = department;
            suggestionItem.dataset.value = department;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const departmentInput = document.getElementById('department');
    const departmentSuggestionsContainer = document.getElementById('departmentSuggestions');
    let timeout;

    // Debounced input handler
    departmentInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(displayDepartmentSuggestions, 300);
    });
    departmentInput.addEventListener('focus', displayDepartmentSuggestions);
    departmentInput.addEventListener('click', displayDepartmentSuggestions);

    // Handle suggestion selection
    departmentSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item') && !event.target.classList.contains('no-results')) {
            const selectedDepartment = event.target.dataset.value;
            departmentInput.value = selectedDepartment;
            departmentSuggestionsContainer.innerHTML = '';
            departmentSuggestionsContainer.style.display = "none";
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function (event) {
        if (!departmentSuggestionsContainer.contains(event.target) && !departmentInput.contains(event.target)) {
            departmentSuggestionsContainer.innerHTML = '';
            departmentSuggestionsContainer.style.display = "none";
        }
    });
});


////////////////////// EMPLOYEE TYPE SUGGESTIONS ////////////

let employeeTypeCache = [];
let employeeTypeDataFetched = false;



function displayEmployeeTypeSuggestions() {
    const employeeTypeInput = document.getElementById('employee_type');
    const employeeTypeSuggestionsContainer = document.getElementById('employee_typeSuggestions');
    const query = employeeTypeInput.value.toLowerCase().trim();

    employeeTypeSuggestionsContainer.style.display = "block";

    if (!employeeTypeDataFetched) {
        displayLoadingSuggestions(employeeTypeSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            employeeTypeCache = ["teacher", "support_staff", "admin"];
            employeeTypeDataFetched = true;
            filterAndDisplayEmployeeTypeSuggestions(query, employeeTypeSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayEmployeeTypeSuggestions(query, employeeTypeSuggestionsContainer);
    }
}

function filterAndDisplayEmployeeTypeSuggestions(query, suggestionsContainer) {
    const filteredEmployeeTypes = employeeTypeCache.filter(employeeType =>
        employeeType.toLowerCase().startsWith(query)
    );

    suggestionsContainer.innerHTML = '';

    if (filteredEmployeeTypes.length > 0) {
        filteredEmployeeTypes.forEach(employeeType => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = employeeType;
            suggestionItem.dataset.value = employeeType;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const employeeTypeInput = document.getElementById('employee_type');
    const employeeTypeSuggestionsContainer = document.getElementById('employee_typeSuggestions');
    let timeout;

    // Debounced input handler
    employeeTypeInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(displayEmployeeTypeSuggestions, 300);
    });
    employeeTypeInput.addEventListener('focus', displayEmployeeTypeSuggestions);
    employeeTypeInput.addEventListener('click', displayEmployeeTypeSuggestions);

    // Handle suggestion selection
    employeeTypeSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item') && !event.target.classList.contains('no-results')) {
            const selectedEmployeeType = event.target.dataset.value;
            employeeTypeInput.value = selectedEmployeeType;
            employeeTypeSuggestionsContainer.innerHTML = '';
            employeeTypeSuggestionsContainer.style.display = "none";
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function (event) {
        if (!employeeTypeSuggestionsContainer.contains(event.target) && !employeeTypeInput.contains(event.target)) {
            employeeTypeSuggestionsContainer.innerHTML = '';
            employeeTypeSuggestionsContainer.style.display = "none";
        }
    });
});

/////////////////////// DESIGNATION SUGGESTIONS ///////////

let designationCache = [];
let designationDataFetched = false;



function displayDesignationSuggestions() {
    const designationInput = document.getElementById('designation');
    const designationSuggestionsContainer = document.getElementById('designationSuggestions');
    const query = designationInput.value.toLowerCase().trim();

    designationSuggestionsContainer.style.display = "block";

    if (!designationDataFetched) {
        displayLoadingSuggestions(designationSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            designationCache = [
                "Teacher", "Assistant Teacher", "Head Teacher", "Subject Coordinator",
                "Clerk", "Peon", "Lab Assistant", "Library Assistant",
                "Office Administrator", "Receptionist", "Office Assistant",
                "Lab Technician", "Lab Supervisor",
                "Librarian", "Assistant Librarian",
                "Sports Coach", "Physical Education Teacher",
                "Special Educator", "Remedial Teacher",
                "Art Teacher", "Music Teacher", "Dance Instructor",
                "Accountant", "Accounts Assistant",
                "HR Coordinator", "HR Assistant",
                "IT Administrator", "IT Technician",
                "School Counselor", "Career Counselor",
                "Transport Coordinator", "Fleet Supervisor",
                "Hostel Warden", "Assistant Warden",
                "Security Supervisor", "Security Officer",
                "Exam Coordinator", "Invigilator",
                "Event Organizer", "Activity Coordinator",
                "Discipline Coordinator", "Student Supervisor"
            ];
            designationDataFetched = true;
            filterAndDisplayDesignationSuggestions(query, designationSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayDesignationSuggestions(query, designationSuggestionsContainer);
    }
}

function filterAndDisplayDesignationSuggestions(query, suggestionsContainer) {
    const filteredDesignations = designationCache.filter(designation =>
        designation.toLowerCase().startsWith(query)
    );

    suggestionsContainer.innerHTML = '';

    if (filteredDesignations.length > 0) {
        filteredDesignations.forEach(designation => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = designation;
            suggestionItem.dataset.value = designation;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const designationInput = document.getElementById('designation');
    const designationSuggestionsContainer = document.getElementById('designationSuggestions');
    let timeout;

    // Debounced input handler
    designationInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(displayDesignationSuggestions, 300);
    });
    designationInput.addEventListener('focus', displayDesignationSuggestions);
    designationInput.addEventListener('click', displayDesignationSuggestions);

    // Handle suggestion selection
    designationSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item') && !event.target.classList.contains('no-results')) {
            const selectedDesignation = event.target.dataset.value;
            designationInput.value = selectedDesignation;
            designationSuggestionsContainer.innerHTML = '';
            designationSuggestionsContainer.style.display = "none";
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function (event) {
        if (!designationSuggestionsContainer.contains(event.target) && !designationInput.contains(event.target)) {
            designationSuggestionsContainer.innerHTML = '';
            designationSuggestionsContainer.style.display = "none";
        }
    });
});


///////////////////// CLASS SUBJECT MAPPING //////////////

/////////////// GET CLASS SUGGESTIONS /////////////


// Function to fetch class suggestions from the API
async function fetchClassSuggestions() {
    try {
        const response = await fetch('/get-classes-to-allot');
        const data = await response.json();
        if (data.success) {
            return data.classes;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching class suggestions:', error);
        return [];
    }
}

// Prefetch class suggestions and store them in a global variable
async function prefetchClassSuggestions() {
    window.classSuggestions = (await fetchClassSuggestions()) || [];
}
prefetchClassSuggestions();

// Function to display class suggestions
function displayClassSuggestions(query, suggestionsContainer) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    const filteredClasses = window.classSuggestions.filter(cls => cls.toLowerCase().startsWith(query.toLowerCase()));

    if (filteredClasses.length > 0) {
        filteredClasses.forEach(cls => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = cls;
            suggestionItem.dataset.place = cls;
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

// Add event listeners to the classAllotted input field
document.addEventListener("DOMContentLoaded", function () {
    const classAllottedInput = document.getElementById('classAllotted');
    const classAllottedSuggestionsContainer = document.getElementById('classAllottedSuggestions');

    // Wrap the displayClassSuggestions function with debounce
    const debouncedDisplaySuggestions = debounce(query => displayClassSuggestions(query, classAllottedSuggestionsContainer), 300);

    // Add event listeners for input events
    classAllottedInput.addEventListener('input', () => debouncedDisplaySuggestions(classAllottedInput.value.toLowerCase().trim()));
    classAllottedInput.addEventListener('focus', () => {
        if (!window.classSuggestions) {
            displayLoadingSuggestions(classAllottedSuggestionsContainer);
            prefetchClassSuggestions().then(() => {
                debouncedDisplaySuggestions(classAllottedInput.value.toLowerCase().trim());
            });
        } else {
            displayClassSuggestions(classAllottedInput.value.toLowerCase().trim(), classAllottedSuggestionsContainer);
        }
    });
    classAllottedInput.addEventListener('click', () => {
        if (!window.classSuggestions) {
            displayLoadingSuggestions(classAllottedSuggestionsContainer);
            prefetchClassSuggestions().then(() => {
                debouncedDisplaySuggestions(classAllottedInput.value.toLowerCase().trim());
            });
        } else {
            displayClassSuggestions(classAllottedInput.value.toLowerCase().trim(), classAllottedSuggestionsContainer);
        }
    });

    classAllottedSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedClass = event.target.dataset.place;
            classAllottedInput.value = selectedClass;
            classAllottedSuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!classAllottedSuggestionsContainer.contains(event.target) && !classAllottedInput.contains(event.target)) {
            classAllottedSuggestionsContainer.innerHTML = '';
        }
    });
});

// Function to show loading suggestions (if needed)
function displayLoadingSuggestions(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const loadingItem = document.createElement('div');
    loadingItem.classList.add('suggestion-item', 'no-results');
    loadingItem.style.fontStyle = 'italic';
    loadingItem.textContent = 'Loading...';
    suggestionsContainer.appendChild(loadingItem);
    suggestionsContainer.style.display = "block";
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


///////////////////// SUBJECT SUGGESTIONS ///////////////

let subjectTaggedCache = [];
let subjectTaggedDataFetched = false;



function displaySubjectTaggedSuggestions() {
    const subjectTaggedInput = document.getElementById('subjectTagged');
    const subjectTaggedSuggestionsContainer = document.getElementById('subjectTaggedSuggestions');
    const query = subjectTaggedInput.value.toLowerCase().trim();

    subjectTaggedSuggestionsContainer.style.display = "block";

    if (!subjectTaggedDataFetched) {
        displayLoadingSuggestions(subjectTaggedSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            subjectTaggedCache = [
                // Basic (Pre-primary and Primary)
                "Drawing",
                "English",
                "General Knowledge",
                "Hindi",
                "Marathi",
                "Mathematics",
                "Moral Science",
                "Science",
                "Value Education",
                // Intermediate (Secondary)
                "Civics",
                "Environmental Science",
                "Geography",
                "History",
                "Sanskrit",
                "Social Science",
                // Advanced (Higher Secondary)
                "Accountancy",
                "Biology",
                "Biotechnology",
                "Business Studies",
                "Chemistry",
                "Computer Science",
                "Economics",
                "Informatics Practices",
                "Legal Studies",
                "Physics",
                "Political Science",
                "Psychology",
                "Sociology",
                // Co-curricular (All levels)
                "Dance",
                "Home Science",
                "Music",
                "Physical Education"
            ];
            subjectTaggedDataFetched = true;
            filterAndDisplaySubjectTaggedSuggestions(query, subjectTaggedSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplaySubjectTaggedSuggestions(query, subjectTaggedSuggestionsContainer);
    }
}

function filterAndDisplaySubjectTaggedSuggestions(query, suggestionsContainer) {
    const filteredSubjects = subjectTaggedCache.filter(subject =>
        subject.toLowerCase().startsWith(query)
    );

    suggestionsContainer.innerHTML = '';

    if (filteredSubjects.length > 0) {
        filteredSubjects.forEach(subject => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = subject;
            suggestionItem.dataset.value = subject;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const subjectTaggedInput = document.getElementById('subjectTagged');
    const subjectTaggedSuggestionsContainer = document.getElementById('subjectTaggedSuggestions');
    let timeout;

    // Debounced input handler
    subjectTaggedInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(displaySubjectTaggedSuggestions, 300);
    });
    subjectTaggedInput.addEventListener('focus', displaySubjectTaggedSuggestions);
    subjectTaggedInput.addEventListener('click', displaySubjectTaggedSuggestions);

    // Handle suggestion selection
    subjectTaggedSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item') && !event.target.classList.contains('no-results')) {
            const selectedSubject = event.target.dataset.value;
            subjectTaggedInput.value = selectedSubject;
            subjectTaggedSuggestionsContainer.innerHTML = '';
            subjectTaggedSuggestionsContainer.style.display = "none";
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function (event) {
        if (!subjectTaggedSuggestionsContainer.contains(event.target) && !subjectTaggedInput.contains(event.target)) {
            subjectTaggedSuggestionsContainer.innerHTML = '';
            subjectTaggedSuggestionsContainer.style.display = "none";
        }
    });

    ////////////////////////// MAP BUTTON ////////////////

    // Map button click handler
    mapButton.addEventListener('click', function () {
        const classValue = classAllotted.value.trim();
        const subjectValue = subjectTagged.value.trim();

        // Validate inputs
        if (!classValue || !subjectValue) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                html: 'Either <strong> Class </strong> or <strong> Subject </strong> is missing.'
            });
            return;
        }

        // Check if the combination already exists
        const rows = subjectClassTableBody.querySelectorAll('tr');
        for (let row of rows) {
            const existingClass = row.cells[0].innerText.trim();
            const existingSubject = row.cells[1].innerText.trim();
            if (existingClass === classValue && existingSubject === subjectValue) {
                Swal.fire({
                    icon: 'error',
                    title: 'Mapping already exist',
                    html: `${classValue} &rarr; ${subjectValue}`
                });
                return;
            }
        }


        // Add new row to the table
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
        <td>${classValue}</td>
        <td>${subjectValue}</td>
               <td>
            <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; 
                text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;
                cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
                class="delete-row-button"
                onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
                onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
                <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; margin: 5px;">
                <span></span>
            </button>
        </td>   `;

        subjectClassTableBody.appendChild(newRow);

        // Clear input fields
        classAllotted.value = '';
        subjectTagged.value = '';

        // Clear suggestions
        classAllottedSuggestionsContainer.innerHTML = '';
        classAllottedSuggestionsContainer.style.display = "none";
        subjectTaggedSuggestionsContainer.innerHTML = '';
        subjectTaggedSuggestionsContainer.style.display = "none";
    });

    // Event delegation to handle row deletion
    subjectClassTableBody.addEventListener('click', function (event) {
        if (event.target.closest('.delete-row-button')) {
            const rowToDelete = event.target.closest('tr');
            subjectClassTableBody.removeChild(rowToDelete);
        }
    });
});




/////////////////////////////// TRANSPORT REQUIREMENTS /////////////////////////

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


//////////////////////////////// GET SHIFT SUGGESTIONS ////////////////////////

// Function to fetch shift suggestions from the API
async function fetchShiftSuggestions() {
    try {
        const response = await fetch('/get-shift-details');
        const data = await response.json();
        if (data.success) {
            return data.shifts;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching shift suggestions:', error);
        return [];
    }
}

// Prefetch shift suggestions and store them in a global variable
async function prefetchShiftSuggestions() {
    window.shiftSuggestions = (await fetchShiftSuggestions()) || [];
}
prefetchShiftSuggestions();

// Function to display shift suggestions
function displayShiftSuggestions(query, suggestionsContainer) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    const filteredShifts = window.shiftSuggestions.filter(shift => shift.toLowerCase().startsWith(query.toLowerCase()));

    if (filteredShifts.length > 0) {
        filteredShifts.forEach(shift => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = shift;
            suggestionItem.dataset.place = shift;
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

// Add event listeners to the shift input field
document.addEventListener("DOMContentLoaded", function () {
    const shiftInput = document.getElementById('shift');
    const shiftSuggestionsContainer = document.getElementById('shiftSuggestions');

    // Wrap the displayShiftSuggestions function with debounce
    const debouncedDisplaySuggestions = debounce(query => displayShiftSuggestions(query, shiftSuggestionsContainer), 300);

    // Add event listeners for input events
    shiftInput.addEventListener('input', () => debouncedDisplaySuggestions(shiftInput.value.toLowerCase().trim()));
    shiftInput.addEventListener('focus', () => {
        if (!window.shiftSuggestions) {
            displayLoadingSuggestions(shiftSuggestionsContainer);
            prefetchShiftSuggestions().then(() => {
                debouncedDisplaySuggestions(shiftInput.value.toLowerCase().trim());
            });
        } else {
            displayShiftSuggestions(shiftInput.value.toLowerCase().trim(), shiftSuggestionsContainer);
        }
    });
    shiftInput.addEventListener('click', () => {
        if (!window.shiftSuggestions) {
            displayLoadingSuggestions(shiftSuggestionsContainer);
            prefetchShiftSuggestions().then(() => {
                debouncedDisplaySuggestions(shiftInput.value.toLowerCase().trim());
            });
        } else {
            displayShiftSuggestions(shiftInput.value.toLowerCase().trim(), shiftSuggestionsContainer);
        }
    });

    shiftSuggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedShift = event.target.dataset.place;
            shiftInput.value = selectedShift;
            shiftSuggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!shiftSuggestionsContainer.contains(event.target) && !shiftInput.contains(event.target)) {
            shiftSuggestionsContainer.innerHTML = '';
        }
    });
});



//////////////////////////////// VEHICLE RUNNING SUGGESTIONS /////////////////////

let vehicleRunningFetchedForTeacher = false;
let vehicleRunningCacheForTeacher = [];

// Function to reset vehicle running cache for teacher
function resetVehicleRunningCacheForTeacher() {
    vehicleRunningFetchedForTeacher = false;
    vehicleRunningCacheForTeacher = [];
}

// Function to display vehicle running suggestions for teacher
function displayVehicleRunningSuggestionsForTeacher() {
    const vehicleRunningInput = document.getElementById('vehicleRunning');
    const vehicleRunningSuggestionsContainer = document.getElementById('vehicleRunningSuggestions');
    const noVehicleCheckbox = document.getElementById('noVehicleFound');

    // Show suggestion box
    vehicleRunningSuggestionsContainer.style.display = "block";
    const query = vehicleRunningInput.value.toLowerCase().trim();

    // Check the value in pickDropAddress and shift before calling the API
    const routeStops = document.getElementById('pickDropAddress').value.trim();
    const shiftName = document.getElementById('shift').value.trim();

    if (!routeStops || !shiftName) {
        clearVehicleRunningInfo();
        showNoResults(vehicleRunningSuggestionsContainer);
        return;
    }

    if (!vehicleRunningFetchedForTeacher) {
        showLoading(vehicleRunningSuggestionsContainer);

        fetch('/get-Vehicle-Running-for-teacher', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ routeStops, shiftName })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    vehicleRunningCacheForTeacher = data.vehicles;
                    vehicleRunningFetchedForTeacher = true;
                    filterAndDisplayVehicleRunningForTeacher(query, vehicleRunningSuggestionsContainer, vehicleRunningInput);
                } else {
                    showNoResults(vehicleRunningSuggestionsContainer);
                }
            })
            .catch(error => {
                console.error('Error fetching vehicle data:', error);
                vehicleRunningSuggestionsContainer.style.display = "none";
            });
    } else {
        filterAndDisplayVehicleRunningForTeacher(query, vehicleRunningSuggestionsContainer, vehicleRunningInput);
    }
}

// Function to filter and display vehicle running suggestions for teacher
function filterAndDisplayVehicleRunningForTeacher(query, suggestionsContainer, vehicleRunningInput) {
    const filteredVehicles = vehicleRunningCacheForTeacher.filter(vehicle =>
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
    const vehicleInfoContainer = document.getElementById('vehicleInfo');

    if (this.checked) {
        // Disable the input field and clear its value
        vehicleRunningInput.disabled = true;
        vehicleRunningInput.value = '';
        vehicleInfoContainer.innerHTML = '';
        vehicleInfoContainer.style.display = 'none';
    } else {
        // Enable the input field
        vehicleRunningInput.disabled = false;
    }
});

// Add event listener to the vehicleRunning input field
document.getElementById('vehicleRunning').addEventListener('click', displayVehicleRunningSuggestionsForTeacher);

// Function to clear vehicle running info (if needed)
function clearVehicleRunningInfo() {
    const vehicleInfoContainer = document.getElementById('vehicleInfo');
    vehicleInfoContainer.innerHTML = '';
    vehicleInfoContainer.style.display = 'none';
}


function fetchVehicleInfo(selectedVehicleNo) {
    const vehicleInfoContainer = document.getElementById('vehicleInfo'); // Ensure this is defined

    // Extract additional parameters
    const route = document.getElementById('pickDropAddress').value.trim();
    const shift = document.getElementById('shift').value.trim();

    fetch(`/get-vehicle-info-for-teacher?vehicleNo=${encodeURIComponent(selectedVehicleNo)}&route=${encodeURIComponent(route)}&shift=${encodeURIComponent(shift)}`)
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

// Function to clear vehicle running info (if needed)
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

// Add event listener to the vehicleRunning input to handle enabling/disabling of the checkbox
function handleVehicleRunningInput() {
    const vehicleRunningInput = document.getElementById('vehicleRunning');
    const noVehicleFoundCheckbox = document.getElementById('noVehicleFound');

    if (vehicleRunningInput.value.trim() === '') {
        noVehicleFoundCheckbox.disabled = false;
    } else {
        noVehicleFoundCheckbox.disabled = true;
        noVehicleFoundCheckbox.checked = false;
    }
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
    vehicleRunningInput.addEventListener('input', () => {
        displayVehicleRunningSuggestionsForTeacher();
        handleVehicleRunningInput();
    });
    vehicleRunningInput.addEventListener('focus', displayVehicleRunningSuggestionsForTeacher);
    vehicleRunningInput.addEventListener('click', displayVehicleRunningSuggestionsForTeacher);
    pickDropAddressInput.addEventListener('change', clearVehicleRunningInfo);
    vehicleRunningInput.addEventListener('change', clearVehicleRunningInfo);

    document.addEventListener('click', function (event) {
        if (!vehicleRunningSuggestionsContainer.contains(event.target) && !vehicleRunningInput.contains(event.target)) {
            vehicleRunningSuggestionsContainer.style.display = "none";
        }
    });
});