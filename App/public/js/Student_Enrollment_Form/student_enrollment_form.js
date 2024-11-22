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


/////////////////////////////////// STUDENT INFORMATION SECTION ////////////////////////


/////////////////////// AUTOMATIC FULL NAME ////////////////////////

// Function to update the full name
function updateStudentFullName() {
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    document.getElementById('fullName').value = `${firstName} ${middleName} ${lastName}`.trim(); // Update full name field
}

// Add event listeners to the first name, middle name, and last name input fields
document.getElementById('firstName').addEventListener('input', updateStudentFullName);
document.getElementById('middleName').addEventListener('input', updateStudentFullName);
document.getElementById('lastName').addEventListener('input', updateStudentFullName);


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

    // Default gender values
    const genderValues = ['Male', 'Female', 'Other'];

    // Function to display suggestions
    function displayGenderSuggestions() {
        genderSuggestionsContainer.style.display = "block";
        const query = genderInput.value.toLowerCase();
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

    // Default blood group values
    const bloodGroupValues = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Function to display suggestions
    function displayBloodGroupSuggestions() {
        bloodGroupSuggestionsContainer.style.display = "block";
        const query = bloodGroupInput.value.toUpperCase();
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

// Debounce function: To limit the rate at which displayStateSuggestions is called
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

    return fetch(`https://api.countrystatecity.in/v1/countries/IN/states`, requestOptions)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching state suggestions:', error);
            return [];
        });
}

async function prefetchStateSuggestions() {
    window.stateSuggestions = (await fetchStateSuggestions()) || [];
}
prefetchStateSuggestions();

// Function to display state suggestions from pre-fetched data
function displayStateSuggestions(query, suggestionsContainer) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

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
        noResultsItem.textContent = 'No results found';
        suggestionsContainer.appendChild(noResultsItem);
    }

    suggestionsContainer.style.display = filteredStates.length > 0 ? "block" : "none";
}

// Function to fetch and display city suggestions from API
async function fetchCitySuggestions() {
    const headers = new Headers();
    headers.append("X-CSCAPI-KEY", "V2c2TU5yS2g4WlNXVDdLZ3d6Smh5cnZpTHpMODg0Y2ZZSnZjTmZ3WA=="); // Replace 'API_KEY' with your actual API key

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
        noResultsItem.textContent = 'No results found';
        suggestionsContainer.appendChild(noResultsItem);
    }

    suggestionsContainer.style.display = filteredCities.length > 0 ? "block" : "none";
}

