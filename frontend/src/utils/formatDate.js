const formatDate = date => {
  let month = (date.getMonth() + 1).toString();
  if (month.length === 1) {
    month = '0' + month;
  }
  let string = month + '/';
  let day = date.getDate().toString();
  if (day.length === 1) {
    day = '0' + day;
  }
  string += day + '/';
  string += date.getFullYear() + ' ';
  let hours = date.getHours().toString();
  if (hours.length === 1) {
    hours = '0' + hours;
  }
  string += hours + ':';
  let minutes = date.getMinutes().toString();
  if (minutes.length === 1) {
    minutes = '0' + minutes;
  }
  string += minutes;
  return string;
}

export default formatDate;
