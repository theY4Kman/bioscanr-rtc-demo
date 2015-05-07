import pipes
from contextlib import contextmanager

from fabric.api import env, run, local
from fabric.context_managers import cd, shell_env
from fabric.operations import sudo
from fabric.utils import error


env.hosts = ['bioscanr.cloudapp.net']
env.use_ssh_config = True
env.repo_path = '/home/bioscanr/bioscanr-rtc-demo'
env.app_path = '/home/bioscanr/bioscanr-rtc-demo/backend'
env.venv_bin = '/home/bioscanr/.virtualenvs/vitals/bin'


@contextmanager
def venv():
    with shell_env(PATH="{}:$PATH".format(pipes.quote(env.venv_bin))):
        yield


def deploy():
    dirty_check()
    push()
    pull()
    upgrade_pip()
    upgrade_requirements()
    restart()


def dirty_check():
    if local('git status --porcelain', capture=True):
        error('git repo is dirty.')


def push():
    local('git push origin master:master')


def pull():
    with cd(env.repo_path):
        run('git fetch --all --prune')
        run('git checkout origin/master')


def upgrade_pip():
    with venv():
        run('pip install --upgrade pip')


def upgrade_requirements():
    with venv(), cd(env.app_path):
        run('pip install --upgrade --requirement requirements.txt')


def restart():
    sudo('supervisorctl restart vitals')
