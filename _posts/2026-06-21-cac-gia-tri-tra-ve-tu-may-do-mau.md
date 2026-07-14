---
title: "Các giá trị trả về từ máy đo màu: L*a*b*, ΔE* và ΔEcmc"
description: "Ý nghĩa bộ số CIELAB theo hai hệ tọa độ, độ lệch màu ΔE* và giới hạn của nó — và vì sao ngành dệt may dùng ΔEcmc(2:1) để khớp với cảm nhận thật của mắt người."
topic: do-mau
series: ly-thuyet-mau-sac
series_part: 3
---

Sau khi đo xong, máy trả về một bộ số. Bài này giải thích ý nghĩa các con số đó.

## Không gian màu CIELAB

Mọi màu sắc đều có thể định vị trong không gian ba chiều. CIELAB dùng hai hệ tọa độ để làm việc đó.

**Hệ tọa độ L\*, a\*, b\* (tọa độ Descartes):**

- **L\*** = độ sáng tối. 0 là đen tuyệt đối, 100 là trắng tuyệt đối.
- **a\*** = trục đỏ/xanh lá. Dương là đỏ, âm là xanh lá.
- **b\*** = trục vàng/xanh dương. Dương là vàng, âm là xanh dương.

**Hệ tọa độ L\*, C\*, h\* (tọa độ cực):**

Cùng một màu, nhưng biểu diễn theo cách trực quan hơn.

- **L\*** = độ sáng tối (giống hệ trên).
- **C\*** = chroma, độ bão hòa màu. 0 là xám trung tính, càng lớn màu càng tươi.
- **h\*** = góc màu, từ 0° đến 360°. 0° là đỏ, 90° là vàng, 180° là xanh lá, 270° là xanh dương.

## Độ lệch màu ΔE\*

Khi so màu mẫu chuẩn và mẫu nhuộm, máy tính ra ΔE\* (Delta E), độ lệch màu giữa hai mẫu.

Theo hệ L\*a\*b\*:

> ΔE\* = √(ΔL\*² + Δa\*² + Δb\*²)

Theo hệ L\*C\*h\*:

> ΔE\* = √(ΔL\*² + ΔC\*² + Δh\*²)

ΔE\* càng nhỏ thì hai màu càng gần nhau.

## Vấn đề của ΔE\*

Công thức ΔE\* đối xử ba thành phần L\*, a\*, b\* như nhau, mỗi thành phần có vai trò ngang nhau trong kết quả. Nhưng mắt người không hoạt động như vậy.

Hai điểm mắt người khác với toán học:

**Thứ nhất:** mắt người ít nhạy với sai lệch độ sáng tối (ΔL\*) hơn là sai lệch sắc màu (Δa\*, Δb\*). Nhưng trong công thức, ΔL\* có trọng số ngang bằng hai thành phần còn lại.

**Thứ hai:** mắt người nhạy cảm hơn ở vùng màu tối, kém nhạy hơn ở vùng màu tươi sáng. Nghĩa là hai mẫu màu tối dù có ΔE\* nhỏ vẫn bị mắt phát hiện ngay. Ngược lại, hai mẫu màu tươi sáng dù ΔE\* cao mắt người vẫn thấy gần giống nhau.

Đây là giới hạn cốt lõi của ΔE\*: con số toán học không phản ánh đúng cảm nhận thực tế của mắt người.

## ΔEcmc: giải pháp cho vấn đề trên

ΔEcmc ra đời năm 1984, do Ủy ban Đo màu của Hiệp hội Nhà nhuộm và Thợ nhuộm Anh (CMC) phát triển, để giải quyết đúng vấn đề đó.

Công thức:

> ΔEcmc = √[(ΔL\*/lS<sub>L</sub>)² + (ΔC\*/cS<sub>C</sub>)² + (Δh\*/S<sub>H</sub>)²]

Như bạn thấy, ΔEcmc cũng là căn bậc hai của 3 thành phần ΔL\*, ΔC\* và Δh\* như công thức ΔE\* trong hệ tọa độ cực, nhưng mỗi thành phần được nhân với một cụm trọng số.

Trong đó S<sub>L</sub>, S<sub>C</sub>, S<sub>H</sub> là các hàm trọng số phụ thuộc vào vị trí màu trong không gian màu. *l* và *c* là hệ số do người dùng chọn, thường dùng tỷ lệ 2:1 trong ngành nhuộm, nghĩa là dung sai cho độ sáng tối được nới gấp đôi so với dung sai của ánh màu.

Để có được các trọng số S<sub>L</sub>, S<sub>C</sub>, S<sub>H</sub>, người ta thực hiện khảo sát so sánh độ lệch khi đo bằng máy và nhận xét bằng mắt của người với quy mô rất lớn rồi tinh chỉnh các hệ số này.

Nhiều người nói "không gian màu cmc" — đó là phát biểu sai vì không có không gian màu như vậy. Nó chỉ là "công thức cmc" để "bóp méo" có chủ đích không gian màu CIELAB: kéo giãn hoặc nén các vùng màu sao cho độ lệch màu tính được phản ánh đúng hơn với cảm nhận của mắt người. Vùng màu tối được nén lại, vùng màu tươi sáng được kéo giãn ra.

Một lưu ý khi đo độ lệch màu:

> Với ngành dệt – may, bạn nhớ chọn **ΔEcmc(2:1)** khi đo màu trên máy quang phổ.

Kết quả: ΔEcmc gần hơn với câu trả lời thực tế "mắt người có thấy lệch không?" so với ΔE\* thuần túy. Đây là lý do ΔEcmc được sử dụng rộng rãi trong kiểm soát màu ngành nhuộm hiện đại.

{% include kien-thuc/cta.html variant="inline" %}

{% include kien-thuc/cta.html variant="signature" %}
