function bind_users_page_events(){
  $(document).on('click', "#btn_filter_users", function(e){
    filter_users();
    e.preventDefault();
  });
  
  $(document).on('click', "#btn_add_user", add_user);
  
  $(document).on('keydown', '#filter_str', function(event){
      if (event.keyCode==13){
          event.preventDefault();
          filter_users();
      } else if (event.keyCode==27) {
          $('#filter_str').val('');
          filter_users();
      }
  })
  
  $(document).on('click', '#divError button, #divMessage button, #divDebug button', function(){
    $(this).parent().hide();
  })
  
  $(document).on('click', '#close_info_alert', function(){
      localStorage.setItem('do_not_show_info_alert', 1);
  })

  $(document).on('click', 'a.mark_as_group', function(e){
    e.preventDefault();
    mark_as_group($(this).data('name')); 
  });
  
  $(document).on('click', 'a.unmark_as_group', function(e){
    e.preventDefault();
    unmark_as_group($(this).data('name'));
  });

  $(document).on('click', 'a.delete_user', function(e){
    e.preventDefault();
    if ($("#div_delete_confirmation").length){
      $("#div_delete_confirmation").remove();
    }
    var div_delete_confirmation = Handlebars.compile($("#div_delete_confirmation_tmpl").html());
    $(div_delete_confirmation({name: $(this).data('name'), do_what: 'delete_user'})).modal();
  });
  
  $(document).on('click', '#btn_confirm_delete_user', function(e){
    // Кнопка в модальном окне подтверждения удаления пользователя
    console.log('#btn_delete_user pushed');
    delete_user($(this).data('name'));
  });

  $(document).on('click', "a.domain_properties", domain_properties_view);
}