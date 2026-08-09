---
title: "RFT – chỉ số quan trọng nhất trong xưởng nhuộm"
description: "Right First Time: tỷ lệ mẻ nhuộm đạt chuẩn ngay lần đầu – chỉ số chi phối tiến độ giao hàng, chi phí, sản lượng lẫn chất lượng. Cách đo và chu trình 4 bước để cải thiện."
topic: van-hanh
image: rft-nhuom-dat-tu-lan-dau
learn:
  open:
    kind: hook
    q: "RFT nên được thống kê theo số mẻ, theo số mét, hay theo số kg?"
    options:
      - "Theo số kg, vì tiền tính theo kg"
      - "Theo số mét, vì khách đặt theo mét"
      - "Theo số mẻ"
      - "Theo giá trị đơn hàng"
    promise: "Câu trả lời nằm ngay dưới công thức RFT, và lý do của nó quan trọng hơn bản thân đáp án."
  quiz:
    - q: "Vì sao nên thống kê RFT theo số mẻ chứ không theo số kg?"
      options:
        - t: "Vì đếm mẻ nhanh hơn đếm kg"
          why: "Không phải lý do trong bài, và cũng không đúng: khối lượng mẻ đã có sẵn trong sổ."
        - t: "Vì một mẻ nhỏ không đạt vẫn đại diện cho một trường hợp và một nguyên nhân"
          correct: true
          why: "Đúng. Tính theo kg thì mẻ nhỏ gần như biến mất khỏi thống kê, và trọng tâm cải thiện bị lệch về phía mặt hàng chạy nhiều. Tính theo mẻ giữ cho mỗi nguyên nhân có một lá phiếu ngang nhau."
        - t: "Vì khách hàng cũng tính theo mẻ"
          why: "Khách hàng tính theo đơn hàng. Đây là chỉ số nội bộ để tìm nguyên nhân, không phải chỉ số đối ngoại."
        - t: "Vì phần mềm chỉ đếm được theo mẻ"
          why: "Cách đo không nên do công cụ quyết định, và Excel đếm được cả hai."
    - q: "Sau khi có số liệu một tháng, bước tiếp theo là gì?"
      options:
        - t: "Đặt mục tiêu RFT chung cho cả xưởng"
          why: "Quá sớm và quá rộng. Một mục tiêu chung không chỉ ra ai phải làm gì."
        - t: "Chọn 20% nhóm có RFT thấp nhất làm trọng tâm và giao cho người phụ trách"
          correct: true
          why: "Đúng. Phân tích theo tổ hợp màu, theo mặt hàng và theo máy nhuộm để tìm 20% thấp nhất ở mỗi góc nhìn, rồi mỗi trọng tâm giao cho một người hoặc một team kèm KPI. Tập trung một trọng tâm trước, không dàn trải."
        - t: "Thay thuốc nhuộm ở những mẻ hay lỗi"
          why: "Đó có thể là biện pháp, nhưng nó thuộc bước 3, sau khi đã xác định được trọng tâm và phân tích nguyên nhân."
        - t: "Họp toàn xưởng để nhắc nhở"
          why: "Không có trong bốn bước, và không có dữ liệu nào chỉ ra nhắc nhở là biện pháp."
    - q: "Vì sao RFT được gọi là chỉ số quan trọng nhất trong xưởng nhuộm?"
      options:
        - t: "Vì nó là chỉ số khách hàng hay hỏi nhất"
          why: "Khách hỏi về chất lượng và tiến độ, hiếm khi hỏi thẳng RFT."
        - t: "Vì nó ảnh hưởng cùng lúc đến tiến độ giao hàng, chi phí, sản lượng và chất lượng"
          correct: true
          why: "Đúng. Một mẻ không đạt ngay lần đầu là một lượt máy mất đi, một lần tốn thêm hóa chất và năng lượng, một lần trễ tiến độ, và một rủi ro chất lượng cuối. Bốn thứ trong một con số."
        - t: "Vì nó dễ đo nhất"
          why: "Nó dễ bắt đầu vì dữ liệu đã có sẵn trong sổ mẻ lỗi, nhưng tiện lợi không phải là tầm quan trọng."
        - t: "Vì nó nằm trong công thức OEE"
          why: "Thành phần chất lượng của OEE có họ với RFT, nhưng bài này lập luận từ ảnh hưởng thực tế chứ không từ công thức."
  action: "Mở sổ mẻ của tháng vừa rồi và đếm hai con số: tổng số mẻ, và số mẻ phải châm màu, sửa màu hoặc vào máy lại. Chia ra là có RFT của tháng đó. Nếu con số thấp hơn dự đoán, đó là điểm xuất phát thật chứ không phải tin xấu."
