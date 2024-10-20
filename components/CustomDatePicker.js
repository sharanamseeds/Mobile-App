import React from 'react';
import { View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DatePicker = ({show, setShow, date, setDate}) => {
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };

  return (
    <View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={'date'}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

export default DatePicker;
