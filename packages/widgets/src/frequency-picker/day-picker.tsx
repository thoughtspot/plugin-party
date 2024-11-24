import { getDaysOfWeek } from '../utils/frequency-picker.util';
import { Horizontal, View } from '../layout/flex-layout';
import { Colors, Typography } from '../typography';
import styles from './day-picker.module.scss';

export interface DayPickerProps {
  /**
   * Stateful set of IDs of days
   */
  selectedDayIds: Set<string>;

  /**
   * Setter function of set of days
   */
  setSelectedDayIds: any;
}

export const DayPicker: React.FC<DayPickerProps> = ({
  selectedDayIds,
  setSelectedDayIds,
}) => {
  const handleDayClick = (dayId: string) => {
    const newDayIds = new Set(selectedDayIds);
    if (newDayIds.has(dayId)) {
      newDayIds.delete(dayId);
    } else {
      newDayIds.add(dayId);
    }
    setSelectedDayIds(newDayIds);
  };
  return (
    <Horizontal spacing="a">
      {getDaysOfWeek().map((day) => (
        <View
          data-testid={day.id}
          key={day.id}
          hAlignContent="center"
          vAlignContent="center"
          tabIndex={0}
          role="checkbox"
          aria-checked={selectedDayIds.has(day.id)}
          className={
            selectedDayIds.has(day.id)
              ? styles.dayIsSelected
              : styles.dayIsNotSelected
          }
          onClick={() => handleDayClick(day.id)}
        >
          <Typography
            variant="p"
            color={
              selectedDayIds.has(day.id) ? Colors.accent : Colors.grayLight
            }
            noMargin
          >
            {day.label}
          </Typography>
        </View>
      ))}
    </Horizontal>
  );
};