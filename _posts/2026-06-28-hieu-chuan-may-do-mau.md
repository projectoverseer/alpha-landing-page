---
title: "Hiệu chuẩn máy đo màu"
description: "Vì sao máy đo màu phải hiệu chuẩn định kỳ, quy trình ba mẫu chuẩn, và bốn thông số phải chốt với khách hàng trước khi đo: Specular, Aperture, UV Filter, Observer."
topic: do-mau
series: ly-thuyet-mau-sac
series_part: 4
---

## Vì sao phải hiệu chuẩn?

Giống tất cả thiết bị đo khác, cảm biến quang của máy đo màu theo thời gian có thể bị "trôi" giá trị. Cân thì dùng quả cân chuẩn để chuẩn lại. Máy đo pH thì dùng dung dịch pH chuẩn… Với máy đo màu thì dùng các mẫu màu chuẩn.

## Phương pháp hiệu chuẩn

Phần mềm sẽ nhắc chúng ta lần lượt đưa đúng trình tự ba mẫu chuẩn vào cửa đo:

1. **Ống bẫy đen (black trap):** mô phỏng phản xạ 0%, màu đen tuyệt đối.
2. **Miếng sứ xanh lá:** mẫu màu trung gian kiểm tra tính tuyến tính.
3. **Miếng sứ trắng (white tile):** mô phỏng phản xạ 100%.

Máy sẽ đo phổ phản xạ của từng mẫu chuẩn, so sánh với bộ phổ chuẩn gốc được lưu sẵn, từ đó tính ra hệ số hiệu chỉnh cho từng bước sóng. Khi đo mẫu thật, phổ phản xạ được tự động "hiệu chỉnh" dựa vào bộ hệ số này trước khi ra kết quả.

## Các thông số cần chọn đúng trước khi hiệu chuẩn

Các thông số dưới đây phải được chọn **trước** khi bấm Calibrate và phải giữ nguyên khi đo mẫu. Nếu hiệu chuẩn ở một thiết lập rồi đo ở thiết lập khác, kết quả sẽ sai.

### Specular (thành phần độ bóng — phản xạ gương)

Ánh sáng chiếu vào vải có hai phần: phần phản xạ khuếch tán (mang thông tin màu sắc) và phần phản xạ gương (ánh sáng bật lại như gương, không mang thông tin màu).

- **Include (SCI):** bao gồm cả phản xạ gương. Đo được màu thật của màu nhuộm.
- **Exclude (SCE):** loại bỏ phản xạ gương.
- **Gloss:** chỉ đo riêng thành phần phản xạ gương, ít dùng trong ngành nhuộm.

Trong ngành nhuộm vải, Specular Include là lựa chọn phổ biến nhất.

### Aperture (kích thước cửa đo)

Là diện tích vùng đo trên mẫu vải. Các mức thường gặp: Large, Medium, Small, Ultra Small, Extra Ultra Small.

Hiệu chuẩn ở aperture nào thì đo mẫu phải dùng aperture đó.

### UV Filter (bộ lọc tia cực tím)

Liên quan đến chất tăng trắng quang học (OBA, Optical Brightening Agent) có trong một số loại vải. Chất này hấp thụ tia UV và phát ra ánh sáng xanh lam nhìn thấy, làm vải trông trắng hơn dưới ánh sáng tự nhiên.

- **100% UV (Filter off):** không lọc UV. Dùng khi đo vải có chất tăng trắng để thấy đúng hiệu ứng phát quang.
- **0% UV (Filter FL40):** lọc hoàn toàn UV. Dùng khi đo vải màu thông thường, không có chất tăng trắng.
- **UV D65:** hiệu chuẩn lượng UV theo đúng nguồn sáng chuẩn D65. Dùng khi cần kết quả chính xác cho vải trắng có chất tăng trắng.

Với vải nhuộm màu thông thường trong ngành nhuộm, 0% UV (Filter FL40) là lựa chọn phổ biến nhất.

### Góc quan sát chuẩn (Standard Observer)

CIE định nghĩa hai góc quan sát chuẩn:

- **2° Observer (1931):** góc nhìn hẹp, tương đương nhìn một đồng xu ở khoảng cách 50cm. Được định nghĩa từ 1931, ít dùng hơn hiện nay.
- **10° Observer (1964):** góc nhìn rộng hơn, tương đương nhìn lòng bàn tay duỗi thẳng tay. Phản ánh đúng hơn cách mắt người thực sự quan sát một tấm vải. Được CIE khuyến nghị và là lựa chọn chuẩn trong ngành nhuộm hiện đại.

Cùng một mẫu vải đo dưới D65 nhưng với 2° và 10° observer sẽ cho ra bộ L\*a\*b\* khác nhau. Vì vậy khi trao đổi số liệu giữa nhà máy và khách hàng, cần thống nhất cả nguồn sáng lẫn góc quan sát.

## Tóm lại: các thông số cần hỏi khách hàng để hiệu chuẩn máy quang phổ

Ngoài việc thống nhất với khách hàng dùng nguồn sáng nào để đo mẫu, cần chốt với khách hàng các thông số sau để hiệu chuẩn về đúng điều kiện đo. Nếu không làm vậy thì kết quả đo màu trên máy của khách và máy của ta sẽ khác nhau:

- **Specular:** Include hay Exclude?
- **Aperture:** Large / Medium / Small / Ultra Small / Extra Ultra Small?
- **UV Filter:** 0% hay 100% hay UV D65?
- **Observer:** 2° hay 10°?

Và một lưu ý quan trọng mà nhiều người bỏ qua:

> Khi đo màu của khách mà yêu cầu về một trong các thông số nêu trên thay đổi so với bộ tham số đã dùng trong lần hiệu chuẩn gần nhất, thì phải thực hiện hiệu chuẩn mặc dù chưa đến chu kỳ hiệu chuẩn.

<!-- [Hình] Màn hình giao diện hiệu chuẩn trên phần mềm đo màu -->
<!-- [Hình] Các cửa đo (aperture) của máy quang phổ -->

Đây là bài cuối của chuỗi lý thuyết màu sắc và đo màu.

{% include chia-se-kinh-nghiem/cta.html variant="note" %}

{% include chia-se-kinh-nghiem/cta.html variant="signature" %}
