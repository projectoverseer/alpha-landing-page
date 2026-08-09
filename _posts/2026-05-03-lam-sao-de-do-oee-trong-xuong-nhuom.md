---
title: "Làm sao để đo OEE trong xưởng nhuộm"
description: "OEE = Sẵn sàng × Hiệu suất × Chất lượng. Cách tính đúng từng thành phần trong xưởng nhuộm, những cái bẫy phổ biến, và vì sao phép nhân mới phản ánh thực tế."
topic: van-hanh
series: so-hoa-oee
series_part: 2
image: cho-may-nhuom-khoi-dong-mat-thoi-gian
# Tiled card (design 04 §4–§5): the cartoon is part 3's face, and the feed
# must never show the identical image on two cards. This post is the umbrella
# over OEE = A × P × Q, so the card says so: the equation poster wide on top,
# two of the series' measuring infographics beneath. Hero unchanged.
thumb:
  - oee-nha-may-nhuom-60-phan-tram
  - so-hoa-thoi-gian-ngung-may-4-buoc
  - so-hoa-hieu-suat-toc-do-oee
learn:
  open:
    kind: hook
    q: "Ba thành phần của OEE lần lượt đo được 76%, 86% và 70%. OEE là bao nhiêu?"
    options:
      - "Khoảng 77%, trung bình cộng của ba số"
      - "Khoảng 46%"
      - "70%, lấy số thấp nhất"
      - "Khoảng 86%"
    promise: "Phần \"OEE thật của ví dụ trên\" trả lời. Khoảng cách giữa hai cách tính phổ biến nhất là hơn 30 điểm phần trăm."
  quiz:
    - q: "Ca 8 tiếng. Lò hơi cần 45 phút mới có áp, máy hỏng 30 phút, chờ hóa chất 20 phút. Availability là bao nhiêu?"
      options:
        - t: "76%"
          correct: true
          why: "Đúng. Máy chạy thực 6 giờ 5 phút trên 8 giờ lên lịch: 365 ÷ 480 = 76%."
        - t: "88%"
          why: "Chưa đúng. Đây là con số ra được nếu chỉ trừ máy hỏng và chờ hóa chất, bỏ qua 45 phút chờ áp hơi. Chờ áp hơi cũng là thời gian máy không chạy."
        - t: "100%, vì công nhân có mặt đủ ca"
          why: "Đây chính là cái bẫy phổ biến nhất trong bài: nhiều xưởng tính từ lúc nhân viên đến làm chứ không phải từ lúc máy thực sự chạy, khiến Availability trông cao hơn thực tế 10–15%."
        - t: "Chưa tính được, còn thiếu số mẻ"
          why: "Số mẻ thuộc về Performance và Quality. Availability chỉ cần hai con số thời gian."
    - q: "Trong kỳ có 10 mẻ hoàn thành: 2 mẻ phải nhuộm lại nhưng cuối cùng vẫn giao được, 1 mẻ hạ phẩm. Quality là bao nhiêu?"
      options:
        - t: "90%"
          why: "Chưa đúng. Đây là con số nếu chỉ loại mẻ hạ phẩm. Mẻ nhuộm lại vẫn qua được, nhưng đã tốn thêm một lượt máy nên không tính là đạt."
        - t: "70%"
          correct: true
          why: "Đúng, 7 ÷ 10. Mẻ nhuộm lại và mẻ hạ phẩm đều tính vào \"không đạt\", dù vải cuối cùng vẫn giao được. Quality hỏi \"đạt chuẩn ngay lần đầu\", không hỏi \"cuối cùng có bán được không\"."
        - t: "80%"
          why: "Chưa đúng. Loại đúng 2 mẻ nhuộm lại nhưng bỏ sót mẻ hạ phẩm."
        - t: "100%, vì cuối cùng không mẻ nào bỏ đi"
          why: "Tính như vậy thì Quality không bao giờ phát hiện được gì. Mỗi lần nhuộm lại là một lượt máy mất đi, và đó chính là thứ chỉ số này đo."
  action: "Chọn một máy và một tuần, rồi tính đủ ba thành phần cho riêng máy đó và nhân lại. Đừng tính cả xưởng ngay lần đầu: một máy đủ để thấy con số thật, và đủ nhỏ để làm xong trong một buổi."
---

Bài trước mình nói OEE của phần lớn xưởng nhuộm đang ở mức trung bình thế giới 55–60%, và gợi ý cách đo sơ bộ nhanh nhất: tổng mẻ thực tế ÷ tổng mẻ lý thuyết.

