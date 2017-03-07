$(document).ready(function(){

    function validateUsername(username){
        var re = /^[a-zA-Z0-9]+([-_\.][a-zA-Z0-9]+)*[a-zA-Z0-9]$/;
        return re.test(username);
    }
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function validatePassword(password){
        var re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[-!·$%&/()=?])[A-Za-z\d\-!·$%&/()=?]{8,32}$/;
        return re.test(password);
    }

    function change_to_valid(){
        if(flag_user && flag_email && flag_password){
            $('#id_register').removeClass('disabled');
            $('#id_register').removeAttr('disabled');
        }else{
            $('#id_register').addClass('disabled');
            $('#id_register').attr('disabled', 'true');
        }
    }


    $('#id_register').addClass('disabled');
    $('#id_register').attr('disabled', 'true');
    var flag_user = false;
    var flag_email = false;
    var flag_password = false;

    $('#id_username').keyup(function(){
        if( validateUsername($(this).val()) ){
            $(this).css(
                { 'border-color' : 'green'}
            );
            $(this).siblings('span').each(function(){
                $(this).remove();
            });
            $(this).after("<span class='msg ok'>"+gettext("Username is valid")+"</span>");
            flag_user = true;
            change_to_valid();
        }else{
            $(this).css(
                { 'border-color' : 'red' }
            );
            $(this).siblings('span').each(function(){
                $(this).remove();
            });
            $(this).after("<span class='msg wrong'>"+gettext("Please write a valid username")+"</span>");
            flag_user = false;
            change_to_valid();
        }
    });

    $('#id_email').keyup(function(){
        if( $(this).val().length > 0 && validateEmail($(this).val()) ){
            $(this).css(
                { 'border-color' : 'green'}
            );
            $(this).siblings('span').each(function(){
                $(this).remove();
            });
            $(this).after("<span class='msg ok'>"+gettext("Email valid")+"</span>");
            flag_email = true;
            change_to_valid();
        }else{
            $(this).css(
                { 'border-color' : 'red' }
            );
            $(this).siblings('span').each(function(){
                $(this).remove();
            });
            $(this).after("<span class='msg wrong'>"+gettext("Email is not valid")+"</span>");
            flag_email = false;

            change_to_valid();
        }
    });

    $('#id_password1').keyup(function(){
        if( validatePassword($(this).val()) ){
            $(this).css(
                { 'border-color' : 'green'}
            );
            $(this).siblings('span').each(function(){
                $(this).remove();
            });
            $(this).after("<span class='msg ok'>"+gettext("Password valid")+"</span>");
            change_to_valid();
        }else{
            $(this).css(
                { 'border-color' : 'red' }
            );
            $(this).siblings('span').each(function(){
                $(this).remove();
            });
            var value = 0;
            if ($(window).width() < 768){
                value = "-16px";
            }else{
                value="-32px";
            }
            $(this).after("<span style='bottom:"+value+"' class='msg wrong'>"+gettext("Please write a valid password")+"</span>");
            change_to_valid();
        }
    });


    $('#id_password2').keyup(function(){
        if($('#id_password1').val().length > 5){
        var text = $(this).val();
        var text_to_compare = $("#id_password1").val();
        if (text == text_to_compare){
            $(this).css(
                { 'border-color' : 'green'}
            );
            $(this).siblings('span').each(function(){
                $(this).remove();
            });
            $(this).after("<span class='msg ok'>"+gettext("Passwords are correct")+"</span>");
            flag_password = true;
            change_to_valid();
        }else{
            $(this).css(
                { 'border-color' : 'red' }
            );
            $(this).siblings('span').each(function(){
                $(this).remove();
            });
            $(this).after("<span class='msg wrong'>"+gettext("Passwords doesn't match")+"</span>");
            flag_password = false;
            change_to_valid();
        }
    }
    });

});
