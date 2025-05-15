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
        showLoading(nationalitySuggestionsContainer);

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
        showLoading(religionSuggestionsContainer);

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
        showLoading(categorySuggestionsContainer);

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