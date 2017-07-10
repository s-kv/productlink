a_tableDnD = {
	tables: {},

	table0: 0,
	table0_tr0: 0,
	table0_tr0_index: false,
	opacity: 0,

	table1: 0,
	
	offsetX: 0, offsetY: 0, // за какое место ячейки мы зацепились
	
	trs: 0,
	
	drop: function()
	{
		$(window).off('mouseup.a_tableDnD');
		$(window).off('mousemove.a_tableDnD');
		$(window).off('mousedown.a_tableDnD');
		a_tableDnD.table0_tr0.css('opacity', a_tableDnD.opacity);
		a_tableDnD.table1.remove(); a_tableDnD.table1 = 0;
		// вызываем callback функцию
		if(a_tableDnD.tables[a_tableDnD.table0].drop_callback){
			var f = a_tableDnD.tables[a_tableDnD.table0].drop_callback;
			f();
		}
		a_tableDnD.table0_tr0_index = false;
		a_tableDnD.trs = a_tableDnD.offsetX = a_tableDnD.offsetY = a_tableDnD.opacity = a_tableDnD.table0 = a_tableDnD.table0_tr0 = 0;
	},
	
	drag: function(o, event)
	{
		if(event.button == 2) return;
		a_tableDnD.table0_tr0 = o.nodeName == 'TR' ? $(o) : $(o).closest('tr');
		a_tableDnD.table0 = a_tableDnD.table0_tr0.closest('table');
		if($('tr.' + a_tableDnD.tables[a_tableDnD.table0].dragable_tr_class, a_tableDnD.table0).length < 2) return;	// если нечего сортировать, то уходим
		a_tableDnD.table1 = a_tableDnD.table0.clone();
		var offset = a_tableDnD.table0_tr0.offset();
		a_tableDnD.offsetX = event.pageX - offset.left;
		a_tableDnD.offsetY = event.pageY - offset.top;
		// оставляем только одну строчку
		a_tableDnD.table0_tr0_index = a_tableDnD.table0_tr0[0].rowIndex;
		$('tr:eq(' + a_tableDnD.table0_tr0_index + ')', a_tableDnD.table1).addClass('a_tableDnD-dragging');
		$('tr:not(.a_tableDnD-dragging)', a_tableDnD.table1).remove();
		// показываем дубль на странице
		a_tableDnD.table1.css({'position': 'absolute', 'opacity': '0.5', 'z-index': '2000'});
		$('html').append(a_tableDnD.table1);
		a_tableDnD.table1.width(a_tableDnD.table0.width());
		a_tableDnD.table1.css({'left': (event.pageX - a_tableDnD.offsetX) + 'px', 'top': (event.pageY - a_tableDnD.offsetY) + 'px'});
		// прячем исходную строку
		a_tableDnD.opacity = a_tableDnD.table0_tr0.css('opacity');
		a_tableDnD.table0_tr0.css('opacity', '0');
		// запрещаем выделять текст при dragging'e
		// !!! возможно, это не понадобится, когда мышь будет всегда над перемещающейся строкой
//		$('body').css({'-webkit-user-select': 'none', '-moz-user-select': 'none', '-ms-user-select': 'none'});

		// устанавливаем завершение
		$(window).on('mouseup.a_tableDnD', a_tableDnD.drop);
		$(window).on('mousedown.a_tableDnD', function(event){
			if(event.button == 2)
				a_tableDnD.drop();
		});
		
		// обрабатываем перемещение
		$(window).on('mousemove.a_tableDnD', function(event){
			a_tableDnD.table1.css({'left': (event.pageX - a_tableDnD.offsetX) + 'px', 'top': (event.pageY - a_tableDnD.offsetY) + 'px'});
			var tr_index = a_tableDnD.where_we_on(event);
			// наехали?
			if(tr_index != -1){
				// на нижнюю
				if(tr_index > a_tableDnD.table0_tr0_index){
					// вставляем после
					$('tr:eq(' + tr_index + ')', a_tableDnD.table0).after(a_tableDnD.table0_tr0);
				}else{
					// вставляем до
					$('tr:eq(' + tr_index + ')', a_tableDnD.table0).before(a_tableDnD.table0_tr0);
				}
				a_tableDnD.table0_tr0_index = tr_index; a_tableDnD.fill_trs();
			}
		});
	},

	where_we_on: function(event)
	{
		var x = event.pageX; var y = event.pageY;
		if(a_tableDnD.trs === 0) a_tableDnD.fill_trs();
		if(a_tableDnD.trs === 0) return -1;
		if(a_tableDnD.trs.length == 0) return -1;
		if(x < a_tableDnD.trs[0].x0) return -1;
		if(x > a_tableDnD.trs[0].x1) return -1;
		if(y < a_tableDnD.trs[0].y0) return -1;
		if(y > a_tableDnD.trs[a_tableDnD.trs.length - 1].y1) return -1;
		var i;
		// перебираем, начиная с нижнего
		for(i = a_tableDnD.trs.length - 1; y < a_tableDnD.trs[i].y0; i--);
		return y <= a_tableDnD.trs[i].y1 ? a_tableDnD.trs[i].index : -1;
	},

	fill_trs: function()
	{
		if(a_tableDnD.table0 == 0) return;
		var tr_class = a_tableDnD.tables[a_tableDnD.table0].dragable_tr_class;
		a_tableDnD.trs = [];
		var i = 0;
		$('tr', a_tableDnD.table0).each(function(){
			if(i != a_tableDnD.table0_tr0_index && $(this).hasClass(tr_class)){
				var that = $(this);
				var offset = that.offset();
				var w = that.outerWidth(true);
				var h = that.outerHeight(true);
				a_tableDnD.trs[a_tableDnD.trs.length] = {
					x0: offset.left,
					y0: offset.top,
					x1: offset.left + w - 1,
					y1: offset.top + h - 1,
					index: i
				}
			}
			i++;
		});
	},

	add: function(table, dragable_tr_class, catch_spot_selector, drop_callback)
	{
		a_tableDnD.tables[table] = {drop_callback: drop_callback, dragable_tr_class: dragable_tr_class};
		$(table).on('mousedown.a_tableDnD', '.' + dragable_tr_class + ' ' + catch_spot_selector, function(event){
			a_tableDnD.drag(this, event);
		});
	},

	remove: function(table)
	{
		$(table).off('mousedown.a_tableDnD');
		delete(a_tableDnD.tables[table]);
	}
};

// !!! убрать opacity, если его не было