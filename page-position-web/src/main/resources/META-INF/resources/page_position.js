(function() {
	function init() {
		
		console.log('page_position.js::init()');
	
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
	
		$items.on("dragstart", null, onDragStart);
	
		$items.on("dragover", null, onDragOver);
		
		$items.on("dragleave", null, onDragLeave);
	
		$items.on("drop", null, onDrop);
		
		var $breadcrumbItems = $('#_com_liferay_layout_admin_web_portlet_GroupPagesPortlet_fm li.breadcrumb-item');
		
		$breadcrumbItems.on("dragover", null, onDragOver);
		
		$breadcrumbItems.on("dragleave", null, onDragLeave);
		
		$breadcrumbItems.on("drop", null, onDrop);
		
		addStyleTag();
	}
	
	function addStyleTag() {
	
		var id = 'page_position_css';
		var $style = $('#' + id);
		if($style.length == 0) {
			var timestamp = /.*t=([0-9]*)/.exec($('script[src^="/o/page_position/page_position.js"]').attr('src'))[1];
			var tag = '<link id="' + id +'"href="/o/page_position/page_position.css?t=' + timestamp + '" rel="stylesheet" type="text/css">';
			$('head').append(tag);
		}
	}
	
	function onDragStart(event) {
	
	   var plid = getPlid(event.currentTarget);
	   
	   var priority = getPriority(event.currentTarget);
	   
	   var columnIndex = getColumnIndex(event.currentTarget);
	
	   var dataTransfer = event.originalEvent.dataTransfer;
	
	   dataTransfer.setData("plid", plid);
	   
	   dataTransfer.setData("priority", priority);
	   
	   dataTransfer.setData("columnIndex", columnIndex);
	   
	   window.__page_position__last_dragged_element = event.currentTarget;
	}
	
	function onDragOver(event) {
		
		if(isValidDropTarget(event.currentTarget)) {
			
			event.originalEvent.preventDefault();
		
			var position = getDragOverPosition(event);
		
			var cssClass = 'dragover-' + position;
		
			var $target = get$ItemElement(event.currentTarget);

			if(!$target.hasClass(cssClass)) {
				resetCssClasses();
				$target.addClass(cssClass);
			}
		}
	}
	
	function onDragLeave(event) {
		
		console.log('page_position.js::onDragLeave()');	
		
		resetCssClasses();
	}
	
	function onDrop(event) {
		
		console.log('page_position.js::onDrop()');
		
		event.originalEvent.preventDefault();
				
		var position = getDragOverPosition(event);
		
		var targetPlid = getPlid(event.currentTarget);
		
		var targetPriority = getPriority(event.currentTarget);
		
		var targetColumnIndex = getColumnIndex(event.currentTarget);
		
		var sourcePlid = event.originalEvent.dataTransfer.getData("plid");
		
		var sourcePriority = event.originalEvent.dataTransfer.getData("priority");
		
		var sourceColumnIndex = event.originalEvent.dataTransfer.getData("columnIndex");
	  	
		if(sourcePlid === targetPlid ) {
			return;
		}
		
		/*
		console.log(sourceColumnIndex);
		console.log(targetColumnIndex);
		console.log(sourcePriority);
		console.log(targetPriority);
		*/
		
		if((sourceColumnIndex == targetColumnIndex) && (sourcePriority < targetPriority)) {
			targetPriority -= 1;
		}

		var pAuth = Liferay.authToken;
	
		var data = {
			plid: sourcePlid,
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
	  			Liferay.SPA.app.navigate(document.location.href);
	  		},
	  	}).fail(function(response) {
	  		console.log('fail: ' + response.getResponseHeader('X-Error-Message'));
  		});
	}
	
	function isValidDropTarget(target) {
		
		var valid = false;
		
		var targetPlid = getPlid(target);
		
		if(targetPlid > 0) {
		
			var dragged = window.__page_position__last_dragged_element;
		
			var draggedPlid = getPlid(dragged);
			
			var valid = targetPlid !== draggedPlid;	
		}
		
		return valid;
	}
	
	function resetCssClasses() {
	
		$items = $(
				'#_com_liferay_layout_admin_web_portlet_GroupPagesPortlet_fm .layout-columns.row ul li.list-group-item, ' +
				'#_com_liferay_layout_admin_web_portlet_GroupPagesPortlet_fm ol.breadcrumb li.breadcrumb-item');
	
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
		
		var $e = $(element);
		
		if($e.hasClass('breadcrumb-item')) {
			var $a = $e.find('a');
			if($a.length > 0) {
				var href = $a.attr('href');
			} else if($e.parent().find('.breadcrumb-item').last()[0] === $e[0]) {
				var $lastActiveItem = $('#_com_liferay_layout_admin_web_portlet_GroupPagesPortlet_fm .layout-columns.row ul li.list-group-item.active-item').last()[0];
				return getHref($lastActiveItem);
			}
		} else {	
			var href = $e
				.find('a.dropdown-item[href*="GroupPagesPortlet_mvcRenderCommandName=%2Flayout%2Fedit_layout"]')
				.attr('href');
		}

		return href;
	}

	function getPriority(element) {
		
		return get$ItemElement(element).parent().find('> li').index(element);
	}
	
	function getColumnIndex(element) {
		var $column = get$ItemElement(element).parent();
		return $column.parent().find('> ul').index($column);
	}
	
	function get$ItemElement(element) {
		var $itemElement = $(element);
				
		return  $itemElement;
	}
	
	function getDragOverPosition(event) {
		
		if($(event.currentTarget).hasClass('breadcrumb-item')) {
			return 'middle';
		}
		
		var height = event.currentTarget.clientHeight; 
		var ratio = 1.0 / 4.0;
		var topY = height * ratio;
		var bottomY = height - (height * ratio);
		var currentY = event.pageY - $(event.currentTarget).offset().top;
		
		if(currentY < topY) { 
			p = 'top';
		} else if(currentY > bottomY){
			p = 'bottom'; 
		} else { 
			p = 'middle';
		};
	
		if(window._currentY === undefined || window._currentY !== currentY) {
			window._currentY = currentY;
			
			/*
			console.log(getPriority(event.currentTarget));
			console.log("__");
			console.log('currentY: ' + currentY);
			console.log('topY: ' + topY);
			console.log('bottomY: ' + bottomY);
			console.log('position: ' + p);
			*/
		}
		
		return p;
	}
	
	AUI().ready(function(A) {
		$(init);
	});
})();