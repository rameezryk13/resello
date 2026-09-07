/** Full-size URLs for PDP gallery; card `img` uses w=500 via enrichProduct */
const IMG = (slug) =>
  `https://images.unsplash.com/${slug}?w=800&q=80&auto=format&fit=crop`;

const rawProducts = [
  // Electronics
  {
    productId: "MZ65800000101TW",
    name: "Wireless Noise Cancelling Headphones",
    originalPrice: "$350",
    price: "$299",
    rating: 5,
    reviews: 128,
    tags: ["eid", "new", "featured"],
    category: "Electronics",
    subCategory: "Audio",
    images: [
      IMG("photo-1505740420928-5e560c06d30e"),
      IMG("photo-1484704849700-f032a568e944"),
      IMG("photo-1546435770-a3e426bf472b"),
      IMG("photo-1599669454699-248893623440"),
    ],
  },
  {
    productId: "MZ65800000102TW",
    name: "Smart Watch Series 7",
    originalPrice: "$450",
    price: "$399",
    rating: 4,
    reviews: 85,
    tags: ["summer", "sale"],
    category: "Electronics",
    subCategory: "Wearables",
    images: [
      IMG("photo-1523275335684-37898b6baf30"),
      IMG("photo-1508685096489-7aacd43bd3b1"),
      IMG("photo-1579586337278-3befd40fd17a"),
      IMG("photo-1524592094714-0f0654e20314"),
    ],
  },
  {
    productId: "MZ65800000103TW",
    name: "Professional DSLR Camera",
    originalPrice: "$1499",
    price: "$1299",
    rating: 5,
    reviews: 42,
    tags: ["flash", "trending"],
    category: "Electronics",
    subCategory: "Cameras",
    images: [
      IMG("photo-1516035069371-29a1b244cc32"),
      IMG("photo-1502920917128-1aa500764cbd"),
      IMG("photo-1606983340126-99ab4feaa64a"),
      IMG("photo-1492691527719-9d1e07e534b4"),
    ],
  },
  {
    productId: "MZ65800000104TW",
    name: 'Ultra Slim Laptop 15"',
    originalPrice: "$1199",
    price: "$999",
    rating: 4,
    reviews: 210,
    tags: ["eid", "hot", "featured"],
    category: "Electronics",
    subCategory: "Computers",
    images: [
      IMG("photo-1496181133206-80ce9b88a853"),
      IMG("photo-1527443224154-c4a3942d3acf"),
      IMG("photo-1527814050087-3793815479db"),
      IMG("photo-1587829741301-dc798b83add3"),
    ],
  },

  // Cosmetics & Beauty
  {
    productId: "MZ65800000105TW",
    name: "Luxury Matte Lipstick Set",
    originalPrice: "$85",
    price: "$59",
    rating: 5,
    reviews: 312,
    tags: ["eid", "sale", "trending"],
    category: "Cosmetics",
    subCategory: "Makeup",
    images: [
      IMG("photo-1586495777744-4413f21062fa"),
      IMG("photo-1522335789203-aabd1fc54bc9"),
      IMG("photo-1556228720-195a672e8a03"),
      IMG("photo-1594035910387-fea47794261f"),
    ],
  },
  {
    productId: "MZ65800000106TW",
    name: "Organic Skincare Routine Kit",
    originalPrice: "$120",
    price: "$89",
    rating: 4,
    reviews: 145,
    tags: ["summer", "featured"],
    category: "Cosmetics",
    subCategory: "Skincare",
    images: [
      IMG("photo-1556228578-0d85b1a4d571"),
      IMG("photo-1620916566398-39f1143ab7be"),
      IMG("photo-1570172619644-dfd03ed5d881"),
      IMG("photo-1556228720-195a672e8a03"),
    ],
  },
  {
    productId: "MZ65800000107TW",
    name: "Designer Floral Perfume 100ml",
    originalPrice: "$150",
    price: "$110",
    rating: 5,
    reviews: 89,
    tags: ["flash", "hot"],
    category: "Cosmetics",
    subCategory: "Fragrance",
    images: [
      IMG("photo-1594035910387-fea47794261f"),
      IMG("photo-1541643600914-78b084683601"),
      IMG("photo-1586495777744-4413f21062fa"),
      IMG("photo-1556228578-0d85b1a4d571"),
    ],
  },

  // Men's Fashion
  {
    productId: "MZ65800000108TW",
    name: "Classic Tailored Navy Suit",
    originalPrice: "$299",
    price: "$199",
    rating: 5,
    reviews: 67,
    tags: ["eid", "new"],
    category: "Men's Fashion",
    subCategory: "Clothing",
    images: [
      IMG("photo-1594938298603-c8148c4dae35"),
      IMG("photo-1495105787522-5334e3ffa0ef"),
      IMG("photo-1434389677669-e08b4cac3105"),
      IMG("photo-1507679799987-c73779587ccf"),
    ],
  },
  {
    productId: "MZ65800000109TW",
    name: "Casual Denim Jacket",
    originalPrice: "$89",
    price: "$55",
    rating: 4,
    reviews: 230,
    tags: ["summer", "trending"],
    category: "Men's Fashion",
    subCategory: "Clothing",
    images: [
      IMG("photo-1495105787522-5334e3ffa0ef"),
      IMG("photo-1594938298603-c8148c4dae35"),
      IMG("photo-1586363104862-3a5e2ab60d99"),
      IMG("photo-1434389677669-e08b4cac3105"),
    ],
  },
  {
    productId: "MZ65800000110TW",
    name: "Leather Oxford Shoes",
    originalPrice: "$140",
    price: "$95",
    rating: 4,
    reviews: 112,
    tags: ["flash", "sale"],
    category: "Men's Fashion",
    subCategory: "Shoes",
    images: [
      IMG("photo-1614252235316-8c857d38b5f4"),
      IMG("photo-1560769629-975ec94e6a86"),
      IMG("photo-1542291026-7eec264c27ff"),
      IMG("photo-1460353581641-37baddab0fa2"),
    ],
  },
  {
    productId: "MZ65800000111TW",
    name: "Men's Chronograph Watch",
    originalPrice: "$250",
    price: "$180",
    rating: 5,
    reviews: 420,
    tags: ["eid", "featured"],
    category: "Men's Fashion",
    subCategory: "Accessories",
    images: [
      IMG("photo-1524592094714-0f0654e20314"),
      IMG("photo-1523170335258-f5ed11844a49"),
      IMG("photo-1611591437281-460bfbe1220a"),
      IMG("photo-1507679799987-c73779587ccf"),
    ],
  },

  // Women's Fashion
  {
    productId: "MZ65800000112TW",
    name: "Floral Summer Maxi Dress",
    originalPrice: "$75",
    price: "$45",
    rating: 4,
    reviews: 356,
    tags: ["summer", "hot"],
    category: "Women's Fashion",
    subCategory: "Clothing",
    images: [
      IMG("photo-1572804013309-59a88b7e92f1"),
      IMG("photo-1564257631407-4deb1f99d992"),
      IMG("photo-1496747611176-843222e1e57c"),
      IMG("photo-1515372039744-b8f02a3ae446"),
    ],
  },
  {
    productId: "MZ65800000113TW",
    name: "Designer Leather Handbag",
    originalPrice: "$320",
    price: "$250",
    rating: 5,
    reviews: 88,
    tags: ["eid", "new", "featured"],
    category: "Women's Fashion",
    subCategory: "Accessories",
    images: [
      IMG("photo-1584916201218-f4242ceb4809"),
      IMG("photo-1590874103328-eac38a683ce7"),
      IMG("photo-1511499767150-a48a237f0083"),
      IMG("photo-1572635196237-14b3f281503f"),
    ],
  },
  {
    productId: "MZ65800000114TW",
    name: "Elegant Stiletto Heels",
    originalPrice: "$110",
    price: "$79",
    rating: 4,
    reviews: 150,
    tags: ["flash", "trending"],
    category: "Women's Fashion",
    subCategory: "Shoes",
    images: [
      IMG("photo-1543163521-1bf539c55dd2"),
      IMG("photo-1460353581641-37baddab0fa2"),
      IMG("photo-1542291026-7eec264c27ff"),
      IMG("photo-1614252235316-8c857d38b5f4"),
    ],
  },
  {
    productId: "MZ65800000115TW",
    name: "Vintage Cat-Eye Sunglasses",
    originalPrice: "$65",
    price: "$39",
    rating: 4,
    reviews: 210,
    tags: ["summer", "sale"],
    category: "Women's Fashion",
    subCategory: "Accessories",
    images: [
      IMG("photo-1511499767150-a48a237f0083"),
      IMG("photo-1584916201218-f4242ceb4809"),
      IMG("photo-1590874103328-eac38a683ce7"),
      IMG("photo-1515562141207-7a88fb7ce338"),
    ],
  },

  // Kids & Toys
  {
    productId: "MZ65800000116TW",
    name: "Kids Cotton T-Shirt Set",
    originalPrice: "$45",
    price: "$29",
    rating: 4,
    reviews: 95,
    tags: ["summer"],
    category: "Kids Clothing",
    subCategory: "Clothing",
    images: [
      IMG("photo-1519241047957-be31d7379a5d"),
      IMG("photo-1622290291468-a28f7a7dc6a8"),
      IMG("photo-1522771739844-6a9f6d5f14af"),
      IMG("photo-1460353581641-37baddab0fa2"),
    ],
  },
  {
    productId: "MZ65800000117TW",
    name: "Educational Wooden Toy Blocks",
    originalPrice: "$35",
    price: "$25",
    rating: 5,
    reviews: 340,
    tags: ["flash", "new"],
    category: "Kids Clothing",
    subCategory: "Toys",
    images: [
      IMG("photo-1587654780291-39c9404d746b"),
      IMG("photo-1553062407-98eeb64c6a62"),
      IMG("photo-1566576912321-d58ddd7a6088"),
      IMG("photo-1578662996442-48f60103fc96"),
    ],
  },
  {
    productId: "MZ65800000118TW",
    name: "Premium Baby Stroller",
    originalPrice: "$450",
    price: "$380",
    rating: 5,
    reviews: 65,
    tags: ["eid", "featured"],
    category: "Kids Clothing",
    subCategory: "Gear",
    images: [
      IMG("photo-1519689680058-324335c77eba"),
      IMG("photo-1503454537195-1dcabb73ffb9"),
      IMG("photo-1519241047957-be31d7379a5d"),
      IMG("photo-1622290291468-a28f7a7dc6a8"),
    ],
  },
  {
    productId: "MZ65800000119TW",
    name: "Kids Denim Overalls",
    originalPrice: "$55",
    price: "$35",
    rating: 4,
    reviews: 120,
    tags: ["flash", "sale"],
    category: "Kids Clothing",
    subCategory: "Clothing",
    images: [
      IMG("photo-1622290291468-a28f7a7dc6a8"),
      IMG("photo-1519241047957-be31d7379a5d"),
      IMG("photo-1522771739844-6a9f6d5f14af"),
      IMG("photo-1460353581641-37baddab0fa2"),
    ],
  },

  // More Electronics
  {
    productId: "MZ65800000120TW",
    name: "Bluetooth Portable Speaker",
    originalPrice: "$89",
    price: "$59",
    rating: 4,
    reviews: 201,
    tags: ["summer", "sale"],
    category: "Electronics",
    subCategory: "Audio",
    images: [
      IMG("photo-1484704849700-f032a568e944"),
      IMG("photo-1505740420928-5e560c06d30e"),
      IMG("photo-1546435770-a3e426bf472b"),
      IMG("photo-1558494949-ef010cbdcc31"),
    ],
  },
  {
    productId: "MZ65800000121TW",
    name: "Wireless Gaming Mouse",
    originalPrice: "$79",
    price: "$49",
    rating: 5,
    reviews: 312,
    tags: ["flash", "trending"],
    category: "Electronics",
    subCategory: "Accessories",
    images: [
      IMG("photo-1527814050087-3793815479db"),
      IMG("photo-1587829741301-dc798b83add3"),
      IMG("photo-1615663245857-ac93bb7c39e7"),
      IMG("photo-1527864550417-7fd91fc51a46"),
    ],
  },
  {
    productId: "MZ65800000122TW",
    name: '4K Ultra HD Monitor 27"',
    originalPrice: "$399",
    price: "$329",
    rating: 4,
    reviews: 178,
    tags: ["featured", "hot"],
    category: "Electronics",
    subCategory: "Computers",
    images: [
      IMG("photo-1527443224154-c4a3942d3acf"),
      IMG("photo-1496181133206-80ce9b88a853"),
      IMG("photo-1527814050087-3793815479db"),
      IMG("photo-1587829741301-dc798b83add3"),
    ],
  },
  {
    productId: "MZ65800000123TW",
    name: "Mechanical RGB Keyboard",
    originalPrice: "$129",
    price: "$99",
    rating: 5,
    reviews: 445,
    tags: ["eid", "new"],
    category: "Electronics",
    subCategory: "Accessories",
    images: [
      IMG("photo-1587829741301-dc798b83add3"),
      IMG("photo-1527814050087-3793815479db"),
      IMG("photo-1615663245857-ac93bb7c39e7"),
      IMG("photo-1558494949-ef010cbdcc31"),
    ],
  },

  // More Cosmetics
  {
    productId: "MZ65800000124TW",
    name: "Hydrating Face Serum 50ml",
    originalPrice: "$68",
    price: "$48",
    rating: 5,
    reviews: 267,
    tags: ["summer", "featured"],
    category: "Cosmetics",
    subCategory: "Skincare",
    images: [
      IMG("photo-1620916566398-39f1143ab7be"),
      IMG("photo-1556228578-0d85b1a4d571"),
      IMG("photo-1570172619644-dfd03ed5d881"),
      IMG("photo-1586495777744-4413f21062fa"),
    ],
  },
  {
    productId: "MZ65800000125TW",
    name: "Velvet Eyeshadow Palette",
    originalPrice: "$52",
    price: "$38",
    rating: 4,
    reviews: 189,
    tags: ["flash", "sale"],
    category: "Cosmetics",
    subCategory: "Makeup",
    images: [
      IMG("photo-1522335789203-aabd1fc54bc9"),
      IMG("photo-1586495777744-4413f21062fa"),
      IMG("photo-1556228720-195a672e8a03"),
      IMG("photo-1541643600914-78b084683601"),
    ],
  },

  // More Men's Fashion
  {
    productId: "MZ65800000126TW",
    name: "Merino Wool Crew Sweater",
    originalPrice: "$95",
    price: "$72",
    rating: 4,
    reviews: 94,
    tags: ["eid", "trending"],
    category: "Men's Fashion",
    subCategory: "Clothing",
    images: [
      IMG("photo-1434389677669-e08b4cac3105"),
      IMG("photo-1594938298603-c8148c4dae35"),
      IMG("photo-1495105787522-5334e3ffa0ef"),
      IMG("photo-1586363104862-3a5e2ab60d99"),
    ],
  },
  {
    productId: "MZ65800000127TW",
    name: "Canvas Sneakers White",
    originalPrice: "$75",
    price: "$55",
    rating: 5,
    reviews: 512,
    tags: ["summer", "hot"],
    category: "Men's Fashion",
    subCategory: "Shoes",
    images: [
      IMG("photo-1560769629-975ec94e6a86"),
      IMG("photo-1614252235316-8c857d38b5f4"),
      IMG("photo-1542291026-7eec264c27ff"),
      IMG("photo-1460353581641-37baddab0fa2"),
    ],
  },

  // More Women's Fashion
  {
    productId: "MZ65800000128TW",
    name: "Silk Evening Blouse",
    originalPrice: "$88",
    price: "$64",
    rating: 4,
    reviews: 133,
    tags: ["eid", "featured"],
    category: "Women's Fashion",
    subCategory: "Clothing",
    images: [
      IMG("photo-1564257631407-4deb1f99d992"),
      IMG("photo-1572804013309-59a88b7e92f1"),
      IMG("photo-1496747611176-843222e1e57c"),
      IMG("photo-1515372039744-b8f02a3ae446"),
    ],
  },
  {
    productId: "MZ65800000129TW",
    name: "Crossbody Mini Bag",
    originalPrice: "$140",
    price: "$99",
    rating: 5,
    reviews: 76,
    tags: ["new", "sale"],
    category: "Women's Fashion",
    subCategory: "Accessories",
    images: [
      IMG("photo-1590874103328-eac38a683ce7"),
      IMG("photo-1584916201218-f4242ceb4809"),
      IMG("photo-1511499767150-a48a237f0083"),
      IMG("photo-1572635196237-14b3f281503f"),
    ],
  },

  // More Kids & Home
  {
    productId: "MZ65800000130TW",
    name: "Plush Teddy Bear Large",
    originalPrice: "$42",
    price: "$28",
    rating: 5,
    reviews: 210,
    tags: ["flash", "featured"],
    category: "Kids Clothing",
    subCategory: "Toys",
    images: [
      IMG("photo-1553062407-98eeb64c6a62"),
      IMG("photo-1587654780291-39c9404d746b"),
      IMG("photo-1566576912321-d58ddd7a6088"),
      IMG("photo-1558060370-d644479cb6f7"),
    ],
  },
  {
    productId: "MZ65800000131TW",
    name: "Kids Rain Boots",
    originalPrice: "$38",
    price: "$26",
    rating: 4,
    reviews: 88,
    tags: ["summer"],
    category: "Kids Clothing",
    subCategory: "Shoes",
    images: [
      IMG("photo-1460353581641-37baddab0fa2"),
      IMG("photo-1542291026-7eec264c27ff"),
      IMG("photo-1519241047957-be31d7379a5d"),
      IMG("photo-1622290291468-a28f7a7dc6a8"),
    ],
  },
  {
    productId: "MZ65800000132TW",
    name: "Smart LED Desk Lamp",
    originalPrice: "$65",
    price: "$45",
    rating: 4,
    reviews: 156,
    tags: ["trending", "sale"],
    category: "Electronics",
    subCategory: "Home",
    images: [
      IMG("photo-1507473885765-e6ed057f782c"),
      IMG("photo-1513506003901-1e6a229e2d15"),
      IMG("photo-1523362628745-0c100150b504"),
      IMG("photo-1558494949-ef010cbdcc31"),
    ],
  },
  {
    productId: "MZ65800000133TW",
    name: "Stainless Steel Water Bottle",
    originalPrice: "$32",
    price: "$22",
    rating: 5,
    reviews: 402,
    tags: ["summer", "new"],
    category: "Electronics",
    subCategory: "Lifestyle",
    images: [
      IMG("photo-1602143407151-7111542de6e8"),
      IMG("photo-1514228742587-6b1558fcca3d"),
      IMG("photo-1523362628745-0c100150b504"),
      IMG("photo-1615663245857-ac93bb7c39e7"),
    ],
  },
  {
    productId: "MZ65800000134TW",
    name: "Yoga Mat Premium",
    originalPrice: "$48",
    price: "$34",
    rating: 4,
    reviews: 291,
    tags: ["flash", "hot"],
    category: "Electronics",
    subCategory: "Fitness",
    images: [
      IMG("photo-1601925260368-ae2f83cf8b7f"),
      IMG("photo-1518611012118-696072aa579a"),
      IMG("photo-1571019613454-1cb2f99b2d8b"),
      IMG("photo-1517836357463-d25dfeac3438"),
    ],
  },
  {
    productId: "MZ65800000135TW",
    name: "Travel Neck Pillow Memory Foam",
    originalPrice: "$36",
    price: "$24",
    rating: 4,
    reviews: 167,
    tags: ["sale", "featured"],
    category: "Electronics",
    subCategory: "Travel",
    images: [
      IMG("photo-1520206183501-b80df61043c2"),
      IMG("photo-1488646953014-85cb44e25828"),
      IMG("photo-1565026057447-bc90a3dceb87"),
      IMG("photo-1436491865332-7a61a109cc05"),
    ],
  },

  // New arrivals (extended catalog)
  {
    productId: "MZ65800000136TW",
    name: "USB-C 7-in-1 Mini Hub",
    originalPrice: "$55",
    price: "$39",
    rating: 4,
    reviews: 54,
    tags: ["new", "trending"],
    category: "Electronics",
    subCategory: "Accessories",
    images: [
      IMG("photo-1558494949-ef010cbdcc31"),
      IMG("photo-1615663245857-ac93bb7c39e7"),
      IMG("photo-1527814050087-3793815479db"),
      IMG("photo-1587829741301-dc798b83add3"),
    ],
  },
  {
    productId: "MZ65800000137TW",
    name: "Mirrorless Camera Body",
    originalPrice: "$1899",
    price: "$1649",
    rating: 5,
    reviews: 31,
    tags: ["featured", "hot"],
    category: "Electronics",
    subCategory: "Cameras",
    images: [
      IMG("photo-1502920917128-1aa500764cbd"),
      IMG("photo-1516035069371-29a1b244cc32"),
      IMG("photo-1606983340126-99ab4feaa64a"),
      IMG("photo-1452587925148-ce544e77e70d"),
    ],
  },
  {
    productId: "MZ65800000138TW",
    name: "Waterproof Fitness Band",
    originalPrice: "$99",
    price: "$79",
    rating: 4,
    reviews: 412,
    tags: ["summer", "sale"],
    category: "Electronics",
    subCategory: "Wearables",
    images: [
      IMG("photo-1579586337278-3befd40fd17a"),
      IMG("photo-1523275335684-37898b6baf30"),
      IMG("photo-1508685096489-7aacd43bd3b1"),
      IMG("photo-1599901860904-17e6ed7083a0"),
    ],
  },
  {
    productId: "MZ65800000139TW",
    name: "Volumizing Mascara",
    originalPrice: "$28",
    price: "$19",
    rating: 4,
    reviews: 198,
    tags: ["flash", "new"],
    category: "Cosmetics",
    subCategory: "Makeup",
    images: [
      IMG("photo-1586495777744-4413f21062fa"),
      IMG("photo-1522335789203-aabd1fc54bc9"),
      IMG("photo-1556228720-195a672e8a03"),
      IMG("photo-1541643600914-78b084683601"),
    ],
  },
  {
    productId: "MZ65800000140TW",
    name: "Shea Butter Lip Balm Duo",
    originalPrice: "$18",
    price: "$12",
    rating: 5,
    reviews: 76,
    tags: ["summer"],
    category: "Cosmetics",
    subCategory: "Makeup",
    images: [
      IMG("photo-1556228720-195a672e8a03"),
      IMG("photo-1586495777744-4413f21062fa"),
      IMG("photo-1522335789203-aabd1fc54bc9"),
      IMG("photo-1594035910387-fea47794261f"),
    ],
  },
  {
    productId: "MZ65800000141TW",
    name: "Men's Leather Belt",
    originalPrice: "$48",
    price: "$34",
    rating: 4,
    reviews: 122,
    tags: ["eid", "sale"],
    category: "Men's Fashion",
    subCategory: "Accessories",
    images: [
      IMG("photo-1523170335258-f5ed11844a49"),
      IMG("photo-1524592094714-0f0654e20314"),
      IMG("photo-1611591437281-460bfbe1220a"),
      IMG("photo-1507679799987-c73779587ccf"),
    ],
  },
  {
    productId: "MZ65800000142TW",
    name: "Gold Pendant Necklace",
    originalPrice: "$95",
    price: "$69",
    rating: 5,
    reviews: 41,
    tags: ["new", "featured"],
    category: "Women's Fashion",
    subCategory: "Accessories",
    images: [
      IMG("photo-1515562141207-7a88fb7ce338"),
      IMG("photo-1572635196237-14b3f281503f"),
      IMG("photo-1584916201218-f4242ceb4809"),
      IMG("photo-1511499767150-a48a237f0083"),
    ],
  },
  {
    productId: "MZ65800000143TW",
    name: "Kids School Backpack",
    originalPrice: "$42",
    price: "$29",
    rating: 4,
    reviews: 88,
    tags: ["flash"],
    category: "Kids Clothing",
    subCategory: "Gear",
    images: [
      IMG("photo-1503454537195-1dcabb73ffb9"),
      IMG("photo-1519689680058-324335c77eba"),
      IMG("photo-1519241047957-be31d7379a5d"),
      IMG("photo-1622290291468-a28f7a7dc6a8"),
    ],
  },
  {
    productId: "MZ65800000144TW",
    name: "500-Piece Landscape Puzzle",
    originalPrice: "$24",
    price: "$16",
    rating: 5,
    reviews: 203,
    tags: ["trending"],
    category: "Kids Clothing",
    subCategory: "Toys",
    images: [
      IMG("photo-1566576912321-d58ddd7a6088"),
      IMG("photo-1587654780291-39c9404d746b"),
      IMG("photo-1553062407-98eeb64c6a62"),
      IMG("photo-1578662996442-48f60103fc96"),
    ],
  },
  {
    productId: "MZ65800000145TW",
    name: "Cotton Pique Polo Shirt",
    originalPrice: "$58",
    price: "$42",
    rating: 4,
    reviews: 167,
    tags: ["summer", "sale"],
    category: "Men's Fashion",
    subCategory: "Clothing",
    images: [
      IMG("photo-1586363104862-3a5e2ab60d99"),
      IMG("photo-1594938298603-c8148c4dae35"),
      IMG("photo-1495105787522-5334e3ffa0ef"),
      IMG("photo-1434389677669-e08b4cac3105"),
    ],
  },
  {
    productId: "MZ65800000146TW",
    name: "A-Line Midi Skirt",
    originalPrice: "$72",
    price: "$52",
    rating: 4,
    reviews: 91,
    tags: ["eid", "hot"],
    category: "Women's Fashion",
    subCategory: "Clothing",
    images: [
      IMG("photo-1496747611176-843222e1e57c"),
      IMG("photo-1572804013309-59a88b7e92f1"),
      IMG("photo-1564257631407-4deb1f99d992"),
      IMG("photo-1515372039744-b8f02a3ae446"),
    ],
  },
  {
    productId: "MZ65800000147TW",
    name: "Adjustable Phone Stand",
    originalPrice: "$29",
    price: "$19",
    rating: 4,
    reviews: 318,
    tags: ["new"],
    category: "Electronics",
    subCategory: "Accessories",
    images: [
      IMG("photo-1615663245857-ac93bb7c39e7"),
      IMG("photo-1558494949-ef010cbdcc31"),
      IMG("photo-1527864550417-7fd91fc51a46"),
      IMG("photo-1527814050087-3793815479db"),
    ],
  },
  {
    productId: "MZ65800000148TW",
    name: "Insulated Travel Mug 20oz",
    originalPrice: "$38",
    price: "$26",
    rating: 5,
    reviews: 244,
    tags: ["featured"],
    category: "Electronics",
    subCategory: "Lifestyle",
    images: [
      IMG("photo-1514228742587-6b1558fcca3d"),
      IMG("photo-1602143407151-7111542de6e8"),
      IMG("photo-1523362628745-0c100150b504"),
      IMG("photo-1556228720-195a672e8a03"),
    ],
  },
];

