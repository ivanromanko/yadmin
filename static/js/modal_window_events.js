function bind_modal_window_events(){

  bind_dblclick_and_edit();

  $(document).on('click', 'a.accordion-toggle', function(event){
    // Схлопывание и разворачивание аккордеона внутри модала вызывают срабатывание
    // события hidden самого модального окна. Это не даёт вешать на hidden модального окна
    // события, так как они срабатывают невовремя. Из-за этого приходится вручную олавливать
    // hide и hidden в аккордеоне и не пускать их дальше.
    event.preventDefault();
    var href = $(this),
        parent = $(this).parent().parent().parent(),
        current_parent = $(this).parent().parent(),
        bodies = parent.find('.accordion-body');
        current_body = current_parent.find('.accordion-body').filter('.in');
    
    $.each(bodies, function(){
      $(this)
      .on('hide', function(event) {
        event.stopPropagation();
      })
      .on('hidden', function(event) {
        event.stopPropagation();
      });
    })
    current_body.collapse('toggle');
    
  })

  $(document).on('keydown', '#input_add_forward', function(event){
    if (event.keyCode==13){
        event.preventDefault();
        add_forward($(this).data('from'), $("#input_add_forward").val());
    }
  })

  $(document).on('click', '#btn_add_forward', function(){
      add_forward($(this).data('from'), $("#input_add_forward").val());
  })

  $(document).on('click', "a.remove_forwarding", function(e){
    e.preventDefault();
    remove_forwards([{from: $(this).data('from'), id: $(this).data('id')}])
  });

  $(document).on('click', "a.remove_sender", function(e){
    e.preventDefault();
    remove_forwards([{from: $(this).data('from'), id: $(this).data('id')}])
  });

  $(document).on('change', "input.keep_copy", function(){
    var checked = 'no';
    if ($(this).is(':checked')){
      checked = 'yes';
    }
    edit_forward({from: $(this).data('from'), id: $(this).data('id'), to: $(this).data('to'), checked: checked})
  });

  $(document).on('click', "#btn_save_user", save_user);                  
}
