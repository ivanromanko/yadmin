var OTCLASS = function(inPar){    

  mes.d('Create object OTCLASS with id='+inPar['id']);    

  var req = ['id','data','div_id','tmpl_id'];
  
  // сложная проверка на совпадения

  this.__eq = function (row,uslovie){
    // если условие не массив, то делаем массив
    if (!uslovie.length){
      _uslovie = []; 
      _uslovie.push(uslovie);
      uslovie = _uslovie;
    }

    // mes.d('--- begin __eq ---')
    // mes.d(uslovie);
    // mes.d(row);
    // mes.d('--- end __eq ---');

    var count = uslovie.length;
    var eq_count = 0;    
    for (var i=0;i<count;i++){
      if (uslovie[i]['eq'] == row[uslovie[i]['field']]){
        eq_count++;
      }
    }

    if (eq_count == count){
      return true;
    }else{
      return false;
    }
  }

  // функции для замещения
  this.__sort = function(field){
    this.data.list.sort(function(a,b){return parseInt(a[field])-parseInt(b[field])});
  }
  this.before_render = function (){}
  this.after_render = function (){}
  this.before_sync = function (){}
  this.after_sync = function (){}
  
  // data - model
  for (var key in inPar){
    // mes.d('key='+key);
    this[key] = inPar[key];
  }

  this.place = $('#'+inPar.div_id);
  this.seq = -1;

  this.tmpl_type = this.tmpl_type || 'Handlebars';
  if (this.tmpl_type == 'Handlebars') {
    this.tmpl = Handlebars.compile($("#"+inPar.tmpl_id).html());
  } else if (this.tmpl_type == 'jquery-tmpl') {
    this.tmpl = $("#"+inPar.tmpl_id).template();
  }

  //view
  this.view = '';


  this.render = function (){
    this.before_render();
    if (this.sort){
      this.__sort(this.sort);
    }
    if (this.tmpl_type == 'Handlebars') {
      this.view = this.tmpl(this.data);
    } else if (this.tmpl_type == 'jquery-tmpl') {
      this.view = $.tmpl(this.tmpl, this.data);
    }
    $(this.place).empty();
    $(this.place).empty().append(this.view);
    this.after_render();
  };

  this.render();

  //control

  this.get = function(uslovie){
    // возвращаем строку по условию
    var ret = [];
    for (var r in this.data.list) {
      if (this.__eq(this.data.list[r],uslovie)){
        ret.push(this.data.list[r]);
      }
    }
    if (ret.length){
      return ret;
    }
    return false;
  }

  this.add = function(row){ 
    mes.beforesave();
    // если передали не массив, то делаем массив         
    if (!row.length){
      _row = []; 
      _row.push(row);
      row = _row;
    }

    // общаемся с сервером
    rrow = this.sync('add',row);
    rrow = rrow.new_rows;
    if (rrow){
      // если все нормально, то
      // заполняем данные тут
      console.log(row);
      console.log(rrow);

      for (var i=0;i<rrow.length;i++){
        this.data.list.push(rrow[i]);  
      }
      // ... рендерим
      this.render();
      _light();
      return true;
    }else{
      // сообщаем об ошибке
      mes.e('Не удалось добавить элемент');
      _light();
      return false;
    }
  }

  this.remove = function(uslovie){
    // общаемся с сервером
    var array4del = [];
    if (this.sync('remove',uslovie)){
      // если все нормально, то меняем внутренюю структуру
      for (var r in this.data.list) {
        if (this.__eq(this.data.list[r],uslovie)){
          array4del.push(r);
        }
      }
      
      for (var r in array4del.reverse()){
        this.data.list.splice(array4del[r],1);
      }
      // ... рендерим
      this.render();
      _light();
      return true;    
    }else{
      //  сообщаем об ошибке
      mes.d('Не удалось удалить');
      _light();
      return false;
    }
  }

  this.update_item = function (uslovie,field,new_val){
    var good = true;
    for (var r in this.data.list) {
      // if (this.data.list[r][uslovie.field] == uslovie.eq){

      if ( this.__eq( this.data.list[r], uslovie) ){ 
        var obj = this.data.list[r];
        $.each(field.split('.'), function(i,o){
          var new_obj = obj[o];
          if (typeof(new_obj) == 'object'){
            obj = new_obj;
          }else{
            obj[o] = new_val;
            return false;
          }
        });
        if (!this.sync('update',uslovie,this.data.list[r])){
          good = false;
        }
      }
    }

    if (good){
      for (var r in this.data.list) {
        // if (this.data.list[r][uslovie.field] == uslovie.eq){
        if ( this.__eq( this.data.list[r], uslovie) ){          
          this.data.list[r][field] = new_val;
          this.render();
          _light();
          return true;          
        }
      }
    }else{
      _light();
      return false;
    }



  }

  this.update = function(uslovie,new_row){
    // общаемся с сервером
    if (this.sync('update', uslovie, new_row)){
      // если все нормально, то 
      // меняем внутреннюю структуру
      for (var r in this.data.list) {
        // if (this.data.list[r][uslovie.field] == uslovie.eq){
        if ( this.__eq(this.data.list[r], uslovie) ){          
          for (var key in new_row){
            this.data.list[r][key] = new_row[key];
          }
        }
      }
      this.render();
      return true; 
    }else{
      mes.e('Не удалось обновить запись');
      return false;
    }
  }

  this.sync = function(type,par1,par2){
    this.before_sync();
    mes.beforesave();
    mes.d('--- call sync for '+this.id+' ---');


    // _dark();
    // вызов (async=false!!!!) getJSON, 
    // если он вернет Ok, то возвращаем true, если это add, то объект с заполненными id полями
    // иначе false
    var par = {dts:dts(),'obj':this.id,'do_what':'admindb','turn':type};
    if (type == 'add'){
      par['new_rows'] = par1;
      // par['test_hash'] = {'field':'id','eq':2};
    }else if(type == 'remove'){
      par['uslovie'] = par1;
    }else if(type == 'update'){
      par['uslovie'] = par1;
      par['new_rows'] = par2;            
    }

    if (this.debug == 1){
      mes.d('--- begin debug ---');
      var ii = -1;
      for (var r in par.new_rows){
        par.new_rows[r].id = ii;
        ii--;
      }
      mes.d(par);
      mes.d('--- end debug ---');
      this.after_sync();
      return par;
    }else if (this.debug == 2){
      return false;
    }


    $.ajaxSetup({async:false});
    var a_ret = true;
    $.getJSON(script_name,par,function(data){
      if (data.status == 'Ok'){  
        a_ret = data;
      }else{
        mes.e(data.error);
        a_ret = false;
      }
    }).error(function(jqXHR, textStatus, errorThrown){
      _light();
      a_ret = false;
    });
    $.ajaxSetup({async:true});

    this.after_sync();
    mes.d('ret='+a_ret);
    return a_ret;

  }  

}; // OTCLASS
