'''
manage_users

Module for user managment
---------------------
Модуль для управления пользователями
'''
from cgi import FieldStorage
import json

from lib import util
from lib.YandexMail import ActionException
from lib.decorators import tryex, dumpencode
from config import settings

api = settings.API

def main(environ, start_response):
    '''
    Перенаправляет запросы по "do_what"
    '''
    mycgi = util.cook_cgi(FieldStorage(environ=environ))
    
    if 'do_what' not in mycgi:
        mycgi['do_what'] = 'list'
    do_what = mycgi['do_what']
    functions = {
                 'list': {'exec': make_head},
                 # 'list_users_ajax': {'exec': list_users_ajax},
                 'refresh_users_list': {'exec': refresh_users_list},
                 'get_user_info': {'exec': get_user_info},
                 'get_forwards_list': {'exec': get_forwards_list},
                 'get_recieves_list': {'exec': get_recieves_list},
                 'add_forward': {'exec': add_forward},
                 'edit_forward': {'exec': edit_forward},
                 'remove_forwards': {'exec': remove_forwards},
                 'save_user_info': {'exec': save_user_info},
                 'delete_user': {'exec': delete_user}
                 }
    if do_what not in functions:
        return ['<br><br><br><div align="center"><p>Произошло страшное</p></div>'.encode('utf-8')]
    return functions[do_what]['exec'](mycgi, environ)


def make_head(mycgi, environ):
    '''
    Возвращает начальную страницу приложения
    '''
    return [open('apps/templates/main.html', mode='r', encoding='utf-8').read().encode('utf-8')]


# @dumpencode
# def list_users_ajax(mycgi, environ):
#     startRec = mycgi.get('startRec')
#     delta = mycgi.get('delta')
#     # firstChars = mycgi.get()
#     print(startRec, delta)
#     try:
#         # users = api.getUsersList(page=startRec/delta+1, perpage=delta)
#         users = api.get_users_list(page=startRec, perpage=delta)
#     except Exception as err:
#         return {'success': 0, 'debug': err, 'msg': 'Произошла ошибка получения списка email-адресов домена'}

#     return {'items': users, 'success': 1}

@dumpencode
@tryex()
def delete_user(mycgi, environ):
    '''
    Удаляет пользователя.
    '''
    api[mycgi['domain']].deleteUser(mycgi['login'])
    return {'success': 1}


def edit_forward(mycgi, environ):
    '''
    Изменяет параметр "оставить копию себе при пересылке"
    путём удаления и создания пераедресации заново.
    '''
    tmp1 = remove_forwards({'forwards_to_remove': json.dumps([{'from': mycgi['from'], 'id': mycgi['id']}]),
                           'domain': mycgi['domain']}, environ)
    if json.loads(tmp1[0].decode('utf-8'))['success']:
        return add_forward({'from': mycgi['from'],
                            'to': mycgi['to'],
                            'copy': mycgi['checked'],
                            'domain': mycgi['domain']}, environ)
    else:
        return tmp1


@dumpencode
@tryex()
def refresh_users_list(mycgi, environ):
    '''
    Получает список всех пользователей каждого домена
    '''
    users = {}
    for i in api:
        users[i] = []
        number_of_users = int(api[i].getUsersNumber())
        page=0
        while number_of_users > 0:
            users[i] += api[i].getUsersList(page=page, perpage=100)
            number_of_users -= 100
            page += 100
        users[i] = sorted(users[i], key=lambda x: x['name'])
    return {'items': users, 'success': 1}


@dumpencode
@tryex()
def get_user_info(mycgi, environ):
    '''
    Получает информацию о пользователе
    '''
    res = api[mycgi['domain']].getUserInfo(mycgi['login'])
    res['signed_eula'] = 1 if res['signed_eula'] == '1' else None
    res['sex_male'] = 1 if res['sex']=='1' else None
    res['sex_female'] = 1 if res['sex']=='2' else None
    return {'items': res, 'success': 1}


@dumpencode
@tryex()
def get_recieves_list(mycgi, environ):
    '''
    Получает список переадресаций от пользователей из списка "groups" к пользователю "login"
    '''
    res = []
    for i in json.loads(mycgi['groups']):
        tmp = api[mycgi['domain']].getForwarding(i)
        for j in tmp:
            if '{}@{}'.format(mycgi['login'], mycgi['domain']) == j['filter_param']:
                j['filter_param'] = i
                res.append(j)
    return {'items': res, 'success': 1}


@dumpencode
@tryex()
def get_forwards_list(mycgi, environ):
    '''
    Получает список переадресаций по логину пользователя
    '''
    res = api[mycgi['domain']].getForwarding(mycgi['login'])
    for i in res:
        i['from'] = mycgi['login']
        i['copy'] = 1 if i['copy'] == 'yes' else 0
    return {'items': res, 'success': 1}


@dumpencode
@tryex()
def add_forward(mycgi, environ):
    '''
    Добавляет переадресацию от "from" к "to" по-умолчанию без сохранения копии
    '''
    api[mycgi['domain']].setForwarding(mycgi['from'], mycgi['to'], mycgi.get('copy', "no"))
    return {'success': 1}


@dumpencode
def remove_forwards(mycgi, environ):
    '''
    Удаляет переданные в виде списка словарей записи о переадрессации
    '''
    err = []
    for i in json.loads(mycgi['forwards_to_remove']):
        try:
            api[mycgi['domain']].stopForwarding(i['from'], i['id'])
        except ActionException as error:
            err.append(str(error))
        if err:
            return {'success': 0, 'err': str(err), 'msg': 'При удалении переадресаций произошла(и) ошибка(и)'}
    return {'success': 1}


@dumpencode
def save_user_info(mycgi, environ):
    '''
    Сохраняет информацию о пользователе. Перед сохранением проверяет, есть ли такой пользователь в домене.
    Если нет, что считает, что производится добавление нового пользователя. Сначала заводит пользователя
    с предоставленными логином и паролем, а потом заполняет остальную информацию, если она передана.
    '''
    @tryex('При сохранении информации о пользователе произошла ошибка')
    def save_user_details(param):
        """
        Маленькая функция для сохранения неосновной информации о пользователе
        """
        if any([param[i] for i in param.keys() if i!='login']):
            api[mycgi['domain']].editUserDetails(**param)
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





















