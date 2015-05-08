var BIOSCANR = {
  apiKey: '{{ config['ACISION_API_KEY']|escapejs }}',

  patientUsername: '{{ config['PATIENT_USERNAME']|escapejs }}',
  patientPassword: '{{ config['PATIENT_PASSWORD']|escapejs }}',

  doctorUsername: '{{ config['DOCTOR_USERNAME']|escapejs }}',
{% if current_user.is_authenticated() %}
  doctorPassword: '{{ config['DOCTOR_PASSWORD']|escapejs }}',
{% endif %}
  doctorName: '{{ config['DOCTOR_NAME']|escapejs }}'
};
