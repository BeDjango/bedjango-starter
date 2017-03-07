from base.decorators import anonymous_required

from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.password_validation import password_validators_help_texts
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

from registration.backends.hmac.views import RegistrationView as ActivationRegistrationView
from registration.backends.simple.views import RegistrationView

from .forms import UserRegisterForm

User = get_user_model()


@method_decorator(anonymous_required(redirect_url='index'), name='dispatch')
class UserActivationRegisterView(ActivationRegistrationView):
    form_class = UserRegisterForm

    def get_context_data(self, **kwargs):
        context = super(UserActivationRegisterView, self).get_context_data(**kwargs)
        context["password_rules"] = password_validators_help_texts()
        return context


@method_decorator(anonymous_required(redirect_url='index'), name='dispatch')
class UserNormalRegisterView(RegistrationView):
    form_class = UserRegisterForm


@method_decorator(login_required(login_url='index'), name='dispatch')
class HomeView(TemplateView):
    """
    Home view
    """
    template_name = 'users/home.html'

    def get_context_data(self, **kwargs):
        context = super(HomeView, self).get_context_data(**kwargs)
        context['authenticated'] = self.request.user.is_authenticated()
        if context['authenticated']:
            context['user_detail'] = User.objects.get(username=self.request.user)
        return context
