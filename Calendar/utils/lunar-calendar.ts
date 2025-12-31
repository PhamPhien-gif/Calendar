// @ts-ignore
import * as chineseLunar from 'chinese-lunar-calendar';

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
  dayName?: string;
  monthName?: string;
}

export function solarToLunar(solarYear: number, solarMonth: number, solarDay: number): LunarDate {
  try {
    const lunar = chineseLunar.getLunar(solarYear, solarMonth, solarDay);
    
    return {
      day: lunar.lunarDate,
      month: lunar.lunarMonth,
      year: solarYear, // Use solar year for simplicity
      isLeapMonth: lunar.isLeap || false,
      dayName: lunar.dateStr,
      monthName: lunar.dateStr
    };
  } catch (error) {
    // Fallback to a simple calculation if library fails
    console.warn('Lunar calendar conversion failed:', error);
    return {
      day: solarDay,
      month: solarMonth,
      year: solarYear,
      isLeapMonth: false
    };
  }
}

export function formatLunarDate(lunarDate: LunarDate): string {
  // Always use day/month format
  return `${lunarDate.day}/${lunarDate.month}${lunarDate.isLeapMonth ? ' (nhuận)' : ''}`;
}

// Vietnamese lunar month names
export const lunarMonthNames = [
  '', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu',
  'Bảy', 'Tám', 'Chín', 'Mười', 'Một', 'Chạp'
];

// Convert Chinese lunar day names to Vietnamese
const lunarDayNamesVN: { [key: string]: string } = {
  '初一': 'Mồng 1', '初二': 'Mồng 2', '初三': 'Mồng 3', '初四': 'Mồng 4', '初五': 'Mồng 5',
  '初六': 'Mồng 6', '初七': 'Mồng 7', '初八': 'Mồng 8', '初九': 'Mồng 9', '初十': 'Mồng 10',
  '十一': '11', '十二': '12', '十三': '13', '十四': '14', '十五': '15',
  '十六': '16', '十七': '17', '十八': '18', '十九': '19', '二十': '20',
  '廿一': '21', '廿二': '22', '廿三': '23', '廿四': '24', '廿五': '25',
  '廿六': '26', '廿七': '27', '廿八': '28', '廿九': '29', '三十': '30'
};

export function formatLunarDateVN(lunarDate: LunarDate): string {
  const monthName = lunarMonthNames[lunarDate.month] || lunarDate.month.toString();
  let dayName = lunarDate.day.toString();
  
  if (lunarDate.dayName && lunarDayNamesVN[lunarDate.dayName]) {
    dayName = lunarDayNamesVN[lunarDate.dayName];
  }
  
  return `${dayName} ${monthName}${lunarDate.isLeapMonth ? ' (nhuận)' : ''}`;
}

// Festival and holiday data
export interface Festival {
  name: string;
  type: 'solar' | 'lunar';
  isFixed: boolean;
}

// Solar calendar holidays (fixed dates)
const solarHolidays: { [key: string]: Festival[] } = {
  '1/1': [{ name: 'Tết Dương lịch', type: 'solar', isFixed: true }],
  '14/2': [{ name: 'Lễ tình nhân', type: 'solar', isFixed: true }],
  '8/3': [{ name: 'Quốc tế Phụ nữ', type: 'solar', isFixed: true }],
  '30/4': [{ name: 'Giải phóng miền Nam', type: 'solar', isFixed: true }],
  '1/5': [{ name: 'Quốc tế Lao động', type: 'solar', isFixed: true }],
  '19/5': [{ name: 'Sinh nhật Bác Hồ', type: 'solar', isFixed: true }],
  '1/6': [{ name: 'Quốc tế Thiếu nhi', type: 'solar', isFixed: true }],
  '2/9': [{ name: 'Quốc khánh', type: 'solar', isFixed: true }],
  '20/10': [{ name: 'Ngày Phụ nữ Việt Nam', type: 'solar', isFixed: true }],
  '20/11': [{ name: 'Ngày Nhà giáo Việt Nam', type: 'solar', isFixed: true }],
  '25/12': [{ name: 'Lễ Giáng sinh', type: 'solar', isFixed: true }],
};

// Lunar calendar holidays (fixed dates)
const lunarHolidays: { [key: string]: Festival[] } = {
  '1/1': [{ name: 'Tết Nguyên đán', type: 'lunar', isFixed: true }],
  '2/1': [{ name: 'Mùng 2 Tết', type: 'lunar', isFixed: true }],
  '3/1': [{ name: 'Mùng 3 Tết', type: 'lunar', isFixed: true }],
  '15/1': [{ name: 'Tết Nguyên tiêu', type: 'lunar', isFixed: true }],
  '3/3': [{ name: 'Tết Hàn thực', type: 'lunar', isFixed: true }],
  '10/3': [{ name: 'Giỗ Tổ Hùng Vương', type: 'lunar', isFixed: true }],
  '15/4': [{ name: 'Phật đản', type: 'lunar', isFixed: true }],
  '5/5': [{ name: 'Tết Đoan ngọ', type: 'lunar', isFixed: true }],
  '15/7': [{ name: 'Vu lan', type: 'lunar', isFixed: true }],
  '15/8': [{ name: 'Tết Trung thu', type: 'lunar', isFixed: true }],
  '23/12': [{ name: 'Ông Táo chầu trời', type: 'lunar', isFixed: true }],
};

export function getSolarFestivals(month: number, day: number): Festival[] {
  const key = `${day}/${month}`;
  return solarHolidays[key] || [];
}

export function getLunarFestivals(month: number, day: number): Festival[] {
  const key = `${day}/${month}`;
  return lunarHolidays[key] || [];
}

export function getAllFestivals(solarYear: number, solarMonth: number, solarDay: number): Festival[] {
  const festivals: Festival[] = [];
  
  // Get solar festivals
  const solarFests = getSolarFestivals(solarMonth, solarDay);
  festivals.push(...solarFests);
  
  // Get lunar festivals
  const lunarDate = solarToLunar(solarYear, solarMonth, solarDay);
  const lunarFests = getLunarFestivals(lunarDate.month, lunarDate.day);
  festivals.push(...lunarFests);
  
  return festivals;
}

export function hasAnyFestival(solarYear: number, solarMonth: number, solarDay: number): boolean {
  return getAllFestivals(solarYear, solarMonth, solarDay).length > 0;
}