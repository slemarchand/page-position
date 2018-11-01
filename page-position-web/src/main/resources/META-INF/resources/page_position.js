(function() {
	function init() {
	
		var $columnsRow = $('#_com_liferay_layout_admin_web_portlet_GroupPagesPortlet_fm .layout-columns.row');
	
		var $columns = $columnsRow.find('ul');
	
		var $items = $columns.find('li.list-group-item');
	
		$items.each(function(index, element) {
			$e = $(element);
			if($e.find('.dropdown').length === 0) {
				return;
			}
			$e.attr('draggable', true);
		});
	
		$columnsRow.on( "dragstart", "ul li.list-group-item", onDragStart);
	
		$columnsRow.on( "dragover", "ul li.list-group-item", onDragOver);
	
		$columnsRow.on( "drop", "ul li.list-group-item", onDrop);
	
		addStyleTag();
	}
	
	function addStyleTag() {
	
		var id = 'page_position_css';
		var $style = $('#' + id);
		if($style.length == 0) {
			var tag = '<link id="' + id +'"href="/o/page_position/page_position.css" rel="stylesheet" type="text/css">';
			$('head').append(tag);
		}
	}
	
	function onDragStart(event) {
	
	   var plid = getPlid(event.currentTarget);
	
	   var dataTransfer = event.originalEvent.dataTransfer;
	
	   dataTransfer.setData("plid", plid);
	}
	
	function onDragOver(event) {
	
		var $target = $(event.currentTarget);
		
		if(getPlid($target) > 0) {
			
			event.originalEvent.preventDefault();
		
			var position = getDragOverPosition(event);
		
			var cssClass = 'dragover-' + position;
		
			if(!$target.hasClass(cssClass)) {
				resetCssClasses();
				$target.addClass(cssClass);
			}
		}
	}
	
	function onDrop(event) {
	
		event.originalEvent.preventDefault();
	
		resetCssClasses();
	
		var position = getDragOverPosition(event);
	
		var plid = event.originalEvent.dataTransfer.getData("plid");
	  	
		var targetPlid = getPlid(event.currentTarget);
	
		var targetPriority = getPriority(event.currentTarget);
	
		if(plid === targetPlid ) {
			return;
		}

		var pAuth = Liferay.authToken;
	
		var data = {
			plid: plid,
			p_auth: pAuth
		};
	
		if(position === 'top') {
			data.siblingPlid = targetPlid;
			data.priority = targetPriority;
		} else if(position === 'bottom') {
			data.siblingPlid = targetPlid;
			data.priority  = targetPriority + 1;
		} else {
			data.parentPlid = targetPlid;
			data.priority = 0;
		}
	
	  	console.log(data);
	  	
	  	$.post({
	  		url: '/c/portal/page_position/edit',
	  		data: data,
	  		success: function() {
	  			console.log('success');
				Liferay.SPA.app.reloadPage();
	  		},
	  	}).fail(function(response) {
	  		console.log('fail: ' + response.getResponseHeader('X-Error-Message'));
  			resetCssClasses();
  		});	
	}
	
	function resetCssClasses() {
	
		$items = $('#_com_liferay_layout_admin_web_portlet_GroupPagesPortlet_fm .layout-columns.row ul li.list-group-item');
	
		$items.removeClass('dragover-top');
		$items.removeClass('dragover-middle');
		$items.removeClass('dragover-bottom');
	}
	
	function getPlid(element) {
		
	   var href = getHref(element);
	   
	   var plid = 0;
	
	   if(href && href.length > 0) {
		   
		   var match = /p_r_p_selPlid=(\d*)/.exec(href);
		   
		   if(match && match.length > 0) {
			   plid = match[1];
		   }
	   }
	   
	   return plid;
	}
	
	function getHref(element) {
		
	   var href = $(element)
			.find('a.dropdown-item[href*="GroupPagesPortlet_mvcRenderCommandName=%2Flayout%2Fedit_layout"]')
			.attr('href');
	
	 	console.log(href); 	
	
	   return href;
	}
	
	function getPriority(element) {
		
		return $(element).parent().find('> li').index(element);
	}
	
	function getDragOverPosition(event) {
		var height = event.currentTarget.clientHeight; 
		var ratio = 1.0 / 6.0;
		var topY = height * ratio;
		var bottomY = height - (height * ratio);
		if(event.offsetY < topY) { 
			p = 'top';
		} else if(event.offsetY > bottomY){
			p = 'bottom'; 
		} else { 
			p = 'middle';
		};
	
		return p;
	}
	
	$(function() {
		window.setTimeout(function() {
			init();
		}, 1000);
	});
})();