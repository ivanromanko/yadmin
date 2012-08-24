#!/usr/bin/env python3

import re

def main(env, start_response):
    '''
    Возвращаем статические файлы
    Только static/*
    Не бинарные
    '''
    file = re.search('^\/([^/]+)\/(.+)?',env['PATH_INFO']).group(2)
    file = "static/{}".format(file)
    ret = ''
    try:
        fh = open(file)
        for s in fh.readlines():
            ret += s
        fh.close() 
    except Exception as e:
        ret = str(e)
        print (e)
    return [ret.encode('utf-8')]
        