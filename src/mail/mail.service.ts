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
}
