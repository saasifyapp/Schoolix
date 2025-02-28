// document.getElementById("search-studentforTC").addEventListener("click", function (event) {
function searchStudentAndHandleTC() {
    event.preventDefault(); // Prevent form submission (if inside a form)

    let searchValue = document.getElementById("searchInputforTC").value.trim();
    let section = document.getElementById("selectsectionforTC").value; // Get selected section

    // **Validation Checks**
    if (!searchValue) {
        Swal.fire({
            icon: "warning",
            title: "Invalid Input",
            text: "Please enter a valid search value.",
            confirmButtonText: "OK"
        });
        return;
    }

    if (!section) {
        Swal.fire({
            icon: "warning",
            title: "Select Section",
            text: "Please select a section before searching.",
            confirmButtonText: "OK"
        });
        return;
    }

    // Determine search type (Number → GR No, Text → Name)
    let searchType = isNaN(searchValue) ? "name" : "grno";

    // **Call the API**
    fetch(`/fetch-student-for-TC?section=${encodeURIComponent(section)}&${searchType}=${encodeURIComponent(searchValue)}`)
        .then(response => response.json())
        .then(data => {

            if (data.error) {
                Swal.fire({
                    icon: "error",
                    title: "Search Error",
                    text: data.error,
                    confirmButtonText: "OK"
                });
            } else if (data.message === "No student found") {
                Swal.fire({
                    icon: "error",
                    title: "No Record Found",
                    text: "No matching student details were found.",
                    confirmButtonText: "OK"
                });
            } else if (data.message === "Student is inactive") {
                Swal.fire({
                    icon: "warning",
                    title: "Inactive Student",
                    text: "This student is inactive. Please contact the administration.",
                    confirmButtonText: "OK"
                });
            } else {
                
                // If student found, handle the data (e.g., display it)
                console.log("Student Found:", data);
                // sessionStorage.setItem("studentDataforTC", JSON.stringify(data[0]));
                // sessionStorage.setItem("selectedSection", section);
                // window.location.href = `/Student_Enrollment_Form/student_enrollment_form?section=${encodeURIComponent(section)}&search=${encodeURIComponent(searchValue)}&mode=update`;

                // Populate the form with student data
                populateStudentTCForm(data[0]);

                document.getElementById("searchTCFormOverlay").style.display = "none";
                document.getElementById("generateTCFormOverlay").style.display = "flex";
            }
        })
        .catch(error => {
            console.error("Error fetching student data:", error);
            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Something went wrong while fetching student details.",
                confirmButtonText: "OK"
            });
        });
};

// Function to populate form fields (Modify as per form field IDs)
function populateStudentTCForm(data) {
    if (!data) return;
     
    // Directly populate the form fields
    document.getElementById("studentName").value = data.Name || "";
    document.getElementById("motherName").value = data.Mother_name || "";
    document.getElementById("dob").value = formatDateForInput(data.DOB);
    document.getElementById("placeOfBirth").value = data.POB || "";
    document.getElementById("nationality").value = data.Nationality || "";
    document.getElementById("religion").value = data.Religion || "";
    document.getElementById("category").value = data.Category || "";
    document.getElementById("caste").value = data.Caste || "";
    document.getElementById("aadharId").value = data.Adhar_no || "";
    document.getElementById("tc_grNo").value = data.Grno || "";
    document.getElementById("tc_section").value = data.Section || "";
    document.getElementById("tc_class").value = data.Standard || "";
    document.getElementById("saralId").value = data.saral_id || "";
    document.getElementById("aaparId").value = data.apar_id || "";
    document.getElementById("penId").value = data.pen_id || "";
    document.getElementById("lastSchool").value = data.Last_School || "NA";
    document.getElementById("dateOfAdmission").value = formatDateForInput(data.Admission_Date);
    document.getElementById("classOfAdmission").value = data.admitted_class || "";
}

// Function to format date from "DD-MM-YYYY" to "YYYY-MM-DD" (for input[type=date])
function formatDateForInput(dateString) {
    if (!dateString) return "";
    let parts = dateString.split("-");
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "";
}

