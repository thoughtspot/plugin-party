import { format, addMinutes, startOfDay } from 'date-fns';

export const generateTimeIntervalForDay = () => {
  const times = [];
  const startTime = startOfDay(new Date());
  const endTime = addMinutes(startTime, 1440);
  let currentTime = startTime;

  while (currentTime < endTime) {
    const formattedTime = format(currentTime, 'HH:mm');
    times.push({ title: formattedTime });
    currentTime = addMinutes(currentTime, 60);
  }

  return times;
};

export const getDaysOfWeek = () => {
  return [
    { id: '1', label: 'M' },
    { id: '2', label: 'T' },
    { id: '3', label: 'W' },
    { id: '4', label: 'Th' },
    { id: '5', label: 'F' },
    { id: '6', label: 'Sa' },
    { id: '0', label: 'S' },
  ];
};

export const getFrequency = (t) => {
  return [
    { title: t.FREQUENCY_DAILY },
    { title: t.FREQUENCY_WEEKLY },
    { title: t.FREQUENCY_MONTHLY },
  ];
};

export const setScheduleMessage = (t, scheduleData) => {
  let message = '';
  let daysOfWeekMessage = '';

  const getOrdinal = (num) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return (
      num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
    );
  };

  const formatSpecificDates = (specificDate) => {
    const dates = specificDate
      ?.split(',')
      ?.map((date) => getOrdinal(parseInt(date.trim(), 10)));
    if (dates.length > 1) {
      return `${dates.slice(0, -1).join(', ')} and ${dates[dates.length - 1]}`;
    }
    if (dates.length === 1) {
      return dates[0];
    }
    return '';
  };

  const dayNames = [
    'Sundays',
    'Mondays',
    'Tuesdays',
    'Wednesdays',
    'Thursdays',
    'Fridays',
    'Saturdays',
  ];

  if (scheduleData.daysOfWeek.length > 1) {
    scheduleData.daysOfWeek.sort((a, b) => a - b);
    daysOfWeekMessage = `${scheduleData.daysOfWeek
      .slice(0, -1)
      .map((day) => dayNames[day])
      .join(', ')} ${t.SCHEDULE_SET_AND} ${
      dayNames[scheduleData.daysOfWeek[scheduleData.daysOfWeek.length - 1]]
    }`;
  } else if (scheduleData.daysOfWeek.length === 1) {
    daysOfWeekMessage = dayNames[scheduleData.daysOfWeek[0]];
  }

  if (scheduleData.frequency === t.FREQUENCY_DAILY) {
    message = `${t.SCHEDULE_SET_DAILY_AT} ${scheduleData.time}`;
  } else if (scheduleData.frequency === t.FREQUENCY_WEEKLY) {
    message = `${daysOfWeekMessage} ${t.SCHEDULE_SET_AT} ${scheduleData.time}`;
  } else if (scheduleData.frequency === t.FREQUENCY_MONTHLY) {
    if (scheduleData.monthlyOption === t.FREQUENCY_MONTHLY_ON_THE) {
      message = `${t.SCHEDULE_SET_MONTHLY_ON} ${scheduleData.monthlyFrequency} ${scheduleData.dayOfWeek} ${t.SCHEDULE_SET_AT} ${scheduleData.time}`;
    } else {
      const formattedDates = formatSpecificDates(scheduleData.specificDate);
      message = `${t.SCHEDULE_SET_MONTHLY_ON_THE} ${formattedDates} ${t.SCHEDULE_SET_AT} ${scheduleData.time}`;
    }
  }
  return message;
};

export const getMonthlyFrequencyList = (t) => {
  return [
    { title: t.FREQUENCY_MONTHLY_FIRST },
    { title: t.FREQUENCY_MONTHLY_SECOND },
    { title: t.FREQUENCY_MONTHLY_THIRD },
    { title: t.FREQUENCY_MONTHLY_FOURTH },
    { title: t.FREQUENCY_MONTHLY_LAST },
  ];
};

