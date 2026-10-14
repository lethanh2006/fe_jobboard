import Link from "next/link";

/** Tiêu đề ProblemDetails mà BE trả khi liên kết đặt lại mật khẩu sai, đã dùng hoặc hết hạn. */
export const resetLinkInvalidTitle = "Liên kết đặt lại mật khẩu không hợp lệ";

export function ResetLinkInvalid() {
  return (
    <div className="login-form">
      <div className="login-heading">
        <span className="section-kicker">Liên kết không dùng được</span>
        <h1>Liên kết đã hết hiệu lực</h1>
        <p>
          Liên kết đặt lại mật khẩu chỉ dùng được một lần và hết hạn sau một thời gian ngắn. Hãy yêu cầu
          liên kết mới; nếu bạn đã nhận nhiều email, chỉ liên kết trong email mới nhất còn dùng được.
        </p>
      </div>
      <Link className="button full-button" href="/quen-mat-khau">
        Yêu cầu liên kết mới
      </Link>
      <p className="signup-note">
        Nhớ ra mật khẩu? <Link href="/dang-nhap">Quay lại đăng nhập</Link>
      </p>
    </div>
  );
}
