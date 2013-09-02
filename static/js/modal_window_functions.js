function delete_user(name){
  // console.log('delete_user called for ', name);

  $.getJSON('/mu', {do_what: 'delete_user', login: name, domain: localStorage.getItem('current_domain')}).done(function(data){
    // console.log(data);
    if (data.success){
      $("#btn_confirm_delete_user").addClass('btn-success');
        setTimeout(function () {
            $("#btn_confirm_delete_user").removeClass('btn-success');
        }, 3000);
        $("#btn_close_confirmation_modal").html('Закрыть');
        $('#div_modal_confirmation_error').hide();
        refresh_users_list().done(function(){
          draw_table(JSON.parse(localStorage.getItem('yadmin_users_'+localStorage.getItem('current_domain'))), 'users_tmpl', 'users_table');
        });
    } else {
      m_modal_confirmation.e(data.msg);
      m_modal_confirmation.e(data.err);
    }
  })
}

function edit_forward(params){
  var params = {do_what: 'edit_forward',
                domain: localStorage.getItem('current_domain'),
                from: params.from,
                to: params.to,
                id: params.id,
                checked: params.checked}
  $.getJSON('/mu', params).done(function(data){
    if (data.success){
        $("#btn_add_forward").addClass('btn-success');
        setTimeout(function () {
            $("#btn_add_forward").removeClass('btn-success');
        }, 3000);
        $('#div_modal_error').hide();
        get_forwards_list(from);
    } else {
        $("#btn_add_forward").toggleClass('btn-danger');
        setTimeout(function () {
            $("#btn_add_forward").removeClass('btn-danger');
        }, 3000);
        m_modal.e(data.msg);
        m_modal.e(data.err);
        $('#div_modal_error').show();
    }
  })
}

function get_recieves_list(login){
  var params = {do_what: 'get_recieves_list',
                login: login,
                domain: localStorage.getItem('current_domain'),
                groups: localStorage.getItem('yadmin_groups_'+localStorage.getItem('current_domain')) || '[]'};
  return $.getJSON('/mu', params).done(function(data){
    if (data.success){
      var recieves_list_tmpl = Handlebars.compile($("#recieves_list_tmpl").html());
      // console.log(data);
      $('#modal_recieves_list').append(recieves_list_tmpl(data));  
    } else {m.e('Произошла ошибка')};
  })
}  

function add_forward(from, to){
  $.getJSON('/mu', {do_what: 'add_forward', domain: localStorage.getItem('current_domain'), from: from, to: to}).done(function(data){
    if (data.success){
        $("#btn_add_forward").addClass('btn-success');
        setTimeout(function () {
            $("#btn_add_forward").removeClass('btn-success');
        }, 3000);
        $('#div_modal_error').hide();
        get_forwards_list(from);
    } else {
        $("#btn_add_forward").toggleClass('btn-danger');
        setTimeout(function () {
            $("#btn_add_forward").removeClass('btn-danger');
        }, 3000);
        m_modal.e(data.msg);
        m_modal.e(data.err);
        $('#div_modal_error').show();
    }
  })
}

function save_user(){
    var param = {};
    $.each(['login', 'password', 'iname', 'fname'], function(){
        param[this] = $('#user_info_input_'+this).val() || "";
    })
    if ($('#user_info_sex_1').is(':checked')){
        param['sex'] = 1;
    }
    else if ($('#user_info_sex_2').is(':checked')){
        param['sex'] = 2;
    } else{
        param['sex'] = '';
    }
    // var forwards_to_remove = [];
    // $.each($("input.remove_recipient"), function(){
    //   if ($(this).is(':checked')){
    //     forwards_to_remove.push({from: param.login, id: $(this).data('id')});
    //   }
    // })
    // $.each($("input.remove_sender"), function(){
    //   if ($(this).is(':checked')){
    //     forwards_to_remove.push({from: $(this).data('from'), id: $(this).data('id')});
    //   }
    // })
    // if (forwards_to_remove.length){
    //   remove_forwards(forwards_to_remove);
    // }
    $.getJSON('/mu', {do_what: 'save_user_info', param: JSON.stringify(param), domain: localStorage.getItem('current_domain')}).done(function(data){
        if (data.success){
            $("#btn_save_user").addClass('btn-success');
            setTimeout(function () {
                $("#btn_save_user").removeClass('btn-success');
            }, 3000);
            $('#div_modal_error').hide();
            $("#btn_cancel_changes").html('Закрыть');
            refresh_users_list().done(function(){
              draw_table(JSON.parse(localStorage.getItem('yadmin_users_'+localStorage.getItem('current_domain'))), 'users_tmpl', 'users_table');
            });
        } else {
            $("#btn_save_user").toggleClass('btn-danger');
            setTimeout(function () {
                $("#btn_save_user").removeClass('btn-danger');
            }, 3000);
            m_modal.e(data.msg);
            m_modal.e(data.err);
            $('#div_modal_error').show();
        }
    })
}

function remove_forwards(forwards_to_remove){
  $.getJSON('/mu', {do_what: 'remove_forwards', domain: localStorage.getItem('current_domain'),
    forwards_to_remove: JSON.stringify(forwards_to_remove)}).done(function(data){
    if (data.success){
        $("#btn_add_forward").addClass('btn-success');
        setTimeout(function () {
            $("#btn_add_forward").removeClass('btn-success');
        }, 3000);
        get_forwards_list(forwards_to_remove[0]['from']);
    } else {
        $("#btn_add_forward").toggleClass('btn-danger');
        setTimeout(function () {
            $("#btn_add_forward").removeClass('btn-danger');
        }, 3000);
        m_modal.e(data.msg);
        m_modal.e(data.err);
        $('#div_modal_error').show();
    }
  })
}

function add_user(){
    if ($("#div_user_info").length){
        $("#div_user_info").remove()
    } 
    var login = $('#filter_str').val(),
        view_user_modal = Handlebars.compile($('#view_user_tmpl').html());
    $(view_user_modal({login: login})).modal();
}

function get_forwards_list(login){
  return $.getJSON('/mu', {do_what: 'get_forwards_list', login: login, domain: localStorage.getItem('current_domain')})
  .done(function(data){
    $.each(data.items, function(){
        if (this.enabled){
            this['show'] = 1;
        } else {
            this.filter_param = '<small>'+this.filter_param+' (Возможно ожидает подтверждения email-адреса)'+'</small>'
            this['show'] = 1;
        }
    })
    var forwards_list_tmpl = Handlebars.compile($("#forwards_list_tmpl").html());
    console.log(data);
    $('#modal_forwards_list').html(forwards_list_tmpl(data));
  })
}

function view_user(login, if_group){
    if ($("#div_user_info").length){
        $("#div_user_info").remove();
    }
    var view_user_modal = Handlebars.compile($('#view_user_tmpl').html());
    $.getJSON('/mu', {do_what: 'get_user_info', login: login, domain: localStorage.getItem('current_domain')}).done(function(data){
        if (data.success){
            // console.log(data.items);
            if (if_group){
                data.items['is_group'] = 1;    
            }
            $(view_user_modal(data.items)).modal()
              .one('shown', function(){
                get_forwards_list(login);
                get_recieves_list(login);
              })
              .on('hidden', function(){
                bind_dblclick_and_edit();
              }); 
        } else{
            m.e(data.err);
            m.m(data.msg);
        }
    })
}