export type Category = {
  slug: string;
  name: string;
  blurb: string;
  subcategories: string[];
};

export type Product = {
  id: string;
  partNumber: string;
  name: string;
  categorySlug: string;
  subcategory: string;
  specs: Record<string, string>;
  pricePerEach: number;
  uom: string;
  moq: number;
  leadTimeDays: number;
  inStock: number;
  supplier: string;
  hazmat?: boolean;
};

export const CATEGORIES: Category[] = [
  {
    slug: "frames-structural",
    name: "Frames & Structural Components",
    blurb: "Chair frames, table bases, sofa frames, knock-down hardware.",
    subcategories: [
      "Chair Frames",
      "Sofa & Sectional Frames",
      "Table Bases",
      "Knock-Down Connectors",
    ],
  },
  {
    slug: "casters-glides",
    name: "Casters, Glides & Levelers",
    blurb: "Swivel casters, brake casters, felt glides, threaded levelers.",
    subcategories: [
      "Swivel Casters",
      "Brake Casters",
      "Felt & Nylon Glides",
      "Threaded Levelers",
    ],
  },
  {
    slug: "slides-hinges",
    name: "Drawer Slides & Hinges",
    blurb: "Soft-close slides, undermount slides, concealed cup hinges.",
    subcategories: [
      "Ball-Bearing Slides",
      "Soft-Close Undermount",
      "Concealed Cup Hinges",
      "Piano & Continuous Hinges",
    ],
  },
  {
    slug: "brackets-fasteners",
    name: "Brackets & Fasteners",
    blurb: "Confirmat screws, cam locks, corner braces, threaded inserts.",
    subcategories: [
      "Cam Locks & Dowels",
      "Confirmat Screws",
      "Threaded Inserts",
      "Corner Braces",
    ],
  },
  {
    slug: "upholstery-fabric",
    name: "Upholstery Fabric & Leather",
    blurb: "Performance weaves, bonded leather, contract-grade vinyls.",
    subcategories: [
      "Performance Weave",
      "Bonded Leather",
      "Contract Vinyl",
      "Outdoor Fabric",
    ],
  },
  {
    slug: "foam-cushioning",
    name: "Foam & Cushioning",
    blurb: "HR polyurethane foam, memory foam, polyester fiber wrap.",
    subcategories: [
      "HR Polyurethane",
      "Memory Foam",
      "Polyester Fiber Wrap",
      "Edge Roll",
    ],
  },
  {
    slug: "panels",
    name: "Wood & Composite Panels",
    blurb: "MDF, particleboard, plywood, melamine-faced panels.",
    subcategories: ["MDF", "Particleboard", "Hardwood Plywood", "Melamine Panels"],
  },
  {
    slug: "edge-trim",
    name: "Edge Banding & Trim",
    blurb: "PVC, ABS, and veneer edge banding in matched colorways.",
    subcategories: ["PVC Edge Banding", "ABS Edge Banding", "Wood Veneer", "T-Molding"],
  },
  {
    slug: "finishes",
    name: "Finishes, Stains & Adhesives",
    blurb: "Pre-cat lacquer, water-based polyurethane, hot-melt adhesives.",
    subcategories: [
      "Pre-Cat Lacquer",
      "Water-Based Poly",
      "Stains",
      "Hot-Melt Adhesive",
    ],
  },
  {
    slug: "legs-bases",
    name: "Furniture Legs & Bases",
    blurb: "Tapered hardwood legs, hairpin steel legs, plinth bases.",
    subcategories: ["Hardwood Legs", "Hairpin Steel", "Plinth Bases", "Sled Bases"],
  },
  {
    slug: "knobs-pulls",
    name: "Knobs, Pulls & Decorative Hardware",
    blurb: "Bar pulls, cup pulls, knurled knobs, finger pulls.",
    subcategories: ["Bar Pulls", "Cup Pulls", "Knobs", "Finger / Edge Pulls"],
  },
  {
    slug: "packaging",
    name: "Packaging & Crating",
    blurb: "Double-wall cartons, edge protectors, stretch film, foam-in-place.",
    subcategories: [
      "Cartons & RSC Boxes",
      "Edge & Corner Protectors",
      "Stretch & Strapping",
      "Void Fill",
    ],
  },
];

