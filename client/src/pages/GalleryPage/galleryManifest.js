// Caption and alt text config for the gallery page.
// Each category has defaults used for all photos,
// plus optional per-filename override maps.
//
// To add a specific caption or alt: use just the filename (not the full path).
// Example:  'my-beach-photo.jpeg': 'Playa Rincón'

export const scenery = {
  label: 'The Coast',
  defaultCaption: 'Samaná, Dominican Republic',
  defaultAlt: 'Coastal scenery in Samaná, Dominican Republic — La Dolce Vita, Las Terrenas',
  captions: {
    // 'filename.jpeg': 'Playa Rincón',
  },
  alts: {
    // 'filename.jpeg': 'Sunset over Playa Bonita, Las Terrenas, Dominican Republic',
  },
}

export const property = {
  label: 'La Dolce Vita',
  defaultCaption: 'The Residence',
  defaultAlt: 'La Dolce Vita private residence — Las Terrenas, Samaná, Dominican Republic',
  captions: {
    // 'filename.jpeg': 'The Master Suite',
  },
  alts: {
    'pool.jpg':         'Private pool at La Dolce Vita residence, Las Terrenas, Dominican Republic',
    'master-bed.jpg':   'Master bedroom at La Dolce Vita private residence, Las Terrenas',
    'master-bath.jpg':  'Master bathroom at La Dolce Vita private residence, Las Terrenas',
    'twin-bed.jpg':     'Second bedroom with twin beds at La Dolce Vita, Las Terrenas',
    'bathroom.jpg':     'Second bathroom at La Dolce Vita private residence, Las Terrenas',
    'living-room.jpg':  'Living room at La Dolce Vita private residence, Las Terrenas',
    'kitchen.jpg':      'Full kitchen at La Dolce Vita private residence, Las Terrenas',
    'kitchen-angle.jpg':'Kitchen at La Dolce Vita private residence, Las Terrenas',
    'Porch.jpg':        'Private porch at La Dolce Vita residence with Caribbean views',
    'porch-2.jpg':      'Outdoor terrace at La Dolce Vita residence, Las Terrenas',
    'flowers-property.jpg': 'Tropical garden at La Dolce Vita private residence, Samaná',
  },
}
