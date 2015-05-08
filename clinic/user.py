from flask import current_app, redirect, url_for
from flask.ext.login import UserMixin, LoginManager


login_manager = LoginManager()


class BaseUser(UserMixin):
    KEY_PREFIX = None

    @property
    def id(self):
        return self.username

    def __getattr__(self, item):
        return current_app.config.get(self.KEY_PREFIX + '_' + item.upper())


class PatientUser(BaseUser):
    KEY_PREFIX = 'PATIENT'


class DoctorUser(BaseUser):
    KEY_PREFIX = 'DOCTOR'


@login_manager.user_loader
def load_doctor(id):
    if id == current_app.config['DOCTOR_USERNAME']:
        return DoctorUser()
    else:
        return PatientUser()


@login_manager.unauthorized_handler
def redirect_to_login():
    return redirect(url_for('doctor_login'))
