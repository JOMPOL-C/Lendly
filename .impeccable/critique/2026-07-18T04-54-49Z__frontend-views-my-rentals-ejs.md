---
target: หน้า my_rentals
total_score: 16
p0_count: 0
p1_count: 4
timestamp: 2026-07-18T04-54-49Z
slug: frontend-views-my-rentals-ejs
---
Method: dual-agent (A: 019f7389-88e5-7080-abb7-b43e73532a8b · B: 019f7389-8949-7c01-bf88-fda73a8afb0a)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|------:|-----------|
| 1 | Visibility of System Status | 2/4 | มีข้อความสถานะและเวลาชำระ แต่ไม่มีภาพรวมงานค้าง และสถานะหมดเวลาไม่เปลี่ยน action |
| 2 | Match System / Real World | 3/4 | ภาษาไทยเข้าใจง่าย แต่ “มีปัญหา / ยกเลิก” รวมความต้องการคนละแบบ |
| 3 | User Control and Freedom | 2/4 | เปิดรายละเอียดได้ แต่แท็บไม่จำสถานะ ไม่มี deep link/filter และไม่มีทางแก้ปัญหาโดยตรง |
| 4 | Consistency and Standards | 1/4 | ใช้ลิงก์จำลองเป็นแท็บ ไม่มี ARIA สถานะรอจ่ายไม่ใช้รูปแบบเดียวกัน และมีลิงก์เสีย |
| 5 | Error Prevention | 1/4 | ปุ่มชำระยังใช้งานได้หลัง countdown หมด และไม่มีคำอธิบายผลที่จะเกิดขึ้น |
| 6 | Recognition Rather Than Recall | 2/4 | ต้องไล่เปิด 8 แท็บเอง เพราะไม่มีจำนวนรายการหรือสัญญาณ “ต้องทำ” |
| 7 | Flexibility and Efficiency | 1/4 | ไม่มีค้นหา/กรอง/เรียง/จำแท็บ และทุกครั้งเริ่มที่รอชำระเงิน |
| 8 | Aesthetic and Minimalist Design | 2/4 | ภาพรวมไม่ฉูดฉาด แต่ card ซ้อน card และแท็บจำนวนมากทำให้ลำดับความสำคัญแบน |
| 9 | Error Recovery | 1/4 | empty state ไม่บอกทางต่อ และสถานะปัญหาไม่แสดงเหตุผลหรือช่องทางแก้ |
| 10 | Help and Documentation | 1/4 | มี chat widget แต่ไม่มีคำแนะนำตามบริบทในช่วงชำระ ส่ง คืน หรือยกเลิก |
| **Total** | | **16/40** | **Poor: ต้องปรับ UX หลักก่อน polish** |

## Anti-Patterns Verdict

**LLM assessment:** ไม่ได้ดูเป็น AI-generated แบบชัดเจน แต่มี product-template slop ระดับปานกลาง: แท็บ 8 ตัว การ์ดสีม่วงอ่อนซ้ำ ๆ สถานะหน้าตาคล้ายกัน และไม่มีลำดับตามความเร่งด่วน หน้าเหมือนประกอบจากสถานะระบบมากกว่าถูกออกแบบเป็น “โต๊ะจัดการการเช่า” ที่ช่วยให้ลูกค้ารู้ deadline, ขั้นตอนปัจจุบัน, สิ่งที่ต้องทำต่อ และทางแก้เมื่อมีปัญหา

**Deterministic scan:** `detect.mjs` คืนค่า `[]` (0 findings, exit 0) จึงไม่พบ pattern ต้องห้ามใน markup เป้าหมาย อย่างไรก็ตาม source review พบปัญหาเชิง interaction/accessibility ที่ detector ไม่ครอบคลุม ได้แก่ pseudo-tabs ไม่มี ARIA, alt ว่าง, URL รายการยกเลิกมีช่องว่าง, countdown ไม่มี live-region และ mobile tabs ไม่มี responsive rule

**Visual overlays:** ไม่มี overlay ที่เชื่อถือได้ เนื่องจาก browser surface ที่เปิดให้ใช้ไม่รองรับ mutable script injection และ route ต้องใช้ session/database จึงใช้ CLI และ source evidence เป็น fallback

## Overall Impression

พื้นฐานข้อมูลถูกต้องและครอบคลุมวงจรเช่า แต่โอกาสใหญ่ที่สุดคือเปลี่ยนโครงจาก “8 สถานะระบบ” เป็น “สิ่งที่ฉันต้องทำ / กำลังดำเนินการ / เสร็จแล้ว / มีปัญหา” พร้อม count และ next action ที่เด่นชัด

## What's Working

- ครอบคลุมวงจรเช่าตั้งแต่ชำระเงิน ยืนยัน จัดส่ง เช่า ส่งคืน จนจบรายการ
- จัดกลุ่ม order กับสินค้าหลายชิ้นไว้ด้วยกัน ทำให้ความสัมพันธ์ข้อมูลไม่แตกกระจาย
- วันที่เป็น locale ไทย และ CTA “แนบสลิป / ยืนยันการชำระเงิน” สื่อสารตรงกับงาน