// If switching to a new page, store data in session storage
function storeStudentDataForRedirection(data) {
    sessionStorage.setItem("tcFormData", JSON.stringify(data));
}

// If redirected, fetch from session storage and populate form
function checkAndPopulateFromSession() {
    let storedData = sessionStorage.getItem("tcFormData");
    if (storedData) {
        populateStudentTCForm(JSON.parse(storedData));
    }
}


document.getElementById("closeGenerateTCFormOverlay").addEventListener("click", function () {
    clearTCForm();
});

function clearTCForm() {
    // Select all input fields inside the form
    document.querySelectorAll(".generate-tc-form input").forEach(input => {
        if (input.type === "date") {
            input.value = ""; // Clear date fields
        } else {
            input.value = ""; // Clear text fields
        }
    });

    // Optionally, remove error messages or highlights if any
    document.querySelectorAll(".error-message").forEach(error => error.remove());
}


/////////////////////// FETCH TC NO //////////////////////


// Function to fetch and set the next TC Number
function fetchNextTcNo() {
    fetch('/fetch-new-tc-no')
        .then(response => response.json())
        .then(data => {
            const tcNoInput = document.getElementById('tcNo');
            tcNoInput.value = data.new_tc_no;
        })
        .catch(error => console.error('Error fetching next TC Number:', error));
}

// Example usage: Call this function when the page loads or when necessary
document.addEventListener('DOMContentLoaded', (event) => {
    fetchNextTcNo(); // Fetch the next TC number when the page loads
});




///////////////////////// DATE WHEN LEAVING ///////////////////////


// Function to set today's date as the default value for the date of leaving input
function setLeavingDate() {
    const dateInput = document.getElementById('dateOfLeaving');
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = today.getFullYear();
    const todayDate = `${year}-${month}-${day}`;
    dateInput.value = todayDate;
}

// Set the default date when the document is ready
document.addEventListener('DOMContentLoaded', setLeavingDate);


//////////////////////////////////// STANDARD WHEN LEAVING ////////////////////////

// Cache for standards when leaving
let standardsWhenLeaving = [
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
let standardsWhenLeavingFetched = false;

// Function to display standard when leaving suggestions
function displayStandardWhenLeavingSuggestions() {
    const standardLeavingInput = document.getElementById('standardLeaving');
    const standardLeavingSuggestionsContainer = document.getElementById('standardLeavingSuggestion');

    // Show suggestion box
    standardLeavingSuggestionsContainer.style.display = "block";
    const query = standardLeavingInput.value.toLowerCase().trim();

    if (!standardsWhenLeavingFetched) {
        showLoading(standardLeavingSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            standardsWhenLeavingFetched = true;
            filterAndDisplayStandardWhenLeavingSuggestions(query, standardLeavingSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayStandardWhenLeavingSuggestions(query, standardLeavingSuggestionsContainer);
    }
}

// Function to filter and display standard when leaving suggestions
function filterAndDisplayStandardWhenLeavingSuggestions(query, suggestionsContainer) {
    const filteredStandards = standardsWhenLeaving.filter(standard => standard.toLowerCase().startsWith(query));
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
            const standardLeavingInput = document.getElementById('standardLeaving');
            standardLeavingInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
        });
    });
}

// Function to show a loading indicator
function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Function to show "No Results" message
function showNoResults(container) {
    container.innerHTML = '<div class="no-results">No results found</div>';
}