const SHOPS = [
  {
    shopId: "shop-1",
    shopName: "ReSello Select",
    location: "Faisalabad",
    followers: "1.29k",
    rating: 4.8,
    products: 154,
    description: "Curated fashion and lifestyle essentials for modern shoppers.",
  },
  {
    shopId: "shop-2",
    shopName: "Grace by Ahmed",
    location: "Faisalabad",
    followers: "3.2k",
    rating: 4.6,
    products: 98,
    description: "Stylish apparel and accessories with a premium touch.",
  },
  {
    shopId: "shop-3",
    shopName: "Market Edge",
    location: "Lahore",
    followers: "2.1k",
    rating: 4.7,
    products: 127,
    description: "Everyday essentials and trending picks for busy shoppers.",
  },
  {
    shopId: "shop-4",
    shopName: "Urban Drift",
    location: "Karachi",
    followers: "1.7k",
    rating: 4.5,
    products: 112,
    description: "Modern home and electronics finds for a smarter lifestyle.",
  },
];

function getShopForProduct(index) {
  return SHOPS[index % SHOPS.length];
}

function getProductStock(index) {
  return 12 + ((index * 7) % 89);
}

function getVariantStock(productIndex, optionIndex, colorIndex) {
  return 4 + ((productIndex * 11 + optionIndex * 5 + colorIndex * 3) % 32);
}

