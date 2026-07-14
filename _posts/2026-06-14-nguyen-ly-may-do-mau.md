---
title: "Nguyên lý máy đo màu"
description: "Máy quang phổ biến màu sắc thành con số khách quan như thế nào: phổ phản xạ — \"dấu vân tay\" của tấm vải — và cách phần mềm tính ra L*a*b* dưới từng nguồn sáng."
topic: do-mau
series: ly-thuyet-mau-sac
series_part: 2
---

Mắt người đánh giá màu sắc chủ quan và khác nhau giữa từng người. Chưa kể khả năng không nhỏ là một người có thể kém nhạy cảm với một sắc màu nào đó. Chính vì vậy mà có một bộ kit chuẩn để test xem mắt một người có "chuẩn" không.

<!-- [Hình] Bộ kit Munsell chuyên dùng để test mắt của người làm công tác so màu -->

Máy đo màu (spectrophotometer) giải quyết vấn đề đó bằng cách đo màu thành con số khách quan, có thể so sánh và truyền đạt chính xác giữa các bên.

## Nguyên lý hoạt động

Máy chiếu lần lượt từng tia sáng đơn sắc vào mẫu vải, từ 380nm đến 700nm. Mỗi bước sóng, cảm biến đo lại bao nhiêu phần trăm ánh sáng được phản xạ trở lại. Kết quả có được là một đường phổ phản xạ gồm hàng chục điểm dữ liệu.

<!-- [Hình] Sơ đồ nguyên lý của một máy quang phổ đo màu -->
<!-- [Video] Demo máy quang phổ phát từng tia sáng đơn sắc và ghi lại cường độ phản xạ -->

Đường phổ này là "dấu vân tay" của tấm vải đó. Không phụ thuộc vào nguồn sáng nào, không phụ thuộc vào người nhìn. Đo, lưu trữ.

Một thực tế là mọi loại vải, nhất là vải nhuộm bằng thuốc nhuộm hoạt tính, có độ bền màu với ánh sáng không cao nên mẫu chuẩn vật lý theo thời gian bị đổi màu. Kết quả đo màu lưu được vĩnh viễn và không bao giờ thay đổi.

## Từ phổ phản xạ ra L\*a\*b\*

Đây là bước phần mềm làm thay cho mắt người. Từ bộ số phổ phản xạ, phần mềm sẽ tính cho ta bộ các giá trị đặc trưng cho một màu dưới một nguồn sáng cụ thể:

- **L\*** = độ sáng tối (0 = đen, 100 = trắng)
- **a\*** = thành phần đỏ/xanh lá
- **b\*** = thành phần vàng/xanh dương

Có một điểm quan trọng: cùng một lần đo, cùng một bộ phổ phản xạ. Nhưng hỏi dưới D65 thì ra một bộ L\*a\*b\*, hỏi dưới TL84 thì ra bộ L\*a\*b\* khác. Đây chính là lý do tại sao máy đo màu phát hiện được metamerism mà mắt người không phát hiện được khi chỉ so dưới một nguồn sáng.

{% include chia-se-kinh-nghiem/cta.html variant="note" heading="Từ máy đo đến hệ thống" text="Phần mềm quản lý công nghệ của Alpha kết nối trực tiếp với đầu đo quang phổ Datacolor tại các nhà máy đang triển khai — kết quả đo màu đi thẳng vào hệ thống, không qua ghi chép tay." %}

{% include chia-se-kinh-nghiem/cta.html variant="signature" %}
