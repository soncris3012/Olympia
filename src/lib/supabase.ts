import { createClient } from '@supabase/supabase-js';
import { OlympiaQuestion, Obstacle, RoundType, MatchState, Player } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bnvnjuqsekqwqmoiqvcl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudm5qdXFzZWtxd3Ftb2lxdmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NzgyNzMsImV4cCI6MjExMDE1NDI3M30.2oPn0x5HMVkj8_5TYpHEDAL11RCBEoCeKth2Z--kJ4s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fallback question data in case of network issues or local test
export const DEFAULT_QUESTIONS: Record<RoundType, OlympiaQuestion[]> = {
  kd: [
    {
      id: 'kd-1',
      round: 'kd',
      category: 'Văn học',
      question: 'Loài côn trùng nào đã xuất hiện trong bài thơ "Thu ẩm" của Nguyễn Khuyến?',
      answer: 'Đom đóm',
      explanation: 'Trong câu thơ: "Đom đóm bay qua dường muốn hỏi / Sao chàng chưa ngủ hãy còn mơ"',
      points: 10,
      time_limit: 5,
    },
    {
      id: 'kd-2',
      round: 'kd',
      category: 'Lịch sử',
      question: 'Sự ra đời của tổ chức Hiệp ước Warszawa và tổ chức nào đã đánh dấu sự xác lập của cục diện hai cực thế giới?',
      answer: 'NATO',
      explanation: 'Khối quân sự Bắc Đại Tây Dương (NATO) và khối Warszawa.',
      points: 10,
      time_limit: 5,
    },
    {
      id: 'kd-3',
      round: 'kd',
      category: 'Toán học',
      question: 'Số nguyên tố chẵn duy nhất trong tập hợp các số tự nhiên là số nào?',
      answer: '2',
      explanation: '2 là số chẵn duy nhất chỉ chia hết cho 1 và chính nó.',
      points: 10,
      time_limit: 5,
    },
    {
      id: 'kd-4',
      round: 'kd',
      category: 'Vật lý',
      question: 'Đơn vị đo tần số trong hệ đo lường quốc tế (SI) là gì?',
      answer: 'Hertz (Hz)',
      explanation: 'Đặt theo tên của nhà vật lý Đức Heinrich Hertz.',
      points: 10,
      time_limit: 5,
    },
    {
      id: 'kd-5',
      round: 'kd',
      category: 'Hóa học',
      question: 'Khí nào chiếm thể tích lớn nhất (khoảng 78%) trong khí quyển Trái Đất?',
      answer: 'Nitơ (N2)',
      explanation: 'Nitơ chiếm ~78%, Oxy chiếm ~21%.',
      points: 10,
      time_limit: 5,
    },
    {
      id: 'kd-6',
      round: 'kd',
      category: 'Địa lý',
      question: 'Quần đảo Côn Đảo trực thuộc tỉnh nào của Việt Nam?',
      answer: 'Bà Rịa - Vũng Tàu',
      explanation: 'Gồm 16 hòn đảo lớn nhỏ ở phía nam biển Đông.',
      points: 10,
      time_limit: 5,
    },
    {
      id: 'kd-7',
      round: 'kd',
      category: 'Sinh học',
      question: 'Bào quan nào trong tế bào nhân thực được ví như "nhà máy năng lượng" tổng hợp ATP?',
      answer: 'Ty thể',
      explanation: 'Ty thể (Mitochondria) là nơi diễn ra hô hấp hiếu khí tạo năng lượng cho tế bào.',
      points: 10,
      time_limit: 5,
    },
    {
      id: 'kd-8',
      round: 'kd',
      category: 'Thể thao',
      question: 'Đội tuyển bóng đá nữ nào đã giành chức vô địch World Cup Nữ năm 2023?',
      answer: 'Tây Ban Nha',
      explanation: 'Đánh bại đội tuyển Anh 1-0 trong trận chung kết.',
      points: 10,
      time_limit: 5,
    }
  ],
  vcnv: [],
  tt: [
    {
      id: 'tt-1',
      round: 'tt',
      category: 'Lịch sử & Thứ tự',
      question: 'Hãy sắp xếp các triều đại phong kiến Việt Nam sau theo thứ tự xuất hiện từ sớm nhất đến muộn nhất: A. Tiền Lê, B. Ngô, C. Lý, D. Đinh.',
      answer: 'B-D-A-C',
      explanation: 'Nhà Ngô (939) -> Nhà Đinh (968) -> Nhà Tiền Lê (980) -> Nhà Lý (1009).',
      points: 40,
      time_limit: 20,
    },
    {
      id: 'tt-2',
      round: 'tt',
      category: 'Toán học & IQ',
      question: 'Cho phương trình que diêm số La Mã sai: VI - IV = IX. Di chuyển đúng 1 que diêm duy nhất để được phương trình đúng?',
      answer: 'VI + IV = X',
      explanation: 'Đổi dấu trừ (-) thành dấu cộng (+) và di que sang số IX thành X (6 + 4 = 10).',
      points: 40,
      time_limit: 30,
    },
    {
      id: 'tt-3',
      round: 'tt',
      category: 'Quan sát & Chuỗi logic',
      question: 'Trong dãy số sau, số tiếp theo là số nào: 2, 3, 5, 8, 13, 21, ?',
      answer: '34',
      explanation: 'Dãy Fibonacci: 13 + 21 = 34.',
      points: 40,
      time_limit: 20,
    },
    {
      id: 'tt-4',
      round: 'tt',
      category: 'Dữ kiện Nhân vật',
      question: 'Đây là ai? Vị tướng tài ba quê Quảng Bình, Đại tướng đầu tiên của QĐND Việt Nam, Tổng tư lệnh chiến dịch Điện Biên Phủ 1954?',
      answer: 'Đại tướng Võ Nguyên Giáp',
      explanation: 'Đại tướng Võ Nguyên Giáp (1911 - 2013).',
      points: 40,
      time_limit: 30,
    }
  ],
  vd: [
    {
      id: 'vd-1',
      round: 'vd',
      category: 'Toán học',
      question: 'Có tất cả bao nhiêu số thập phân nhỏ hơn 3, có 4 chữ số khác nhau được lập từ các chữ số 1, 2, 3, 4?',
      answer: '12',
      explanation: 'Chữ số phần nguyên có 2 cách chọn (1 hoặc 2). 3 chữ số thập phân có 3! = 6 cách hoán vị. 2 x 6 = 12 số.',
      points: 20,
      time_limit: 15,
      metadata: { package: 20 }
    },
    {
      id: 'vd-2',
      round: 'vd',
      category: 'Lịch sử',
      question: 'Vào khoảng năm 1000 TCN đến cuối thế kỷ II, nền văn hóa khảo cổ thời kỳ đồ sắt nào phát triển rực rỡ ở miền Trung Việt Nam?',
      answer: 'Văn hóa Sa Huỳnh',
      explanation: 'Văn hóa Sa Huỳnh cùng Đông Sơn và Đồng Nai tạo thành tam giác văn hóa thời đại kim khí Việt Nam.',
      points: 20,
      time_limit: 15,
      metadata: { package: 20 }
    },
    {
      id: 'vd-3',
      round: 'vd',
      category: 'Toán học',
      question: 'Cho tam giác vuông có 2 cạnh góc vuông là 6 cm và 8 cm. Hãy tính bán kính đường tròn nội tiếp của tam giác này?',
      answer: '2 cm',
      explanation: 'Cạnh huyền c = 10 cm. Nửa chu vi p = 12 cm. Diện tích S = 24 cm². Bán kính r = S/p = 2 cm.',
      points: 30,
      time_limit: 20,
      metadata: { package: 30 }
    },
    {
      id: 'vd-4',
      round: 'vd',
      category: 'Địa lý & Văn hóa',
      question: 'Tại Việt Nam có 4 công trình được phong danh hiệu "Vương cung Thánh đường". Hãy nêu tên ít nhất 2 trong 4 công trình này?',
      answer: 'Đức Bà, La Vang, Phú Nhai, Kẻ Sở',
      explanation: 'Đức Bà (TP.HCM), La Vang (Quảng Trị), Phú Nhai (Nam Định), Kẻ Sở (Hà Nam).',
      points: 30,
      time_limit: 20,
      metadata: { package: 30 }
    }
  ],
  chp: [
    {
      id: 'chp-1',
      round: 'chp',
      category: 'Địa lý',
      question: 'Đỉnh núi nào được mệnh danh là "Nóc nhà Đông Dương" với độ cao 3.143 mét?',
      answer: 'Fansipan',
      explanation: 'Thuộc dãy Hoàng Liên Sơn, tỉnh Lào Cai.',
      points: 10,
      time_limit: 15
    }
  ]
};