Nhưng thực tế phức tạp hơn vậy. Hôm nay mình đi vào cách đo đúng – đủ để ra con số thực sự có ý nghĩa.

Công thức chuẩn của OEE là:

> **OEE = Availability × Performance × Quality**
> (Mức độ sẵn sàng × Hiệu suất × Tỷ lệ đạt chất lượng)

Ba thành phần – ba loại tổn thất khác nhau. Nhiều xưởng chỉ đo được một hoặc hai trong số này, rồi nhầm tưởng đó là OEE thật.

## Thành phần 1 – Availability (mức độ sẵn sàng)

Câu hỏi: trong tổng thời gian máy có thể chạy, nó thực sự đang chạy bao nhiêu phần trăm?

> Availability = Thời gian chạy thực tế ÷ Thời gian lên lịch chạy

Ví dụ: một ca 8 tiếng. Nhưng lò hơi cần 45 phút mới áp hơi, máy hỏng 30 phút, chờ hóa chất 20 phút. Thực tế máy chạy được 6 giờ 5 phút.

Availability = 6h05 ÷ 8h = **76%**

Bẫy phổ biến nhất: nhiều xưởng tính từ lúc nhân viên đến làm, không phải từ lúc máy thực sự chạy. Sai lệch này khiến Availability trông cao hơn thực tế 10–15%.

## Thành phần 2 – Performance (hiệu suất, hay tốc độ)

Câu hỏi: khi máy đang chạy, nó chạy đúng tốc độ thiết kế không?

Trong ngành nhuộm, tốc độ được đo bằng chu kỳ mẻ: một mẻ vải mất bao lâu so với thời gian công thức quy định.

> Performance = (Thời gian chuẩn × Số mẻ thực tế) ÷ Thời gian chạy thực tế

Ví dụ: công thức nhuộm chuẩn 180 phút/mẻ. Máy chạy 6 tiếng, hoàn thành 2 mẻ – nhưng mỗi mẻ thực tế mất 210 phút vì nhiệt lên chậm.

Performance = (180 × 2) ÷ 420 = **86%**

Đây là tổn thất thường bị bỏ qua nhất – vì máy vẫn chạy, nhìn có vẻ ổn, nhưng thực ra đang chậm hơn thiết kế.

## Thành phần 3 – Quality (tỷ lệ chất lượng)

Câu hỏi: trong số mẻ hoàn thành, bao nhiêu mẻ đạt chuẩn ngay lần đầu?

> Quality = Số mẻ đạt chuẩn ÷ Tổng số mẻ hoàn thành

Đặc thù ngành nhuộm cần tính đúng:

- Mẻ nhuộm lại: **không** tính vào "đạt chuẩn" dù vải vẫn qua được
- Mẻ hạ phẩm: tính vào "không đạt"
- Mẻ phải sửa màu: tính vào "không đạt"

Ví dụ: 10 mẻ hoàn thành, 2 mẻ nhuộm lại, 1 mẻ hạ phẩm.

Quality = 7 ÷ 10 = **70%**

## OEE thật của ví dụ trên

> 76% × 86% × 70% = **45,8%**

Nhìn vào từng thành phần riêng lẻ, không thành phần nào trông quá tệ. Nhưng ghép lại, con số thật là 45,8%.

Đây là lý do tại sao đo OEE theo đúng công thức quan trọng: nó **nhân** các tổn thất lên, không cộng chúng lại. Cộng thì trông dễ chịu hơn. Nhân thì mới phản ánh thực tế.

{% include chia-se-kinh-nghiem/cta.html variant="note" %}

## Ghi chú thực tế

Khi bắt đầu đo OEE, đừng cố đo cả ba thành phần cùng lúc ngay từ đầu.

Bắt đầu với Quality là dễ nhất vì data đã có (sổ ghi mẻ lỗi, mẻ nhuộm lại). Sau đó đến Availability. Performance khó hơn, để sau.

Con số OEE đầu tiên bạn tính ra sẽ thấp hơn bạn nghĩ. Đó không phải tin xấu. Đó là điểm xuất phát thật.

Bài tới mình sẽ chia sẻ cụ thể hơn về "kẻ trộm thời gian vô hình": tại sao 2–4 tiếng sáng thứ Hai đang ăn mòn lợi nhuận của bạn.

{% include chia-se-kinh-nghiem/hoc.html variant="end" %}

{% include chia-se-kinh-nghiem/cta.html variant="signature" %}
