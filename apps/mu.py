#!/usr/bin/env python3
'''
manage_users

Module for user managment
---------------------
Модуль для управления пользователями
'''
from cgi import FieldStorage
from jinja2 import Environment, PackageLoader
import json
# import logging
# from logging import handlers

from lib import util
from lib.YandexMail import ActionException
from lib import decorators
from config.settings import settings


# Set up api
# for i in settings.DOMAINS:
#     api = {i['name']: YandexMail.UserApi(i['token'], logging)
api = settings.api

def main(environ, start_response):
    mycgi = util.cook_cgi(FieldStorage(environ=environ))
    
    if 'do_what' not in mycgi:
        mycgi['do_what'] = 'list'
    do_what = mycgi['do_what']
    functions = {
                 'list': {'exec': make_head},
                 'list_users_ajax': {'exec': list_users_ajax},
                 'refresh_users_list': {'exec': refresh_users_list},
                 'get_user_info': {'exec': get_user_info},
                 'save_user_info': {'exec': save_user_info}
                 }
    if do_what not in functions:
        return ['<br><br><br><div align="center"><p>Произошло страшное</p></div>'.encode('utf-8')]
    return functions[do_what]['exec'](mycgi, environ)


def make_head(mycgi, environ):
    params = {'server_start_time': environ['server_start_time'], 'domains': sorted([i for i in api])}
    env = Environment(loader=PackageLoader('apps', 'templates'))
    template = env.get_template('mu.html')
    result = template.render(params)
    return [result.encode('utf-8')]


@decorators.dumpencode
def list_users_ajax(mycgi, environ):
    startRec = mycgi.get('startRec')
    delta = mycgi.get('delta')
    # firstChars = mycgi.get()
    print(startRec, delta)
    try:
        # users = api.getUsersList(page=startRec/delta+1, perpage=delta)
        users = api.get_users_list(page=startRec, perpage=delta)
    except Exception as err:
        return {'success': 0, 'debug': err, 'msg': 'Произошла ошибка получения списка email-адресов домена'}

    return {'items': users, 'success': 1}


@decorators.dumpencode
def refresh_users_list(mycgi, environ):
    # domain = mycgi['domain']
    users = {}
    for i in api:
        users[i] = []
        users[i] += api[i].getUsersList(page=0, perpage=100)
        users[i] += api[i].getUsersList(page=100, perpage=100)
        users[i] = sorted(users[i], key=lambda x: x['name'])
        print('users from ', i, users[i])
    return {'items': users, 'success': 1}


@decorators.dumpencode
def get_user_info(mycgi, environ):
    res = api[mycgi['domain']].getUserInfo(mycgi['login'])
    print(res)
    print(type(res))
    res['signed_eula'] = 1 if res['signed_eula'] == '1' else None
    res['sex_male'] = 1 if res['sex']=='1' else None
    res['sex_female'] = 1 if res['sex']=='2' else None
    return {'items': res, 'success': 1}


@decorators.dumpencode
def save_user_info(mycgi, environ):
    '''
    Сохраняет информацию о пользователе. Перед сохранением проверяет, есть ли такой пользователь в домене.
    Если нет, что считает, что производится добавление нового пользователя. Сначала заводит пользователя
    с предоставленными логином и паролем, а потом заполняет остальную информацию, если она передана.
    '''
    def save_user_details(param):
        """
        Маленькая функция для сохранения неосновной информации о пользователе
        """
        if any([param[i] for i in param.keys() if i!='login']):
            try:
                api[mycgi['domain']].editUserDetails(**param)
            except ActionException as err:
                return {'success': 0, 'err': str(err), 'msg': 'При сохранении информации о пользователе произошла ошибка'}
            else:
                return {'success': 1}

    param = json.loads(mycgi['param'])
    for i in param:
        if not param[i]:
            param[i] = None

    if not api[mycgi['domain']].checkUser(param['login']):
        if not param['password']:
            return {'success': 0, 'err': '', 'msg': 'Пароль для нового пользователя не может быть пустым'}
        try:
            api[mycgi['domain']].createUser(param['login'], param['password'])
        except ActionException as err:
            return {'success': 0, 'err': str(err), 'msg': 'При создании пользователя произошла ошибка'}
        else:
            return save_user_details(param)
    else:
        return save_user_details(param)
            






















