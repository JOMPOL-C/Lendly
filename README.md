# LENDLY

เว็บสำหรับ **ซื้อขายและเช่าชุดออนไลน์**  

## Features

- สมัครสมาชิกลูกค้า , ลงทะเบียนร้านค้า, ยืนยันตัวตน
- ลืมรหัสผ่าน
- การกรอง ประเภทสินค้า , สัดส่วน , ไซส์
- ตรวจสอบ วัน ที่ชุดพร้อมให้เช่าผ่านปฏิทินในหน้าสินค้าได้
- แจ้งเตือนการคืนสินค้า
- แชทการสนทนาระหว่างลูกค้าและร้านได้
- ร้านค้าแจ้งปัญหาชุดชำรุด พร้อมบอกค่าปรับกับลูกค้าผ่านแชทในเว็บ ในกรณีที่เช่า
- ร้านค้า: ตรวจสอบข้อมูลของร้าน แก้ไข เพิ่ม ลบ สินค้าภายในร้าน ทำโปรโมชั่น และจัดการข้อมูลภายในร้าน
- ส่งคำร้องขอยกเลิกคิวเช่าชุดได้หากเกิดปัญหา
    - (ต้องตกลงทั้งฝ่ายลูกค้าและร้านค้า)
- แจ้งปัญหา/ส่งรายงานคำร้องต่างๆได้
- เขียนรีวิวสินค้า (ไม่มีการให้คะแนน)
- ตรวจสอบเลขพัสดุ
- โหมดดาร์ค
- แชทบอท
- ชำระเงินผ่าน Omise

## Tech Stack  

### Backend
[![Express.js](https://img.shields.io/badge/Express.js-9C9C9C?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Router](https://img.shields.io/badge/Router-000000?style=for-the-badge&logo=node.js&logoColor=white)](https://expressjs.com/en/guide/routing.html)
[![CORS](https://img.shields.io/badge/CORS-000000?style=for-the-badge&logo=node.js&logoColor=white)](https://developer.mozilla.org/docs/Web/HTTP/CORS)
[![express-session](https://img.shields.io/badge/express--session-000000?style=for-the-badge&logo=node.js&logoColor=white)](https://www.npmjs.com/package/express-session)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![java_script](https://img.shields.io/badge/java_script-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

### Database & ORM
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![MySQL2](https://img.shields.io/badge/MySQL2-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.npmjs.com/package/mysql2)

### Authentication & Security
[![bcrypt](https://img.shields.io/badge/bcrypt-336791?style=for-the-badge&logo=lock&logoColor=white)](https://www.npmjs.com/package/bcrypt)
[![bcryptjs](https://img.shields.io/badge/bcryptjs-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://www.npmjs.com/package/bcryptjs)
[![jsonwebtoken](https://img.shields.io/badge/JSONWebToken-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![cookie-parser](https://img.shields.io/badge/cookie--parser-000000?style=for-the-badge&logo=node.js&logoColor=white)](https://www.npmjs.com/package/cookie-parser)

### Utilities & Dev Tools
[![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)](https://www.npmjs.com/package/dotenv)
[![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=black)](https://www.npmjs.com/package/nodemon)
[![Morgan](https://img.shields.io/badge/Morgan-000000?style=for-the-badge&logo=node.js&logoColor=white)](https://www.npmjs.com/package/morgan)
[![Chalk](https://img.shields.io/badge/Chalk-3DDC84?style=for-the-badge&logo=javascript&logoColor=black)](https://www.npmjs.com/package/chalk)
[![Consola](https://img.shields.io/badge/Consola-2E86C1?style=for-the-badge&logo=javascript&logoColor=white)](https://github.com/unjs/consola)
[![MySQL Workbench](https://img.shields.io/badge/MySQL_Workbench-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/products/workbench/)

### Frontend
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)

### Testing & Quality
[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![fast-check](https://img.shields.io/badge/fast--check-000000?style=for-the-badge&logo=testinglibrary&logoColor=white)](https://dubzzz.github.io/fast-check/)

### Deployment
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

### 💳 Payment
[![Omise](https://img.shields.io/badge/Omise-1A6AFF?style=for-the-badge&logo=omise&logoColor=white)](https://www.omise.co/)


## Links

[![facebook Jompol](https://img.shields.io/badge/Jompol_Chuenarrom-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/jompol.chuenrarom.9)  
[![facebook Pimpakarn](https://img.shields.io/badge/Pimpakarn_Wuthiweroj-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/pimpakarn.wuthiweroj.96?locale=th_TH)  
[![github JOMPOL‐C](https://img.shields.io/badge/JOMPOL--C-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/JOMPOL-C)  
[![github Chom‐rose](https://img.shields.io/badge/Chom--rose-ff69b4?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Chom-rose)
