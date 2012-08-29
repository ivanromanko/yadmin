/*
otmes - класс для вывода информации (ошибок, сообщений и дебага)
---
использвание:
	конструктор
		вставить в .ready строку типа 
			m = new otmes (''|1,{....}) 
				- первый параметр показывает как надо реагировать на вывод отладочной информации
					если пусто, то не показываем ничего
					если не пусто, то показываем
				- второй параметр - JSON словарь для указания куда выводить ту или иную информацию, использовать
				  этот парамерт имеет смысл, если div-ы нестандартные
					errorDiv - id  div-а для ошибок,
					messagesDiv - id  div-а для сообщений
					debugDiv - id  div-а для отладки
	вызовы
		m.e(строка[,notadd]) - вывод ошибки
		m.d(строка) - вывод отладки
		m.m(строка[,notadd]) - вывод сообщения
			если есть параметр notadd, то выводиться будет только новая инфомация, а старая стираться.

		m.clear(['e'|'m'|'d']) - очистка div-а
			если нет параметров, то очистятся все три дива

		m.beforesave () - очистка строго сообщений и ошибок. используется перед попыткой записи

*/
function otmes(spec_status, spec_data){

	this.name = 'otmes object';
	this.status = '';

	if (spec_status){
		this.status = spec_status;
	}

	this.data = {
		'errorDiv':'divError',
		'messagesDiv':'divMessage',
		'debugDiv': 'divDebug'
	};





	this.__work = function (tdiv,str,notadd){
		var top = $('#' + tdiv).position().top;
		$(window).scrollTop( top );
		if (notadd){
			$('#'+tdiv).empty();
		}

		if (typeof(str) == 'object'){
			// if (str.length){
			// 	alert('array');
			// }else{
			// 	alert('dict');
			// }
			var type=(str.length?"a":"d");
			$('#'+tdiv).html($('#'+tdiv).html()+'<br>'+(type=='a'?'[':'{')+this.__subwork(str,0)+(type=='a'?']':'}')+'<br>');
		}else{
			$('#'+tdiv).html($('#'+tdiv).html()+'<br>'+str);
		}

	}

	this.__subwork = function (str,level){
		out = '';
		if (str){
			for (var k in str){
				if (typeof(str[k]) == 'object'){
					var type=(str.length?"a":"d");
					out = out + k +':'+(type=='a'?'[':'{')+'<br>'+this.__subwork(str[k],(level+1))+(type=='a'?']':'}');
				}else{
					for (var i=0;i<level;i++){
						out = out + '&nbsp;&nbsp;&nbsp;';
					}
					out = out + k+':'+str[k]+'<br>';
				}
			}
		}
		return out;
	}

	this.e = function(str,notadd){
		$('#'+this.data.errorDiv).show();
		this.__work(this.data.errorDiv,str,notadd);
	}

	this.d = function(str,notadd){
		this.__work(this.data.debugDiv,str);
	}

	this.m = function(str,notadd){
		$('#'+this.data.messagesDiv).show();
		this.__work(this.data.messagesDiv,str,notadd);
	}

	this.clear = function (list){
		var slist = {'e':this.data.errorDiv,
					'd':this.data.debugDiv,
					'm':this.data.messagesDiv};

		if (typeof(list) == 'string'){
			list = [slist[list]]
		}else if (!list){
			list = [this.data.errorDiv, this.data.messagesDiv, this.data.debugDiv];
		}

		for (var d in list){
			$('#'+list[d]).html('');
		}
	}

	this.beforesave = function(){
		$('#'+this.data.errorDiv).hide();
		$('#'+this.data.messagesDiv).hide();
		this.clear('e');
		this.clear('m');
	}

	if (spec_data){
		for (var k in spec_data){
			this.data[k] = spec_data[k]
		}
	}

	if (this.status){
		$('#'+this.data.debugDiv).show();
		$($(document.createElement('input'))
				.prop({'type':'button','id':'btnDebugClear'})
				.bind('click',{id: this.data.debugDiv},function(e){$('#'+e.data.id).html('');})
				.val('Clear Debug'))
		.insertBefore('#'+this.data.debugDiv);
	}


}

// function lfields(f1,f2,func){

// }

/***********
пока только функция, лень делать объект
используем так:
1) добавляем к полю, которое на что-то влияет, параметр linked="sync-<id-зависимого поля>"
2) в .ready вешаем через live обработку 
	Вот пример:
	$('input[linked^=sync]').live('change',{func:my_func,show:''},linked_fields);
	Параметры: 
		func - функция, которая сработает после изменения поля, если ее нет, то значение просто перенесется.
		show - если истина, то будет еще и alert
3) если нужно, то пишем функцию, которая принимает два параметра (<текущее поле>, <поле, на которое влияют>)
Подробности в примере

***********/

function linked_fields(e){
	var func = e.data.func;
	var f2id = $(this).attr('linked').replace(/^sync-/,"");

	var show = (e.data.show?e.data.show:'');
	var f1 = $(this).get(0);
	var f2 = $('#'+f2id).get(0);

	//  Готовим показ, если он нужен
    if (show){
        if (f1.id){
            f1name="c ID=\""+f1.id+"\"";
        }else if (f1.name){
            f1name="c NAME=\""+f1.id+"\"";
        }else{
            f1name = '---';
        }

        if (f2.id){
            f2name="c ID=\""+f2.id+"\"";
        }else if (f2.name){
            f2name="c NAME=\""+f2.id+"\"";
        }else{
            f2name='---';
        }
        alert('Поле '+f1name+' связано с полем '+f2name+'');
    }

    // Основная работа
    if (func){
    	func(f1,f2);
    }else{
    	$(f2).val($(f1).val()); 
	}
}
