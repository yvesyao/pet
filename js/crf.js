  var __canEdit = true;

  window.$ && $(function() {

    $('#footer').load("footer.html");

    /*绑定编辑功能*/
    $('#editIcon').click(function(event) {
      event.preventDefault();
      if (!__canEdit) return;
      __canEdit = false;
      $(this).hide();
      $('#cancelEditIcon').removeClass('hide').show();
      $('#sub-page .form-value').hide();
      $('#sub-page .hide').not('.add-template, .ignore-hide').removeClass('hide').addClass('no-hide');
    });

    //history变量，用于动态加载时地址栏跟着改变
    var History = window.History,
      State = History.getState();

    //子页面跳转
    History.Adapter.bind(window, 'statechange', function() { // Note: We are using statechange instead of popstate
      var State = History.getState(); // Note: We are using History.getState() instead of event.state
      $.ajax({
        mimeType: 'text/html; charset=utf-8', // ! Need set mimeType only when run from local file
        url: State.url.substring(State.url.indexOf('?') + 1, State.url.length),
        type: 'GET',
        success: function(data) {
          if (window.location.href !== State.url) return; //在请求此页面的过程中又触发了别的页面请求，则中止加载
          $('#sub-page .page-content').html(data);
          __canEdit = true;
          $('#sub-page .loading').hide();
          docReady();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(errorThrown);
        },
        dataType: "html",
        async: false
      });
    });


    /*test*/
    $('#tumour-modal :submit').click(function(e) {
      e.preventDefault();
      var _parent = $("#side-menu");
      var _temp = $("#side-menu>li:eq(1)");
      $('#tumour-form').find(':checked').each(function() {
        _parent.append(_temp.clone(true).children('a').eq(0).html($(this).val() + '<span class="fa arrow"></span>').end().end());
      });
      $("#tumour-modal").modal('hide');
      docReady();
    });

    /*刷新时加载子页面*/
    var thisUrl = window.location.href;
    thisUrl = thisUrl.indexOf('?') > 0 ? (thisUrl.substring(thisUrl.indexOf('?') + 1, thisUrl.length)) : "patientInfo.html";
    $('#sub-page .page-content').load(thisUrl, function() {
      docReady();
    });
    /* 刷新时默认选中 */
    $('#side-menu>li>ul a').each(function() {
      if (String(thisUrl).indexOf(String($(this).attr('href'))) >= 0) {
        $(this).closest('ul').prev('a').trigger('click');
        $(this).closest('li').addClass('cur-page');
      }
    });


    //路径栏吸附到顶端
    $('#page-path').affix({
      offset: {
        top: $('#crf-top').outerHeight()
      }
    });

  });


  function docReady() {

    $('a[href="#"]').click(function(event) {
      event.preventDefault();
    });

    /*退出编辑状态*/
    $('.edit-cancle').unbind('click.cancelEdit').bind('click.cancelEdit', function(event) {
      event.preventDefault();
      if (!__canEdit && !confirm("您确定要退出编辑状态吗？")) return false;
      $('#sub-page .form-horizontal .form-value').show();
      $('#sub-page .form-horizontal .no-hide').removeClass('no-hide').addClass('hide');
      __canEdit = true;
      $('#cancelEditIcon').hide();
      $('#editIcon').show();
    });
    $('#cancelEditIcon').hide();
    $('#editIcon').show();

    /*拦截表单编辑过程的回车键*/
    $("input").keypress(function(event) {
      if (__canEdit) return;
      if (event.which == 13) {
        event.preventDefault();
      };
    })

    /*自主添加插件*/
    var __addFlag = true;
    $('.self-add').click(function(e) { //点击按钮时添加选项编辑器
      e.preventDefault();
      if (!__addFlag) return;
      var _temp = $(this).siblings('.add-template');
      _temp.clone(true)
        .removeClass('hide add-template')
        .addClass('new-added')
        .insertBefore(_temp)
        .find('.val-input')
        .focus();
    });
    $('.val-input').blur(function() { //失去焦点时添加选项
      addTemplate($(this));
    });
    $('select.val-input').change(function() { //失去焦点时添加选项
      addTemplate($(this));
    });

    /*菜单栏Pjax绑定*/
    $('#leftMenu ul a').not('[href="#"]').click(function(event) {
      /* Act on the event */
      event.preventDefault();
      $('#side-menu li.cur-page').removeClass('cur-page');
      $(this).closest('li').addClass('cur-page');
      changeState($(this).attr('href'));
    });

    /*菜单栏插件*/
    $('#side-menu').metisMenu();

    /*datepicker*/
    $(".datepicker").datepicker({
      regional: "zh-TW",
      changeMonth: true,
      changeYear: true,
      dateFormat: 'yy-mm-dd',
      showOtherMonths: false,
      selectOtherMonths: false
    });

    /*panel收起按钮*/
    $('.panel-slide-up').click(function(event) {
      event.preventDefault();
      if ($(this).hasClass('retract')) {
        $(this).removeClass('retract').closest('.panel').children('.panel-body').slideDown('400');
      } else {
        $(this).addClass('retract').closest('.panel').children('.panel-body').slideUp('400');
      }
    });


    /*选中后显示相应的其他选项*/
    $('[data-toggle="radioSubTrigger"]').each(function() {
      var $triggerRadio = $(this);
      $(this).closest('.form-group').find('[name = ' + $(this).attr('name') + ']').click(function() {
        radioSubToggle($triggerRadio);
      });
      radioSubToggle($(this));
    });
  };

  function radioSubToggle(elem) {
    var $target = $(elem).closest('.form-group').find(elem.attr("data-target"));
    if ($target.length <= 0) return 0;
    elem.is(":checked") ? $target.removeClass("hide") : $target.addClass("hide");
  };

  function addTemplate(obj) {
    var _addVal = $(obj).val();
    if (_addVal == '') { //无内容时删除
      $(obj).closest('.add-template').remove();
      __addFlag = true;
      return;
    };
    /*删除添加的插件*/
    $(obj).closest('.new-added')
      .append('<a href="#" class="btn btn-danger remove-added"><b class="glyphicon glyphicon-remove"></b></a>')
      .children('.remove-added').click(function(event) {
        /* Act on the event */
        event.preventDefault();
        if (confirm("您确定要删除此元素吗？")) {
          $(this).closest('.new-added').remove();
        };
      });
    $(obj).after(_addVal).prev(':checkbox, :radio').val(_addVal);
    $(obj).remove();

    __addFlag = true;
  };

  //将新地址写入History
  function changeState(href) {
    if (window.location.href.split("?")[1] === href) return;
    $('#sub-page .loading').removeClass('hide').show();
    /*$.get('ajaxLogin_checkLogin.action', function(data) { //检测是否登录
    if (data.result == '1') {*/
    if (!(!-[1, ] && (!window.XMLHttpRequest || document.documentMode <= 8))) //非ie8及以下
      History.pushState(null, null, location.href.split("?")[0] + "?" + href);
    else
      $('#sub-page .page-content').load(href, function() {
        $('#sub-page .loading').hide();
        //subReady();
      });
    /*} else
noLogin();
});*/
  };