export const getDaysOfWeekList = (t) => {
  return [
    { title: t.FREQUENCY_DOW_MONDAY },
    { title: t.FREQUENCY_DOW_TUESDAY },
    { title: t.FREQUENCY_DOW_WEDNESDAY },
    { title: t.FREQUENCY_DOW_THURSDAY },
    { title: t.FREQUENCY_DOW_FRIDAY },
    { title: t.FREQUENCY_DOW_SATURDAY },
    { title: t.FREQUENCY_DOW_SUNDAY },
  ];
};

export const timeZones = [
  {
    title: 'Etc/GMT+12',
  },
  {
    title: 'Etc/GMT+11',
  },
  {
    title: 'Pacific/Apia',
  },
  {
    title: 'Pacific/Midway',
  },
  {
    title: 'Pacific/Niue',
  },
  {
    title: 'Pacific/Pago_Pago',
  },
  {
    title: 'America/Adak',
  },
  {
    title: 'Etc/GMT+10',
  },
  {
    title: 'HST',
  },
  {
    title: 'Pacific/Fakaofo',
  },
  {
    title: 'Pacific/Honolulu',
  },
  {
    title: 'Pacific/Johnston',
  },
  {
    title: 'Pacific/Rarotonga',
  },
  {
    title: 'Pacific/Tahiti',
  },
  {
    title: 'Pacific/Marquesas',
  },
  {
    title: 'America/Anchorage',
  },
  {
    title: 'America/Juneau',
  },
  {
    title: 'America/Nome',
  },
  {
    title: 'America/Yakutat',
  },
  {
    title: 'Etc/GMT+9',
  },
  {
    title: 'Pacific/Gambier',
  },
  {
    title: 'America/Dawson',
  },
  {
    title: 'America/Los_Angeles',
  },
  {
    title: 'America/Santa_Isabel',
  },
  {
    title: 'America/Tijuana',
  },
  {
    title: 'America/Vancouver',
  },
  {
    title: 'America/Whitehorse',
  },
  {
    title: 'Etc/GMT+8',
  },
  {
    title: 'PST8PDT',
  },
  {
    title: 'Pacific/Pitcairn',
  },
  {
    title: 'America/Boise',
  },
  {
    title: 'America/Cambridge_Bay',
  },
  {
    title: 'America/Chihuahua',
  },
  {
    title: 'America/Dawson_Creek',
  },
  {
    title: 'America/Denver',
  },
  {
    title: 'America/Edmonton',
  },
  {
    title: 'America/Hermosillo',
  },
  {
    title: 'America/Inuvik',
  },
  {
    title: 'America/Mazatlan',
  },
  {
    title: 'America/Ojinaga',
  },
  {
    title: 'America/Phoenix',
  },
  {
    title: 'America/Yellowknife',
  },
  {
    title: 'Etc/GMT+7',
  },
  {
    title: 'MST',
  },
  {
    title: 'MST7MDT',
  },
  {
    title: 'America/Bahia_Banderas',
  },
  {
    title: 'America/Belize',
  },
  {
    title: 'America/Cancun',
  },
  {
    title: 'America/Chicago',
  },
  {
    title: 'America/Costa_Rica',
  },
  {
    title: 'America/El_Salvador',
  },
  {
    title: 'America/Guatemala',
  },
  {
    title: 'America/Indiana/Knox',
  },
  {
    title: 'America/Indiana/Tell_City',
  },
  {
    title: 'America/Managua',
  },
  {
    title: 'America/Matamoros',
  },
  {
    title: 'America/Menominee',
  },
  {
    title: 'America/Merida',
  },
  {
    title: 'America/Mexico_City',
  },
  {
    title: 'America/Monterrey',
  },
  {
    title: 'America/North_Dakota/Center',
  },
  {
    title: 'America/North_Dakota/New_Salem',
  },
  {
    title: 'America/Rainy_River',
  },
  {
    title: 'America/Rankin_Inlet',
  },
  {
    title: 'America/Regina',
  },
  {
    title: 'America/Swift_Current',
  },
  {
    title: 'America/Tegucigalpa',
  },
  {
    title: 'America/Winnipeg',
  },
  {
    title: 'CST6CDT',
  },
  {
    title: 'Etc/GMT+6',
  },
  {
    title: 'Pacific/Easter',
  },
  {
    title: 'Pacific/Galapagos',
  },
  {
    title: 'America/Atikokan',
  },
  {
    title: 'America/Bogota',
  },
  {
    title: 'America/Cayman',
  },
  {
    title: 'America/Detroit',
  },
  {
    title: 'America/Grand_Turk',
  },
  {
    title: 'America/Guayaquil',
  },
  {
    title: 'America/Havana',
  },
  {
    title: 'America/Indiana/Indianapolis',
  },
  {
    title: 'America/Indiana/Marengo',
  },
  {
    title: 'America/Indiana/Petersburg',
  },
  {
    title: 'America/Indiana/Vevay',
  },
  {
    title: 'America/Indiana/Vincennes',
  },
  {
    title: 'America/Indiana/Winamac',
  },
  {
    title: 'America/Iqaluit',
  },
  {
    title: 'America/Jamaica',
  },
  {
    title: 'America/Kentucky/Louisville',
  },
  {
    title: 'America/Kentucky/Monticello',
  },
  {
    title: 'America/Lima',
  },
  {
    title: 'America/Montreal',
  },
  {
    title: 'America/Nassau',
  },
  {
    title: 'America/New_York',
  },
  {
    title: 'America/Nipigon',
  },
  {
    title: 'America/Panama',
  },
  {
    title: 'America/Pangnirtung',
  },
  {
    title: 'America/Port-au-Prince',
  },
  {
    title: 'America/Resolute',
  },
  {
    title: 'America/Thunder_Bay',
  },
  {
    title: 'America/Toronto',
  },
  {
    title: 'EST',
  },
  {
    title: 'EST5EDT',
  },
  {
    title: 'Etc/GMT+5',
  },
  {
    title: 'America/Caracas',
  },
  {
    title: 'America/Anguilla',
  },
  {
    title: 'America/Antigua',
  },
  {
    title: 'America/Argentina/San_Luis',
  },
  {
    title: 'America/Aruba',
  },
  {
    title: 'America/Asuncion',
  },
  {
    title: 'America/Barbados',
  },
  {
    title: 'America/Blanc-Sablon',
  },
  {
    title: 'America/Boa_Vista',
  },
  {
    title: 'America/Campo_Grande',
  },
  {
    title: 'America/Cuiaba',
  },
  {
    title: 'America/Curacao',
  },
  {
    title: 'America/Dominica',
  },
  {
    title: 'America/Eirunepe',
  },
  {
    title: 'America/Glace_Bay',
  },
  {
    title: 'America/Goose_Bay',
  },
  {
    title: 'America/Grenada',
  },
  {
    title: 'America/Guadeloupe',
  },
  {
    title: 'America/Guyana',
  },
  {
    title: 'America/Halifax',
  },
  {
    title: 'America/La_Paz',
  },
  {
    title: 'America/Manaus',
  },
  {
    title: 'America/Martinique',
  },
  {
    title: 'America/Moncton',
  },
  {
    title: 'America/Montserrat',
  },
  {
    title: 'America/Port_of_Spain',
  },
  {
    title: 'America/Porto_Velho',
  },
  {
    title: 'America/Puerto_Rico',
  },
  {
    title: 'America/Rio_Branco',
  },
  {
    title: 'America/Santiago',
  },
  {
    title: 'America/Santo_Domingo',
  },
  {
    title: 'America/St_Kitts',
  },
  {
    title: 'America/St_Lucia',
  },
  {
    title: 'America/St_Thomas',
  },
  {
    title: 'America/St_Vincent',
  },
  {
    title: 'America/Thule',
  },
  {
    title: 'America/Tortola',
  },
  {
    title: 'Antarctica/Palmer',
  },
  {
    title: 'Atlantic/Bermuda',
  },
  {
    title: 'Atlantic/Stanley',
  },
  {
    title: 'Etc/GMT+4',
  },
  {
    title: 'America/St_Johns',
  },
  {
    title: 'America/Araguaina',
  },
  {
    title: 'America/Argentina/Buenos_Aires',
  },
  {
    title: 'America/Argentina/Catamarca',
  },
  {
    title: 'America/Argentina/Cordoba',
  },
  {
    title: 'America/Argentina/Jujuy',
  },
  {
    title: 'America/Argentina/La_Rioja',
  },
  {
    title: 'America/Argentina/Mendoza',
  },
  {
    title: 'America/Argentina/Rio_Gallegos',
  },
  {
    title: 'America/Argentina/Salta',
  },
  {
    title: 'America/Argentina/San_Juan',
  },
  {
    title: 'America/Argentina/Tucuman',
  },
  {
    title: 'America/Argentina/Ushuaia',
  },
  {
    title: 'America/Bahia',
  },
  {
    title: 'America/Belem',
  },
  {
    title: 'America/Cayenne',
  },
  {
    title: 'America/Fortaleza',
  },
  {
    title: 'America/Godthab',
  },
  {
    title: 'America/Maceio',
  },
  {
    title: 'America/Miquelon',
  },
  {
    title: 'America/Montevideo',
  },
  {
    title: 'America/Paramaribo',
  },
  {
    title: 'America/Recife',
  },
  {
    title: 'America/Santarem',
  },
  {
    title: 'America/Sao_Paulo',
  },
  {
    title: 'Antarctica/Rothera',
  },
  {
    title: 'Etc/GMT+3',
  },
  {
    title: 'America/Noronha',
  },
  {
    title: 'Atlantic/South_Georgia',
  },
  {
    title: 'Etc/GMT+2',
  },
  {
    title: 'America/Scoresbysund',
  },
  {
    title: 'Atlantic/Azores',
  },
  {
    title: 'Atlantic/Cape_Verde',
  },
  {
    title: 'Etc/GMT+1',
  },
  {
    title: 'Africa/Abidjan',
  },
  {
    title: 'Africa/Accra',
  },
  {
    title: 'Africa/Bamako',
  },
  {
    title: 'Africa/Banjul',
  },
  {
    title: 'Africa/Bissau',
  },
  {
    title: 'Africa/Casablanca',
  },
  {
    title: 'Africa/Conakry',
  },
  {
    title: 'Africa/Dakar',
  },
  {
    title: 'Africa/El_Aaiun',
  },
  {
    title: 'Africa/Freetown',
  },
  {
    title: 'Africa/Lome',
  },
  {
    title: 'Africa/Monrovia',
  },
  {
    title: 'Africa/Nouakchott',
  },
  {
    title: 'Africa/Ouagadougou',
  },
  {
    title: 'Africa/Sao_Tome',
  },
  {
    title: 'America/Danmarkshavn',
  },
  {
    title: 'Atlantic/Canary',
  },
  {
    title: 'Atlantic/Faroe',
  },
  {
    title: 'Atlantic/Madeira',
  },
  {
    title: 'Atlantic/Reykjavik',
  },
  {
    title: 'Atlantic/St_Helena',
  },
  {
    title: 'Etc/GMT',
  },
  {
    title: 'Etc/UCT',
  },
  {
    title: 'Etc/UTC',
  },
  {
    title: 'Europe/Dublin',
  },
  {
    title: 'Europe/Lisbon',
  },
  {
    title: 'Europe/London',
  },
  {
    title: 'UTC',
  },
  {
    title: 'WET',
  },
  {
    title: 'Africa/Algiers',
  },
  {
    title: 'Africa/Bangui',
  },
  {
    title: 'Africa/Brazzaville',
  },
  {
    title: 'Africa/Ceuta',
  },
  {
    title: 'Africa/Douala',
  },
  {
    title: 'Africa/Kinshasa',
  },
  {
    title: 'Africa/Lagos',
  },
  {
    title: 'Africa/Libreville',
  },
  {
    title: 'Africa/Luanda',
  },
  {
    title: 'Africa/Malabo',
  },
  {
    title: 'Africa/Ndjamena',
  },
  {
    title: 'Africa/Niamey',
  },
  {
    title: 'Africa/Porto-Novo',
  },
  {
    title: 'Africa/Tunis',
  },
  {
    title: 'Africa/Windhoek',
  },
  {
    title: 'CET',
  },
  {
    title: 'Etc/GMT-1',
  },
  {
    title: 'Europe/Amsterdam',
  },
  {
    title: 'Europe/Andorra',
  },
  {
    title: 'Europe/Belgrade',
  },
  {
    title: 'Europe/Berlin',
  },
  {
    title: 'Europe/Brussels',
  },
  {
    title: 'Europe/Budapest',
  },
  {
    title: 'Europe/Copenhagen',
  },
  {
    title: 'Europe/Gibraltar',
  },
  {
    title: 'Europe/Luxembourg',
  },
  {
    title: 'Europe/Madrid',
  },
  {
    title: 'Europe/Malta',
  },
  {
    title: 'Europe/Monaco',
  },
  {
    title: 'Europe/Oslo',
  },
  {
    title: 'Europe/Paris',
  },
  {
    title: 'Europe/Prague',
  },
  {
    title: 'Europe/Rome',
  },
  {
    title: 'Europe/Stockholm',
  },
  {
    title: 'Europe/Tirane',
  },
  {
    title: 'Europe/Vaduz',
  },
  {
    title: 'Europe/Vienna',
  },
  {
    title: 'Europe/Warsaw',
  },
  {
    title: 'Europe/Zurich',
  },
  {
    title: 'MET',
  },
  {
    title: 'Africa/Blantyre',
  },
  {
    title: 'Africa/Bujumbura',
  },
  {
    title: 'Africa/Cairo',
  },
  {
    title: 'Africa/Gaborone',
  },
  {
    title: 'Africa/Harare',
  },
  {
    title: 'Africa/Johannesburg',
  },
  {
    title: 'Africa/Kigali',
  },
  {
    title: 'Africa/Lubumbashi',
  },
  {
    title: 'Africa/Lusaka',
  },
  {
    title: 'Africa/Maputo',
  },
  {
    title: 'Africa/Maseru',
  },
  {
    title: 'Africa/Mbabane',
  },
  {
    title: 'Africa/Tripoli',
  },
  {
    title: 'Asia/Amman',
  },
  {
    title: 'Asia/Beirut',
  },
  {
    title: 'Asia/Damascus',
  },
  {
    title: 'Asia/Gaza',
  },
  {
    title: 'Asia/Jerusalem',
  },
  {
    title: 'Asia/Nicosia',
  },
  {
    title: 'EET',
  },
  {
    title: 'Etc/GMT-2',
  },
  {
    title: 'Europe/Athens',
  },
  {
    title: 'Europe/Bucharest',
  },
  {
    title: 'Europe/Chisinau',
  },
  {
    title: 'Europe/Helsinki',
  },
  {
    title: 'Europe/Istanbul',
  },
  {
    title: 'Europe/Kaliningrad',
  },
  {
    title: 'Europe/Kiev',
  },
  {
    title: 'Europe/Minsk',
  },
  {
    title: 'Europe/Riga',
  },
  {
    title: 'Europe/Simferopol',
  },
  {
    title: 'Europe/Sofia',
  },
  {
    title: 'Europe/Tallinn',
  },
  {
    title: 'Europe/Uzhgorod',
  },
  {
    title: 'Europe/Vilnius',
  },
  {
    title: 'Europe/Zaporozhye',
  },
  {
    title: 'Africa/Addis_Ababa',
  },
  {
    title: 'Africa/Asmara',
  },
  {
    title: 'Africa/Dar_es_Salaam',
  },
  {
    title: 'Africa/Djibouti',
  },
  {
    title: 'Africa/Kampala',
  },
  {
    title: 'Africa/Khartoum',
  },
  {
    title: 'Africa/Mogadishu',
  },
  {
    title: 'Africa/Nairobi',
  },
  {
    title: 'Antarctica/Syowa',
  },
  {
    title: 'Asia/Aden',
  },
  {
    title: 'Asia/Baghdad',
  },
  {
    title: 'Asia/Bahrain',
  },
  {
    title: 'Asia/Kuwait',
  },
  {
    title: 'Asia/Qatar',
  },
  {
    title: 'Asia/Riyadh',
  },
  {
    title: 'Etc/GMT-3',
  },
  {
    title: 'Europe/Moscow',
  },
  {
    title: 'Europe/Samara',
  },
  {
    title: 'Europe/Volgograd',
  },
  {
    title: 'Indian/Antananarivo',
  },
  {
    title: 'Indian/Comoro',
  },
  {
    title: 'Indian/Mayotte',
  },
  {
    title: 'Asia/Tehran',
  },
  {
    title: 'Asia/Baku',
  },
  {
    title: 'Asia/Dubai',
  },
  {
    title: 'Asia/Muscat',
  },
  {
    title: 'Asia/Tbilisi',
  },
  {
    title: 'Asia/Yerevan',
  },
  {
    title: 'Etc/GMT-4',
  },
  {
    title: 'Indian/Mahe',
  },
  {
    title: 'Indian/Mauritius',
  },
  {
    title: 'Indian/Reunion',
  },
  {
    title: 'Asia/Kabul',
  },
  {
    title: 'Antarctica/Mawson',
  },
  {
    title: 'Asia/Aqtau',
  },
  {
    title: 'Asia/Aqtobe',
  },
  {
    title: 'Asia/Ashgabat',
  },
  {
    title: 'Asia/Dushanbe',
  },
  {
    title: 'Asia/Karachi',
  },
  {
    title: 'Asia/Oral',
  },
  {
    title: 'Asia/Samarkand',
  },
  {
    title: 'Asia/Tashkent',
  },
  {
    title: 'Asia/Yekaterinburg',
  },
  {
    title: 'Etc/GMT-5',
  },
  {
    title: 'Indian/Kerguelen',
  },
  {
    title: 'Indian/Maldives',
  },
  {
    title: 'Asia/Colombo',
  },
  {
    title: 'Asia/Kolkata',
  },
  {
    title: 'Asia/Kathmandu',
  },
  {
    title: 'Antarctica/Vostok',
  },
  {
    title: 'Asia/Almaty',
  },
  {
    title: 'Asia/Bishkek',
  },
  {
    title: 'Asia/Dhaka',
  },
  {
    title: 'Asia/Novokuznetsk',
  },
  {
    title: 'Asia/Novosibirsk',
  },
  {
    title: 'Asia/Omsk',
  },
  {
    title: 'Asia/Qyzylorda',
  },
  {
    title: 'Asia/Thimphu',
  },
  {
    title: 'Etc/GMT-6',
  },
  {
    title: 'Indian/Chagos',
  },
  {
    title: 'Asia/Rangoon',
  },
  {
    title: 'Indian/Cocos',
  },
  {
    title: 'Antarctica/Davis',
  },
  {
    title: 'Asia/Bangkok',
  },
  {
    title: 'Asia/Ho_Chi_Minh',
  },
  {
    title: 'Asia/Hovd',
  },
  {
    title: 'Asia/Jakarta',
  },
  {
    title: 'Asia/Krasnoyarsk',
  },
  {
    title: 'Asia/Phnom_Penh',
  },
  {
    title: 'Asia/Pontianak',
  },
  {
    title: 'Asia/Vientiane',
  },
  {
    title: 'Etc/GMT-7',
  },
  {
    title: 'Indian/Christmas',
  },
  {
    title: 'Antarctica/Casey',
  },
  {
    title: 'Asia/Brunei',
  },
  {
    title: 'Asia/Choibalsan',
  },
  {
    title: 'Asia/Chongqing',
  },
  {
    title: 'Asia/Harbin',
  },
  {
    title: 'Asia/Hong_Kong',
  },
  {
    title: 'Asia/Irkutsk',
  },
  {
    title: 'Asia/Kashgar',
  },
  {
    title: 'Asia/Kuala_Lumpur',
  },
  {
    title: 'Asia/Kuching',
  },
  {
    title: 'Asia/Macau',
  },
  {
    title: 'Asia/Makassar',
  },
  {
    title: 'Asia/Manila',
  },
  {
    title: 'Asia/Shanghai',
  },
  {
    title: 'Asia/Singapore',
  },
  {
    title: 'Asia/Taipei',
  },
  {
    title: 'Asia/Ulaanbaatar',
  },
  {
    title: 'Asia/Urumqi',
  },
  {
    title: 'Australia/Perth',
  },
  {
    title: 'Etc/GMT-8',
  },
  {
    title: 'Australia/Eucla',
  },
  {
    title: 'Asia/Dili',
  },
  {
    title: 'Asia/Jayapura',
  },
  {
    title: 'Asia/Pyongyang',
  },
  {
    title: 'Asia/Seoul',
  },
  {
    title: 'Asia/Tokyo',
  },
  {
    title: 'Asia/Yakutsk',
  },
  {
    title: 'Etc/GMT-9',
  },
  {
    title: 'Pacific/Palau',
  },
  {
    title: 'Australia/Adelaide',
  },
  {
    title: 'Australia/Broken_Hill',
  },
  {
    title: 'Australia/Darwin',
  },
  {
    title: 'Antarctica/DumontDUrville',
  },
  {
    title: 'Asia/Sakhalin',
  },
  {
    title: 'Asia/Vladivostok',
  },
  {
    title: 'Australia/Brisbane',
  },
  {
    title: 'Australia/Currie',
  },
  {
    title: 'Australia/Hobart',
  },
  {
    title: 'Australia/Lindeman',
  },
  {
    title: 'Australia/Melbourne',
  },
  {
    title: 'Australia/Sydney',
  },
  {
    title: 'Etc/GMT-10',
  },
  {
    title: 'Pacific/Chuuk',
  },
  {
    title: 'Pacific/Guam',
  },
  {
    title: 'Pacific/Port_Moresby',
  },
  {
    title: 'Pacific/Saipan',
  },
  {
    title: 'Australia/Lord_Howe',
  },
  {
    title: 'Antarctica/Macquarie',
  },
  {
    title: 'Asia/Anadyr',
  },
  {
    title: 'Asia/Kamchatka',
  },
  {
    title: 'Asia/Magadan',
  },
  {
    title: 'Etc/GMT-11',
  },
  {
    title: 'Pacific/Efate',
  },
  {
    title: 'Pacific/Guadalcanal',
  },
  {
    title: 'Pacific/Kosrae',
  },
  {
    title: 'Pacific/Noumea',
  },
  {
    title: 'Pacific/Pohnpei',
  },
  {
    title: 'Pacific/Norfolk',
  },
  {
    title: 'Antarctica/McMurdo',
  },
  {
    title: 'Etc/GMT-12',
  },
  {
    title: 'Pacific/Auckland',
  },
  {
    title: 'Pacific/Fiji',
  },
  {
    title: 'Pacific/Funafuti',
  },
  {
    title: 'Pacific/Kwajalein',
  },
  {
    title: 'Pacific/Majuro',
  },
  {
    title: 'Pacific/Nauru',
  },
  {
    title: 'Pacific/Tarawa',
  },
  {
    title: 'Pacific/Wake',
  },
  {
    title: 'Pacific/Wallis',
  },
  {
    title: 'Pacific/Chatham',
  },
  {
    title: 'Etc/GMT-13',
  },
  {
    title: 'Pacific/Enderbury',
  },
  {
    title: 'Pacific/Tongatapu',
  },
  {
    title: 'Etc/GMT-14',
  },
  {
    title: 'Pacific/Kiritimati',
  },
];
