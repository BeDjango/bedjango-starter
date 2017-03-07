$(document).ready(function(){
    if($("#id_login").length){
        if($(window).width() > 768){
            var distance_of_button = $("#id_login").offset().left + $("#id_login").outerWidth();
            var left_distance = distance_of_button - $("#modal-login").outerWidth();
            var top_distance = $('#id_login').offset().top + $('#id_login').outerHeight();
            //Note: By default Bootstrap adds a 15px Padding-right and it's
            //not overridable, so we fix this adding those 15 here.

            //The value 11 is for adding space to the little arrow.
            var position = {
                'top' : top_distance + 11,
                'left' : left_distance + 15,
                'right': 'auto'
            };
            if($(window).width() > 768){
                $('#modal-login').css(position);
                // This function makes clicking on everything but The
                // modal to close it.
             }
             }
             $('#modal-login').on('click', function(e){
                 e.stopPropagation();
             });
             $("body").on("click", function(e) {
                  $('#modal-login').modal('hide');
              });
         }
});
