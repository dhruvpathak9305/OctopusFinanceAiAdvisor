# Auto-Color Generation for Subcategories

## Implementation

I've implemented automatic color generation for subcategories in the `SubcategoryForm.tsx` component. The feature:

1. Automatically generates a random color for new subcategories as soon as the modal opens
2. Uses the parent category's color theme to generate a harmonious color
3. Allows users to manually select colors if they prefer
4. Maintains manual color selection in edit mode

## How It Works

1. When the Add Subcategory modal opens, a random color is immediately generated
2. The color is derived from the parent category's color (ring_color) for visual harmony
3. Each time you open the form, you'll get a different random color
4. If you manually select a color, your choice will be preserved

## Testing Instructions

To test the implementation:

1. Open the app and navigate to a budget category
2. Click "+" to add a new subcategory
3. Notice that a color is already assigned when the modal opens
4. Close the modal and open it again - you should see a different color
5. Manually select a different color - this should stick and not get overridden
6. Save the subcategory, then edit it - your manual color choice should be preserved

## Technical Details

The implementation:

1. Uses the `generateSubcategoryColor` function from `utils/colors/SubcategoryColorGenerator.ts`
2. Tracks user color selection with a `userSelectedColor` state variable
3. Only auto-generates colors when:
   - The form is in "add" mode (not "edit" mode)
   - The user hasn't manually selected a color
   - The parent category color is available
4. Uses a random seed value to create variety in the colors

## Code Changes

Added:

- Import for the `generateSubcategoryColor` function
- `userSelectedColor` state to track manual color selections
- Effect hook to generate colors when the modal opens
- Logic to track when user manually selects a color

## Future Improvements

Possible improvements:

- Add a "reset to random" button in the color picker
- Preview multiple color variations for the user to choose from
- Allow color preferences to be saved per category