function cardImgFromGallery(url) {
  return String(url).replace(/\bw=800\b/, "w=500");
}

const COLOR_PRESETS = [
  [
    { name: "Black", value: "#111111" },
    { name: "Purple", value: "#7c3aed" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
  ],
  [
    { name: "Navy", value: "#0f172a" },
    { name: "Green", value: "#16a34a" },
    { name: "Gold", value: "#f59e0b" },
    { name: "Rose", value: "#fb7185" },
  ],
  [
    { name: "Charcoal", value: "#334155" },
    { name: "Sky Blue", value: "#38bdf8" },
    { name: "Sand", value: "#fde68a" },
    { name: "White", value: "#f8fafc" },
  ],
];

const FASHION_SIZES = [
  {
    size: "XS",
    colors: [
      { name: "Black", value: "#111111" },
      { name: "Cloud", value: "#e2e8f0" },
    ],
  },
  {
    size: "S",
    colors: [
      { name: "Jet", value: "#0f172a" },
      { name: "Pumpkin", value: "#fb923c" },
      { name: "Soft Pink", value: "#fda4af" },
    ],
  },
  {
    size: "M",
    colors: [
      { name: "Graphite", value: "#4b5563" },
      { name: "Indigo", value: "#4338ca" },
      { name: "Crimson", value: "#dc2626" },
    ],
  },
  {
    size: "L",
    colors: [
      { name: "Forest", value: "#16a34a" },
      { name: "Amber", value: "#f59e0b" },
      { name: "Aqua", value: "#38bdf8" },
    ],
  },
  {
    size: "XL",
    colors: [
      { name: "Slate", value: "#334155" },
      { name: "Gold", value: "#fbbf24" },
    ],
  },
];

function getProductOptions(p, index) {
  const category = String(p.category || "").toLowerCase();
  const subCategory = String(p.subCategory || "").toLowerCase();
  const isFashion = /(fashion|clothing|shoes|accessories|fragrance|skincare|makeup)/i.test(
    category + " " + subCategory
  );

  if (isFashion) {
    return {
      sizes: FASHION_SIZES.map((sizeOption, sizeIndex) => ({
        ...sizeOption,
        colors: sizeOption.colors.map((color, colorIndex) => ({
          ...color,
          stock: getVariantStock(index, sizeIndex, colorIndex),
        })),
      })),
    };
  }

  const colors = COLOR_PRESETS[index % COLOR_PRESETS.length].map((color, colorIndex) => ({
    ...color,
    stock: getVariantStock(index, 0, colorIndex),
  }));
  return { colors };
}

function enrichProduct(p, index) {
  if (!Array.isArray(p.images) || p.images.length !== 4) {
    throw new Error(`Product ${p.productId} must define exactly 4 images`);
  }
  const shop = getShopForProduct(index);
  const options = getProductOptions(p, index);
  const variantStock =
    options.sizes?.reduce(
      (total, sizeOption) =>
        total +
        (sizeOption.colors || []).reduce(
          (colorTotal, color) => colorTotal + (Number(color.stock) || 0),
          0
        ),
      0
    ) ??
    options.colors?.reduce((total, color) => total + (Number(color.stock) || 0), 0);
  return {
    ...p,
    ...options,
    img: cardImgFromGallery(p.images[0]),
    stock: p.stock ?? variantStock ?? getProductStock(index),
    shopId: shop.shopId,
    shopName: shop.shopName,
    description:
      p.description ||
      `Discover ${p.name} — carefully selected ${p.category} quality. Fast shipping and easy returns on eligible orders.`,
  };
}

const products = rawProducts.map(enrichProduct);

const REVIEWERS = [
  "Hijab Fatima",
  "Dukan pk",
  "Ayesha Khan",
  "Maham Ali",
  "Zain Stores",
  "Sana Noor",
  "Hassan Raza",
  "Iqra Boutique",
];

const REVIEW_COMMENTS = [
  "Best quality same aaya jesa order kia",
  "Packing achi thi aur delivery time par ho gai",
  "Customer ne quality ko pasand kiya",
  "Product pictures jesa hi mila",
  "Material acha hai, resale ke liye useful",
  "Order complete aur safely packed tha",
];

const REVIEW_DATES = [
  "2024-02-23",
  "2025-05-31",
  "2025-08-14",
  "2026-01-19",
  "2026-03-06",
  "2026-06-11",
];

const MENTION_PRESETS = [
  ["price", "delivery", "quality", "value", "recommended"],
  ["quality", "price", "delivery", "recommended", "original"],
  ["delivery", "quality", "price", "fast", "original"],
];

function buildReview(product, productIndex, reviewIndex) {
  const ratingBase = Number(product.rating) || 5;
  const rating = Math.max(3, Math.min(5, ratingBase - (reviewIndex === 2 && ratingBase < 5 ? 1 : 0)));

  const productImages = (product.images && product.images.length > 0) ? product.images : [product.img];
  const demoPhotos = [
    productImages[0] || product.img,
    productImages[1] || productImages[0] || product.img,
    productImages[2] || productImages[0] || product.img,
  ].filter(Boolean);

  return {
    reviewId: `${product.productId}-review-${reviewIndex + 1}`,
    productId: product.productId,
    reviewerName: REVIEWERS[(productIndex + reviewIndex) % REVIEWERS.length],
    rating,
    ratings: {
      delivery: Math.max(4, Math.min(5, rating)),
      quality: Math.max(4, Math.min(5, rating)),
      price: Math.max(4, Math.min(5, rating)),
    },
    comment: REVIEW_COMMENTS[(productIndex + reviewIndex) % REVIEW_COMMENTS.length],
    date: REVIEW_DATES[(productIndex + reviewIndex) % REVIEW_DATES.length],
    images: demoPhotos,
    image: demoPhotos[0] || null,
  };
}

const productReviews = products.reduce((acc, product, productIndex) => {
  const visibleReviews = product.rating >= 5 ? 4 : 3;
  acc[product.productId] = Array.from({ length: visibleReviews }, (_, reviewIndex) =>
    buildReview(product, productIndex, reviewIndex)
  );
  product.reviewMentions = MENTION_PRESETS[productIndex % MENTION_PRESETS.length];
  return acc;
}, {});

module.exports = {
  products,
  shops: SHOPS,
  productReviews,
};
