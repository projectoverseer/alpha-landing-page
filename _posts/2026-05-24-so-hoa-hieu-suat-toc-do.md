---
title: "Số hóa hiệu suất tốc độ — thành phần thứ hai của OEE"
description: "Máy vẫn chạy, nhìn có vẻ bình thường — nhưng chậm hơn quy trình chuẩn. Đây là tổn thất khó nắm bắt nhất, và cách đo nó bằng 2 bảng theo dõi song song trong một file Excel."
topic: van-hanh
series: so-hoa-oee
series_part: 5
---

Bài trước mình hướng dẫn cách ghi nhận thời gian ngưng máy để tính chỉ số sẵn sàng. Hôm nay đến thành phần thứ hai, hiệu suất tốc độ.

Đây là chỉ số khó nắm bắt nhất vì máy đang chạy, nhìn có vẻ bình thường. Nhưng thực ra đang chậm hơn thiết kế.

## Hiệu suất tốc độ là gì?

> Hiệu suất tốc độ = Tổng thời gian chuẩn của các mẻ đã hoàn thành ÷ Tổng thời gian máy chạy thực tế

Ví dụ: trong 1 tuần, máy chạy thực tế 120 giờ, hoàn thành 22 mẻ. Tra bảng quy trình, tổng thời gian chuẩn của 22 mẻ đó là 100 giờ.

Hiệu suất tốc độ = 100 ÷ 120 = **83%**

17% còn lại là thời gian máy đang chạy nhưng chậm hơn quy trình chuẩn.

## Tại sao mẻ chạy chậm hơn chuẩn?

Trong thực tế, có nhiều nguyên nhân khiến một mẻ kéo dài hơn thời gian quy trình:

- Hơi yếu, gradient nhiệt lên chậm hơn công thức
- Nước yếu, giai đoạn xả nạp kéo dài
- Máy gặp sự cố nhỏ trong khi đang nhuộm
- Chờ kỹ thuật vào xem màu
- Chờ kiểm tra độ pH
- Chờ cân hóa chất hoặc chờ cân thuốc nhuộm

Mỗi thứ chỉ mất 10–20 phút. Nhưng một mẻ có thể gặp 3–4 lần chờ, cộng lại chạy chậm hơn chuẩn 1–2 tiếng. Máy vẫn đang chạy nên ít ai để bút ghi nhận.

## Cách đo thực tế — dùng 2 bảng trong 1 file Excel

Để tính được hiệu suất tốc độ và biết cần cải thiện cái gì, cần 2 bảng theo dõi song song:

**Bảng 1 — thời gian thực hiện:**

| Mã số mẻ | Mã quy trình nhuộm | Thời gian chuẩn | Thời gian thực tế |
|---|---|---|---|
| *B-0715* | *QT-105* | *180 phút* | *210 phút* |

File Excel nên có thêm một bảng tra riêng lưu thời gian chuẩn của từng quy trình nhuộm. Khi công nhân nhập mã quy trình vào bảng 1, Excel tự động tra và điền thời gian chuẩn tương ứng vào cột bên cạnh. Công nhân không cần nhớ hay tra tay, chỉ cần nhập đúng mã quy trình là đủ. Cách này vừa tiết kiệm thời gian điền, vừa tránh sai sót do nhập tay thời gian chuẩn.

**Bảng 2 — phân tích nguyên nhân chậm:**

| Mã số mẻ | Lý do chậm | Số phút |
|---|---|---|
| *B-0715* | *Chờ kỹ thuật xem màu* | *25* |

Bảng này để tìm ra 3 nguyên nhân chính gây chậm, tương tự như bảng phân loại ngưng máy ở bài trước. Mỗi lần mẻ bị chậm vì lý do gì, công nhân ghi vào bảng này.

Lưu ý: chỉ ghi vào bảng 2 khi thời gian thực tế vượt quá thời gian chuẩn. Không cần ghi những mẻ chạy đúng hoặc nhanh hơn chuẩn.

## Sau 3 tuần đầu tiên

Tương tự như đo chỉ số sẵn sàng, 3 tuần đầu chỉ tập trung ghi nhận trung thực, chưa đặt mục tiêu.

Sau 3 tuần nhìn vào hai thứ:

- Hiệu suất tốc độ trung bình của từng máy
- 3 nguyên nhân chiếm nhiều phút chậm nhất

3 nguyên nhân lớn nhất đó là trọng tâm cần hành động. Không phải xử lý tất cả cùng lúc.

Đặt mục tiêu bằng cách cộng thêm 5–10% so với mức nền 3 tuần đầu. Xem xét lại mỗi quý.

## Một điểm khác biệt so với đo ngưng máy

Khi đo ngưng máy, ngưng là rõ ràng, công nhân dễ nhận biết để ghi. Khi đo hiệu suất tốc độ, mẻ đang chạy, không có tín hiệu rõ ràng nào báo đang chậm hơn chuẩn. Vì vậy công nhân cần được hướng dẫn cụ thể: mỗi khi có tình huống phát sinh trong lúc mẻ đang chạy, dù máy không dừng, vẫn phải ghi vào bảng 2.

Đây là thói quen khó xây dựng hơn bảng ngưng máy. Cần kiên nhẫn hơn trong giai đoạn đầu.

{% include kien-thuc/cta.html variant="note" %}

Bài tới mình sẽ chia sẻ thành phần cuối cùng của OEE, tỷ lệ chất lượng. Thành phần này liên quan trực tiếp đến mẻ lỗi, mẻ nhuộm lại và hạ phẩm. Những con số mà hầu hết xưởng đã có nhưng chưa đưa vào hệ thống đo lường.

{% include kien-thuc/cta.html variant="signature" %}
