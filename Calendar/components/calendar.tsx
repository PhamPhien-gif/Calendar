import moment from 'moment';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { formatLunarDate, getAllFestivals, hasAnyFestival, solarToLunar } from '../utils/lunar-calendar';

const { width: screenWidth } = Dimensions.get('window');

interface CalendarProps {
  initialDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({ initialDate = new Date() }) => {
  const [currentDate, setCurrentDate] = useState(moment(initialDate));
  const [isAnimating, setIsAnimating] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'month' ? 'year' : 'month');
  };

  const selectMonth = (monthIndex: number) => {
    setCurrentDate(prev => prev.clone().month(monthIndex));
    setViewMode('month');
    setSelectedDate(null); // Clear selected date when changing month
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => prev.clone().subtract(1, 'month'));
    setSelectedDate(null); // Clear selected date when changing month
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => prev.clone().add(1, 'month'));
    setSelectedDate(null); // Clear selected date when changing month
  };

  const goToPreviousYear = () => {
    setCurrentDate(prev => prev.clone().subtract(1, 'year'));
  };

  const goToNextYear = () => {
    setCurrentDate(prev => prev.clone().add(1, 'year'));
  };

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
    },
    onPanResponderRelease: (evt, gestureState) => {
      const threshold = screenWidth * 0.15;
      
      if (gestureState.dx > threshold && Math.abs(gestureState.dy) < 150) {
        if (viewMode === 'month') {
          goToPreviousMonth();
        } else {
          goToPreviousYear();
        }
      } else if (gestureState.dx < -threshold && Math.abs(gestureState.dy) < 150) {
        if (viewMode === 'month') {
          goToNextMonth();
        } else {
          goToNextYear();
        }
      }
    },
  });

  const generateCalendarDays = (date: moment.Moment) => {
    const startOfMonth = date.clone().startOf('month');
    const endOfMonth = date.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('isoWeek');
    const endOfWeek = endOfMonth.clone().endOf('isoWeek');

    const days = [];
    const current = startOfWeek.clone();

    while (current.isSameOrBefore(endOfWeek)) {
      const isCurrentMonth = current.month() === date.month();
      const solarDay = current.date();
      const solarMonth = current.month() + 1;
      const solarYear = current.year();
      
      const lunarDate = solarToLunar(solarYear, solarMonth, solarDay);
      const hasFestival = hasAnyFestival(solarYear, solarMonth, solarDay);
      
      days.push({
        date: current.clone(),
        solarDay,
        solarMonth,
        solarYear,
        lunarDay: formatLunarDate(lunarDate),
        lunarDate,
        isCurrentMonth,
        isToday: current.isSame(moment(), 'day'),
        hasFestival,
      });
      
      current.add(1, 'day');
    }

    return days;
  };

  const generateMiniCalendarDays = (year: number, month: number) => {
    const date = moment().year(year).month(month);
    const startOfMonth = date.clone().startOf('month');
    const endOfMonth = date.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('isoWeek');
    const endOfWeek = endOfMonth.clone().endOf('isoWeek');

    const days = [];
    const current = startOfWeek.clone();

    while (current.isSameOrBefore(endOfWeek)) {
      const isCurrentMonth = current.month() === month;
      const solarDay = current.date();
      
      days.push({
        date: current.clone(),
        solarDay,
        isCurrentMonth,
        isToday: current.isSame(moment(), 'day'),
      });
      
      current.add(1, 'day');
    }

    return days;
  };

  const handleDayPress = (dayInfo: any) => {
    if (dayInfo.isCurrentMonth) {
      // Nếu là ngày trong tháng hiện tại, chỉ chọn ngày
      setSelectedDate(dayInfo.date);
    } else {
      // Nếu là ngày của tháng khác, chuyển sang tháng đó và chọn ngày
      setCurrentDate(dayInfo.date.clone().startOf('month'));
      setSelectedDate(dayInfo.date);
    }
  };

  const renderDay = (dayInfo: any, index: number) => {
    const isSelected = selectedDate && selectedDate.isSame(dayInfo.date, 'day');
    
    return (
      <TouchableOpacity 
        key={index} 
        style={[
          styles.dayContainer,
          dayInfo.isToday && styles.todayContainer,
          !dayInfo.isCurrentMonth && styles.otherMonthContainer,
          isSelected && styles.selectedContainer,
        ]}
        onPress={() => handleDayPress(dayInfo)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.solarDay,
          dayInfo.isToday && styles.todayText,
          !dayInfo.isCurrentMonth && styles.otherMonthText,
          isSelected && styles.selectedText,
        ]}>
          {dayInfo.solarDay}
        </Text>
        <Text style={[
          styles.lunarDay,
          dayInfo.isToday && styles.todayLunarText,
          !dayInfo.isCurrentMonth && styles.otherMonthLunarText,
          isSelected && styles.selectedLunarText,
        ]}>
          {dayInfo.lunarDay}
        </Text>
        {dayInfo.hasFestival && (
          <View style={styles.festivalIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const renderMiniDay = (dayInfo: any, index: number) => {
    return (
      <View key={index} style={[
        styles.miniDayContainer,
        dayInfo.isToday && styles.miniTodayContainer,
        !dayInfo.isCurrentMonth && styles.miniOtherMonthContainer
      ]}>
        <Text style={[
          styles.miniSolarDay,
          dayInfo.isToday && styles.miniTodayText,
          !dayInfo.isCurrentMonth && styles.miniOtherMonthText
        ]}>
          {dayInfo.solarDay}
        </Text>
      </View>
    );
  };

  const renderMonthGrid = (monthIndex: number) => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    
    const miniDays = generateMiniCalendarDays(currentDate.year(), monthIndex);
    
    return (
      <TouchableOpacity 
        key={monthIndex} 
        style={styles.monthContainer}
        onPress={() => selectMonth(monthIndex)}
      >
        <Text style={styles.monthTitle}>{monthNames[monthIndex]}</Text>
        <View style={styles.miniCalendarGrid}>
          {miniDays.map((dayInfo, index) => renderMiniDay(dayInfo, index))}
        </View>
      </TouchableOpacity>
    );
  };

  const calendarDays = generateCalendarDays(currentDate);

  if (viewMode === 'year') {
    return (
      <View style={styles.container} {...panResponder.panHandlers}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goToPreviousYear} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleViewMode}>
            <Text style={styles.monthYear}>
              Năm {currentDate.format('YYYY')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToNextYear} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.swipeInstruction}>Vuốt trái/phải để chuyển năm • Chạm vào tháng để xem chi tiết</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.yearGrid}>
            {Array.from({ length: 12 }, (_, index) => renderMonthGrid(index))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={toggleViewMode}>
          <Text style={styles.monthYear}>
            Tháng {currentDate.format('MM/YYYY')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.swipeInstruction}>Vuốt trái/phải để chuyển tháng • Chạm tiêu đề để xem cả năm • Chạm ngày mờ để chuyển tháng</Text>

      <View style={styles.weekHeader}>
        {daysOfWeek.map((day, index) => (
          <View key={index} style={styles.weekDayContainer}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((dayInfo, index) => renderDay(dayInfo, index))}
      </View>

      {/* Selected Date Information */}
      {selectedDate && (
        <View style={styles.selectedDateInfo}>
          <Text style={styles.selectedDateTitle}>
            {selectedDate.format('dddd, DD/MM/YYYY')}
          </Text>
          <Text style={styles.selectedDateLunar}>
            Âm lịch: {formatLunarDate(solarToLunar(selectedDate.year(), selectedDate.month() + 1, selectedDate.date()))}
          </Text>
          {getAllFestivals(selectedDate.year(), selectedDate.month() + 1, selectedDate.date()).map((festival, index) => (
            <Text key={index} style={styles.festivalText}>
              🎉 {festival.name} ({festival.type === 'solar' ? 'Dương lịch' : 'Âm lịch'})
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: '#f8f8f8',
    minWidth: 35,
    alignItems: 'center',
    opacity: 0.7,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  swipeInstruction: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  monthYear: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  weekHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10,
  },
  dayContainer: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
    padding: 4,
  },
  todayContainer: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  otherMonthContainer: {
    opacity: 0.4,
  },
  solarDay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  lunarDay: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 1,
  },
  todayText: {
    color: '#fff',
  },
  todayLunarText: {
    color: '#fff',
    opacity: 0.8,
  },
  otherMonthText: {
    color: '#ccc',
  },
  otherMonthLunarText: {
    color: '#ddd',
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  monthContainer: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  miniCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  miniDayContainer: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1,
  },
  miniTodayContainer: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  miniOtherMonthContainer: {
    opacity: 0.3,
  },
  miniSolarDay: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  miniTodayText: {
    color: '#fff',
  },
  miniOtherMonthText: {
    color: '#ccc',
  },
  // Selected date styles
  selectedContainer: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  selectedText: {
    color: '#fff',
  },
  selectedLunarText: {
    color: '#fff',
    opacity: 0.8,
  },
  // Festival indicator
  festivalIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
  },
  // Selected date information
  selectedDateInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedDateLunar: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  festivalText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 4,
    fontWeight: '500',
  },
});

export default Calendar;