// Initialization of standard when leaving suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const standardLeavingInput = document.getElementById('standardLeaving');
    const standardLeavingSuggestionsContainer = document.getElementById('standardLeavingSuggestion');

    // Add event listeners for input, focus, and click events
    standardLeavingInput.addEventListener('input', displayStandardWhenLeavingSuggestions);
    standardLeavingInput.addEventListener('focus', displayStandardWhenLeavingSuggestions);
    standardLeavingInput.addEventListener('click', displayStandardWhenLeavingSuggestions);

    document.addEventListener('click', function (event) {
        if (!standardLeavingSuggestionsContainer.contains(event.target) && !standardLeavingInput.contains(event.target)) {
            standardLeavingSuggestionsContainer.style.display = "none";
        }
    });
});



 ///////////////////// REASON OF LEAVING ////////////////

        // Cache for reasons of leaving school
        const reasonsOfLeaving = [
            'At his / her own request',
            'Relocation',
            'Change of School',
            'Financial Reasons',
            'Health Reasons',
            'Permanent Move Abroad',
            'Academic Reasons',
            'Behavioural Issues',
            'Lack of Satisfaction',
            'Completion of Education Level',
            'Personal/Family Issues',
            'Special Educational Needs',
            'Bullying or Safety Concerns',
            'Extracurricular Opportunities'
        ];
        let reasonsOfLeavingFetched = false;

        // Function to display reason of leaving suggestions
        function displayReasonOfLeavingSuggestions() {
            const reasonLeavingInput = document.getElementById('reasonLeaving');
            const reasonLeavingSuggestionsContainer = document.getElementById('reasonLeavingSuggestion');

            // Show suggestion box
            reasonLeavingSuggestionsContainer.style.display = "block";
            const query = reasonLeavingInput.value.toLowerCase().trim();

            if (!reasonsOfLeavingFetched) {
                showLoading(reasonLeavingSuggestionsContainer);

                // Simulate an async data fetch
                setTimeout(() => {
                    reasonsOfLeavingFetched = true;
                    filterAndDisplayReasonOfLeavingSuggestions(query, reasonLeavingSuggestionsContainer);
                }, 500);
            } else {
                filterAndDisplayReasonOfLeavingSuggestions(query, reasonLeavingSuggestionsContainer);
            }
        }

        // Function to filter and display reason of leaving suggestions
        function filterAndDisplayReasonOfLeavingSuggestions(query, suggestionsContainer) {
            const filteredReasons = reasonsOfLeaving.filter(reason => reason.toLowerCase().startsWith(query));
            suggestionsContainer.innerHTML = '';

            if (filteredReasons.length > 0) {
                filteredReasons.forEach(reason => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = reason;
                    suggestionItem.dataset.value = reason;
                    suggestionsContainer.appendChild(suggestionItem);
                });
            } else {
                showNoResults(suggestionsContainer);
            }

            // Add event listeners for selection
            suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('mousedown', function () {
                    const reasonLeavingInput = document.getElementById('reasonLeaving');
                    reasonLeavingInput.value = this.dataset.value;
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.style.display = "none";
                });
            });
        }

        // Function to show a loading indicator
        function showLoading(container) {
            container.innerHTML = '<div class="loading">Loading...</div>';
        }

        // Function to show "No Results" message
        function showNoResults(container) {
            container.innerHTML = '<div class="no-results">No results found</div>';
        }

        // Initialization of reason of leaving suggestion box
        document.addEventListener("DOMContentLoaded", function () {
            const reasonLeavingInput = document.getElementById('reasonLeaving');
            const reasonLeavingSuggestionsContainer = document.getElementById('reasonLeavingSuggestion');

            // Add event listeners for input, focus, and click events
            reasonLeavingInput.addEventListener('input', displayReasonOfLeavingSuggestions);
            reasonLeavingInput.addEventListener('focus', displayReasonOfLeavingSuggestions);
            reasonLeavingInput.addEventListener('click', displayReasonOfLeavingSuggestions);

            document.addEventListener('click', function (event) {
                if (!reasonLeavingSuggestionsContainer.contains(event.target) && !reasonLeavingInput.contains(event.target)) {
                    reasonLeavingSuggestionsContainer.style.display = "none";
                }
            });
        });


///////////////// PROGRESS SUGGESTIONS ////////////////

const progressDescriptions = [
    'Excellent',
    'Very Good',
    'Good',
    'Satisfactory',
    'Average',
    'Poor'
];
let progressDescriptionsFetched = false;

