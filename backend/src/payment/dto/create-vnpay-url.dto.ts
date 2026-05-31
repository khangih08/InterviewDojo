export interface CreateVnpayUrlDto {
  userId: string;
  amount?: number; // Số tiền tính theo VND, mặc định dùng gói PRO cố định.
}
