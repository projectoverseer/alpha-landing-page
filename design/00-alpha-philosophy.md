# 00 — Triết lý Alpha Software

> Viết ra 2026-07-28 theo yêu cầu của AP, gom lại thành một chỗ những nguyên tắc
> trước đây nằm rải trong `AlphaSmartFabricDyehouse/docs/design/`, trong các
> changelog, và trong những lần AP nghiệm thu rồi bác bỏ.
>
> Đây là tài liệu **gốc**. Các doc khác trong thư mục này (01–07,
> `chia-se-kinh-nghiem/01-philosophy.md`) là cách áp dụng nó vào từng bề mặt cụ
> thể. Khi hai bên mâu thuẫn, doc cụ thể thắng — nhưng phải giải thích được vì sao,
> bằng chính ngôn ngữ ở đây.

---

## 1. Ba nguyên tắc nền

Ba câu này là của AP, giữ nguyên văn. Chúng được viết cho **phần mềm**
AlphaSmartFabricDyehouse, không phải cho website — mục 3 nói rõ chỗ khác nhau.

### 1.1. Neutrality is key

> Làm sao để khi người dùng nhìn vào thiết kế họ không thấy thiết kế, họ chỉ thấy
> nội dung được biểu hiện và tập trung tuyệt đối 100% vào công việc, không bị sao
> nhãng bởi bất cứ thứ gì.

Phép thử: **"cái này có biến mất không?"** Không phải "cái này có đẹp không".

Hệ quả thi công:

- Không assert brand presence trong công cụ làm việc. Phần mềm Alpha là **cây
  búa của người thợ, cây cuốc của người nông dân**. Người dùng phải take it for
  granted. Khi họ yêu công cụ thì họ tự động yêu và biết ơn người làm ra nó — chứ
  không phải vì ta dán logo to hơn.
- Signature curve, hiệu ứng lạ, hình dáng chỉ xuất hiện đúng một chỗ trong app →
  đọc ra như đồ lạ dán vào. Ca thật: vạch chèn kéo-thả tab bản đầu là khối I-beam
  hai đầu loe hình thang, AP báo *"hình dáng rất lạ"*, thay bằng thanh dọc 2px
  cùng ngôn ngữ với splitter.
- Tốc độ gần như snap. Animation mà người dùng **đợi** là animation sai.
- Nền/wash: giữ hue brand nhưng hạ chroma. Đã thử-sai 2 vòng ngày 2026-07-19 —
  wash trung tính lạnh bị bác (*"lạnh lẽo, khô khan"*), wash cam canon cũng bị bác
  (*"rất distracting và stimulating"*). Chốt: cùng hue, chroma thấp.

### 1.2. Consistency is beauty

> Vẻ đẹp thẩm mỹ là thứ chủ quan, nhưng consistency là vẻ đẹp mà không ai có thể
> từ chối được.

Đây là nguyên tắc **mạnh nhất** trong ba cái, vì nó là cái duy nhất không cãi được
bằng khẩu vị. Khi phân vân giữa hai phương án đều hợp lý, chọn cái khớp với thứ đã
có.

Hệ quả thi công:

- **Một nguồn duy nhất cho mỗi quyết định.** Không hardcode số lề trong view —
  mọi giá trị suy ra từ `AlphaLayout.Unit = 4`. Không tự khai `GridSplitter` (đã
  từng có 6 view tự chế 3 kiểu khác nhau). Không tự dựng `StatusBar` (đã từng có
  ~55 bản copy). Ca đặc biệt mới → **thêm token**, không chỉnh tay.
- **Cùng một thứ phải trông giống nhau ở mọi nơi.** Đó là lý do một con số như
  giới hạn kéo splitter là **một cặp số cho toàn app**, không đo lại theo từng
  window: đo per-view thì mỗi màn hình một giới hạn, người dùng phải học lại từng
  chỗ.
- Suy rộng sang typography: nếu chữ số `1` đổi hình ở heading thì nó phải đổi hình
  ở cả body. Một trang không được có hai hình dạng của cùng một ký tự.

### 1.3. Accessibility first