// Function to display progress suggestions
function displayProgressSuggestions() {
    const progressInput = document.getElementById('progress');
    const progressSuggestionsContainer = document.getElementById('progressSuggestion');

    // Show suggestion box
    progressSuggestionsContainer.style.display = "block";
    const query = progressInput.value.toLowerCase().trim();

    if (!progressDescriptionsFetched) {
        showLoading(progressSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            progressDescriptionsFetched = true;
            filterAndDisplayProgressSuggestions(query, progressSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayProgressSuggestions(query, progressSuggestionsContainer);
    }
}

// Function to filter and display progress suggestions
function filterAndDisplayProgressSuggestions(query, suggestionsContainer) {
    const filteredDescriptions = progressDescriptions.filter(description => description.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredDescriptions.length > 0) {
        filteredDescriptions.forEach(description => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = description;
            suggestionItem.dataset.value = description;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const progressInput = document.getElementById('progress');
            progressInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
        });
    });
}

// Function to show a loading indicator
function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Function to show "No Results" message
function showNoResults(container) {
    container.innerHTML = '<div class="no-results">No results found</div>';
}

// Initialization of progress suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const progressInput = document.getElementById('progress');
    const progressSuggestionsContainer = document.getElementById('progressSuggestion');

    // Add event listeners for input, focus, and click events
    progressInput.addEventListener('input', displayProgressSuggestions);
    progressInput.addEventListener('focus', displayProgressSuggestions);
    progressInput.addEventListener('click', displayProgressSuggestions);

    document.addEventListener('click', function (event) {
        if (!progressSuggestionsContainer.contains(event.target) && !progressInput.contains(event.target)) {
            progressSuggestionsContainer.style.display = "none";
        }
    });
});


///////////// CONDUCT SUGGESTIONS ///////////////

const conductDescriptions = [
    'Excellent',
    'Very Good',
    'Good',
    'Average',
    'Poor'
];
let conductDescriptionsFetched = false;

// Function to display conduct suggestions
function displayConductSuggestions() {
    const conductInput = document.getElementById('conduct');
    const conductSuggestionsContainer = document.getElementById('conductSuggestion');

    // Show suggestion box
    conductSuggestionsContainer.style.display = "block";
    const query = conductInput.value.toLowerCase().trim();

    if (!conductDescriptionsFetched) {
        showLoading(conductSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            conductDescriptionsFetched = true;
            filterAndDisplayConductSuggestions(query, conductSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayConductSuggestions(query, conductSuggestionsContainer);
    }
}

// Function to filter and display conduct suggestions
function filterAndDisplayConductSuggestions(query, suggestionsContainer) {
    const filteredDescriptions = conductDescriptions.filter(description => description.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredDescriptions.length > 0) {
        filteredDescriptions.forEach(description => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = description;
            suggestionItem.dataset.value = description;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const conductInput = document.getElementById('conduct');
            conductInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
        });
    });
}

// Function to show a loading indicator
function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Function to show "No Results" message
function showNoResults(container) {
    container.innerHTML = '<div class="no-results">No results found</div>';
}

// Initialization of conduct suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const conductInput = document.getElementById('conduct');
    const conductSuggestionsContainer = document.getElementById('conductSuggestion');

    // Add event listeners for input, focus, and click events
    conductInput.addEventListener('input', displayConductSuggestions);
    conductInput.addEventListener('focus', displayConductSuggestions);
    conductInput.addEventListener('click', displayConductSuggestions);

    document.addEventListener('click', function (event) {
        if (!conductSuggestionsContainer.contains(event.target) && !conductInput.contains(event.target)) {
            conductSuggestionsContainer.style.display = "none";
        }
    });
});


////////////// RESULT SUGGESTIONS ///////////

const resultDescriptions = [
    'Pass',
    'Fail',
    'Promoted',
    'Detained',
    'Incomplete'
];
let resultDescriptionsFetched = false;

