$(document).ready(function(){
    function validatePassword(password){
        var re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[-!·$%&/()=?])[A-Za-z\d\-!·$%&/()=?]{8,32}$/;
        return re.test(password);
    }

    // Passing an element to this functions disables or enables in functions of how many
    // flags we enter

    function change_to_valid(){
        if(flag_password && flag_old_password){
            $('#id_change').removeClass('disabled');
            $('#id_change').removeAttr('disabled');
        }else{
            $('#id_change').addClass('disabled');
            $('#id_change').attr('disabled', 'true');
        }
    }

    // Function that checks if the passwords are correct
    function input_password_check(target_input, correct_text, wrong_text, boolean){
        target_input.keyup(function(){
            if( validatePassword($(this).val()) ){
                $(this).css(
                    { 'border-color' : 'green'}
                );
                $(this).siblings('span').each(function(){
                    $(this).remove();
                });
                $(this).after("<span class='msg ok'>"+gettext(correct_text)+"</span>");
                if(boolean){
                flag_old_password = true;
                }
                change_to_valid();
            }else{
                $(this).css(
                    { 'border-color' : 'red' }
                );
                $(this).siblings('span').each(function(){
                    $(this).remove();
                });

                $(this).after("<span class='msg wrong'>"+gettext(wrong_text)+"</span>");
                if(boolean){
                    flag_old_password = false;
                }
                change_to_valid();
            }
        });
    }

    $('#id_change').addClass('disabled');
    $('#id_change').attr('disabled', 'true');
    var flag_password = false;
    var flag_old_password = false;
    correct_text = "Password valid";
    wrong_text = "Please write a valid password";

    // Checks
    input_password_check($('#id_old_password'), correct_text, wrong_text, true);
    input_password_check($('#id_new_password1'), correct_text, wrong_text);

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
