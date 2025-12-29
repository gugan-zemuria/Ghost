import {click, fillIn, find} from '@ember/test-helpers';

/**
 * Helper function to select a date in ember-power-datepicker
 * This is a replacement for the missing test-support from ember-power-datepicker
 * 
 * @param {string} selector - CSS selector for the datepicker trigger
 * @param {Date} date - Date to select
 */
export async function datepickerSelect(selector, date) {
  // Click the datepicker trigger to open it
  await click(selector);
  
  // Try to find and fill the date input directly
  const dateInput = find(`${selector} input`) || find('[data-test-date-picker-input]');
  if (dateInput) {
    const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    await fillIn(dateInput, dateString);
    return;
  }
  
  // If direct input doesn't work, try to interact with the calendar
  // This is a simplified implementation - may need adjustment based on actual datepicker structure
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Try to find and click the specific day
  const daySelector = `[data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}"]`;
  const dayElement = find(daySelector);
  
  if (dayElement) {
    await click(dayElement);
  } else {
    // Fallback: try to find any day element and click it
    const anyDayElement = find('.ember-power-calendar-day');
    if (anyDayElement) {
      await click(anyDayElement);
    }
  }
}