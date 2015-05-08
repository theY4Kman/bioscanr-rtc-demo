import jinja2
from flask import Flask, render_template, request, url_for, redirect
from flask.ext.login import login_user, login_required

from clinic.user import login_manager, DoctorUser


app = Flask(__name__, '/static')
app.config.from_pyfile('config.py')
app.config.from_pyfile('local_config.py', silent=True)
login_manager.init_app(app)


_js_escapes = {
    '\\': '\\u005C',
    '\'': '\\u0027',
    '"': '\\u0022',
    '>': '\\u003E',
    '<': '\\u003C',
    '&': '\\u0026',
    '=': '\\u003D',
    '-': '\\u002D',
    ';': '\\u003B',
    u'\u2028': '\\u2028',
    u'\u2029': '\\u2029'
}
# Escape every ASCII character with a value less than 32.
_js_escapes.update(('%c' % z, '\\u%04X' % z) for z in xrange(32))


@app.template_filter()
def escapejs(value):
    retval = []
    for letter in value:
        if letter in _js_escapes:
            retval.append(_js_escapes[letter])
        else:
            retval.append(letter)

    return jinja2.Markup("".join(retval))


@app.route('/')
def patient_portal():
    return render_template('clinic/index.html')


@app.route('/global-config/')
def global_config():
    response = app.response_class(render_template('global-config.js'))
    response.headers['Content-Type'] = 'text/javascript'
    return response


@app.route('/doctor/')
@login_required
def doctor_portal():
    return render_template('doctor/index.html')


@app.route('/doctor/login/', methods=['GET', 'POST'])
def doctor_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        correct_login = (username == app.config['DOCTOR_LOGIN_USERNAME'] and
                         password == app.config['DOCTOR_LOGIN_PASSWORD'])
        if correct_login:
            login_user(DoctorUser())
            return redirect(url_for('doctor_portal'))

    return render_template('doctor/login.html')


if __name__ == '__main__':
    app.run('0.0.0.0', 9797, debug=True)