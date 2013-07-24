function domain_properties_view(){
  console.log('domain_properties_view called for ', $(this).data('domain'));
  localStorage.setItem('current_domain', $(this).data('domain'));
  $('#shared_space').html($("#domain_properties_tmpl").html());

  refresh_domain_admins(localStorage.getItem('current_domain'));

  $('#btn_delete_domain').popover({
       placement: "bottom",
       trigger: "hover",
       content: "Удалить всех пользователей домена, а затем отключить домен",
       // selector: "#btn_delete_domain"
    });

}

function refresh_domain_admins(domain){
  $.getJSON('/md', {do_what: 'get_domain_admins', domain: domain})
  .done(function(data){
    console.log(data);
    // var domain_admins_list_tmlp = 
    $("#domain_admins").html(Handlebars.compile($('#domain_admins_list_tmlp').html())(data));
  })
}

function remove_domain_admin(name, domain){
  console.log('remove_domain_admin called');
  $.getJSON('/md', {do_what: 'remove_domain_admin', name: name, domain: domain})
    .done(function(data){
      if (data.success) {
        refresh_domain_admins(localStorage.getItem('current_domain'));  
      } else{
        m.e('Произошла ошибка', data.err);
      }
    });
}

function add_domain_admin(name, domain){
  console.log('add_domain_admin called');
  $.getJSON('/md', {do_what: 'add_domain_admin', name: name, domain: domain})
    .done(function(data){
      if (data.success) {
        $("#btn_add_domain_admin").addClass('btn-success');
        setTimeout(function () {
            $("#btn_add_domain_admin").removeClass('btn-success');
        }, 3000);
        refresh_domain_admins(localStorage.getItem('current_domain'));
        $("#new_admin_name").val('');
      } else{
        $("#btn_add_domain_admin").toggleClass('btn-danger');
        setTimeout(function () {
            $("#btn_add_domain_admin").removeClass('btn-danger');
        }, 3000);
        m.e(data.msg);
        m.e(data.err);
      }
    })
}

function set_default_domain_email(name, domain){
    console.log('set_default_domain_email called');
    $.getJSON('/md', {do_what: 'set_default_domain_email', name: name, domain: domain})
      .done(function(data){
        if (data.success) {
          $("#btn_set_default_domain_email").addClass('btn-success');
          setTimeout(function () {
              $("#btn_set_default_domain_email").removeClass('btn-success');
          }, 3000);
          $("#new_default_domain_email").val('');
          $("#divError").hide();
        } else{
          $("#btn_set_default_domain_email").toggleClass('btn-danger');
          setTimeout(function () {
              $("#btn_set_default_domain_email").removeClass('btn-danger');
          }, 3000);
          m.e(data.msg);
          m.e(data.err);
        }
      })
}

function delete_domain_logo(domain){
  $.getJSON('/md', {do_what: 'delete_domain_logo', domain: domain})
    .done(function(data){
      if (data.success) {
          $("#btn_confirm_delete_domain_logo").addClass('btn-success');
          setTimeout(function () {
              $("#btn_confirm_delete_domain_logo").removeClass('btn-success');
          }, 3000);
        } else{
          m_modal_confirmation.e(data.msg);
          m_modal_confirmation.e(data.err);
        }
    })
}

function delete_domain(domain){
  $.getJSON('/md', {do_what: 'delete_domain', domain: domain})
    .done(function(data){
      if (data.success) {
        $("#btn_confirm_delete_domain").addClass('btn-success');
        $('#btn_close_confirmation_modal').html('Закрыть');
        m_modal_confirmation.clear();
        setTimeout(function () {
            $("#btn_confirm_delete_domain").removeClass('btn-success').removeClass('btn-danger');
        }, 3000);
      } else{
        m_modal_confirmation.e(data.msg);
        m_modal_confirmation.e(data.err);
      }
    })
}

function make_emails_csv_link(){
  $('.csv_link').each(function(){
    var $this = $(this),
        str4csv = 'Имя,Фамилия,Адрес электронной почты\n';
    $.each(JSON.parse(localStorage.getItem('yadmin_users_'+$this.data('domain'))), function(){
      tmp = this.split('.');
      if (tmp.length > 1){
        str4csv += tmp[0].charAt(0).toUpperCase() + tmp[0].slice(1) + ',' + tmp[1].charAt(0).toUpperCase() + tmp[1].slice(1) + ',' + this + '@' + $this.data('domain') + '\n';  
      } else {
        str4csv += tmp[0] + ',' + ',' + this + '@' + $this.data('domain') + '\n';
      }
      
    })
    $this.attr('href', 'data:application/csv;charset=utf-8,' + encodeURIComponent(str4csv));
  })
  
}