> Người dùng có thể là bất kì ai. Họ có thể là một người bị tật khúc xạ, mù màu,
> cận thị, viễn thị, loạn. Họ cũng có thể là một nhân viên văn phòng thuần thục
> các thao tác máy tính hoặc cũng có thể là một người công nhân không biết dùng
> máy tính, chỉ thực hiện được các thao tác đơn giản. Người dùng có thể không có
> chuột hoặc ít khi sử dụng chuột mà chủ yếu sử dụng bàn phím (vì làm nghề tay
> chân như khuân vác thùng hàng, đụng vào chuột 1000 lần một ngày làm giảm năng
> suất của họ). Người dùng có thể là bất kỳ ai, đến từ văn hóa khác nhau, trình độ
> khác nhau, tuổi tác từ trẻ mới ra trường đến già sắp về hưu.
>
> Đừng cố làm vừa ý mọi người, nhưng hãy làm đủ tốt để người ta không còn nhìn
> thấy giao diện.

Câu cuối là chỗ nguyên tắc 3 vòng về nguyên tắc 1: **accessibility không phải là
một tính năng thêm vào, nó là điều kiện để giao diện biến mất.** Giao diện chỉ vô
hình khi nó vô hình với *tất cả* mọi người.

Hệ quả thi công:

- Bàn phím là đường chính, không phải đường phụ. **Esc đóng mọi dialog/menu.**
  Phím tắt chỉ gán cho hành động AN TOÀN (đóng, hủy, quay lại) — **không bao giờ**
  cho hành động ghi dữ liệu.
- Hit target ≥ 32–34px. Vùng bấm luôn rộng hơn vùng nhìn (splitter: vạch 1px, vùng
  bấm 6px). Bẫy đã đo: `PackIcon` vẽ bằng `Path` nên chỉ hit-test chỗ **có mực** —
  icon rỗng ruột rê vào giữa là mất tooltip. Phải bọc `Border{Background=Transparent}`.
- Tiêu đề là icon ⇒ **bắt buộc** có tooltip dạng chữ.
- Màu không bao giờ là tín hiệu duy nhất, và phải đạt AA. `#E35205` cấm làm chữ
  nhỏ → dùng `#B8390A` (5.8:1).

---

## 2. Nguyên tắc phái sinh — những thứ lặp lại đủ nhiều để thành luật

### 2.1. Mất thông tin một phần nguy hiểm hơn mất toàn bộ

Nguyên tắc quan trọng nhất của đường in, và là cách nghĩ đáng mang sang mọi chỗ
khác.

Nếu máy in sắp hết mực, phải đảm bảo **không có chữ nào mất một phần**. Tờ giấy
không đọc được thì phải không đọc được **toàn bộ** — chứ không phải vài khiếm
khuyết làm biến mất một số chữ. Trong sản xuất, một phiếu đọc được 90% nguy hiểm
hơn một phiếu trắng: phiếu trắng thì người ta in lại, phiếu thiếu thì người ta làm
theo.

Cùng một logic sinh ra:

- **Hạ cỡ chữ chứ KHÔNG cắt chữ.** Ô giá trị "dài mấy cũng không được tràn" tự
  chọn cỡ lớn nhất trong thang 13→10→9pt mà vẫn nằm trong 2 dòng. Không bao giờ
  `ellipsis`, không bao giờ trim.
- Ô merge không wrap là địa chỉ dài bị **cắt cụt** — cả 3 ô công ty phải `WrapText`.
- Ngân sách 1 trang A4: Excel không "chảy" nội dung, tràn 3 dòng là ra tờ thứ 2
  gần như trắng.
- Test bằng **ca cực đoan**, không bằng ca trung bình: tên dài bất thường, hết
  mực, 1 trang, nhiều mẫu tràn nhiều tờ.

### 2.2. Đo, đừng đoán — và ghi lại cái bẫy

Đây là phương pháp làm việc, không phải nguyên tắc thẩm mỹ, nhưng nó bảo vệ cả ba
nguyên tắc trên.

- Mọi khẳng định "đã xong" phải kèm **cách đo**. So từng dependency property
  trước/sau. Unzip `.docx` đếm part. Nạp DLL thật để tra enum thay vì tra tool
  online (bản pin 3.2.0 khác bản mới nhất).
- **Build xanh KHÔNG phải bằng chứng.** Câu này đã đúng nhiều lần đến mức thành
  luật: `Template != null` cũng không phải bằng chứng (style theme cũng có
  Template); `new FontFamily("pack://...")` một tham số **im lặng** rơi về Arial,
  không ném exception nên `try/catch` không bắt được.
- Cái bẫy đã tốn thời gian một lần thì **viết xuống kèm chữ "đừng thử lại"**, và
  nếu được thì **khóa bằng một cổng verify tự động**.
- Ca đã bác bỏ phải ghi cả **lý do bác**, không chỉ ghi kết luận — nếu không thì
  6 tháng sau có người đề xuất lại đúng phương án đó.

