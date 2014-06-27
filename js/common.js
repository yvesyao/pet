window.$ && $(function() {

    $('a[href="#"]').click(function(event) {
        event.preventDefault();
    });

    /*绑定对话框弹出事件*/
    $('[data-modal]').click(function(e) {
        e.preventDefault();
        $(this).attr('data-modal').modal('show');
    });


});

function dhDiv(ee1) {
    var _new = $(ee1).clone();
    _new.addClass('topFixed').hide();
    $(ee1).after(_new);
    //鼠标滚动事件 
    $(window).scroll(function() {
        if ($(this).scrollTop() > $(ee1).offset().top) {
            if (_new.is(':visible')) return;
            _new.css({
                'left': $(ee1).offset().left - $(window).scrollLeft(),
                'width': $(ee1).outerWidth()
            }).show();
        } else {
            _new.hide();
        }
    });
}