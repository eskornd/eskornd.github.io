#!/usr/bin/env python

import getpass

server='jira.esko.com'
auth_api='/rest/auth/latest/session'
url='https://' + server + auth_api


print('Login ')

print('User:' )
p = getpass.getpass()

print('PASS IS' + p)
