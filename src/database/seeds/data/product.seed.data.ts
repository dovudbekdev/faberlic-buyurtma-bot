/**
 * Product seed data – Faberlic mahsulotlari uchun namuna ma'lumotlar.
 * Rasmlar ixtiyoriy; hozircha bo'sh massiv.
 */
export interface ProductSeedItem {
  name: string;
  price: number;
  description?: string;
  images?: string[];
}

export const PRODUCT_SEED_DATA: ProductSeedItem[] = [
  {
    name: 'Terini tozalovchi gel',
    price: 185_000,
    description:
      'Yuz terisini yengil tozalaydi, poralarni ochadi va keyingi parvarish uchun tayyorlaydi.',
    images: [],
  },
  {
    name: 'Namlovchi krem',
    price: 220_000,
    description:
      '24 soat davomida terini nam ushlab turadi. O‘simlik ekstraktlari va gialuron kislota.',
    images: [],
  },
  {
    name: 'Ko‘z atrofidagi krem',
    price: 195_000,
    description:
      'Ko‘z atrofidagi chandiq va qorong‘u halkalarni kamaytiradi, terini elastik qiladi.',
    images: [],
  },
  {
    name: 'Quyoshdan himoya qiluvchi krem SPF 30',
    price: 265_000,
    description:
      'Kundalik himoya. UV nurlaridan himoya qiladi va terini erta qarishdan saqlaydi.',
    images: [],
  },
  {
    name: 'Tana yuvish geli',
    price: 95_000,
    description:
      'Yumshoq teri hissini beradi. Tabiiy ingredientlar, xushbo‘y hid.',
    images: [],
  },
  {
    name: 'Soch uchun balzam',
    price: 125_000,
    description:
      'Sochlarni bo‘yash va stylingdan keyin tiklaydi, uchlarini ta’mirlaydi.',
    images: [],
  },
  {
    name: 'Lab bo‘yogi',
    price: 75_000,
    description:
      'Uzoq muddatli rang, yumshoq lablar. Turli ranglar mavjud.',
    images: [],
  },
  {
    name: 'Qo‘l kremi',
    price: 85_000,
    description:
      'Qo‘llarni namlash va himoya qilish. Tez singadi, yog‘siz formulasi.',
    images: [],
  },
  {
    name: 'Yuz niqobi – loy',
    price: 145_000,
    description:
      'Terini chuqur tozalaydi, yog‘ bezlarini tinchlantiradi. Haftada 1–2 marta.',
    images: [],
  },
  {
    name: 'Parfumeriya suvi (namuna)',
    price: 350_000,
    description:
      'Faberlic klassik atir suvi. Uzoq davom etadigan xushbo‘y hid.',
    images: [],
  },
];
