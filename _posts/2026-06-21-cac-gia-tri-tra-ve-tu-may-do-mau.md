---
title: "Các giá trị trả về từ máy đo màu: L*a*b*, ΔE* và ΔE CMC"
description: "Ý nghĩa bộ số CIELAB theo hai hệ tọa độ, độ lệch màu ΔE* và giới hạn của nó – và vì sao ngành dệt may dùng ΔE CMC (2:1) để khớp với cảm nhận thật của mắt người."
topic: do-mau
series: ly-thuyet-mau-sac
series_part: 3
image: cong-thuc-do-lech-mau-delta-e-cmc
learn:
  open:
    kind: hook
    q: "Hai cặp mẫu vải đo được ΔE* bằng nhau. Một cặp màu đen, một cặp màu vàng tươi. Mắt người nhìn thấy gì?"
    options:
      - "Lệch như nhau, vì ΔE* bằng nhau"
      - "Cặp màu đen lệch rõ hơn"
      - "Cặp màu vàng tươi lệch rõ hơn"
      - "Không cặp nào lệch, vì ΔE* nhỏ"
    promise: "Phần \"Vấn đề của ΔE*\" ở bên dưới có câu trả lời. Đọc tới đó rồi quay lại đối chiếu: đó cũng là lý do ngành dệt may không dùng ΔE* thuần túy."
  quiz:
    - q: "Vì sao ngành dệt may dùng ΔE CMC thay cho ΔE* thuần túy?"
      options:
        - t: "Vì ΔE CMC cho con số nhỏ hơn nên dễ đạt hơn"
          why: "Không. Công thức không được chọn vì nó dễ dãi hơn, và ở nhiều vùng màu nó còn chặt hơn."
        - t: "Vì ΔE* đối xử ba thành phần như nhau, còn mắt người thì không"
          correct: true
          why: "Đúng. Mắt ít nhạy với sai lệch độ sáng tối hơn là sai lệch sắc màu, và nhạy hơn ở vùng màu tối so với vùng màu tươi sáng. ΔE CMC gắn trọng số phụ thuộc vị trí màu để con số bám sát cảm nhận thật."
        - t: "Vì ΔE CMC dùng hệ tọa độ cực còn ΔE* dùng tọa độ Descartes"
          why: "ΔE* cũng viết được trong hệ tọa độ cực. Khác biệt nằm ở trọng số, không ở hệ tọa độ."
        - t: "Vì ΔE CMC mới hơn"
          why: "Ra đời năm 1984 nên mới hơn thật, nhưng tuổi không phải lý do."
    - q: "Câu nào sau đây là phát biểu SAI?"
      options:
        - t: "ΔE CMC là một công thức tính độ lệch màu"
          why: "Đây là phát biểu chính xác."
        - t: "Không gian màu CMC"
          correct: true
          why: "Đúng, đây chính là phát biểu sai mà bài chỉ ra. Không có không gian màu nào tên CMC. Nó là công thức bóp méo có chủ đích không gian màu CIELAB: nén vùng màu tối lại và kéo giãn vùng màu tươi sáng ra."
        - t: "CIELAB là một không gian màu"
          why: "Đây là phát biểu đúng, và đó là không gian mà công thức CMC làm việc trên."
        - t: "ΔE* càng nhỏ thì hai màu càng gần nhau"
          why: "Đây là phát biểu đúng."
  action: "Mở phần mềm máy đo màu của xưởng và xem chỉ số đang hiển thị mặc định. Nếu nó đang là ΔE* chứ không phải ΔE CMC (2:1), đó là một lần chỉnh cài đặt, và mọi con số báo cho khách từ hôm nay sẽ sát hơn với cái mắt họ thấy."
---

Sau khi đo xong, máy trả về một bộ số. Bài này giải thích ý nghĩa các con số đó.

## Không gian màu CIELAB

Mọi màu sắc đều có thể định vị trong không gian ba chiều. CIELAB dùng hai hệ tọa độ để làm việc đó.

**Hệ tọa độ $$L^*, a^*, b^*$$ (tọa độ Descartes):**

- $$L^*$$ = độ sáng tối. 0 là đen tuyệt đối, 100 là trắng tuyệt đối.
- $$a^*$$ = trục đỏ/xanh lá. Dương là đỏ, âm là xanh lá.
- $$b^*$$ = trục vàng/xanh dương. Dương là vàng, âm là xanh dương.

**Hệ tọa độ $$L^*, C^*, h^*$$ (tọa độ cực):**

Cùng một màu, nhưng biểu diễn theo cách trực quan hơn.

- $$L^*$$ = độ sáng tối (giống hệ trên).
- $$C^*$$ = chroma, độ bão hòa màu. 0 là xám trung tính, càng lớn màu càng tươi.
- $$h^*$$ = góc màu, từ 0° đến 360°. 0° là đỏ, 90° là vàng, 180° là xanh lá, 270° là xanh dương.

