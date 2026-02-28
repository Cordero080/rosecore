// Caption config for the gallery page.
// Each category has a default caption used for all photos,
// plus an optional per-filename override map.
//
// To add a specific caption: use just the filename (not the full path).
// Example:  'my-beach-photo.jpeg': 'Playa Rincón'

export const scenery = {
  label: 'The Coast',
  defaultCaption: 'Samaná, Dominican Republic',
  captions: {
    // 'filename.jpeg': 'Specific Beach Name',
  },
}

export const property = {
  label: 'La Dolce Vita',
  defaultCaption: 'The Residence',
  captions: {
    // 'filename.jpeg': 'The Master Suite',
  },
}