## Priority Issues

### [P1] เส้นทางแก้ปัญหา/ยกเลิกเสียและไม่มี recovery

**Why it matters:** เป็นช่วงที่ความเชื่อใจต่ำที่สุด แต่ลิงก์รายละเอียดมีช่องว่างใน URL และการ์ดไม่บอกเหตุผล ผลต่อเงิน หรือทางติดต่อ

**Fix:** แก้ route, แยก “ยกเลิกแล้ว” ออกจาก “ต้องการความช่วยเหลือ”, แสดงเหตุผล/สถานะคืนเงิน และมี CTA ติดต่อร้านหรือแอดมิน

**Suggested command:** `$impeccable harden`

### [P1] แท็บ 8 ตัวมีภาระการตัดสินใจสูงและเสี่ยงล้นบนมือถือ

**Why it matters:** ผู้ใช้ต้องสแกนทุกสถานะเพื่อหารายการที่ต้องทำ และ CSS ไม่มี wrap/overflow/mobile treatment สำหรับแถบนี้

**Fix:** ลด top-level เหลือ 3–4 กลุ่ม เพิ่มจำนวนรายการและ urgency badge; ใช้ segmented control หรือ horizontal scroller ที่มี affordance ชัดบนมือถือ

**Suggested command:** `$impeccable distill`

### [P1] แท็บไม่เป็น semantic และไม่จำ state

**Why it matters:** screen reader ไม่ทราบ selected state, keyboard interaction ไม่เป็นมาตรฐาน และ refresh/back กลับไปแท็บรอชำระเสมอ

**Fix:** ใช้ button/ARIA tabs พร้อม arrow-key, focus-visible และ query/hash state หรือใช้ server links สำหรับ filtered views

**Suggested command:** `$impeccable audit`

### [P1] Countdown การชำระเงินเร่งด่วนแต่ action ค้างหลังหมดเวลา

**Why it matters:** ผู้ใช้อาจพยายามชำระรายการที่หมดอายุแล้ว และไม่เข้าใจว่าระบบยกเลิกเมื่อใด

**Fix:** ทำ deadline component ที่เทียบ server expiry, อัปเดตทุกวินาที, แจ้งเฉพาะ threshold สำคัญ และแทนปุ่มชำระด้วยสถานะหมดอายุพร้อมทางเริ่มใหม่

**Suggested command:** `$impeccable harden`

### [P2] การ์ดและ empty state ขาดข้อมูลที่ช่วยตัดสินใจ

**Why it matters:** มองเร็ว ๆ ไม่เห็นราคา ร้าน ระยะเช่า เลขพัสดุ วันคืนเร่งด่วน เหตุผลยกเลิก หรือสิ่งที่ควรทำต่อ

**Fix:** เพิ่ม concise summary + next action ตามสถานะ, alt ที่มีความหมาย และ empty-state CTA เช่น “เลือกดูชุดเช่า”

**Suggested command:** `$impeccable clarify`

## Persona Red Flags

**Jordan (ผู้เช่าครั้งแรก):** เจอศัพท์วงจรงาน 8 แบบพร้อมกัน แต่ไม่มีคำอธิบายว่าใครต้องทำอะไรต่อ “รอยืนยัน/รอจัดส่ง/กำลังจัดส่ง” ไม่บอกเวลาคาดหมาย และหน้าปัญหาไม่มีเหตุผล

**Sam (ผู้ใช้ screen reader/keyboard):** pseudo-tabs ไม่มี `role`, `aria-selected`, `aria-controls` หรือ arrow-key; รูปสินค้า `alt=""`; document ใช้ `lang="en"` ทั้งที่เนื้อหาไทย และ focus state ไม่ชัด

**Casey (ผู้ใช้มือถือที่รีบ):** แท็บท้าย ๆ อาจล้นจอ รูปขยายเต็มความกว้างทำให้ต้อง scroll มาก action อยู่ท้ายการ์ด และกลับเข้าหน้าใหม่แล้วเสีย tab context

## Minor Observations

- Global nav ทำให้ “สินค้าทั้งหมด” active บนหน้าเช่าของฉัน
- `<title>` ของหน้าร่วมยังเป็น “Home - Lendly”
- CSS เขียน `.rental-info h3` แต่ markup ใช้ `<h4>`
- สถานะรอชำระเงินไม่มี class `.status` จึงไม่สอดคล้องกับสถานะอื่น
- order card ยกตัวเมื่อ hover ทั้งที่ทั้งการ์ดกดไม่ได้ ทำให้ affordance หลอก
- empty states มีเพียงข้อความ ไม่มีคำอธิบายหรือ CTA

## Questions to Consider

- ถ้าหน้าเปิดด้วย “สิ่งที่คุณต้องทำวันนี้” แทน lifecycle ภายในระบบ ผู้ใช้จะตัดสินใจเร็วขึ้นแค่ไหน?
- “ยกเลิก” และ “มีปัญหา” ควรอยู่กลุ่มเดียวกันจริงหรือไม่?
- timeline เดียวต่อ order จะอธิบายหกสถานะระหว่างทางได้ชัดกว่าแท็บแยกหรือไม่?
