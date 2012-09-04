import urllib.request
import urllib.parse
import xml.etree.ElementTree as etree

'''
    Simple wrapper for Yandex mail for domains

    For details - see documentation:
    http://pdd.yandex.ru/help/section72/
    http://pdd.yandex.ru/help/section73/
'''
class Base(object):

    API_BASE_URL = 'https://pddimp.yandex.ru/'

    def __init__(self, logger = None):
        self._logger = logger

    def invokeHandler(self, handler_name, params, method = 'get', base_url = None):
        if not base_url:
            base_url = self.API_BASE_URL

        clean_params = {}
#        for k,v in params.iteritems():
        for k in params:
            if params[k]:
               clean_params[k] = params[k]

        url = base_url + handler_name + '.xml'
        params = urllib.parse.urlencode(clean_params)

        if method.lower() == 'post':
            fp = urllib.request.urlopen(url, params)
        else:
            fp = urllib.request.urlopen(url + '?' + params)

#        self.log('Preform request at url: %s ', url)
        result = fp.read()
        self.log(result)

        if not result:
            return

        xml = etree.XML(result)
        
        self.checkError(xml, url, params)

        return xml

    def checkError(self, xml, url, params):
        return

    def log(self, message, *args, **kwargs):
        if not self._logger:
            return
        self._logger.debug(message, *args, **kwargs)


class ActionException(Exception):
    def __init__(self, message, url, params):
        self.message = message
        message += ' Request: [url %s] [params %s]' % (url, params)
        super(ActionException, self).__init__(message)
    
    def __str__(self):
        return self.message

    def __repr__(self):
        return repr(self.message)

class UserApi(Base):

    def __init__(self, token, logger = None):
        self._token = token
        super(UserApi,self).__init__(logger)

    def invokeHandler(self, handler_name, params):
        if 'token' not in params:
              params['token'] = self._token

        return super(UserApi, self).invokeHandler(handler_name, params)

    def checkError(self, xml, url, params):
        error = xml.find('error')
        if error is not None:
            raise ActionException(error.get('reason'), url, params)

    '''
      @param string login
      @param string password
      @return ElementTree.Element
    '''
    def createUser(self, login, password):
        return self.invokeHandler('reg_user_token', {'u_login' : login, 'u_password' : password})

    '''
      @param string login
      @return ElementTree.Element
    '''
    def deleteUser(self, login):
        return self.invokeHandler('delete_user',
            {'login' : login}
        )


    '''
      @param string login
      @param string new_password
      @param string first_name
      @param string last_name
      @param string sex [1 man, 2 woman]
      @return ElementTree.Element
    '''
    def editUserDetails(self, login, password=None, iname=None, fname=None, sex=None):
        return self.invokeHandler('edit_user',
            {
                'login': login,
                'password': password,
                'iname': iname,
                'fname': fname,
                'sex': sex
            }
        )


    '''
      @param string  method - [imap, pop3]
      @param string extern_host
      @param string extern_port
      @param string is_ssl - [yes, no]
      @param string callback
      @return ElementTree.Element
    '''
    def setImportSettings(self, method, extern_host, extern_port = None, is_ssl = "no", callback = None):
        return self.invokeHandler('set_domain', {
            'method' : method,
            'ext_srv' : extern_host,
            'ext_port' : extern_port,
            'isssl' : is_ssl,
            'callback' : callback,
        })

    '''
     @param string inner_login
     @param string extern_login
     @param string exten_password
     @return ElementTree.Element
    '''
    def startImport(self, inner_login, extern_login, exten_password):
        return self.invokeHandler('start_import', {
            'login' : inner_login,
            'ext_login' : extern_login,
            'password' : exten_password,
        })


    '''
     @param string login
     @return ElementTree.Element
    '''
    def getImportState(self, login):
       return self.invokeHandler('check_import', {
            'login' : login,
        })

    '''
     @param string inner_login
     @param string inner_password
     @param string extern_login
     @param string extern_password
     @return ElementTree.Element
    '''
    def registerAndStartImport(self, inner_login, inner_password, extern_login, extern_password):
        return self.invokeHandler('reg_and_imp', {
            'login' : inner_login,
            'ext_login' : extern_login,
            'inn_password' : inner_password,
            'ext_password' : extern_password
        })

    '''
     @param string login
     @return ElementTree.Element
    '''
    def getUnreadMessagesCount(self, login):
        return self.invokeHandler('get_mail_info', {'login' : login})

    '''
     @param string login
     @return ElementTree.Element
    '''
    def getUserInfo(self, login):
        ret = {}
        xml = self.invokeHandler('get_user_info', {'login' : login})
        for i in ('login', 'birth_date', 'fname', 'iname', 'hinta', 'hintq', 'sex', 'signed_eula', 'mail_format', 'charset', 'nickname'):
            ret[i] = xml.findtext('.//{}'.format(i))
            print('\t\t', ret[i], type(ret[i]))
        return ret

    '''
     @param int page
     @param int perpage
     @return ElementTree.Element
    '''
    def getUsersList(self, page = 1, perpage = 100):
        ret = []
        xml = self.invokeHandler('get_domain_users', {'page' : page, 'on_page' : perpage})

        emails = xml.findall('.//email')
        for f in emails:
            a = {}
            for k in f.getchildren():
                a[k.tag] = k.text
            ret.append(a)

        return ret

    def getUsersNumber(self, page = 1, perpage = 1):
        xml = self.invokeHandler('get_domain_users', {'page' : page, 'on_page' : perpage})
        number = xml.findtext('.//total')
        
        return number

    '''
     @param string login
     @return ElementTree.Element
    '''
    def stopImport(self, login):
        return self.invokeHandler('stop_import', {'login' : login})

    '''
    @param string login
    @param string address
    @param string copy
    @return ElementTree.Element
    '''
    def setForwarding(self, login, address, copy = 'yes'):
        return self.invokeHandler('set_forward', {'login' : login, 'address' : address, 'copy' : copy})

    '''
    @param string login
    @return ElementTree.Element
    '''
    def getForwarding(self, login):
        ret = []
        xml = self.invokeHandler('get_forward_list', {'login' : login})

        filters = xml.findall('.//filter')
        for f in filters:
            a = {}
            for k in f.getchildren():
                a[k.tag] = k.text
            ret.append(a)

        return ret

    def stopForwarding(self, login, filter_id):
        return self.invokeHandler('delete_forward', {'login': login, 'filter_id': filter_id})

    '''
    @param string login
    @return ElementTree.Element
    '''
    def checkUser(self, login):
        xml = self.invokeHandler('check_user', {'login' : login})
        return 1 if xml.findtext('result')=='exists' else 0

    '''
    @param string domain
    @return ElementTree.Element
    '''
    def createAll(self, domain, name):
        return self.invokeHandler('create_general_maillist', {'domain' : domain, 'ml_name': name})

