from django import forms
from django.utils.translation import ugettext as _


class ContactForm(forms.Form):
    contact_name = forms.CharField(label=_('Your name'), required=True,
                                   widget=forms.TextInput(attrs={'class': "form-control"}))
    contact_email = forms.EmailField(label=_('Your email'), required=True,
                                     widget=forms.EmailInput(attrs={'class': "form-control"}))
    content = forms.CharField(
        label=_("Leave us your message"),
        required=True,
        widget=forms.Textarea(attrs={'class': "form-control"})
    )
