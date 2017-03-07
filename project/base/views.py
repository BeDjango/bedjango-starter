from base.forms import ContactForm

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth import login as auth_login
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.shortcuts import render, redirect
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.views.generic.edit import FormView

from users.forms import LoginForm

User = get_user_model()


class IndexView(TemplateView):
    """
    Index view
    """
    template_name = 'base/index.html'
    form = LoginForm()

    def post(self, request):
        context = {}
        self.form = LoginForm(request.POST or None)

        if request.POST and self.form.is_valid():
            user_email = request.POST['email']
            user_password = request.POST['password']
            username = User.objects.get(email=user_email).username
            user = authenticate(username=username, password=user_password)
            auth_login(request, user)
            context['authenticated'] = request.user.is_authenticated()
            if context['authenticated']:
                context['username'] = request.user.username
                return redirect('home')

        context.update({'login_form': self.form,
                        'login_failed': 'true'})

        return render(request, self.template_name, context)


class ContactView(FormView):
    template_name = 'base/contact.html'
    form_class = ContactForm
    success_url = '/'

    def form_valid(self, form):
        send_mail(
            'Contact - {} - {}'.format(form.cleaned_data.get('contact_email'),
                                       form.cleaned_data.get('contact_name')),
            form.cleaned_data.get('content'),
            settings.EMAIL_FROM,
            [settings.EMAIL_TO],
            fail_silently=False,
        )
        return super(ContactView, self).form_valid(form)


@method_decorator(login_required(login_url='index'), name='dispatch')
class ListsView(TemplateView):
    """
    View for rendering a basic Lists templates used in the starter
    """
    template_name = 'base/lists.html'


@method_decorator(login_required(login_url='index'), name='dispatch')
class PanelsView(TemplateView):
    """
    View for rendering a basic Lists templates used in the starter
    """
    template_name = 'base/panels.html'


class BlogDetailView(TemplateView):
    """
    Main blog detail view
    """
    template_name = 'base/blog_detail.html'


class PrivacyPolicyView(TemplateView):
    template_name = 'base/privacy-policy.html'

    def get_context_data(self, **kwargs):
        context = super(PrivacyPolicyView, self).get_context_data(**kwargs)
        return context