---

Trong xưởng nhuộm, có một chỉ số ảnh hưởng đến gần như mọi thứ: tiến độ giao hàng, chi phí sản xuất, sản lượng và chất lượng sản phẩm cuối.

Chỉ số đó là **RFT, Right First Time**, tỷ lệ mẻ nhuộm đạt chuẩn ngay lần đầu.

Mẻ đạt RFT là mẻ không châm màu, không vào máy lại để sửa, và được kiểm tra chất lượng cuối cùng đánh giá đạt.

> RFT% = Số mẻ đạt chuẩn ngay lần đầu ÷ Tổng số mẻ nhuộm × 100

Nên thống kê theo số mẻ mà không nên thống kê theo số mét hay số kg, vì mẻ nhỏ nếu không đạt cũng đại diện cho một trường hợp và nguyên nhân không đạt. Tính luôn mẻ nhỏ để đảm bảo trọng tâm không bị lệch.

{% include chia-se-kinh-nghiem/cta.html variant="card" heading="RFT là lý do Alpha tồn tại" text="Phần mềm Alpha Smart Dyehouse sinh ra để giải đúng bài toán này: quản lý công thức màu và đơn công nghệ, dẫn dắt đường đi công nghệ của từng mẻ và kết nối thiết bị để loại lỗi thao tác. Tại nhà máy Spica, RFT tăng từ 80% lên 90% theo mẻ sau khi triển khai." %}

## Các bước giúp cải thiện RFT

### Bước 1 – triển khai đo đạc

Nếu chưa có phần mềm, dùng file Excel với các cột sau:

| Mã số mẻ | Mặt hàng | Số lượng | Mã tổ hợp màu | Mã máy nhuộm | Đạt RFT (Đạt/Không đạt) | Nguyên nhân |
|---|---|---|---|---|---|---|
| *B-0715* | *Vải TC* | *250 kg* | *M-036* | *M07* | *Không đạt* | *Lệch ánh màu* |

Việc ghi nhận diễn ra liên tục sau mỗi mẻ hoàn thành, không bỏ sót. Dữ liệu càng đầy đủ thì phân tích càng chính xác.

### Bước 2 – phân tích số liệu và chọn trọng tâm

Cuối mỗi tháng, tổng hợp và phân tích số liệu. Chọn thời gian 1 tháng để số liệu có tính thống kê đủ tin cậy.

Phân tích theo các góc nhìn để tìm trọng tâm. Ví dụ:

- 20% nhóm tổ hợp màu có RFT thấp nhất
- 20% nhóm mặt hàng có RFT thấp nhất
- 20% nhóm máy nhuộm có RFT thấp nhất

Mỗi trọng tâm giao cho một người hoặc một team phụ trách. Mỗi team có KPI để phấn đấu.

### Bước 3 – tìm biện pháp cải thiện

Người hoặc team phụ trách phân tích nguyên nhân và thực hiện biện pháp cải thiện cụ thể cho trọng tâm được giao. Tập trung vào một trọng tâm trước, không dàn trải.

### Bước 4 – họp xem xét của lãnh đạo

Định kỳ hàng tháng hoặc hàng quý, lãnh đạo triệu tập cuộc họp để người hoặc team phụ trách báo cáo: hành động đã thực hiện, kết quả đạt được và mục tiêu cho kỳ tới. Mục tiêu nên lấy kết quả vừa đạt được cộng thêm 5–10%.

Nếu kết quả đã tốt, lãnh đạo cân nhắc ngưng trọng tâm đó và chuyển sang trọng tâm mới. Đây là cách giữ cho chương trình cải thiện luôn tập trung vào điểm còn yếu nhất.

{% include chia-se-kinh-nghiem/hoc.html variant="end" %}

{% include chia-se-kinh-nghiem/cta.html variant="signature" %}