export const DEFAULT_OBSTACLES: Obstacle[] = [
  {
    id: 'obs-1',
    title: 'VCNV: ĐỒ SƠN',
    keyword: 'ĐỒ SƠN',
    char_count: 5,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    rows: [
      { row: 1, char_count: 6, question: 'Tên vị hoàng đế cuối cùng của triều đại phong kiến Việt Nam?', answer: 'BẢO ĐẠI' },
      { row: 2, char_count: 4, question: 'Lễ hội truyền thống độc đáo tổ chức vào mùng 9 tháng 8 âm lịch tại Hải Phòng là lễ hội chọi gì?', answer: 'TRÂU' },
      { row: 3, char_count: 6, question: 'Ngọn hải đăng cổ kính hơn 100 năm tuổi mệnh danh là "Mắt ngọc của Tổ quốc" nằm trên hòn đảo nào?', answer: 'HÒN DẤU' },
      { row: 4, char_count: 4, question: 'Bến tàu K15 tại nơi đây là điểm xuất phát huyền thoại của đoàn tàu không số trên...?', answer: 'BIỂN' },
    ],
    center_clue: {
      question: 'Bán đảo du lịch ven biển nổi tiếng của thành phố Hải Phòng là gì?',
      answer: 'ĐỒ SƠN'
    }
  },
  {
    id: 'obs-2',
    title: 'VCNV: LALIGA',
    keyword: 'LALIGA',
    char_count: 6,
    image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    rows: [
      { row: 1, char_count: 10, question: '"Don Quijote" là tác phẩm kinh điển thuộc nền văn học của quốc gia nào?', answer: 'TÂY BAN NHA' },
      { row: 2, char_count: 7, question: 'Con đường tơ lụa huyền thoại nối liền châu Á với châu lục nào?', answer: 'CHÂU ÂU' },
      { row: 3, char_count: 6, question: 'FIFA là cơ quan quản lý cao nhất của môn thể thao nào?', answer: 'BÓNG ĐÁ' },
      { row: 4, char_count: 10, question: '"Hala Madrid" là bài hát truyền thống của câu lạc bộ bóng đá nào?', answer: 'REAL MADRID' },
    ],
    center_clue: {
      question: 'Giải bóng đá vô địch quốc gia hàng đầu Tây Ban Nha là gì?',
      answer: 'LALIGA'
    }
  },
  {
    id: 'obs-3',
    title: 'VCNV: TRỐNG ĐỒNG',
    keyword: 'TRỐNG ĐỒNG',
    char_count: 9,
    image_url: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800',
    rows: [
      { row: 1, char_count: 7, question: 'Nền văn hóa khảo cổ học thời kỳ đồ đồng nổi tiếng ở miền Bắc Việt Nam mang tên là gì?', answer: 'ĐÔNG SƠN' },
      { row: 2, char_count: 4, question: 'Tên kim loại đóng vai trò chủ đạo trong hợp kim đúc nên các loại vũ khí và đồ tế khí thời kỳ Văn Lang?', answer: 'ĐỒNG' },
      { row: 3, char_count: 7, question: 'Hình tượng loài chim thiêng biểu tượng của người Việt cổ, thường khắc bay ngược chiều kim đồng hồ quanh mặt trống?', answer: 'CHIM LẠC' },
      { row: 4, char_count: 6, question: 'Chiếc trống đồng cổ tiêu biểu được tìm thấy tại Hà Nam, hiện là Bảo vật Quốc gia số 1 của Việt Nam, có tên là gì?', answer: 'NGỌC LŨ' },
    ],
    center_clue: {
      question: 'Nhạc khí gõ tiêu biểu bằng kim loại đồng của nền văn minh sông Hồng, biểu tượng trường tồn của văn hóa Việt Nam?',
      answer: 'TRỐNG ĐỒNG'
    }
  }
];

