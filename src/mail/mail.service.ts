import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT ?? 587),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async sendOrderConfirmation(params: {
    to: string;
    orderCode: string;
    recipientName: string;
    totalAmount: number;
  }) {
    const { to, orderCode, recipientName, totalAmount } = params;

    const result = await this.transporter.sendMail({
      from: `"Your Store" <${process.env.MAIL_USER}>`,
      to,
      subject: `Đặt hàng thành công - ${orderCode}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body>
            <h2>Đặt hàng thành công 🎉</h2>

            <p>Xin chào <strong>${recipientName}</strong>,</p>

            <p>
              Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi.
            </p>

            <p>
              Mã đơn hàng:
              <strong>${orderCode}</strong>
            </p>

            <p>
              Tổng tiền:
              <strong>${totalAmount.toLocaleString('vi-VN')} VNĐ</strong>
            </p>

            <p>
              Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
            </p>

            <p>Trân trọng,<br />Your Store</p>
          </body>
        </html>
      `,
    });

    return result;
  }

  async sendMonthlyRevenueReport(params: {
    to: string;
    year: number;
    month: number;
    revenue: number;
    totalOrders: number;
  }) {
    const { to, year, month, revenue, totalOrders } = params;
    console.log('📧 MAIL_USER:', process.env.MAIL_USER);
    console.log('📧 MAIL_TO:', params.to);

    return this.transporter.sendMail({
      from: `"Your Store" <${process.env.MAIL_USER}>`,
      to,
      subject: `Báo cáo doanh thu tháng ${month}/${year}`,
      html: `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>📊 Báo cáo doanh thu tháng ${month}/${year}</h2>

          <p>
            Xin chào Admin,
          </p>

          <h3>Tổng quan</h3>

          <table>
            <tr>
              <td><strong>Tháng</strong></td>
              <td>${month}/${year}</td>
            </tr>

            <tr>
              <td><strong>Tổng đơn hàng</strong></td>
              <td>${totalOrders}</td>
            </tr>

            <tr>
              <td><strong>Doanh thu</strong></td>
              <td>
                ${revenue.toLocaleString('vi-VN')} VNĐ
              </td>
            </tr>
          </table>

          <p>
            Đây là báo cáo doanh thu tự động được
            hệ thống gửi vào đầu mỗi tháng.
          </p>
        </body>
      </html>
    `,
    });
  }
}
