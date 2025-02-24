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
