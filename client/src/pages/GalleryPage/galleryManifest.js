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
  label: 'La Dolce Vita · Apt 2',
  defaultCaption: 'The Residence',
  defaultAlt: 'La Dolce Vita private residence — Las Terrenas, Samaná, Dominican Republic',

  // Explicit slide order — filenames in the sequence they should appear
  order: [
    'flowers-property.jpg',
    'porch-2.jpg',
    'Porch.jpg',
    'living-room.jpg',
    'kitchen.jpg',
    'kitchen-angle.jpg',
    'twin-bed.jpg',
    'bathroom.jpg',
    'master-bed.jpg',
    'master-bath.jpg',
    'pool.jpg',
  ],

  captions: {
    'flowers-property.jpg': 'The Arrival',
    'porch-2.jpg':          'The Terrace',
    'Porch.jpg':            'Terrace at Dusk',
    'living-room.jpg':      'The Living Room',
    'kitchen.jpg':          'The Kitchen',
    'kitchen-angle.jpg':    'Kitchen, Open Plan',
    'twin-bed.jpg':         'The Second Bedroom',
    'bathroom.jpg':         'The Hallway Bathroom',
    'master-bed.jpg':       'The Master Bedroom',
    'master-bath.jpg':      'The Master Bathroom',
    'pool.jpg':             'The Private Pool',
  },

  alts: {
    'flowers-property.jpg': 'Exterior view of La Dolce Vita private residence, Las Terrenas, Dominican Republic',
    'porch-2.jpg':          'Terrace at La Dolce Vita residence, Las Terrenas',
    'Porch.jpg':            'Evening terrace at La Dolce Vita with Caribbean views, Las Terrenas',
    'living-room.jpg':      'Living room at La Dolce Vita private residence, Las Terrenas',
    'kitchen.jpg':          'Full kitchen at La Dolce Vita private residence, Las Terrenas',
    'kitchen-angle.jpg':    'Open-plan kitchen at La Dolce Vita private residence, Las Terrenas',
    'twin-bed.jpg':         'Second bedroom with twin beds at La Dolce Vita, Las Terrenas',
    'bathroom.jpg':         'Hallway bathroom at La Dolce Vita private residence, Las Terrenas',
    'master-bed.jpg':       'Master bedroom at La Dolce Vita private residence, Las Terrenas',
    'master-bath.jpg':      'Master bathroom at La Dolce Vita private residence, Las Terrenas',
    'pool.jpg':             'Private pool at La Dolce Vita residence, Las Terrenas, Dominican Republic',
  },
}
