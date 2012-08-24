#!/usr/bin/env python3

'''
Основной модуль
'''

import imp
import sys
import re
import os
import webbrowser
from wsgiref import simple_server
import time

umb_modules = {'mu': {'name': 'mu', 'mtime': ''},
               'md': {'name': 'md', 'mtime': ''},
               'static': {'name': 'static', 'mtime': ''}
               }

server_start_time = time.time()
def app(environ, start_response):
    environ['server_start_time'] = server_start_time
    dw = re.search('^\/([^/]+)?', environ['PATH_INFO']).group(1)
    if dw in umb_modules:
        start_response('200 OK', [('Content-type', 'text/html')]) if dw!='static' else start_response('200 OK', [('Content-type', 'text/css')])
        # start_response('200 OK', [('Content-type', 'text/html')])
        f1, filename1, desc1 = imp.find_module('apps')
        apps_module = imp.load_module('apps', f1, filename1, desc1)
        f2, filename2, desc2 = imp.find_module(dw,apps_module.__path__)
        mtime = os.stat(filename2)[8]
        if mtime != umb_modules[dw]['mtime']:
            umb_modules[dw]['mtime'] = mtime
            module = imp.load_module(umb_modules[dw]['name'], f2, filename2, desc2)
        else:
            module = sys.modules[dw]
        return module.main(environ, start_response) 
    else:
        return ['Не понял задачи:-(<br>Проверьте адрес:{0}'.format(environ['PATH_INFO']).encode('utf-8')]


application = app
if __name__ == '__main__':
    server = simple_server.WSGIServer(('', 7070), simple_server.WSGIRequestHandler,)
    server.set_app(app)
    webbrowser.open('http://localhost:7070/mu')
    server.serve_forever()
    