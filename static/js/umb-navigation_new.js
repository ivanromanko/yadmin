(function($) {
     function Navigation() {
	 this.startRec = 0;
	 this.pageNo = 1;
	 this.pageText = 'Page';
	 this.items = 'items';
	 this.func = 'load_table';
	 this.delta = 20;
     }

     $.extend(
	 Navigation.prototype, {
	     _setOptions: function(options) {
		 for (var i in options) {
		     this[i] = options[i];
		 }
	     },

	     _setControls: function(options) {
	     		console.log($('.btn-pageNo').html());
			 $('.btn-pageNo').html(' '+this.pageText+' '+this.pageNo);
			 // $('.btn-nav-First, .btn-nav-Prev').button("option", "disabled", this.startRec == 0 ? true : false);
			 $('.btn-nav-Prev').button("option", "disabled", this.startRec == 0 ? true : false);
			 $('.btn-nav-Next').button("option", "disabled", this.delta >= options['dataLength'] ? true : false);
	     },

	     _createButton: function(id, value, direction, f, disabled) {
		 return $('<button></button>')
		     .html(value)
		     .button({"disabled": disabled}).css("font-size", "12px")
		     .addClass('btn-nav-'+id)
		     .addClass('btn')
		     .click(
			 function() {
			     var tmpStartRec = (direction == 0 ? 0 : $.navigation.startRec+$.navigation.delta*direction);
			     $.when(f({startRec: tmpStartRec, delta: $.navigation.delta}))
				 .done(
				     function(data) {
					 $.navigation.startRec = (direction == 0 ? 0 : $.navigation.startRec+$.navigation.delta*direction);
					 $.navigation.pageNo = (direction == 0 || $.navigation.startRec == 0 ? 1 : $.navigation.pageNo+direction);
					 console.log('direction='+direction+', startRec='+$.navigation.startRec+', pageNo='+$.navigation.pageNo);
					 console.log(data.items);
					 $.navigation._setControls({dataLength: data[$.navigation.items].length});
				     }
				 )
				 .fail(
				     function() {
					 alert('What\'s goin\' on, eh? I\'m disappointed! Call the mastah!');
				     }
				 )
			 }
		     );
	     },

	     _createButtonFirst: function() {
		 // return this._createButton('First', ' << ', 0, this['func'], true);
		 // return this._createButton('First', ' << ', 0, this['func'], false);
		 return this._createButton('First', ' <i class="icon-chevron-left"></i><i class="icon-chevron-left"></i> ', 0, this['func'], false);
	     },
	     _createButtonPrev: function() {
		 // return this._createButton('Prev', ' < ', -1, this['func'], true);
		 return this._createButton('Prev', ' <i class="icon-chevron-left"></i> ', -1, this['func'], true);
	     },
	     _createButtonNext: function() {
		 // return this._createButton('Next', ' > ', 1, this['func'], false);
		 return this._createButton('Next', ' <i class="icon-chevron-right"></i> ', 1, this['func'], false);
	     },
	     _createPageSpan: function() {
	     var commonSpan = $('<span></span>')
		 .attr("id", "spnPageCommon")
		 // .addClass('label')
		 // .addClass('btn-pageNo')
		 // .html(" "+$.navigation.pageText+' '+this.pageNo+" ");
		 $('<span></span>').attr("id", "spnPageText").appendTo(commonSpan).html("&nbsp;&nbsp;&nbsp;&nbsp;");
		 $('<span></span>').addClass('btn-pageNo help-inline').appendTo(commonSpan).html(" "+$.navigation.pageText+' '+this.pageNo+" ");
		 // var commonSpan = $('<span></span>').attr("id", "spnPageCommon");
		 // $('<span></span>').attr("id", "spnPageText").appendTo(commonSpan).html("&nbsp;&nbsp;&nbsp;&nbsp;");
		 // $('<span></span>')
		 // 	.attr("id", 'btnPageNo')
		 // 	.addClass('btn-pageNo')
		 // $('<input type=button>').attr("id", "btnPageNo").button({"disabled": true}).addClass("btn-pageNo").css("font-size", "12px").val(" "+$.navigation.pageText+this.pageNo+" ").appendTo(commonSpan);
		 return commonSpan;
	     },
	     makeControls: function(elem) {
		 this._createButtonFirst().appendTo(elem);
		 this._createButtonPrev().appendTo(elem);
		 this._createButtonNext().appendTo(elem);
		 this._createPageSpan().appendTo(elem);
	     },
	     goHome: function() {
		 $('.btn-nav-First').click();
	     }
	 }
     );
     
     $.fn.umb_navigation = function(options) {
	 if (!$.navigation.initialized) {
	     $.navigation._setOptions(options);
	     $.navigation.makeControls(this);
	     $('.btn-nav-First').click();
	     $.navigation.initialized = true;
	 }

	 return $.navigation;
     }

     $.navigation = new Navigation();
     $.navigation.initialized = false;
     $.navigation.rnd = new Date().getTime();

})(jQuery);
