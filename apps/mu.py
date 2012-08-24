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
                 'refresh_users_list': {'exec': refresh_users_list}
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





