$(document).ready(function(){
    function validatePassword(password){
        var re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[-!·$%&/()=?])[A-Za-z\d\-!·$%&/()=?]{8,32}$/;
        return re.test(password);
    }

    function change_to_valid(){
        if(flag_password){
            $('#send_new').removeClass('disabled');
            $('#send_new').removeAttr('disabled');
        }else{
            $('#send_new').addClass('disabled');
            $('#send_new').attr('disabled', 'true');
        }
    }


    $('#send_new').addClass('disabled');
    $('#send_new').attr('disabled', 'true');
    var flag_password = false;

    function input_password_check(target_input, correct_text, wrong_text, flag = 0){
        target_input.keyup(function(){
            if( validatePassword($(this).val()) ){
                $(this).css(
                    { 'border-color' : 'green'}
                );
                $(this).siblings('span').each(function(){
                    $(this).remove();
                });
                $(this).after("<span class='msg ok'>"+gettext(correct_text)+"</span>");
                flag = true;
                change_to_valid();
            }else{
                $(this).css(
                    { 'border-color' : 'red' }
                );
                $(this).siblings('span').each(function(){
                    $(this).remove();
                });

                $(this).after("<span class='msg wrong'>"+gettext(wrong_text)+"</span>");
                flag = false;
                change_to_valid();
            }
        });
    }

    input_password_check($("#id_new_password1"), "Password valid", "Please write a valid password");

    $('#id_new_password2').keyup(function(){
        if($('#id_new_password1').val().length > 5){
        var text = $(this).val();
        var text_to_compare = $("#id_new_password1").val();
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
