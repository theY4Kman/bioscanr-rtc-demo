var _JON = {
  apiKey: '49G0A50SiY4z',

  patientUsername: 'jonadair_gmail_com_0',
  patientPassword: 'cFi9mjgy3',

  doctorUsername: 'jonadair_gmail_com_1',
  doctorPassword: 'WliEy2Kv7'
};

var _ZACH = {
  apiKey: 'JMQZwn9v685J',

  patientUsername: 'they4kman_gmail_com_0',
  patientPassword: 'Y@f3t6TkG',

  doctorUsername: 'they4kman_gmail_com_1',
  doctorPassword: '@0NqGYy5t'
};

var _DEFAULTS = {
  patientUsername: '',
  patientPassword: '',

  doctorUsername: '',
  doctorPassword: '',
  doctorName: 'Doctor Friendly'
};

var BIOSCANR = _.extend(_.clone(_DEFAULTS), _ZACH, {
  // Throw any settings overrides here
});
