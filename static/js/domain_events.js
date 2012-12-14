function bind_domain_page_events(){
    $(document).on('click', 'a.remove_domain_admin', function(){
        remove_domain_admin($(this).data('name'), localStorage.getItem('current_domain'));
    });

    $(document).on('click', '#btn_add_domain_admin', function(){
        add_domain_admin($("#new_admin_name").val(), localStorage.getItem('current_domain'));
    })
    $(document).on('keydown', '#new_admin_name', function(){
      if (event.keyCode==13){
        event.preventDefault();
        $('#btn_add_domain_admin').click();
      } else if (event.keyCode==27) {
        $('#new_admin_name').val('');
      }
    })

    $(document).on('click', '#btn_set_default_domain_email', function(){
      set_default_domain_email($("#new_default_domain_email").val(), localStorage.getItem('current_domain'));
    })
    $(document).on('keydown', '#new_default_domain_email', function(){
      if (event.keyCode==13){
        event.preventDefault();
        $('#btn_set_default_domain_email').click();
      } else if (event.keyCode==27) {
        $('#new_default_domain_email').val('');
      }
    })

    $(document).on('click', '#btn_set_new_domain_logo', function(){
      $('#new_domain_logo_domain_field').val(localStorage.getItem('current_domain'));
      var data1 = new FormData($('#new_domain_logo_form')[0]);
      // $.each($('#logo_file')[0].files, function(i, file) {
          // data1.append('file-'+i, file);
      // });
      $.ajax({
        url: '/md',  
        type: 'POST',
        data: data1,
        cache: false,
        contentType: false,
        processData: false,
        dataType: 'json'
      }).done(function(data){
          if (data.success) {
            $("#btn_set_new_domain_logo").addClass('btn-success');
            setTimeout(function () {
                $("#btn_set_new_domain_logo").removeClass('btn-success');
            }, 3000);
            $("#new_domain_logo").val('');
            $("#logo_file").val('');

          } else{
            $("#btn_set_new_domain_logo").toggleClass('btn-danger');
            setTimeout(function () {
                $("#btn_set_new_domain_logo").removeClass('btn-danger');
            }, 3000);
            m.e(data.msg);
            m.e(data.err);
          }
      });
    })
    $(document).on('click', '#btn_select_new_domain_logo', function(){
      $("#logo_file").click();
    })
    $(document).on('change', '#logo_file', function(){
      $("#new_domain_logo").val($("#logo_file").val().split('\\').pop());
    })
    $(document).on('click', '#btn_delete_domain_logo', function(e){
      e.preventDefault();
      if ($("#div_delete_confirmation").length){
        $("#div_delete_confirmation").remove();
      }
      var div_delete_confirmation = Handlebars.compile($("#div_delete_confirmation_tmpl").html());
      $(div_delete_confirmation({do_what: 'delete_domain_logo'})).modal();
    });
    $(document).on('click', '#btn_confirm_delete_domain_logo', function(){
      delete_domain_logo(localStorage.getItem('current_domain'));
    });

    $(document).on('click', '#btn_delete_domain', function(){
      if ($("#div_delete_confirmation").length){
        $("#div_delete_confirmation").remove();
      }
      var div_delete_confirmation = Handlebars.compile($("#div_delete_confirmation_tmpl").html());
      $(div_delete_confirmation({do_what: 'delete_domain'})).modal();
    })
    $(document).on('click', '#btn_confirm_delete_domain', function(){
      delete_domain(localStorage.getItem('current_domain'));
    });
}