class RegistrarApi(Base):

    def __init__(self, registrar_id, password, logger = None):
        self._registrar_id = registrar_id
        self._password = password
        super(RegistrarApi, self).__init__(logger)


    def invokeHandler(self, handler_name, params, method = 'get', base_url = Base.API_BASE_URL):
        if 'registrar_id' not in params:
              params['registrar_id'] = self._registrar_id

        if 'password' not in params:
              params['password'] = self._password

        return super(RegistrarApi, self).invokeHandler(handler_name, params, method, base_url)

    def checkError(self, xml, url, params):
        error = xml.find('*/error')
        if error is not None and error.text != 'ok':
            raise ActionException(error.text, url, params)

    '''
     @param string payed_url
     @param string added_init_url
     @param string added_url
     @param string delete_url
     @param string transfer_succeed
     @return ElementTree.Element
    '''
    def setRegistrarUrls(self, payed_url, added_init_url, added_url, delete_url, transfer_succeed):

        return self.invokeHandler('save_registrar', {
            'payed_url' : payed_url,
            'added_init' : added_init_url,
            'added' : added_url,
            'delete_url' : delete_url,
            'transfer_succeed' : transfer_succeed
        })


    '''
     @param string domain
     @param string mail_protocol
     @param bool use_ssl
     @param string mail_server
     @param string mail_port
     @param dict emails = {'email' => 'password', ...}
     @return ElementTree.Element
    '''
    def importDomain(self, domain, mail_protocol, use_ssl, mail_server, mail_port, emails):
        emailsXml = '<emails>'
        for email , password in emails.iteritems():
            emailsXml += '<email><name>%s</name><password>%s</password></email>' % (email, password);

        emailsXml += '</emails>'
        return self.invokeHandler('import_registrar_domain',
            {
                'domain' : domain,
                'mail_proto' : mail_protocol,
                'use_ssl' : use_ssl,
                'mail_server' : mail_server,
                'mail_port' : mail_port,
                'emails' : emailsXml,
            },
            'post'
        )

    '''
     @param string domain
     @return ElementTree.Element
    '''
    def checkDomain(self, domain):
        return self.invokeHandler('registrar_check_domain', {'domain' : domain,})

    '''
     @param string domain
     @return ElementTree.Element
    '''
    def checkImport(self, domain):
        return self.invokeHandler('registrar_check_import', {'domain' : domain,});



