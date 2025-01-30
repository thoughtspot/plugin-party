import { useState, useRef, useEffect } from 'preact/hooks';
import { useTranslations } from 'i18n';
import {
  generateTimeIntervalForDay,
  getDaysOfWeekList,
  getFrequency,
  getMonthlyFrequencyList,
  setScheduleMessage,
  timeZones,
} from '../utils/frequency-picker.util';
import { Horizontal, Vertical } from '../layout/flex-layout';
import { Dropdown } from '../dropdown';
import styles from './index.module.scss';
import { DayPicker } from './day-picker';
import { Button } from '../button';
import { Menu } from '../dropdown/menu';
import { Input } from '../input';
import { Typography } from '../typography/typography';
import { Icon } from '../icon';

export const FrequencyPicker = ({
  isScheduleSet,
  setIsScheduleSet,
  onScheduleSubmit,
  onScheduleDelete,
}) => {
  const { t } = useTranslations();
  const [frequency, setFrequency] = useState<string>(t.FREQUENCY_DAILY);
  const [time, setTime] = useState<string>('00:00');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<Set<string>>(
    new Set<string>('1')
  );
  const [monthlyOption, setMonthlyOption] = useState<string>(
    t.FREQUENCY_MONTHLY_ON_THE
  );
  const [monthlyFrequency, setMonthlyFrequency] = useState<string>(
    t.FREQUENCY_MONTHLY_FIRST
  );
  const [dayOfWeek, setDayOfWeek] = useState<string>(t.FREQUENCY_DOW_MONDAY);
  const [specificDate, setSpecificDate] = useState<string>();
  const [timezone, setTimezone] = useState<string>('UTC');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleFrequencyChange = (selectedOption) => {
    setFrequency(selectedOption.title);
  };

  const handleButtonClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleMonthlyOptionChange = (selectedOption) => {
    setMonthlyOption(selectedOption.title);
  };

  const handleTimeChange = (selectedOption) => {
    setTime(selectedOption.title);
  };

  const handleTimezoneChange = (selectedOption) => {
    setIsMenuOpen(false);
    setTimezone(selectedOption.title);
  };

  const handleMonthlyFrequencyChange = (selectedOption) => {
    setMonthlyFrequency(selectedOption.title);
  };

  const handleDayOfWeekChange = (selectedOption) => {
    setDayOfWeek(selectedOption.title);
  };

  const handleScheduleChange = () => {
    const scheduleData = {
      frequency,
      time,
      timezone,
      daysOfWeek: Array.from(selectedDaysOfWeek),
      monthlyOption,
      monthlyFrequency,
      dayOfWeek,
      specificDate,
    };
    onScheduleSubmit(scheduleData);
  };

  const handleScheduleDelete = () => {
    onScheduleDelete();
    setIsScheduleSet(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const renderEditSchedule = () => {
    return (
      <Vertical className={styles.editScheduleContainer} spacing="f">
        <Vertical spacing="c" className={styles.editScheduleWrapper}>
          <Horizontal className={styles.editSchedule}>
            <Vertical className={styles.iconWrapper}>
              <Icon
                name="rd-icon-blue-correct"
                size="s"
                iconClassName={styles.icon}
              ></Icon>
            </Vertical>
            <Vertical className={styles.messageWrapper}>
              <Typography variant="p" className={styles.scheduleSetTitle}>
                {t.SCHEDULE_SET}
              </Typography>
              <Typography variant="p" className={styles.scheduleSetText}>
                {setScheduleMessage(t, {
                  frequency,
                  time,
                  timezone,
                  daysOfWeek: Array.from(selectedDaysOfWeek),
                  monthlyOption,
                  monthlyFrequency,
                  dayOfWeek,
                  specificDate,
                })}
              </Typography>
            </Vertical>
          </Horizontal>
        </Vertical>
        <Vertical spacing="c">
          <Button
            type="SECONDARY"
            text={t.EDIT_SCHEDULE_BUTTON}
            onClick={() => setIsScheduleSet(false)}
          ></Button>
          <Button
            type="SECONDARY"
            text={t.DELETE_SCHEDULE_BUTTON}
            onClick={handleScheduleDelete}
            className={styles.textButton}
          ></Button>
        </Vertical>
      </Vertical>
    );
  };

  return (
    <>
      {isScheduleSet ? (
        renderEditSchedule()
      ) : (
        <Vertical>
          <Typography variant="p" className={styles.subtitle}>
            {t.SLIDES_SCHEDULE_UPDATE_DESCRIPTION}
          </Typography>
          <Vertical spacing="d">
            <Vertical className={styles.timeZoneWrapper} hAlignContent="end">
              <Button
                className={styles.textButton}
                onClick={handleButtonClick}
                text={timezone}
                type="SECONDARY"
              />
              {isMenuOpen && (
                <div ref={menuRef}>
                  <Menu
                    handleOptionSelect={handleTimezoneChange}
                    options={timeZones}
                    isSearchEnabled={true}
                  />
                </div>
              )}
            </Vertical>
            <Horizontal spacing="c" className={styles.frequencyPickerContainer}>
              <Dropdown
                placeholder={frequency}
                options={getFrequency(t)}
                className={styles.dropdown}
                onChange={handleFrequencyChange}
              />
              <Dropdown
                placeholder={time}
                options={generateTimeIntervalForDay()}
                className={styles.dropdown}
                onChange={handleTimeChange}
              />
            </Horizontal>
            {frequency === t.FREQUENCY_WEEKLY && (
              <DayPicker
                selectedDayIds={selectedDaysOfWeek}
                setSelectedDayIds={setSelectedDaysOfWeek}
              />
            )}
            {frequency === t.FREQUENCY_MONTHLY && (
              <Vertical spacing="c">
                <Dropdown
                  placeholder={t.FREQUENCY_MONTHLY_ON_THE}
                  options={[
                    { title: t.FREQUENCY_MONTHLY_ON_THE },
                    { title: t.FREQUENCY_MONTHLY_BY_DATE },
                  ]}
                  onChange={handleMonthlyOptionChange}
                />
                {monthlyOption === t.FREQUENCY_MONTHLY_ON_THE && (
                  <Horizontal className={styles.dropdown} spacing="c">
                    <Dropdown
                      placeholder={t.FREQUENCY_MONTHLY_FIRST}
                      options={getMonthlyFrequencyList(t)}
                      onChange={handleMonthlyFrequencyChange}
                    />
                    <Dropdown
                      placeholder={t.FREQUENCY_DOW_MONDAY}
                      options={getDaysOfWeekList(t)}
                      onChange={handleDayOfWeekChange}
                    />
                  </Horizontal>
                )}
                {monthlyOption === t.FREQUENCY_MONTHLY_BY_DATE && (
                  <Input
                    value={specificDate}
                    onChange={(e) =>
                      setSpecificDate((e.target as HTMLInputElement).value)
                    }
                    placeholder={t.SCHEDULE_DATE_PLACEHOLDER}
                    type="TEXT"
                    className={styles.input}
                  />
                )}
              </Vertical>
            )}
            <Button
              type="SECONDARY"
              text={t.SET_SCHEDULE_BUTTON}
              onClick={handleScheduleChange}
            ></Button>
          </Vertical>
        </Vertical>
      )}
    </>
  );
};
