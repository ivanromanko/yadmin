function bind_dblclick_and_edit(){
  $(document).on('dblclick', '#table_users_list td', function(){
    $(document).off('dblclick', '#table_users_list td');
    $(document).off('dblclick', '#table_groups_list td');
    $(document).off('click', 'a.edit_user')
    view_user($(this).data('name'));
  })
  $(document).on('dblclick', '#table_groups_list td', function(){
    $(document).off('dblclick', '#table_groups_list td');
    $(document).off('dblclick', '#table_users_list td');
    $(document).off('click', 'a.edit_user');
    view_user($(this).data('name'), group=1);
  })
  $(document).on('click', 'a.edit_user', function(e){
    e.preventDefault();
    $(document).off('click', 'a.edit_user');
    $(document).off('dblclick', '#table_users_list td');
    $(document).off('dblclick', '#table_groups_list td');
    view_user($(this).data('name')); 
  });
}

function draw_users_list(){
  $('#shared_space').html($('#view_users_base_tmpl').html());
  console.log('draw_users_list');
  // var first_button = $('div.btn-toolbar').find('div.btn-group').eq(0).find('button').eq(0);
  var $this = $(this);
  $('div.btn-group button.btn-primary').removeClass('btn-primary');
  $(this).addClass('btn-primary').next().addClass('btn-primary');
  localStorage.setItem('current_domain', $this.data('domain'));
  draw_table(JSON.parse(localStorage.getItem('yadmin_users_'+$this.data('domain'))), 'users_tmpl', 'users_table');
  draw_table(JSON.parse(localStorage.getItem('yadmin_groups_'+localStorage.getItem('current_domain'))), 'groups_tmpl', 'groups_table');
}

function draw_table(users, tmpl, target){
  // Обновляем таблицу
  var users_template = Handlebars.compile($('#'+tmpl).html());
  $("#"+target).empty().append(users_template({items: users}));
}

function mark_as_group(name){
  // Отмечает пользователя в таблице как группу
  var groups = JSON.parse(localStorage.getItem('yadmin_groups_'+localStorage.getItem('current_domain'))),
      new_member = name;
  if (!groups){
      groups = [];
  }
  if (groups.indexOf(new_member) == -1){
      groups.push(new_member);    
  }
  groups.sort();
  localStorage.setItem('yadmin_groups_'+localStorage.getItem('current_domain'), JSON.stringify(groups));
  draw_table(JSON.parse(localStorage.getItem('yadmin_groups_'+localStorage.getItem('current_domain'))), 'groups_tmpl', 'groups_table');
}

function unmark_as_group(name){
  // Отмечает пользователя в таблице как группу
  var groups = JSON.parse(localStorage.getItem('yadmin_groups_'+localStorage.getItem('current_domain'))),
      del_member = name;
  
  if (groups.indexOf(del_member) != -1){
      groups.pop(del_member);    
  }
  localStorage.setItem('yadmin_groups_'+localStorage.getItem('current_domain'), JSON.stringify(groups));
  draw_table(JSON.parse(localStorage.getItem('yadmin_groups_'+localStorage.getItem('current_domain'))), 'groups_tmpl', 'groups_table');
}

function filter_users(){
  var search_str = $("#filter_str").val(),
      users = JSON.parse(localStorage.getItem('yadmin_users_'+localStorage.getItem('current_domain')));
      // tmp = convert_users_to_list(users);

  var res = $.grep(users, function(elem){
      return elem.indexOf(search_str)+1;
  })
    draw_table(res, 'users_tmpl', 'users_table');
}

function convert_users_to_list(users){
  var tmp=[];
  for (var i in users){
      tmp.push(users[i]['name']);
  }
  return tmp;
}

function refresh_users_list(){
  return $.getJSON('/mu', {do_what: 'refresh_users_list'}).done(function(data){
      if (data.success){
          $.each(data.items, function(key, val){
              localStorage.setItem('yadmin_users_'+key, JSON.stringify(convert_users_to_list(val)));    
          })
          console.log('Список пользователей обновлён');
      } 
  });
}