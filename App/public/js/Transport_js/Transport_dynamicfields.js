document.addEventListener('DOMContentLoaded', function () {
    const typeSelect = document.getElementById('type');
    const dynamicFields = document.getElementById('dynamicFields');

    typeSelect.addEventListener('change', function () {
        dynamicFields.innerHTML = ''; // Clear existing fields

        if (this.value === 'driver') {
            dynamicFields.innerHTML = `
        <div class="form-group">
            <input type="text" class="form-control" id="vehicleNumber" placeholder=" ">
            <span class="form-control-placeholder">Vehicle Number</span>
        </div>
        <div class="form-group">
            <input type="text" class="form-control" id="vehicleType" placeholder=" ">
            <span class="form-control-placeholder">Vehicle Type</span>
        </div>
        <div class="form-group">
            <input type="number" class="form-control" id="capacity" placeholder=" ">
            <span class="form-control-placeholder">Capacity</span>
        </div>
    `;
        } else if (this.value === 'conductor') {
            dynamicFields.innerHTML = `
        <div class="form-group">
            <select id="conductorFor" class="form-control">
                <option value="bus">Bus</option>
                <option value="van">Van</option>
            </select>
            <span class="form-control-placeholder">Conductor for</span>
        </div>
    `;
        }
    });
});
