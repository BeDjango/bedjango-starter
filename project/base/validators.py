# -*- coding: utf-8 -*-
import re
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext as _


is_password_secure = '^(?=.*[A-Za-z])(?=.*\d)(?=.*[-!·$%&/()=?])[A-Za-z\d\-!·$%&/()=?]{8,32}$'


class CustomPasswordValidator(object):
    def __init__(self, min_length=8):
        self.min_length = min_length

    def validate(self, password, user=None):
        pattern = re.compile(is_password_secure)
        if not pattern.match(password):
            raise ValidationError(
                _("Password must be at least 8 characters and contain lowercase and uppercase letters, numbers and special characters."),
                code='Invalid password',
            )

    def get_help_text(self):
        return _(
            "Password must be at least 8 characters and contain lowercase and uppercase letters, numbers and special characters."
        )