export const PRODUCTS: Product[] = [
  // Frames
  {
    id: "fr-100",
    partNumber: "FR-2240A1",
    name: "Steel Lounge-Chair Frame, Powder-Coated Black",
    categorySlug: "frames-structural",
    subcategory: "Chair Frames",
    specs: {
      "Load Rating": "300 lb",
      Material: "1.25 in OD Steel Tube, 14 ga",
      Finish: "Textured Powder Coat, Black",
      Dimensions: "26 W x 30 D x 32 H in",
      "Assembly": "Knock-Down, 4 bolts",
    },
    pricePerEach: 84.5,
    uom: "ea",
    moq: 10,
    leadTimeDays: 28,
    inStock: 412,
    supplier: "TaiHo Metalworks",
  },
  {
    id: "fr-101",
    partNumber: "FR-3380B2",
    name: "Kiln-Dried Hardwood Sofa Frame, 84 in, Doweled & Glued",
    categorySlug: "frames-structural",
    subcategory: "Sofa & Sectional Frames",
    specs: {
      "Frame Length": "84 in",
      "Wood Species": "Kiln-Dried Yellow Poplar",
      Joinery: "Doweled + Corner-Blocked + Glued",
      "Web Suspension": "Pirelli + 8-way Hand-Tied",
      Weight: "62 lb",
    },
    pricePerEach: 318.0,
    uom: "ea",
    moq: 4,
    leadTimeDays: 42,
    inStock: 88,
    supplier: "Carolina Frameworks",
  },
  // Casters
  {
    id: "cg-200",
    partNumber: "CG-50TPR-S",
    name: 'Swivel Caster, 50 mm TPR Wheel, Threaded Stem 3/8"-16',
    categorySlug: "casters-glides",
    subcategory: "Swivel Casters",
    specs: {
      "Wheel Dia": "50 mm",
      "Wheel Material": "Thermoplastic Rubber (TPR)",
      "Load Capacity": "75 lb",
      Mount: 'Threaded Stem, 3/8"-16 x 1"',
      "Brake": "None",
    },
    pricePerEach: 2.18,
    uom: "ea",
    moq: 100,
    leadTimeDays: 14,
    inStock: 18420,
    supplier: "Hangzhou Roll-Tek",
  },
  {
    id: "cg-201",
    partNumber: "CG-75PU-BK",
    name: "Brake Caster, 75 mm PU Wheel, Plate-Mount, Total Lock",
    categorySlug: "casters-glides",
    subcategory: "Brake Casters",
    specs: {
      "Wheel Dia": "75 mm",
      "Wheel Material": "Polyurethane on Polyolefin Hub",
      "Load Capacity": "175 lb",
      Mount: "Top Plate, 2-3/8 x 3-5/8 in",
      Brake: "Total Lock (wheel + swivel)",
    },
    pricePerEach: 6.42,
    uom: "ea",
    moq: 50,
    leadTimeDays: 10,
    inStock: 5610,
    supplier: "Colson Group",
  },
  {
    id: "cg-202",
    partNumber: "GL-FELT-19",
    name: "Self-Adhesive Felt Glide, 19 mm Round, Heavy-Duty",
    categorySlug: "casters-glides",
    subcategory: "Felt & Nylon Glides",
    specs: {
      Diameter: "19 mm",
      Thickness: "5 mm",
      Adhesive: "3M VHB Acrylic",
      "Pack Size": "1000 pcs",
    },
    pricePerEach: 0.08,
    uom: "ea",
    moq: 1000,
    leadTimeDays: 7,
    inStock: 240000,
    supplier: "Shepherd Hardware",
  },
  // Slides & Hinges
  {
    id: "sh-300",
    partNumber: "SL-22UM-SC",
    name: 'Undermount Soft-Close Slide, 22", Full Extension, 100 lb',
    categorySlug: "slides-hinges",
    subcategory: "Soft-Close Undermount",
    specs: {
      Length: "22 in",
      Extension: "Full (100%)",
      "Load Rating": "100 lb / pair",
      "Close Type": "Soft-Close, Damped",
      Finish: "Zinc, Clear",
    },
    pricePerEach: 11.9,
    uom: "pr",
    moq: 25,
    leadTimeDays: 21,
    inStock: 1820,
    supplier: "Blum-equivalent",
  },
  {
    id: "sh-301",
    partNumber: "HG-110-CLIP",
    name: 'Concealed Cup Hinge, 110°, Clip-On, 35 mm Cup',
    categorySlug: "slides-hinges",
    subcategory: "Concealed Cup Hinges",
    specs: {
      "Opening Angle": "110°",
      "Cup Dia": "35 mm",
      Overlay: "Full / Half / Inset (3 plates)",
      Mount: "Clip-On",
      "Close Type": "Soft-Close Integrated",
    },
    pricePerEach: 1.35,
    uom: "ea",
    moq: 200,
    leadTimeDays: 14,
    inStock: 42100,
    supplier: "DTC Hardware",
  },
  // Brackets
  {
    id: "bf-400",
    partNumber: "CAM-15-NIK",
    name: "Cam Lock + Dowel Set, 15 mm Cam, Nickel-Plated",
    categorySlug: "brackets-fasteners",
    subcategory: "Cam Locks & Dowels",
    specs: {
      "Cam Dia": "15 mm",
      "Dowel Length": "32 mm",
      Material: "Zinc Alloy, Nickel-Plated",
      "Sold As": "Cam + Dowel, matched set",
    },
    pricePerEach: 0.21,
    uom: "set",
    moq: 1000,
    leadTimeDays: 18,
    inStock: 96400,
    supplier: "Häfele",
  },
  {
    id: "bf-401",
    partNumber: "CFM-7x50",
    name: "Confirmat Screw, 7 x 50 mm, Pozi #3, Black",
    categorySlug: "brackets-fasteners",
    subcategory: "Confirmat Screws",
    specs: {
      Diameter: "7 mm",
      Length: "50 mm",
      Drive: "Pozi #3",
      Coating: "Black Oxide",
      "Pack Size": "1000 / box",
    },
    pricePerEach: 0.06,
    uom: "ea",
    moq: 1000,
    leadTimeDays: 7,
    inStock: 215000,
    supplier: "Spax Industrial",
  },
  // Fabric
  {
    id: "uf-500",
    partNumber: "PF-NAVY-54",
    name: "Performance Weave, 54 in, Navy, 100k Double Rubs",
    categorySlug: "upholstery-fabric",
    subcategory: "Performance Weave",
    specs: {
      Width: "54 in",
      Composition: "100% Solution-Dyed Polyester",
      Abrasion: "100,000 Double Rubs (Wyzenbeek)",
      "Cleaning Code": "W/S",
      Backing: "Acrylic",
    },
    pricePerEach: 18.75,
    uom: "yd",
    moq: 30,
    leadTimeDays: 35,
    inStock: 4200,
    supplier: "Sunbrella Contract",
  },
  // Foam
  {
    id: "fm-600",
    partNumber: "HR-2845-T",
    name: "HR Polyurethane Foam, 2.8 lb / 45 ILD, 4 in Sheet",
    categorySlug: "foam-cushioning",
    subcategory: "HR Polyurethane",
    specs: {
      Density: "2.8 lb/ft³",
      ILD: "45",
      Thickness: "4 in",
      "Sheet Size": "82 x 76 in",
      "Cal 117": "Compliant",
    },
    pricePerEach: 96.0,
    uom: "sheet",
    moq: 4,
    leadTimeDays: 14,
    inStock: 320,
    supplier: "FoamOrder Industrial",
  },
  // Panels
  {
    id: "pn-700",
    partNumber: "MDF-34-49x97",
    name: 'MDF Panel, 3/4 in x 49 x 97 in, Industrial Grade',
    categorySlug: "panels",
    subcategory: "MDF",
    specs: {
      Thickness: "3/4 in",
      Size: "49 x 97 in",
      Density: "48 lb/ft³",
      Grade: "Industrial, CARB-2 Compliant",
    },
    pricePerEach: 42.5,
    uom: "sheet",
    moq: 20,
    leadTimeDays: 10,
    inStock: 1840,
    supplier: "Roseburg Forest Products",
  },
  // Edge Banding
  {
    id: "eb-800",
    partNumber: "PVC-22-WAL-328",
    name: 'PVC Edge Banding, 22 mm, Walnut, 328 ft Roll',
    categorySlug: "edge-trim",
    subcategory: "PVC Edge Banding",
    specs: {
      Width: "22 mm",
      Thickness: "0.45 mm",
      "Roll Length": "328 ft",
      Color: "Walnut, Matte",
      Adhesive: "Pre-glued (EVA)",
    },
    pricePerEach: 38.0,
    uom: "roll",
    moq: 6,
    leadTimeDays: 12,
    inStock: 540,
    supplier: "Rehau",
  },
  // Finishes
  {
    id: "fn-900",
    partNumber: "LACQ-PC-CL-5G",
    name: "Pre-Catalyzed Lacquer, Clear Satin, 5 gal Pail",
    categorySlug: "finishes",
    subcategory: "Pre-Cat Lacquer",
    specs: {
      Type: "Pre-Catalyzed Lacquer",
      Sheen: "Satin (25°)",
      VOC: "550 g/L",
      "Pot Life": "6 months",
      "Cure Time": "24 hr to ship",
    },
    pricePerEach: 142.0,
    uom: "pail",
    moq: 4,
    leadTimeDays: 5,
    inStock: 96,
    supplier: "M.L. Campbell",
    hazmat: true,
  },
  // Legs
  {
    id: "lg-1000",
    partNumber: "LEG-HP-16-BK",
    name: 'Hairpin Steel Leg, 16 in, 3-Rod, Satin Black',
    categorySlug: "legs-bases",
    subcategory: "Hairpin Steel",
    specs: {
      Height: "16 in",
      "Rod Count": "3",
      "Rod Dia": "3/8 in",
      "Load (set of 4)": "1000 lb",
      Finish: "Satin Black Powder Coat",
    },
    pricePerEach: 8.4,
    uom: "ea",
    moq: 40,
    leadTimeDays: 21,
    inStock: 2840,
    supplier: "Eastwood Industrial",
  },
  // Knobs
  {
    id: "kp-1100",
    partNumber: "PULL-BAR-128-BN",
    name: 'Bar Pull, 128 mm Center-to-Center, Brushed Nickel',
    categorySlug: "knobs-pulls",
    subcategory: "Bar Pulls",
    specs: {
      "Center-to-Center": "128 mm",
      "Overall Length": "150 mm",
      Projection: "32 mm",
      Material: "Solid Zinc",
      Finish: "Brushed Nickel",
    },
    pricePerEach: 1.18,
    uom: "ea",
    moq: 100,
    leadTimeDays: 14,
    inStock: 31200,
    supplier: "Amerock Contract",
  },
  // Packaging
  {
    id: "pk-1200",
    partNumber: "CTN-DW-48x24x18",
    name: "Double-Wall RSC Carton, 48 x 24 x 18 in, 275 ECT",
    categorySlug: "packaging",
    subcategory: "Cartons & RSC Boxes",
    specs: {
      "Inside Dims": "48 x 24 x 18 in",
      Wall: "Double-Wall Corrugated",
      "Edge Crush": "275 ECT",
      "Bursting Strength": "350 psi",
      "Bundle Size": "10 / bundle",
    },
    pricePerEach: 7.85,
    uom: "ea",
    moq: 50,
    leadTimeDays: 5,
    inStock: 2160,
    supplier: "Uline Contract",
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function productsByCategory(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.categorySlug === slug);
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
