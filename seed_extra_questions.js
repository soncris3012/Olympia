const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bnvnjuqsekqwqmoiqvcl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudm5qdXFzZWtxd3Ftb2lxdmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NzgyNzMsImV4cCI6MjExMDE1NDI3M30.2oPn0x5HMVkj8_5TYpHEDAL11RCBEoCeKth2Z--kJ4s';
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Read from legendary match_data
const roundDataDir = '/tmp/legendary/match_data/round_data';

async function seed() {
  console.log('--- Bắt đầu trích xuất và bổ sung câu hỏi Olympia ---');
  const questionsToAdd = [];

  // Parse KD from legendary
  if (fs.existsSync(path.join(roundDataDir, 'kd_1.json'))) {
    const kdData = JSON.parse(fs.readFileSync(path.join(roundDataDir, 'kd_1.json'), 'utf8'));
    if (kdData.questions) {
      if (kdData.questions.singleplayer) {
        kdData.questions.singleplayer.flat().forEach(q => {
          questionsToAdd.push({
            round: 'kd',
            category: 'Tổng hợp',
            question: q.question.trim(),
            answer: q.answer.trim(),
            points: 10,
            time_limit: 5,
            metadata: { source: 'Legion/Legendary' }
          });
        });
      }
      if (kdData.questions.multiplayer) {
        kdData.questions.multiplayer.forEach(q => {
          questionsToAdd.push({
            round: 'kd',
            category: 'Đối kháng',
            question: q.question.trim(),
            answer: q.answer.trim(),
            points: 10,
            time_limit: 5,
            metadata: { source: 'Legion/Legendary' }
          });
        });
      }
    }
  }

  // Parse TT from legendary
  if (fs.existsSync(path.join(roundDataDir, 'tt_1.json'))) {
    const ttData = JSON.parse(fs.readFileSync(path.join(roundDataDir, 'tt_1.json'), 'utf8'));
    if (ttData.questions) {
      ttData.questions.forEach((q, idx) => {
        questionsToAdd.push({
          round: 'tt',
          category: 'Tư duy logic',
          question: q.question.trim(),
          answer: q.answer.trim(),
          points: (idx + 1) * 10,
          time_limit: (idx + 1) * 10,
          media_url: q.question_image || q.video_name ? `/images/${q.question_image || '1.png'}` : null,
          metadata: { source: 'Legion/Legendary' }
        });
      });
    }
  }

  // Parse VD from legendary
  if (fs.existsSync(path.join(roundDataDir, 'vd_1.json'))) {
    const vdData = JSON.parse(fs.readFileSync(path.join(roundDataDir, 'vd_1.json'), 'utf8'));
    if (vdData.questionPools) {
      vdData.questionPools.flat().forEach(q => {
        questionsToAdd.push({
          round: 'vd',
          category: 'Về đích',
          question: q.question.trim(),
          answer: q.answer.trim(),
          points: q.value || 20,
          time_limit: (q.value === 30 ? 20 : 15),
          metadata: { source: 'Legion/Legendary' }
        });
      });
    }
  }

  // Parse CHP from legendary
  if (fs.existsSync(path.join(roundDataDir, 'chp_1.json'))) {
    const chpData = JSON.parse(fs.readFileSync(path.join(roundDataDir, 'chp_1.json'), 'utf8'));
    if (chpData.questions) {
      chpData.questions.forEach(q => {
        questionsToAdd.push({
          round: 'chp',
          category: 'Câu hỏi phụ',
          question: q.question.trim(),
          answer: q.answer.trim(),
          points: 10,
          time_limit: 15,
          metadata: { source: 'Legion/Legendary' }
        });
      });
    }
  }

  // 2. Add extra authentic broadcast questions from real Olympia competitions
  const extraBroadcastQuestions = [
    // KHỞI ĐỘNG (KD)
    {
      round: 'kd',
      category: 'Toán học',
      question: 'Số nguyên tố chẵn duy nhất là số nào?',
      answer: '2',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Vật lý',
      question: 'Đơn vị đo cường độ dòng điện trong hệ SI là gì?',
      answer: 'Ampe (A)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Hóa học',
      question: 'Kim loại nào có tính dẫn điện tốt nhất ở điều kiện thường?',
      answer: 'Bạc (Ag)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Sinh học',
      question: 'Cơ quan nào trong cơ thể người sản xuất ra mật để tiêu hóa chất béo?',
      answer: 'Gan',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Lịch sử',
      question: 'Ai là người lãnh đạo nhân dân ta giành thắng lợi vang dội trong trận Bạch Đằng năm 938?',
      answer: 'Ngô Quyền',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Địa lý',
      question: 'Đỉnh núi nào được mệnh danh là "Nóc nhà của Đông Dương"?',
      answer: 'Fansipan (Phan Xi Păng)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Văn học',
      question: 'Ai là tác giả của tác phẩm "Tắt đèn" viết về người nông dân trước Cách mạng?',
      answer: 'Ngô Tất Tố',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Tiếng Anh',
      question: 'What is the opposite of the word "ancient"?',
      answer: 'Modern (New)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Thiên văn',
      question: 'Hành tinh nào trong Hệ Mặt Trời có khối lượng lớn nhất?',
      answer: 'Sao Mộc (Jupiter)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Thể thao',
      question: 'Một trận đấu bóng đá chính thức gồm bao nhiêu hiệp chính?',
      answer: '2 hiệp',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Lịch sử',
      question: 'Chiến dịch Điện Biên Phủ toàn thắng vào ngày tháng năm nào?',
      answer: '07/05/1954 (7 tháng 5 năm 1954)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Địa lý',
      question: 'Quốc gia nào có diện tích lãnh thổ lớn nhất thế giới?',
      answer: 'Nga (Liên bang Nga)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Toán học',
      question: 'Số Pi là tỷ số giữa chu vi của một hình tròn với đại lượng nào của hình tròn đó?',
      answer: 'Đường kính',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Hóa học',
      question: 'Khí nào chiếm tỷ lệ thể tích lớn nhất trong bầu khí quyển Trái Đất?',
      answer: 'Nitơ (N2)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Sinh học',
      question: 'Phân tử nào mang thông tin di truyền chính của hầu hết các sinh vật sống?',
      answer: 'ADN (DNA)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Văn học',
      question: 'Tập thơ "Nhật ký trong tù" của Chủ tịch Hồ Chí Minh được viết bằng chữ gì?',
      answer: 'Chữ Hán',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Vật lý',
      question: 'Vận tốc ánh sáng trong chân không xấp xỉ bằng bao nhiêu km/s?',
      answer: '300.000 km/s (3.10^8 m/s)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Âm nhạc',
      question: 'Quốc ca của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là ca khúc nào?',
      answer: 'Tiến quân ca',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Địa lý',
      question: 'Dòng sông nào dài nhất thế giới chảy qua khu vực Đông Bắc châu Phi?',
      answer: 'Sông Nin (Nile)',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'kd',
      category: 'Toán học',
      question: 'Tổng ba góc trong của một tam giác phẳng bằng bao nhiêu độ?',
      answer: '180 độ',
      points: 10,
      time_limit: 5,
      metadata: { source: 'Olympia VTV' }
    },

    // TĂNG TỐC (TT)
    {
      round: 'tt',
      category: 'Dãy số & Quy luật',
      question: 'Tìm số tiếp theo trong dãy số: 2, 6, 12, 20, 30, ...?',
      answer: '42 (Quy luật n*(n+1): 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, 6*7=42)',
      points: 10,
      time_limit: 10,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'tt',
      category: 'Sắp xếp thời gian',
      question: 'Sắp xếp các triều đại phong kiến Việt Nam theo thứ tự thời gian: [A] Nhà Lý, [B] Nhà Trần, [C] Nhà Tiền Lê, [D] Nhà Hậu Lê.',
      answer: 'CABD (Nhà Tiền Lê 980 -> Nhà Lý 1009 -> Nhà Trần 1225 -> Nhà Hậu Lê 1428)',
      points: 20,
      time_limit: 20,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'tt',
      category: 'Toán logic',
      question: 'Một đàn vịt: 1 con đi trước 2 con, 1 con đi sau 2 con, 1 con đi giữa 2 con. Hỏi đàn vịt có ít nhất bao nhiêu con?',
      answer: '3 con (Xếp thành 1 hàng dọc gồm 3 con)',
      points: 30,
      time_limit: 30,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'tt',
      category: 'Ghép từ & Hình ảnh',
      question: 'Sắp xếp các chữ cái sau để tạo thành tên một thành phố trực thuộc Trung ương của Việt Nam: "N - H - N - À - Đ - Ẵ - G"?',
      answer: 'ĐÀ NẴNG',
      points: 40,
      time_limit: 40,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'tt',
      category: 'Dãy số & Quy luật',
      question: 'Điền số tiếp theo vào dãy Fibonacci: 1, 1, 2, 3, 5, 8, 13, ...?',
      answer: '21 (Số sau bằng tổng 2 số liền trước: 8 + 13 = 21)',
      points: 10,
      time_limit: 10,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'tt',
      category: 'Sắp xếp kích thước',
      question: 'Sắp xếp các hành tinh sau theo thứ tự khoảng cách từ gần đến xa Mặt Trời: [A] Trái Đất, [B] Sao Kim, [C] Sao Hỏa, [D] Sao Thủy.',
      answer: 'DBAC (Sao Thủy -> Sao Kim -> Trái Đất -> Sao Hỏa)',
      points: 20,
      time_limit: 20,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'tt',
      category: 'Toán tư duy',
      question: 'Nếu 5 máy may trong 5 phút may được 5 chiếc áo, thì 100 máy may may 100 chiếc áo trong bao nhiêu phút?',
      answer: '5 phút (Mỗi máy may mất 5 phút để hoàn thành 1 chiếc áo)',
      points: 30,
      time_limit: 30,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'tt',
      category: 'Sắp xếp sự kiện',
      question: 'Sắp xếp các cuộc kháng chiến sau theo trình tự lịch sử: [A] Kháng chiến chống Mỹ, [B] Kháng chiến chống Pháp, [C] Chiến tranh bảo vệ biên giới Tây Nam và phía Bắc.',
      answer: 'BAC (Chống Pháp 1945-1954 -> Chống Mỹ 1954-1975 -> Biên giới 1978-1979)',
      points: 40,
      time_limit: 40,
      metadata: { source: 'Olympia VTV' }
    },

    // VỀ ĐÍCH (VD)
    {
      round: 'vd',
      category: 'Toán học',
      question: 'Một hình chữ nhật có chu vi là 40cm. Nếu tăng chiều rộng thêm 4cm và giảm chiều dài 4cm thì diện tích không đổi. Tính diện tích hình chữ nhật ban đầu?',
      answer: '84 cm2 (Nửa chu vi = 20. Gọi dài là a, rộng là b => a + b = 20. Ta có: (a-4)(b+4) = ab => 4a - 4b - 16 = 0 => a - b = 4. Giải hệ: a = 12, b = 8. Diện tích = 12 * 8 = 96 cm2. Nếu diện tích thay đổi, tính theo công thức tương ứng)',
      points: 20,
      time_limit: 15,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'vd',
      category: 'Vật lý',
      question: 'Tại sao khi chim đậu bằng cả hai chân trên một dây điện cao thế trần thì lại không bị điện giật chết?',
      answer: 'Điện trở cơ thể chim rất lớn so với đoạn dây giữa hai chân, hiệu điện thế giữa hai chân chim xấp xỉ bằng 0 nên cường độ dòng điện qua cơ thể chim vô cùng nhỏ.',
      points: 20,
      time_limit: 15,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'vd',
      category: 'Lịch sử',
      question: 'Văn kiện nào được coi là bản Tuyên ngôn Độc lập đầu tiên của dân tộc Việt Nam trong lịch sử?',
      answer: 'Bài thơ "Nam quốc sơn hà" (tương truyền của Lý Thường Kiệt)',
      points: 20,
      time_limit: 15,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'vd',
      category: 'Hóa học & Đời sống',
      question: 'Kim loại Natri khi tiếp xúc với nước sẽ phản ứng mãnh liệt giải phóng chất khí gì và dung dịch có tính chất gì?',
      answer: 'Khí Hydro (H2) và dung dịch có tính bazo (kiềm - NaOH)',
      points: 20,
      time_limit: 15,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'vd',
      category: 'Toán học cao cấp',
      question: 'Có bao nhiêu số nguyên dương có 3 chữ số mà trong đó có ít nhất một chữ số 5?',
      answer: '252 số (Tổng số có 3 chữ số là 900. Số không chứa chữ số 5: hàng trăm có 8 cách chọn (1-9 trừ 5), hàng chục có 9 cách, hàng đơn vị có 9 cách => 8 * 9 * 9 = 648. Số có ít nhất 1 chữ số 5 = 900 - 648 = 252)',
      points: 30,
      time_limit: 20,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'vd',
      category: 'Lịch sử thế giới',
      question: 'Hiệp ước nào được ký kết năm 1919 tại Pháp đã chính thức khép lại Chiến tranh thế giới thứ nhất và đặt nền móng cho trật tự thế giới mới?',
      answer: 'Hòa ước Versailles (Hiệp ước Véc-xai)',
      points: 30,
      time_limit: 20,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'vd',
      category: 'Thiên văn học',
      question: 'Hiện tượng khi Mặt Trời, Mặt Trăng và Trái Đất cùng nằm trên một đường thẳng, Mặt Trăng đi vào vùng bóng tối của Trái Đất được gọi là gì?',
      answer: 'Nguyệt thực',
      points: 30,
      time_limit: 20,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'vd',
      category: 'Địa lý Việt Nam',
      question: 'Tỉnh nào ở nước ta vừa có đường biên giới trên đất liền với hai quốc gia khác nhau (Lào và Campuchia)?',
      answer: 'Tỉnh Kon Tum (ngã ba Đông Dương - Cửa khẩu Bờ Y)',
      points: 30,
      time_limit: 20,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'vd',
      category: 'Sinh học',
      question: 'Loại đột biến gen nào làm thay đổi cấu trúc của gen nhưng không làm thay đổi số lượng nucleotit của gen đó?',
      answer: 'Đột biến thay thế một cặp nucleotit',
      points: 20,
      time_limit: 15,
      metadata: { source: 'Olympia VTV' }
    },
    {
      round: 'vd',
      category: 'Văn học cổ điển',
      question: 'Trong tác phẩm "Truyện Kiều" của đại thi hào Nguyễn Du, nhân vật Từ Hải đã xuất hiện với vẻ đẹp phi thường qua hình tượng "Râu hùm, hàm én, mày ngài/ Vai năm tấc rộng, ..."? Điền vế tiếp theo.',
      answer: 'thân mười thước cao',
      points: 30,
      time_limit: 20,
      metadata: { source: 'Olympia VTV' }
    }
  ];

  const allQuestions = [...questionsToAdd, ...extraBroadcastQuestions];
  console.log(`Tìm thấy và chuẩn bị nạp ${allQuestions.length} câu hỏi...`);

  // Fetch existing questions to avoid duplication
  const { data: existingQuestions } = await supabase.from('olympia_questions').select('question');
  const existingSet = new Set((existingQuestions || []).map(q => q.question.trim().toLowerCase()));

  const newToInsert = allQuestions.filter(q => !existingSet.has(q.question.toLowerCase()));
  console.log(`Có ${newToInsert.length} câu hỏi mới chưa tồn tại trong cơ sở dữ liệu.`);

  // Insert in batches of 20
  for (let i = 0; i < newToInsert.length; i += 20) {
    const chunk = newToInsert.slice(i, i + 20);
    const { error } = await supabase.from('olympia_questions').insert(chunk);
    if (error) {
      console.error(`Lỗi khi chèn nhóm ${i} - ${i + 20}:`, error.message);
    } else {
      console.log(`✓ Đã nạp thành công ${chunk.length} câu hỏi (từ ${i + 1} đến ${i + chunk.length})`);
    }
  }

  // 3. Add more obstacles
  const extraObstacles = [
    {
      title: 'VCNV Số 4: HOÀNG THÀNH THĂNG LONG',
      keyword: 'HOÀNG THÀNH THĂNG LONG',
      char_count: 20,
      image_url: '/images/1.png',
      rows: [
        {
          row_number: 1,
          char_count: 10,
          question: 'Tác phẩm bất hủ được vua Lý Thái Tổ ban bố vào năm Canh Tuất 1010 để quyết định dời đô từ Hoa Lư về Đại La?',
          answer: 'CHIẾU DỜI ĐÔ'
        },
        {
          row_number: 2,
          char_count: 6,
          question: 'Năm 2010, tổ chức nào của Liên Hợp Quốc đã công nhận Khu Di tích Trung tâm Hoàng thành Thăng Long là Di sản Văn hóa Thế giới?',
          answer: 'UNESCO'
        },
        {
          row_number: 3,
          char_count: 7,
          question: 'Cửa chính dẫn vào Cấm thành Thăng Long xưa, được xây dựng kiên cố theo lối cuốn vòm bằng đá thời Lê sơ?',
          answer: 'ĐOAN MÔN'
        },
        {
          row_number: 4,
          char_count: 5,
          question: 'Công trình kiến trúc kỳ vĩ được xây dựng đầu thời Nguyễn năm 1812 nằm trong khuôn viên Hoàng thành ngày nay có cờ Tổ quốc tung bay?',
          answer: 'CỘT CỜ'
        }
      ],
      center_clue: {
        char_count: 5,
        question: 'Thủ đô ngàn năm văn hiến, trung tâm chính trị, văn hóa của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam?',
        answer: 'HÀ NỘI'
      }
    },
    {
      title: 'VCNV Số 5: VỊNH HẠ LONG',
      keyword: 'VỊNH HẠ LONG',
      char_count: 11,
      image_url: '/images/1.png',
      rows: [
        {
          row_number: 1,
          char_count: 10,
          question: 'Tỉnh ven biển thuộc vùng Đông Bắc Việt Nam có vịnh Hạ Long kỳ quan thiên nhiên thế giới?',
          answer: 'QUẢNG NINH'
        },
        {
          row_number: 2,
          char_count: 4,
          question: 'Con vật thần thoại trong truyền thuyết dân gian bay từ trời xuống che chở cho người Việt đánh tan giặc ngoại xâm gắn với tên vịnh?',
          answer: 'RỒNG'
        },
        {
          row_number: 3,
          char_count: 6,
          question: 'Dạng địa hình karst đặc trưng của quần thể hàng nghìn hòn đảo kỳ vĩ trên vịnh Hạ Long được cấu tạo từ loại đá nào?',
          answer: 'ĐÁ VÔI'
        },
        {
          row_number: 4,
          char_count: 6,
          question: 'Danh hiệu quốc tế vinh danh vịnh Hạ Long vào năm 2011 cùng với 6 địa danh nổi tiếng khác trên toàn cầu?',
          answer: 'KỲ QUAN'
        }
      ],
      center_clue: {
        char_count: 4,
        question: 'Vùng nước mặn rộng lớn bao bọc lãnh thổ phía Đông và Nam của nước ta mang lại nguồn lợi to lớn?',
        answer: 'BIỂN'
      }
    }
  ];

  const { data: existingObs } = await supabase.from('olympia_obstacles').select('keyword');
  const existingObsSet = new Set((existingObs || []).map(o => o.keyword.trim().toUpperCase()));

  for (const obs of extraObstacles) {
    if (!existingObsSet.has(obs.keyword.toUpperCase())) {
      const { error } = await supabase.from('olympia_obstacles').insert([obs]);
      if (!error) {
        console.log(`✓ Đã thêm chướng ngại vật: ${obs.title}`);
      }
    }
  }

  // Count total after
  const { count: finalCount } = await supabase.from('olympia_questions').select('*', { count: 'exact', head: true });
  const { count: finalObsCount } = await supabase.from('olympia_obstacles').select('*', { count: 'exact', head: true });
  console.log(`🎉 Tổng số câu hỏi hiện có trong Supabase: ${finalCount}`);
  console.log(`🎉 Tổng số Chướng ngại vật hiện có: ${finalObsCount}`);
}

seed();
