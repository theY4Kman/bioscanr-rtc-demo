var BIOSCANR = {
  latestEndpoint: '{{ config['LATEST_VITALS_URL']|escapejs }}',

  apiKey: '{{ config['ACISION_API_KEY']|escapejs }}',

  patientUsername: '{{ config['PATIENT_USERNAME']|escapejs }}',
  patientUsername: '{{ config['PATIENT_USERNAME']|escapejs }}',
  patientName: '{{ config['PATIENT_NAME']|escapejs }}',

  doctorUsername: '{{ config['DOCTOR_USERNAME']|escapejs }}',
{% if current_user.is_authenticated() %}
  doctorPassword: '{{ config['DOCTOR_PASSWORD']|escapejs }}',
{% endif %}
  doctorName: '{{ config['DOCTOR_NAME']|escapejs }}'
};
