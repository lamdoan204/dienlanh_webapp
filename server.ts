import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Thiếu email hoặc OTP" });
      }

      const user = process.env.GMAIL_USER;
      const pass = process.env.GMAIL_APP_PASSWORD;

      if (!user || !pass) {
        console.warn("GMAIL credentials (GMAIL_USER / GMAIL_APP_PASSWORD) not found in env. Simulated OTP email.");
        return res.json({
          success: true,
          simulated: true,
          message: "Mã OTP giả lập (chưa cài đặt GMAIL_USER / GMAIL_APP_PASSWORD trong .env)",
        });
      }

      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user,
            pass,
          },
        });

        const mailOptions = {
          from: `"Điện lạnh Công Thương" <${user}>`,
          to: email,
          subject: "Mã Xác Thực OTP - Khôi Phục Mật Khẩu",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
              <h2 style="color: #005396; text-align: center;">Mã Xác Thực Của Bạn</h2>
              <p>Chào bạn,</p>
              <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Điện lạnh Công Thương. Dưới đây là mã xác thực OTP của bạn:</p>
              <div style="background-color: #f9f9ff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px dashed #005396;">
                <span style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #005396;">${otp}</span>
              </div>
              <p style="color: #666; font-size: 14px;">Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
              <p style="margin-top: 30px;">Trân trọng,<br>Đội ngũ Điện lạnh Công Thương</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: "Gửi email thành công" });
      } catch (smtpErr) {
        console.warn("Gmail SMTP login/sending failed in send-otp:", smtpErr);
        return res.json({
          success: true,
          simulated: true,
          message: "Email OTP được tạo trong chế độ thử nghiệm (Tài khoản Gmail/App Password cấu hình chưa hợp lệ).",
        });
      }
    } catch (error) {
      console.error("Error in send-otp route:", error);
      res.status(500).json({ success: false, message: "Lỗi hệ thống khi xử lý yêu cầu gửi email", error: String(error) });
    }
  });

  app.post("/api/notify-admin-booking", async (req, res) => {
    try {
      const payload = req.body || {};
      const user = process.env.GMAIL_USER;
      const pass = process.env.GMAIL_APP_PASSWORD;

      let adminEmails: string[] = [];
      if (Array.isArray(payload.adminEmails) && payload.adminEmails.length > 0) {
        adminEmails = payload.adminEmails;
      } else {
        adminEmails = ['admin@hvacmasters.com'];
      }

      console.log(`[SERVER EMAIL NOTIFICATION] Target Admins: ${adminEmails.join(', ')}`);
      console.log(`[BOOKING INFO] #${payload.bookingId} - KH: ${payload.customerName} - Tel: ${payload.customerPhone} - Service: ${payload.serviceName}`);

      if (!user || !pass) {
        console.warn("GMAIL credentials (GMAIL_USER / GMAIL_APP_PASSWORD) not found in env. Simulated email notification succeeded.");
        return res.json({
          success: true,
          adminEmails,
          simulated: true,
          message: "Email simulated (chưa cài đặt GMAIL_USER / GMAIL_APP_PASSWORD trong .env)",
        });
      }

      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user, pass },
        });

        const mailOptions = {
          from: `"HVAC Masters Notification" <${user}>`,
          to: adminEmails.join(','),
          subject: `[ĐƠN ĐẶT LỊCH MỚI] Mã #${payload.bookingId} - KH: ${payload.customerName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #005396; text-align: center; margin-top: 0;">THÔNG BÁO ĐẶT LỊCH DỊCH VỤ MỚI</h2>
              <div style="background-color: #f8f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #005396; margin-bottom: 20px;">
                <p style="margin: 4px 0; font-size: 14px;"><strong>Mã đơn hàng:</strong> <span style="color: #005396; font-weight: bold;">${payload.bookingId}</span></p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Khách hàng:</strong> ${payload.customerName}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Số điện thoại:</strong> ${payload.customerPhone}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${payload.customerEmail || 'Chưa cung cấp'}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Địa chỉ:</strong> ${payload.address}</p>
              </div>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background-color: #005396; color: #ffffff;">
                  <th style="padding: 10px; text-align: left;">Chi tiết dịch vụ</th>
                  <th style="padding: 10px; text-align: right;">Thành tiền</th>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">
                    <strong>${payload.serviceName}</strong><br/>
                    <span style="font-size: 12px; color: #666;">Hẹn lúc: ${payload.timeSlot}, Ngày ${payload.appointmentDate}</span>
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #005396;">
                    ${Number(payload.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
                  </td>
                </tr>
              </table>
              ${payload.notes ? `<p style="font-size: 13px; color: #555;"><strong>Ghi chú:</strong> ${payload.notes}</p>` : ''}
              <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #eeeeee; text-align: center; font-size: 12px; color: #888;">
                Hệ thống quản lý tự động Điện lạnh Công Thương
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        return res.json({ success: true, adminEmails, message: "Đã gửi email thông báo thành công" });
      } catch (smtpErr) {
        console.warn("Gmail SMTP authentication failed or failed to send mail:", smtpErr);
        return res.json({
          success: true,
          adminEmails,
          simulated: true,
          message: "Email simulated (Tài khoản GMAIL_USER / GMAIL_APP_PASSWORD không hợp lệ hoặc đã hết hạn App Password).",
        });
      }
    } catch (error) {
      console.error("Error sending admin notification email:", error);
      res.status(500).json({ success: false, message: "Lỗi khi gửi email", error: String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
