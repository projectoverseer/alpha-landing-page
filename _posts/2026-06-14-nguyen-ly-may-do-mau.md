---
title: "Nguyên lý máy đo màu"
description: "Máy quang phổ biến màu sắc thành con số khách quan như thế nào: phổ phản xạ – \"dấu vân tay\" của tấm vải – và cách phần mềm tính ra L*a*b* dưới từng nguồn sáng."
meta_desc: "Máy quang phổ biến màu sắc thành con số khách quan thế nào: phổ phản xạ – dấu vân tay của tấm vải – và cách tính ra L*a*b* dưới từng nguồn sáng."
topic: do-mau
series: ly-thuyet-mau-sac
series_part: 2
image: bo-kit-munsell-hue-test
# Tiled card (design 04 §4): the machine-with-light-path picture is the
# title's promise and leads; the Munsell kit is the right cell because the
# pair IS the post's argument — subjective eye test vs objective machine.
# The hero stays the kit alone: the prose points at it ("ở đầu bài").
thumb:
  - so-do-nguyen-ly-may-quang-pho-do-mau
  - bo-kit-munsell-hue-test
learn:
  open:
    kind: hook
    q: "Máy đo màu đo một lần rồi lưu lại cái gì?"
    options:
      - "Bộ số L*a*b*"
      - "Đường phổ phản xạ"
      - "Ảnh chụp mẫu vải"
      - "Tên thuốc nhuộm đã dùng"
    promise: "Phần \"Nguyên lý hoạt động\" ở bên dưới có câu trả lời. Đọc tới đó rồi quay lại đối chiếu: khác biệt giữa hai đáp án đầu chính là lý do máy phát hiện được metamerism còn mắt người thì không."
  quiz:
    - q: "Vì sao kết quả đo màu lưu được vĩnh viễn còn mẫu chuẩn vật lý thì không?"
      options:
        - t: "Vì file số không chiếm chỗ trong kho"
          why: "Đúng trên thực tế, nhưng không phải lý do bài nêu."
        - t: "Vì mọi loại vải đều có độ bền màu với ánh sáng có hạn nên mẫu chuẩn theo thời gian bị đổi màu"
          correct: true
          why: "Đúng, và bài chỉ rõ vải nhuộm bằng thuốc nhuộm hoạt tính là trường hợp rõ nhất. Bộ số đo được thì không bao giờ thay đổi."
        - t: "Vì mẫu vật lý hay bị thất lạc"
          why: "Có xảy ra, nhưng đó là vấn đề quản lý chứ không phải vấn đề kỹ thuật mà bài nói tới."
        - t: "Vì khách hàng không trả lại mẫu"
          why: "Không liên quan đến lập luận của bài."
    - q: "Vì sao máy đo màu phát hiện được metamerism còn mắt người so trong tủ đèn thì không?"
      options:
        - t: "Vì máy nhạy hơn mắt người"
          why: "Không phải chuyện nhạy. Mắt người rất nhạy, vấn đề là mắt chỉ nhìn được dưới một nguồn sáng tại một thời điểm."
        - t: "Vì từ cùng một bộ phổ phản xạ, phần mềm tính ra L*a*b* dưới nhiều nguồn sáng khác nhau"
          correct: true
          why: "Đúng. Metamerism là hai mẫu giống nhau dưới nguồn này và khác nhau dưới nguồn kia. Máy giữ nguyên phổ rồi hỏi lại nó dưới D65, dưới TL84. Mắt chỉ trả lời được cho nguồn sáng đang bật."
        - t: "Vì máy đo cả độ bóng của vải"
          why: "Độ bóng là thông số Specular, một chuyện khác."
        - t: "Vì máy đo được cả tia cực tím"
          why: "Bộ lọc UV cũng là một thông số riêng, không phải cơ chế phát hiện metamerism."
  action: "Lần tới khi gửi mẫu chuẩn cho khách, gửi kèm cả bộ số đo. Tấm vải trong phong bì sẽ đổi màu sau vài tháng; bộ số thì không, và nó là thứ duy nhất hai bên còn so lại được sau một năm."
---

Mắt người đánh giá màu sắc chủ quan và khác nhau giữa từng người. Chưa kể khả năng không nhỏ là một người có thể kém nhạy cảm với một sắc màu nào đó. Chính vì vậy mà có một bộ kit chuẩn để test xem mắt một người có "chuẩn" không – bộ kit Munsell ở đầu bài.

Máy đo màu (spectrophotometer) giải quyết vấn đề đó bằng cách đo màu thành con số khách quan, có thể so sánh và truyền đạt chính xác giữa các bên.

## Nguyên lý hoạt động

Máy chiếu lần lượt từng tia sáng đơn sắc vào mẫu vải, từ 380 nm đến 700 nm. Mỗi bước sóng, cảm biến đo lại bao nhiêu phần trăm ánh sáng được phản xạ trở lại. Kết quả có được là một đường phổ phản xạ gồm hàng chục điểm dữ liệu.

{% include chia-se-kinh-nghiem/figure.html name="so-do-nguyen-ly-may-quang-pho-do-mau" %}

<!-- [Video] Demo máy quang phổ phát từng tia sáng đơn sắc và ghi lại cường độ phản xạ -->

Đường phổ này là "dấu vân tay" của tấm vải đó. Không phụ thuộc vào nguồn sáng nào, không phụ thuộc vào người nhìn. Đo, lưu trữ.

Một thực tế là mọi loại vải, nhất là vải nhuộm bằng thuốc nhuộm hoạt tính, có độ bền màu với ánh sáng không cao nên mẫu chuẩn vật lý theo thời gian bị đổi màu. Kết quả đo màu lưu được vĩnh viễn và không bao giờ thay đổi.

## Từ phổ phản xạ ra L\*a\*b\*

Đây là bước phần mềm làm thay cho mắt người. Từ bộ số phổ phản xạ, phần mềm sẽ tính cho ta bộ các giá trị đặc trưng cho một màu dưới một nguồn sáng cụ thể:

- $$L^*$$ = độ sáng tối (0 = đen, 100 = trắng)
- $$a^*$$ = thành phần đỏ/xanh lá
- $$b^*$$ = thành phần vàng/xanh dương

Có một điểm quan trọng: cùng một lần đo, cùng một bộ phổ phản xạ. Nhưng hỏi dưới D65 thì ra một bộ $$L^*a^*b^*$$, hỏi dưới TL84 thì ra bộ $$L^*a^*b^*$$ khác. Đây chính là lý do tại sao máy đo màu phát hiện được metamerism mà mắt người không phát hiện được khi chỉ so dưới một nguồn sáng.

{% include chia-se-kinh-nghiem/cta.html variant="note" heading="Từ máy đo đến hệ thống" text="Phần mềm quản lý công nghệ của Alpha kết nối trực tiếp với đầu đo quang phổ Datacolor tại các nhà máy đang triển khai – kết quả đo màu đi thẳng vào hệ thống, không qua ghi chép tay." %}

{% include chia-se-kinh-nghiem/hoc.html variant="end" %}

{% include chia-se-kinh-nghiem/cta.html variant="signature" %}
