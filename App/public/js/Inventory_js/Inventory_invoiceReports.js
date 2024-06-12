////Loading Animation
function showInvoiceLoadingAnimation () {
    console.log("show")
    document.getElementById('loadingOverlayReportsinventory').style.display = 'flex';
}

function hideInvoiceLoadingAnimation() {
    console.log("hide")
    document.getElementById('loadingOverlayReportsinventory').style.display = 'none';
}

$(function () {
    // Initialize datepicker
    $("#datepicker").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function (dateText) {
            fetchDataByDate(dateText);
        }
    });

    let today = $.datepicker.formatDate("yy-mm-dd", new Date());
    $("#datepicker").datepicker("setDate", today);
    fetchDataByDate(today);

    $("#filter-class").change(function () {
        let selectedClass = $(this).val();
        fetchDataByClass(selectedClass);
    });

    $("#defaulter-switch").change(function () {
        if ($(this).is(":checked")) {
            fetchDataByDefaulter(true);
        } else {
            fetchDataByClass($("#filter-class").val());
        }
    });

    function fetchDataByDate(dateText) {
        showInvoiceLoadingAnimation();
        $.ajax({
            url: '/inventory/invoice/query_by_date',
            type: 'GET',
            data: { date: dateText },
            success: function (data) {
                hideInvoiceLoadingAnimation();
                updateUI(data, dateText);
            },
            error: handleError
        });
    }

    function fetchDataByClass(classOfBuyer) {
        showInvoiceLoadingAnimation();
        $.ajax({
            url: '/inventory/invoice/query_by_class',
            type: 'GET',
            data: { class: classOfBuyer },
            success: function (data) {
                hideInvoiceLoadingAnimation()
                updateUI(data, classOfBuyer);
            },
            error: handleError
        });
    }

    function fetchDataByDefaulter(isDefaulter) {
        showInvoiceLoadingAnimation();
        $.ajax({
            url: '/inventory/invoice/query_by_defaulter',
            type: 'GET',
            data: { defaulter: isDefaulter },
            success: function (data) {
                hideInvoiceLoadingAnimation()
                updateUI(data, "Defaulter List");
            },
            error: handleError
        });
    }

    function handleError(xhr, status, error) {
        console.error("Error fetching data:", error);
        hideInvoiceLoadingAnimation();
        showToast("An error occurred while fetching data. Please try again later.");
    }

    function updateUI(data, filterValue) {
        let cashTotal = 0;
        let upiTotal = 0;
        data.forEach(entry => {
            if (entry.mode_of_payment === 'CASH') {
                cashTotal += entry.paid_amount;
            } else if (entry.mode_of_payment === 'UPI') {
                upiTotal += entry.paid_amount;
            }
        });

        animateNumber($(".box:eq(0)").find(".box-number p"), cashTotal);
        animateNumber($(".box:eq(1)").find(".box-number p"), upiTotal);
        animateNumber($(".box:eq(2)").find(".box-number p"), cashTotal + upiTotal);

        $("#collection-date").text(filterValue);

        let totalBills = data.length;
        let netSell = data.reduce((acc, curr) => acc + curr.total_payable, 0);
        let received = data.reduce((acc, curr) => acc + curr.paid_amount, 0);
        let outstanding = data.reduce((acc, curr) => acc + curr.balance_amount, 0);

        animateNumber($(".box:eq(3)").find(".box-number p"), totalBills);
        animateNumber($(".box:eq(4)").find(".box-number p"), netSell);
        animateNumber($(".box:eq(5)").find(".box-number p"), received);
        animateNumber($(".box:eq(6)").find(".box-number p"), outstanding);

        $("#invoice-date").text(filterValue);

        let tableHeading = filterValue === "Defaulter List" ? "Defaulter Details" :
                           !isDate(filterValue) ? "Bills for Class - " + filterValue :
                           "Bills for " + filterValue;
        $("#table-heading").text(tableHeading);
       

        let tableRows = '';
        data.forEach(entry => {
            const billDate = new Date(entry.billDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            tableRows += `
                <tr>
                    <td>${entry.invoiceNo}</td>
                    <td>${billDate}</td>
                    <td>${entry.buyerName}</td>
                    <td>${entry.buyerPhone}</td>
                    <td>${entry.class_of_buyer}</td>
                    <td>${entry.total_payable}</td>
                    <td>${entry.paid_amount}</td>
                    <td>${entry.balance_amount}</td>
                    <td>${entry.mode_of_payment}</td>
                </tr>
            `;
        });
        $("#invoice-table tbody").html(tableRows);
    }

    function isDate(value) {
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }

    function animateNumber(element, endValue) {
        $(element).prop('Counter', 0).animate({
            Counter: endValue
        }, {
            duration: 2000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    }

    function showToast(message, isError) {
        const toastContainer = document.getElementById("toast-container");
    
        // Create a new toast element
        const toast = document.createElement("div");
        toast.classList.add("toast");
        if (isError) {
            toast.classList.add("error");
        }
        toast.textContent = message;
    
        // Append the toast to the container
        toastContainer.appendChild(toast);
    
        // Show the toast
        toast.style.display = 'block';
    
        // Remove the toast after 4 seconds
        setTimeout(function () {
            toast.style.animation = 'slideOutRight 0.5s forwards';
            toast.addEventListener('animationend', function () {
                toast.remove();
            });
        }, 4000);
    }
});
 