var Cookielaw = {

    createCookie: function (name, value, days) {
        var date = new Date(),
            expires = '';
        if (days) {
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    },

    createCookielawCookie: function () {
        this.createCookie('cookielaw_accepted', '1', 10 * 365);

        if (typeof (window.jQuery) === 'function') {
            jQuery('#CookielawBanner').slideUp();
        } else {
            document.getElementById('CookielawBanner').style.display = 'none';
        }
    }

};

$(document).ready(function(){
    var cross = "<div id='CookielawCross'>X</div>";
    $('#CookielawBanner').append(cross);
    $('#CookielawCross').css({
        'position':'absolute',
        'top':0,
        'color' : 'black',
        'font-size': '2em'
    });
    $('#CookielawCross').click(function(){
        $(this).parent().hide();
    });
});
