---
title: "Số hóa thất thoát do ngưng máy – bước đầu tiên để cải thiện OEE"
description: "Cách xây bảng ghi nhận ngưng máy: danh mục lý do, biểu mẫu 4 thông tin, 3 tuần đo mức nền và cách đặt mục tiêu xuất phát từ dữ liệu để công nhân chấp nhận."
topic: van-hanh
series: so-hoa-oee
series_part: 4
image: so-hoa-thoi-gian-ngung-may-4-buoc
learn:
  open:
    kind: recall
    q: "Ba nguyên nhân chính làm mất OEE trong xưởng nhuộm là gì?"
    a: "Khởi động đầu tuần, chuyển đổi mặt hàng, và máy chạy chậm hơn tiêu chuẩn. Hai cái đầu là thời gian máy ngưng hẳn, và đó chính là thứ bài hôm nay dạy cách ghi nhận. Cái thứ ba là máy vẫn chạy nhưng chậm, thuộc về hiệu suất tốc độ và được đo bằng cách khác."
    from: "oee-cua-nha-may-nhuom"
  quiz:
    - q: "Máy có kế hoạch chạy 144 giờ một tuần. Trong tuần máy hỏng tổng cộng 14 giờ. Chỉ số sẵn sàng là bao nhiêu?"
      options:
        - t: "86%"
          why: "Chưa đúng. Con số này ra từ việc lấy 14 chia cho 100 rồi trừ. Phép tính đúng là thời gian chạy thực chia thời gian kế hoạch."
        - t: "90,3%"
          correct: true
          why: "Đúng. Thời gian chạy thực = 144 − 14 = 130 giờ, và 130 ÷ 144 = 0,903."
        - t: "9,7%"
          why: "Đây là tỷ lệ thời gian ngưng, tức phần bù. Chỉ số sẵn sàng là phần còn lại."
        - t: "Chưa tính được vì chưa biết số mẻ"
          why: "Chỉ số sẵn sàng chỉ hỏi về thời gian. Số mẻ thuộc về hai thành phần còn lại của OEE."
    - q: "Ba tuần đầu triển khai bảng ghi nhận, mục tiêu duy nhất nên là gì?"
      options:
        - t: "Đạt chỉ số sẵn sàng trên 80%"
          why: "Ngược với bài. Đặt mục tiêu ngay từ đầu khiến số liệu bị làm đẹp, và khi đó không còn mức nền thật nào để so về sau."
        - t: "Ghi nhận trung thực"
          correct: true
          why: "Đúng. Ba tuần đầu chỉ có một mục tiêu là ghi nhận trung thực. Con số trung bình sau ba tuần, dù thấp đến đâu, chính là mức nền thật của xưởng."
        - t: "Tìm ra công nhân hay để máy ngưng nhất"
          why: "Bài nói rõ điều ngược lại: chỉ số sẵn sàng thấp không phải lỗi của công nhân, nó phản ánh hệ thống vận hành. Phạt trong giai đoạn này là cách nhanh nhất để mất số liệu."
        - t: "Lắp cảm biến tự động cho tất cả các máy"
          why: "Không cần. Bảng giấy kẹp tại máy, cuối tuần thu lại và nhập Excel, vẫn đủ dùng để bắt đầu."
  action: "In một bảng giấy bốn cột (giờ ngưng, giờ chạy lại, số phút, lý do) và kẹp ngay tại một máy duy nhất. Một máy, ba tuần, không đặt mục tiêu. Đó là toàn bộ bước một."
---

Qua các bài trước, hầu hết mọi người đều đã nhận biết được các dạng tổn thất thời gian trong xưởng nhuộm. Tuy nhiên mình chưa biết anh chị đã "số hóa" được chúng chưa? Nếu chưa, tham khảo cách triển khai dưới đây nhé.

## Bắt đầu từ đâu?

> Chỉ số sẵn sàng = Thời gian máy chạy thực tế ÷ Thời gian kế hoạch
>
> Thời gian máy chạy thực tế = Thời gian kế hoạch − Tổng thời gian máy ngưng

Ý nghĩa: "Tôi có kế hoạch cho máy này chạy X giờ. Nhưng thực tế máy chạy được bao nhiêu giờ?"

Ví dụ:

- Xưởng chạy 6 ngày/tuần, 24 giờ/ngày → thời gian kế hoạch = 144 giờ/máy/tuần.
- Trong tuần, máy hỏng tổng cộng 14 giờ → thời gian máy chạy thực tế = 144 − 14 = 130 giờ.

Thay 2 số này vào công thức trên, anh chị sẽ được chỉ số sẵn sàng của thiết bị đó:

Chỉ số sẵn sàng = 130 ÷ 144 = 0,903 (hay **90,3%**)

Tính được chỉ số sẵn sàng rồi nhưng làm sao để cải thiện nó thì cần **ghi nhận** được thời gian máy ngưng đầy đủ và chính xác, từ đó mới xác định được hành động nào cần triển khai. Dưới đây là kinh nghiệm triển khai thực tế của mình.

## Bước 1 – tạo danh mục phân loại lý do ngưng máy

Mỗi xưởng có đặc thù riêng nên không có danh mục chuẩn cho tất cả. Anh chị tự tạo danh mục phù hợp với xưởng mình.

Ví dụ một số loại ngưng máy phổ biến trong ngành nhuộm:

- Khởi động đầu ca/đầu tuần
- Chờ hóa chất
- Chờ kỹ thuật xem mẫu
- Sự cố thiết bị
- Vệ sinh máy
- Chuyển đổi mặt hàng
- Chờ vải đầu vào
- Bảo trì định kỳ

Nguyên tắc tạo danh mục: đủ chi tiết để phân biệt được nguyên nhân, nhưng đủ đơn giản để công nhân điền nhanh mà không nhầm. 8–12 loại là vừa. Quá nhiều thì công nhân điền đại, mất ý nghĩa.

## Bước 2 – tạo bảng ghi nhận thời gian ngưng máy

Mỗi lần máy ngưng, công nhân ghi lại 4 thông tin:

1. Thời điểm ngưng
2. Thời điểm chạy lại
3. Thời gian ngưng (phút)
4. Lý do ngưng (chọn từ danh mục)

Tùy điều kiện xưởng:

**Nếu có máy tính:** dùng Google Sheet hoặc Excel đặt ngay tại máy. Công nhân điền trực tiếp mỗi lần ngưng.

**Nếu chưa có máy tính:** in bảng giấy, kẹp ngay tại máy. Cuối tuần thu lại và nhập Excel. Chậm hơn nhưng vẫn đủ dùng.

Lưu ý quan trọng: bảng ghi nhận là của từng máy riêng lẻ, không ghi chung cho cả xưởng. Số liệu toàn xưởng chỉ tổng hợp sau khi đã có đủ số liệu từng máy.

## Bước 3 – đo 3 tuần đầu tiên

Đừng đặt mục tiêu ngay từ đầu. 3 tuần đầu chỉ có một mục tiêu: **ghi nhận trung thực**.

Sau 3 tuần, tính trung bình chỉ số sẵn sàng của từng máy. Con số đó dù thấp đến đâu, chính là mức nền thực tế của xưởng.

Hai thứ quan trọng cần nhìn vào:

- Chỉ số sẵn sàng trung bình của từng máy.
- 3 loại ngưng máy chiếm thời gian nhiều nhất của từng máy.

3 loại lớn nhất đó chính là trọng tâm cần tập trung nguồn lực để hành động, đừng nên xử lý tất cả cùng lúc.

## Bước 4 – đặt mục tiêu và cải thiện

Sau khi có mức nền, đặt mục tiêu cho từng máy bằng cách cộng thêm 5–10% so với chỉ số sẵn sàng trung bình 3 tuần đầu.

Ví dụ: máy A đang có chỉ số sẵn sàng trung bình 72% → mục tiêu đặt là 77–80%.

Con số này không phải áp từ trên xuống mà nó xuất phát từ chính dữ liệu thực tế của máy đó. Công nhân dễ chấp nhận hơn vì thấy được tính hợp lý.

Mục tiêu xem xét lại định kỳ mỗi quý. Khi xưởng đã cải thiện được thì nâng lên, không giữ mãi một mức.

## Một lưu ý thực tế

Tuần đầu triển khai, số liệu thường không đầy đủ do công nhân chưa quen, bỏ sót nhiều. Đó là bình thường.

Đừng phạt, đừng gây áp lực trong giai đoạn này. Mục tiêu là tạo thói quen ghi nhận trước. Chất lượng số liệu sẽ tốt dần theo thời gian.

Chỉ số sẵn sàng thấp không phải lỗi của công nhân. Nó phản ánh hệ thống vận hành.

{% include chia-se-kinh-nghiem/cta.html variant="card" %}

Bài tới mình sẽ chia sẻ cách tính hiệu suất tốc độ, thành phần thứ hai của OEE, và cũng là thứ khó đo nhất trong ngành nhuộm.

{% include chia-se-kinh-nghiem/hoc.html variant="end" %}

{% include chia-se-kinh-nghiem/cta.html variant="signature" %}
