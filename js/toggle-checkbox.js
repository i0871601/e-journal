const allCheckboxes = document.querySelectorAll('.toggle-checkbox');
allCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', (event) => {
    const isChecked = event.target.checked;
    if(isChecked) {
      allCheckboxes.forEach(otherCheckbox => {
        if (otherCheckbox !== event.target) { otherCheckbox.checked = false;} });
    }
  });
});