## Độ lệch màu ΔE*

Khi so màu mẫu chuẩn và mẫu nhuộm, máy tính ra $$\Delta E^*$$ (Delta E), độ lệch màu giữa hai mẫu.

Theo hệ $$L^*a^*b^*$$:

$$\Delta E^* = \sqrt{(\Delta L^*)^2 + (\Delta a^*)^2 + (\Delta b^*)^2}$$

Theo hệ $$L^*C^*h^*$$:

$$\Delta E^* = \sqrt{(\Delta L^*)^2 + (\Delta C^*)^2 + (\Delta h^*)^2}$$

$$\Delta E^*$$ càng nhỏ thì hai màu càng gần nhau.

## Vấn đề của ΔE*

Công thức $$\Delta E^*$$ đối xử ba thành phần $$L^*$$, $$a^*$$, $$b^*$$ như nhau, mỗi thành phần có vai trò ngang nhau trong kết quả. Nhưng mắt người không hoạt động như vậy.

Hai điểm mắt người khác với toán học:

**Thứ nhất:** mắt người ít nhạy với sai lệch độ sáng tối ($$\Delta L^*$$) hơn là sai lệch sắc màu ($$\Delta a^*$$, $$\Delta b^*$$). Nhưng trong công thức, $$\Delta L^*$$ có trọng số ngang bằng hai thành phần còn lại.

**Thứ hai:** mắt người nhạy cảm hơn ở vùng màu tối, kém nhạy hơn ở vùng màu tươi sáng. Nghĩa là hai mẫu màu tối dù có $$\Delta E^*$$ nhỏ vẫn bị mắt phát hiện ngay. Ngược lại, hai mẫu màu tươi sáng dù $$\Delta E^*$$ cao mắt người vẫn thấy gần giống nhau.

Đây là giới hạn cốt lõi của $$\Delta E^*$$: con số toán học không phản ánh đúng cảm nhận thực tế của mắt người.

## ΔE<sub>CMC</sub>: giải pháp cho vấn đề trên

$$\Delta E_{\mathrm{CMC}}$$ ra đời năm 1984, do Ủy ban Đo màu của Hiệp hội Nhà nhuộm và Thợ nhuộm Anh (CMC) phát triển, để giải quyết đúng vấn đề đó.

Công thức:

$$\Delta E_{\mathrm{CMC}} = \sqrt{\left(\frac{\Delta L^*}{l\,S_L}\right)^2 + \left(\frac{\Delta C^*}{c\,S_C}\right)^2 + \left(\frac{\Delta h^*}{S_H}\right)^2}$$

Như bạn thấy, $$\Delta E_{\mathrm{CMC}}$$ cũng là căn bậc hai của 3 thành phần $$\Delta L^*$$, $$\Delta C^*$$ và $$\Delta h^*$$ như công thức $$\Delta E^*$$ trong hệ tọa độ cực, nhưng mỗi thành phần được nhân với một cụm trọng số.

Trong đó $$S_L$$, $$S_C$$, $$S_H$$ là các hàm trọng số phụ thuộc vào vị trí màu trong không gian màu. $$l$$ và $$c$$ là hệ số do người dùng chọn, thường dùng tỷ lệ 2:1 trong ngành nhuộm, nghĩa là dung sai cho độ sáng tối được nới gấp đôi so với dung sai của ánh màu.

Để có được các trọng số $$S_L$$, $$S_C$$, $$S_H$$, người ta thực hiện khảo sát so sánh độ lệch khi đo bằng máy và nhận xét bằng mắt của người với quy mô rất lớn rồi tinh chỉnh các hệ số này.

Nhiều người nói "không gian màu CMC" – đó là phát biểu sai vì không có không gian màu như vậy. Nó chỉ là "công thức CMC" để "bóp méo" có chủ đích không gian màu CIELAB: kéo giãn hoặc nén các vùng màu sao cho độ lệch màu tính được phản ánh đúng hơn với cảm nhận của mắt người. Vùng màu tối được nén lại, vùng màu tươi sáng được kéo giãn ra.

Một lưu ý khi đo độ lệch màu:

> Với ngành dệt – may, bạn nhớ chọn $$\Delta E_{\mathrm{CMC}}(2{:}1)$$ khi đo màu trên máy quang phổ.

Kết quả: $$\Delta E_{\mathrm{CMC}}$$ gần hơn với câu trả lời thực tế "mắt người có thấy lệch không?" so với $$\Delta E^*$$ thuần túy. Đây là lý do $$\Delta E_{\mathrm{CMC}}$$ được sử dụng rộng rãi trong kiểm soát màu ngành nhuộm hiện đại.

{% include chia-se-kinh-nghiem/cta.html variant="inline" %}

{% include chia-se-kinh-nghiem/hoc.html variant="end" %}

{% include chia-se-kinh-nghiem/cta.html variant="signature" %}
