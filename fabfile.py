import functools
import pipes
from contextlib import contextmanager

from fabric.api import env, run, local
from fabric.context_managers import cd, shell_env
from fabric.decorators import task
from fabric.operations import sudo, require
from fabric.utils import error


env.hosts = ['bioscanr.cloudapp.net']
env.use_ssh_config = True
env.repo_path = '/home/bioscanr/bioscanr-rtc-demo'

env.stages = {
    'vitals': {
        'app_path': '/home/bioscanr/bioscanr-rtc-demo/backend',
        'venv_bin': '/home/bioscanr/.virtualenvs/vitals/bin',
        'celery_process': 'vitals',
    },
    'clinic': {
        'app_path': '/home/bioscanr/bioscanr-rtc-demo/clinic',
        'venv_bin': '/home/bioscanr/.virtualenvs/clinic/bin',
        'celery_process': 'clinic',
    },
}


@contextmanager
def venv():
    with shell_env(PATH="{}:$PATH".format(pipes.quote(env.venv_bin))):
        yield


def stage_set(stage_name):
    env.stage = stage_name
    for key, value in env.stages[stage_name].iteritems():
        setattr(env, key, value)


def needs_stage(fn):
    @functools.wraps(fn)
    def _inner(*args, **kwargs):
        require('stage', provided_by=(vitals, clinic))
        return fn(*args, **kwargs)
    return _inner


@task
def vitals():
    stage_set('vitals')


@task
def clinic():
    stage_set('clinic')


@task
@needs_stage
def deploy():
    dirty_check()
    push()
    pull()
    upgrade_pip()
    upgrade_requirements()
    restart()


@task
def dirty_check():
    if local('git status --porcelain', capture=True):
        error('git repo is dirty.')


@task
def push():
    local('git push origin master:master')


@task
def pull():
    with cd(env.repo_path):
        run('git fetch --all --prune')
        run('git checkout origin/master')


@task
def upgrade_pip():
    with venv():
        run('pip install --upgrade pip')


@task
@needs_stage
def upgrade_requirements():
    with venv(), cd(env.app_path):
        run('pip install --upgrade --requirement requirements.txt')


@task
@needs_stage
def restart():
    sudo('supervisorctl restart %s' % env.celery_process)
