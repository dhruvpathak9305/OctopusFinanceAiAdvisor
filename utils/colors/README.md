# Subcategory Color Generator

A utility for automatically generating harmonious colors for subcategories based on their parent category color.

## Features

- Generate color variations from any base color
- Create subcategory colors that complement parent category colors
- Auto-generate colors based on subcategory name for consistent results
- Support for generating color palettes

## API

### `generateColorShade`

```typescript
generateColorShade(
  baseColor: string,
  variation: number = 0,
  intensity: number = 15
): string
```

Generates a shade variation of a base color.

**Parameters:**

- `baseColor` - The parent color in hex format (e.g., "#22c55e")
- `variation` - Value 0-3 that determines the type of variation:
  - 0: lighter
  - 1: darker
  - 2: more saturated in dominant channel
  - 3: mix adjacent values
- `intensity` - How strong the variation should be (10-30 recommended)

**Returns:** New color in hex format

### `generateSubcategoryColor`

```typescript
generateSubcategoryColor(
  parentColor: string,
  subcategoryName: string
): string
```

Generates a color for a subcategory based on parent category color and subcategory name.

**Parameters:**

- `parentColor` - The parent category color (e.g., category.ring_color)
- `subcategoryName` - The name of the subcategory

**Returns:** A color suitable for the subcategory

## Integration

For integration examples with the subcategory form, see the `examples/` directory:

- `examples/SubcategoryFormExample.tsx`
- `examples/ModifiedSubcategoryForm.tsx`

## Implementation Details

The color generator uses a deterministic algorithm to ensure that:

1. The same subcategory name always gets similar colors
2. Colors maintain a visual relationship with their parent category
3. Related subcategories get visually harmonious colors

The algorithm:

- Uses character codes from the subcategory name to determine variation type
- Adjusts intensity based on subcategory attributes
- Preserves the general color family of the parent category
