// ✅ Populate form when update page loads
document.addEventListener("DOMContentLoaded", function () {
    const studentDataString = sessionStorage.getItem("studentData");

    if (studentDataString) {
        const studentData = JSON.parse(studentDataString);
        populateStudentForm(studentData);

        // 🗑️ Clear session storage after using it
        sessionStorage.removeItem("studentData");
    }
});

// Function to populate the form fields
function populateStudentForm(studentData) {
    if (!studentData) return;

    function setValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || "";
        } else {
            console.warn(`Element with ID '${id}' not found.`);
        }
    }

    // setValue("fulllName", studentData.Name);
    setValue("fulllName", populateNameFields(studentData.Name));
    setValue("grNo", studentData.Grno);
    setValue("dob", formatDateForInput(studentData.DOB));
    setValue("city_village", studentData.Address);
    setValue("selectedDocuments", displaySelectedDocuments(studentData.Documents_Submitted));

    setValue("gender", studentData.Gender);
    setValue("lastName", studentData.Surname);
    setValue("middleName", studentData.Middlename);
    setValue("firstName", studentData.Firstname);
    setValue("division", studentData.Division);
    setValue("standard", studentData.Standard);
    setValue("age", studentData.Age);
    setValue("section", studentData.Section);
    setValue("placeOfBirth", studentData.POB);
    setValue("studentContact", studentData.student_phone_no);
    setValue("motherTongue", studentData.Mother_Tongue);
    setValue("category", studentData.Category);
    setValue("caste", studentData.Caste);
    setValue("lastSchoolAttended", studentData.Last_School);
    setValue("admissionDate", formatDateForInput(studentData.Admission_Date));


    setValue("pickDropAddress", studentData.Address);
    setValue("aadhaar", studentData.Adhar_no);
    setValue("religion", studentData.Religion);
    setValue("nationality", studentData.Nationality);
    setValue("domicile", studentData.Domicile);
    setValue("bus", studentData.Buss);
    setValue("fatherFirstName", studentData.Father_name);
    setValue("fatherQualification", studentData.F_qualification);
    setValue("fatherOccupation", studentData.f_occupation);
    setValue("fatherContact", studentData.f_mobile_no);
    setValue("motherFirstName", studentData.Mother_name);
    setValue("motherQualification", studentData.M_Qualification);
    setValue("motherOccupation", studentData.M_occupation);
    setValue("motherContact", studentData.M_mobile_no);
    setValue("bloodGroup", studentData.Blood_Group);
    setValue("transportNeeded", studentData.transport_needed);
    setValue("transportTagged", studentData.transport_tagged);
    setValue("transportPickupDrop", studentData.transport_pickup_drop);
    setValue("landmak", studentData.landmark);
    setValue("taluka", studentData.taluka);
    setValue("district", studentData.district);
    setValue("state", studentData.state);
    setValue("pinCode", studentData.pin_code);
    setValue("guardianName", studentData.guardian_name);
    setValue("guardianContact", studentData.guardian_contact);
    setValue("guardianRelation", studentData.guardian_relation);
    setValue("guardianAddress", studentData.guardian_address);
    setValue("guardianLandmark", studentData.guardian_landmark);
    setValue("guardianPinCode", studentData.guardian_pin_code);
    setValue("classCompleted", studentData.class_completed);
    setValue("percentageLastSchool", studentData.percentage_last_school);
    setValue("studentPhone", studentData.student_phone_no);
    setValue("totalPackage", studentData.total_package);

    console.log("Student data successfully populated!");
}

/////////////////////Converting Date in to DD-MM-YYYY/////////////////////////////////////
function formatDateForInput(dateString) {
    if (!dateString) return "";
    
    const parts = dateString.split("-");
    if (parts.length !== 3) return ""; // Ensure valid date format

    const [day, month, year] = parts;
    return `${year}-${month}-${day}`; // Convert to "yyyy-MM-dd"
}

//////////////////////////Displaying the Submitted Docment////////////////////////////////////////////
function displaySelectedDocuments(documentsString) {
    if (!documentsString) return; // Exit if no documents

    selectedDocumentsContainer.innerHTML = ""; // Clear previous selections
    selectedDocuments = []; // Reset selected documents array

    const documents = documentsString.split(",").map(doc => doc.trim()); // Convert string to array

    documents.forEach(doc => {
        addDocument(doc); // Use the existing function to add documents properly
    });
}

///////////////////Display Full Name////////////////////////////////////////
function populateNameFields(fullName) {
    if (!fullName) return; // Exit if no name found

    const nameParts = fullName.trim().split(" "); // Split full name into parts
    document.getElementById("firstName").value = nameParts[0] || ""; 
    document.getElementById("middleName").value = nameParts[1] || ""; 
    document.getElementById("lastName").value = nameParts[2] || ""; 

    updateFullName(); // Ensure the fullName field is updated correctly
}