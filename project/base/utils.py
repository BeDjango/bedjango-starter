import json
import re

from django.http import HttpResponse
from django.utils.translation import ugettext_lazy as _

from base.decorators import ajax_required
from .validators import is_password_secure


@ajax_required
def is_valid_password(request):
    password = request.POST.get('password')
    pattern = re.compile(is_password_secure)
    if pattern.fullmatch(password):
        msg = _('The password is correct.')
        payload = {'success': True, 'msg': str(msg)}
    else:
        msg = _('The password is invalid.')
        payload = {'success': False, 'msg': str(msg)}

    return HttpResponse(json.dumps(payload), content_type='application/json')
