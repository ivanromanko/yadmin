#!/usr/bin/env python3
"""
Модуль, содержащий полезные маленькие функции.
"""

#def str2dict(str, sep=' '):
#    """
#    Функция для преобразования строки вида 'name=Petrovich age=75' в словарь.
#    Если разделитель фраз отличен от пробела, его следует передать в функцию.
#    Делает попытку преобразовать строковый параметр в целочисленный.
#    """
#    if not str:
#        return {}
#    tmp = dict([i.split('=') for i in str.split('%s' % sep)])
#    for i in tmp:
#        try:
#            tmp[i] = int(tmp[i])
#        except ValueError:
#            pass
#    return tmp


def str2dict(str, sep=' '):
    """
    Делает то же самое, но в 2 раза быстрее
    """
    if not str:
        return {}
    temp = []
    for i in str.split(sep):
        if i == '':
            pass
        else:
            temp.append(i.split('='))
    result = dict(temp)
    result = digitize(result)
    return result


def digitize(obj, fnames=[]):
    """
    Пытается преобразовать строковые переменные в числовые.
    Если передан fnames, преобразуются только свойства из этого списка.
    """
    if isinstance(obj, dict):
        if fnames:
            run_list = fnames
        else:
            run_list = obj.keys()
        for i in run_list:
            try:
                obj[i] = int(obj.get(i, '') or '')
            except ValueError:
                try:
                    obj[i] = float(obj.get(i, '') or '')
                except ValueError:
                    pass
    return obj        


def dict2str(dict, sep=' ', value_wrapper=''):
    """
    Функция для преобразования словаря в строку вида 'name=Petrovich age=75'.
    По-умолчанию равенства разделены пробелом. Можно передать другой
    разделитель вторым параметром.
    """
    if not dict:
        return ''
    result = ''
    for i in dict:
        result += '%s=%s%s%s%s' % (i, value_wrapper, dict[i], value_wrapper, sep)
    return result[:-1]


def cook_cgi(cgi_input):
    """
    Эта функция преобразует данные в формате FieldStorage в словарь.
    Она не учитывает разные данные с одинаковыми именами.
    This function define if cgi_input is of FieldStorage type and convert FieldStorage into regular dictionary.
    This function does not take into account several parameters with the same name if they exists.
    """
    if cgi_input:
        cgi = {}
        if isinstance(cgi_input, dict):
            return cgi_input
        else:
            # FileldStorage
            for i in cgi_input:
                cgi[i] = cgi_input[i].value
            for i in cgi:
                try:
                    cgi[i] = int(cgi[i])
                except ValueError:
                    pass
            return cgi
    else:
        return {}


def date(date):
    try:
        d, m, y = date.split('.')
    except ValueError:
        try:
            d, m, y = date.split('-')
        except:
            raise ValueError('Не могу разбить дату ни по ".", ни по "-"')
    if len(d) == 4:
        y, m, d = d, m, y
    return((int(y), int(m), int(d)))


class data2sql:
    '''
    Класс для создания SQL запросов
    '''
    def __init__(self, data, debug=0):
        self.inses = []
        self.functions = {'delete': self.__make_delete,
                          'insert': self.__make_insert,
                          'update': self.__make_update}
        self.ifunctions = {'delete': self.__make_delete_item,
                          'insert': self.__make_insert_item,
                          'update': self.__make_update_item}


        _type = data['type']
        _items = data.pop('items')

        self.functions[_type](data, _items)

        if debug:
            print("DATA=", data)
            print("ITEMS=", _items)
            print("\n")
            for ins in self.inses:
                print("\tSQL=", ins)
                print("\n\n")

    def get(self):
        return self.inses

    def __make_delete_item(self, table, data):
        where = []
        for w in data['where'].keys():
            where.append("{}='{}'".format(w, data['where'][w]))    
        self.inses.append("delete from {} where {}".format(table, " and ".join(where)))

    def __make_insert_item(self, table, data):
        ins1 = "insert into {} (".format(table)
        ins2 = ") values ('"
        ins1_array = []
        ins2_array = []

        #ins1_array.append('doc_id')
        #ins2_array.append('#new_id#')

        for k in data.keys():
            ins1_array.append(str(k))
            ins2_array.append(str(data[k]))

        self.inses.append("{}{}{}{}')".format(ins1,
                                            ",".join(ins1_array),
                                            ins2,
                                            "','".join(ins2_array)))

    def __make_update_item(self, table, data):
        set = []
        for w in data['data'].keys():
            set.append("{}='{}'".format(w, data['data'][w]))

        where = []
        for w in data['where'].keys():
            where.append("{}='{}'".format(w, data['where'][w]))
        self.inses.append("update {} set {} where {}".format(table,
                                                      ",".join(set),
                                                      " and ".join(where)))

    def __make_delete(self, data, items):
        '''
        делаем запросы для удаления
        '''
        where = []
        for w in data['where']:
            where.append("{field}='{value}'".format(field=(w if w != 'row_id' else 'id'),
                                                  value=data['where'][w]))
        self.inses.append(("delete from {table} where {where}".format(table=data['object'], where=" and ".join(where))))

        for item in items.keys():
            for ii in range(len(items[item])):
                self.__make_delete_item(items[item][ii]['object'], items[item][ii])

    def __make_insert(self, data, items):
        '''
        Делаем запрос на добавление
        '''
        query = "insert into {table} ({fields}) values ({values})".format(table=data['object'],
                                                                            fields=','.join(data['data'].keys()),
                                                                            values=','.join(['${}'.format(i+1) for i in range(len(data['data'].keys()))]))
        self.inses.append(query)
        print('items.keys():', items.keys())
        for item in items.keys():
            for ii in range(len(items[item])):
                print('item:', item, '\tii:', ii)
                self.__make_insert_item(items[item][ii]['object'], items[item][ii]['data'])

    def __make_update(self, data, items):
        query = "update {table} set {set} where {where}".format(table=data['object'],
                                                                set=','.join(['{}=${}'.format(i,list(data['data'].keys()).index(i)+1) for i in data['data'].keys()]),
                                                                where=" and ".join(["{field}={value}".format(field=w if w != 'row_id' else 'id', value=data['where'][w]) for w in data['where']]))
        self.inses.append(query)
        # print('SUPER_QUERY', query)
        for i in items:
            for ii in items[i]:
                sec = ii if ii['type'] == 'delete' or ii['type'] == 'update' else ii['data']
                self.ifunctions[ii['type']](ii['object'], sec)    

    
    
    
    
    