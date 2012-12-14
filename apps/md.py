#!/usr/bin/env python3

'''
manage_domain
Модуль для управления настройками домена
'''
from cgi import FieldStorage
import io

from lib import util
from lib.decorators import tryex, dumpencode
from lib.multipart_sender import MultiPartForm
from config import settings

api = settings.API
apimulti = settings.APIMULTI
apipost = settings.APIPOST

def main(environ, start_response):
    '''
    Перенаправляет запросы по "do_what"
    '''

    fs = FieldStorage(fp=environ['wsgi.input'], environ=environ)
    mycgi = util.cook_cgi(fs)

    if 'do_what' not in mycgi:
        mycgi['do_what'] = 'list'
    do_what = mycgi['do_what']

    functions = {
        'get_domain_admins': {'exec': get_domain_admins},
        'remove_domain_admin': {'exec': remove_domain_admin},
        'add_domain_admin': {'exec': add_domain_admin},
        'set_default_domain_email': {'exec': set_default_domain_email},
        'set_new_domain_logo': {'exec': set_new_domain_logo},
        'delete_domain_logo': {'exec': delete_domain_logo},
        'delete_domain': {'exec': delete_domain}
        
    }
    if do_what not in functions:
        return ['<br><br><br><div align="center"><p>Произошло страшное</p></div>'.encode('utf-8')]
    return functions[do_what]['exec'](mycgi, environ) if do_what!='set_new_domain_logo' else functions[do_what]['exec'](mycgi, environ, fs)


@dumpencode
@tryex()
def get_domain_admins(mycgi, environ):
    tmp = apimulti[mycgi['domain']].get_admins(mycgi['domain'])
    return {'items': tmp, 'success': 1}


@dumpencode
@tryex()
def remove_domain_admin(mycgi, environ):
    apimulti[mycgi['domain']].remove_domain_admin(mycgi['name'], mycgi['domain'])
    return {'success': 1}


@dumpencode
@tryex()
def add_domain_admin(mycgi, environ):
    apimulti[mycgi['domain']].add_domain_admin(mycgi['name'], mycgi['domain'])
    return {'success': 1}


@dumpencode
@tryex()
def set_default_domain_email(mycgi, environ):
    apimulti[mycgi['domain']].set_domain_default_email(mycgi['name'], mycgi['domain'])
    return {'success': 1}


@dumpencode
@tryex()
def set_new_domain_logo(mycgi, environ, fs):
    myfile = fs['logo_file']
    form = MultiPartForm()
    form.add_field('token', apipost[mycgi['domain']]._token)
    form.add_field('domain', mycgi['domain'])
    form.add_file('file', 'logo.jpg', 
                  fileHandle=io.BytesIO(myfile.value))
    form.make_result()
    apipost[mycgi['domain']].set_new_domain_logo(form, mycgi['domain'])
    return {'success': 1}


@dumpencode
@tryex()
def delete_domain_logo(mycgi, environ):
    apimulti[mycgi['domain']].delete_domain_logo(mycgi['domain'])
    return {'success': 1}


@dumpencode
@tryex()
def delete_domain(mycgi, environ):
    users = []
    number_of_users = int(api[mycgi['domain']].getUsersNumber())
    page=0
    while number_of_users > 0:
        users += api[mycgi['domain']].getUsersList(page=page, perpage=100)
        number_of_users -= 100
        page += 100
    for i in users:
        api[mycgi['domain']].deleteUser(i['name'])

    apimulti[mycgi['domain']].delete_domain(mycgi['domain'])
    return {'success': 1}





