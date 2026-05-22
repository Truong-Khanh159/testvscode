export function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/55">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-rosewood/75 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-black text-rosewood">Bloomé</p>
          <p className="mt-2">Hoa pastel hiện đại, giao nhanh trong ngày tại nội thành.</p>
        </div>
        <div>
          <p className="font-bold text-rosewood">Liên hệ</p>
          <p className="mt-2">Hotline: 0901 234 567</p>
          <p>Email: hello@bloome.vn</p>
        </div>
        <div>
          <p className="font-bold text-rosewood">Cam kết</p>
          <p className="mt-2">Chụp ảnh trước khi giao, hỗ trợ thiệp miễn phí, đổi mẫu nếu hoa không đạt.</p>
        </div>
      </div>
    </footer>
  );
}
