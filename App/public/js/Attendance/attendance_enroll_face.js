///////////////////////////////   OVERLAY 1  //////////////////////////


////////////////////// SUGGESTIONS ///////////////////

////////////////////// CATEGORY SUGGESTIONS ///////////////////

// Function to display category suggestions
function displayCategorySuggestions() {
    const categoryInput = document.getElementById('enroll_category');
    const categorySuggestionsContainer = document.getElementById('categorySuggestions');

    categorySuggestionsContainer.style.display = "block";
    const query = categoryInput.value.toLowerCase().trim();

    // Check if the data has already been fetched
    if (!categoryDataFetched) {
        showLoading(categorySuggestionsContainer);

        // Simulate an async data fetch
        setTimeout(() => {
            categoryCache = [
                "Student", "Teacher", "Admin", "Support Staff", "Others"
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
        filteredCategories.slice(0, 10).forEach(category => { // Display up to 10 suggestions
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

////////////////////// NAME SUGGESTIONS ///////////////////


// Function to display name suggestions with debounce
const displayNameSuggestions = debounce(function () {
    const nameInput = document.getElementById('enroll_name');
    const nameSuggestionsContainer = document.getElementById('nameSuggestions');
    const selectedCategory = document.getElementById('enroll_category').value;

    nameSuggestionsContainer.style.display = "block";
    const query = nameInput.value.toLowerCase().trim();

    if (!selectedCategory || selectedCategory === 'Others') {
        nameSuggestionsContainer.innerHTML = '<div class="no-results">Select a category first</div>';
        return;
    }

    showLoading(nameSuggestionsContainer);

    let endpoint = '/get-students-to-enroll-face';
    let categoryParam = '';

    // Dynamic endpoint to filter category specific details

    if (selectedCategory === 'Teacher') {
        endpoint = '/get-teachers-to-enroll-face';
        categoryParam = 'teacher';
    } else if (selectedCategory === 'Admin') {
        endpoint = '/get-teachers-to-enroll-face';
        categoryParam = 'admin';
    } else if (selectedCategory === 'Support Staff') {
        endpoint = '/get-teachers-to-enroll-face';
        categoryParam = 'support_staff';
    } else if (selectedCategory === 'Student') {
        endpoint = '/get-students-to-enroll-face';
    }

    // Fetch data from server
    fetch(`${endpoint}?q=${query}&category=${categoryParam}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                nameSuggestionsContainer.innerHTML = '';
                data.slice(0, 10).forEach(item => { // Display up to 10 suggestions
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = item.Grno ? `${item.Grno} | ${item.Name}` : `${item.id} | ${item.name}`;
                    suggestionItem.dataset.value = item.Name || item.name;
                    suggestionItem.dataset.id = item.Grno || item.id; // Store the Grno or id
                    suggestionItem.dataset.section = item.Section || selectedCategory; // Store the section
                    suggestionItem.dataset.standard = item.Standard ? `${item.Standard} ${item.Division}` : 'NA'; // Store the standard + division or 'NA'
                    suggestionItem.dataset.standardRaw = item.Standard || 'NA'; // Store the raw standard for filling
                    nameSuggestionsContainer.appendChild(suggestionItem);
                });
            } else {
                showNoResults(nameSuggestionsContainer);
            }
        })
        .catch(error => {
            console.error('Error fetching name suggestions:', error);
            showNoResults(nameSuggestionsContainer);
        });
}, 300); // Debounce for 300ms

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Fill other details when a suggestion is selected
function fillDetails(event) {
    const selectedName = event.target.dataset.value;
    const selectedId = event.target.dataset.id;
    const selectedSection = event.target.dataset.section;
    const selectedStandard = event.target.dataset.standard;

    document.getElementById('enroll_name').value = selectedName;
    document.getElementById('enroll_grId').value = selectedId;
    document.getElementById('enroll_section').value = selectedSection;
    document.getElementById('enroll_standard').value = selectedStandard;

    document.getElementById('nameSuggestions').innerHTML = '';
}

// Initialization of category and name suggestion boxes
document.addEventListener("DOMContentLoaded", function () {
    const categoryInput = document.getElementById('enroll_category');
    const categorySuggestionsContainer = document.getElementById('categorySuggestions');
    const nameInput = document.getElementById('enroll_name');
    const nameSuggestionsContainer = document.getElementById('nameSuggestions');

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

    nameInput.addEventListener('input', debounce(displayNameSuggestions, 300)); // Debounce input events
    nameInput.addEventListener('focus', displayNameSuggestions); // Display suggestions on focus
    nameInput.addEventListener('click', displayNameSuggestions); // Display suggestions on click

    nameSuggestionsContainer.addEventListener('click', fillDetails); // Fill details on selection

    document.addEventListener('click', function (event) {
        if (!categorySuggestionsContainer.contains(event.target) && !categoryInput.contains(event.target)) {
            categorySuggestionsContainer.innerHTML = '';
        }
        if (!nameSuggestionsContainer.contains(event.target) && !nameInput.contains(event.target)) {
            nameSuggestionsContainer.innerHTML = '';
        }
    });
});

// Helper function to show loading indicator
function showLoading(container) {
    container.innerHTML = '<div class="no-results">Loading...</div>';
}

// Helper function to show no results message
function showNoResults(container) {
    container.innerHTML = '<div class="no-results">No results found</div>';
}

let categoryCache = [];
let categoryDataFetched = false;
let nameCache = [];
let nameDataFetched = false;

// Clear fields when category changes
function clearFieldsOnCategoryChange() {
    document.getElementById('enroll_name').value = '';
    document.getElementById('enroll_grId').value = '';
    document.getElementById('enroll_section').value = '';
    document.getElementById('enroll_standard').value = '';
}

// Clear fields when name changes
function clearFieldsOnNameChange() {
    document.getElementById('enroll_grId').value = '';
    document.getElementById('enroll_section').value = '';
    document.getElementById('enroll_standard').value = '';
}

// Initialization of wiping fields on input change
document.addEventListener("DOMContentLoaded", function () {
    const categoryInput = document.getElementById('enroll_category');
    const nameInput = document.getElementById('enroll_name');

    // Add event listeners for wiping fields on input change
    categoryInput.addEventListener('input', clearFieldsOnCategoryChange);
    nameInput.addEventListener('input', clearFieldsOnNameChange);
});

/////////////////////////////// IMAGE CAPTURING FUNCTIONALITY /////////////////

document.addEventListener('DOMContentLoaded', () => {
    // Function to set up image slot functionality
    function setupImageSlot(slotNumber) {
        const startWebcamButton = document.getElementById(`startWebcam${slotNumber}`);
        const captureImageButton = document.getElementById(`captureImage${slotNumber}`);
        const stopWebcamButton = document.getElementById(`stopWebcam${slotNumber}`);
        const webcam = document.getElementById(`webcam${slotNumber}`);
        const webcamCanvas = document.getElementById(`webcamCanvas${slotNumber}`);
        const imageUpload = document.getElementById(`imageUpload${slotNumber}`);
        const imagePreview = document.getElementById(`imagePreview${slotNumber}`);
        let stream = null;

        // Start Webcam
        startWebcamButton.addEventListener('click', async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                webcam.srcObject = stream;
                webcam.style.display = 'block';
                startWebcamButton.style.display = 'none';
                captureImageButton.style.display = 'inline-block';
                stopWebcamButton.style.display = 'inline-block';
            } catch (error) {
                console.error(`Error accessing webcam for slot ${slotNumber}:`, error);
                alert('Could not access the webcam. Please ensure it is connected and permissions are granted.');
            }
        });

        // Capture Image from Webcam
        captureImageButton.addEventListener('click', () => {
            const context = webcamCanvas.getContext('2d');
            webcamCanvas.width = webcam.videoWidth;
            webcamCanvas.height = webcam.videoHeight;
            context.drawImage(webcam, 0, 0, webcamCanvas.width, webcamCanvas.height);

            // Convert canvas to JPG image and display in preview
            const imageDataUrl = webcamCanvas.toDataURL('image/jpeg');
            imagePreview.src = imageDataUrl;
            imagePreview.style.display = 'block';

            // Store image data in sessionStorage
            sessionStorage.setItem(`userImage${slotNumber}`, imageDataUrl);

            // Stop the webcam after capturing
            stopWebcam();
        });

        // Stop Webcam
        stopWebcamButton.addEventListener('click', () => {
            stopWebcam();
        });

        function stopWebcam() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                webcam.srcObject = null;
                webcam.style.display = 'none';
                startWebcamButton.style.display = 'inline-block';
                captureImageButton.style.display = 'none';
                stopWebcamButton.style.display = 'none';
            }
        }

        // Handle Image Upload from Device
        imageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';

                    // Store image data in sessionStorage
                    sessionStorage.setItem(`userImage${slotNumber}`, e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Set up all 5 image slots
    for (let i = 1; i <= 5; i++) {
        setupImageSlot(i);
    }

    ///////////////////////////////////////// ENROLL BUTTON FUNCTIONALITY //////////////////////    

    document.getElementById('enrollFaceForm').addEventListener('submit', async (event) => {
        event.preventDefault();
    
        // Get form data & validate required fields
        let isFormValid = true;
        let missingFields = [];
        const formData = {};
        const requiredFields = ["category", "name", "grId", "section", "standard"];
        const formElements = document.getElementById('enrollFaceForm').elements;
    
        for (let element of formElements) {
            if (element.name && element.type !== 'file') {
                formData[element.name] = element.value.trim();
                if (requiredFields.includes(element.name) && !formData[element.name]) {
                    isFormValid = false;
                    missingFields.push(element.name);
                }
            }
        }
    
        // Append images directly into formData & check at least 1 image is provided
        let imageCount = 0;
        for (let i = 1; i <= 5; i++) {
            const userImageData = sessionStorage.getItem(`userImage${i}`);
            if (userImageData) {
                formData[`image${i}`] = userImageData;
                imageCount++;
            }
        }
    
        if (imageCount === 0) {
            isFormValid = false;
            missingFields.push("at least one image");
        }
    
        // If validation fails, show error and stop execution
        if (!isFormValid) {
            await Swal.fire({
                icon: "warning",
                title: "Missing Information!",
                html: `Please fill out: <strong>${missingFields.join(", ")}</strong>`,
            });
            return;  // Stop execution if validation fails
        }
    
        // Initialize Swal loader
        const updateSwal = async (message) => {
            Swal.update({
                title: "Enrolling Face...",
                html: message,
                allowOutsideClick: false,
                showConfirmButton: false,
            });
            Swal.showLoading();
            await new Promise((resolve) => setTimeout(resolve, 1000));  // Smooth UI transition
        };
    
        // Show initial Swal loader
        Swal.fire({
            title: "Processing...",
            html: "🔄 Checking existing enrollment...",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
        });
    
        // Check if user already exists
        try {
            const checkResponse = await fetch('/check-existing-enrollment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: formData.grId,
                    name: formData.name,
                    section: formData.section,
                    standard_division: formData.standard
                })
            });
    
            if (!checkResponse.ok) {
                throw new Error(`Server Error: ${checkResponse.statusText}`);
            }
    
            const checkResult = await checkResponse.json();
            if (checkResult.exists) {
                await Swal.fire({
                    icon: "error",
                    title: "Enrollment Failed",
                    text: "User already exists in the system",
                });
                return;  // Stop execution if user already exists
            }
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "Enrollment Failed",
                text: error.message || "An unexpected error occurred. Please try again.",
            });
            return;
        }
    
        try {
            await updateSwal("🔄 Embedding images...");
            const response = await fetch('/send-face-data-to-enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                throw new Error(`Server Error: ${response.statusText}`);
            }
    
            const result = await response.json();
            await updateSwal("🔄 Storing face details...");
    
            // Success Alert with Dynamic Data
            await Swal.fire({
                icon: "success",
                title: "✅ Face Enrolled Successfully!",
                html: `Face enrolled for <strong>GR No: ${formData.grId}</strong> | <strong>Name: ${formData.name}</strong> | <strong>Standard: ${formData.standard}</strong>`,
            });
    
            // Clear form fields
            document.getElementById('enrollFaceForm').reset();
    
            // Remove images from sessionStorage
            for (let i = 1; i <= 5; i++) {
                sessionStorage.removeItem(`userImage${i}`);
            }
    
            // Clear image previews if displayed
            for (let i = 1; i <= 5; i++) {
                const imgPreview = document.getElementById(`imagePreview${i}`);
                if (imgPreview) imgPreview.src = "";
            }
    
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "❌ Enrollment Failed",
                text: error.message || "An unexpected error occurred. Please try again.",
            });
        }
    });



    /////////////////////////////////////////////////////////////////////////////////

    // Optional: Reset all previews if form is reset
    document.getElementById('enrollFaceForm').addEventListener('reset', () => {
        for (let i = 1; i <= 5; i++) {
            const imagePreview = document.getElementById(`imagePreview${i}`);
            const webcam = document.getElementById(`webcam${i}`);
            const startWebcamButton = document.getElementById(`startWebcam${i}`);
            const captureImageButton = document.getElementById(`captureImage${i}`);
            const stopWebcamButton = document.getElementById(`stopWebcam${i}`);

            imagePreview.src = '';
            imagePreview.style.display = 'none';
            sessionStorage.removeItem(`userImage${i}`);
            if (webcam.srcObject) {
                webcam.srcObject.getTracks().forEach(track => track.stop());
                webcam.srcObject = null;
                webcam.style.display = 'none';
                startWebcamButton.style.display = 'inline-block';
                captureImageButton.style.display = 'none';
                stopWebcamButton.style.display = 'none';
            }
        }
    });
});


///////////////////////////////////////////////////////////////////////////////


/////////////////////// MANAGE FACE ////////////////////////////

// Array to hold manage enrollments data
let manageData = [];

// Function to refresh manage enrollments data
async function refreshManageData() {
    try {
        const response = await fetch('/get-manage-enrollments');

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (result.data && result.data.length > 0) {
            manageData = result.data;
            displayManageTable(manageData);
        } else {
            document.getElementById('manageTableBody').innerHTML = `
                <tr><td colspan="8" style="text-align:center;">No enrollments found.</td></tr>
            `;
            Swal.fire({
                icon: 'info',
                title: 'No Records',
                text: result.message || 'No enrollment data available.',
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error('[REFRESH ERROR]:', error.message);
        Swal.fire({
            icon: 'error',
            title: 'Error Fetching Data',
            text: error.message,
            confirmButtonText: 'Retry'
        });
    }
}

// Function to display manage table
function displayManageTable(enrollments) {
    const tableBody = document.getElementById('manageTableBody');
    tableBody.innerHTML = '';

    enrollments.forEach(enroll => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${enroll.face_record_id}</td>
            <td>${enroll.user_id}</td>
            <td>${enroll.name}</td>
            <td>${enroll.section}</td>
            <td>${enroll.standard_division}</td>
            <td>
                    <button style="background-color: transparent; border: none; color: black; padding: 0; text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; cursor: pointer; max-height: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 10px;"
        onclick="handleDelete('${enroll.face_record_id}', '${enroll.name}', '${enroll.user_id}')"
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 8px 16px rgba(0, 0, 0, 0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0, 0, 0, 0.2)';">
        <img src="../images/delete_vendor.png" alt="Delete" style="width: 25px; height: 25px; border-radius: 0px; margin: 5px;">
        <span style="margin-right: 10px;">Delete</span>
    </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to handle delete
async function handleDelete(faceRecordId, name, user_id) {
    const confirmDelete = await Swal.fire({
        title: 'Delete Face Identity?',
        html: `
            <strong>This will permanently delete the following record:</strong><br><br>
            <b>Name:</b> ${name}<br>
            <b>Gr/ID:</b> ${user_id}<br>
            <b>Record ID:</b> ${faceRecordId}
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (confirmDelete.isConfirmed) {
        try {
            const response = await fetch(`/delete-enrollment/${faceRecordId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted Successfully',
                    html: `
                        <b>${name}</b> with Gr/ID <b>${user_id}</b> (Record ID: <b>${faceRecordId}</b>) has been deleted.
                    `,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                    showConfirmButton: true
                });

                refreshManageData(); // refresh table
            } else {
                throw new Error(result.message || 'Deletion failed.');
            }

        } catch (error) {
            console.error('[DELETE ERROR]:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        }
    }
}

// Function to search the table directly by name or user_id
function searchManageDetails() {
    const searchValue = document.getElementById('manageSearchBar').value.toLowerCase();

    const filteredData = manageData.filter(enroll => {
        return (
            enroll.name.toLowerCase().includes(searchValue) ||
            enroll.user_id.toLowerCase().includes(searchValue)
        );
    });

    displayManageTable(filteredData);
}

// Initialize search listener
document.getElementById('manageSearchBar').addEventListener('input', searchManageDetails);

// Initial data load
// refreshManageData();


//////////////////////////// EXPORT FUNCTION ////////////////////////////////////


function exportManageTable() {
    const table = document.getElementById("manageTable");
    const rows = table.querySelectorAll("tbody tr");

    let csvContent = "";

    // Collect headers dynamically, excluding the last 'Action' column
    const headers = table.querySelectorAll("thead th");
    const headerData = [];
    headers.forEach((header, index) => {
        if (header.textContent.trim().toLowerCase() !== 'action') {
            headerData.push(`"${header.textContent.trim()}"`);
        }
    });
    csvContent += headerData.join(",") + "\n";

    // Collect row data, excluding last cell (Action column)
    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const rowData = [];
        cells.forEach((cell, index) => {
            if (index < cells.length - 1) { // Exclude last column (Action)
                rowData.push(`"${cell.textContent.trim()}"`);
            }
        });
        csvContent += rowData.join(",") + "\n";
    });

    // Create and trigger CSV download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, "Face_Enrollments.csv");
    } else {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "manage_enrollments.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