// Function to display result suggestions
function displayResultSuggestions() {
    const resultInput = document.getElementById('result');
    const resultSuggestionsContainer = document.getElementById('resultSuggestion');

    // Show suggestion box
    resultSuggestionsContainer.style.display = "block";
    const query = resultInput.value.toLowerCase().trim();

    if (!resultDescriptionsFetched) {
        showLoading(resultSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            resultDescriptionsFetched = true;
            filterAndDisplayResultSuggestions(query, resultSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayResultSuggestions(query, resultSuggestionsContainer);
    }
}

// Function to filter and display result suggestions
function filterAndDisplayResultSuggestions(query, suggestionsContainer) {
    const filteredDescriptions = resultDescriptions.filter(description => description.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredDescriptions.length > 0) {
        filteredDescriptions.forEach(description => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = description;
            suggestionItem.dataset.value = description;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const resultInput = document.getElementById('result');
            resultInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
        });
    });
}

// Function to show a loading indicator
function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Function to show "No Results" message
function showNoResults(container) {
    container.innerHTML = '<div class="no-results">No results found</div>';
}

// Initialization of result suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const resultInput = document.getElementById('result');
    const resultSuggestionsContainer = document.getElementById('resultSuggestion');

    // Add event listeners for input, focus, and click events
    resultInput.addEventListener('input', displayResultSuggestions);
    resultInput.addEventListener('focus', displayResultSuggestions);
    resultInput.addEventListener('click', displayResultSuggestions);

    document.addEventListener('click', function (event) {
        if (!resultSuggestionsContainer.contains(event.target) && !resultInput.contains(event.target)) {
            resultSuggestionsContainer.style.display = "none";
        }
    });
});


/////////////////// REMARKS /////////////////

// Cache for remark suggestions
const remarkDescriptions = [
    'Promoted to Next Class',
    'Good',
    'Very Good',
    'Excellent',
    'Needs Improvement',
    'Satisfactory'
];
let remarkDescriptionsFetched = false;

// Function to display remark suggestions
function displayRemarkSuggestions() {
    const remarkInput = document.getElementById('remark');
    const remarkSuggestionsContainer = document.getElementById('remarkSuggestion');

    // Show suggestion box
    remarkSuggestionsContainer.style.display = "block";
    const query = remarkInput.value.toLowerCase().trim();

    if (!remarkDescriptionsFetched) {
        showLoading(remarkSuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            remarkDescriptionsFetched = true;
            filterAndDisplayRemarkSuggestions(query, remarkSuggestionsContainer);
        }, 500);
    } else {
        filterAndDisplayRemarkSuggestions(query, remarkSuggestionsContainer);
    }
}

// Function to filter and display remark suggestions
function filterAndDisplayRemarkSuggestions(query, suggestionsContainer) {
    const filteredDescriptions = remarkDescriptions.filter(description => description.toLowerCase().startsWith(query));
    suggestionsContainer.innerHTML = '';

    if (filteredDescriptions.length > 0) {
        filteredDescriptions.forEach(description => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent = description;
            suggestionItem.dataset.value = description;
            suggestionsContainer.appendChild(suggestionItem);
        });
    } else {
        showNoResults(suggestionsContainer);
    }

    // Add event listeners for selection
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function () {
            const remarkInput = document.getElementById('remark');
            remarkInput.value = this.dataset.value;
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = "none";
        });
    });
}

// Function to show a loading indicator
function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Function to show "No Results" message
function showNoResults(container) {
    container.innerHTML = '<div class="no-results">No results found</div>';
}

// Initialization of remark suggestion box
document.addEventListener("DOMContentLoaded", function () {
    const remarkInput = document.getElementById('remark');
    const remarkSuggestionsContainer = document.getElementById('remarkSuggestion');

    // Add event listeners for input, focus, and click events
    remarkInput.addEventListener('input', displayRemarkSuggestions);
    remarkInput.addEventListener('focus', displayRemarkSuggestions);
    remarkInput.addEventListener('click', displayRemarkSuggestions);

    document.addEventListener('click', function (event) {
        if (!remarkSuggestionsContainer.contains(event.target) && !remarkInput.contains(event.target)) {
            remarkSuggestionsContainer.style.display = "none";
        }
    });
});


//////////////////////// GENERATE BUTTON //////////////