### 2.3. Nếu mọi thứ đều khẩn cấp, sẽ không có gì là khẩn cấp

Đỏ + bold là **ngân sách có hạn của cả màn hình**, không phải cách nhấn mạnh.

- Nguy hiểm/mất mát → đỏ, được bold.
- Việc cần làm → **một** tín hiệu nhỏ màu vàng. Chữ giữ màu mặc định, không bold.
- Thông tin phân loại → trung tính.
- **Một trạng thái = MỘT tín hiệu.** Đã đổi màu chấm thì đừng đổi tiếp màu chữ +
  bold + màu nền cho cùng một thông tin.
- **Trạng thái phổ biến thì im lặng.** Mức mặc định chiếm đa số record mà cũng đeo
  badge thì badge thành nhiễu nền, và mất tác dụng ở đúng chỗ cần chú ý.

Đây là mục 1.1 áp cho sự chú ý: nhiễu thị giác cũng là một dạng "thấy thiết kế".

### 2.4. Phần mềm này dành cho người dùng, không dành cho dev

Luật viết lời (đầy đủ ở `error-handling.md` mục 1c):

- Nói **chỗ sửa**, không nói tên lỗi. "No print template for this window" → chỉ
  đường: vào Quản lý mẫu in → "Tạo mẫu chuẩn" → in lại.
- Nói **hậu quả**, không nói tên component. Không phải "fallback qua LibreOffice"
  mà "phiếu vẫn in nhưng ra máy in mặc định, có thể không phải máy in đã chọn".
- **Gọi đúng tên** thứ đang nói tới: "Bạn đang chọn mẫu của 2 khách hàng: ALPHA,
  CHAMPRO" thay vì "chỉ in được cùng một khách hàng".
- Việc người dùng làm được xếp trước; chi tiết kỹ thuật xuống dòng riêng, có nhãn
  **"Chi tiết cho IT"**.
- Bỏ jargon, giữ nguyên sự thật: "không lưu vào cơ sở dữ liệu" → "đóng màn hình
  rồi mở lại là mất".
- Khi hỏi Có/Không, nói luôn **cái giá của "Không"**.
- **Không bao giờ đổ tên language key ra màn hình.**

### 2.5. Absolute Neutrality

Tên AP đặt cho tầng sâu nhất của mục 1.1: những chi tiết mà **98% người dùng không
bao giờ nhận ra, nhưng sẽ thấy thiếu nếu bỏ đi**.

Không phải chi tiết để khoe. Là chi tiết để không ai phải nghĩ về nó. Ví dụ trong
repo này: opsz đi theo đúng cỡ chữ thật; dấu phẩy tròn; dấu gạch nối nâng lên
cap-height trong nhãn viết hoa. Không cái nào được nhận ra, cả ba đều được cảm
thấy.

---

## 3. Website KHÁC phần mềm ở đâu

AP nói thẳng: *"These are the design principles we wrote for our
AlphaSmartFabricDyehouse software, NOT this website. This website is definitely a
marketing website more than a product."*

Chỗ giống nhau là **phương pháp** (mục 2.2), không phải **giọng**.

| | Phần mềm (công cụ) | Website (marketing) |
| --- | --- | --- |
| Vai | cây búa của người thợ | lời mời, lời hứa |
| Brand presence | **cấm** assert | được phép, và nên |
| Người dùng đang làm gì | công việc, hằng ngày, 8 tiếng | đọc lần đầu, 40 giây |
| Neutrality nghĩa là | giao diện biến mất | **không có chỗ nào gợn** |
| Thành công là | không ai nhắc tới nó | người ta tin và liên hệ |

Điều **không** đổi giữa hai bên:

- Accessibility first. Người đọc website cũng chính là người sẽ dùng phần mềm —
  cùng những đôi mắt ấy, cùng nhà máy ấy.
- Consistency is beauty.
- Đo, đừng đoán.
- Không mất thông tin.

### 3.1. Giọng của website: **friendly, không playful**

AP: *"We embrace massive changes to raise RFT by 30%. Big changes are coming to
your factory, but I promise you, everything will be smooth. You will love it. And
in the end, you will thank us and be so happy that you've found us."*

Và: *"I don't quite like the word 'playful' here because we're not playing. We're
making great products that users will love."*

Phân biệt cho rõ, vì nó quyết định từng lựa chọn cụ thể:

- **Friendly** = ấm, cởi mở, dễ gần, thoáng. Nói "bạn sẽ ổn thôi".
- **Playful** = đùa, trang trí, tự gọi sự chú ý về mình. Nói "nhìn tôi này".

Website được phép friendly. Không được phép playful — vì playful mâu thuẫn với
chính lời hứa đang bán: *sự thay đổi lớn này sẽ êm*. Một trang trông như đang đùa
thì không ai tin nó vận hành được nhà máy của họ.

Phép thử cho mọi lựa chọn thẩm mỹ trên website:

> **Nó có làm trang ấm hơn mà không lấy đi thứ gì của người đọc không?**

Ấm hơn nhưng khó đọc hơn → loại. Ấm hơn nhưng lạ mắt → loại. Ấm hơn và đọc dễ hơn
→ đó chính là thứ cần tìm.

---

## 4. Typography — render đúng ý người thiết kế font

AP 2026-07-28: *"Font phải render theo đúng ý của nhà design font nhất. Tức là
tracking, kerning, v.v. phải chuẩn. Nếu họ có tune tracking theo từng font size
thì cũng theo ý của họ."*

### 4.1. Luật nền

Font đã được vẽ bởi người biết việc hơn ta. Việc của CSS là **đừng cản**, không
phải "cải thiện".

- Tracking/kerning: để font tự lo. `font-kerning: normal`,
  `font-variant-ligatures: common-ligatures contextual`. Không letter-spacing tay,
  **trừ** một ca cổ điển: một dãy CHỮ HOA cần thêm air, vì chữ hoa được vẽ để dẫn
  đầu một từ thường, không phải để đứng thành hàng.
- Optical size: giao lại cho font qua `font-optical-sizing: auto` (Inter) hoặc
  quy đổi đúng đơn vị (Literata). Không ghim tay.
- Không `-webkit-font-smoothing` (trên Windows là no-op; trên macOS nó render
  **mảnh hơn** trọng lượng font thật có). Không `text-rendering: optimizeLegibility`
  (Blink chỉ bật kerning + ligature, mà hai thứ đó đã khai rõ ràng và portable hơn).
- Không `font-synthesis` — có 100–900 thật thì không bao giờ giả.

### 4.2. Luật quan trọng nhất: **đặc tính của font là chuyện của từng font**

Bài học đã trả giá hai lần trong cùng một tuần:

**Lần 1 — đơn vị của `opsz`.** Site từng áp một quy tắc chung "opsz là thang point,
nhân 0.75 × px" cho cả hai font. Đúng với Literata (bảng `STAT` của nó đặt tên các
mốc là `"7pt"`, `"12pt"`, `"36pt"`, `"72pt"`), **sai với Inter** (`STAT` đặt tên
`"Text"` (14) và `"Display"` (32), không đơn vị, và `inter.css` của chính bản phát
hành khuyến nghị `font-optical-sizing: auto`).

**Lần 2 — mã feature OpenType.** Inter có `ss01` = "Open digits". Literata **cũng
có** `ss01`, nhưng của nó là **"Adscript alternates"** (dạng iota Hy Lạp). Một dòng
`font-feature-settings: "ss01" 1` đặt ở gốc hub sẽ bật cả hai.

> **Một feature tag là một tọa độ trong bảng của MỘT font, không phải từ vựng
> chung.** Không có "ss01" nói chung. Chỉ có "ss01 của Inter".

Vì thế site dùng `@font-feature-values` (gắn tên vào **family**) chứ không dùng
`font-feature-settings` thô. Đặt một lần trên `.kt`, nó tự giải đúng theo font
đang thật sự render từng phần tử — Inter nhận, Literata bỏ qua. Thêm một lý do
kỹ thuật: `font-feature-settings` **thay thế** cả danh sách thừa kế, nên
`.metric` (tabular figures) sẽ vô tình tắt hết alternate của body; còn
`font-variant-alternates` và `font-variant-numeric` là hai longhand khác nhau nên
cộng dồn.

### 4.3. Alternate đã chọn cho website (2026-07-28)

Bật, toàn site, cả hub:

| Tag | Tên | Vì sao |
| --- | --- | --- |
| `ss03` | Round quotes & commas | Dấu phẩy/nháy mặc định của Inter là cái nêm xiên, đọc ra như dấu prime/inch. Đây là dạng sách. Tiếng Việt câu dài nhiều mệnh đề → gần như câu nào cũng có. Và dấu phẩy có đuôi thì xa dấu chấm hơn cái nêm. |
| `ss01` | Open digits (4/6/9 mở, 3 đỉnh phẳng) | Thoáng hơn và **dễ đọc hơn cùng lúc** — chính cái độ mở làm nó nhẹ đi là cái giữ 3 khỏi 8 và 6/9 khỏi 8. |
| `cv01` | Alternate one | Cờ số `1` cong lõm thay cho nêm thẳng. Ấm hơn, và xa thân trần `I`/`l` hơn mặc định. Inter vẽ cả bản tabular nên `.metric` khớp body. |
| `case` | Case-sensitive forms | Chỉ ở nhãn viết hoa. Nâng gạch nối/hai chấm/ngoặc lên cap-height (đo được: gạch nối +110/2048 em, hai chấm +221). Thiếu nó thì gạch nối trong nhãn HOA tụt xuống thấy rõ. |

Đã xem tận mắt rồi **loại**, kèm lý do (đừng đề xuất lại nếu không có lý do mới):

| Tag | Tên | Vì sao loại |
| --- | --- | --- |
| `cv11` | Single-storey `a` | Cái to nhất và sai nhất. Biến Inter thành font hình học kiểu sách vỡ lòng, và `a` một tầng gần `o`/`d` hơn với người kém thị lực. **Friendly mà mất legibility không phải cái trade site này muốn.** |
| `cv06` | Simplified `u` | Tròn hơn thật, nhưng xóa mất cái spur giữ `u` khỏi thành `n` lộn ngược — mà tiếng Việt đầy nu/un ("nuôi", "người", "nung"). |
| `cv10` | `G` with spur | AP có hỏi. Nhưng nó chạy ngược hướng: spur là dạng grotesque cứng và trang trọng hơn, không phải thân thiện hơn. |
| `cv05`, `cv08` | `l` có đuôi, `I` có chân | Dạng disambiguation cho code/dữ liệu. Trong văn xuôi đọc ra như tật kỹ thuật, và một cái chân serif mọc trên đúng một chữ của font sans là cái seam dễ bị nhận ra nhất. |
| `cv12`, `cv13` | `f`/`t` compact | Hẹp hơn = chặt hơn = ngược hướng. |
| `zero` | Số 0 gạch chéo | Đọc ra "kỹ thuật", không phải "chào mừng". |
| `ss05`–`ss08` | Circled / squared / square punctuation | Trang trí. Riêng `ss08` là nghịch đảo đúng nghĩa đen của `ss03`. |
| `dlig` | Discretionary ligatures | Trong Inter chỉ có đúng interrobang (`!?`→‽). Vô dụng ở đây. |
| `salt` | Stylistic alternates | Bật **tất cả** alternate cùng lúc. Không bao giờ. |
| `cpsp` | Capital spacing | Đã đo: là `SinglePos` phẳng trên 621 glyph, **không có kiểm tra ngữ cảnh**, nên nó nới cả chữ hoa đầu câu. Chỉ đúng cho dãy toàn hoa — mà chỗ đó đã letterspace tay rồi. |

Nguyên tắc rút ra, đáng giữ cho lần sau: **feature nào vừa làm ấm vừa làm dễ đọc
thì lấy; feature nào đổi legibility lấy tính cách thì bỏ.** Ba cái được chọn đều
nằm ở vế đầu. Đó không phải trùng hợp — đó là phép thử ở mục 3.1.

---

## 5. Checklist trước khi chốt một thay đổi thiết kế

- [ ] Nó có làm người dùng **thấy thiết kế** không? (1.1)
- [ ] Nó có khớp với thứ đã tồn tại, hay đẻ ra kiểu thứ hai cho cùng một việc? (1.2)
- [ ] Người kém thị lực / không dùng chuột / không rành máy tính có mất gì không? (1.3)
- [ ] Có chỗ nào thông tin mất **một phần** thay vì mất hẳn không? (2.1)
- [ ] Đã **đo** chưa, hay đang đoán? Bằng chứng là gì? Build xanh không tính. (2.2)
- [ ] Có đang tiêu ngân sách tín hiệu vào việc không khẩn cấp không? (2.3)
- [ ] Lời thông báo có nói **chỗ sửa** và **hậu quả** không? (2.4)
- [ ] Nếu là website: ấm hơn mà **không lấy đi gì** của người đọc chứ? (3.1)
- [ ] Nếu là font: đây là đặc tính của **font này**, hay đang áp luật của font khác? (4.2)
- [ ] Cái bẫy vừa gặp đã được ghi lại + khóa bằng cổng verify chưa? (2.2)
