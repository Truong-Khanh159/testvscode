import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";

const services = [
  "Giao nhanh 2-4 giờ",
  "Chụp ảnh trước khi giao",
  "Thiệp viết tay miễn phí",
  "Tư vấn phối màu theo dịp"
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-20">
        <div className="animate-fadeUp">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-rosewood/55">Modern pastel flower shop</p>
          <h1 className="mt-5 text-5xl font-black leading-tight text-rosewood sm:text-6xl lg:text-7xl">
            Gửi hoa đẹp, gửi đúng cảm xúc.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-rosewood/70">
            Bloomé thiết kế bó hoa pastel hiện đại cho sinh nhật, kỷ niệm, khai trương và những lời cảm ơn cần được nói tinh tế.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="rounded-full bg-rosewood px-7 py-4 font-bold text-white shadow-soft transition hover:-translate-y-1" href="#products">
              Mua hoa ngay
            </Link>
            <Link className="rounded-full bg-white px-7 py-4 font-bold text-rosewood shadow-sm transition hover:-translate-y-1 hover:shadow-soft" href="/checkout">
              Đặt theo yêu cầu
            </Link>
          </div>
        </div>
        <div className="relative animate-fadeUp">
          <div className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-blush blur-3xl" />
          <div className="absolute bottom-8 right-0 h-32 w-32 rounded-full bg-sage blur-3xl" />
          <div className="glass relative rounded-[3rem] p-5 shadow-soft">
            <div className="grid aspect-square place-items-center rounded-[2.5rem] bg-gradient-to-br from-blush via-white to-lavender">
              <span className="animate-float text-[9rem] sm:text-[12rem]">💐</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="about">
        <div className="grid gap-4 md:grid-cols-4">
          {services.map((service) => (
            <div className="glass rounded-3xl p-5 text-center font-bold text-rosewood shadow-sm" key={service}>
              {service}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8" id="products">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-rosewood/55">Bộ sưu tập</p>
            <h2 className="mt-3 text-4xl font-black text-rosewood">Sản phẩm nổi bật</h2>
          </div>
          <p className="max-w-md text-rosewood/65">Mỗi mẫu có thể tinh chỉnh màu giấy, thiệp và thời gian giao theo yêu cầu.</p>
        </div>
        <ProductGrid />
      </section>
    </>
  );
}