// Combined initialization of suggestion boxes
document.addEventListener("DOMContentLoaded", function () {
    const config = [
        {
            inputId: 'placeOfBirth',
            suggestionsId: 'placeOfBirthSuggestions',
            suggestionFunction: displayPlaceSuggestions
        },
        {
            inputId: 'city_village',
            suggestionsId: 'cityVillageSuggestions',
            suggestionFunction: displayPlaceSuggestions
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
        inputField.addEventListener('focus', () => suggestionFunction(inputField.value.toLowerCase().trim(), suggestionsContainer));
        inputField.addEventListener('click', () => suggestionFunction(inputField.value.toLowerCase().trim(), suggestionsContainer));

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

function displayNationalitySuggestions() {
    const nationalityInput = document.getElementById('nationality');
    const nationalitySuggestionsContainer = document.getElementById('nationalitySuggestions');

    nationalitySuggestionsContainer.style.display = "block";
    const query = nationalityInput.value.toLowerCase().trim();
    nationalitySuggestionsContainer.innerHTML = '';

    const nationalities = [
        "Indian",
        "Anglo-Indian",
        "Tibetan",
        "Nepali",
        "Bhutanese",
        "Bangladeshi",
        "Pakistani",
        "Sri Lankan",
        "Maldivian",
        "Burmese",
        "Thai",
        "Malaysian",
        "Other"
    ];

    const filteredNationalities = nationalities.filter(nationality => nationality.toLowerCase().startsWith(query));

    if (filteredNationalities.length > 0) {
        filteredNationalities.forEach(nationality => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = nationality;
            suggestionItem.dataset.value = nationality;
            nationalitySuggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        // If no results are found
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        nationalitySuggestionsContainer.appendChild(noResultsItem);
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

///////////////////////////////////////////////////////////////////

/////////////////// RELIGION SUGGESTIONS ///////////////////


// Function to display religion suggestions
function displayReligionSuggestions() {
    const religionInput = document.getElementById('religion');
    const religionSuggestionsContainer = document.getElementById('religionSuggestions');

    religionSuggestionsContainer.style.display = "block";
    const query = religionInput.value.toLowerCase().trim();
    religionSuggestionsContainer.innerHTML = '';

    const religions = [
        "Hindu",
        "Muslim",
        "Buddhist",
        "Jain",
        "Christian",
        "Sikh",
        "Parsi",
        "Jewish",
        "Baha'i",
        "Tribal/Animist",
        "Atheist",
        "Agnostic",
        "Other"
    ];

    const filteredReligions = religions.filter(religion => religion.toLowerCase().startsWith(query));

    if (filteredReligions.length > 0) {
        filteredReligions.forEach(religion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = religion;
            suggestionItem.dataset.value = religion;
            religionSuggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        // If no results are found
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        religionSuggestionsContainer.appendChild(noResultsItem);
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
    categorySuggestionsContainer.innerHTML = '';

    const categories = [
        "SC",
        "ST",
        "OBC",
        "NT",
        "OPEN",
        "NTC",
        "NTB",
        "NTD",
        "SEBC",
        "EWS",
        "VJ",
        "SBC",
        "GEN"
    ];

    const filteredCategories = categories.filter(category => category.toLowerCase().startsWith(query));

    if (filteredCategories.length > 0) {
        filteredCategories.forEach(category => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = category;
            suggestionItem.dataset.value = category;
            categorySuggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        // If no results are found
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        categorySuggestionsContainer.appendChild(noResultsItem);
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

    let castesList = [];

    async function fetchCastes() {
        try {
            const response = await fetch('/getUniqueCastes');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const castes = await response.json();
            castesList = castes.map(caste => caste.Caste);
        } catch (error) {
            console.error('Error fetching castes:', error);
        }
    }

    async function displayCasteSuggestions() {
        const query = casteInput.value.toLowerCase().trim();
        casteSuggestionsContainer.innerHTML = '';
        casteSuggestionsContainer.style.display = "block";

        const filteredCastes = castesList.filter(caste => caste.toLowerCase().startsWith(query));

        if (filteredCastes.length > 0) {
            filteredCastes.forEach(caste => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = caste;
                suggestionItem.dataset.value = caste;
                casteSuggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            const noResultsItem = document.createElement('div');
            noResultsItem.classList.add('suggestion-item', 'no-results');
            noResultsItem.textContent = 'No results found';
            casteSuggestionsContainer.appendChild(noResultsItem);
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

    fetchCastes();
});

////////////////////// DOMICILE SUGGESTIONS /////////////////

///  Added in Contact and Address Suggestion API of STATES ///

//////////////////////////////////////////////////////////


///////////////////// MOTHER-TONGUE SUGGESTIONS //////////////////////

// Function to display mother tongue suggestions
function displayMotherTongueSuggestions() {
    const motherTongueInput = document.getElementById('motherTongue');
    const motherTongueSuggestionsContainer = document.getElementById('motherTongueSuggestions');

    motherTongueSuggestionsContainer.style.display = "block";
    const query = motherTongueInput.value.toLowerCase().trim();
    motherTongueSuggestionsContainer.innerHTML = '';

    const motherTongues = [
        "Hindi", "Marathi", "Urdu", "Gujarati", "Punjabi", "Konkani",
        "Odia", "Assamese", "Rajasthani", "Sindhi", "Maithili", "Dogri", "Kashmiri",
        "Nepali", "Chhattisgarhi", "Haryanvi", "Telugu", "Tamil", "Kannada",
        "Malayalam", "Tulu", "Kodava", "Meitei", "Bodo", "Garo", "Mizo",
        "Lepcha", "Bhutia", "Santali", "Mundari", "Ho", "Khasi", "Korku",
        "English", "Sanskrit", "Bengali", "Marwadi"
    ];

    const filteredMotherTongues = motherTongues.filter(motherTongue => motherTongue.toLowerCase().startsWith(query));

    if (filteredMotherTongues.length > 0) {
        filteredMotherTongues.forEach(motherTongue => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = motherTongue;
            suggestionItem.dataset.value = motherTongue;
            motherTongueSuggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        // If no results are found
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        motherTongueSuggestionsContainer.appendChild(noResultsItem);
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

///////////////////////////////// AADHAR NO VALIDATIONS /////////////

// Function to validate Aadhaar number
function validateAadhaar(aadhaar) {
    const aadhaarError = document.getElementById('aadhaarError');
    aadhaarError.innerHTML = '';

    // Check for empty input
    if (aadhaar.length === 0) {
        aadhaarError.style.display = 'none'; // Hide error message
        return true;
    } else {
        aadhaarError.style.display = 'block'; // Show error message container
    }

    // Length Check
    if (aadhaar.length !== 12) {
        aadhaarError.innerHTML = `Aadhaar number must be exactly 12 digits long. Current length: ${aadhaar.length}`;
        return false;
    }

    // Numeric Check
    if (!/^\d{12}$/.test(aadhaar)) {
        aadhaarError.innerHTML = 'Aadhaar number must contain only numeric digits.';
        return false;
    }

    return true;
}

// Event listener for Aadhaar input
document.getElementById('aadhaar').addEventListener('input', function () {
    validateAadhaar(this.value.trim());
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
    documentSuggestionsContainer.innerHTML = '';

    const filteredDocumentValues = documentValues.filter(doc =>
        doc.toLowerCase().includes(query) && !selectedDocuments.includes(doc)
    );

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

// Function to display relationship suggestions
function displayRelationshipSuggestions() {
    const relationshipInput = document.getElementById('guardianRelation');
    const relationshipSuggestionsContainer = document.getElementById('relationshipSuggestions');

    relationshipSuggestionsContainer.style.display = "block";
    const query = relationshipInput.value.toLowerCase().trim();
    relationshipSuggestionsContainer.innerHTML = '';

    const relationships = [
        "Parent",
        "Grandparent",
        "Uncle",
        "Aunt",
        "Brother",
        "Sister",
        "Cousin",
        "Legal Guardian",
        "Godparent",
        "Family Friend",
        "Landlord"
    ];

    const filteredRelationships = relationships.filter(relationship => relationship.toLowerCase().startsWith(query));

    if (filteredRelationships.length > 0) {
        filteredRelationships.forEach(relationship => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = relationship;
            suggestionItem.dataset.value = relationship;
            relationshipSuggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        // If no results are found
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        relationshipSuggestionsContainer.appendChild(noResultsItem);
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

// Function to fetch sections from the backend
function fetchSections() {
    fetch('/getSections')
        .then(response => response.json())
        .then(data => {
            sections = data.sections;
        })
        .catch(error => console.error('Error fetching sections:', error));
}

// Function to display section suggestions
function displaySectionSuggestions() {
    const sectionInput = document.getElementById('section');
    const sectionSuggestionsContainer = document.getElementById('sectionSuggestions');

    sectionSuggestionsContainer.style.display = "block";
    const query = sectionInput.value.toLowerCase().trim();
    sectionSuggestionsContainer.innerHTML = '';

    const filteredSections = sections.filter(section => section.toLowerCase().startsWith(query));

    if (filteredSections.length > 0) {
        filteredSections.forEach(section => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = section;
            suggestionItem.dataset.value = section;
            sectionSuggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        // If no results are found
        const noResultsItem = document.createElement('div');
        noResultsItem.classList.add('suggestion-item', 'no-results');
        noResultsItem.textContent = 'No results found';
        sectionSuggestionsContainer.appendChild(noResultsItem);
    }

    // Add event listeners for selection
    sectionSuggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            sectionInput.value = this.dataset.value;
            sectionSuggestionsContainer.innerHTML = '';
            sectionSuggestionsContainer.style.display = "none";

            // Fetch the next GR Number when a section is selected
            if (sectionInput.value) {
                fetchNextGrno(sectionInput.value);
            }
        });
    });
}

// Clear GR Number, Standard, Division if Section input is cleared
function handleSectionInputChange() {
    const sectionInput = document.getElementById('section');
    const grNoInput = document.getElementById('grNo');

    if (!sectionInput.value) {
        grNoInput.value = '';
    }

    if (!sectionInput.value) {
        standard.value = '';
    }

    if (!sectionInput.value) {
        division.value = '';
    }
}

// Initialization of section suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const sectionInput = document.getElementById('section');
    const sectionSuggestionsContainer = document.getElementById('sectionSuggestions');

    // Fetch sections on page load
    fetchSections();

    // Add event listeners for input, focus, and click events
    sectionInput.addEventListener('input', displaySectionSuggestions);
    sectionInput.addEventListener('focus', displaySectionSuggestions);
    sectionInput.addEventListener('click', displaySectionSuggestions);

    // Add event listener to clear GR Number field when Section input is cleared
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

            fetch(`/getStandards?section=${sectionInput}`)
                .then(response => response.json())
                .then(data => {
                    const uniqueStandards = new Set();
                    const filteredStandards = data.standards.filter(standard => {
                        const normalizedStandard = standard.toLowerCase();
                        if (normalizedStandard.startsWith(query) && !uniqueStandards.has(normalizedStandard)) {
                            uniqueStandards.add(normalizedStandard);
                            return true;
                        }
                        return false;
                    });

                    if (filteredStandards.length > 0) {
                        filteredStandards.forEach(standard => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = standard;
                            suggestionItem.dataset.value = standard;
                            standardSuggestionsContainer.appendChild(suggestionItem);
                        });
                    } else {
                        // If no results are found
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        standardSuggestionsContainer.appendChild(noResultsItem);
                    }

                    // Add event listeners for selection
                    standardSuggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', function () {
                            standardInput.value = this.dataset.value;
                            standardSuggestionsContainer.innerHTML = '';
                            standardSuggestionsContainer.style.display = "none";
                        });
                    });
                })
                .catch(error => console.error('Error fetching standards:', error));
        }

        // Initialization of standard suggestion box
        document.addEventListener("DOMContentLoaded", function () {
            const standardInput = document.getElementById('standard');
            const standardSuggestionsContainer = document.getElementById('standardSuggestions');

            // Add event listeners for input, focus, and click events
            standardInput.addEventListener('input', displayStandardSuggestions);
            standardInput.addEventListener('focus', displayStandardSuggestions);
            standardInput.addEventListener('click', displayStandardSuggestions);

            document.addEventListener('click', function (event) {
                if (!standardSuggestionsContainer.contains(event.target) && !standardInput.contains(event.target)) {
                    standardSuggestionsContainer.style.display = "none";
                }
            });

            // Add event listener to clear Division field when Standard input is cleared
            standardInput.addEventListener('input', handleStandardInputChange);
        });

        // Clear Division if Standard input is cleared
        function handleStandardInputChange() {
            const standardInput = document.getElementById('standard');
            const divisionInput = document.getElementById('division');

            if (!standardInput.value) {
                divisionInput.value = '';
            }
        }



/////////////////////////// GET DIVISIONS based on section and standard //////


// Function to display division suggestions
function displayDivisionSuggestions() {
    const divisionInput = document.getElementById('division');
    const divisionSuggestionsContainer = document.getElementById('divisionSuggestions');
    const sectionInput = document.getElementById('section').value.trim();
    const standardInput = document.getElementById('standard').value.trim();

    // Clear existing suggestions
    divisionSuggestionsContainer.innerHTML = '';

    // Show suggestion box
    divisionSuggestionsContainer.style.display = "block";
    const query = divisionInput.value.toLowerCase().trim();

    if (!sectionInput || !standardInput) {
        divisionSuggestionsContainer.innerHTML = '<div class="suggestion-item no-results">Please select a section and standard first</div>';
        return;
    }

    fetch(`/getDivisions?section=${sectionInput}&standard=${standardInput}`)
        .then(response => response.json())
        .then(data => {
            const uniqueDivisions = new Set();
            const filteredDivisions = data.divisions.filter(division => {
                const normalizedDivision = division.toLowerCase();
                if (normalizedDivision.startsWith(query) && !uniqueDivisions.has(normalizedDivision)) {
                    uniqueDivisions.add(normalizedDivision);
                    return true;
                }
                return false;
            });

            if (filteredDivisions.length > 0) {
                filteredDivisions.forEach(division => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = division;
                    suggestionItem.dataset.value = division;
                    divisionSuggestionsContainer.appendChild(suggestionItem);
                });
            } else {
                // If no results are found
                const noResultsItem = document.createElement('div');
                noResultsItem.classList.add('suggestion-item', 'no-results');
                noResultsItem.textContent = 'No results found';
                divisionSuggestionsContainer.appendChild(noResultsItem);
            }

            // Add event listeners for selection
            divisionSuggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function () {
                    divisionInput.value = this.dataset.value;
                    divisionSuggestionsContainer.innerHTML = '';
                    divisionSuggestionsContainer.style.display = "none";
                });
            });
        })
        .catch(error => console.error('Error fetching divisions:', error));
}

// Initialization of division suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const divisionInput = document.getElementById('division');
    const divisionSuggestionsContainer = document.getElementById('divisionSuggestions');

    // Add event listeners for input, focus, and click events
    divisionInput.addEventListener('input', displayDivisionSuggestions);
    divisionInput.addEventListener('focus', displayDivisionSuggestions);
    divisionInput.addEventListener('click', displayDivisionSuggestions);

    document.addEventListener('click', function (event) {
        if (!divisionSuggestionsContainer.contains(event.target) && !divisionInput.contains(event.target)) {
            divisionSuggestionsContainer.style.display = "none";
        }
    });
});


///////////////////////////////// CLASS COMPLETED SUGGESTIONS //////////


        // Classes available for suggestion
        const classes = [
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

        // Function to display class completed suggestions
        function displayClassCompletedSuggestions() {
            const classCompletedInput = document.getElementById('classCompleted');
            const classCompletedSuggestionsContainer = document.getElementById('classCompletedSuggestions');

            // Show suggestion box
            classCompletedSuggestionsContainer.style.display = "block";
            const query = classCompletedInput.value.toLowerCase().trim();
            classCompletedSuggestionsContainer.innerHTML = '';

            const filteredClasses = classes.filter(className => className.toLowerCase().startsWith(query));

            if (filteredClasses.length > 0) {
                filteredClasses.forEach(className => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = className;
                    suggestionItem.dataset.value = className;
                    classCompletedSuggestionsContainer.appendChild(suggestionItem);
                });
            } else {
                // If no results are found
                const noResultsItem = document.createElement('div');
                noResultsItem.classList.add('suggestion-item', 'no-results');
                noResultsItem.textContent = 'No results found';
                classCompletedSuggestionsContainer.appendChild(noResultsItem);
            }

            // Add event listeners for selection
            classCompletedSuggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function () {
                    classCompletedInput.value = this.dataset.value;
                    classCompletedSuggestionsContainer.innerHTML = '';
                    classCompletedSuggestionsContainer.style.display = "none";
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