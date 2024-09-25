import moment from 'moment';
class TimeHandler {
  public static dateHandler(date: any) {
    return moment(date).format('D-MMM-YY');
  }
  public static timeHandler(date: any) {
    return moment(date).format('HH:mm');
  }
  public static dateTimeHandler(date: any, seconds: boolean = false) {
    if (seconds == true) {
      return moment(date, 'YYYY-MM-DDTHH:mm:ssZ').format('D-MMM-YY HH:mm:ss');
    }
    return moment(date, 'YYYY-MM-DDTHH:mm:ssZ').format('D-MMM-YY HH:mm');
  }
}

export default TimeHandler;
