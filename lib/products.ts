export type Product = {
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
  details: string[];
  imageUrl?: string | null;
  palette: string;
  emoji: string;
};

export const products: Product[] = [
  {
    slug: "sweet-blush",
    name: "Sweet Blush",
    price: 520000,
    category: "Bó hoa pastel",
    description: "Bó hồng pastel phối baby trắng, phù hợp sinh nhật và kỷ niệm.",
    details: ["Hồng Ecuador", "Baby trắng", "Gói giấy Hàn Quốc", "Thiệp viết tay"],
    palette: "from-blush via-white to-lavender",
    emoji: "🌸"
  },
  {
    slug: "morning-sage",
    name: "Morning Sage",
    price: 680000,
    category: "Hoa chúc mừng",
    description: "Tông xanh sage thanh lịch với tulip, cẩm tú cầu và lá bạc.",
    details: ["Tulip nhập khẩu", "Cẩm tú cầu", "Lá bạc", "Giao nhanh nội thành"],
    palette: "from-sage via-white to-cream",
    emoji: "🌷"
  },
  {
    slug: "lavender-dream",
    name: "Lavender Dream",
    price: 750000,
    category: "Hoa cao cấp",
    description: "Thiết kế lavender mềm mại cho những dịp cần sự tinh tế.",
    details: ["Lan hồ điệp mini", "Hoa tím seasonal", "Hộp premium", "Bảo quản 3-5 ngày"],
    palette: "from-lavender via-white to-blush",
    emoji: "💐"
  },
  {
    slug: "cream-sunrise",
    name: "Cream Sunrise",
    price: 460000,
    category: "Hoa mỗi ngày",
    description: "Tông kem vàng nhẹ, sáng và ấm, dễ tặng trong mọi dịp.",
    details: ["Hoa hướng dương mini", "Cúc tana", "Giấy kraft kem", "Thiệp miễn phí"],
    palette: "from-cream via-white to-blush",
    emoji: "🌼"
  },
  {
    slug: "rosewood-love",
    name: "Rosewood Love",
    price: 890000,
    category: "Hoa tình yêu",
    description: "Bó hoa hồng đỏ rượu phối pastel, sang trọng nhưng không quá nặng.",
    details: ["Hồng đỏ premium", "Hoa phụ pastel", "Ruy băng nhung", "Chụp ảnh trước khi giao"],
    palette: "from-rosewood via-blush to-white",
    emoji: "🌹"
  },
  {
    slug: "mini-bloom-box",
    name: "Mini Bloom Box",
    price: 390000,
    category: "Hộp hoa",
    description: "Hộp hoa nhỏ gọn, phù hợp đặt bàn làm việc hoặc gửi lời cảm ơn.",
    details: ["Hộp giấy cứng", "Hoa seasonal", "Dưỡng hoa", "Kích thước nhỏ gọn"],
    palette: "from-blush via-cream to-sage",
    emoji: "🪷"
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