document.getElementById('submitGenerateTCForm').addEventListener('click', async function(event) {
    const requiredFields = {
        'studentName': 'Student Name',
        'motherName': 'Mother\'s Name',
        'dob': 'Date of Birth (DOB)',
        'placeOfBirth': 'Place of Birth',
        'nationality': 'Nationality',
        'religion': 'Religion',
        'category': 'Category',
        'caste': 'Caste',
        'aadharId': 'Aadhar ID',
        'tc_grNo': 'Gr No',
        'tc_section': 'Section',
        'tc_class': 'Current Class',
        'saralId': 'Saral ID',
        'aaparId': 'Aapar ID',
        'penId': 'PEN ID',
        'lastSchool': 'Last School',
        'dateOfAdmission': 'Date of Admission',
        'classOfAdmission': 'Class of Admission',
        'tcNo': 'TC No',
        'dateOfLeaving': 'Date of Leaving',
        'standardLeaving': 'Standard when Leaving',
        'reasonLeaving': 'Reason of Leaving',
        'progress': 'Progress',
        'conduct': 'Conduct',
        'result': 'Result',
        'remark': 'Remark'
    };

    let isValid = true;
    let missingFields = [];

    Object.keys(requiredFields).forEach(function(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            isValid = false;
            const label = requiredFields[fieldId];
            missingFields.push(label);
        }
    });

    if (!isValid) {
        const missingFieldsList = missingFields.map(field => `<li>${field}</li>`).join('');
        Swal.fire({
            icon: 'warning',
            title: 'Missing Fields',
            html: `The following fields are required: <ul>${missingFieldsList}</ul>`,
        });
    } else {
        // Fetch 'schoolName' and 'username' from cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
        const schoolName = cookies['schoolName'];
        const loginName = cookies['username'];

        if (schoolName && loginName) {
            try {
                const fetchSchoolDetailsResponse = await fetch(`/fetch-tc-school-details?loginName=${loginName}&schoolName=${schoolName}`);
                const schoolDetails = await fetchSchoolDetailsResponse.json();

                let tcformdata = {
                    schoolName,
                    loginName,
                    ...schoolDetails
                };

                Object.keys(requiredFields).forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    tcformdata[fieldId] = field.value.trim();
                });

                sessionStorage.setItem('tcformdata', JSON.stringify(tcformdata));

                console.log('TC Form Data:', tcformdata);

                await deactivateStudent(tcformdata.tc_section.toLowerCase(), tcformdata.tc_grNo);

                await deleteAndroidUser(tcformdata.tc_section.toLowerCase(), tcformdata.tc_grNo);

                await deleteTransportAlloted(tcformdata.tc_section.toLowerCase(), tcformdata.tc_grNo);

                Swal.fire({
                    icon: 'success',
                    title: 'Form Submitted',
                    text: 'All fields are filled correctly, data has been sent to the server, and student, Android user, and transport allotment processing has started.',
                });

                // Show the overlay here
                // Call your overlay display function here
                // Example: showOverlay();

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: error.message,
                });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Missing Cookies',
                text: 'Required cookies "schoolName" and "username" are missing.',
            });
        }
    }
});


async function deactivateStudent(section, grno) {
    console.log('Deactivate Student called with:', { section, grno }); // Log for debugging

    try {
        const response = await fetch('/deactivate-student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ section, grno })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Student deactivated successfully:', result);
        } else {
            console.error('Failed to deactivate student:', result);
        }
    } catch (error) {
        console.error('Error deactivating student:', error);
    }
}

async function deleteAndroidUser(section, grno) {
    console.log('Delete Android User called with:', { section, grno }); // Log for debugging

    try {
        const response = await fetch('/delete-android-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ section, grno })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Android user deleted successfully:', result);
        } else {
            console.error('Failed to delete Android user:', result);
        }
    } catch (error) {
        console.error('Error deleting Android user:', error);
    }
}

async function deleteTransportAlloted(section, grno) {
    console.log('Delete Transport Alloted called with:', { section, grno }); // Log for debugging

    try {
        const response = await fetch('/delete-transport-alloted', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ section, grno })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Transport allotment deleted successfully:', result);
        } else {
            console.error('Failed to delete transport allotment:', result);
        }
    } catch (error) {
        console.error('Error deleting transport allotment:', error);
    }
}