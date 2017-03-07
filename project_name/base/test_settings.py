from base.settings import *

DEBUG = False
DEBUG_PROPAGATE_EXCEPTIONS = False

LANGUAGE_CODE = "en"


def show_toolbar(request):
    return False

DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": show_toolbar,
}
