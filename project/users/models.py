import uuid

from django.conf import settings
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django_countries.fields import CountryField
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=256, unique=True, null=True)
    country = CountryField(_('Country'), blank=True, blank_label=_('Country'))
    email = models.EmailField(_('email address'), blank=True, unique=True)
    preferred_language = models.CharField(_('Preferred Language'), null=True, blank=True, max_length=100, choices=settings.LANGUAGES)