// Fetch questions from Supabase with fallback
export async function fetchQuestionsFromSupabase(round?: RoundType): Promise<OlympiaQuestion[]> {
  try {
    let query = supabase.from('olympia_questions').select('*');
    if (round) {
      query = query.eq('round', round);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (round) return DEFAULT_QUESTIONS[round] || [];
      return [
        ...DEFAULT_QUESTIONS.kd,
        ...DEFAULT_QUESTIONS.tt,
        ...DEFAULT_QUESTIONS.vd,
        ...DEFAULT_QUESTIONS.chp,
      ];
    }
    return data as OlympiaQuestion[];
  } catch (err) {
    console.error('Error fetching questions from Supabase:', err);
    if (round) return DEFAULT_QUESTIONS[round] || [];
    return [
      ...DEFAULT_QUESTIONS.kd,
      ...DEFAULT_QUESTIONS.tt,
      ...DEFAULT_QUESTIONS.vd,
      ...DEFAULT_QUESTIONS.chp,
    ];
  }
}

// Fetch obstacles from Supabase with fallback
export async function fetchObstaclesFromSupabase(): Promise<Obstacle[]> {
  try {
    const { data, error } = await supabase.from('olympia_obstacles').select('*');
    if (error || !data || data.length === 0) {
      return DEFAULT_OBSTACLES;
    }
    return data as Obstacle[];
  } catch (err) {
    console.error('Error fetching obstacles from Supabase:', err);
    return DEFAULT_OBSTACLES;
  }
}

// Add a new question to Supabase
export async function addQuestionToSupabase(question: Omit<OlympiaQuestion, 'id'>) {
  try {
    const { data, error } = await supabase.from('olympia_questions').insert([question]).select();
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('Error inserting question:', err);
    return { success: false, error: err.message };
  }
}
